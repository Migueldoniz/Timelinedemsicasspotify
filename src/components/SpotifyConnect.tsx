import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Music, CheckCircle, XCircle } from 'lucide-react';
import { getSpotifyAuthUrl, disconnectSpotify, checkSpotifyConnection } from '../utils/spotify';
import { toast } from 'sonner@2.0.3';

interface SpotifyConnectProps {
  onConnectionChange?: (connected: boolean) => void;
}

export function SpotifyConnect({ onConnectionChange }: SpotifyConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
    
    // Verificar se voltou do callback do Spotify
    const params = new URLSearchParams(window.location.search);
    if (params.get('spotify_connected') === 'true') {
      toast.success('Conectado ao Spotify com sucesso!');
      window.history.replaceState({}, '', window.location.pathname);
      checkConnection();
    } else if (params.get('spotify_error')) {
      toast.error('Erro ao conectar com Spotify');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  async function checkConnection() {
    setLoading(true);
    try {
      const connected = await checkSpotifyConnection();
      setIsConnected(connected);
      onConnectionChange?.(connected);
    } catch (error) {
      console.error('Error checking Spotify connection:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    try {
      const authUrl = await getSpotifyAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting to Spotify:', error);
      toast.error('Erro ao conectar com Spotify');
    }
  }

  async function handleDisconnect() {
    try {
      await disconnectSpotify();
      setIsConnected(false);
      onConnectionChange?.(false);
      toast.success('Desconectado do Spotify');
    } catch (error) {
      console.error('Error disconnecting from Spotify:', error);
      toast.error('Erro ao desconectar do Spotify');
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="py-6">
          <p className="text-white text-center">Verificando conexão...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-white">Spotify</CardTitle>
            <CardDescription className="text-purple-200">
              {isConnected ? 'Conectado' : 'Não conectado'}
            </CardDescription>
          </div>
          {isConnected ? (
            <CheckCircle className="w-6 h-6 text-green-400" />
          ) : (
            <XCircle className="w-6 h-6 text-gray-400" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-3">
            <p className="text-purple-200 text-sm">
              Você pode reproduzir músicas diretamente do Spotify usando sua conta.
            </p>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Desconectar
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-purple-200 text-sm">
              Conecte sua conta do Spotify para reproduzir músicas diretamente no navegador.
            </p>
            <Button
              onClick={handleConnect}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              Conectar com Spotify
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
