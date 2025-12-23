import {
  Board,
  Cell,
  Position,
  Ship,
  ShipConfig,
  Orientation,
  BOARD_SIZE,
  SHIP_CONFIGS,
  AttackResult,
} from '@/types/game';

export function createEmptyBoard(): Board {
  const cells: Cell[][] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    cells[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      cells[row][col] = {
        position: { row, col },
        state: 'empty',
      };
    }
  }
  return { cells, ships: [] };
}

export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE;
}

export function getShipPositions(
  startPos: Position,
  size: number,
  orientation: Orientation
): Position[] {
  const positions: Position[] = [];
  for (let i = 0; i < size; i++) {
    if (orientation === 'horizontal') {
      positions.push({ row: startPos.row, col: startPos.col + i });
    } else {
      positions.push({ row: startPos.row + i, col: startPos.col });
    }
  }
  return positions;
}

export function getAdjacentPositions(pos: Position): Position[] {
  const adjacent: Position[] = [];
  for (let dRow = -1; dRow <= 1; dRow++) {
    for (let dCol = -1; dCol <= 1; dCol++) {
      if (dRow === 0 && dCol === 0) continue;
      const newPos = { row: pos.row + dRow, col: pos.col + dCol };
      if (isValidPosition(newPos)) {
        adjacent.push(newPos);
      }
    }
  }
  return adjacent;
}

export function canPlaceShip(
  board: Board,
  positions: Position[],
  excludeShipId?: string
): boolean {
  // Check if all positions are valid
  if (!positions.every(isValidPosition)) {
    return false;
  }

  // Check for overlaps and adjacent ships
  for (const pos of positions) {
    const cell = board.cells[pos.row][pos.col];
    if (cell.state === 'ship' && cell.shipId !== excludeShipId) {
      return false;
    }

    // Check adjacent cells
    const adjacentPositions = getAdjacentPositions(pos);
    for (const adjPos of adjacentPositions) {
      const adjCell = board.cells[adjPos.row][adjPos.col];
      if (
        adjCell.state === 'ship' &&
        adjCell.shipId !== excludeShipId &&
        !positions.some((p) => p.row === adjPos.row && p.col === adjPos.col)
      ) {
        return false;
      }
    }
  }

  return true;
}

export function placeShip(
  board: Board,
  shipConfig: ShipConfig,
  startPos: Position,
  orientation: Orientation
): Board | null {
  const positions = getShipPositions(startPos, shipConfig.size, orientation);

  if (!canPlaceShip(board, positions)) {
    return null;
  }

  const newBoard = JSON.parse(JSON.stringify(board)) as Board;

  const ship: Ship = {
    id: shipConfig.id,
    name: shipConfig.name,
    size: shipConfig.size,
    positions,
    orientation,
    hits: 0,
    isSunk: false,
  };

  for (const pos of positions) {
    newBoard.cells[pos.row][pos.col] = {
      position: pos,
      state: 'ship',
      shipId: ship.id,
    };
  }

  newBoard.ships.push(ship);
  return newBoard;
}

export function removeShip(board: Board, shipId: string): Board {
  const newBoard = JSON.parse(JSON.stringify(board)) as Board;
  const shipIndex = newBoard.ships.findIndex((s) => s.id === shipId);

  if (shipIndex === -1) return board;

  const ship = newBoard.ships[shipIndex];
  for (const pos of ship.positions) {
    newBoard.cells[pos.row][pos.col] = {
      position: pos,
      state: 'empty',
    };
  }

  newBoard.ships.splice(shipIndex, 1);
  return newBoard;
}

export function autoPlaceShips(board: Board): Board | null {
  let newBoard = createEmptyBoard();
  const maxAttempts = 1000;

  for (const shipConfig of SHIP_CONFIGS) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < maxAttempts) {
      const orientation: Orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const maxRow = orientation === 'horizontal' ? BOARD_SIZE : BOARD_SIZE - shipConfig.size;
      const maxCol = orientation === 'horizontal' ? BOARD_SIZE - shipConfig.size : BOARD_SIZE;

      const startPos: Position = {
        row: Math.floor(Math.random() * maxRow),
        col: Math.floor(Math.random() * maxCol),
      };

      const result = placeShip(newBoard, shipConfig, startPos, orientation);
      if (result) {
        newBoard = result;
        placed = true;
      }
      attempts++;
    }

    if (!placed) {
      return null;
    }
  }

  return newBoard;
}

export function processAttack(board: Board, position: Position): AttackResult {
  const cell = board.cells[position.row][position.col];

  if (cell.state === 'ship') {
    const ship = board.ships.find((s) => s.id === cell.shipId);
    if (ship) {
      ship.hits++;
      ship.isSunk = ship.hits >= ship.size;
      cell.state = 'hit';

      return {
        position,
        isHit: true,
        shipId: ship.id,
        isSunk: ship.isSunk,
        shipName: ship.name,
      };
    }
  }

  cell.state = 'miss';
  return {
    position,
    isHit: false,
  };
}

export function markAttackOnBoard(board: Board, position: Position, isHit: boolean): Board {
  const newBoard = JSON.parse(JSON.stringify(board)) as Board;
  newBoard.cells[position.row][position.col].state = isHit ? 'hit' : 'miss';
  return newBoard;
}

export function hasAlreadyAttacked(board: Board, position: Position): boolean {
  const cell = board.cells[position.row][position.col];
  return cell.state === 'hit' || cell.state === 'miss';
}

export function areAllShipsSunk(board: Board): boolean {
  return board.ships.length > 0 && board.ships.every((ship) => ship.isSunk);
}

export function getPlacedShips(board: Board): string[] {
  return board.ships.map((s) => s.id);
}

export function getRemainingShips(board: Board): ShipConfig[] {
  const placedIds = getPlacedShips(board);
  return SHIP_CONFIGS.filter((config) => !placedIds.includes(config.id));
}
