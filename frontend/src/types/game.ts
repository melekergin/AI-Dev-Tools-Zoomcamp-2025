export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameMode = 'walls' | 'pass-through';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
  mode: GameMode;
}

export interface User {
  id: string;
  username: string;
  email: string;
  highScore: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  mode: GameMode;
  playedAt: string;
}

export interface LivePlayer {
  id: string;
  username: string;
  score: number;
  mode: GameMode;
  snake: Position[];
  food: Position;
  direction: Direction;
  isPlaying: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
