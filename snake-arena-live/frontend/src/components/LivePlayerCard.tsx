import React from 'react';
import { LivePlayer } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Eye, Zap, Shield } from 'lucide-react';

interface LivePlayerCardProps {
  player: LivePlayer;
  onWatch: (playerId: string) => void;
}

const LivePlayerCard: React.FC<LivePlayerCardProps> = ({ player, onWatch }) => {
  return (
    <div className="bg-card/50 border border-border/50 rounded-lg p-4 hover:border-secondary/50 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-semibold text-foreground">{player.username}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          {player.mode === 'walls' 
            ? <Shield className="w-4 h-4 text-primary" />
            : <Zap className="w-4 h-4 text-secondary" />
          }
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="font-pixel text-primary text-lg">{player.score}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onWatch(player.id)}
          className="group"
        >
          <Eye className="w-4 h-4 mr-1 group-hover:text-secondary transition-colors" />
          Watch
        </Button>
      </div>
    </div>
  );
};

export default LivePlayerCard;
