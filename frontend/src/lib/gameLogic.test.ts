import { describe, it, expect } from 'vitest';
import {
  getOppositeDirection,
  isOppositeDirection,
  getNextPosition,
  checkWallCollision,
  checkSelfCollision,
  generateFood,
  createInitialState,
  moveSnake,
  changeDirection,
  getSpeedForScore,
  keyToDirection,
  GRID_SIZE,
} from './gameLogic';
import { Direction, Position, GameState } from '@/types/game';

describe('getOppositeDirection', () => {
  it('returns DOWN for UP', () => {
    expect(getOppositeDirection('UP')).toBe('DOWN');
  });

  it('returns UP for DOWN', () => {
    expect(getOppositeDirection('DOWN')).toBe('UP');
  });

  it('returns RIGHT for LEFT', () => {
    expect(getOppositeDirection('LEFT')).toBe('RIGHT');
  });

  it('returns LEFT for RIGHT', () => {
    expect(getOppositeDirection('RIGHT')).toBe('LEFT');
  });
});

describe('isOppositeDirection', () => {
  it('returns true for opposite directions', () => {
    expect(isOppositeDirection('UP', 'DOWN')).toBe(true);
    expect(isOppositeDirection('LEFT', 'RIGHT')).toBe(true);
  });

  it('returns false for non-opposite directions', () => {
    expect(isOppositeDirection('UP', 'LEFT')).toBe(false);
    expect(isOppositeDirection('UP', 'RIGHT')).toBe(false);
    expect(isOppositeDirection('UP', 'UP')).toBe(false);
  });
});

describe('getNextPosition', () => {
  const head: Position = { x: 10, y: 10 };

  describe('walls mode', () => {
    it('moves up correctly', () => {
      expect(getNextPosition(head, 'UP', 'walls')).toEqual({ x: 10, y: 9 });
    });

    it('moves down correctly', () => {
      expect(getNextPosition(head, 'DOWN', 'walls')).toEqual({ x: 10, y: 11 });
    });

    it('moves left correctly', () => {
      expect(getNextPosition(head, 'LEFT', 'walls')).toEqual({ x: 9, y: 10 });
    });

    it('moves right correctly', () => {
      expect(getNextPosition(head, 'RIGHT', 'walls')).toEqual({ x: 11, y: 10 });
    });
  });

  describe('pass-through mode', () => {
    it('wraps around when going left from x=0', () => {
      const edgeHead: Position = { x: 0, y: 10 };
      expect(getNextPosition(edgeHead, 'LEFT', 'pass-through')).toEqual({ x: GRID_SIZE - 1, y: 10 });
    });

    it('wraps around when going right from x=GRID_SIZE-1', () => {
      const edgeHead: Position = { x: GRID_SIZE - 1, y: 10 };
      expect(getNextPosition(edgeHead, 'RIGHT', 'pass-through')).toEqual({ x: 0, y: 10 });
    });

    it('wraps around when going up from y=0', () => {
      const edgeHead: Position = { x: 10, y: 0 };
      expect(getNextPosition(edgeHead, 'UP', 'pass-through')).toEqual({ x: 10, y: GRID_SIZE - 1 });
    });

    it('wraps around when going down from y=GRID_SIZE-1', () => {
      const edgeHead: Position = { x: 10, y: GRID_SIZE - 1 };
      expect(getNextPosition(edgeHead, 'DOWN', 'pass-through')).toEqual({ x: 10, y: 0 });
    });
  });
});

describe('checkWallCollision', () => {
  it('returns true when position is outside grid on the left', () => {
    expect(checkWallCollision({ x: -1, y: 10 })).toBe(true);
  });

  it('returns true when position is outside grid on the right', () => {
    expect(checkWallCollision({ x: GRID_SIZE, y: 10 })).toBe(true);
  });

  it('returns true when position is outside grid on the top', () => {
    expect(checkWallCollision({ x: 10, y: -1 })).toBe(true);
  });

  it('returns true when position is outside grid on the bottom', () => {
    expect(checkWallCollision({ x: 10, y: GRID_SIZE })).toBe(true);
  });

  it('returns false when position is inside grid', () => {
    expect(checkWallCollision({ x: 10, y: 10 })).toBe(false);
    expect(checkWallCollision({ x: 0, y: 0 })).toBe(false);
    expect(checkWallCollision({ x: GRID_SIZE - 1, y: GRID_SIZE - 1 })).toBe(false);
  });
});

describe('checkSelfCollision', () => {
  it('returns true when head collides with body', () => {
    const head: Position = { x: 5, y: 5 };
    const body: Position[] = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];
    expect(checkSelfCollision(head, body)).toBe(true);
  });

  it('returns false when head does not collide with body', () => {
    const head: Position = { x: 6, y: 5 };
    const body: Position[] = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];
    expect(checkSelfCollision(head, body)).toBe(false);
  });

  it('ignores the last segment (tail)', () => {
    const head: Position = { x: 3, y: 5 };
    const body: Position[] = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 }, // Last segment
    ];
    expect(checkSelfCollision(head, body)).toBe(false);
  });
});

describe('generateFood', () => {
  it('generates food not on the snake', () => {
    const snake: Position[] = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    const food = generateFood(snake);
    const isOnSnake = snake.some(s => s.x === food.x && s.y === food.y);
    expect(isOnSnake).toBe(false);
  });

  it('generates food within grid bounds', () => {
    const snake: Position[] = [{ x: 10, y: 10 }];
    const food = generateFood(snake);
    expect(food.x).toBeGreaterThanOrEqual(0);
    expect(food.x).toBeLessThan(GRID_SIZE);
    expect(food.y).toBeGreaterThanOrEqual(0);
    expect(food.y).toBeLessThan(GRID_SIZE);
  });
});

