import React, { useState, useRef, useEffect, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import AISnakeGame from "./games/AISnakeGame";
import NeuralPongGame from "./games/NeuralPongGame";
import {
  GameConfig,
  GameState,
  ControlState,
  GameEvent,
  GameEngineProps,
  TouchPoint,
  GamepadState,
} from "../types/gameTypes";

// Keyframe animations
const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
  50% { box-shadow: 0 0 40px rgba(102, 126, 234, 0.6), 0 0 60px rgba(78, 205, 196, 0.3); }
`;

const matrixRain = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
`;

const hologramFlicker = keyframes`
  0%, 100% { opacity: 1; filter: hue-rotate(0deg); }
  25% { opacity: 0.8; filter: hue-rotate(90deg); }
  50% { opacity: 1; filter: hue-rotate(180deg); }
  75% { opacity: 0.9; filter: hue-rotate(270deg); }
`;

// Styled Components
const WorkshopContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #0c0c0c 0%,
    #1a1a2e 25%,
    #16213e 50%,
    #0f0f23 75%,
    #000000 100%
  );
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
        circle at 20% 80%,
        rgba(102, 126, 234, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 20%,
        rgba(78, 205, 196, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 40% 40%,
        rgba(255, 99, 132, 0.05) 0%,
        transparent 50%
      );
    animation: ${hologramFlicker} 8s ease-in-out infinite;
    pointer-events: none;
  }
`;

const WorkshopHeader = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  position: relative;
  z-index: 2;
`;

const WorkshopTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea, #764ba2, #4ecdc4);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  text-shadow: 0 0 30px rgba(102, 126, 234, 0.5);
  animation: ${glowPulse} 4s ease-in-out infinite;
`;

const WorkshopSubtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const GameCard = styled.div<{ $isActive?: boolean }>`
  background: rgba(30, 30, 50, 0.9);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(102, 126, 234, 0.2),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: rgba(102, 126, 234, 0.6);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 30px rgba(102, 126, 234, 0.2);

    &::before {
      left: 100%;
    }
  }

  ${(props) =>
    props.$isActive &&
    css`
      border-color: #4ecdc4;
      background: rgba(78, 205, 196, 0.1);
      box-shadow: 0 0 20px rgba(78, 205, 196, 0.3);
    `}
`;

const GameIcon = styled.div`
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 10px rgba(102, 126, 234, 0.5));
`;

const GameName = styled.h3`
  color: #4ecdc4;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const GameDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const GameMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const DifficultyIndicator = styled.div<{ $level: number }>`
  display: flex;
  gap: 2px;
  color: #ffd700;
  font-size: 0.8rem;

  &::after {
    content: "${(props) =>
      "★".repeat(Math.min(props.$level, 10)) +
      "☆".repeat(Math.max(0, 10 - props.$level))}";
  }
`;

const ControlIcons = styled.div`
  display: flex;
  gap: 0.5rem;

  span {
    background: rgba(102, 126, 234, 0.2);
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    border: 1px solid rgba(102, 126, 234, 0.3);
  }
`;

const GameEngine = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const GameCanvas = styled.canvas`
  flex: 1;
  background: #000;
  display: block;
  image-rendering: pixelated; /* For retro games */
`;

const GameOverlay = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: none;
  z-index: 10;
`;

const GameUI = styled.div`
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.5);
  border-radius: 10px;
  padding: 1rem;
  backdrop-filter: blur(10px);
  pointer-events: auto;
`;

const ExitButton = styled.button`
  background: rgba(255, 69, 69, 0.8);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  pointer-events: auto;

  &:hover {
    background: rgba(255, 69, 69, 1);
    transform: scale(1.05);
  }
`;

const MatrixBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.1;

  &::before {
    content: "01010011 01001000 01001001 01001110 01011001";
    position: absolute;
    color: #4ecdc4;
    font-family: "Courier New", monospace;
    font-size: 0.8rem;
    white-space: pre;
    animation: ${matrixRain} 10s linear infinite;
    top: -50px;
    left: 10%;
  }

  &::after {
    content: "01000001 01001001 00100000 01000111 01000001 01001101 01000101 01010011";
    position: absolute;
    color: #667eea;
    font-family: "Courier New", monospace;
    font-size: 0.6rem;
    white-space: pre;
    animation: ${matrixRain} 15s linear infinite;
    animation-delay: -5s;
    top: -50px;
    right: 20%;
  }
