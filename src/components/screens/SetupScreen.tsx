import React, { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { GameBoard } from '@/components/GameBoard';
import { ShipSelector } from '@/components/ShipSelector';
import { Button } from '@/components/ui/button';
import { ShipConfig, Orientation, Position, SHIP_CONFIGS } from '@/types/game';
import { getShipPositions, canPlaceShip, getRemainingShips } from '@/utils/gameUtils';
import { Shuffle, Check, Anchor } from 'lucide-react';

export function SetupScreen() {
  const { state, placeShip, removeShip, autoPlaceShips, playerReady } = useGame();
  const [selectedShip, setSelectedShip] = useState<ShipConfig | null>(null);
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [hoveredPosition, setHoveredPosition] = useState<Position | null>(null);

  if (!state.players) return null;

  const currentPlayer = state.players[state.currentPlayerIndex];
  const remainingShips = getRemainingShips(currentPlayer.board);
  const allShipsPlaced = remainingShips.length === 0;

  const previewPositions = useMemo(() => {
    if (!selectedShip || !hoveredPosition) return [];
    return getShipPositions(hoveredPosition, selectedShip.size, orientation);
  }, [selectedShip, hoveredPosition, orientation]);

  const isValidPlacement = useMemo(() => {
    if (previewPositions.length === 0) return false;
    return canPlaceShip(currentPlayer.board, previewPositions);
  }, [previewPositions, currentPlayer.board]);

  const handleCellClick = (position: Position) => {
    if (!selectedShip) {
      // Check if clicking on an existing ship to remove it
      const cell = currentPlayer.board.cells[position.row][position.col];
      if (cell.shipId) {
        removeShip(currentPlayer.id, cell.shipId);
      }
      return;
    }

    const positions = getShipPositions(position, selectedShip.size, orientation);
    if (canPlaceShip(currentPlayer.board, positions)) {
      placeShip(currentPlayer.id, selectedShip.id, position, orientation);
      setSelectedShip(null);
    }
  };

  const handleAutoPlace = () => {
    autoPlaceShips(currentPlayer.id);
    setSelectedShip(null);
  };

  const handleReady = () => {
    playerReady(currentPlayer.id);
  };

  return (
    <div className="min-h-screen ocean-bg tactical-overlay flex flex-col p-4">
      {/* Header */}
      <header className="text-center mb-6 animate-fadeIn">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Anchor className="w-6 h-6 text-primary" />
          <h1 className="font-display text-2xl md:text-3xl text-primary text-glow">
            POSICIONE SUA FROTA
          </h1>
          <Anchor className="w-6 h-6 text-primary" />
        </div>
        <p className="font-body text-lg text-muted-foreground">
          Comandante {currentPlayer.name}, posicione seus navios estrategicamente
        </p>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-12">
        {/* Board */}
        <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <div className="bg-card/50 p-4 rounded-xl border border-game-grid">
            <GameBoard
              board={currentPlayer.board}
              showShips={true}
              onCellClick={handleCellClick}
              onCellHover={setHoveredPosition}
              highlightedCells={previewPositions}
              highlightType={isValidPlacement ? 'valid' : 'invalid'}
              size="lg"
            />
          </div>
        </div>

        {/* Ship selector and controls */}
        <div className="w-full max-w-xs lg:max-w-sm space-y-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <div className="bg-card/50 p-4 rounded-xl border border-game-grid">
            <ShipSelector
              ships={SHIP_CONFIGS}
              placedShips={currentPlayer.board.ships}
              selectedShip={selectedShip}
              orientation={orientation}
              onSelectShip={setSelectedShip}
              onToggleOrientation={() =>
                setOrientation((o) => (o === 'horizontal' ? 'vertical' : 'horizontal'))
              }
            />
          </div>

          <div className="space-y-3">
            <Button
              variant="tactical"
              className="w-full"
              onClick={handleAutoPlace}
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Posicionamento Automático
            </Button>

            <Button
              variant="default"
              className="w-full"
              onClick={handleReady}
              disabled={!allShipsPlaced}
            >
              <Check className="w-4 h-4 mr-2" />
              {allShipsPlaced ? 'Pronto para Batalha!' : `Faltam ${remainingShips.length} navios`}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-1 font-body">
            <p>• Selecione um navio e clique no tabuleiro para posicionar</p>
            <p>• Clique em um navio posicionado para removê-lo</p>
            <p>• Use o botão de rotação para alternar orientação</p>
          </div>
        </div>
      </div>
    </div>
  );
}