describe('createInitialState', () => {
  it('creates initial state with correct mode', () => {
    const wallsState = createInitialState('walls');
    expect(wallsState.mode).toBe('walls');

    const passThroughState = createInitialState('pass-through');
    expect(passThroughState.mode).toBe('pass-through');
  });

  it('creates initial snake with 3 segments', () => {
    const state = createInitialState('walls');
    expect(state.snake.length).toBe(3);
  });

  it('starts with score 0', () => {
    const state = createInitialState('walls');
    expect(state.score).toBe(0);
  });

  it('starts with game not over', () => {
    const state = createInitialState('walls');
    expect(state.isGameOver).toBe(false);
  });

  it('starts with game not paused', () => {
    const state = createInitialState('walls');
    expect(state.isPaused).toBe(false);
  });

  it('starts moving right', () => {
    const state = createInitialState('walls');
    expect(state.direction).toBe('RIGHT');
  });
});

describe('moveSnake', () => {
  it('does not move when game is over', () => {
    const state = createInitialState('walls');
    state.isGameOver = true;
    const originalSnake = [...state.snake];
    const newState = moveSnake(state);
    expect(newState.snake).toEqual(originalSnake);
  });

  it('does not move when game is paused', () => {
    const state = createInitialState('walls');
    state.isPaused = true;
    const originalSnake = [...state.snake];
    const newState = moveSnake(state);
    expect(newState.snake).toEqual(originalSnake);
  });

  it('moves snake in the correct direction', () => {
    const state = createInitialState('walls');
    state.direction = 'RIGHT';
    const headBefore = state.snake[0];
    const newState = moveSnake(state);
    expect(newState.snake[0].x).toBe(headBefore.x + 1);
    expect(newState.snake[0].y).toBe(headBefore.y);
  });

  it('game over on wall collision in walls mode', () => {
    const state = createInitialState('walls');
    state.snake = [
      { x: GRID_SIZE - 1, y: 10 },
      { x: GRID_SIZE - 2, y: 10 },
    ];
    state.direction = 'RIGHT';
    const newState = moveSnake(state);
    expect(newState.isGameOver).toBe(true);
  });

  it('wraps around in pass-through mode', () => {
    const state = createInitialState('pass-through');
    state.snake = [
      { x: GRID_SIZE - 1, y: 10 },
      { x: GRID_SIZE - 2, y: 10 },
    ];
    state.direction = 'RIGHT';
    const newState = moveSnake(state);
    expect(newState.isGameOver).toBe(false);
    expect(newState.snake[0].x).toBe(0);
  });

  it('increases score when eating food', () => {
    const state = createInitialState('walls');
    state.food = { x: 11, y: 10 }; // Right in front of snake
    state.direction = 'RIGHT';
    const newState = moveSnake(state);
    expect(newState.score).toBe(10);
  });

  it('grows snake when eating food', () => {
    const state = createInitialState('walls');
    const originalLength = state.snake.length;
    state.food = { x: 11, y: 10 }; // Right in front of snake
    state.direction = 'RIGHT';
    const newState = moveSnake(state);
    expect(newState.snake.length).toBe(originalLength + 1);
  });

  it('generates new food when eating', () => {
    const state = createInitialState('walls');
    state.food = { x: 11, y: 10 };
    state.direction = 'RIGHT';
    const newState = moveSnake(state);
    expect(newState.food).not.toEqual({ x: 11, y: 10 });
  });
});

describe('changeDirection', () => {
  it('changes direction to a valid direction', () => {
    const state = createInitialState('walls');
    state.direction = 'RIGHT';
    const newState = changeDirection(state, 'UP');
    expect(newState.direction).toBe('UP');
  });

  it('does not change to opposite direction', () => {
    const state = createInitialState('walls');
    state.direction = 'RIGHT';
    const newState = changeDirection(state, 'LEFT');
    expect(newState.direction).toBe('RIGHT');
  });
});

describe('getSpeedForScore', () => {
  it('returns initial speed for score 0', () => {
    expect(getSpeedForScore(0)).toBe(150);
  });

  it('increases speed as score increases', () => {
    expect(getSpeedForScore(50)).toBeLessThan(getSpeedForScore(0));
  });

  it('has a minimum speed limit', () => {
    expect(getSpeedForScore(10000)).toBe(50);
  });
});

describe('keyToDirection', () => {
  it('maps arrow keys correctly', () => {
    expect(keyToDirection('ArrowUp')).toBe('UP');
    expect(keyToDirection('ArrowDown')).toBe('DOWN');
    expect(keyToDirection('ArrowLeft')).toBe('LEFT');
    expect(keyToDirection('ArrowRight')).toBe('RIGHT');
  });

  it('maps WASD keys correctly', () => {
    expect(keyToDirection('w')).toBe('UP');
    expect(keyToDirection('W')).toBe('UP');
    expect(keyToDirection('s')).toBe('DOWN');
    expect(keyToDirection('a')).toBe('LEFT');
    expect(keyToDirection('d')).toBe('RIGHT');
  });

  it('returns null for invalid keys', () => {
    expect(keyToDirection('x')).toBe(null);
    expect(keyToDirection('Enter')).toBe(null);
  });
});
