import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Eye, Edit, Trash2, Music } from 'lucide-react';
import type { Timeline } from '../utils/api';

interface TimelineListProps {
  timelines: Timeline[];
  loading: boolean;
  onView: (timeline: Timeline) => void;
  onEdit: (timeline: Timeline) => void;
  onDelete: (id: string) => void;
}

export function TimelineList({ timelines, loading, onView, onEdit, onDelete }: TimelineListProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-white">Carregando timelines...</p>
      </div>
    );
  }

  if (timelines.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="py-12 text-center">
          <Music className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <p className="text-white mb-2">Nenhuma timeline criada ainda</p>
          <p className="text-purple-200 text-sm">
            Clique em "Nova Timeline" para criar sua primeira história musical
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {timelines.map((timeline) => (
        <Card key={timeline.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:border-white/40 transition-all">
          <CardHeader>
            <CardTitle className="text-white">{timeline.title}</CardTitle>
            <CardDescription className="text-purple-200">
              {timeline.description || 'Sem descrição'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-purple-200 text-sm mb-4">
              {timeline.moments?.length || 0} momento{(timeline.moments?.length || 0) !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => onView(timeline)}
                size="sm"
                className="flex-1 bg-white/10 hover:bg-white/20 text-white"
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver
              </Button>
              <Button
                onClick={() => onEdit(timeline)}
                size="sm"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => onDelete(timeline.id)}
                size="sm"
                variant="outline"
                className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-300/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
