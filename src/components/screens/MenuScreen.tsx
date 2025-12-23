import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Anchor, Users, BookOpen, Waves } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function MenuScreen() {
  const { setMode, startSetup } = useGame();
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showMultiplayerDialog, setShowMultiplayerDialog] = useState(false);
  const [showRulesDialog, setShowRulesDialog] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');

  const handleSinglePlayer = () => {
    setShowNameDialog(true);
  };

  const handleMultiplayer = () => {
    setShowMultiplayerDialog(true);
  };

  const startSinglePlayer = () => {
    if (playerName.trim()) {
      setMode('singleplayer');
      startSetup([playerName.trim()]);
      setShowNameDialog(false);
    }
  };

  const startMultiplayer = () => {
    if (player1Name.trim() && player2Name.trim()) {
      setMode('multiplayer');
      startSetup([player1Name.trim(), player2Name.trim()]);
      setShowMultiplayerDialog(false);
    }
  };

  return (
    <div className="min-h-screen ocean-bg tactical-overlay flex flex-col items-center justify-center p-4">
      {/* Animated waves background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ocean-surface/20 to-transparent" />
        <Waves className="absolute bottom-10 left-10 w-24 h-24 text-primary/10 animate-wave" />
        <Waves className="absolute bottom-20 right-20 w-32 h-32 text-primary/5 animate-wave" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center space-y-12 animate-fadeIn">
        {/* Logo/Title */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Anchor className="w-12 h-12 md:w-16 md:h-16 text-primary animate-wave" />
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary text-glow tracking-wider">
              BATALHA NAVAL
            </h1>
            <Anchor className="w-12 h-12 md:w-16 md:h-16 text-primary animate-wave" style={{ animationDelay: '0.5s' }} />
          </div>
          <p className="font-body text-lg md:text-xl text-muted-foreground tracking-wide">
            Destrua a frota inimiga antes que destruam a sua
          </p>
        </div>

        {/* Menu buttons */}
        <div className="space-y-4 max-w-md mx-auto">
          <Button
            variant="menu"
            size="xl"
            className="w-full animate-slideUp"
            style={{ animationDelay: '0.1s' }}
            onClick={handleSinglePlayer}
          >
            <Users className="w-6 h-6 mr-2" />
            Jogar Single Player
          </Button>

          <Button
            variant="menu"
            size="xl"
            className="w-full animate-slideUp"
            style={{ animationDelay: '0.2s' }}
            onClick={handleMultiplayer}
          >
            <Users className="w-6 h-6 mr-2" />
            Jogar Multiplayer
          </Button>

          <Button
            variant="outline"
            size="xl"
            className="w-full animate-slideUp"
            style={{ animationDelay: '0.3s' }}
            onClick={() => setShowRulesDialog(true)}
          >
            <BookOpen className="w-6 h-6 mr-2" />
            Regras do Jogo
          </Button>
        </div>

        {/* Footer decoration */}
        <div className="pt-8 flex items-center justify-center gap-2 text-muted-foreground">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-primary/50" />
          <span className="font-display text-sm tracking-widest">COMANDO NAVAL</span>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-primary/50" />
        </div>
      </div>

      {/* Single Player Name Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="bg-card border-game-grid">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary">
              Identifique-se, Comandante
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Seu nome"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startSinglePlayer()}
              className="bg-secondary border-game-grid text-foreground placeholder:text-muted-foreground"
            />
            <Button
              variant="default"
              className="w-full"
              onClick={startSinglePlayer}
              disabled={!playerName.trim()}
            >
              Iniciar Batalha
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Multiplayer Names Dialog */}
      <Dialog open={showMultiplayerDialog} onOpenChange={setShowMultiplayerDialog}>
        <DialogContent className="bg-card border-game-grid">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary">
              Identifiquem-se, Comandantes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Nome do Jogador 1"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              className="bg-secondary border-game-grid text-foreground placeholder:text-muted-foreground"
            />
            <Input
              placeholder="Nome do Jogador 2"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startMultiplayer()}
              className="bg-secondary border-game-grid text-foreground placeholder:text-muted-foreground"
            />
            <Button
              variant="default"
              className="w-full"
              onClick={startMultiplayer}
              disabled={!player1Name.trim() || !player2Name.trim()}
            >
              Iniciar Batalha
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rules Dialog */}
      <Dialog open={showRulesDialog} onOpenChange={setShowRulesDialog}>
        <DialogContent className="bg-card border-game-grid max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary">
              Regras do Jogo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4 text-foreground font-body">
            <section>
              <h3 className="font-display text-lg text-primary mb-2">Objetivo</h3>
              <p className="text-muted-foreground">
                Destruir todos os navios do oponente antes que ele destrua os seus.
              </p>
            </section>

            <section>
              <h3 className="font-display text-lg text-primary mb-2">Navios</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Porta-aviões: 5 casas</li>
                <li>• Navio-tanque: 4 casas</li>
                <li>• Contratorpedeiro: 3 casas</li>
                <li>• Submarino: 3 casas</li>
                <li>• Destroyer: 2 casas</li>
              </ul>
            </section>

            <section>
              <h3 className="font-display text-lg text-primary mb-2">Posicionamento</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Navios podem ser posicionados na horizontal ou vertical</li>
                <li>• Navios não podem se sobrepor</li>
                <li>• Navios não podem encostar uns nos outros</li>
              </ul>
            </section>

            <section>
              <h3 className="font-display text-lg text-primary mb-2">Gameplay</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Jogadores alternam turnos atacando posições no tabuleiro inimigo</li>
                <li>• Acertos são marcados em vermelho</li>
                <li>• Erros são marcados em azul</li>
                <li>• O jogo termina quando todos os navios de um jogador são destruídos</li>
              </ul>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
