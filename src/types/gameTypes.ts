// Shared game engine types

export interface GameState {
  [key: string]: unknown;
}

export interface ControlState {
  keyboard: { [key: string]: boolean };
  mouse: { x: number; y: number; buttons: boolean[] };
  touch: TouchPoint[];
  gamepad: GamepadState | null;
}

export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  force?: number;
}

export interface GamepadState {
  buttons: boolean[];
  axes: number[];
  connected: boolean;
}

export interface GameEvent {
  type: 'start' | 'pause' | 'resume' | 'end' | 'score' | 'achievement';
  data?: Record<string, unknown>;
}

export interface GameEngineProps {
  canvas: React.RefObject<HTMLCanvasElement | null>;
  gameState: GameState;
  setGameState: (state: GameState | ((prev: GameState) => GameState)) => void;
  controls: ControlState;
  onGameEvent: (event: GameEvent) => void;
}

export interface GameConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: number; // 1-10
  controls: ('keyboard' | 'mouse' | 'touch' | 'gamepad')[];
  category: 'arcade' | 'puzzle' | 'action' | 'strategy' | 'experimental';
  component: React.FC<GameEngineProps>;
}
