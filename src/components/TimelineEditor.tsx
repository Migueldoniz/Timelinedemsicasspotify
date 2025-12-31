import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Plus, Trash2, Save, X, GripVertical } from 'lucide-react';
import { createTimeline, updateTimeline } from '../utils/api';
import type { Timeline, Moment, Song } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface TimelineEditorProps {
  timeline?: Timeline;
  onCancel: () => void;
  onSave: () => void;
}

export function TimelineEditor({ timeline, onCancel, onSave }: TimelineEditorProps) {
  const [title, setTitle] = useState(timeline?.title || '');
  const [description, setDescription] = useState(timeline?.description || '');
  const [moments, setMoments] = useState<Moment[]>(timeline?.moments || []);
  const [saving, setSaving] = useState(false);

  function addMoment() {
    const newMoment: Moment = {
      id: Date.now(),
      label: '',
      description: '',
      songs: [],
    };
    setMoments([...moments, newMoment]);
  }

  function removeMoment(id: number) {
    setMoments(moments.filter(m => m.id !== id));
  }

  function updateMoment(id: number, updates: Partial<Moment>) {
    setMoments(moments.map(m => m.id === id ? { ...m, ...updates } : m));
  }

  function addSong(momentId: number) {
    const newSong: Song = {
      id: Date.now().toString(),
      title: '',
      artist: '',
      spotifyUri: '',
    };
    
    setMoments(moments.map(m => 
      m.id === momentId 
        ? { ...m, songs: [...m.songs, newSong] }
        : m
    ));
  }

  function removeSong(momentId: number, songId: string) {
    setMoments(moments.map(m => 
      m.id === momentId 
        ? { ...m, songs: m.songs.filter(s => s.id !== songId) }
        : m
    ));
  }

  function updateSong(momentId: number, songId: string, updates: Partial<Song>) {
    // Converter URL do Spotify para URI se necessário
    if (updates.spotifyUri) {
      updates.spotifyUri = convertToSpotifyUri(updates.spotifyUri);
    }
    
    setMoments(moments.map(m => 
      m.id === momentId 
        ? { 
            ...m, 
            songs: m.songs.map(s => 
              s.id === songId ? { ...s, ...updates } : s
            )
          }
        : m
    ));
  }

  function convertToSpotifyUri(input: string): string {
    if (!input) return '';
    
    // Já é um URI válido
    if (input.startsWith('spotify:track:')) {
      return input;
    }
    
    // Converter URL do Spotify para URI
    // Formatos aceitos:
    // https://open.spotify.com/track/ID
    // https://open.spotify.com/intl-pt/track/ID
    // https://open.spotify.com/track/ID?si=...
    // https://open.spotify.com/intl-pt/track/ID?si=...
    const urlMatch = input.match(/spotify\.com\/(?:intl-[a-z]{2}\/)?track\/([a-zA-Z0-9]+)/);
    if (urlMatch && urlMatch[1]) {
      return `spotify:track:${urlMatch[1]}`;
    }
    
    // Se parecer apenas um ID
    if (/^[a-zA-Z0-9]+$/.test(input)) {
      return `spotify:track:${input}`;
    }
    
    return input;
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error('Por favor, adicione um título');
      return;
    }

    setSaving(true);
    try {
      const timelineData = {
        title,
        description,
        moments,
      };

      if (timeline) {
        await updateTimeline(timeline.id, timelineData);
        toast.success('Timeline atualizada com sucesso!');
      } else {
        await createTimeline(timelineData);
        toast.success('Timeline criada com sucesso!');
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving timeline:', error);
      toast.error('Erro ao salvar timeline');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-2xl">
          {timeline ? 'Editar Timeline' : 'Nova Timeline'}
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={onCancel}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Minha Jornada Musical"
              className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a história que você quer contar..."
              className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 mb-6">
        {moments.map((moment, index) => (
          <Card key={moment.id} className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <GripVertical className="w-5 h-5 text-purple-300" />
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg">Momento {index + 1}</CardTitle>
                  </div>
                </div>
                <Button
                  onClick={() => removeMoment(moment.id)}
                  size="sm"
                  variant="ghost"
                  className="text-red-300 hover:text-red-200 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Nome do Momento</Label>
                <Input
                  value={moment.label}
                  onChange={(e) => updateMoment(moment.id, { label: e.target.value })}
                  placeholder="Ex: O Despertar"
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Descrição do Momento</Label>
                <Textarea
                  value={moment.description}
                  onChange={(e) => updateMoment(moment.id, { description: e.target.value })}
                  placeholder="Descreva este momento..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Músicas</Label>
                  <Button
                    onClick={() => addSong(moment.id)}
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Música
                  </Button>
                </div>

                {moment.songs.map((song) => (
                  <div key={song.id} className="bg-white/5 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-purple-200 text-sm">Música</Label>
                      <Button
                        onClick={() => removeSong(moment.id, song.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-300 hover:text-red-200 hover:bg-red-500/20 h-8"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <Input
                      value={song.title}
                      onChange={(e) => updateSong(moment.id, song.id, { title: e.target.value })}
                      placeholder="Nome da música"
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                    />
                    <Input
                      value={song.artist}
                      onChange={(e) => updateSong(moment.id, song.id, { artist: e.target.value })}
                      placeholder="Artista"
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                    />
                    <div className="space-y-1">
                      <Input
                        value={song.spotifyUri}
                        onChange={(e) => updateSong(moment.id, song.id, { spotifyUri: e.target.value })}
                        placeholder="Spotify URI (spotify:track:...)"
                        className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                      />
                      <p className="text-purple-300 text-xs">
                        💡 Cole o link da música do Spotify aqui (será convertido automaticamente)
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-purple-200 text-xs">Minuto de Início</Label>
                        <Input
                          type="number"
                          min="0"
                          value={song.startTimeMinutes || 0}
                          onChange={(e) => updateSong(moment.id, song.id, { startTimeMinutes: parseInt(e.target.value) || 0 })}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-purple-200 text-xs">Segundo de Início</Label>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={song.startTimeSeconds || 0}
                          onChange={(e) => updateSong(moment.id, song.id, { startTimeSeconds: parseInt(e.target.value) || 0 })}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {moment.songs.length === 0 && (
                  <p className="text-purple-300 text-sm text-center py-4">
                    Nenhuma música adicionada ainda
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        onClick={addMoment}
        className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
        variant="outline"
      >
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Momento
      </Button>
    </div>
  );
}
