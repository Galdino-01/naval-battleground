import React from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Home, Target, Clock, Crosshair, Ship } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EndScreen() {
  const { state, resetGame, goToMenu } = useGame();

  if (!state.winner || !state.stats || !state.players) return null;

  const winnerIndex = state.players.findIndex((p) => p.id === state.winner?.id);
  const winnerStats = state.stats[winnerIndex];
  const loserStats = state.stats[winnerIndex === 0 ? 1 : 0];

  const gameDuration = winnerStats.endTime
    ? Math.round((winnerStats.endTime - winnerStats.startTime) / 1000)
    : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isPlayerWin = state.winner.type === 'human';

  return (
    <div className="min-h-screen ocean-bg tactical-overlay flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 animate-fadeIn max-w-lg">
        {/* Victory/Defeat icon */}
        <div
          className={cn(
            'w-24 h-24 rounded-full flex items-center justify-center mx-auto',
            isPlayerWin ? 'bg-game-valid/20 glow-primary' : 'bg-destructive/20 glow-accent'
          )}
        >
          {isPlayerWin ? (
            <Trophy className="w-12 h-12 text-game-valid" />
          ) : (
            <Ship className="w-12 h-12 text-destructive rotate-45" />
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1
            className={cn(
              'font-display text-4xl md:text-5xl font-bold',
              isPlayerWin ? 'text-game-valid' : 'text-destructive'
            )}
          >
            {isPlayerWin ? 'VITÓRIA!' : 'DERROTA'}
          </h1>
          <p className="font-body text-xl text-foreground">
            {isPlayerWin
              ? `Parabéns, ${state.winner.name}!`
              : `${state.winner.name} venceu a batalha.`}
          </p>
          <p className="text-muted-foreground font-body">
            {isPlayerWin
              ? 'Você destruiu a frota inimiga!'
              : 'Sua frota foi destruída.'}
          </p>
        </div>

        {/* Stats */}
        <div className="bg-card/50 p-6 rounded-xl border border-game-grid space-y-4">
          <h2 className="font-display text-lg text-primary mb-4">Estatísticas da Batalha</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <Target className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-display text-foreground">{winnerStats.totalShots}</p>
              <p className="text-xs text-muted-foreground font-body">Tiros Disparados</p>
            </div>
            
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <Crosshair className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-display text-foreground">
                {winnerStats.accuracy.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground font-body">Precisão</p>
            </div>
            
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <Ship className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-2xl font-display text-foreground">{winnerStats.shipsDestroyed}</p>
              <p className="text-xs text-muted-foreground font-body">Navios Destruídos</p>
            </div>
            
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-display text-foreground">{formatTime(gameDuration)}</p>
              <p className="text-xs text-muted-foreground font-body">Tempo de Batalha</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="default"
            size="lg"
            onClick={resetGame}
            className="min-w-[180px]"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Jogar Novamente
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={goToMenu}
            className="min-w-[180px]"
          >
            <Home className="w-5 h-5 mr-2" />
            Menu Principal
          </Button>
        </div>
      </div>
    </div>
  );
}
