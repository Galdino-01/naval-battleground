import React from 'react';
import { cn } from '@/lib/utils';

interface ShipSpriteProps {
  shipId: string;
  size: number;
  orientation: 'horizontal' | 'vertical';
  segmentIndex: number;
  isHit?: boolean;
  isSunk?: boolean;
  className?: string;
}

// Ship segment types: bow (front), body, stern (back)
type SegmentType = 'bow' | 'body' | 'stern';

const getSegmentType = (index: number, size: number): SegmentType => {
  if (index === 0) return 'bow';
  if (index === size - 1) return 'stern';
  return 'body';
};

export function ShipSprite({
  shipId,
  size,
  orientation,
  segmentIndex,
  isHit = false,
  isSunk = false,
  className,
}: ShipSpriteProps) {
  const segmentType = getSegmentType(segmentIndex, size);
  const isVertical = orientation === 'vertical';

  const baseClasses = cn(
    'absolute inset-0.5 transition-all duration-300',
    isSunk && 'animate-sink opacity-60',
    isHit && !isSunk && 'animate-shipHit'
  );

  // Ship colors based on type
  const getShipColors = () => {
    switch (shipId) {
      case 'carrier':
        return { hull: 'fill-ship-carrier', deck: 'fill-ship-carrier-deck' };
      case 'battleship':
        return { hull: 'fill-ship-battleship', deck: 'fill-ship-battleship-deck' };
      case 'cruiser':
        return { hull: 'fill-ship-cruiser', deck: 'fill-ship-cruiser-deck' };
      case 'submarine':
        return { hull: 'fill-ship-submarine', deck: 'fill-ship-submarine-deck' };
      case 'destroyer':
        return { hull: 'fill-ship-destroyer', deck: 'fill-ship-destroyer-deck' };
      default:
        return { hull: 'fill-[hsl(var(--ship))]', deck: 'fill-[hsl(var(--ship-highlight))]' };
    }
  };

  const { hull, deck } = getShipColors();

  const renderSegment = () => {
    return (
      <svg
        viewBox="0 0 32 32"
        className={cn(
          baseClasses,
          isVertical && 'rotate-90',
          className
        )}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Fire effect for hit cells */}
        {isHit && !isSunk && (
          <g className="animate-fireFlicker">
            <ellipse cx="16" cy="16" rx="10" ry="8" className="fill-accent/60" />
            <ellipse cx="16" cy="14" rx="6" ry="5" className="fill-hit-glow/80" />
            <ellipse cx="16" cy="12" rx="3" ry="3" className="fill-foreground/90" />
          </g>
        )}

        {/* Sunk water/bubble effect */}
        {isSunk && (
          <g className="animate-bubbles">
            <circle cx="8" cy="24" r="2" className="fill-ocean-light/40" />
            <circle cx="16" cy="26" r="1.5" className="fill-ocean-light/30" />
            <circle cx="24" cy="22" r="2.5" className="fill-ocean-light/50" />
          </g>
        )}

        {/* Hull base */}
        {segmentType === 'bow' && (
          <g className={isSunk ? 'opacity-50' : ''}>
            {/* Bow (pointed front) */}
            <path
              d="M 28 8 Q 32 16 28 24 L 4 24 L 4 8 Z"
              className={hull}
            />
            {/* Deck details */}
            <rect x="6" y="12" width="16" height="8" rx="1" className={deck} />
            {/* Bow windows/details */}
            <circle cx="24" cy="16" r="2" className="fill-primary/30" />
          </g>
        )}

        {segmentType === 'body' && (
          <g className={isSunk ? 'opacity-50' : ''}>
            {/* Body segment */}
            <rect x="0" y="8" width="32" height="16" className={hull} />
            {/* Deck */}
            <rect x="4" y="11" width="24" height="10" rx="1" className={deck} />
            {/* Port holes */}
            <circle cx="10" cy="16" r="2" className="fill-primary/20" />
            <circle cx="22" cy="16" r="2" className="fill-primary/20" />
          </g>
        )}

        {segmentType === 'stern' && (
          <g className={isSunk ? 'opacity-50' : ''}>
            {/* Stern (flat back) */}
            <path
              d="M 4 8 L 28 8 L 28 24 L 4 24 Q 0 16 4 8"
              className={hull}
            />
            {/* Deck */}
            <rect x="10" y="12" width="16" height="8" rx="1" className={deck} />
            {/* Propeller area */}
            <rect x="2" y="14" width="4" height="4" rx="1" className="fill-foreground/20" />
          </g>
        )}

        {/* Damage overlay for hit cells */}
        {isHit && (
          <g>
            <line x1="8" y1="8" x2="24" y2="24" strokeWidth="2" className="stroke-accent" />
            <line x1="24" y1="8" x2="8" y2="24" strokeWidth="2" className="stroke-accent" />
          </g>
        )}
      </svg>
    );
  };

  return renderSegment();
}
