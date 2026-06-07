import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMusicStore, TrackObject } from '../store/useMusicStore';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';
import { fallbackArtists, fallbackTracks } from '../lib/fallbackData';
import axiosInstance from '../lib/axios';
import { Play, Heart, ChevronLeft, Music, Users, ExternalLink } from 'lucide-react';

const generateMockTracks = (artistId: string, artistName: string, artistImages: any[]) => {
  const mockTrackNames = [
    'Midnight Vibe',
    'Neon Dreams',
    'Nocturnal Session',
    'Dark Horizon',
    'Retro Code'
  ];
  return mockTrackNames.map((name, idx) => ({
    id: `${artistId}-mock-${idx}`,
    name: name,
    artists: [{ name: artistName }],
    album: {
      name: `${artistName} Essentials`,
      images: artistImages || []
    },
    duration_ms: 180000 + idx * 30000,
    uri: `spotify:track:${artistId}mock${idx}`,
    preview_url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(idx % 15) + 1}.mp3`
  }));
};

export default function ArtistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { playTrack } = useSpotifyPlayer();
  const { likedTrackIds, addLikedTrackId, removeLikedTrackId } = useMusicStore();

  const [artist, setArtist] = useState<any>(null);
  const [tracks, setTracks] = useState<TrackObject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArtistData() {
      if (!id) return;
      setLoading(true);

      let resolvedArtistName = '';
      let resolvedArtistImages: any[] = [];
      let resolvedArtistGenres: string[] = [];
      let resolvedArtistId = id;

      // First, extract profile info from state or fallback catalog in case the API fails
      const stateArtist = location.state?.artist;
      const localArtist = fallbackArtists.find(a => 
        a.id === id || 
        (stateArtist && a.name.toLowerCase() === stateArtist.name.toLowerCase())
      );

      if (localArtist) {
        resolvedArtistName = localArtist.name;
        resolvedArtistImages = localArtist.images || [];
        resolvedArtistGenres = localArtist.genres || [];
        resolvedArtistId = localArtist.id;
      } else if (stateArtist) {
        resolvedArtistName = stateArtist.name;
        resolvedArtistImages = stateArtist.images || [];
        resolvedArtistGenres = stateArtist.genres || [];
        resolvedArtistId = stateArtist.id;
      }

      try {
        // Try fetching real artist profile from Spotify API
        try {
          const artistRes = await axiosInstance.get(`/api/spotify/artists/${id}`);
          setArtist(artistRes.data);
          resolvedArtistName = artistRes.data.name;
          resolvedArtistImages = artistRes.data.images || [];
          resolvedArtistGenres = artistRes.data.genres || [];
        } catch (profileErr) {
          console.warn('[ArtistDetail] Failed to fetch artist profile, using state/local metadata...', profileErr);
          if (resolvedArtistName) {
            setArtist({
              id: resolvedArtistId,
              name: resolvedArtistName,
              genres: resolvedArtistGenres.length > 0 ? resolvedArtistGenres : ['Nocturnal Vibes'],
              images: resolvedArtistImages
            });
          } else {
            setArtist({
              id: 'unknown',
              name: 'Unknown Artist',
              genres: ['Nocturnal Vibes'],
              images: []
            });
          }
        }

        // Try fetching top tracks from Spotify API
        try {
          const tracksRes = await axiosInstance.get(`/api/spotify/artists/${id}/top-tracks?market=US`);
          const formattedTracks = (tracksRes.data.tracks || []).map((t: any) => ({
            id: t.id,
            name: t.name,
            artists: t.artists,
            album: {
              name: t.album?.name || '',
              images: t.album?.images || [],
            },
            duration_ms: t.duration_ms,
            uri: t.uri,
            preview_url: t.preview_url,
          }));

          if (formattedTracks.length > 0) {
            setTracks(formattedTracks);
            return; // Successful fetch
          }
        } catch (tracksErr) {
          console.warn('[ArtistDetail] Top tracks API failed (403 Forbidden). Trying Search fallback...', tracksErr);
        }

        // If top-tracks API failed, try Spotify Search fallback by artist name
        if (resolvedArtistName && resolvedArtistName !== 'Unknown Artist') {
          try {
            const searchRes = await axiosInstance.get('/api/spotify/search', {
              params: { q: `artist:"${resolvedArtistName}"`, type: 'track', limit: 15 }
            });
            const tracksData = searchRes.data.tracks?.items || [];
            
            // Format and filter search tracks
            const formattedSearchTracks = tracksData.map((t: any) => ({
              id: t.id,
              name: t.name,
              artists: t.artists,
              album: {
                name: t.album?.name || '',
                images: t.album?.images || [],
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
            console.warn('[ArtistDetail] Search fallback for tracks failed. Using static database...', searchErr);
          }
        }

        // Final local/mock catalog fallback layer
        if (resolvedArtistName && resolvedArtistName !== 'Unknown Artist') {
          const localTracks = fallbackTracks.filter(t =>
            t.artists.some(a => a.name.toLowerCase().includes(resolvedArtistName.toLowerCase()) || resolvedArtistName.toLowerCase().includes(a.name.toLowerCase()))
          );
          if (localTracks.length === 0) {
            setTracks(generateMockTracks(resolvedArtistId, resolvedArtistName, resolvedArtistImages));
          } else {
            setTracks(localTracks);
          }
        } else {
          setTracks(generateMockTracks('unknown', 'Unknown Artist', []));
        }

      } catch (err) {
        console.error('[ArtistDetail] Critical error in loadArtistData:', err);
      } finally {
        setLoading(false);
      }
    }

    loadArtistData();
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

  if (!artist) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-neutral text-sm">Artist not found.</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-paper-3 text-ink text-[13px] rounded-lg">
          Go Back
        </button>
      </div>
    );
  }

  const artistImage = artist.images?.[0]?.url;

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

      {/* Artist Banner Header */}
      <div className="relative overflow-hidden rounded-2xl border border-rule/50 bg-gradient-to-r from-paper-2 to-paper-3/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-rule shadow-lg shrink-0">
          {artistImage ? (
            <img src={artistImage} alt={artist.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-paper-3 flex items-center justify-center text-neutral">
              <Users size={40} />
            </div>
          )}
        </div>
        
        <div className="text-center sm:text-left min-w-0 space-y-2.5">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/10">
            Verified Artist
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink leading-none tracking-tight">
            {artist.name}
          </h1>
          <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
            {artist.genres?.slice(0, 3).map((g: string) => (
              <span key={g} className="text-[11px] text-neutral px-2 py-0.5 bg-paper-3 rounded-full border border-rule/50 capitalize">
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Global Play Button inside header */}
        {tracks.length > 0 && (
          <button
            onClick={() => playTrack(tracks[0])}
            className="sm:ml-auto w-12 h-12 rounded-full bg-accent text-paper flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer hover:bg-accent-light"
            title="Play Top Songs"
          >
            <Play size={22} fill="currentColor" className="ml-0.5" />
          </button>
        )}
      </div>

      {/* Popular Tracks Section */}
      <div className="space-y-4">
        <h2 className="font-display font-semibold text-lg text-ink">Popular Tracks</h2>

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

                    {/* Metadata */}
                    <div className="flex items-center gap-3 min-w-0">
                      {track.album?.images?.[2]?.url || track.album?.images?.[0]?.url ? (
                        <img
                          src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
                          alt={track.name}
                          className="w-9 h-9 object-cover rounded-md border border-rule"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-paper-3 rounded-md border border-rule flex items-center justify-center text-neutral">
                          <Music size={14} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-semibold text-ink truncate group-hover:text-accent transition-colors">
                          {track.name}
                        </h4>
                        <p className="text-[11px] text-neutral truncate mt-0.5">
                          {track.album.name}
                        </p>
                      </div>
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
            No tracks found for this artist.
          </p>
        )}
      </div>
    </div>
  );
}
