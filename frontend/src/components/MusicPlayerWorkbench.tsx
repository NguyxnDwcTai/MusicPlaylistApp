import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  SpeakerHigh, 
  SpeakerLow, 
  SpeakerSimpleX, 
  Plus, 
  Heart
} from '@phosphor-icons/react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  url: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  vibe: string;
  accentColor: string;
  glowColor: string;
  artwork: string;
  tracks: Track[];
}

export default function MusicPlayerWorkbench() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylistIndex, setActivePlaylistIndex] = useState<number>(0);
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.7);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // Custom interactive features
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [newTrackTitle, setNewTrackTitle] = useState<string>('');
  const [newTrackArtist, setNewTrackArtist] = useState<string>('');
  
  // API states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  // Audio elements
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const visualizerRef = useRef<HTMLCanvasElement | null>(null);
  const visualizerAnimRef = useRef<number | null>(null);

  // Fetch Playlists from Backend
  const fetchPlaylists = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch('/api/playlists');
      if (!response.ok) throw new Error('API failure');
      const data = await response.json();
      setPlaylists(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching playlists:', err);
      setIsError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const activePlaylist = playlists[activePlaylistIndex];
  const activeTrack = activePlaylist?.tracks[activeTrackIndex];

  // Initialize and manage audio object
  useEffect(() => {
    if (!activeTrack) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(activeTrack.url);
    } else {
      audioRef.current.src = activeTrack.url;
    }

    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : volume;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => handleNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    if (isPlaying) {
      audio.play().catch(err => {
        console.log("Playback interrupted/requires interaction:", err);
        setIsPlaying(false);
      });
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [activePlaylistIndex, activeTrackIndex]);

  // Volume synchronization
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Playback Toggle
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Audio playback error:", err);
      });
    }
  };

  // Skip tracks
  const handleNext = () => {
    if (!activePlaylist) return;
    setActiveTrackIndex((prev) => (prev + 1) % activePlaylist.tracks.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (!activePlaylist) return;
    setActiveTrackIndex((prev) => (prev - 1 + activePlaylist.tracks.length) % activePlaylist.tracks.length);
    setIsPlaying(true);
  };

  // Visualizer Animation Loop
  useEffect(() => {
    const canvas = visualizerRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 48;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Audio frequency mockup simulation
    const barCount = 32;
    const bars: { x: number; targetHeight: number; currentHeight: number }[] = [];
    for (let i = 0; i < barCount; i++) {
      bars.push({
        x: i * (canvas.width / barCount),
        targetHeight: 2,
        currentHeight: 2
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const accent = activePlaylist?.accentColor || '#FF6F39';
      ctx.fillStyle = accent;

      bars.forEach((bar, idx) => {
        // If playing, fluctuate heights randomly. If paused, decay to base height.
        if (isPlaying) {
          // Create wave-like shapes driven by time and index
          const timeFactor = Date.now() * 0.005;
          const waveHeight = Math.sin(idx * 0.2 + timeFactor) * 15 + 20;
          bar.targetHeight = Math.max(4, waveHeight + Math.random() * 8);
        } else {
          bar.targetHeight = 3;
        }

        // Smooth interpolation
        bar.currentHeight += (bar.targetHeight - bar.currentHeight) * 0.15;

        // Draw bar
        const width = (canvas.width / barCount) - 3;
        const height = bar.currentHeight;
        const x = idx * (canvas.width / barCount);
        const y = canvas.height - height;
        
        ctx.fillRect(x, y, width, height);
      });

      visualizerAnimRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (visualizerAnimRef.current) cancelAnimationFrame(visualizerAnimRef.current);
    };
  }, [isPlaying, activePlaylistIndex, isLoading]);

  // Scrub bar clicks
  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pos * duration;
    setCurrentTime(pos * duration);
  };

  // Like track
  const toggleLike = (trackId: string) => {
    setLikes(prev => ({
      ...prev,
      [trackId]: !prev[trackId]
    }));
  };

  // Add custom track
  const handleAddTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackTitle.trim() || !newTrackArtist.trim()) return;

    const updatedPlaylists = [...playlists];
    const targetPlaylist = updatedPlaylists[activePlaylistIndex];
    
    // Add mock track
    const newTrack: Track = {
      id: `custom-${Date.now()}`,
      title: newTrackTitle,
      artist: newTrackArtist,
      album: 'Custom Uploads',
      duration: '4:20',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' // Fallback playable URL
    };

    targetPlaylist.tracks.push(newTrack);
    setPlaylists(updatedPlaylists);
    setNewTrackTitle('');
    setNewTrackArtist('');
  };

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // SKELETAL LOADER STATE
  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto bg-paper-2 border border-rule rounded-lg p-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="h-6 w-32 bg-rule rounded"></div>
            <div className="space-y-2">
              <div className="h-12 bg-rule rounded"></div>
              <div className="h-12 bg-rule rounded"></div>
              <div className="h-12 bg-rule rounded"></div>
            </div>
          </div>
          <div className="md:col-span-2 space-y-6">
            <div className="flex gap-6 items-center">
              <div className="w-24 h-24 bg-rule rounded-lg"></div>
              <div className="space-y-2 flex-1">
                <div className="h-6 w-1/3 bg-rule rounded"></div>
                <div className="h-4 w-1/2 bg-rule rounded"></div>
              </div>
            </div>
            <div className="h-1 bg-rule rounded w-full"></div>
            <div className="h-24 bg-rule rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (isError) {
    return (
      <div className="w-full max-w-lg mx-auto bg-paper-2 border border-rule rounded-lg p-8 text-center space-y-4">
        <p className="text-accent text-[15px] font-semibold">Failed to load curated vibe streams.</p>
        <p className="text-neutral text-[13px]">Our server might be asleep or resting. Try waking it up.</p>
        <button 
          onClick={fetchPlaylists}
          className="px-5 py-2 text-[13px] bg-accent hover:bg-accent-hover text-paper font-semibold rounded-full cursor-pointer transition-all duration-200"
        >
          Re-establish Connection
        </button>
      </div>
    );
  }

  return (
    <div 
      className="w-full max-w-5xl mx-auto bg-paper-2 border border-rule rounded-lg p-4 md:p-6 shadow-2xl relative overflow-hidden transition-all duration-500"
      style={{
        boxShadow: `0 20px 40px -15px ${activePlaylist.glowColor}`
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Vibe Selectors */}
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-[15px] tracking-wide text-ink uppercase mb-2">
            Select Vibe
          </h3>
          
          <div className="space-y-2">
            {playlists.map((playlist, idx) => {
              const isActive = idx === activePlaylistIndex;
              return (
                <button
                  key={playlist.id}
                  onClick={() => {
                    setActivePlaylistIndex(idx);
                    setActiveTrackIndex(0);
                    setIsPlaying(false);
                    if (audioRef.current) {
                      audioRef.current.pause();
                    }
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-300 cursor-pointer flex items-center gap-3 ${
                    isActive 
                      ? 'border-accent/40 bg-paper-3 shadow-md' 
                      : 'border-rule hover:border-neutral/20 bg-paper/30'
                  }`}
                >
                  <img 
                    src={playlist.artwork} 
                    alt={playlist.name} 
                    className="w-10 h-10 object-cover rounded-md" 
                  />
                  <div>
                    <h4 className="font-display font-semibold text-[13.5px] text-ink">{playlist.name}</h4>
                    <p className="text-[11px] text-neutral mt-0.5">{playlist.vibe}</p>
                  </div>
                  {isActive && (
                    <span 
                      className="ml-auto w-2 h-2 rounded-full"
                      style={{ backgroundColor: playlist.accentColor }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Playlist Description */}
          <div className="p-4 bg-paper/20 rounded-lg border border-rule mt-4">
            <p className="text-[12px] text-neutral leading-relaxed">
              {activePlaylist.description}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Player Dashboard */}
        <div className="md:col-span-2 flex flex-col justify-between space-y-6">
          
          {/* Track metadata details */}
          <div className="flex flex-col sm:flex-row gap-5 items-center">
            <img 
              src={activePlaylist.artwork} 
              alt={activePlaylist.name} 
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-rule shadow-lg"
            />
            <div className="text-center sm:text-left flex-1 min-w-0">
              <span 
                className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded"
                style={{ 
                  backgroundColor: `${activePlaylist.accentColor}1e`,
                  color: activePlaylist.accentColor
                }}
              >
                Playing from {activePlaylist.name}
              </span>
              <h2 className="font-display font-bold text-[20px] text-ink truncate mt-1.5">
                {activeTrack?.title || 'No track selected'}
              </h2>
              <p className="text-[13px] text-neutral truncate mt-0.5">
                {activeTrack?.artist} — <span className="font-mono text-[11px]">{activeTrack?.album}</span>
              </p>
            </div>
            
            {/* Visualizer output */}
            <div className="w-full sm:w-36 h-12 flex items-end bg-paper/30 border border-rule/50 rounded-md p-1 overflow-hidden">
              <canvas ref={visualizerRef} className="w-full h-full" />
            </div>
          </div>

          {/* Player scrubbing & timeline controls */}
          <div className="space-y-2">
            <div 
              onClick={handleScrub}
              className="relative w-full h-1 bg-rule rounded-full overflow-visible cursor-pointer group"
            >
              <div 
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-75"
                style={{ 
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  backgroundColor: activePlaylist.accentColor
                }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-ink shadow bg-accent scale-0 group-hover:scale-100 transition-transform duration-100"
                style={{ 
                  left: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: activePlaylist.accentColor
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-neutral">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Action and volume controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Playback action row */}
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePrev}
                className="p-2 text-neutral hover:text-ink cursor-pointer transition-colors"
                aria-label="Previous track"
              >
                <SkipBack size={20} weight="fill" />
              </button>
              
              <button 
                onClick={handlePlayPause}
                className="p-3.5 rounded-full text-paper cursor-pointer transition-transform duration-200 transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: activePlaylist.accentColor }}
                aria-label={isPlaying ? "Pause track" : "Play track"}
              >
                {isPlaying ? <Pause size={22} weight="fill" /> : <Play size={22} weight="fill" />}
              </button>
              
              <button 
                onClick={handleNext}
                className="p-2 text-neutral hover:text-ink cursor-pointer transition-colors"
                aria-label="Next track"
              >
                <SkipForward size={20} weight="fill" />
              </button>
            </div>

            {/* Volume sliders */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="text-neutral hover:text-ink transition-colors cursor-pointer"
                aria-label="Toggle mute"
              >
                {isMuted || volume === 0 ? (
                  <SpeakerSimpleX size={18} />
                ) : volume < 0.4 ? (
                  <SpeakerLow size={18} />
                ) : (
                  <SpeakerHigh size={18} />
                )}
              </button>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-16 sm:w-24 h-1 bg-rule rounded-lg appearance-none cursor-pointer accent-accent"
                aria-label="Volume slider"
              />
            </div>
          </div>

          {/* Tracklist table */}
          <div className="space-y-1 border-t border-rule pt-4">
            <h4 className="font-display font-medium text-[11px] tracking-wider text-neutral uppercase mb-2">
              Tracklist
            </h4>
            <div className="max-h-[160px] overflow-y-auto space-y-1 pr-1">
              {activePlaylist.tracks.map((track, idx) => {
                const isActive = idx === activeTrackIndex;
                const isLiked = likes[track.id] || false;
                return (
                  <div
                    key={track.id}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded transition-colors group cursor-pointer ${
                      isActive 
                        ? 'bg-paper-3 text-ink font-semibold' 
                        : 'hover:bg-paper/20 text-neutral hover:text-ink'
                    }`}
                    onClick={() => {
                      setActiveTrackIndex(idx);
                      setIsPlaying(true);
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-[10px] w-4 text-center">
                        {isActive && isPlaying ? (
                          <div className="flex justify-center items-end gap-[2px] h-3 w-4">
                            <span className="w-[2px] bg-accent animate-[pulse-slow_0.8s_infinite] h-full"></span>
                            <span className="w-[2px] bg-accent animate-[pulse-slow_1.2s_infinite] h-2/3"></span>
                            <span className="w-[2px] bg-accent animate-[pulse-slow_1s_infinite] h-1/2"></span>
                          </div>
                        ) : (
                          idx + 1
                        )}
                      </span>
                      <div className="truncate">
                        <p className="text-[12.5px] leading-tight truncate">{track.title}</p>
                        <p className="text-[10.5px] text-muted leading-tight truncate mt-0.5">{track.artist}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-[11px] font-mono">
                      <span>{track.duration}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track.id);
                        }}
                        className={`transition-colors cursor-pointer ${
                          isLiked ? 'text-accent' : 'text-muted hover:text-ink'
                        }`}
                        aria-label="Like track"
                      >
                        <Heart size={14} weight={isLiked ? 'fill' : 'regular'} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick interactive: Add custom mock track form */}
          <form onSubmit={handleAddTrack} className="flex flex-col sm:flex-row gap-2 border-t border-rule pt-4">
            <div className="flex-1 flex gap-2">
              <input 
                type="text" 
                placeholder="Custom Track Title"
                value={newTrackTitle}
                onChange={(e) => setNewTrackTitle(e.target.value)}
                className="flex-1 bg-paper/50 border border-rule rounded px-3 py-1.5 text-[12px] text-ink placeholder:text-muted focus:border-accent"
              />
              <input 
                type="text" 
                placeholder="Artist"
                value={newTrackArtist}
                onChange={(e) => setNewTrackArtist(e.target.value)}
                className="flex-1 bg-paper/50 border border-rule rounded px-3 py-1.5 text-[12px] text-ink placeholder:text-muted focus:border-accent"
              />
            </div>
            <button 
              type="submit" 
              className="px-4 py-1.5 bg-paper border border-rule hover:border-neutral text-ink hover:text-accent font-semibold text-[11px] rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={12} /> Add Track
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
