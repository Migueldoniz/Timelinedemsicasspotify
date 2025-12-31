import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Plus, LogOut, Music2 } from 'lucide-react';
import { TimelineList } from './TimelineList';
import { TimelineEditor } from './TimelineEditor';
import { TimelineViewer } from './TimelineViewer';
import { SpotifyConnect } from './SpotifyConnect';
import { signOut } from '../utils/auth';
import { getTimelines, deleteTimeline } from '../utils/api';
import type { User } from '../utils/auth';
import type { Timeline } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface DashboardProps {
  user: User;
  onSignOut: () => void;
}

type View = 'list' | 'create' | 'edit' | 'view' | 'settings';

export function Dashboard({ user, onSignOut }: DashboardProps) {
  const [view, setView] = useState<View>('list');
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [currentTimeline, setCurrentTimeline] = useState<Timeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [spotifyConnected, setSpotifyConnected] = useState(false);

  useEffect(() => {
    loadTimelines();
  }, []);

  async function loadTimelines() {
    try {
      setLoading(true);
      const data = await getTimelines();
      setTimelines(data);
    } catch (error) {
      console.error('Error loading timelines:', error);
      toast.error('Erro ao carregar timelines');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      onSignOut();
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Erro ao fazer logout');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja deletar esta timeline?')) {
      return;
    }
    
    try {
      await deleteTimeline(id);
      await loadTimelines();
      toast.success('Timeline deletada com sucesso');
    } catch (error) {
      console.error('Error deleting timeline:', error);
      toast.error('Erro ao deletar timeline');
    }
  }

  function handleView(timeline: Timeline) {
    setCurrentTimeline(timeline);
    setView('view');
  }

  function handleEdit(timeline: Timeline) {
    setCurrentTimeline(timeline);
    setView('edit');
  }

  async function handleSaveSuccess() {
    await loadTimelines();
    setView('list');
    setCurrentTimeline(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Music2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white text-xl">Timeline Musical</h1>
                <p className="text-purple-200 text-sm">Olá, {user.name}!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setView(view === 'settings' ? 'list' : 'settings')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {view === 'settings' ? 'Voltar' : 'Configurações'}
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {view === 'list' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-2xl mb-1">Minhas Timelines</h2>
                <p className="text-purple-200">
                  {timelines.length === 0 
                    ? 'Nenhuma timeline criada ainda' 
                    : `${timelines.length} timeline${timelines.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <Button
                onClick={() => setView('create')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Timeline
              </Button>
            </div>

            <TimelineList
              timelines={timelines}
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}

        {view === 'create' && (
          <TimelineEditor
            onCancel={() => setView('list')}
            onSave={handleSaveSuccess}
          />
        )}

        {view === 'edit' && currentTimeline && (
          <TimelineEditor
            timeline={currentTimeline}
            onCancel={() => {
              setView('list');
              setCurrentTimeline(null);
            }}
            onSave={handleSaveSuccess}
          />
        )}

        {view === 'view' && currentTimeline && (
          <TimelineViewer
            timeline={currentTimeline}
            onBack={() => {
              setView('list');
              setCurrentTimeline(null);
            }}
            onEdit={() => setView('edit')}
            useWebPlayer={spotifyConnected}
          />
        )}

        {view === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-white text-2xl mb-6">Configurações</h2>
            <div className="space-y-6">
              <SpotifyConnect onConnectionChange={setSpotifyConnected} />
              
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6">
                <h3 className="text-white mb-3">Sobre a integração com Spotify</h3>
                <div className="text-purple-200 text-sm space-y-2">
                  <p>
                    • <strong>Sem conexão:</strong> As músicas serão exibidas usando o player embed do Spotify (modo visualização)
                  </p>
                  <p>
                    • <strong>Com conexão:</strong> Você pode reproduzir músicas diretamente com controles completos de play, pause, volume e navegação
                  </p>
                  <p className="mt-4 text-purple-300">
                    💡 Para conectar sua conta do Spotify, você precisa ter o Spotify Premium
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
