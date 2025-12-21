import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameBoard from './GameBoard';
import GameControls from './GameControls';
import { GameState, GameMode, Direction } from '@/types/game';
import {
  createInitialState,
  moveSnake,
  changeDirection,
  keyToDirection,
  getSpeedForScore,
} from '@/lib/gameLogic';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';

const SnakeGame: React.FC = () => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>(() => createInitialState('walls'));
  const [pendingDirection, setPendingDirection] = useState<Direction | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const lastScoreSubmitted = useRef<number>(0);

  const handleModeChange = useCallback((mode: GameMode) => {
    setGameState(createInitialState(mode));
    setPendingDirection(null);
  }, []);

  const handleRestart = useCallback(() => {
    setGameState(createInitialState(gameState.mode));
    setPendingDirection(null);
    lastScoreSubmitted.current = 0;
  }, [gameState.mode]);

  const handlePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // Handle key presses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        if (gameState.isGameOver) {
          handleRestart();
        } else {
          handlePause();
        }
        return;
      }

      const direction = keyToDirection(e.key);
      if (direction) {
        e.preventDefault();
        setPendingDirection(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isGameOver, handlePause, handleRestart]);

  // Apply pending direction
  useEffect(() => {
    if (pendingDirection) {
      setGameState(prev => changeDirection(prev, pendingDirection));
      setPendingDirection(null);
    }
  }, [pendingDirection]);

  // Game loop
  useEffect(() => {
    if (gameState.isGameOver || gameState.isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const speed = getSpeedForScore(gameState.score);

    gameLoopRef.current = setInterval(() => {
      setGameState(prev => moveSnake(prev));
    }, speed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.isGameOver, gameState.isPaused, gameState.score]);

  // Submit score on game over
  useEffect(() => {
    const submitScore = async () => {
      if (gameState.isGameOver && gameState.score > 0 && gameState.score !== lastScoreSubmitted.current) {
        lastScoreSubmitted.current = gameState.score;
        if (user) {
          await api.submitScore(gameState.score, gameState.mode);
          toast.success(`Score submitted: ${gameState.score} points!`);
        } else {
          toast.info('Log in to save your score to the leaderboard!');
        }
      }
    };
    submitScore();
  }, [gameState.isGameOver, gameState.score, gameState.mode, user]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center">
      <GameBoard
        snake={gameState.snake}
        food={gameState.food}
        direction={gameState.direction}
        isGameOver={gameState.isGameOver}
      />
      <div className="w-48">
        <GameControls
          isPaused={gameState.isPaused}
          isGameOver={gameState.isGameOver}
          mode={gameState.mode}
          score={gameState.score}
          onPause={handlePause}
          onRestart={handleRestart}
          onModeChange={handleModeChange}
        />
      </div>
    </div>
  );
};

export default SnakeGame;
