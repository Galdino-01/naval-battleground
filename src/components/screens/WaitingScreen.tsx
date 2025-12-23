import React from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight } from 'lucide-react';

export function WaitingScreen() {
  const { state, nextPlayerSetup } = useGame();

  if (!state.players) return null;

  const player1 = state.players[0];
  const player2 = state.players[1];

  return (
    <div className="min-h-screen ocean-bg tactical-overlay flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 animate-fadeIn max-w-md">
        <Shield className="w-20 h-20 text-primary mx-auto animate-pulse" />
        
        <div className="space-y-4">
          <h1 className="font-display text-2xl md:text-3xl text-primary text-glow">
            AGUARDANDO JOGADOR 2
          </h1>
          <p className="font-body text-lg text-muted-foreground">
            {player1.name} posicionou seus navios.
          </p>
          <p className="font-body text-lg text-foreground">
            Agora é a vez de <span className="text-primary font-bold">{player2.name}</span> posicionar sua frota.
          </p>
        </div>

        <div className="bg-card/50 p-6 rounded-xl border border-game-grid">
          <p className="text-muted-foreground mb-4 font-body">
            ⚠️ Certifique-se de que {player1.name} não está olhando para a tela.
          </p>
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={nextPlayerSetup}
          >
            Continuar para {player2.name}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
