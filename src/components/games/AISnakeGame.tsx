import React, { useEffect, useCallback, useRef } from "react";
import {
  GameEngineProps,
  GameState as BaseGameState,
  GameEvent,
  ControlState,
} from "../../types/gameTypes";

interface SnakeGameState extends BaseGameState {
  snake: SnakeSegment[];
  direction: { x: number; y: number };
  food: Food;
  score: number;
  gameOver: boolean;
  paused: boolean;
  speed: number;
  aiOpponent: {
    snake: SnakeSegment[];
    direction: { x: number; y: number };
    score: number;
    behavior: AIBehavior;
  };
  lastPlayerMove: number;
  gameStartTime: number;
}

interface SnakeSegment {
  x: number;
  y: number;
}

interface Food {
  x: number;
  y: number;
  type: "normal" | "special" | "ai";
  value: number;
}

interface AIBehavior {
  aggression: number; // 0-1
  prediction: number; // 0-1
  adaptation: number; // 0-1
}

const GRID_SIZE = 20;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const AISnakeGame: React.FC<GameEngineProps> = ({
  canvas,
  gameState,
  setGameState,
  controls,
  onGameEvent,
}) => {
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(0);

  // Initialize game state
  useEffect(() => {
    if (Object.keys(gameState).length === 0) {
      const initialState: SnakeGameState = {
        snake: [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
          { x: 8, y: 10 },
        ] as SnakeSegment[],
        direction: { x: 1, y: 0 },
        food: {
          x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
          y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)),
          type: "normal",
          value: 10,
        } as Food,
        score: 0,
        gameOver: false,
        paused: false,
        speed: 150, // ms between moves
        aiOpponent: {
          snake: [
            { x: 30, y: 15 },
            { x: 29, y: 15 },
            { x: 28, y: 15 },
          ] as SnakeSegment[],
          direction: { x: -1, y: 0 },
          score: 0,
          behavior: {
            aggression: 0.3,
            prediction: 0.5,
            adaptation: 0.2,
          } as AIBehavior,
        },
        lastPlayerMove: Date.now(),
        gameStartTime: Date.now(),
      };

      setGameState(initialState);
      onGameEvent({ type: "start", data: { mode: "ai-snake" } });
    }
  }, [gameState, setGameState, onGameEvent]);

  // AI Decision Making
  const makeAIMove = useCallback((state: SnakeGameState) => {
    const ai = state.aiOpponent;
    const aiSnake = ai.snake;
    const head = aiSnake[0];
    const food = state.food;
    const playerSnake = state.snake;

    // Simple AI behavior: move toward food, avoid collisions
    let bestDirection = ai.direction;
    let bestScore = -Infinity;

    const possibleDirections = [
      { x: 0, y: -1 }, // up
      { x: 1, y: 0 }, // right
      { x: 0, y: 1 }, // down
      { x: -1, y: 0 }, // left
    ];

    possibleDirections.forEach((direction) => {
      const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y,
      };

      // Check bounds
      if (
        newHead.x < 0 ||
        newHead.x >= CANVAS_WIDTH / GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= CANVAS_HEIGHT / GRID_SIZE
      ) {
        return;
      }

      // Check self collision
      if (
        aiSnake.some(
          (segment: SnakeSegment) =>
            segment.x === newHead.x && segment.y === newHead.y
        )
      ) {
        return;
      }

      // Check player collision (competitive mode)
      if (
        playerSnake.some(
          (segment: SnakeSegment) =>
            segment.x === newHead.x && segment.y === newHead.y
        )
      ) {
        return;
      }

      // Calculate score for this direction
      let score = 0;

      // Distance to food (closer is better)
      const foodDistance =
        Math.abs(newHead.x - food.x) + Math.abs(newHead.y - food.y);
      score += (50 - foodDistance) * ai.behavior.aggression;

      // Avoid walls
      const wallDistance = Math.min(
        newHead.x,
        newHead.y,
        CANVAS_WIDTH / GRID_SIZE - newHead.x,
        CANVAS_HEIGHT / GRID_SIZE - newHead.y
      );
      score += wallDistance * 10;

      // AI adaptation: learn from player behavior
      const playerHead = playerSnake[0];
      const playerDistance =
        Math.abs(newHead.x - playerHead.x) + Math.abs(newHead.y - playerHead.y);

      if (ai.behavior.adaptation > 0.5) {
        // Aggressive AI: get closer to player
        score += (20 - playerDistance) * ai.behavior.aggression;
      } else {
        // Defensive AI: maintain distance
        score += playerDistance * 5;
      }

      if (score > bestScore) {
        bestScore = score;
        bestDirection = direction;
      }
    });

    return bestDirection;
  }, []);

  // Game logic update
  const updateGame = useCallback(
    (timestamp: number) => {
      const snakeGameState = gameState as SnakeGameState;

      // Guard: Don't update until game is initialized
      if (
        !snakeGameState.snake ||
        !snakeGameState.direction ||
        snakeGameState.gameOver ||
        snakeGameState.paused
      )
        return;

      if (timestamp - lastUpdateRef.current < snakeGameState.speed) {
        animationFrameRef.current = requestAnimationFrame(updateGame);
        return;
      }

      lastUpdateRef.current = timestamp;

      setGameState((prevState) => {
        const prev = prevState as SnakeGameState;
        const newState = { ...prev };

        // Move player snake
        const head = { ...newState.snake[0] };
        head.x += newState.direction.x;
        head.y += newState.direction.y;

        // Check wall collision
        if (
          head.x < 0 ||
          head.x >= CANVAS_WIDTH / GRID_SIZE ||
          head.y < 0 ||
          head.y >= CANVAS_HEIGHT / GRID_SIZE
        ) {
          newState.gameOver = true;
          onGameEvent({
            type: "end",
            data: { score: newState.score, winner: "ai" },
          });
          return newState;
        }

        // Check self collision
        if (
          newState.snake.some(
            (segment: SnakeSegment) =>
              segment.x === head.x && segment.y === head.y
          )
        ) {
          newState.gameOver = true;
          onGameEvent({
            type: "end",
            data: { score: newState.score, winner: "ai" },
          });
          return newState;
        }

        // Move AI snake
        const aiDirection = makeAIMove(newState);
        newState.aiOpponent.direction = aiDirection;

        const aiHead = { ...newState.aiOpponent.snake[0] };
        aiHead.x += aiDirection.x;
        aiHead.y += aiDirection.y;

        // Check AI wall collision
        if (
          aiHead.x < 0 ||
          aiHead.x >= CANVAS_WIDTH / GRID_SIZE ||
          aiHead.y < 0 ||
          aiHead.y >= CANVAS_HEIGHT / GRID_SIZE
        ) {
          newState.gameOver = true;
          onGameEvent({
            type: "end",
            data: { score: newState.score, winner: "player" },
          });
          return newState;
        }

        // Check AI self collision
        if (
          newState.aiOpponent.snake.some(
            (segment: SnakeSegment) =>
              segment.x === aiHead.x && segment.y === aiHead.y
          )
        ) {
          newState.gameOver = true;
          onGameEvent({
            type: "end",
            data: { score: newState.score, winner: "player" },
          });
          return newState;
        }

        // Check collision between snakes
        if (
          newState.snake.some(
            (segment: SnakeSegment) =>
              segment.x === aiHead.x && segment.y === aiHead.y
          ) ||
          newState.aiOpponent.snake.some(
            (segment: SnakeSegment) =>
              segment.x === head.x && segment.y === head.y
          )
        ) {
          newState.gameOver = true;
          onGameEvent({
            type: "end",
            data: { score: newState.score, winner: "tie" },
          });
          return newState;
        }

        // Update snakes
        newState.snake = [head, ...newState.snake];
        newState.aiOpponent.snake = [aiHead, ...newState.aiOpponent.snake];

        // Check food collision for player
        if (head.x === newState.food.x && head.y === newState.food.y) {
          newState.score += newState.food.value;
          onGameEvent({
            type: "score",
            data: { score: newState.score, points: newState.food.value },
          });

          // Generate new food
          newState.food = {
            x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
            y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)),
            type: Math.random() > 0.8 ? "special" : "normal",
            value: Math.random() > 0.8 ? 20 : 10,
          };

          // Increase speed slightly
          newState.speed = Math.max(50, newState.speed - 2);
        } else {
          newState.snake.pop();
        }

        // Check food collision for AI
        if (aiHead.x === newState.food.x && aiHead.y === newState.food.y) {
          newState.aiOpponent.score += newState.food.value;

          // AI adapts based on performance
          const timePlaying = (Date.now() - newState.gameStartTime) / 1000;
          if (timePlaying > 30) {
            // After 30 seconds, AI starts adapting
            newState.aiOpponent.behavior.aggression = Math.min(
              1,
              newState.aiOpponent.behavior.aggression + 0.05
            );
            newState.aiOpponent.behavior.adaptation = Math.min(
              1,
              newState.aiOpponent.behavior.adaptation + 0.03
            );
          }

          // Generate new food
          newState.food = {
            x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
            y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)),
            type: Math.random() > 0.8 ? "special" : "normal",
            value: Math.random() > 0.8 ? 20 : 10,
          };
        } else {
          newState.aiOpponent.snake.pop();
        }

        return newState;
      });

      animationFrameRef.current = requestAnimationFrame(updateGame);
    },
    [gameState, setGameState, onGameEvent, makeAIMove]
  );

  // Handle input
  useEffect(() => {
    if (!controls.keyboard) return;

    const snakeGameState = gameState as SnakeGameState;

    // Guard: Don't handle input until game is initialized
    if (!snakeGameState.snake || !snakeGameState.direction) return;

    const handleKeyPress = () => {
      if (snakeGameState.gameOver) return;

      let newDirection = { ...snakeGameState.direction };

      if (controls.keyboard["ArrowUp"] || controls.keyboard["w"]) {
        if (snakeGameState.direction.y === 0) newDirection = { x: 0, y: -1 };
      } else if (controls.keyboard["ArrowDown"] || controls.keyboard["s"]) {
        if (snakeGameState.direction.y === 0) newDirection = { x: 0, y: 1 };
      } else if (controls.keyboard["ArrowLeft"] || controls.keyboard["a"]) {
        if (snakeGameState.direction.x === 0) newDirection = { x: -1, y: 0 };
      } else if (controls.keyboard["ArrowRight"] || controls.keyboard["d"]) {
        if (snakeGameState.direction.x === 0) newDirection = { x: 1, y: 0 };
      } else if (controls.keyboard[" "]) {
        setGameState((prev) => ({
          ...prev,
          paused: !(prev as SnakeGameState).paused,
        }));
        return;
      }

      if (
        newDirection.x !== snakeGameState.direction.x ||
        newDirection.y !== snakeGameState.direction.y
      ) {
        setGameState((prev) => ({
          ...prev,
          direction: newDirection,
          lastPlayerMove: Date.now(),
        }));
      }
    };

    handleKeyPress();
  }, [controls.keyboard, gameState, setGameState]);

  // Render game
  useEffect(() => {
    const snakeGameState = gameState as SnakeGameState;

    // Guard: Don't render until game is initialized
    if (!canvas.current || !snakeGameState.snake || !snakeGameState.food)
      return;

    const ctx = canvas.current.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Draw player snake
    snakeGameState.snake.forEach((segment: SnakeSegment, index: number) => {
      ctx.fillStyle = index === 0 ? "#4ecdc4" : "#44a08d";
      ctx.fillRect(
        segment.x * GRID_SIZE + 1,
        segment.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
    });

    // Draw AI snake
    snakeGameState.aiOpponent.snake.forEach(
      (segment: SnakeSegment, index: number) => {
        ctx.fillStyle = index === 0 ? "#ff6b6b" : "#ff5252";
        ctx.fillRect(
          segment.x * GRID_SIZE + 1,
          segment.y * GRID_SIZE + 1,
          GRID_SIZE - 2,
          GRID_SIZE - 2
        );
      }
    );

    // Draw food
    ctx.fillStyle =
      snakeGameState.food.type === "special" ? "#ffd700" : "#4caf50";
    ctx.fillRect(
      snakeGameState.food.x * GRID_SIZE + 2,
      snakeGameState.food.y * GRID_SIZE + 2,
      GRID_SIZE - 4,
      GRID_SIZE - 4
    );

    // Draw UI
    ctx.fillStyle = "#fff";
    ctx.font = "24px Arial";
    ctx.fillText(`Player: ${snakeGameState.score}`, 20, 30);
    ctx.fillText(`AI: ${snakeGameState.aiOpponent.score}`, 20, 60);

    // AI behavior display
    ctx.font = "16px Arial";
    ctx.fillStyle = "#ff6b6b";
    ctx.fillText(
      `AI Aggression: ${Math.round(
        snakeGameState.aiOpponent.behavior.aggression * 100
      )}%`,
      CANVAS_WIDTH - 200,
      30
    );
    ctx.fillText(
      `AI Adaptation: ${Math.round(
        snakeGameState.aiOpponent.behavior.adaptation * 100
      )}%`,
      CANVAS_WIDTH - 200,
      50
    );

    if (snakeGameState.paused) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "#fff";
      ctx.font = "48px Arial";
      ctx.textAlign = "center";
      ctx.fillText("PAUSED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.textAlign = "left";
    }

    if (snakeGameState.gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "#fff";
      ctx.font = "48px Arial";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

      let winner = "Tie!";
      if (snakeGameState.score > snakeGameState.aiOpponent.score)
        winner = "Player Wins!";
      else if (snakeGameState.aiOpponent.score > snakeGameState.score)
        winner = "AI Wins!";

      ctx.font = "32px Arial";
      ctx.fillText(winner, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
      ctx.textAlign = "left";
    }
  }, [gameState, canvas]);

  // Start game loop
  useEffect(() => {
    const snakeGameState = gameState as SnakeGameState;

    // Guard: Only start game loop when fully initialized
    if (
      snakeGameState.snake &&
      snakeGameState.direction &&
      !snakeGameState.gameOver
    ) {
      animationFrameRef.current = requestAnimationFrame(updateGame);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateGame, gameState]);

  return null; // This component only handles game logic, rendering is done on canvas
};

export default AISnakeGame;
