import { Direction, Position, GameState, GameMode } from '@/types/game';

export const GRID_SIZE = 20;
export const CELL_SIZE = 20;
export const INITIAL_SPEED = 150;

export const getOppositeDirection = (direction: Direction): Direction => {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[direction];
};

export const isOppositeDirection = (current: Direction, next: Direction): boolean => {
  return getOppositeDirection(current) === next;
};

export const getNextPosition = (
  head: Position,
  direction: Direction,
  mode: GameMode
): Position => {
  const moves: Record<Direction, Position> = {
    UP: { x: head.x, y: head.y - 1 },
    DOWN: { x: head.x, y: head.y + 1 },
    LEFT: { x: head.x - 1, y: head.y },
    RIGHT: { x: head.x + 1, y: head.y },
  };

  let newPos = moves[direction];

  if (mode === 'pass-through') {
    // Wrap around the grid
    if (newPos.x < 0) newPos.x = GRID_SIZE - 1;
    if (newPos.x >= GRID_SIZE) newPos.x = 0;
    if (newPos.y < 0) newPos.y = GRID_SIZE - 1;
    if (newPos.y >= GRID_SIZE) newPos.y = 0;
  }

  return newPos;
};

export const checkWallCollision = (position: Position): boolean => {
  return (
    position.x < 0 ||
    position.x >= GRID_SIZE ||
    position.y < 0 ||
    position.y >= GRID_SIZE
  );
};

export const checkSelfCollision = (head: Position, body: Position[]): boolean => {
  return body.some((segment, index) => {
    // Skip the last segment as it will move away
    if (index === body.length - 1) return false;
    return segment.x === head.x && segment.y === head.y;
  });
};

export const generateFood = (snake: Position[]): Position => {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
};

export const createInitialState = (mode: GameMode): GameState => {
  const initialSnake: Position[] = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];

  return {
    snake: initialSnake,
    food: generateFood(initialSnake),
    direction: 'RIGHT',
    score: 0,
    isGameOver: false,
    isPaused: false,
    mode,
  };
};

export const moveSnake = (state: GameState): GameState => {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const head = state.snake[0];
  const newHead = getNextPosition(head, state.direction, state.mode);

  // Check wall collision in walls mode
  if (state.mode === 'walls' && checkWallCollision(newHead)) {
    return { ...state, isGameOver: true };
  }

  // Check self collision
  if (checkSelfCollision(newHead, state.snake)) {
    return { ...state, isGameOver: true };
  }

  // Check if food is eaten
  const ateFood = newHead.x === state.food.x && newHead.y === state.food.y;

  // Create new snake
  const newSnake = [newHead, ...state.snake];
  if (!ateFood) {
    newSnake.pop();
  }

  return {
    ...state,
    snake: newSnake,
    food: ateFood ? generateFood(newSnake) : state.food,
    score: ateFood ? state.score + 10 : state.score,
  };
};

export const changeDirection = (
  state: GameState,
  newDirection: Direction
): GameState => {
  if (isOppositeDirection(state.direction, newDirection)) {
    return state;
  }
  return { ...state, direction: newDirection };
};

export const getSpeedForScore = (score: number): number => {
  // Speed increases as score goes up (lower interval = faster)
  const speedIncrease = Math.floor(score / 50) * 10;
  return Math.max(INITIAL_SPEED - speedIncrease, 50);
};

export const keyToDirection = (key: string): Direction | null => {
  const mapping: Record<string, Direction> = {
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
    w: 'UP',
    W: 'UP',
    s: 'DOWN',
    S: 'DOWN',
    a: 'LEFT',
    A: 'LEFT',
    d: 'RIGHT',
    D: 'RIGHT',
  };
  return mapping[key] || null;
};
