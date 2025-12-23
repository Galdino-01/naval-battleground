import { Position, Board, BOARD_SIZE } from '@/types/game';
import { hasAlreadyAttacked, isValidPosition } from './gameUtils';

type AIState = 'hunting' | 'targeting';

interface AIMemory {
  state: AIState;
  lastHit: Position | null;
  targetQueue: Position[];
  hitStack: Position[];
  direction: 'horizontal' | 'vertical' | null;
}

let aiMemory: AIMemory = {
  state: 'hunting',
  lastHit: null,
  targetQueue: [],
  hitStack: [],
  direction: null,
};

export function resetAIMemory(): void {
  aiMemory = {
    state: 'hunting',
    lastHit: null,
    targetQueue: [],
    hitStack: [],
    direction: null,
  };
}

function getValidAdjacentCells(position: Position, attackBoard: Board): Position[] {
  const directions = [
    { row: -1, col: 0 }, // up
    { row: 1, col: 0 },  // down
    { row: 0, col: -1 }, // left
    { row: 0, col: 1 },  // right
  ];

  return directions
    .map((d) => ({ row: position.row + d.row, col: position.col + d.col }))
    .filter((pos) => isValidPosition(pos) && !hasAlreadyAttacked(attackBoard, pos));
}

function getDirectionalCells(
  position: Position,
  direction: 'horizontal' | 'vertical',
  attackBoard: Board
): Position[] {
  const cells: Position[] = [];
  const deltas = direction === 'horizontal' 
    ? [{ row: 0, col: -1 }, { row: 0, col: 1 }]
    : [{ row: -1, col: 0 }, { row: 1, col: 0 }];

  for (const delta of deltas) {
    const pos = { row: position.row + delta.row, col: position.col + delta.col };
    if (isValidPosition(pos) && !hasAlreadyAttacked(attackBoard, pos)) {
      cells.push(pos);
    }
  }

  return cells;
}

export function getAIMove(attackBoard: Board): Position {
  // Filter out invalid targets from queue
  aiMemory.targetQueue = aiMemory.targetQueue.filter(
    (pos) => !hasAlreadyAttacked(attackBoard, pos)
  );

  // If we have targets in queue, attack them
  if (aiMemory.targetQueue.length > 0) {
    return aiMemory.targetQueue.shift()!;
  }

  // Random hunting mode
  const availableCells: Position[] = [];
  
  // Use checkerboard pattern for efficiency
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 0 && !hasAlreadyAttacked(attackBoard, { row, col })) {
        availableCells.push({ row, col });
      }
    }
  }

  // If checkerboard is exhausted, try remaining cells
  if (availableCells.length === 0) {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (!hasAlreadyAttacked(attackBoard, { row, col })) {
          availableCells.push({ row, col });
        }
      }
    }
  }

  if (availableCells.length === 0) {
    throw new Error('No valid moves available');
  }

  return availableCells[Math.floor(Math.random() * availableCells.length)];
}

export function updateAIAfterHit(position: Position, isHit: boolean, isSunk: boolean, attackBoard: Board): void {
  if (isSunk) {
    // Ship sunk, reset targeting mode
    aiMemory.state = 'hunting';
    aiMemory.lastHit = null;
    aiMemory.hitStack = [];
    aiMemory.direction = null;
    aiMemory.targetQueue = [];
    return;
  }

  if (isHit) {
    aiMemory.state = 'targeting';
    
    if (aiMemory.hitStack.length > 0) {
      // We have multiple hits, determine direction
      const prevHit = aiMemory.hitStack[aiMemory.hitStack.length - 1];
      if (position.row === prevHit.row) {
        aiMemory.direction = 'horizontal';
      } else if (position.col === prevHit.col) {
        aiMemory.direction = 'vertical';
      }
    }
    
    aiMemory.hitStack.push(position);
    aiMemory.lastHit = position;

    // Add adjacent cells to target queue
    if (aiMemory.direction) {
      // If we know the direction, only add cells in that direction
      const directionalCells = getDirectionalCells(position, aiMemory.direction, attackBoard);
      aiMemory.targetQueue = [...aiMemory.targetQueue, ...directionalCells];
    } else {
      // Add all adjacent cells
      const adjacentCells = getValidAdjacentCells(position, attackBoard);
      aiMemory.targetQueue = [...aiMemory.targetQueue, ...adjacentCells];
    }
  } else {
    // Miss - if we were targeting and have a direction, try the opposite end
    if (aiMemory.state === 'targeting' && aiMemory.hitStack.length > 0 && aiMemory.direction) {
      const firstHit = aiMemory.hitStack[0];
      const oppositeEnd = getDirectionalCells(firstHit, aiMemory.direction, attackBoard);
      aiMemory.targetQueue = [...oppositeEnd, ...aiMemory.targetQueue];
    }
  }
}
