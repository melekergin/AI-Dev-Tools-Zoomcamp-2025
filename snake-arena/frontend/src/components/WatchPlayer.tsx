import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LivePlayer, Direction, Position } from '@/types/game';
import GameBoard from './GameBoard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, Shield } from 'lucide-react';
import api from '@/lib/api';
import { GRID_SIZE } from '@/lib/gameLogic';

interface WatchPlayerProps {
  playerId: string;
  onBack: () => void;
}

const WatchPlayer: React.FC<WatchPlayerProps> = ({ playerId, onBack }) => {
  const [player, setPlayer] = useState<LivePlayer | null>(null);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate player movement
  const simulatePlayerMovement = useCallback(() => {
    if (!player || !player.isPlaying) return;

    setPlayer(prev => {
      if (!prev) return prev;

      const head = prev.snake[0];
      let newDirection = prev.direction;

      // Randomly change direction sometimes
      if (Math.random() < 0.1) {
        const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        const validDirections = directions.filter(d => {
          if (d === 'UP' && prev.direction === 'DOWN') return false;
          if (d === 'DOWN' && prev.direction === 'UP') return false;
          if (d === 'LEFT' && prev.direction === 'RIGHT') return false;
          if (d === 'RIGHT' && prev.direction === 'LEFT') return false;
          return true;
        });
        newDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
      }

      // Calculate new head position
      let newHead: Position;
      switch (newDirection) {
        case 'UP':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'DOWN':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'LEFT':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'RIGHT':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Handle wrapping for pass-through mode or reset for walls mode
      if (prev.mode === 'pass-through') {
        if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
        if (newHead.x >= GRID_SIZE) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
        if (newHead.y >= GRID_SIZE) newHead.y = 0;
      } else {
        // In walls mode, avoid walls
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          // Turn to avoid wall
          const safeDirections = ['UP', 'DOWN', 'LEFT', 'RIGHT'].filter(d => {
            let testPos: Position;
            switch (d) {
              case 'UP': testPos = { x: head.x, y: head.y - 1 }; break;
              case 'DOWN': testPos = { x: head.x, y: head.y + 1 }; break;
              case 'LEFT': testPos = { x: head.x - 1, y: head.y }; break;
              case 'RIGHT': testPos = { x: head.x + 1, y: head.y }; break;
              default: return false;
            }
            return testPos.x >= 0 && testPos.x < GRID_SIZE && testPos.y >= 0 && testPos.y < GRID_SIZE;
          }) as Direction[];
          
          if (safeDirections.length > 0) {
            newDirection = safeDirections[Math.floor(Math.random() * safeDirections.length)];
            switch (newDirection) {
              case 'UP': newHead = { x: head.x, y: head.y - 1 }; break;
              case 'DOWN': newHead = { x: head.x, y: head.y + 1 }; break;
              case 'LEFT': newHead = { x: head.x - 1, y: head.y }; break;
              case 'RIGHT': newHead = { x: head.x + 1, y: head.y }; break;
            }
          }
        }
      }

      // Check if food is eaten
      const ateFood = newHead.x === prev.food.x && newHead.y === prev.food.y;
      const newSnake = [newHead, ...prev.snake];
      if (!ateFood) {
        newSnake.pop();
      }

      // Generate new food if eaten
      let newFood = prev.food;
      if (ateFood) {
        do {
          newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          };
        } while (newSnake.some(s => s.x === newFood.x && s.y === newFood.y));
      }

      return {
        ...prev,
        snake: newSnake,
        food: newFood,
        direction: newDirection,
        score: ateFood ? prev.score + 10 : prev.score,
      };
    });
  }, [player]);

  // Fetch initial player data
  useEffect(() => {
    const fetchPlayer = async () => {
      const response = await api.getLivePlayer(playerId);
      if (response.success && response.data) {
        setPlayer(response.data);
      }
    };
    fetchPlayer();
  }, [playerId]);

  // Start simulation
  useEffect(() => {
    if (player) {
      simulationRef.current = setInterval(simulatePlayerMovement, 150);
    }

    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
    };
  }, [player, simulatePlayerMovement]);

  if (!player) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading player...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-foreground">{player.username}</span>
          </div>
          <div className="flex items-center gap-1">
            {player.mode === 'walls' 
              ? <Shield className="w-4 h-4 text-primary" />
              : <Zap className="w-4 h-4 text-secondary" />
            }
            <span className="text-muted-foreground text-sm capitalize">{player.mode}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Live Score</p>
          <p className="font-pixel text-3xl text-secondary neon-text-cyan">{player.score}</p>
        </div>

        <GameBoard
          snake={player.snake}
          food={player.food}
          direction={player.direction}
          isGameOver={false}
          isWatching
        />

        <p className="text-muted-foreground text-sm text-center">
          Watching {player.username} play live
        </p>
      </div>
    </div>
  );
};

export default WatchPlayer;
