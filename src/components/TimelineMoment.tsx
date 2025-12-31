import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { SpotifyPlayer } from "./SpotifyPlayer";
import type { Moment } from "./MusicTimeline";

interface TimelineMomentProps {
  moment: Moment;
  isLast?: boolean;
  useWebPlayer?: boolean;
}

export function TimelineMoment({ moment, isLast, useWebPlayer = false }: TimelineMomentProps) {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl hover:shadow-2xl transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                Momento {moment.id}
              </Badge>
            </div>
            <CardTitle className="text-white">{moment.label}</CardTitle>
            <CardDescription className="text-purple-200 mt-2">
              {moment.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {moment.songs.length === 1 ? (
          <SpotifyPlayer song={moment.songs[0]} useWebPlayer={useWebPlayer} />
        ) : (
          <Carousel className="w-full">
            <CarouselContent>
              {moment.songs.map((song) => (
                <CarouselItem key={song.id}>
                  <SpotifyPlayer song={song} useWebPlayer={useWebPlayer} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-white/20 border-white/30 text-white hover:bg-white/30" />
            <CarouselNext className="bg-white/20 border-white/30 text-white hover:bg-white/30" />
          </Carousel>
        )}
        
        {moment.songs.length > 1 && (
          <p className="text-center text-purple-200 text-sm mt-4">
            {moment.songs.length} músicas disponíveis • Use as setas para navegar
          </p>
        )}
      </CardContent>
    </Card>
  );
}
