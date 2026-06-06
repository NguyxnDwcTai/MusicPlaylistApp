import React, { useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { useMusicStore, TrackObject } from '../store/useMusicStore';
import axiosInstance from '../lib/axios';

// Declare global Spotify type for TS compile
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

// Singleton HTMLAudioElement for free accounts
const audioFallback = new Audio();

interface SpotifyPlayerContextType {
  playTrack: (track: TrackObject) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  nextTrack: () => Promise<void>;
  prevTrack: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  adjustVolume: (volume: number) => Promise<void>;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | null>(null);

function useSpotifyPlayerInternal() {
  const {
    accessToken,
    isPlaying,
    isPremium,
    playbackState,
    setDeviceId,
    setCurrentTrack,
    setIsPlaying,
    setPlaybackState,
    setIsPremium,
    setVolume,
  } = useMusicStore();

  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<any>(null);

  // Sync volume of the fallback audio element
  useEffect(() => {
    audioFallback.volume = playbackState.volume;
  }, [playbackState.volume]);

  // Inject SDK script
  useEffect(() => {
    if (!accessToken) return;

    // Only inject once
    if (document.getElementById('spotify-player-sdk')) {
      if (window.Spotify && !playerRef.current) {
        initializePlayer();
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'spotify-player-sdk';
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      initializePlayer();
    };

    return () => {
      // Clean up intervals on unmount
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [accessToken]);

  const initializePlayer = () => {
    if (!accessToken) return;

    const player = new window.Spotify.Player({
      name: 'Nocturne Web Player',
      getOAuthToken: (cb: (token: string) => void) => cb(accessToken),
      volume: playbackState.volume,
    });

    playerRef.current = player;

    // Error handling
    player.addListener('initialization_error', ({ message }: { message: string }) => {
      console.error('Initialization error:', message);
    });

    player.addListener('authentication_error', ({ message }: { message: string }) => {
      console.error('Authentication error:', message);
    });

    player.addListener('account_error', ({ message }: { message: string }) => {
      console.error('Account error:', message);
    });

    player.addListener('playback_error', ({ message }: { message: string }) => {
      console.error('Playback error:', message);
    });

    // Premium Check - handles PREMIUM_REQUIRED
    player.addListener('account_error', (error: any) => {
      if (error.message && error.message.includes('PREMIUM_REQUIRED')) {
        console.warn('Spotify Premium is required for Web Playback SDK. Falling back.');
        setIsPremium(false);
      }
    });

    // Ready
    player.addListener('ready', async ({ device_id }: { device_id: string }) => {
      console.log('Spotify Player Ready with Device ID:', device_id);
      setDeviceId(device_id);
      setIsPremium(true);

      // Transfer playback to Nocturne player
      try {
        await axiosInstance.put('/api/spotify/me/player', {
          device_ids: [device_id],
          play: false, // Don't auto play
        });
      } catch (err) {
        console.error('Failed to transfer playback to device:', err);
      }
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.warn('Device ID has gone offline:', device_id);
      setDeviceId(null);
    });

    // Player State Changed
    player.addListener('player_state_changed', (state: any) => {
      if (!state) return;

      const track = state.track_window.current_track;
      if (track) {
        const formattedTrack: TrackObject = {
          id: track.id,
          name: track.name,
          artists: track.artists,
          album: {
            name: track.album.name,
            images: track.album.images,
          },
          duration_ms: state.duration,
          uri: track.uri,
        };

        // Sync queueIndex if the track uri matches any song in the queue
        const musicState = useMusicStore.getState();
        if (musicState.queue.length > 0) {
          const currentQueueTrack = musicState.queue[musicState.queueIndex];
          if (!currentQueueTrack || currentQueueTrack.uri !== track.uri) {
            const foundIdx = musicState.queue.findIndex(t => t.uri === track.uri);
            if (foundIdx !== -1) {
              musicState.setQueueIndex(foundIdx);
            }
          }
        }

        setCurrentTrack(formattedTrack);
      }

      setIsPlaying(!state.paused);
      setPlaybackState({
        progressMs: state.position,
        shuffle: state.shuffle,
        repeat: state.repeat_mode === 0 ? 'off' : state.repeat_mode === 1 ? 'context' : 'track',
      });
    });

    // Connect player
    player.connect().then((success: boolean) => {
      if (success) {
        console.log('Successfully connected to Spotify Web Playback SDK');
      }
    });
  };

  // Track progress updating for either SDK or preview audio
  useEffect(() => {
    if (!isPlaying) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      return;
    }

    progressIntervalRef.current = setInterval(() => {
      if (!isPremium) {
        // Sync with HTML5 audio element directly (no stale closure issue)
        const progressMs = Math.floor(audioFallback.currentTime * 1000);
        setPlaybackState({ progressMs });
      } else {
        // Use functional updater to avoid stale closure
        setPlaybackState((prev) => ({ progressMs: prev.progressMs + 500 }));
      }
    }, 500);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isPlaying, isPremium]); // removed playbackState.progressMs to prevent re-render loop

  // Audio Fallback end event listener
  useEffect(() => {
    const handleEnded = async () => {
      const { queue, queueIndex, setQueueIndex, setCurrentTrack, setIsPlaying, setPlaybackState } = useMusicStore.getState();
      
      if (queue.length > 0 && queueIndex < queue.length - 1) {
        const nextIdx = queueIndex + 1;
        setQueueIndex(nextIdx);
        const nextTrk = queue[nextIdx];
        if (nextTrk.preview_url) {
          audioFallback.src = nextTrk.preview_url;
          audioFallback.play().then(() => {
            setCurrentTrack(nextTrk);
            setIsPlaying(true);
            setPlaybackState({ progressMs: 0 });
          }).catch(err => console.error('Audio preview play failed:', err));
        } else {
          // If no preview, automatically try to skip to the next track recursively
          setIsPlaying(false);
          setPlaybackState({ progressMs: 0 });
          // Optional: trigger nextTrack() here if we want to skip unplayable tracks automatically
        }
      } else {
        setIsPlaying(false);
        setPlaybackState({ progressMs: 0 });
      }
    };

    audioFallback.addEventListener('ended', handleEnded);
    return () => audioFallback.removeEventListener('ended', handleEnded);
  }, []);

  // Controls Actions
  const playTrack = async (track: TrackObject) => {
    const state = useMusicStore.getState();
    const { isPremium, deviceId, queue, queueIndex, setCurrentTrack, setIsPlaying, setPlaybackState, currentTrack } = state;

    if (!isPremium) {
      // Free Account Fallback
      if (track.preview_url) {
        if (currentTrack?.id === track.id) {
          await togglePlayPause();
          return;
        }

        audioFallback.src = track.preview_url;
        audioFallback.play().then(() => {
          setCurrentTrack(track);
          setIsPlaying(true);
          setPlaybackState({ progressMs: 0 });
        }).catch(err => {
          console.error('Audio preview play failed:', err);
        });
      } else {
        alert('Spotify Premium is required to play this track. No preview is available.');
      }
      return;
    }

    // Premium Account
    if (!deviceId) {
      console.warn('No active player device found.');
      return;
    }

    try {
      // Spotify API allows a maximum of 100 URIs in the request
      let uriList = [track.uri];
      let offsetObj = undefined;

      if (queue.length > 0) {
        if (queue.length <= 100) {
          uriList = queue.map(t => t.uri);
          offsetObj = { position: queueIndex };
        } else {
          // Create a 100-item window around the queueIndex
          const startIdx = Math.max(0, queueIndex - 50);
          const endIdx = Math.min(queue.length, startIdx + 100);
          const finalStartIdx = Math.max(0, endIdx - 100); // Adjust if near the end
          
          uriList = queue.slice(finalStartIdx, endIdx).map(t => t.uri);
          offsetObj = { position: queueIndex - finalStartIdx };
        }
      }
      
      await axiosInstance.put(`/api/spotify/me/player/play?device_id=${deviceId}`, {
        uris: uriList,
        offset: offsetObj,
      });
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to play track via Spotify SDK:', err);
    }
  };

  const togglePlayPause = async () => {
    const { isPremium, isPlaying, setIsPlaying } = useMusicStore.getState();

    if (!isPremium) {
      // Free Account Fallback — check src properly (empty string is falsy in JS)
      if (!audioFallback.src || audioFallback.src === window.location.href) return;
      if (isPlaying) {
        audioFallback.pause();
        setIsPlaying(false);
      } else {
        audioFallback.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error('Audio preview play failed:', err);
        });
      }
      return;
    }

    // Premium Account — ensure SDK player is ready
    if (!playerRef.current) {
      console.warn('Spotify player is not initialized yet.');
      return;
    }
    try {
      await playerRef.current.togglePlay();
    } catch (err) {
      console.error('Failed to toggle play/pause:', err);
    }
  };

  const nextTrack = async () => {
    const { isPremium, queue, queueIndex, setQueueIndex, setCurrentTrack, setIsPlaying, setPlaybackState } = useMusicStore.getState();

    if (!isPremium) {
      // Free Account: manually advance to the next track that has a preview_url
      if (queue.length > 0 && queueIndex < queue.length - 1) {
        let nextIdx = queueIndex + 1;
        
        // Fast-forward to the next playable track
        while (nextIdx < queue.length && !queue[nextIdx].preview_url) {
          nextIdx++;
        }

        if (nextIdx < queue.length) {
          setQueueIndex(nextIdx);
          const nextTrk = queue[nextIdx];
          audioFallback.src = nextTrk.preview_url as string;
          audioFallback.play().then(() => {
            setCurrentTrack(nextTrk);
            setIsPlaying(true);
            setPlaybackState({ progressMs: 0 });
          }).catch(err => console.error('Audio preview play failed:', err));
        } else {
          alert('End of playable queue reached.');
        }
      }
      return;
    }

    // Premium Account
    if (queue.length > 0 && queueIndex < queue.length - 1) {
      const nextIdx = queueIndex + 1;
      setQueueIndex(nextIdx);
      
      // For large playlists (>100 songs), update the sliding window. Otherwise, use fast SDK controls.
      if (queue.length <= 100) {
        if (playerRef.current) {
          try {
            await playerRef.current.nextTrack();
          } catch (err) {
            console.error('Failed to skip to next via SDK:', err);
          }
        } else {
          try {
            await axiosInstance.post('/api/spotify/me/player/next');
          } catch (err) {
            console.error('Failed to skip to next:', err);
          }
        }
      } else {
        await playTrack(queue[nextIdx]);
      }
    }
  };

  const prevTrack = async () => {
    const { isPremium, queue, queueIndex, setQueueIndex, setCurrentTrack, setIsPlaying, setPlaybackState } = useMusicStore.getState();

    if (!isPremium) {
      if (queue.length > 0 && queueIndex > 0) {
        let prevIdx = queueIndex - 1;
        
        // Rewind to the previous playable track
        while (prevIdx >= 0 && !queue[prevIdx].preview_url) {
          prevIdx--;
        }

        if (prevIdx >= 0) {
          setQueueIndex(prevIdx);
          const prevTrk = queue[prevIdx];
          audioFallback.src = prevTrk.preview_url as string;
          audioFallback.play().then(() => {
            setCurrentTrack(prevTrk);
            setIsPlaying(true);
            setPlaybackState({ progressMs: 0 });
          }).catch(err => console.error('Audio preview play failed:', err));
        } else {
          alert('Beginning of playable queue reached.');
        }
      }
      return;
    }

    // Premium Account
    if (queue.length > 0 && queueIndex > 0) {
      const prevIdx = queueIndex - 1;
      setQueueIndex(prevIdx);

      // For large playlists (>100 songs), update the sliding window. Otherwise, use fast SDK controls.
      if (queue.length <= 100) {
        if (playerRef.current) {
          try {
            await playerRef.current.previousTrack();
          } catch (err) {
            console.error('Failed to skip to previous via SDK:', err);
          }
        } else {
          try {
            await axiosInstance.post('/api/spotify/me/player/previous');
          } catch (err) {
            console.error('Failed to skip to previous:', err);
          }
        }
      } else {
        await playTrack(queue[prevIdx]);
      }
    }
  };

  const seek = async (positionMs: number) => {
    if (!isPremium) {
      // Free Account Fallback
      audioFallback.currentTime = positionMs / 1000;
      setPlaybackState({ progressMs: positionMs });
      return;
    }

    if (playerRef.current) {
      try {
        await playerRef.current.seek(positionMs);
        setPlaybackState({ progressMs: positionMs });
      } catch (err) {
        console.error('Failed to seek via SDK:', err);
      }
    } else {
      try {
        await axiosInstance.put(`/api/spotify/me/player/seek?position_ms=${positionMs}`);
        setPlaybackState({ progressMs: positionMs });
      } catch (err) {
        console.error('Failed to seek player:', err);
      }
    }
  };

  const adjustVolume = async (volume: number) => {
    // Volume is a 0-1 scale
    setVolume(volume);

    if (!isPremium) {
      audioFallback.volume = volume;
      return;
    }

    if (playerRef.current) {
      try {
        await playerRef.current.setVolume(volume);
      } catch (err) {
        console.error('Failed to set SDK volume:', err);
      }
    }
  };

  return {
    playTrack,
    togglePlayPause,
    nextTrack,
    prevTrack,
    seek,
    adjustVolume,
  };
}

export function SpotifyPlayerProvider({ children }: { children: ReactNode }) {
  const value = useSpotifyPlayerInternal();
  return React.createElement(SpotifyPlayerContext.Provider, { value }, children);
}

export function useSpotifyPlayer() {
  const context = useContext(SpotifyPlayerContext);
  if (!context) {
    throw new Error('useSpotifyPlayer must be used within a SpotifyPlayerProvider');
  }
  return context;
}
