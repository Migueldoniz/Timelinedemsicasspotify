import { useEffect, useState, useRef } from 'react';
import { Button } from './ui/button';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { getSpotifyToken } from '../utils/spotify';
import { Slider } from './ui/slider';

interface SpotifyWebPlayerProps {
  trackUri: string;
  trackName: string;
  artistName: string;
  positionMs?: number; // Adiciona esta prop
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

export function SpotifyWebPlayer({ trackUri, trackName, artistName }: SpotifyWebPlayerProps) {
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [sdkReady, setSdkReady] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Carregar SDK do Spotify
    if (!window.Spotify) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      setSdkReady(true);
    };

    return () => {
      if (player) {
        player.disconnect();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (sdkReady && !player) {
      initializePlayer();
    }
  }, [sdkReady]);

  async function initializePlayer() {
    const token = await getSpotifyToken();
    if (!token) return;

    const spotifyPlayer = new window.Spotify.Player({
      name: 'Timeline Musical Web Player',
      getOAuthToken: async (cb: (token: string) => void) => {
        const freshToken = await getSpotifyToken();
        if (freshToken) cb(freshToken);
      },
      volume: volume,
    });

    // Listeners
    spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('Ready with Device ID', device_id);
      setDeviceId(device_id);
    });

    spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('Device ID has gone offline', device_id);
    });

    spotifyPlayer.addListener('player_state_changed', (state: any) => {
      if (!state) return;

      setCurrentTrack(state.track_window.current_track);
      setIsPlaying(!state.paused);
      setPosition(state.position);
      setDuration(state.duration);
    });

    await spotifyPlayer.connect();
    setPlayer(spotifyPlayer);
  }

  useEffect(() => {
    if (deviceId && trackUri) {
      playTrack();
    }
  }, [deviceId, trackUri]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setPosition(prev => Math.min(prev + 1000, duration));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, duration]);

  async function playTrack() {
    const token = await getSpotifyToken();
    if (!token || !deviceId) return;

    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          uris: [trackUri],
          position_ms: positionMs,
        }),
      });
    } catch (error) {
      console.error('Error playing track:', error);
    }
  }

  async function togglePlay() {
    if (!player) return;
    
    if (isPlaying) {
      await player.pause();
    } else {
      await player.resume();
    }
  }

  async function handleVolumeChange(value: number[]) {
    const newVolume = value[0];
    setVolume(newVolume);
    if (player) {
      await player.setVolume(newVolume);
    }
  }

  function formatTime(ms: number) {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (!sdkReady || !deviceId) {
    return (
      <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-lg p-6 border border-green-500/20">
        <div className="flex items-center gap-3 text-white mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <Play className="w-5 h-5 fill-white" />
          </div>
          <div>
            <p className="font-medium">{trackName}</p>
            <p className="text-sm text-green-200">{artistName}</p>
          </div>
        </div>
        <p className="text-green-300 text-sm text-center">Inicializando player...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-lg p-6 border border-green-500/20">
      <div className="space-y-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{currentTrack?.name || trackName}</p>
            <p className="text-sm text-green-200 truncate">
              {currentTrack?.artists?.[0]?.name || artistName}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[position]}
            max={duration}
            step={1000}
            onValueChange={(value) => setPosition(value[0])}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-green-300">
            <span>{formatTime(position)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10 rounded-full"
            onClick={() => player?.previousTrack()}
          >
            <SkipBack className="w-5 h-5" />
          </Button>
          <Button
            size="lg"
            className="bg-white text-green-600 hover:bg-white/90 rounded-full w-12 h-12 p-0"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10 rounded-full"
            onClick={() => player?.nextTrack()}
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-green-300" />
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