`;

// Sample Games Configuration
const availableGames: GameConfig[] = [
  {
    id: "snake-ai",
    name: "AI Snake Evolution",
    description:
      "Classic Snake but the AI learns and adapts to your playing style. Watch it evolve!",
    icon: "🐍",
    difficulty: 4,
    controls: ["keyboard", "touch", "gamepad"],
    category: "arcade",
    component: AISnakeGame,
  },
  {
    id: "neural-pong",
    name: "Neural Network Pong",
    description:
      "Pong where the AI opponent uses a real neural network that gets smarter as you play.",
    icon: "🏓",
    difficulty: 3,
    controls: ["keyboard", "mouse", "touch"],
    category: "arcade",
    component: NeuralPongGame,
  },
  {
    id: "quantum-tetris",
    name: "Quantum Tetris",
    description:
      "Tetris pieces exist in superposition until you observe them. Mind-bending puzzle mechanics.",
    icon: "🔮",
    difficulty: 8,
    controls: ["keyboard", "touch"],
    category: "puzzle",
    component: () => <div>Quantum Tetris Coming Soon...</div>,
  },
  {
    id: "ai-painter",
    name: "Collaborative AI Painter",
    description:
      "Paint together with an AI that completes your strokes in real-time. Creative chaos!",
    icon: "🎨",
    difficulty: 2,
    controls: ["mouse", "touch"],
    category: "experimental",
    component: () => <div>AI Painter Coming Soon...</div>,
  },
  {
    id: "emotion-platformer",
    name: "Emotion Platformer",
    description:
      "A platformer that changes based on the emotions detected in your voice or text input.",
    icon: "😊",
    difficulty: 6,
    controls: ["keyboard", "gamepad"],
    category: "action",
    component: () => <div>Emotion Platformer Coming Soon...</div>,
  },
  {
    id: "fractal-explorer",
    name: "Fractal Universe Explorer",
    description:
      "Navigate through infinite fractal landscapes with procedurally generated challenges.",
    icon: "🌌",
    difficulty: 5,
    controls: ["keyboard", "mouse", "gamepad"],
    category: "experimental",
    component: () => <div>Fractal Explorer Coming Soon...</div>,
  },
];

// Control Icons Mapping
const controlIconMap = {
  keyboard: "⌨️",
  mouse: "🖱️",
  touch: "👆",
  gamepad: "🎮",
};

// Main Component
const AIGameWorkshop: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameConfig | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameState, setGameState] = useState<GameState>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Control state
  const [controls, setControls] = useState<ControlState>({
    keyboard: {},
    mouse: { x: 0, y: 0, buttons: [] },
    touch: [],
    gamepad: null,
  });

  // Game event handler
  const handleGameEvent = useCallback((event: GameEvent) => {
    console.log("Game Event:", event);

    switch (event.type) {
      case "end":
        setIsPlaying(false);
        setSelectedGame(null);
        break;
      // Handle other events...
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setControls((prev) => ({
        ...prev,
        keyboard: { ...prev.keyboard, [e.key]: true },
      }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setControls((prev) => ({
        ...prev,
        keyboard: { ...prev.keyboard, [e.key]: false },
      }));
    };

    if (isPlaying) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }
  }, [isPlaying]);

  // Mouse controls
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setControls((prev) => ({
        ...prev,
        mouse: { ...prev.mouse, x: e.clientX, y: e.clientY },
      }));
    };

    if (isPlaying && canvasRef.current) {
      canvasRef.current.addEventListener("mousemove", handleMouseMove);

      return () => {
        canvasRef.current?.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [isPlaying]);

  // Touch controls
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touches: TouchPoint[] = Array.from(e.touches).map((touch) => ({
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        force: touch.force,
      }));

      setControls((prev) => ({ ...prev, touch: touches }));
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling
      const touches: TouchPoint[] = Array.from(e.touches).map((touch) => ({
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        force: touch.force,
      }));

      setControls((prev) => ({ ...prev, touch: touches }));
    };

    const handleTouchEnd = () => {
      setControls((prev) => ({ ...prev, touch: [] }));
    };

    if (isPlaying && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.addEventListener("touchstart", handleTouchStart);
      canvas.addEventListener("touchmove", handleTouchMove);
      canvas.addEventListener("touchend", handleTouchEnd);

      return () => {
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchmove", handleTouchMove);
        canvas.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isPlaying]);

  // Gamepad controls
  useEffect(() => {
    let animationFrame: number;

    const updateGamepad = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0];

      if (gamepad) {
        setControls((prev) => ({
          ...prev,
          gamepad: {
            buttons: Array.from(gamepad.buttons).map(
              (button) => button.pressed
            ),
            axes: Array.from(gamepad.axes),
            connected: true,
          },
        }));
      }

      animationFrame = requestAnimationFrame(updateGamepad);
    };

    if (isPlaying) {
      updateGamepad();

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }
  }, [isPlaying]);

  const startGame = (game: GameConfig) => {
    setSelectedGame(game);
    setIsPlaying(true);
    setGameState({});
  };

  // Handle laser shooting
  const handleCanvasShoot = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedGame?.name !== "Neural Network Pong") return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const targetX = (event.clientX - rect.left) * scaleX;
    const targetY = (event.clientY - rect.top) * scaleY;

    // Call the neural pong laser handler directly
    const handler = (window as unknown as Record<string, unknown>).neuralPongLaserHandler as (event: any) => void;
    if (handler) {
      handler({
        type: 'LASER_SHOOT',
        data: { targetX, targetY, timestamp: Date.now() }
      });
    }
  };

  const handleTouchShoot = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (selectedGame?.name !== "Neural Network Pong") return;
    
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || event.touches.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const touch = event.touches[0];
    const targetX = (touch.clientX - rect.left) * scaleX;
    const targetY = (touch.clientY - rect.top) * scaleY;

    // Call the neural pong laser handler directly
    const handler = (window as unknown as Record<string, unknown>).neuralPongLaserHandler as (event: any) => void;
    if (handler) {
      handler({
        type: 'LASER_SHOOT',
        data: { targetX, targetY, timestamp: Date.now() }
      });
    }
  };

  const exitGame = () => {
    setIsPlaying(false);
    setSelectedGame(null);
    setGameState({});
  };

  if (isPlaying && selectedGame) {
    const GameComponent = selectedGame.component;

    return (
      <GameEngine>
        <GameCanvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          onClick={handleCanvasShoot}
          onTouchStart={handleTouchShoot}
          style={{ cursor: selectedGame?.name === "Neural Network Pong" ? "crosshair" : "default" }}
        />
        <GameOverlay>
          <GameUI>
            <h3>{selectedGame.name}</h3>
            <p>Score: {(gameState as { score?: number }).score || 0}</p>
          </GameUI>
          <ExitButton onClick={exitGame}>Exit Game</ExitButton>
        </GameOverlay>
        <GameComponent
          canvas={canvasRef}
          gameState={gameState}
          setGameState={setGameState}
          controls={controls}
          onGameEvent={handleGameEvent}
        />
      </GameEngine>
    );
  }

  return (
    <WorkshopContainer>
      <MatrixBackground />

      <WorkshopHeader>
        <WorkshopTitle>🎮 AI Game Workshop</WorkshopTitle>
        <WorkshopSubtitle>
          Modular game engine for creating AI-powered experiences. Each game
          features unique AI behaviors, adaptive difficulty, and cross-platform
          controls. Let&apos;s build something extraordinary!
        </WorkshopSubtitle>
      </WorkshopHeader>

      <GameGrid>
        {availableGames.map((game) => (
          <GameCard key={game.id} onClick={() => startGame(game)}>
            <GameIcon>{game.icon}</GameIcon>
            <GameName>{game.name}</GameName>
            <GameDescription>{game.description}</GameDescription>

            <GameMeta>
              <DifficultyIndicator $level={game.difficulty} />
              <ControlIcons>
                {game.controls.map((control) => (
                  <span key={control}>{controlIconMap[control]}</span>
                ))}
              </ControlIcons>
            </GameMeta>
          </GameCard>
        ))}
      </GameGrid>
    </WorkshopContainer>
  );
};

export default AIGameWorkshop;
