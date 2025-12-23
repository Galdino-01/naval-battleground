export type CellState = 'empty' | 'ship' | 'hit' | 'miss';

export type Orientation = 'horizontal' | 'vertical';

export type GamePhase = 'menu' | 'setup' | 'waiting' | 'playing' | 'finished';

export type GameMode = 'singleplayer' | 'multiplayer';

export type PlayerType = 'human' | 'ai';

export interface Position {
  row: number;
  col: number;
}

export interface Ship {
  id: string;
  name: string;
  size: number;
  positions: Position[];
  orientation: Orientation;
  hits: number;
  isSunk: boolean;
}

export interface ShipConfig {
  id: string;
  name: string;
  size: number;
}

export interface Cell {
  position: Position;
  state: CellState;
  shipId?: string;
}

export interface Board {
  cells: Cell[][];
  ships: Ship[];
}

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  board: Board;
  attackBoard: Board;
  isReady: boolean;
}

export interface AttackResult {
  position: Position;
  isHit: boolean;
  shipId?: string;
  isSunk?: boolean;
  shipName?: string;
}

export interface GameStats {
  totalShots: number;
  hits: number;
  misses: number;
  accuracy: number;
  shipsDestroyed: number;
  startTime: number;
  endTime?: number;
}

export interface GameState {
  phase: GamePhase;
  mode: GameMode;
  players: [Player, Player] | null;
  currentPlayerIndex: number;
  winner: Player | null;
  stats: [GameStats, GameStats] | null;
}

export const SHIP_CONFIGS: ShipConfig[] = [
  { id: 'carrier', name: 'Porta-aviões', size: 5 },
  { id: 'battleship', name: 'Navio-tanque', size: 4 },
  { id: 'cruiser', name: 'Contratorpedeiro', size: 3 },
  { id: 'submarine', name: 'Submarino', size: 3 },
  { id: 'destroyer', name: 'Destroyer', size: 2 },
];

export const BOARD_SIZE = 10;

export const COLUMN_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const ROW_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
