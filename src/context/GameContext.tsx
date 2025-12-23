import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  GameState,
  GamePhase,
  GameMode,
  Player,
  Position,
  Board,
  GameStats,
  AttackResult,
  SHIP_CONFIGS,
} from '@/types/game';
import {
  createEmptyBoard,
  placeShip,
  removeShip,
  autoPlaceShips,
  processAttack,
  markAttackOnBoard,
  hasAlreadyAttacked,
  areAllShipsSunk,
  getRemainingShips,
} from '@/utils/gameUtils';
import { getAIMove, updateAIAfterHit, resetAIMemory } from '@/utils/aiUtils';

type GameAction =
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'START_SETUP'; playerNames: [string, string?] }
  | { type: 'PLACE_SHIP'; playerId: string; shipId: string; position: Position; orientation: 'horizontal' | 'vertical' }
  | { type: 'REMOVE_SHIP'; playerId: string; shipId: string }
  | { type: 'AUTO_PLACE_SHIPS'; playerId: string }
  | { type: 'PLAYER_READY'; playerId: string }
  | { type: 'ATTACK'; position: Position }
  | { type: 'AI_ATTACK' }
  | { type: 'SWITCH_TURN' }
  | { type: 'END_GAME'; winnerId: string }
  | { type: 'NEXT_PLAYER_SETUP' }
  | { type: 'RESET_GAME' }
  | { type: 'GO_TO_MENU' };

const initialState: GameState = {
  phase: 'menu',
  mode: 'singleplayer',
  players: null,
  currentPlayerIndex: 0,
  winner: null,
  stats: null,
};

function createPlayer(id: string, name: string, type: 'human' | 'ai'): Player {
  return {
    id,
    name,
    type,
    board: createEmptyBoard(),
    attackBoard: createEmptyBoard(),
    isReady: false,
  };
}

