import { Play } from "lucide-react";
import type { Song } from "./MusicTimeline";
import { SpotifyWebPlayer } from "./SpotifyWebPlayer";

interface SpotifyPlayerProps {
  song: Song;
  useWebPlayer?: boolean;
}

export function SpotifyPlayer({ song, useWebPlayer = false }: SpotifyPlayerProps) {
  // Converter tempo para milissegundos para o SDK
  const startTimeMs = ((song.startTimeMinutes || 0) * 60 + (song.startTimeSeconds || 0)) * 1000;
  // Converter URI do Spotify para URL do embed
  const getSpotifyEmbedUrl = (uri: string) => {
    if (!uri) return '';
    const parts = uri.split(':');
    if (parts.length !== 3 || parts[0] !== 'spotify' || parts[1] !== 'track') {
      return '';
    }
    const trackId = parts[2];
    return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;
  };

  const embedUrl = getSpotifyEmbedUrl(song.spotifyUri);
  const hasValidUri = embedUrl !== '';

  // Se conectado ao Spotify, usar Web Player
  if (useWebPlayer && hasValidUri) {
    return (
      <SpotifyWebPlayer
        trackUri={song.spotifyUri}
        trackName={song.title}
        artistName={song.artist}
        positionMs={startTimeMs}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-white">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Play className="w-5 h-5 fill-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate">{song.title || 'Sem título'}</p>
          <p className="text-sm text-purple-200 truncate">{song.artist || 'Artista desconhecido'}</p>
        </div>
      </div>
      
      {hasValidUri ? (
        <div className="rounded-lg overflow-hidden shadow-lg">
          <iframe
            src={embedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="w-full"
          ></iframe>
        </div>
      ) : (
        <div className="rounded-lg bg-white/5 border border-white/10 p-6 text-center">
          <p className="text-purple-300 text-sm">
            {song.spotifyUri ? 'URI do Spotify inválido' : 'Adicione um URI do Spotify para visualizar a música'}
          </p>
          <p className="text-purple-400 text-xs mt-2">
            Formato: spotify:track:ID_DA_MUSICA
          </p>
        </div>
      )}
    </div>
  );
}
