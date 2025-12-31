import { Button } from './ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { MusicTimeline } from './MusicTimeline';
import type { Timeline } from '../utils/api';

interface TimelineViewerProps {
  timeline: Timeline;
  onBack: () => void;
  onEdit: () => void;
  useWebPlayer?: boolean;
}

export function TimelineViewer({ timeline, onBack, onEdit, useWebPlayer = false }: TimelineViewerProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button
          onClick={onEdit}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-white mb-3">{timeline.title}</h1>
        {timeline.description && (
          <p className="text-purple-200 max-w-2xl mx-auto">
            {timeline.description}
          </p>
        )}
      </div>

      <MusicTimeline moments={timeline.moments} useWebPlayer={useWebPlayer} />
    </div>
  );
}
