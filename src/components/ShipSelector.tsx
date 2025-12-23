import React from 'react';
import { ShipConfig, Orientation, Ship } from '@/types/game';
import { cn } from '@/lib/utils';
import { RotateCw } from 'lucide-react';
import { Button } from './ui/button';

interface ShipSelectorProps {
  ships: ShipConfig[];
  placedShips: Ship[];
  selectedShip: ShipConfig | null;
  orientation: Orientation;
  onSelectShip: (ship: ShipConfig | null) => void;
  onToggleOrientation: () => void;
}

export function ShipSelector({
  ships,
  placedShips,
  selectedShip,
  orientation,
  onSelectShip,
  onToggleOrientation,
}: ShipSelectorProps) {
  const isPlaced = (shipId: string) => placedShips.some((s) => s.id === shipId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-primary">Navios</h3>
        <Button
          variant="tactical"
          size="sm"
          onClick={onToggleOrientation}
          className="gap-2"
        >
          <RotateCw className="w-4 h-4" />
          {orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
        </Button>
      </div>

      <div className="space-y-2">
        {ships.map((ship) => {
          const placed = isPlaced(ship.id);
          const isSelected = selectedShip?.id === ship.id;

          return (
            <button
              key={ship.id}
              onClick={() => {
                if (!placed) {
                  onSelectShip(isSelected ? null : ship);
                }
              }}
              disabled={placed}
              className={cn(
                'w-full p-3 rounded-lg border-2 transition-all duration-200',
                'flex items-center justify-between',
                placed
                  ? 'border-game-valid/50 bg-game-valid/10 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'border-primary bg-primary/20 glow-primary'
                  : 'border-game-grid bg-secondary hover:border-primary/50 cursor-pointer'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-sm text-foreground">
                  {ship.name}
                </span>
                {placed && (
                  <span className="text-xs text-game-valid">✓</span>
                )}
              </div>
              <div className="flex gap-1">
                {Array.from({ length: ship.size }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-4 h-4 rounded-sm',
                      placed
                        ? 'bg-game-valid/50'
                        : isSelected
                        ? 'bg-primary'
                        : 'bg-game-ship'
                    )}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
