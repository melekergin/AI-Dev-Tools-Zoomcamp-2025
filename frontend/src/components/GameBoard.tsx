import React from 'react';
import { Position, Direction } from '@/types/game';
import { GRID_SIZE, CELL_SIZE } from '@/lib/gameLogic';

interface GameBoardProps {
  snake: Position[];
  food: Position;
  direction: Direction;
  isGameOver: boolean;
  isWatching?: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ snake, food, direction, isGameOver, isWatching }) => {
  const getRotation = (dir: Direction): string => {
    switch (dir) {
      case 'UP': return 'rotate-[-90deg]';
      case 'DOWN': return 'rotate-[90deg]';
      case 'LEFT': return 'rotate-[180deg]';
      case 'RIGHT': return 'rotate-0';
    }
  };

  return (
    <div 
      className={`relative game-grid rounded-lg border-2 ${isGameOver ? 'border-destructive' : 'border-primary/50'} ${isWatching ? 'opacity-90' : ''}`}
      style={{ 
        width: GRID_SIZE * CELL_SIZE, 
        height: GRID_SIZE * CELL_SIZE,
        boxShadow: isGameOver 
          ? '0 0 20px hsl(var(--destructive) / 0.5)' 
          : '0 0 20px hsl(var(--primary) / 0.3), inset 0 0 40px hsl(var(--primary) / 0.1)'
      }}
    >
      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines opacity-20 pointer-events-none z-10" />
      
      {/* Snake */}
      {snake.map((segment, index) => (
        <div
          key={index}
          className={`absolute transition-all duration-75 ${
            index === 0 
              ? 'rounded-md z-20' 
              : 'rounded-sm z-10'
          }`}
          style={{
            left: segment.x * CELL_SIZE,
            top: segment.y * CELL_SIZE,
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
            margin: 1,
            backgroundColor: index === 0 
              ? 'hsl(var(--snake))' 
              : `hsl(142 ${100 - index * 3}% ${50 - index * 2}%)`,
            boxShadow: index === 0 
              ? '0 0 10px hsl(var(--snake)), 0 0 20px hsl(var(--snake-glow) / 0.5)' 
              : '0 0 5px hsl(var(--snake) / 0.5)',
          }}
        >
          {/* Head eyes */}
          {index === 0 && (
            <div className={`absolute inset-0 flex items-center justify-center ${getRotation(direction)}`}>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-background" />
                <div className="w-1.5 h-1.5 rounded-full bg-background" />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Food */}
      <div
        className="absolute rounded-full animate-pulse-neon z-10"
        style={{
          left: food.x * CELL_SIZE + 2,
          top: food.y * CELL_SIZE + 2,
          width: CELL_SIZE - 4,
          height: CELL_SIZE - 4,
          backgroundColor: 'hsl(var(--food))',
          boxShadow: '0 0 10px hsl(var(--food)), 0 0 20px hsl(var(--food-glow) / 0.7)',
        }}
      />

      {/* Game Over Overlay */}
      {isGameOver && !isWatching && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-30 rounded-lg">
          <div className="text-center">
            <h2 className="font-pixel text-destructive text-xl neon-text mb-2" style={{ textShadow: '0 0 10px hsl(var(--destructive))' }}>
              GAME OVER
            </h2>
            <p className="text-muted-foreground text-sm">Press SPACE to restart</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
