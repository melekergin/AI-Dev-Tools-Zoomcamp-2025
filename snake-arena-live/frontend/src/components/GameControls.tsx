import React from 'react';
import { Button } from '@/components/ui/button';
import { GameMode } from '@/types/game';
import { Play, Pause, RotateCcw, Zap, Shield } from 'lucide-react';

interface GameControlsProps {
  isPaused: boolean;
  isGameOver: boolean;
  mode: GameMode;
  score: number;
  onPause: () => void;
  onRestart: () => void;
  onModeChange: (mode: GameMode) => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  isPaused,
  isGameOver,
  mode,
  score,
  onPause,
  onRestart,
  onModeChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Score Display */}
      <div className="text-center">
        <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Score</p>
        <p className="font-pixel text-3xl text-primary neon-text">{score}</p>
      </div>

      {/* Mode Selection */}
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs uppercase tracking-widest text-center">Game Mode</p>
        <div className="flex gap-2">
          <Button
            variant={mode === 'walls' ? 'neon' : 'outline'}
            size="sm"
            onClick={() => onModeChange('walls')}
            className="flex-1"
          >
            <Shield className="w-4 h-4 mr-1" />
            Walls
          </Button>
          <Button
            variant={mode === 'pass-through' ? 'neonCyan' : 'outline'}
            size="sm"
            onClick={() => onModeChange('pass-through')}
            className="flex-1"
          >
            <Zap className="w-4 h-4 mr-1" />
            Portal
          </Button>
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex gap-2">
        {!isGameOver && (
          <Button
            variant="outline"
            onClick={onPause}
            className="flex-1"
          >
            {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        )}
        <Button
          variant="neonPink"
          onClick={onRestart}
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Restart
        </Button>
      </div>

      {/* Controls Help */}
      <div className="text-center text-muted-foreground text-xs mt-4 space-y-1">
        <p>↑ ↓ ← → or WASD to move</p>
        <p>SPACE to pause/restart</p>
      </div>
    </div>
  );
};

export default GameControls;
