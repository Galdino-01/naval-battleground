import React from 'react';
import { useGame } from '@/context/GameContext';
import { MenuScreen } from './screens/MenuScreen';
import { SetupScreen } from './screens/SetupScreen';
import { WaitingScreen } from './screens/WaitingScreen';
import { GameScreen } from './screens/GameScreen';
import { EndScreen } from './screens/EndScreen';

export function Game() {
  const { state } = useGame();

  switch (state.phase) {
    case 'menu':
      return <MenuScreen />;
    case 'setup':
      return <SetupScreen />;
    case 'waiting':
      return <WaitingScreen />;
    case 'playing':
      return <GameScreen />;
    case 'finished':
      return <EndScreen />;
    default:
      return <MenuScreen />;
  }
}
