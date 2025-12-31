import { TimelineMoment } from "./TimelineMoment";
import { Music2 } from "lucide-react";

export interface Song {
  id: string;
  title: string;
  artist: string;
  spotifyUri: string;
}

export interface Moment {
  id: number;
  label: string;
  description: string;
  songs: Song[];
}

interface MusicTimelineProps {
  moments?: Moment[];
  useWebPlayer?: boolean;
}

export function MusicTimeline({ moments = [], useWebPlayer = false }: MusicTimelineProps) {
  if (moments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-purple-200">Nenhum momento adicionado ainda</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        {/* Linha vertical da timeline */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 via-pink-400 to-blue-400"></div>
        
        {/* Momentos da timeline */}
        <div className="space-y-12">
          {moments.map((moment, index) => (
            <div key={moment.id} className="relative">
              {/* Ícone do momento */}
              <div className="absolute left-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg border-4 border-purple-900">
                <Music2 className="w-8 h-8 text-white" />
              </div>
              
              {/* Conteúdo do momento */}
              <div className="ml-24">
                <TimelineMoment 
                  moment={moment}
                  isLast={index === moments.length - 1}
                  useWebPlayer={useWebPlayer}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
