import React, { useEffect, useState, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { GameBoard } from '@/components/GameBoard';
import { Position, COLUMN_LABELS, ROW_LABELS } from '@/types/game';
import { hasAlreadyAttacked } from '@/utils/gameUtils';
import { Crosshair, Ship, Target, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function GameScreen() {
  const { state, attack, aiAttack } = useGame();
  const { toast } = useToast();
  const [lastAttackResult, setLastAttackResult] = useState<{
    isHit: boolean;
    isSunk?: boolean;
    shipName?: string;
  } | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);

  if (!state.players || !state.stats) return null;

  const currentPlayer = state.players[state.currentPlayerIndex];
  const opponentIndex = state.currentPlayerIndex === 0 ? 1 : 0;
  const opponent = state.players[opponentIndex];
  const isPlayerTurn = currentPlayer.type === 'human';
  const isMultiplayer = state.mode === 'multiplayer';

  // AI attack logic
  useEffect(() => {
    if (state.phase === 'playing' && currentPlayer.type === 'ai' && !isAIThinking) {
      setIsAIThinking(true);
      const delay = 800 + Math.random() * 800; // 0.8-1.6s delay
      
      const timer = setTimeout(() => {
        aiAttack();
        setIsAIThinking(false);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [state.currentPlayerIndex, state.phase, currentPlayer.type, aiAttack, isAIThinking]);

  const handleAttack = useCallback(
    (position: Position) => {
      if (!isPlayerTurn || isAIThinking) return;
      if (hasAlreadyAttacked(currentPlayer.attackBoard, position)) {
        toast({
          title: 'Posição inválida',
          description: 'Você já atacou esta posição!',
          variant: 'destructive',
        });
        return;
      }

      // Get result before attack
      const cell = opponent.board.cells[position.row][position.col];
      const ship = opponent.board.ships.find((s) => s.id === cell.shipId);
      const willHit = cell.state === 'ship';
      const willSink = ship && ship.hits + 1 >= ship.size;

      attack(position);

      // Show feedback
      const posLabel = `${COLUMN_LABELS[position.col]}${ROW_LABELS[position.row]}`;
      
      if (willHit) {
        if (willSink) {
          toast({
            title: '💥 NAVIO DESTRUÍDO!',
            description: `${ship?.name} afundou em ${posLabel}!`,
          });
        } else {
          toast({
            title: '🎯 ACERTO!',
            description: `Você atingiu o alvo em ${posLabel}!`,
          });
        }
        setLastAttackResult({ isHit: true, isSunk: willSink, shipName: ship?.name });
      } else {
        toast({
          title: '💦 Água!',
          description: `Tiro na água em ${posLabel}.`,
        });
        setLastAttackResult({ isHit: false });
      }
    },
    [isPlayerTurn, isAIThinking, currentPlayer.attackBoard, opponent.board, attack, toast]
  );

  const playerStats = state.stats[state.currentPlayerIndex];
  const myShipsRemaining = state.players[state.currentPlayerIndex].board.ships.filter(
    (s) => !s.isSunk
  ).length;
  const enemyShipsRemaining = opponent.board.ships.filter((s) => !s.isSunk).length;

  return (
    <div className="min-h-screen ocean-bg tactical-overlay flex flex-col p-4">
      {/* Header */}
      <header className="text-center mb-4 animate-fadeIn">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Target className="w-6 h-6 text-primary" />
          <h1 className="font-display text-xl md:text-2xl text-primary text-glow">
            BATALHA EM ANDAMENTO
          </h1>
          <Target className="w-6 h-6 text-primary" />
        </div>
        
        {/* Turn indicator */}
        <div
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300',
            isPlayerTurn
              ? 'border-primary bg-primary/20 text-primary'
              : 'border-accent bg-accent/20 text-accent'
          )}
        >
          {isAIThinking ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="font-body font-semibold">Computador pensando...</span>
            </>
          ) : (
            <>
              <Crosshair className="w-4 h-4" />
              <span className="font-body font-semibold">
                {isMultiplayer
                  ? `Turno de ${currentPlayer.name}`
                  : isPlayerTurn
                  ? 'Seu turno - Ataque!'
                  : 'Turno do Computador'}
              </span>
            </>
          )}
        </div>
      </header>

      {/* Game boards */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8">
        {/* Attack board (opponent's ships) */}
        <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <div className="text-center mb-2">
            <h2 className="font-display text-lg text-primary flex items-center justify-center gap-2">
              <Crosshair className="w-5 h-5" />
              {isMultiplayer ? `Tabuleiro de ${opponent.name}` : 'Tabuleiro Inimigo'}
            </h2>
            <p className="text-sm text-muted-foreground font-body">
              {enemyShipsRemaining} navios restantes
            </p>
          </div>
          <div className="bg-card/50 p-3 rounded-xl border border-game-grid">
            <GameBoard
              board={currentPlayer.attackBoard}
              showShips={false}
              isAttackBoard={true}
              onCellClick={handleAttack}
              disabled={!isPlayerTurn || isAIThinking}
              size="md"
            />
          </div>
        </div>

        {/* Stats panel */}
        <div className="hidden lg:flex flex-col items-center gap-4 px-4">
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
          <div className="bg-card/50 p-4 rounded-xl border border-game-grid space-y-3 min-w-[140px]">
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-body">Tiros</p>
              <p className="text-2xl font-display text-primary">{playerStats.totalShots}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-body">Precisão</p>
              <p className="text-2xl font-display text-primary">
                {playerStats.totalShots > 0 ? playerStats.accuracy.toFixed(0) : 0}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-body">Destruídos</p>
              <p className="text-2xl font-display text-accent">{playerStats.shipsDestroyed}</p>
            </div>
          </div>
          <div className="w-px h-20 bg-gradient-to-b from-primary/50 via-transparent to-transparent" />
        </div>

        {/* Player's own board */}
        <div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <div className="text-center mb-2">
            <h2 className="font-display text-lg text-primary flex items-center justify-center gap-2">
              <Ship className="w-5 h-5" />
              {isMultiplayer ? `Seu Tabuleiro (${currentPlayer.name})` : 'Sua Frota'}
            </h2>
            <p className="text-sm text-muted-foreground font-body">
              {myShipsRemaining} navios restantes
            </p>
          </div>
          <div className="bg-card/50 p-3 rounded-xl border border-game-grid">
            <GameBoard
              board={currentPlayer.board}
              showShips={true}
              disabled={true}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Mobile stats */}
      <div className="lg:hidden flex justify-center gap-6 mt-4 text-center">
        <div>
          <p className="text-xs text-muted-foreground font-body">Tiros</p>
          <p className="text-lg font-display text-primary">{playerStats.totalShots}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-body">Precisão</p>
          <p className="text-lg font-display text-primary">
            {playerStats.totalShots > 0 ? playerStats.accuracy.toFixed(0) : 0}%
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-body">Destruídos</p>
          <p className="text-lg font-display text-accent">{playerStats.shipsDestroyed}</p>
        </div>
      </div>

      {/* Multiplayer turn warning */}
      {isMultiplayer && !isPlayerTurn && (
        <div className="fixed inset-0 bg-background/90 flex items-center justify-center z-50 animate-fadeIn">
          <div className="text-center space-y-4 p-8">
            <AlertTriangle className="w-16 h-16 text-accent mx-auto animate-pulse" />
            <h2 className="font-display text-2xl text-primary">
              Turno de {currentPlayer.name}
            </h2>
            <p className="text-muted-foreground font-body">
              Passe o dispositivo para o próximo jogador
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