function createStats(): GameStats {
  return {
    totalShots: 0,
    hits: 0,
    misses: 0,
    accuracy: 0,
    shipsDestroyed: 0,
    startTime: Date.now(),
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'START_SETUP': {
      const player1 = createPlayer('player1', action.playerNames[0], 'human');
      let player2: Player;
      
      if (state.mode === 'singleplayer') {
        player2 = createPlayer('player2', 'Computador', 'ai');
        // Auto-place ships for AI
        const aiBoard = autoPlaceShips(player2.board);
        if (aiBoard) {
          player2.board = aiBoard;
          player2.isReady = true;
        }
      } else {
        player2 = createPlayer('player2', action.playerNames[1] || 'Jogador 2', 'human');
      }

      return {
        ...state,
        phase: 'setup',
        players: [player1, player2],
        currentPlayerIndex: 0,
        stats: [createStats(), createStats()],
      };
    }

    case 'PLACE_SHIP': {
      if (!state.players) return state;
      
      const playerIndex = state.players.findIndex((p) => p.id === action.playerId);
      if (playerIndex === -1) return state;

      const player = state.players[playerIndex];
      const shipConfig = SHIP_CONFIGS.find((s) => s.id === action.shipId);
      if (!shipConfig) return state;

      const newBoard = placeShip(player.board, shipConfig, action.position, action.orientation);
      if (!newBoard) return state;

      const newPlayers = [...state.players] as [Player, Player];
      newPlayers[playerIndex] = { ...player, board: newBoard };

      return { ...state, players: newPlayers };
    }

    case 'REMOVE_SHIP': {
      if (!state.players) return state;
      
      const playerIndex = state.players.findIndex((p) => p.id === action.playerId);
      if (playerIndex === -1) return state;

      const player = state.players[playerIndex];
      const newBoard = removeShip(player.board, action.shipId);

      const newPlayers = [...state.players] as [Player, Player];
      newPlayers[playerIndex] = { ...player, board: newBoard, isReady: false };

      return { ...state, players: newPlayers };
    }

    case 'AUTO_PLACE_SHIPS': {
      if (!state.players) return state;
      
      const playerIndex = state.players.findIndex((p) => p.id === action.playerId);
      if (playerIndex === -1) return state;

      const newBoard = autoPlaceShips(createEmptyBoard());
      if (!newBoard) return state;

      const newPlayers = [...state.players] as [Player, Player];
      newPlayers[playerIndex] = { ...newPlayers[playerIndex], board: newBoard };

      return { ...state, players: newPlayers };
    }

    case 'PLAYER_READY': {
      if (!state.players) return state;
      
      const playerIndex = state.players.findIndex((p) => p.id === action.playerId);
      if (playerIndex === -1) return state;

      const player = state.players[playerIndex];
      
      // Check if all ships are placed
      if (getRemainingShips(player.board).length > 0) return state;

      const newPlayers = [...state.players] as [Player, Player];
      newPlayers[playerIndex] = { ...player, isReady: true };

      // Check if both players are ready
      const allReady = newPlayers.every((p) => p.isReady);
      
      if (allReady) {
        resetAIMemory();
        return { ...state, players: newPlayers, phase: 'playing', currentPlayerIndex: 0 };
      }

      // In multiplayer, switch to next player setup
      if (state.mode === 'multiplayer' && playerIndex === 0) {
        return { ...state, players: newPlayers, phase: 'waiting' };
      }

      return { ...state, players: newPlayers };
    }

    case 'NEXT_PLAYER_SETUP': {
      return { ...state, phase: 'setup', currentPlayerIndex: 1 };
    }

    case 'ATTACK': {
      if (!state.players || !state.stats || state.phase !== 'playing') return state;

      const attackingPlayer = state.players[state.currentPlayerIndex];
      const defendingIndex = state.currentPlayerIndex === 0 ? 1 : 0;
      const defendingPlayer = state.players[defendingIndex];

      if (hasAlreadyAttacked(attackingPlayer.attackBoard, action.position)) {
        return state;
      }

      // Process attack on defender's board
      const result = processAttack(defendingPlayer.board, action.position);

      // Update attacker's attack board
      const newAttackBoard = markAttackOnBoard(
        attackingPlayer.attackBoard,
        action.position,
        result.isHit
      );

      // Update stats
      const newStats = [...state.stats] as [GameStats, GameStats];
      newStats[state.currentPlayerIndex] = {
        ...newStats[state.currentPlayerIndex],
        totalShots: newStats[state.currentPlayerIndex].totalShots + 1,
        hits: result.isHit
          ? newStats[state.currentPlayerIndex].hits + 1
          : newStats[state.currentPlayerIndex].hits,
        misses: !result.isHit
          ? newStats[state.currentPlayerIndex].misses + 1
          : newStats[state.currentPlayerIndex].misses,
        accuracy:
          ((result.isHit
            ? newStats[state.currentPlayerIndex].hits + 1
            : newStats[state.currentPlayerIndex].hits) /
            (newStats[state.currentPlayerIndex].totalShots + 1)) *
          100,
        shipsDestroyed: result.isSunk
          ? newStats[state.currentPlayerIndex].shipsDestroyed + 1
          : newStats[state.currentPlayerIndex].shipsDestroyed,
      };

      const newPlayers = [...state.players] as [Player, Player];
      newPlayers[state.currentPlayerIndex] = { ...attackingPlayer, attackBoard: newAttackBoard };
      newPlayers[defendingIndex] = defendingPlayer;

      // Check for win
      if (areAllShipsSunk(defendingPlayer.board)) {
        newStats[state.currentPlayerIndex].endTime = Date.now();
        return {
          ...state,
          players: newPlayers,
          stats: newStats,
          phase: 'finished',
          winner: attackingPlayer,
        };
      }

      // Switch turn
      return {
        ...state,
        players: newPlayers,
        stats: newStats,
        currentPlayerIndex: defendingIndex,
      };
    }

    case 'AI_ATTACK': {
      if (!state.players || !state.stats || state.phase !== 'playing') return state;
      if (state.currentPlayerIndex !== 1) return state;

      const aiPlayer = state.players[1];
      const humanPlayer = state.players[0];

      const aiMove = getAIMove(aiPlayer.attackBoard);
      const result = processAttack(humanPlayer.board, aiMove);

      // Update AI memory
      updateAIAfterHit(aiMove, result.isHit, result.isSunk || false, aiPlayer.attackBoard);

      // Update AI's attack board
      const newAttackBoard = markAttackOnBoard(aiPlayer.attackBoard, aiMove, result.isHit);

      // Update stats
      const newStats = [...state.stats] as [GameStats, GameStats];
      newStats[1] = {
        ...newStats[1],
        totalShots: newStats[1].totalShots + 1,
        hits: result.isHit ? newStats[1].hits + 1 : newStats[1].hits,
        misses: !result.isHit ? newStats[1].misses + 1 : newStats[1].misses,
        accuracy:
          ((result.isHit ? newStats[1].hits + 1 : newStats[1].hits) /
            (newStats[1].totalShots + 1)) *
          100,
        shipsDestroyed: result.isSunk ? newStats[1].shipsDestroyed + 1 : newStats[1].shipsDestroyed,
      };

      const newPlayers = [...state.players] as [Player, Player];
      newPlayers[1] = { ...aiPlayer, attackBoard: newAttackBoard };
      newPlayers[0] = humanPlayer;

      // Check for AI win
      if (areAllShipsSunk(humanPlayer.board)) {
        newStats[1].endTime = Date.now();
        return {
          ...state,
          players: newPlayers,
          stats: newStats,
          phase: 'finished',
          winner: aiPlayer,
        };
      }

      // Switch turn back to human
      return {
        ...state,
        players: newPlayers,
        stats: newStats,
        currentPlayerIndex: 0,
      };
    }

    case 'RESET_GAME':
      return initialState;

    case 'GO_TO_MENU':
      return { ...initialState };

    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  setMode: (mode: GameMode) => void;
  startSetup: (playerNames: [string, string?]) => void;
  placeShip: (playerId: string, shipId: string, position: Position, orientation: 'horizontal' | 'vertical') => void;
  removeShip: (playerId: string, shipId: string) => void;
  autoPlaceShips: (playerId: string) => void;
  playerReady: (playerId: string) => void;
  attack: (position: Position) => void;
  aiAttack: () => void;
  nextPlayerSetup: () => void;
  resetGame: () => void;
  goToMenu: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const setMode = useCallback((mode: GameMode) => {
    dispatch({ type: 'SET_MODE', mode });
  }, []);

  const startSetup = useCallback((playerNames: [string, string?]) => {
    dispatch({ type: 'START_SETUP', playerNames });
  }, []);

  const placeShipAction = useCallback(
    (playerId: string, shipId: string, position: Position, orientation: 'horizontal' | 'vertical') => {
      dispatch({ type: 'PLACE_SHIP', playerId, shipId, position, orientation });
    },
    []
  );

  const removeShipAction = useCallback((playerId: string, shipId: string) => {
    dispatch({ type: 'REMOVE_SHIP', playerId, shipId });
  }, []);

  const autoPlaceShipsAction = useCallback((playerId: string) => {
    dispatch({ type: 'AUTO_PLACE_SHIPS', playerId });
  }, []);

  const playerReady = useCallback((playerId: string) => {
    dispatch({ type: 'PLAYER_READY', playerId });
  }, []);

  const attack = useCallback((position: Position) => {
    dispatch({ type: 'ATTACK', position });
  }, []);

  const aiAttack = useCallback(() => {
    dispatch({ type: 'AI_ATTACK' });
  }, []);

  const nextPlayerSetup = useCallback(() => {
    dispatch({ type: 'NEXT_PLAYER_SETUP' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const goToMenu = useCallback(() => {
    dispatch({ type: 'GO_TO_MENU' });
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        setMode,
        startSetup,
        placeShip: placeShipAction,
        removeShip: removeShipAction,
        autoPlaceShips: autoPlaceShipsAction,
        playerReady,
        attack,
        aiAttack,
        nextPlayerSetup,
        resetGame,
        goToMenu,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
