import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';
import { useMusicStore, TrackObject } from '../store/useMusicStore';
import axiosInstance from '../lib/axios';
import { Play, Music, Users, Disc, Heart } from 'lucide-react';
import { OutletContextType } from '../layouts/MainLayout';

interface SearchResults {
  tracks: TrackObject[];
  artists: any[];
  albums: any[];
}

export default function Search() {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useOutletContext<OutletContextType>();
  const { playTrack } = useSpotifyPlayer();
  const { likedTrackIds, addLikedTrackId, removeLikedTrackId } = useMusicStore();
  
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  // Hardcoded categories for default view (Spotify style genres with vibrant gradients)
  const categories = [
    { name: 'Pop', gradient: 'from-pink-500 to-rose-600', q: 'pop hits' },
    { name: 'Hip-Hop', gradient: 'from-amber-500 to-orange-600', q: 'hip hop rap' },
    { name: 'Rock', gradient: 'from-red-600 to-amber-900', q: 'rock classics' },
    { name: 'Dance & Electronic', gradient: 'from-purple-600 to-indigo-750', q: 'dance electronic edm' },
    { name: 'Late Night Coding', gradient: 'from-blue-600 to-indigo-900', q: 'lofi coding focus' },
    { name: 'Synthwave Drive', gradient: 'from-fuchsia-600 to-indigo-900', q: 'synthwave nightdrive' },
    { name: 'Ambient Sleep', gradient: 'from-indigo-900 to-purple-950', q: 'ambient dark space sleep' },
    { name: 'Chill Lofi Beats', gradient: 'from-rose-500 to-purple-900', q: 'lofi hip hop chill' },
    { name: 'Dark Techno', gradient: 'from-zinc-800 to-zinc-950 border border-zinc-700', q: 'industrial dark techno' },
    { name: 'Jazz Nocturnal', gradient: 'from-amber-700 to-yellow-950', q: 'midnight jazz chill' },
    { name: 'Melodic Progressive', gradient: 'from-cyan-600 to-blue-900', q: 'melodic progressive house' },
    { name: 'Indie Ambient', gradient: 'from-emerald-600 to-teal-950', q: 'indie folk ambient' },
  ];

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch search results
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null);
      return;
    }

    async function fetchSearch() {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/spotify/search`, {
          params: { q: debouncedQuery, type: 'track,artist,album', limit: 20 },
        });

        const tracksData = response.data.tracks?.items || [];
        const artistsData = response.data.artists?.items || [];
        const albumsData = response.data.albums?.items || [];

        // Format tracks
        const formattedTracks = tracksData.map((t: any) => ({
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

        setResults({
          tracks: formattedTracks,
          artists: artistsData,
          albums: albumsData,
        });
      } catch (err: any) {
        console.error('Search error:', err);
        if (err.response) {
          console.error('Search error details:', JSON.stringify(err.response.data));
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSearch();
  }, [debouncedQuery]);

  const handleCategoryClick = (q: string) => {
    // We update the query state, which is owned by MainLayout
    if (setSearchQuery) {
      setSearchQuery(q);
    }
  };

  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

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
      if (wasLiked) {
        addLikedTrackId(trackId);
      } else {
        removeLikedTrackId(trackId);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none animate-in fade-in duration-300">
      {/* Category Grid (Default View when query is empty) */}
      {!searchQuery && !results && !loading && (
        <section className="space-y-6">
          <div>
            <h2 className="font-display font-bold text-xl text-ink">Browse Nocturnal Categories</h2>
            <p className="text-[12.5px] text-neutral mt-0.5">Select a vibe card to start search seeding.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.q)}
                className={`h-32 bg-gradient-to-br ${cat.gradient} p-4 rounded-xl text-left cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg relative overflow-hidden group border border-white/5 hover:border-white/10`}
              >
                <span className="font-display font-semibold text-[15px] text-paper inline-block max-w-[12ch] relative z-10 leading-tight">
                  {cat.name}
                </span>
                <span className="absolute -bottom-4 -right-4 text-paper/10 group-hover:text-paper/20 group-hover:scale-110 transition-all duration-300">
                  <Music size={80} />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="flex gap-4 border-b border-rule pb-2">
            <div className="h-6 w-16 bg-paper-2 rounded" />
            <div className="h-6 w-16 bg-paper-2 rounded" />
            <div className="h-6 w-16 bg-paper-2 rounded" />
          </div>
          <div className="space-y-2 pt-4">
            <div className="h-10 bg-paper-2 rounded w-full" />
            <div className="h-10 bg-paper-2 rounded w-full" />
            <div className="h-10 bg-paper-2 rounded w-full" />
          </div>
        </div>
      )}

      {/* Results View */}
      {results && !loading && (
        <div className="space-y-10">
          {/* Top Section: Top Result (Left) & Songs (Right) */}
          {(() => {
            const topArtist = results.artists?.[0];
            const topTrack = results.tracks?.[0];
            const topItem = topArtist || topTrack;
            const isArtist = topItem === topArtist;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8">
                {/* Top Result Block */}
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-lg text-ink">Top Result</h3>
                  {topItem ? (
                    <div 
                      onClick={() => {
                        if (isArtist) {
                          navigate(`/artist/${topItem.id}`, { state: { artist: topItem } });
                        } else {
                          playTrack(topItem);
                        }
                      }}
                      className="bg-paper-2/20 hover:bg-paper-3/45 border border-rule/50 rounded-2xl p-6 flex flex-col justify-end gap-6 cursor-pointer transition-all duration-300 hover:shadow-xl group hover:border-accent/20 relative min-h-[220px]"
                    >
                      <div className="relative w-24 h-24 shrink-0">
                        {isArtist ? (
                          topItem.images?.[0]?.url ? (
                            <img
                              src={topItem.images[0].url}
                              alt={topItem.name}
                              className="w-full h-full object-cover rounded-full shadow-md"
                            />
                          ) : (
                            <div className="w-full h-full bg-paper-3 rounded-full flex items-center justify-center text-neutral shadow-md">
                              <Users size={32} />
                            </div>
                          )
                        ) : (
                          topItem.album?.images?.[0]?.url ? (
                            <img
                              src={topItem.album.images[0].url}
                              alt={topItem.name}
                              className="w-full h-full object-cover rounded-xl border border-rule shadow-md"
                            />
                          ) : (
                            <div className="w-full h-full bg-paper-3 rounded-xl border border-rule flex items-center justify-center text-neutral shadow-md">
                              <Music size={32} />
                            </div>
                          )
                        )}
                        
                        {/* Quick Play Button overlay for Song Top Result */}
                        {!isArtist && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              playTrack(topItem);
                            }}
                            className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-accent text-paper flex items-center justify-center shadow-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
                          >
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                          </button>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-ink truncate group-hover:text-accent transition-colors leading-tight">
                          {topItem.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] font-bold tracking-wider text-neutral/70 uppercase px-2 py-0.5 bg-paper-3 rounded-full">
                            {isArtist ? 'Artist' : 'Song'}
                          </span>
                          {!isArtist && (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-rule" />
                              <span className="text-[12.5px] text-neutral truncate max-w-[200px]">
                                {topItem.artists?.map((a: any) => a.name).join(', ')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full bg-paper-2/10 border border-rule/50 rounded-xl p-6 text-neutral text-sm flex items-center justify-center">
                      No top result
                    </div>
                  )}
                </div>

                {/* Songs Block */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-lg text-ink">Songs</h3>
                    <button
                      onClick={() => navigate(`/search/songs?q=${encodeURIComponent(searchQuery)}`)}
                      className="text-[12px] font-semibold text-neutral hover:text-accent transition-colors cursor-pointer"
                    >
                      See all
                    </button>
                  </div>
                  <div className="space-y-1">
                    {results.tracks.slice(0, 4).length > 0 ? (
                      results.tracks.slice(0, 4).map((track) => {
                        const liked = likedTrackIds.includes(track.id);
                        return (
                          <div
                            key={track.id}
                            onClick={() => playTrack(track)}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-paper-3/45 group cursor-pointer transition-all duration-200"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {/* Play Overlay */}
                              <div className="relative w-10 h-10 shrink-0">
                                {track.album?.images?.[2]?.url || track.album?.images?.[0]?.url ? (
                                  <img
                                    src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
                                    alt={track.name}
                                    className="w-full h-full object-cover rounded-md border border-rule"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-paper-3 rounded-md border border-rule flex items-center justify-center text-neutral">
                                    <Music size={14} />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Play size={14} fill="white" className="text-white ml-0.5" />
                                </div>
                              </div>
                              
                              <div className="min-w-0">
                                <h4 className="text-[13.5px] font-semibold text-ink truncate group-hover:text-accent transition-colors">
                                  {track.name}
                                </h4>
                                <p className="text-[11px] text-neutral truncate mt-0.5">
                                  {track.artists.map((a: any) => a.name).join(', ')}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-[11.5px] font-mono text-neutral pl-2">
                              <button
                                onClick={(e) => handleLikeToggle(e, track)}
                                className={`cursor-pointer transition-colors ${
                                  liked ? 'text-accent' : 'text-neutral hover:text-ink opacity-0 group-hover:opacity-100'
                                }`}
                              >
                                <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                              </button>
                              <span>{formatDuration(track.duration_ms)}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-[12.5px] text-neutral italic p-4">No songs found.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Artists Block */}
          {results.artists.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-ink">Artists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {results.artists.slice(0, 5).map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => navigate(`/artist/${artist.id}`, { state: { artist } })}
                    className="bg-paper-2/20 border border-rule/50 rounded-xl p-4 flex flex-col items-center text-center gap-3 group transition-all duration-300 hover:shadow-lg hover:border-accent/15 cursor-pointer"
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border border-rule shadow relative">
                      {artist.images && artist.images[0] ? (
                        <img
                          src={artist.images[0].url}
                          alt={artist.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-paper-3 flex items-center justify-center text-neutral">
                          <Users size={32} />
                        </div>
                      )}
                    </div>
                    <div className="w-full">
                      <h4 className="text-[13px] font-semibold text-ink truncate group-hover:text-accent transition-colors">
                        {artist.name}
                      </h4>
                      <p className="text-[10px] text-neutral mt-0.5 capitalize truncate">
                        {artist.genres?.[0] || 'Artist'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Albums Block */}
          {results.albums.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-ink">Albums</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {results.albums.slice(0, 5).map((album) => (
                  <div
                    key={album.id}
                    onClick={() => navigate(`/album/${album.id}`, { state: { album } })}
                    className="bg-paper-2/20 border border-rule/50 rounded-xl p-4 flex flex-col gap-3 group transition-all duration-300 hover:shadow-lg hover:border-accent/15 cursor-pointer"
                  >
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-rule shadow">
                      {album.images && album.images[0] ? (
                        <img
                          src={album.images[0].url}
                          alt={album.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-paper-3 flex items-center justify-center text-neutral">
                          <Disc size={32} />
                        </div>
                      )}
                      <button className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-accent text-paper flex items-center justify-center shadow-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <Play size={14} fill="currentColor" className="ml-0.5" />
                      </button>
                    </div>
                    <div className="w-full">
                      <h4 className="text-[13px] font-semibold text-ink truncate group-hover:text-accent transition-colors">
                        {album.name}
                      </h4>
                      <p className="text-[11px] text-neutral truncate mt-0.5">
                        {album.artists?.[0]?.name || 'Album'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State when no results returned at all */}
          {results.tracks.length === 0 && results.artists.length === 0 && results.albums.length === 0 && (
            <EmptyState query={searchQuery} />
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="text-center py-16 space-y-2 border border-dashed border-rule/50 rounded-xl">
      <p className="text-[14px] text-accent font-semibold">No results found for "{query}"</p>
      <p className="text-[12px] text-neutral">Try checking for typos or searching a different term.</p>
    </div>
  );
}
