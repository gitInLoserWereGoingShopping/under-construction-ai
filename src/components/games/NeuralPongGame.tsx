import React, { useEffect, useCallback, useRef } from "react";
import {
  GameEngineProps,
  GameState as BaseGameState,
  GameEvent,
} from "../../types/gameTypes";

interface PongGameState extends BaseGameState {
  player: {
    y: number;
    score: number;
    speed: number;
    powerUps: string[];
    health: number;
    maxHealth: number;
  };
  ai: {
    y: number;
    score: number;
    speed: number;
    network: NeuralNetwork;
    trainingData: TrainingExample[];
    confidence: number;
    adaptationLevel: number;
    originalSpeed: number;
    health: number;
    maxHealth: number;
  };
  ball: {
    x: number;
    y: number;
    dx: number;
    dy: number;
    speed: number;
    baseSpeed: number;
    size: number;
    color: string;
    trail: { x: number; y: number; alpha: number }[];
    effects: string[];
  };
  particles: Particle[];
  lasers: Laser[];
  powerUps: PowerUp[];
  gameStarted: boolean;
  gameOver: boolean;
  paused: boolean;
  lastUpdate: number;
  rally: number;
  maxRally: number;
  lastPowerUpSpawn: number;
  roundNumber: number;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Laser {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  length: number;
  width: number;
  color: string;
  glowColor: string;
  alpha: number;
  shooter: 'player' | 'ai';
  damage: number;
  energy: number;
  maxEnergy: number;
}

interface Ball {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
  size: number;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
  effects: string[];
}

interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  collected: boolean;
  spawnTime: number;
  duration: number;
}

type PowerUpType =
  | "split_ball" // Splits ball into fast/slow pair
  | "speed_boost" // Speeds up ball significantly
  | "ghost_ball" // Ball phases through AI paddle once
  | "freeze_ai" // Temporarily slows AI movement
  | "multi_ball" // Creates 3 balls
  | "curve_ball" // Ball curves in flight
  | "size_change"; // Makes ball smaller (harder to hit)

interface TrainingExample {
  input: number[]; // [ball_x, ball_y, ball_dx, ball_dy, paddle_y, opponent_y]
  output: number[]; // [move_direction] -1, 0, 1
  reward: number;
}

// Simple Neural Network for AI behavior
class NeuralNetwork {
  private weights1: number[][];
  private weights2: number[][];
  private bias1: number[];
  private bias2: number[];
  private learning_rate: number;

  constructor() {
    this.learning_rate = 0.01;

    // Initialize network: 6 inputs -> 8 hidden -> 3 outputs
    this.weights1 = this.randomMatrix(6, 8);
    this.weights2 = this.randomMatrix(8, 3);
    this.bias1 = this.randomArray(8);
    this.bias2 = this.randomArray(3);
  }

  private randomMatrix(rows: number, cols: number): number[][] {
    return Array(rows)
      .fill(0)
      .map(() =>
        Array(cols)
          .fill(0)
          .map(() => (Math.random() - 0.5) * 2)
      );
  }

  private randomArray(size: number): number[] {
    return Array(size)
      .fill(0)
      .map(() => (Math.random() - 0.5) * 2);
  }

  private sigmoid(x: number): number {
    // Clamp x to prevent overflow
    const clampedX = Math.max(-500, Math.min(500, x));
    return 1 / (1 + Math.exp(-clampedX));
  }

  private softmax(arr: number[]): number[] {
    const max = Math.max(...arr);
    const exp = arr.map((x) => {
      const clampedX = Math.max(-500, Math.min(500, x - max));
      return Math.exp(clampedX);
    });
    const sum = exp.reduce((a, b) => a + b, 0);

    // Prevent division by zero
    if (sum === 0 || !isFinite(sum)) {
      return arr.map(() => 1 / arr.length);
    }

    return exp.map((x) => x / sum);
  }

  predict(input: number[]): number[] {
    // Forward propagation
    const hidden = this.weights1.map((weights, i) => {
      const sum =
        weights.reduce((acc, w, j) => acc + w * input[j], 0) + this.bias1[i];
      return this.sigmoid(sum);
    });

    const output = this.weights2.map((weights, i) => {
      const sum =
        weights.reduce((acc, w, j) => acc + w * hidden[j], 0) + this.bias2[i];
      return sum;
    });

    return this.softmax(output);
  }

  train(examples: TrainingExample[]): void {
    for (const example of examples) {
      const prediction = this.predict(example.input);
      const error = example.output.map((target, i) => target - prediction[i]);

      // Simple gradient descent (simplified backpropagation)
      for (let i = 0; i < this.weights2.length; i++) {
        for (let j = 0; j < this.weights2[i].length; j++) {
          this.weights2[i][j] += this.learning_rate * error[i] * example.reward;
        }
        this.bias2[i] += this.learning_rate * error[i] * example.reward;
      }
    }
  }

