'use client';

import React, { useEffect, useRef } from 'react';
import { GameApp } from '@/game/core/GameApp';

interface CanvasViewProps {
  onGameReady?: (game: GameApp) => void;
}

export const CanvasView: React.FC<CanvasViewProps> = ({ onGameReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameApp | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new GameApp();
    gameRef.current = game;

    game.init(containerRef.current).then(() => {
      if (onGameReady) {
        onGameReady(game);
      }
    });

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, [onGameReady]);

  return <div ref={containerRef} className="w-full h-full relative overflow-hidden" />;
};
