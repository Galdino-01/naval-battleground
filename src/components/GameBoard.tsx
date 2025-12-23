import React from 'react';
import { Board, Position, COLUMN_LABELS, ROW_LABELS, CellState, Ship } from '@/types/game';
import { cn } from '@/lib/utils';
import { ShipSprite } from './ShipSprite';

interface GameBoardProps {
  board: Board;
  showShips?: boolean;
  isAttackBoard?: boolean;
  onCellClick?: (position: Position) => void;
  onCellHover?: (position: Position | null) => void;
  highlightedCells?: Position[];
  highlightType?: 'valid' | 'invalid';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function GameBoard({
  board,
  showShips = true,
  isAttackBoard = false,
  onCellClick,
  onCellHover,
  highlightedCells = [],
  highlightType = 'valid',
  disabled = false,
  size = 'md',
}: GameBoardProps) {
  const cellSizes = {
    sm: 'w-6 h-6 sm:w-7 sm:h-7',
    md: 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9',
    lg: 'w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11',
  };

  const labelSizes = {
    sm: 'text-[10px] w-4 sm:w-5',
    md: 'text-xs w-5 sm:w-6',
    lg: 'text-sm w-6 sm:w-8',
  };

  const isHighlighted = (pos: Position) =>
    highlightedCells.some((h) => h.row === pos.row && h.col === pos.col);

  // Find ship info for a cell
  const getShipInfo = (shipId: string | undefined): { ship: Ship | undefined; segmentIndex: number } => {
    if (!shipId) return { ship: undefined, segmentIndex: 0 };
    const ship = board.ships.find(s => s.id === shipId);
    return { ship, segmentIndex: 0 };
  };

  // Get segment index within the ship
  const getSegmentIndex = (pos: Position, ship: Ship | undefined): number => {
    if (!ship) return 0;
    return ship.positions.findIndex(p => p.row === pos.row && p.col === pos.col);
  };

  const getCellClassName = (state: CellState, pos: Position, hasShipSprite: boolean) => {
    const highlighted = isHighlighted(pos);
    
    let baseClass = 'grid-cell transition-all duration-200 relative';
    
    if (highlighted) {
      baseClass = cn(
        baseClass,
        highlightType === 'valid' ? 'grid-cell-valid' : 'grid-cell-invalid'
      );
    } else if (state === 'hit' && !hasShipSprite) {
      baseClass = cn(baseClass, 'grid-cell-hit');
    } else if (state === 'miss') {
      baseClass = cn(baseClass, 'grid-cell-miss');
    } else if (state === 'ship' && showShips && !isAttackBoard && !hasShipSprite) {
      baseClass = cn(baseClass, 'grid-cell-ship');
    }

    if (!disabled && onCellClick) {
      baseClass = cn(baseClass, 'hover:bg-ocean-surface cursor-pointer');
    } else {
      baseClass = cn(baseClass, 'cursor-default');
    }

    return baseClass;
  };

  const renderCellContent = (state: CellState, shipId: string | undefined, pos: Position) => {
    const { ship } = getShipInfo(shipId);
    const segmentIndex = getSegmentIndex(pos, ship);
    const isHit = state === 'hit';
    const isSunk = ship?.isSunk || false;

    // Show ship sprite if showing ships and cell has a ship
    if (showShips && !isAttackBoard && ship) {
      return (
        <ShipSprite
          shipId={ship.id}
          size={ship.size}
          orientation={ship.orientation}
          segmentIndex={segmentIndex}
          isHit={isHit}
          isSunk={isSunk}
        />
      );
    }

    // Show hit marker on attack board when we hit something (but don't show ship)
    if (isAttackBoard && isHit) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "w-3/4 h-3/4 rounded-full bg-accent/30",
            isSunk ? "animate-sink" : "animate-pulse"
          )} />
          <span className={cn(
            "absolute text-accent font-bold text-lg",
            isSunk && "animate-fireFlicker"
          )}>
            {isSunk ? '🔥' : '✕'}
          </span>
        </div>
      );
    }

    if (state === 'miss') {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2/3 h-2/3 rounded-full bg-game-miss/20" />
          <span className="absolute text-game-miss text-sm">●</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="inline-block">
      {/* Column labels */}
      <div className="flex">
        <div className={cn(labelSizes[size], 'h-5')} />
        {COLUMN_LABELS.map((label) => (
          <div
            key={label}
            className={cn(
              cellSizes[size],
              'flex items-center justify-center text-primary font-display font-bold'
            )}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Grid with row labels */}
      <div className="flex">
        {/* Row labels */}
        <div className="flex flex-col">
          {ROW_LABELS.map((label) => (
            <div
              key={label}
              className={cn(
                labelSizes[size],
                cellSizes[size],
                'flex items-center justify-center text-primary font-display font-bold'
              )}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Board cells */}
        <div className="border border-game-grid rounded overflow-hidden">
          {board.cells.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => {
                const { ship } = getShipInfo(cell.shipId);
                const hasShipSprite = showShips && !isAttackBoard && !!ship;
                
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={cn(
                      cellSizes[size],
                      getCellClassName(cell.state, cell.position, hasShipSprite)
                    )}
                    onClick={() => {
                      if (!disabled && onCellClick) {
                        onCellClick(cell.position);
                      }
                    }}
                    onMouseEnter={() => onCellHover?.(cell.position)}
                    onMouseLeave={() => onCellHover?.(null)}
                  >
                    {renderCellContent(cell.state, cell.shipId, cell.position)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