  getConfidence(input: number[]): number {
    const output = this.predict(input);

    // Check for NaN or invalid values
    if (output.some((val) => !isFinite(val))) {
      return 0.1; // Very low confidence for invalid output
    }

    const sortedOutput = [...output].sort((a, b) => b - a);
    const max = sortedOutput[0];
    const secondMax = sortedOutput[1];

    // Calculate confidence based on how much the max exceeds the second max
    const separation = max - secondMax;
    const confidence = Math.max(0.1, Math.min(1, separation * 3 + 0.2));

    return isFinite(confidence) ? confidence : 0.1;
  }
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 15;
const PADDLE_SPEED = 8;
const BALL_SPEED = 6;

const NeuralPongGame: React.FC<GameEngineProps> = ({
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
      const initialState: PongGameState = {
        player: {
          y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
          score: 0,
          speed: PADDLE_SPEED,
          powerUps: [],
          health: 100,
          maxHealth: 100,
        },
        ai: {
          y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
          score: 0,
          speed: PADDLE_SPEED * 0.9, // Slightly slower than player initially
          network: new NeuralNetwork(),
          trainingData: [],
          confidence: 0.5,
          adaptationLevel: 0,
          originalSpeed: PADDLE_SPEED * 0.9,
          health: 100,
          maxHealth: 100,
        },
        ball: {
          x: CANVAS_WIDTH / 2,
          y: CANVAS_HEIGHT / 2,
          dx: Math.random() > 0.5 ? BALL_SPEED : -BALL_SPEED,
          dy: (Math.random() - 0.5) * BALL_SPEED,
          speed: BALL_SPEED,
          baseSpeed: BALL_SPEED,
          size: BALL_SIZE,
          color: "#ffffff",
          trail: [],
          effects: [],
        },
        particles: [],
        lasers: [],
        powerUps: [],
        gameStarted: false,
        gameOver: false,
        paused: false,
        lastUpdate: Date.now(),
        rally: 0,
        maxRally: 0,
        lastPowerUpSpawn: Date.now(),
        roundNumber: 1,
      };

      setGameState(initialState);
      onGameEvent({ type: "start", data: { mode: "neural-pong" } });
    }
  }, [gameState, setGameState, onGameEvent]);

  // AI Decision Making with Neural Network
  const makeAIMove = useCallback((state: PongGameState) => {
    const { ball, ai, player } = state;

    // Prepare input for neural network
    const input = [
      ball.x / CANVAS_WIDTH, // Normalized ball X
      ball.y / CANVAS_HEIGHT, // Normalized ball Y
      ball.dx / BALL_SPEED, // Normalized ball velocity X
      ball.dy / BALL_SPEED, // Normalized ball velocity Y
      ai.y / CANVAS_HEIGHT, // Normalized AI paddle Y
      player.y / CANVAS_HEIGHT, // Normalized player paddle Y
    ];

    // Get neural network prediction
    const prediction = ai.network.predict(input);
    const confidence = ai.network.getConfidence(input);

    // Convert prediction to movement (-1: up, 0: stay, 1: down)
    const moveIndex = prediction.indexOf(Math.max(...prediction));
    let movement = moveIndex - 1; // Convert 0,1,2 to -1,0,1

    // FALLBACK STRATEGY: When neural network confidence is very low, use basic AI
    if (confidence < 0.3) {
      // Simple AI: follow the ball with some prediction
      const ballCenterY = ball.y;
      const aiCenterY = ai.y + PADDLE_HEIGHT / 2;
      const difference = ballCenterY - aiCenterY;

      // Add some prediction based on ball direction
      let predictedBallY = ballCenterY;
      if (ball.dx > 0) {
        // Ball moving toward AI
        const timeToReach = (CANVAS_WIDTH - ball.x) / Math.abs(ball.dx);
        predictedBallY = ball.y + ball.dy * timeToReach;
      }

      const predictedDifference = predictedBallY - aiCenterY;

      if (Math.abs(predictedDifference) < 20) {
        movement = 0; // Stay
      } else if (predictedDifference > 0) {
        movement = 1; // Move down
      } else {
        movement = -1; // Move up
      }
    }

    // Add some randomness when confidence is low (exploration)
    if (confidence < 0.6 && Math.random() < 0.1) {
      movement = Math.floor(Math.random() * 3) - 1;
    }

    // Calculate target Y position
    let targetY = ai.y;
    if (movement === -1) targetY -= ai.speed;
    else if (movement === 1) targetY += ai.speed;

    // Bounds checking
    targetY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, targetY));

    return {
      targetY,
      confidence,
      movement,
      prediction,
    };
  }, []);

  // Collect training data for AI learning
  const collectTrainingData = useCallback(
    (
      state: PongGameState,
      aiAction: number,
      outcome: "hit" | "miss" | "score" | "concede"
    ) => {
      const { ball, ai, player } = state;

      const input = [
        ball.x / CANVAS_WIDTH,
        ball.y / CANVAS_HEIGHT,
        ball.dx / BALL_SPEED,
        ball.dy / BALL_SPEED,
        ai.y / CANVAS_HEIGHT,
        player.y / CANVAS_HEIGHT,
      ];

      const output = [0, 0, 0];
      output[aiAction + 1] = 1; // Convert -1,0,1 to 0,1,2 index

      let reward = 0;
      switch (outcome) {
        case "hit":
          reward = 1;
          break;
        case "score":
          reward = 3;
          break;
        case "miss":
          reward = -1;
          break;
        case "concede":
          reward = -3;
          break;
      }

      return { input, output, reward };
    },
    []
  );

  // Power-up creation and management
  const createPowerUp = useCallback((type: PowerUpType): PowerUp => {
    return {
      id: `powerup_${Date.now()}_${Math.random()}`,
      x: CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 200,
      y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
      type,
      collected: false,
      spawnTime: Date.now(),
      duration: 15000, // 15 seconds before disappearing
    };
  }, []);

  const spawnRandomPowerUp = useCallback(() => {
    const powerUpTypes: PowerUpType[] = [
      "split_ball",
      "speed_boost",
      "ghost_ball",
      "freeze_ai",
      "multi_ball",
      "curve_ball",
      "size_change",
    ];
    const randomType =
      powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    return createPowerUp(randomType);
  }, [createPowerUp]);

  const activatePowerUp = useCallback(
    (state: PongGameState, powerUp: PowerUp): PongGameState => {
      const newState = { ...state };

      switch (powerUp.type) {
        case "speed_boost":
          newState.ball.dx *= 1.8;
          newState.ball.dy *= 1.8;
          newState.ball.color = "#ffd93d";
          newState.ball.effects.push("speed");
          break;

        case "ghost_ball":
          newState.ball.effects.push("ghost");
          newState.ball.color = "#c7b3ff";
          break;

        case "freeze_ai":
          newState.ai.speed = newState.ai.originalSpeed * 0.3;
          newState.player.powerUps.push("freeze_ai_active");
          break;

        case "curve_ball":
          newState.ball.effects.push("curve");
          newState.ball.color = "#ff6b9d";
          break;

        case "size_change":
          newState.ball.size = BALL_SIZE * 0.6;
          newState.ball.color = "#00d2d3";
          newState.ball.effects.push("small");
          break;

        case "split_ball":
          // For now, just make ball faster and change color
          newState.ball.dx *= 1.4;
          newState.ball.dy *= 1.2;
          newState.ball.color = "#ff6b6b";
          newState.ball.effects.push("split");
          break;

        case "multi_ball":
          // For now, just make ball more unpredictable
          newState.ball.effects.push("multi");
          newState.ball.color = "#ff9f43";
          break;
      }

      return newState;
    },
    []
  );

  const getPowerUpDescription = useCallback((type: PowerUpType): string => {
    switch (type) {
      case "speed_boost":
        return "Ball Speed Boost! ⚡";
      case "ghost_ball":
        return "Ghost Ball - Phases through AI paddle once! 👻";
      case "freeze_ai":
        return "AI Freeze - Slowed AI movement! ❄️";
      case "curve_ball":
        return "Curve Ball - Unpredictable movement! 🌀";
      case "size_change":
        return "Small Ball - Harder to hit! 🔹";
      case "split_ball":
        return "Enhanced Ball - Faster and stronger! 🔥";
      case "multi_ball":
        return "Multi Effect - Unpredictable behavior! ✨";
      default:
        return "Power-up activated!";
    }
  }, []);

  const getPowerUpColor = useCallback((type: PowerUpType): string => {
    switch (type) {
      case "speed_boost":
        return "#ffd93d";
      case "ghost_ball":
        return "#c7b3ff";
      case "freeze_ai":
        return "#74b9ff";
      case "curve_ball":
        return "#ff6b9d";
      case "size_change":
        return "#00d2d3";
      case "split_ball":
        return "#ff6b6b";
      case "multi_ball":
        return "#ff9f43";
      default:
        return "#ffffff";
    }
  }, []);

  const getPowerUpRGB = useCallback((type: PowerUpType): string => {
    switch (type) {
      case "speed_boost":
        return "255, 217, 61";
      case "ghost_ball":
        return "199, 179, 255";
      case "freeze_ai":
        return "116, 185, 255";
      case "curve_ball":
        return "255, 107, 157";
      case "size_change":
        return "0, 210, 211";
      case "split_ball":
        return "255, 107, 107";
      case "multi_ball":
        return "255, 159, 67";
      default:
        return "255, 255, 255";
    }
  }, []);

  const getPowerUpSymbol = useCallback((type: PowerUpType): string => {
    switch (type) {
      case "speed_boost":
        return "⚡";
      case "ghost_ball":
        return "👻";
      case "freeze_ai":
        return "❄️";
      case "curve_ball":
        return "🌀";
      case "size_change":
        return "🔹";
      case "split_ball":
        return "🔥";
      case "multi_ball":
        return "✨";
      default:
        return "?";
    }
  }, []);

  // Particle system for visual effects
  const createWallParticles = useCallback(
    (x: number, y: number, count: number = 8): Particle[] => {
      const particles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          id: `particle_${Date.now()}_${i}`,
          x: x + (Math.random() - 0.5) * 30,
          y: y + (Math.random() - 0.5) * 30,
          dx: (Math.random() - 0.5) * 8,
          dy: (Math.random() - 0.5) * 8,
          size: Math.random() * 4 + 2,
          color: `hsl(${180 + Math.random() * 60}, ${
            70 + Math.random() * 30
          }%, ${50 + Math.random() * 30}%)`,
          alpha: 1,
          life: 0,
          maxLife: 30 + Math.random() * 20,
        });
      }
      return particles;
    },
    []
  );

  const createPaddleParticles = useCallback(
    (x: number, y: number, count: number = 6): Particle[] => {
      const particles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          id: `particle_${Date.now()}_${i}`,
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          dx: (Math.random() - 0.5) * 6,
          dy: (Math.random() - 0.5) * 6,
          size: Math.random() * 3 + 1,
          color: `hsl(${240 + Math.random() * 60}, 80%, 60%)`,
          alpha: 1,
          life: 0,
          maxLife: 25 + Math.random() * 15,
        });
      }
      return particles;
    },
    []
  );

  const updateParticles = useCallback((particles: Particle[]): Particle[] => {
    return particles
      .map((particle) => ({
        ...particle,
        x: particle.x + particle.dx,
        y: particle.y + particle.dy,
        dy: particle.dy + 0.2, // Gravity effect
        alpha: 1 - particle.life / particle.maxLife,
        life: particle.life + 1,
      }))
      .filter((particle) => particle.life < particle.maxLife);
  }, []);

  // Laser system for paddle shooting - PEW PEW!
  const createLaser = useCallback((fromX: number, fromY: number, direction: number, shooter: 'player' | 'ai'): Laser => {
    return {
      id: `laser_${Date.now()}_${Math.random()}`,
      x: fromX,
      y: fromY,
      dx: direction * 12, // Laser speed - faster than bullets!
      dy: 0,
      length: 25,
      width: 4,
      color: shooter === 'player' ? '#00ff88' : '#ff4444',
      glowColor: shooter === 'player' ? '#88ffcc' : '#ffaaaa',
      alpha: 1,
      shooter,
      damage: 8,
      energy: 100,
      maxEnergy: 100
    };
  }, []);

  const updateLasers = useCallback((lasers: Laser[]): Laser[] => {
    return lasers
      .map(laser => ({
        ...laser,
        x: laser.x + laser.dx,
        y: laser.y + laser.dy,
        energy: laser.energy - 3, // Lasers fade faster for that energy beam effect
        alpha: Math.max(0, laser.energy / laser.maxEnergy)
      }))
      .filter(laser => 
        laser.x > -50 && 
        laser.x < CANVAS_WIDTH + 50 && 
        laser.energy > 0
      );
  }, []);

  const shootLaser = useCallback((state: PongGameState, shooter: 'player' | 'ai'): PongGameState => {
    const newState = { ...state };
    
    if (shooter === 'player') {
      const laser = createLaser(
        PADDLE_WIDTH + 15, 
        newState.player.y + PADDLE_HEIGHT / 2, 
        1, 
        'player'
      );
      newState.lasers.push(laser);
    } else {
      const laser = createLaser(
        CANVAS_WIDTH - PADDLE_WIDTH - 15, 
        newState.ai.y + PADDLE_HEIGHT / 2, 
        -1, 
        'ai'
      );
      newState.lasers.push(laser);
    }
    
    return newState;
  }, [createLaser]);

  // Game logic update
  const updateGame = useCallback(
    (timestamp: number) => {
      const pongGameState = gameState as PongGameState;

      // Guard: Don't update until game is initialized
      if (
        !pongGameState.player ||
        !pongGameState.ball ||
        pongGameState.gameOver ||
        pongGameState.paused
      )
        return;

      const deltaTime = timestamp - lastUpdateRef.current;
      if (deltaTime < 16) {
        // Cap at ~60 FPS
        animationFrameRef.current = requestAnimationFrame(updateGame);
        return;
      }

      lastUpdateRef.current = timestamp;

      setGameState((prevState) => {
        const prev = prevState as PongGameState;
        const newState = { ...prev };

        // AI Decision Making
        const aiDecision = makeAIMove(newState);

        // Apply AI movement with smooth interpolation (not instant)
        const targetY = Math.max(
          0,
          Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, aiDecision.targetY)
        );
        const currentY = newState.ai.y;
        const maxMoveDistance = PADDLE_SPEED;

        if (Math.abs(targetY - currentY) > maxMoveDistance) {
          // Move towards target gradually
          newState.ai.y =
            currentY + Math.sign(targetY - currentY) * maxMoveDistance;
        } else {
          // Close enough to reach target
          newState.ai.y = targetY;
        }

        newState.ai.confidence = aiDecision.confidence;

        // Spawn power-ups periodically (every 8-12 seconds)
        const currentTime = Date.now();
        if (
          currentTime - newState.lastPowerUpSpawn >
          8000 + Math.random() * 4000
        ) {
          if (newState.powerUps.length < 2) {
            // Max 2 power-ups at once
            newState.powerUps.push(spawnRandomPowerUp());
            newState.lastPowerUpSpawn = currentTime;
          }
        }

        // Remove expired power-ups
        newState.powerUps = newState.powerUps.filter(
          (powerUp) =>
            !powerUp.collected &&
            currentTime - powerUp.spawnTime < powerUp.duration
        );

        // Ball effects (curve ball, etc.)
        if (newState.ball.effects.includes("curve")) {
          // Add subtle curve to ball movement
          newState.ball.dy += Math.sin(timestamp * 0.005) * 0.3;
        }

        // Update particles
        newState.particles = updateParticles(newState.particles);

        // Update lasers and check collisions - PEW PEW!
        newState.lasers = updateLasers(newState.lasers);

        // Laser collision detection with paddles
        newState.lasers.forEach(laser => {
          // Check collision with player paddle
          if (laser.shooter === 'ai' && 
              laser.x <= PADDLE_WIDTH + 10 &&
              laser.y >= newState.player.y - 10 &&
              laser.y <= newState.player.y + PADDLE_HEIGHT + 10) {
            
            newState.player.health = Math.max(0, newState.player.health - laser.damage);
            laser.energy = 0; // Mark for removal
            
            // Create laser impact particles - more spectacular!
            const impactParticles = createWallParticles(laser.x, laser.y, 8);
            newState.particles.push(...impactParticles);
          }
          
          // Check collision with AI paddle
          if (laser.shooter === 'player' &&
              laser.x >= CANVAS_WIDTH - PADDLE_WIDTH - 10 &&
              laser.y >= newState.ai.y - 10 &&
              laser.y <= newState.ai.y + PADDLE_HEIGHT + 10) {
            
            newState.ai.health = Math.max(0, newState.ai.health - laser.damage);
            laser.energy = 0; // Mark for removal
            
            // Create laser impact particles - more spectacular!
            const impactParticles = createWallParticles(laser.x, laser.y, 8);
            newState.particles.push(...impactParticles);
          }
        });

        // Update ball position
        newState.ball.x += newState.ball.dx;
        newState.ball.y += newState.ball.dy;

        // Power-up collision detection
        newState.powerUps.forEach((powerUp) => {
          if (!powerUp.collected) {
            const ballDistance = Math.sqrt(
              Math.pow(newState.ball.x - powerUp.x, 2) +
                Math.pow(newState.ball.y - powerUp.y, 2)
            );

            if (ballDistance < newState.ball.size + 25) {
              // Power-up radius ~25
              powerUp.collected = true;
              const updatedState = activatePowerUp(newState, powerUp);
              Object.assign(newState, updatedState);

              onGameEvent({
                type: "achievement",
                data: {
                  type: powerUp.type,
                  description: getPowerUpDescription(powerUp.type),
                },
              });
            }
          }
        });

        // Add to ball trail
        newState.ball.trail.push({
          x: newState.ball.x,
          y: newState.ball.y,
          alpha: 1,
        });

        // Update trail alpha and remove old points
        newState.ball.trail = newState.ball.trail
          .map((point) => ({ ...point, alpha: point.alpha - 0.05 }))
          .filter((point) => point.alpha > 0)
          .slice(-20); // Keep last 20 points

        // Ball collision with top/bottom walls - WITH PARTICLE EFFECTS!
        if (
          newState.ball.y <= newState.ball.size / 2 ||
          newState.ball.y >= CANVAS_HEIGHT - newState.ball.size / 2
        ) {
          newState.ball.dy = -newState.ball.dy;
          newState.ball.y = Math.max(
            newState.ball.size / 2,
            Math.min(CANVAS_HEIGHT - newState.ball.size / 2, newState.ball.y)
          );

          // Create spectacular wall particle explosion!
          const wallParticles = createWallParticles(
            newState.ball.x,
            newState.ball.y,
            12
          );
          newState.particles.push(...wallParticles);
        }

        // Ball collision with player paddle
        if (
          newState.ball.x <= PADDLE_WIDTH + newState.ball.size / 2 &&
          newState.ball.y >= newState.player.y &&
          newState.ball.y <= newState.player.y + PADDLE_HEIGHT &&
          newState.ball.dx < 0
        ) {
          newState.ball.dx = Math.abs(newState.ball.dx);
          const relativeIntersectY =
            (newState.ball.y - (newState.player.y + PADDLE_HEIGHT / 2)) /
            (PADDLE_HEIGHT / 2);
          newState.ball.dy = relativeIntersectY * BALL_SPEED * 0.8;
          newState.rally++;

          // Create paddle hit particles
          const paddleParticles = createPaddleParticles(
            newState.ball.x,
            newState.ball.y,
            8
          );
          newState.particles.push(...paddleParticles);

          // Collect training data for AI
          const trainingExample = collectTrainingData(
            newState,
            aiDecision.movement,
            "hit"
          );
          newState.ai.trainingData.push(trainingExample);
        }

        // Ball collision with AI paddle
        if (
          newState.ball.x >=
            CANVAS_WIDTH - PADDLE_WIDTH - newState.ball.size / 2 &&
          newState.ball.y >= newState.ai.y &&
          newState.ball.y <= newState.ai.y + PADDLE_HEIGHT &&
          newState.ball.dx > 0
        ) {
          // Ghost ball effect - phases through AI paddle once
          if (newState.ball.effects.includes("ghost")) {
            newState.ball.effects = newState.ball.effects.filter(
              (effect) => effect !== "ghost"
            );
            newState.ball.color = "#ffffff"; // Return to normal color
          } else {
            newState.ball.dx = -Math.abs(newState.ball.dx);
            const relativeIntersectY =
              (newState.ball.y - (newState.ai.y + PADDLE_HEIGHT / 2)) /
              (PADDLE_HEIGHT / 2);
            newState.ball.dy = relativeIntersectY * BALL_SPEED * 0.8;
            newState.rally++;

            // Create paddle hit particles for AI paddle too
            const paddleParticles = createPaddleParticles(
              newState.ball.x,
              newState.ball.y,
              8
            );
            newState.particles.push(...paddleParticles);

            // Collect training data for AI
            const trainingExample = collectTrainingData(
              newState,
              aiDecision.movement,
              "hit"
            );
            newState.ai.trainingData.push(trainingExample);
          }
        }

        // Ball goes off left side (AI scores)
        if (newState.ball.x < 0) {
          newState.ai.score++;
          newState.maxRally = Math.max(newState.maxRally, newState.rally);
          newState.rally = 0;

          // Progressive speed increase every round!
          newState.roundNumber++;
          const speedMultiplier = 1 + (newState.roundNumber - 1) * 0.1; // 10% faster each round
          newState.ball.baseSpeed = BALL_SPEED * speedMultiplier;

          // Reset ball with progressive speed
          newState.ball.x = CANVAS_WIDTH / 2;
          newState.ball.y = CANVAS_HEIGHT / 2;
          newState.ball.dx = newState.ball.baseSpeed;
          newState.ball.dy = (Math.random() - 0.5) * newState.ball.baseSpeed;
          newState.ball.speed = newState.ball.baseSpeed;
          newState.ball.trail = [];
          newState.ball.color = "#ffffff";
          newState.ball.size = BALL_SIZE;
          newState.ball.effects = [];

          // Reset AI speed if frozen
          newState.ai.speed = newState.ai.originalSpeed;

          // Collect training data for AI (scored)
          const trainingExample = collectTrainingData(
            newState,
            aiDecision.movement,
            "score"
          );
          newState.ai.trainingData.push(trainingExample);

          onGameEvent({
            type: "score",
            data: { scorer: "ai", score: newState.ai.score },
          });
        }

        // Ball goes off right side (Player scores)
        if (newState.ball.x > CANVAS_WIDTH) {
          newState.player.score++;
          newState.maxRally = Math.max(newState.maxRally, newState.rally);
          newState.rally = 0;

          // Progressive speed increase every round!
          newState.roundNumber++;
          const speedMultiplier = 1 + (newState.roundNumber - 1) * 0.1; // 10% faster each round
          newState.ball.baseSpeed = BALL_SPEED * speedMultiplier;

          // Reset ball with progressive speed
          newState.ball.x = CANVAS_WIDTH / 2;
          newState.ball.y = CANVAS_HEIGHT / 2;
          newState.ball.dx = -newState.ball.baseSpeed;
          newState.ball.dy = (Math.random() - 0.5) * newState.ball.baseSpeed;
          newState.ball.speed = newState.ball.baseSpeed;
          newState.ball.trail = [];
          newState.ball.color = "#ffffff";
          newState.ball.size = BALL_SIZE;
          newState.ball.effects = [];

          // Reset AI speed if frozen
          newState.ai.speed = newState.ai.originalSpeed;

          // Collect training data for AI (conceded)
          const trainingExample = collectTrainingData(
            newState,
            aiDecision.movement,
            "concede"
          );
          newState.ai.trainingData.push(trainingExample);

          onGameEvent({
            type: "score",
            data: { scorer: "player", score: newState.player.score },
          });

          // AI learns from recent experiences
          if (newState.ai.trainingData.length >= 10) {
            newState.ai.network.train(newState.ai.trainingData.slice(-10));
            newState.ai.adaptationLevel = Math.min(
              100,
              newState.ai.adaptationLevel + 5
            );
          }
        }

        // Check win condition
        if (newState.player.score >= 11 || newState.ai.score >= 11) {
          newState.gameOver = true;
          const winner = newState.player.score >= 11 ? "player" : "ai";
          onGameEvent({
            type: "end",
            data: {
              winner,
              finalScore: [newState.player.score, newState.ai.score],
            },
          });
        }

        return newState;
      });

      animationFrameRef.current = requestAnimationFrame(updateGame);
    },
    [gameState, setGameState, onGameEvent, makeAIMove, collectTrainingData]
  );

  // Handle input
  useEffect(() => {
    if (!controls.keyboard && !controls.mouse) return;

    const pongGameState = gameState as PongGameState;

    // Guard: Don't handle input until game is initialized
    if (!pongGameState.player) return;

    const handleInput = () => {
      if (pongGameState.gameOver) return;

      let newY = pongGameState.player.y;

      // Keyboard controls
      if (controls.keyboard) {
        if (controls.keyboard["ArrowUp"] || controls.keyboard["w"]) {
          newY -= pongGameState.player.speed;
        }
        if (controls.keyboard["ArrowDown"] || controls.keyboard["s"]) {
          newY += pongGameState.player.speed;
        }
        if (controls.keyboard[" "]) {
          setGameState((prev) => ({
            ...prev,
            paused: !(prev as PongGameState).paused,
          }));
          return;
        }
      }

      // Mouse controls
      if (controls.mouse && controls.mouse.y > 0) {
        newY = controls.mouse.y - PADDLE_HEIGHT / 2;
      }

      // Bounds checking
      newY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newY));

      if (newY !== pongGameState.player.y) {
        setGameState((prev) => {
          const prevState = prev as PongGameState;
          return {
            ...prevState,
            player: { ...prevState.player, y: newY },
            gameStarted: true,
          };
        });
      }
    };

    handleInput();
  }, [controls.keyboard, controls.mouse, gameState, setGameState]);

  // Render game
  useEffect(() => {
    const pongGameState = gameState as PongGameState;

    // Guard: Don't render until game is initialized
    if (!canvas.current || !pongGameState.player || !pongGameState.ball) return;

    const ctx = canvas.current.getContext("2d");
    if (!ctx) return;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );
    gradient.addColorStop(0, "#0a0a0a");
    gradient.addColorStop(0.5, "#1a1a2e");
    gradient.addColorStop(1, "#0a0a0a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle background text
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("NEURAL NETWORK PONG", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.restore();

    // Draw center line
    ctx.strokeStyle = "rgba(78, 205, 196, 0.3)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw ball trail
    pongGameState.ball.trail.forEach((point, index) => {
      ctx.fillStyle = `rgba(255, 255, 255, ${point.alpha * 0.5})`;
      const size = pongGameState.ball.size * point.alpha * 0.5;
      ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
    });

    // Draw ball with glow effect and dynamic color/size
    ctx.shadowColor = pongGameState.ball.color;
    ctx.shadowBlur = 20;
    ctx.fillStyle = pongGameState.ball.color;
    ctx.fillRect(
      pongGameState.ball.x - pongGameState.ball.size / 2,
      pongGameState.ball.y - pongGameState.ball.size / 2,
      pongGameState.ball.size,
      pongGameState.ball.size
    );
    ctx.shadowBlur = 0;

    // Draw player paddle
    ctx.fillStyle = "#667eea";
    ctx.fillRect(10, pongGameState.player.y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Player health bar
    const playerHealthPercent = pongGameState.player.health / pongGameState.player.maxHealth;
    ctx.fillStyle = playerHealthPercent > 0.5 ? '#00ff88' : playerHealthPercent > 0.25 ? '#ffaa00' : '#ff4444';
    ctx.fillRect(10, pongGameState.player.y - 15, PADDLE_WIDTH * playerHealthPercent, 4);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, pongGameState.player.y - 15, PADDLE_WIDTH, 4);

    // Draw AI paddle with neural activity visualization
    const aiColor = `hsl(${120 + pongGameState.ai.confidence * 60}, 70%, 50%)`;
    ctx.fillStyle = aiColor;
    ctx.fillRect(
      CANVAS_WIDTH - PADDLE_WIDTH - 10,
      pongGameState.ai.y,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    );

    // AI health bar
    const aiHealthPercent = pongGameState.ai.health / pongGameState.ai.maxHealth;
    ctx.fillStyle = aiHealthPercent > 0.5 ? '#00ff88' : aiHealthPercent > 0.25 ? '#ffaa00' : '#ff4444';
    ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH - 10, pongGameState.ai.y - 15, PADDLE_WIDTH * aiHealthPercent, 4);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(CANVAS_WIDTH - PADDLE_WIDTH - 10, pongGameState.ai.y - 15, PADDLE_WIDTH, 4);

    // Neural network confidence indicator
    ctx.fillStyle = aiColor;
    ctx.fillRect(
      CANVAS_WIDTH - PADDLE_WIDTH - 10,
      pongGameState.ai.y - 10,
      PADDLE_WIDTH * pongGameState.ai.confidence,
      5
    );

    // Draw power-ups
    pongGameState.powerUps.forEach((powerUp) => {
      if (!powerUp.collected) {
        const currentTime = Date.now();
        const timeLeft = powerUp.duration - (currentTime - powerUp.spawnTime);
        const alpha = Math.max(0.3, timeLeft / powerUp.duration);

        // Power-up glow effect
        ctx.shadowColor = getPowerUpColor(powerUp.type);
        ctx.shadowBlur = 15;

        // Draw power-up icon/shape
        ctx.fillStyle = `rgba(${getPowerUpRGB(powerUp.type)}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, 25, 0, 2 * Math.PI);
        ctx.fill();

        // Draw power-up symbol
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(getPowerUpSymbol(powerUp.type), powerUp.x, powerUp.y + 8);

        // Draw timer ring
        ctx.strokeStyle = getPowerUpColor(powerUp.type);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
          powerUp.x,
          powerUp.y,
          28,
          0,
          2 * Math.PI * (timeLeft / powerUp.duration)
        );
        ctx.stroke();
      }
    });

    // Draw particles - SPECTACULAR VISUAL EFFECTS!
    pongGameState.particles.forEach((particle) => {
      ctx.fillStyle = particle.color
        .replace(")", `, ${particle.alpha})`)
        .replace("hsl", "hsla");
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = particle.size * 2;
      ctx.fillRect(
        particle.x - particle.size / 2,
        particle.y - particle.size / 2,
        particle.size,
        particle.size
      );
    });
    ctx.shadowBlur = 0;

    // Draw lasers - PEW PEW SPECTACULAR!
    pongGameState.lasers.forEach((laser) => {
      ctx.save();
      
      // Main laser beam
      ctx.strokeStyle = laser.color;
      ctx.lineWidth = laser.width;
      ctx.globalAlpha = laser.alpha;
      
      // Add glow effect
      ctx.shadowColor = laser.glowColor;
      ctx.shadowBlur = 15;
      
      ctx.beginPath();
      ctx.moveTo(laser.x, laser.y);
      ctx.lineTo(laser.x + laser.length * Math.cos(Math.atan2(laser.dy, laser.dx)), 
                 laser.y + laser.length * Math.sin(Math.atan2(laser.dy, laser.dx)));
      ctx.stroke();
      
      // Add bright core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = laser.width * 0.3;
      ctx.shadowBlur = 5;
      ctx.stroke();
      
      ctx.restore();
    });

    // Move scores to center bottom for better visibility!
    ctx.fillStyle = "#fff";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `${pongGameState.player.score} - ${pongGameState.ai.score}`,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 40
    );

    // Add round number and speed indicator
    ctx.font = "18px Arial";
    ctx.fillStyle = "#ffd93d";
    ctx.fillText(
      `Round ${pongGameState.roundNumber} | Speed: ${Math.round(
        (pongGameState.ball.baseSpeed / BALL_SPEED) * 100
      )}%`,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 15
    );

    // Move AI stats to top left corner for better visibility
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "#4ecdc4";
    ctx.fillText(
      `Neural: ${Math.round(pongGameState.ai.confidence * 100)}%`,
      10,
      25
    );
    ctx.fillText(`Rally: ${pongGameState.rally}`, 10, 45);
    ctx.fillText(`Best: ${pongGameState.maxRally}`, 10, 65);

    // Game state overlays
    if (!pongGameState.gameStarted) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "#fff";
      ctx.font = "32px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Move to Start!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
      ctx.font = "18px Arial";
      ctx.fillText(
        "Use W/S keys or mouse to control your paddle",
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2 + 20
      );
    }

    if (pongGameState.paused) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "#fff";
      ctx.font = "48px Arial";
      ctx.textAlign = "center";
      ctx.fillText("PAUSED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

    if (pongGameState.gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "#fff";
      ctx.font = "48px Arial";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

      const winner =
        pongGameState.player.score >= 11 ? "Player Wins!" : "Neural AI Wins!";
      ctx.font = "32px Arial";
      ctx.fillStyle = pongGameState.player.score >= 11 ? "#4ecdc4" : "#ff6b6b";
      ctx.fillText(winner, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

      ctx.font = "18px Arial";
      ctx.fillStyle = "#fff";
      ctx.fillText(
        `Final Score: ${pongGameState.player.score} - ${pongGameState.ai.score}`,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2 + 60
      );
    }
  }, [gameState, canvas]);

  // Handle game events
  useEffect(() => {
    const handleEvent = (event: GameEvent) => {
      if (event.type === 'LASER_SHOOT' && event.data) {
        const { targetX, targetY } = event.data as { targetX: number; targetY: number };
        
        setGameState(prevState => {
          const pongState = prevState as PongGameState;
          const newState = { ...pongState };
          
          // Determine which side to shoot from based on target position
          if (targetX < CANVAS_WIDTH / 2) {
            // Left side - player shoots
            const laser = createLaser(
              PADDLE_WIDTH + 15,
              newState.player.y + PADDLE_HEIGHT / 2,
              1, // Direction right
              'player'
            );
            newState.lasers.push(laser);
          } else {
            // Right side - AI shoots (with some strategic intelligence)
            const laser = createLaser(
              CANVAS_WIDTH - PADDLE_WIDTH - 15,
              newState.ai.y + PADDLE_HEIGHT / 2,
              -1, // Direction left
              'ai'
            );
            newState.lasers.push(laser);
          }
          
          return newState;
        });
      }
    };

    // Store event handler reference for canvas events
    (window as unknown as Record<string, unknown>).neuralPongLaserHandler = handleEvent;
  }, [createLaser]);

  // Start game loop
  useEffect(() => {
    const pongGameState = gameState as PongGameState;

    // Guard: Only start game loop when fully initialized
    if (pongGameState.player && pongGameState.ball && !pongGameState.gameOver) {
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

export default NeuralPongGame;
