import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMusicStore, TrackObject } from '../store/useMusicStore';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';
import { fallbackAlbums, fallbackTracks } from '../lib/fallbackData';
import axiosInstance from '../lib/axios';
import { Play, Heart, ChevronLeft, Disc, ExternalLink } from 'lucide-react';

const generateMockAlbumTracks = (albumId: string, albumName: string, artists: any[], albumImages: any[]) => {
  const mockTrackNames = [
    'Intro',
    'Nocturnal Vibe',
    'Synth Wave Rider',
    'Neon Horizon',
    'Midnight Outro'
  ];
  return mockTrackNames.map((name, idx) => ({
    id: `${albumId}-mock-${idx}`,
    name: name,
    artists: artists || [{ name: 'Unknown Artist' }],
    album: {
      name: albumName,
      images: albumImages || []
    },
    duration_ms: 150000 + idx * 25000,
    uri: `spotify:track:${albumId}mock${idx}`,
    preview_url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(idx % 15) + 1}.mp3`
  }));
};

export default function AlbumDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { playTrack } = useSpotifyPlayer();
  const { likedTrackIds, addLikedTrackId, removeLikedTrackId } = useMusicStore();

  const [album, setAlbum] = useState<any>(null);
  const [tracks, setTracks] = useState<TrackObject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlbumData() {
      if (!id) return;
      setLoading(true);

      let resolvedAlbumName = '';
      let resolvedAlbumImages: any[] = [];
      let resolvedArtists: any[] = [];
      let resolvedReleaseDate = '';
      let resolvedAlbumId = id;

      const stateAlbum = location.state?.album;
      const localAlbum = fallbackAlbums.find(a => 
        a.id === id || 
        (stateAlbum && a.name.toLowerCase() === stateAlbum.name.toLowerCase())
      );

      if (localAlbum) {
        resolvedAlbumName = localAlbum.name;
        resolvedAlbumImages = localAlbum.images || [];
        resolvedArtists = localAlbum.artists || [];
        resolvedAlbumId = localAlbum.id;
      } else if (stateAlbum) {
        resolvedAlbumName = stateAlbum.name;
        resolvedAlbumImages = stateAlbum.images || [];
        resolvedArtists = stateAlbum.artists || [];
        resolvedReleaseDate = stateAlbum.release_date || '';
        resolvedAlbumId = stateAlbum.id;
      }

      try {
        // Try fetching real album details from Spotify API
        try {
          const albumRes = await axiosInstance.get(`/api/spotify/albums/${id}`);
          setAlbum(albumRes.data);
          resolvedAlbumName = albumRes.data.name;
          resolvedAlbumImages = albumRes.data.images || [];
          resolvedArtists = albumRes.data.artists || [];
          resolvedReleaseDate = albumRes.data.release_date || '';

          const albumTracks = albumRes.data.tracks?.items || [];
          const formattedTracks = albumTracks.map((t: any) => ({
            id: t.id,
            name: t.name,
            artists: t.artists || albumRes.data.artists,
            album: {
              name: albumRes.data.name,
              images: albumRes.data.images,
            },
            duration_ms: t.duration_ms,
            uri: t.uri,
            preview_url: t.preview_url,
          }));

          if (formattedTracks.length > 0) {
            setTracks(formattedTracks);
            return; // Successful fetch
          }
        } catch (albumErr) {
          console.warn('[AlbumDetail] Failed to fetch album via Spotify API (403 Forbidden). Using state/local metadata...', albumErr);
          if (resolvedAlbumName) {
            setAlbum({
              id: resolvedAlbumId,
              name: resolvedAlbumName,
              artists: resolvedArtists.length > 0 ? resolvedArtists : [{ name: 'Unknown Artist' }],
              images: resolvedAlbumImages,
              release_date: resolvedReleaseDate
            });
          } else {
            setAlbum({
              id: 'unknown',
              name: 'Unknown Album',
              artists: [{ name: 'Unknown Artist' }],
              images: []
            });
          }
        }

        // Try Spotify Search fallback by album name
        if (resolvedAlbumName && resolvedAlbumName !== 'Unknown Album') {
          try {
            const artistQuery = resolvedArtists.length > 0 ? ` artist:"${resolvedArtists[0].name}"` : '';
            const searchRes = await axiosInstance.get('/api/spotify/search', {
              params: { q: `album:"${resolvedAlbumName}"${artistQuery}`, type: 'track', limit: 20 }
            });
            const tracksData = searchRes.data.tracks?.items || [];
            
            // Filter search results to ensure they belong to this album name
            const albumTracksFiltered = tracksData.filter((t: any) => 
              t.album?.name?.toLowerCase() === resolvedAlbumName.toLowerCase()
            );

            // If filtered is empty, use all search results
            const finalTracks = albumTracksFiltered.length > 0 ? albumTracksFiltered : tracksData;

            const formattedSearchTracks = finalTracks.map((t: any) => ({
              id: t.id,
              name: t.name,
              artists: t.artists,
              album: {
                name: t.album?.name || resolvedAlbumName,
                images: t.album?.images || resolvedAlbumImages,
              },
              duration_ms: t.duration_ms,
              uri: t.uri,
              preview_url: t.preview_url,
            }));

            if (formattedSearchTracks.length > 0) {
              setTracks(formattedSearchTracks);
              return;
            }
          } catch (searchErr) {
            console.warn('[AlbumDetail] Search fallback for album tracks failed. Using static database...', searchErr);
          }
        }

        // Final local/mock database fallback
        if (resolvedAlbumName && resolvedAlbumName !== 'Unknown Album') {
          const localTracks = fallbackTracks.filter(t =>
            t.album.name.toLowerCase() === resolvedAlbumName.toLowerCase()
          );
          
          if (localTracks.length === 0) {
            setTracks(generateMockAlbumTracks(resolvedAlbumId, resolvedAlbumName, resolvedArtists, resolvedAlbumImages));
          } else {
            setTracks(localTracks);
          }
        } else {
          setTracks(generateMockAlbumTracks('unknown', 'Unknown Album', [{ name: 'Unknown Artist' }], []));
        }

      } catch (err) {
        console.error('[AlbumDetail] Critical error in loadAlbumData:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAlbumData();
  }, [id, location.state]);

  const handleLikeToggle = async (e: React.MouseEvent, track: TrackObject) => {
    e.stopPropagation();
    const trackId = track.id;
    const wasLiked = likedTrackIds.includes(trackId);

    if (wasLiked) {
      removeLikedTrackId(trackId);
    } else {
      addLikedTrackId(trackId);
    }

    try {
      const response = await axiosInstance.post('/api/favorites/toggle', {
        spotifyTrackId: trackId,
        trackName: track.name,
        artistName: track.artists.map(a => a.name).join(', '),
        albumCoverUrl: track.album.images[0]?.url || '',
      });

      if (response.data.liked) {
        addLikedTrackId(trackId);
      } else {
        removeLikedTrackId(trackId);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      // Rollback
      if (wasLiked) {
        addLikedTrackId(trackId);
      } else {
        removeLikedTrackId(trackId);
      }
    }
  };

  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-20 bg-paper-2 rounded" />
        <div className="h-48 bg-paper-2 rounded-2xl w-full" />
        <div className="space-y-3 pt-6">
          <div className="h-10 bg-paper-2 rounded w-full" />
          <div className="h-10 bg-paper-2 rounded w-full" />
          <div className="h-10 bg-paper-2 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-neutral text-sm">Album not found.</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-paper-3 text-ink text-[13px] rounded-lg">
          Go Back
        </button>
      </div>
    );
  }

  const albumImage = album.images?.[0]?.url;
  const artistName = album.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist';

  return (
    <div className="space-y-6 pb-12 select-none animate-in fade-in duration-300">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-neutral hover:text-ink text-[13px] transition-colors cursor-pointer group"
      >
        <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
        <span>Back to Search</span>
      </button>

      {/* Album Header Header */}
      <div className="relative overflow-hidden rounded-2xl border border-rule/50 bg-gradient-to-r from-paper-2 to-paper-3/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-xl overflow-hidden border border-rule shadow-lg shrink-0">
          {albumImage ? (
            <img src={albumImage} alt={album.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-paper-3 flex items-center justify-center text-neutral">
              <Disc size={40} />
            </div>
          )}
        </div>
        
        <div className="text-center sm:text-left min-w-0 space-y-2.5">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/10">
            Album
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink leading-tight tracking-tight">
            {album.name}
          </h1>
          <p className="text-[13px] text-neutral">
            By <span className="font-semibold text-ink">{artistName}</span>
          </p>
          {album.release_date && (
            <p className="text-[11px] text-neutral/70 font-mono">
              Released: {album.release_date}
            </p>
          )}
        </div>

        {/* Global Play Button inside header */}
        {tracks.length > 0 && (
          <button
            onClick={() => playTrack(tracks[0])}
            className="sm:ml-auto w-12 h-12 rounded-full bg-accent text-paper flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer hover:bg-accent-light"
            title="Play Album"
          >
            <Play size={22} fill="currentColor" className="ml-0.5" />
          </button>
        )}
      </div>

      {/* Track List Section */}
      <div className="space-y-4">
        <h2 className="font-display font-semibold text-lg text-ink">Tracks</h2>

        {tracks.length > 0 ? (
          <div className="border border-rule/30 rounded-lg overflow-hidden bg-paper-2/15">
            {/* Header row */}
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-5 py-2.5 border-b border-rule/30 text-[10.5px] font-mono text-neutral uppercase">
              <div className="w-8 text-center">#</div>
              <div>Title</div>
              <div className="pr-4">Actions</div>
            </div>

            {/* List rows */}
            <div className="divide-y divide-rule/20">
              {tracks.map((track, idx) => {
                const liked = likedTrackIds.includes(track.id);
                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className="grid grid-cols-[auto_1fr_auto] gap-4 px-5 py-3 items-center text-[13px] hover:bg-paper-3/50 group cursor-pointer transition-colors"
                  >
                    {/* Play index */}
                    <div className="w-8 flex items-center justify-center font-mono text-[11px] text-neutral">
                      <span className="group-hover:hidden">{idx + 1}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(track);
                        }}
                        className="hidden group-hover:block text-accent hover:scale-110 transition-transform cursor-pointer"
                        title="Play Song"
                      >
                        <Play size={12} fill="currentColor" />
                      </button>
                    </div>

                    {/* Track Info */}
                    <div className="min-w-0">
                      <h4 className="font-semibold text-ink truncate group-hover:text-accent transition-colors">
                        {track.name}
                      </h4>
                      <p className="text-[11px] text-neutral truncate mt-0.5">
                        {track.artists.map(a => a.name).join(', ')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pr-2 font-mono text-[11.5px] text-neutral">
                      <button
                        onClick={(e) => handleLikeToggle(e, track)}
                        className={`p-1.5 transition-colors cursor-pointer rounded-full hover:bg-paper-3 ${
                          liked ? 'text-accent' : 'text-neutral hover:text-ink opacity-0 group-hover:opacity-100'
                        }`}
                        title={liked ? 'Unlike' : 'Like'}
                      >
                        <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                      </button>
                      
                      <a
                        href={`https://open.spotify.com/track/${track.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-neutral hover:text-ink transition-colors rounded-full hover:bg-paper-3 opacity-0 group-hover:opacity-100"
                        title="Open on Spotify"
                      >
                        <ExternalLink size={14} />
                      </a>
                      
                      <span>{formatDuration(track.duration_ms)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-[12.5px] text-neutral italic py-8 border border-dashed border-rule/50 rounded-xl text-center">
            No tracks found for this album.
          </p>
        )}
      </div>
    </div>
  );
}
