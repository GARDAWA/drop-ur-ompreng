'use client';

import React, { useEffect, useRef } from 'react';
import { GameApp } from '@/game/core/GameApp';

interface CanvasViewProps {
  onGameReady?: (game: GameApp) => void;
  onCanvasClick?: () => void;
}

export const CanvasView: React.FC<CanvasViewProps> = ({ onGameReady, onCanvasClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameApp | null>(null);
  const onGameReadyRef = useRef(onGameReady);
  onGameReadyRef.current = onGameReady;

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new GameApp();
    gameRef.current = game;

    game.init(containerRef.current).then(() => {
      if (onGameReadyRef.current) {
        onGameReadyRef.current(game);
      }
    });

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []); // Run ONCE on mount

  return (
    <div
      ref={containerRef}
      onClick={onCanvasClick}
      className="w-full h-full relative overflow-hidden cursor-pointer select-none"
    />
  );
};
