import React, { useState, useEffect } from "react";

const BOARD_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const SPEED = 150;

function getRandomFoodPosition(snake) {
  while (true) {
    const x = Math.floor(Math.random() * BOARD_SIZE);
    const y = Math.floor(Math.random() * BOARD_SIZE);

    const isOnSnake = snake.some((segment) => segment.x === x && segment.y === y);
    if (!isOnSnake) {
      return { x, y };
    }
  }
}

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(getRandomFoodPosition(INITIAL_SNAKE));
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;

      let newDirection = direction;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (direction.y === 0) newDirection = { x: 0, y: -1 };
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (direction.y === 0) newDirection = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (direction.x === 0) newDirection = { x: -1, y: 0 };
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (direction.x === 0) newDirection = { x: 1, y: 0 };
          break;
        default:
          return;
      }

      e.preventDefault();
      setDirection(newDirection);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const intervalId = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };

        if (
          newHead.x < 0 ||
          newHead.x >= BOARD_SIZE ||
          newHead.y < 0 ||
          newHead.y >= BOARD_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        const hitsSelf = prevSnake.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y
        );
        if (hitsSelf) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setFood(getRandomFoodPosition(newSnake));
          setScore((s) => s + 1);
          return newSnake;
        } else {
          newSnake.pop();
          return newSnake;
        }
      });
    }, SPEED);

    return () => clearInterval(intervalId);
  }, [direction, food, gameOver]);

  const handleRestart = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(getRandomFoodPosition(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
  };

  const cells = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const isSnake = snake.some((segment) => segment.x === x && segment.y === y);
      const isHead = snake[0].x === x && snake[0].y === y;
      const isFood = food.x === x && food.y === y;

      let className = "cell";
      if (isSnake) className += " cell-snake";
      if (isHead) className += " cell-head";
      if (isFood) className += " cell-food";

      cells.push(<div key={`${x}-${y}`} className={className} />);
    }
  }

  return (
    <div className="snake-wrapper">
      <h1>React Snake 🐍</h1>
      <div className="info">
        <span>Score: {score}</span>
        {gameOver && <span className="game-over">Game Over!</span>}
      </div>

      <div
        className="board"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 20px)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 20px)`,
        }}
      >
        {cells}
      </div>

      <button onClick={handleRestart} className="restart-btn">
        {gameOver ? "Play again" : "Restart"}
      </button>

      <p className="hint">Use Arrow Keys or WASD to move.</p>
    </div>
  );
};

export default SnakeGame;
