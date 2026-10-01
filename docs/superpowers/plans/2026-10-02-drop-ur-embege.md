# Drop Ur EmBeGe! Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable 2-4 player 2D side-scrolling web arcade game ("Drop Ur EmBeGe!") where players auto-run and jump from SPPG to school with a local multi-tab realtime mock.

**Architecture:** Next.js App Router for UI shell and routing, decoupled PixiJS v8 engine for the 2D side-scroller game loop with custom AABB collision, and a clean `IMultiplayerService` interface powered locally by the browser `BroadcastChannel` API for testing 2-4 tabs on localhost.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, PixiJS v8, Vitest (for unit tests), BroadcastChannel API.

## Global Constraints
- Target platform: Modern desktop browsers.
- No Supabase, Vercel, or GitHub integration in this initial plan (handled by separate team; clean stub provided).
- Game loop must remain pure TypeScript without React hook dependencies inside game entities.
- All network updates must be throttled to 10-20 Hz (50-100ms) with client-side linear interpolation (lerp).
- Track length is fixed at 6000px, finish line at 5800px.

---

### Task 1: Project Scaffolding & PixiJS Canvas Mounting

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/game/core/GameApp.ts`
- Create: `src/components/CanvasView.tsx`
- Create: `src/app/page.tsx`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Produces: `GameApp` class with `init(container: HTMLElement): Promise<void>` and `destroy(): void`.
- Produces: `CanvasView` React component that dynamically mounts `GameApp` client-side.

- [ ] **Step 1: Write setup test**

Create `tests/setup.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

describe('Project Environment', () => {
  it('should pass basic test environment check', () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Initialize project and install dependencies**

Run:
```bash
npm init -y
npm install next@latest react@latest react-dom@latest pixi.js@^8.0.0
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss postcss autoprefixer vitest
```

- [ ] **Step 3: Create configuration files**

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Create `tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        arcade: {
          yellow: '#FFDE59',
          orange: '#FF914D',
          dark: '#1E1E2F',
          green: '#7ED957',
          red: '#FF5757',
        },
      },
    },
  },
  plugins: [],
};
export default config;
```

Create `postcss.config.mjs`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 4: Create layout and stylesheet**

Create `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #1a1a2e;
  color: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  user-select: none;
  overflow-x: hidden;
}
```

Create `src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Drop Ur EmBeGe! - Multiplayer Web Arcade',
  description: 'Balapan pengantaran MBG dari SPPG ke Sekolah',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-900 text-slate-100">{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Create GameApp wrapper & CanvasView component**

Create `src/game/core/GameApp.ts`:
```typescript
import { Application } from 'pixi.js';

export class GameApp {
  public app: Application | null = null;
  private isDestroyed = false;

  public async init(container: HTMLElement): Promise<void> {
    const app = new Application();
    await app.init({
      resizeTo: container,
      backgroundColor: 0x1e1e2f,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    if (this.isDestroyed) {
      app.destroy(true);
      return;
    }

    this.app = app;
    container.appendChild(app.canvas);
  }

  public destroy(): void {
    this.isDestroyed = true;
    if (this.app) {
      this.app.destroy(true, { children: true });
      this.app = null;
    }
  }
}
```

Create `src/components/CanvasView.tsx`:
```tsx
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
```

Create temporary `src/app/page.tsx`:
```tsx
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-extrabold text-amber-400 mb-4 tracking-wider">DROP UR EMBEGE!</h1>
      <p className="text-slate-300">Scaffold and Canvas Mount Ready</p>
    </main>
  );
}
```

- [ ] **Step 6: Run test verification**

Run: `npx vitest run tests/setup.test.ts`  
Expected: PASS

---

### Task 2: Player Entity & Physics Engine (Auto-Run & Jump)

**Files:**
- Create: `src/game/physics/Collision.ts`
- Create: `src/game/entities/Player.ts`
- Test: `tests/player_physics.test.ts`

**Interfaces:**
- Produces: `checkAABB(a: BoundingBox, b: BoundingBox): boolean`
- Produces: `Player` class with `update(deltaSeconds: number, input: InputState): void`, `jump(): void`, `getBounds(): BoundingBox`.

- [ ] **Step 1: Write failing unit test for collision & player physics**

Create `tests/player_physics.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { checkAABB, BoundingBox } from '../src/game/physics/Collision';
import { Player } from '../src/game/entities/Player';

describe('Collision & Physics', () => {
  it('should detect intersecting bounding boxes', () => {
    const boxA: BoundingBox = { x: 0, y: 0, width: 50, height: 50 };
    const boxB: BoundingBox = { x: 25, y: 25, width: 50, height: 50 };
    const boxC: BoundingBox = { x: 100, y: 100, width: 50, height: 50 };

    expect(checkAABB(boxA, boxB)).toBe(true);
    expect(checkAABB(boxA, boxC)).toBe(false);
  });

  it('should apply gravity and clamp to ground', () => {
    const player = new Player({ startX: 100, groundY: 400 });
    expect(player.y).toBe(400);

    player.jump();
    expect(player.velocityY).toBeLessThan(0);

    // Simulate 0.1s delta
    player.update(0.1, { left: false, right: false });
    expect(player.y).toBeLessThan(400);

    // Simulate falling back down over 2s
    player.update(2.0, { left: false, right: false });
    expect(player.y).toBe(400);
    expect(player.isGrounded).toBe(true);
  });

  it('should auto-run horizontally', () => {
    const player = new Player({ startX: 100, groundY: 400 });
    player.update(1.0, { left: false, right: false });
    expect(player.x).toBeGreaterThan(100);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/player_physics.test.ts`  
Expected: FAIL (modules not found)

- [ ] **Step 3: Implement Collision module**

Create `src/game/physics/Collision.ts`:
```typescript
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function checkAABB(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
```

- [ ] **Step 4: Implement Player entity**

Create `src/game/entities/Player.ts`:
```typescript
import { BoundingBox } from '../physics/Collision';

export interface PlayerConfig {
  startX: number;
  groundY: number;
  baseSpeed?: number;
  jumpVelocity?: number;
  gravity?: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
}

export class Player {
  public x: number;
  public y: number;
  public velocityY: number = 0;
  public isGrounded: boolean = true;
  public readonly width: number = 64;
  public readonly height: number = 48;

  public baseSpeed: number;
  public jumpVelocity: number;
  public gravity: number;
  public groundY: number;
  public speedModifier: number = 1.0;
  private penaltyTimer: number = 0;

  constructor(config: PlayerConfig) {
    this.x = config.startX;
    this.groundY = config.groundY;
    this.y = config.groundY;
    this.baseSpeed = config.baseSpeed ?? 280;
    this.jumpVelocity = config.jumpVelocity ?? -550;
    this.gravity = config.gravity ?? 1200;
  }

  public jump(): void {
    if (this.isGrounded) {
      this.velocityY = this.jumpVelocity;
      this.isGrounded = false;
    }
  }

  public applyPenalty(factor: number, durationSeconds: number): void {
    this.speedModifier = factor;
    this.penaltyTimer = durationSeconds;
  }

  public update(deltaSeconds: number, input: InputState): void {
    if (this.penaltyTimer > 0) {
      this.penaltyTimer -= deltaSeconds;
      if (this.penaltyTimer <= 0) {
        this.speedModifier = 1.0;
      }
    }

    let nudge = 0;
    if (input.right) nudge += 40;
    if (input.left) nudge -= 40;

    const currentSpeed = (this.baseSpeed + nudge) * this.speedModifier;
    this.x += currentSpeed * deltaSeconds;

    if (!this.isGrounded) {
      this.velocityY += this.gravity * deltaSeconds;
      this.y += this.velocityY * deltaSeconds;

      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    }
  }

  public getBounds(): BoundingBox {
    return {
      x: this.x + 8,
      y: this.y - this.height,
      width: this.width - 16,
      height: this.height - 4,
    };
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/player_physics.test.ts`  
Expected: PASS

---

### Task 3: Level 1 (SPPG to School) & Obstacles

**Files:**
- Create: `src/game/level/LevelManager.ts`
- Create: `src/game/entities/Obstacle.ts`
- Test: `tests/level.test.ts`

**Interfaces:**
- Produces: `Obstacle` class with `type: 'puddle' | 'rock'`, `getBounds(): BoundingBox`.
- Produces: `LevelManager` class with `obstacles: Obstacle[]`, `trackLength: number`, `finishX: number`, `checkFinish(x: number): boolean`, `checkCollisions(player: Player): void`.

- [ ] **Step 1: Write failing unit test for Level & Obstacles**

Create `tests/level.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { LevelManager } from '../src/game/level/LevelManager';
import { Player } from '../src/game/entities/Player';

describe('LevelManager', () => {
  it('should initialize track length and finish line', () => {
    const level = new LevelManager({ groundY: 400 });
    expect(level.trackLength).toBe(6000);
    expect(level.finishX).toBe(5800);
  });

  it('should detect finish line crossed', () => {
    const level = new LevelManager({ groundY: 400 });
    expect(level.checkFinish(5799)).toBe(false);
    expect(level.checkFinish(5800)).toBe(true);
    expect(level.checkFinish(5900)).toBe(true);
  });

  it('should trigger obstacle penalty upon collision', () => {
    const level = new LevelManager({ groundY: 400 });
    const player = new Player({ startX: 0, groundY: 400 });

    const obstacle = level.obstacles[0];
    player.x = obstacle.x;
    player.y = 400;

    level.checkCollisions(player);
    expect(player.speedModifier).toBeLessThan(1.0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/level.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement Obstacle entity**

Create `src/game/entities/Obstacle.ts`:
```typescript
import { BoundingBox } from '../physics/Collision';

export type ObstacleType = 'puddle' | 'rock';

export interface ObstacleConfig {
  x: number;
  groundY: number;
  type: ObstacleType;
}

export class Obstacle {
  public x: number;
  public y: number;
  public type: ObstacleType;
  public width: number;
  public height: number;
  public isTriggered: boolean = false;

  constructor(config: ObstacleConfig) {
    this.x = config.x;
    this.type = config.type;

    if (config.type === 'puddle') {
      this.width = 70;
      this.height = 16;
      this.y = config.groundY - 8;
    } else {
      this.width = 40;
      this.height = 36;
      this.y = config.groundY - 36;
    }
  }

  public getBounds(): BoundingBox {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}
```

- [ ] **Step 4: Implement LevelManager**

Create `src/game/level/LevelManager.ts`:
```typescript
import { Obstacle } from '../entities/Obstacle';
import { Player } from '../entities/Player';
import { checkAABB } from '../physics/Collision';

export interface LevelConfig {
  groundY: number;
  trackLength?: number;
  finishX?: number;
}

export class LevelManager {
  public groundY: number;
  public trackLength: number;
  public finishX: number;
  public obstacles: Obstacle[] = [];

  constructor(config: LevelConfig) {
    this.groundY = config.groundY;
    this.trackLength = config.trackLength ?? 6000;
    this.finishX = config.finishX ?? 5800;
    this.generateObstacles();
  }

  private generateObstacles(): void {
    // Generate deterministic obstacle course between SPPG (x=500) and School (x=5500)
    const positions = [
      { x: 700, type: 'puddle' as const },
      { x: 1200, type: 'rock' as const },
      { x: 1800, type: 'puddle' as const },
      { x: 2400, type: 'rock' as const },
      { x: 3000, type: 'puddle' as const },
      { x: 3600, type: 'rock' as const },
      { x: 4200, type: 'puddle' as const },
      { x: 4800, type: 'rock' as const },
      { x: 5300, type: 'rock' as const },
    ];

    this.obstacles = positions.map(
      (pos) => new Obstacle({ x: pos.x, groundY: this.groundY, type: pos.type })
    );
  }

  public checkFinish(playerX: number): boolean {
    return playerX >= this.finishX;
  }

  public checkCollisions(player: Player): void {
    const playerBounds = player.getBounds();
    for (const obstacle of this.obstacles) {
      if (!obstacle.isTriggered && checkAABB(playerBounds, obstacle.getBounds())) {
        obstacle.isTriggered = true;
        if (obstacle.type === 'puddle') {
          player.applyPenalty(0.6, 1.0); // 40% slow for 1s
        } else {
          player.applyPenalty(0.2, 0.5); // 80% stop for 0.5s
        }
      }
    }
  }

  public reset(): void {
    for (const obs of this.obstacles) {
      obs.isTriggered = false;
    }
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/level.test.ts`  
Expected: PASS

---

### Task 4: Camera & Core Game Loop Integration

**Files:**
- Create: `src/game/core/Camera.ts`
- Create: `src/game/core/GameLoop.ts`
- Test: `tests/gameloop.test.ts`

**Interfaces:**
- Produces: `Camera` class with `update(targetX: number, viewportWidth: number): void`, `offsetX: number`.
- Produces: `GameLoop` orchestrating Player, LevelManager, Camera, input, and callbacks (`onFinish`, `onTick`).

- [ ] **Step 1: Write failing unit test for Camera & GameLoop**

Create `tests/gameloop.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { Camera } from '../src/game/core/Camera';

describe('Camera', () => {
  it('should follow target with horizontal offset', () => {
    const camera = new Camera();
    camera.update(1000, 800);
    // Player target is kept at 1/3 viewport
    expect(camera.offsetX).toBe(1000 - 800 / 3);
  });

  it('should not scroll negative offset', () => {
    const camera = new Camera();
    camera.update(100, 800);
    expect(camera.offsetX).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/gameloop.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement Camera**

Create `src/game/core/Camera.ts`:
```typescript
export class Camera {
  public offsetX: number = 0;

  public update(targetX: number, viewportWidth: number): void {
    const desiredX = targetX - viewportWidth / 3;
    this.offsetX = Math.max(0, desiredX);
  }
}
```

- [ ] **Step 4: Implement GameLoop**

Create `src/game/core/GameLoop.ts`:
```typescript
import { Player, InputState } from '../entities/Player';
import { LevelManager } from '../level/LevelManager';
import { Camera } from './Camera';

export interface GameLoopCallbacks {
  onTick?: (playerX: number, progressRatio: number, timeElapsed: number) => void;
  onFinish?: (timeElapsed: number) => void;
}

export class GameLoop {
  public player: Player;
  public level: LevelManager;
  public camera: Camera;
  public isRunning: boolean = false;
  public isFinished: boolean = false;
  public timeElapsed: number = 0;
  private callbacks: GameLoopCallbacks;

  constructor(callbacks: GameLoopCallbacks = {}) {
    this.player = new Player({ startX: 100, groundY: 400 });
    this.level = new LevelManager({ groundY: 400 });
    this.camera = new Camera();
    this.callbacks = callbacks;
  }

  public start(): void {
    this.isRunning = true;
    this.isFinished = false;
    this.timeElapsed = 0;
    this.player.x = 100;
    this.player.y = 400;
    this.level.reset();
  }

  public update(deltaSeconds: number, input: InputState, viewportWidth: number = 1000): void {
    if (!this.isRunning || this.isFinished) return;

    this.timeElapsed += deltaSeconds;
    this.player.update(deltaSeconds, input);
    this.level.checkCollisions(this.player);
    this.camera.update(this.player.x, viewportWidth);

    const progressRatio = Math.min(1.0, this.player.x / this.level.finishX);

    if (this.callbacks.onTick) {
      this.callbacks.onTick(this.player.x, progressRatio, this.timeElapsed);
    }

    if (this.level.checkFinish(this.player.x)) {
      this.isFinished = true;
      this.isRunning = false;
      if (this.callbacks.onFinish) {
        this.callbacks.onFinish(this.timeElapsed);
      }
    }
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/gameloop.test.ts`  
Expected: PASS

---

### Task 5: Local Mock Realtime Service (BroadcastChannel API)

**Files:**
- Create: `src/services/IMultiplayerService.ts`
- Create: `src/services/BroadcastChannelService.ts`
- Create: `src/game/entities/RemotePlayer.ts`
- Test: `tests/multiplayer.test.ts`

**Interfaces:**
- Produces: `PlayerState` interface and `IMultiplayerService`.
- Produces: `BroadcastChannelService` implementing multi-tab synchronization.
- Produces: `RemotePlayer` with linear interpolation `update(deltaSeconds: number)`.

- [ ] **Step 1: Write failing unit test for BroadcastChannelService contract & interpolation**

Create `tests/multiplayer.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { RemotePlayer } from '../src/game/entities/RemotePlayer';

describe('RemotePlayer Interpolation', () => {
  it('should interpolate towards target position smoothly', () => {
    const remote = new RemotePlayer({ id: 'p2', name: 'Kurir Budi', startX: 100, groundY: 400 });
    expect(remote.x).toBe(100);

    remote.setTargetPosition(200, 400);
    remote.update(0.1);
    expect(remote.x).toBeGreaterThan(100);
    expect(remote.x).toBeLessThan(200);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/multiplayer.test.ts`  
Expected: FAIL

- [ ] **Step 3: Define IMultiplayerService**

Create `src/services/IMultiplayerService.ts`:
```typescript
export interface PlayerState {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  x: number;
  y: number;
  finished: boolean;
  finishTime?: number;
}

export type PlayerListListener = (players: PlayerState[]) => void;
export type MatchStartListener = () => void;
export type PositionListener = (playerId: string, x: number, y: number) => void;
export type FinishListener = (playerId: string, finishTime: number) => void;

export interface IMultiplayerService {
  createRoom(hostName: string): Promise<string>;
  joinRoom(roomId: string, playerName: string): Promise<boolean>;
  leaveRoom(): void;
  setReady(isReady: boolean): void;
  startMatch(): void;
  broadcastPosition(x: number, y: number): void;
  broadcastFinish(timeElapsed: number): void;

  onPlayerListUpdate(callback: PlayerListListener): void;
  onMatchStart(callback: MatchStartListener): void;
  onPlayerPositionUpdate(callback: PositionListener): void;
  onPlayerFinish(callback: FinishListener): void;
  destroy(): void;
}
```

- [ ] **Step 4: Implement RemotePlayer entity**

Create `src/game/entities/RemotePlayer.ts`:
```typescript
export interface RemotePlayerConfig {
  id: string;
  name: string;
  startX: number;
  groundY: number;
}

export class RemotePlayer {
  public id: string;
  public name: string;
  public x: number;
  public y: number;
  public targetX: number;
  public targetY: number;
  public finished: boolean = false;
  public finishTime?: number;

  constructor(config: RemotePlayerConfig) {
    this.id = config.id;
    this.name = config.name;
    this.x = config.startX;
    this.y = config.groundY;
    this.targetX = config.startX;
    this.targetY = config.groundY;
  }

  public setTargetPosition(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }

  public update(deltaSeconds: number): void {
    const lerpRate = Math.min(1.0, deltaSeconds * 12);
    this.x += (this.targetX - this.x) * lerpRate;
    this.y += (this.targetY - this.y) * lerpRate;
  }
}
```

- [ ] **Step 5: Implement BroadcastChannelService**

Create `src/services/BroadcastChannelService.ts`:
```typescript
import {
  IMultiplayerService,
  PlayerState,
  PlayerListListener,
  MatchStartListener,
  PositionListener,
  FinishListener,
} from './IMultiplayerService';

type MessagePayload =
  | { type: 'ANNOUNCE'; player: PlayerState }
  | { type: 'STATE_SYNC'; players: PlayerState[] }
  | { type: 'READY_TOGGLE'; playerId: string; isReady: boolean }
  | { type: 'MATCH_START' }
  | { type: 'POSITION'; playerId: string; x: number; y: number }
  | { type: 'FINISH'; playerId: string; finishTime: number }
  | { type: 'LEAVE'; playerId: string };

export class BroadcastChannelService implements IMultiplayerService {
  private channel: BroadcastChannel | null = null;
  private localPlayerId: string = '';
  private players: Map<string, PlayerState> = new Map();

  private playerListListeners: Set<PlayerListListener> = new Set();
  private matchStartListeners: Set<MatchStartListener> = new Set();
  private positionListeners: Set<PositionListener> = new Set();
  private finishListeners: Set<FinishListener> = new Set();

  private throttleTimer: number | null = null;

  public async createRoom(hostName: string): Promise<string> {
    const code = 'MBG-' + Math.floor(100 + Math.random() * 900);
    await this.connectChannel(code, hostName, true);
    return code;
  }

  public async joinRoom(roomId: string, playerName: string): Promise<boolean> {
    await this.connectChannel(roomId, playerName, false);
    return true;
  }

  private async connectChannel(roomId: string, playerName: string, isHost: boolean): Promise<void> {
    this.destroy();
    this.localPlayerId = 'p_' + Math.random().toString(36).substring(2, 9);
    this.channel = new BroadcastChannel(`drop_embege_room_${roomId}`);

    const localPlayer: PlayerState = {
      id: this.localPlayerId,
      name: playerName,
      isHost,
      isReady: isHost,
      x: 100,
      y: 400,
      finished: false,
    };
    this.players.set(this.localPlayerId, localPlayer);

    this.channel.onmessage = (event: MessageEvent<MessagePayload>) => {
      this.handleMessage(event.data);
    };

    // Announce presence
    this.channel.postMessage({ type: 'ANNOUNCE', player: localPlayer });
    this.notifyPlayerList();

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleUnload);
    }
  }

  private handleUnload = (): void => {
    this.leaveRoom();
  };

  private handleMessage(msg: MessagePayload): void {
    switch (msg.type) {
      case 'ANNOUNCE': {
        this.players.set(msg.player.id, msg.player);
        // Reply with full state sync so the new player gets current list
        if (this.channel) {
          this.channel.postMessage({
            type: 'STATE_SYNC',
            players: Array.from(this.players.values()),
          });
        }
        this.notifyPlayerList();
        break;
      }
      case 'STATE_SYNC': {
        for (const p of msg.players) {
          if (!this.players.has(p.id)) {
            this.players.set(p.id, p);
          }
        }
        this.notifyPlayerList();
        break;
      }
      case 'READY_TOGGLE': {
        const player = this.players.get(msg.playerId);
        if (player) {
          player.isReady = msg.isReady;
          this.notifyPlayerList();
        }
        break;
      }
      case 'MATCH_START': {
        this.matchStartListeners.forEach((cb) => cb());
        break;
      }
      case 'POSITION': {
        if (msg.playerId !== this.localPlayerId) {
          this.positionListeners.forEach((cb) => cb(msg.playerId, msg.x, msg.y));
        }
        break;
      }
      case 'FINISH': {
        const player = this.players.get(msg.playerId);
        if (player) {
          player.finished = true;
          player.finishTime = msg.finishTime;
        }
        this.finishListeners.forEach((cb) => cb(msg.playerId, msg.finishTime));
        this.notifyPlayerList();
        break;
      }
      case 'LEAVE': {
        this.players.delete(msg.playerId);
        this.notifyPlayerList();
        break;
      }
    }
  }

  public leaveRoom(): void {
    if (this.channel && this.localPlayerId) {
      this.channel.postMessage({ type: 'LEAVE', playerId: this.localPlayerId });
    }
    this.destroy();
  }

  public setReady(isReady: boolean): void {
    const local = this.players.get(this.localPlayerId);
    if (local) {
      local.isReady = isReady;
      this.channel?.postMessage({
        type: 'READY_TOGGLE',
        playerId: this.localPlayerId,
        isReady,
      });
      this.notifyPlayerList();
    }
  }

  public startMatch(): void {
    this.channel?.postMessage({ type: 'MATCH_START' });
    this.matchStartListeners.forEach((cb) => cb());
  }

  public broadcastPosition(x: number, y: number): void {
    if (!this.channel) return;
    if (this.throttleTimer) return;

    this.throttleTimer = window.setTimeout(() => {
      this.throttleTimer = null;
    }, 60); // 16 Hz throttled

    this.channel.postMessage({
      type: 'POSITION',
      playerId: this.localPlayerId,
      x,
      y,
    });
  }

  public broadcastFinish(timeElapsed: number): void {
    const local = this.players.get(this.localPlayerId);
    if (local) {
      local.finished = true;
      local.finishTime = timeElapsed;
    }
    this.channel?.postMessage({
      type: 'FINISH',
      playerId: this.localPlayerId,
      finishTime: timeElapsed,
    });
    this.notifyPlayerList();
  }

  public onPlayerListUpdate(callback: PlayerListListener): void {
    this.playerListListeners.add(callback);
    callback(Array.from(this.players.values()));
  }

  public onMatchStart(callback: MatchStartListener): void {
    this.matchStartListeners.add(callback);
  }

  public onPlayerPositionUpdate(callback: PositionListener): void {
    this.positionListeners.add(callback);
  }

  public onPlayerFinish(callback: FinishListener): void {
    this.finishListeners.add(callback);
  }

  private notifyPlayerList(): void {
    const list = Array.from(this.players.values());
    this.playerListListeners.forEach((cb) => cb(list));
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleUnload);
    }
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.players.clear();
    this.playerListListeners.clear();
    this.matchStartListeners.clear();
    this.positionListeners.clear();
    this.finishListeners.clear();
  }
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/multiplayer.test.ts`  
Expected: PASS

---

### Task 6: UI Shell & Room Navigation (Home & Lobby)

**Files:**
- Create: `src/services/multiplayerSingleton.ts`
- Create: `src/app/page.tsx`
- Create: `src/app/room/[roomId]/lobby/page.tsx`
- Test: `tests/rooms.test.ts`

**Interfaces:**
- Produces: Singleton access to active `IMultiplayerService`.
- Produces: Home page with name entry, room creation, and room joining.
- Produces: Lobby page displaying room code, 2-4 players with ready indicators, and host Start button.

- [ ] **Step 1: Write test for room code validation**

Create `tests/rooms.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

function validateRoomCode(code: string): boolean {
  return /^MBG-\d{3,4}$/.test(code.trim().toUpperCase());
}

describe('Room Code Validation', () => {
  it('should accept valid room codes', () => {
    expect(validateRoomCode('MBG-123')).toBe(true);
    expect(validateRoomCode('mbg-999')).toBe(true);
  });

  it('should reject invalid room codes', () => {
    expect(validateRoomCode('')).toBe(false);
    expect(validateRoomCode('123')).toBe(false);
    expect(validateRoomCode('XYZ-999')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run tests/rooms.test.ts`  
Expected: PASS

- [ ] **Step 3: Create multiplayer singleton helper**

Create `src/services/multiplayerSingleton.ts`:
```typescript
import { BroadcastChannelService } from './BroadcastChannelService';
import { IMultiplayerService } from './IMultiplayerService';

let serviceInstance: IMultiplayerService | null = null;

export function getMultiplayerService(): IMultiplayerService {
  if (!serviceInstance) {
    serviceInstance = new BroadcastChannelService();
  }
  return serviceInstance;
}
```

- [ ] **Step 4: Implement Home Screen**

Update `src/app/page.tsx`:
```tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMultiplayerService } from '@/services/multiplayerSingleton';

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Masukkan nama kamu terlebih dahulu!');
      return;
    }
    const service = getMultiplayerService();
    const code = await service.createRoom(name.trim());
    sessionStorage.setItem('player_name', name.trim());
    router.push(`/room/${code}/lobby`);
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      setError('Masukkan nama kamu terlebih dahulu!');
      return;
    }
    if (!roomCode.trim()) {
      setError('Masukkan Room Code!');
      return;
    }
    const code = roomCode.trim().toUpperCase();
    const service = getMultiplayerService();
    await service.joinRoom(code, name.trim());
    sessionStorage.setItem('player_name', name.trim());
    router.push(`/room/${code}/lobby`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-900 text-white">
      <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-8 shadow-2xl backdrop-blur">
        <div className="text-center mb-6">
          <div className="inline-block bg-amber-500/20 text-amber-400 font-bold px-3 py-1 rounded-full text-xs mb-2 uppercase tracking-widest border border-amber-500/40">
            2D Arcade Racing
          </div>
          <h1 className="text-4xl font-black text-amber-400 tracking-wider">DROP UR EMBEGE!</h1>
          <p className="text-sm text-slate-400 mt-2">
            Antar Makanan Bergizi Gratis dari SPPG ke Sekolah secepat mungkin!
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Nama Kurir
            </label>
            <input
              type="text"
              placeholder="Contoh: Kurir Budi"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <button
            onClick={handleCreate}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition active:scale-[0.98]"
          >
            🚀 Bikin Room Baru
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase">Atau Gabung</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Kode: MBG-123"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value);
                setError('');
              }}
              className="flex-1 bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-3 text-white uppercase focus:outline-none focus:border-amber-400 transition"
            />
            <button
              onClick={handleJoin}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 rounded-xl transition"
            >
              Gabung
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700/60 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">💡 Kontrol Bermain:</p>
          <p>• Kendaraan melaju otomatis (Auto-run).</p>
          <p>• Tekan <kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-amber-300">Space</kbd> untuk lompat melewati rintangan.</p>
          <p>• Tekan <kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-amber-300">A / D</kbd> untuk atur jarak aman.</p>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Implement Lobby Screen**

Create `src/app/room/[roomId]/lobby/page.tsx`:
```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getMultiplayerService } from '@/services/multiplayerSingleton';
import { PlayerState } from '@/services/IMultiplayerService';

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const service = getMultiplayerService();

    service.onPlayerListUpdate((list) => {
      setPlayers(list);
    });

    service.onMatchStart(() => {
      router.push(`/room/${roomId}/race`);
    });
  }, [roomId, router]);

  const toggleReady = () => {
    const next = !isReady;
    setIsReady(next);
    getMultiplayerService().setReady(next);
  };

  const startRace = () => {
    getMultiplayerService().startMatch();
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHost = players.find((p) => p.isHost)?.name === sessionStorage.getItem('player_name');
  const allReady = players.length >= 1 && players.every((p) => p.isReady);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-900 text-white">
      <div className="max-w-lg w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-8 shadow-2xl backdrop-blur">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-amber-400">LOBBY BALAPAN</h1>
            <p className="text-xs text-slate-400">Tunggu semua kurir siap sebelum berangkat</p>
          </div>
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition"
          >
            <span>{roomId}</span>
            <span>{copied ? '✅' : '📋'}</span>
          </button>
        </div>

        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-700/60 mb-6 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Kurir Terdaftar ({players.length}/4)
          </div>
          {players.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center bg-slate-800/60 px-4 py-2.5 rounded-lg border border-slate-700"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🛵</span>
                <span className="font-bold text-sm text-slate-200">{p.name}</span>
                {p.isHost && (
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded font-bold border border-amber-500/40">
                    HOST
                  </span>
                )}
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded ${
                  p.isReady
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {p.isReady ? 'READY' : 'MENUNGGU'}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={toggleReady}
            className={`flex-1 py-3.5 rounded-xl font-extrabold transition ${
              isReady
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isReady ? 'Batalkan Ready' : 'Siap! (Ready)'}
          </button>

          {isHost && (
            <button
              onClick={startRace}
              disabled={!allReady}
              className={`flex-1 py-3.5 rounded-xl font-extrabold transition ${
                allReady
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              Mulai Balapan! 🏁
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
```

---

### Task 7: Race Screen, PixiJS Game Renderer, & Result Modal

**Files:**
- Create: `src/components/GameHUD.tsx`
- Create: `src/components/ResultModal.tsx`
- Create: `src/game/renderer/PixiSceneRenderer.ts`
- Create: `src/app/room/[roomId]/race/page.tsx`

**Interfaces:**
- Produces: `GameHUD` with progress bar, speedometer, and countdown.
- Produces: `ResultModal` with sorted winner podium (1st-4th) and replay button.
- Produces: Full working race screen mounting `CanvasView` and syncing positions via `BroadcastChannelService`.

- [ ] **Step 1: Implement GameHUD**

Create `src/components/GameHUD.tsx`:
```tsx
'use client';

import React from 'react';

interface GameHUDProps {
  countdown: number | null;
  timeElapsed: number;
  progressRatio: number;
  playerName: string;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  countdown,
  timeElapsed,
  progressRatio,
  playerName,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      {/* Top Progress Bar */}
      <div className="w-full max-w-2xl mx-auto bg-slate-950/70 border border-slate-700/80 rounded-2xl p-3 backdrop-blur shadow-xl">
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5 px-1">
          <span>📍 Dapur SPPG</span>
          <span className="text-amber-400 font-mono text-sm">
            ⏱ {(timeElapsed).toFixed(1)}s
          </span>
          <span>🏫 Gerbang Sekolah</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-75 rounded-full"
            style={{ width: `${Math.min(100, progressRatio * 100)}%` }}
          />
        </div>
      </div>

      {/* Center Countdown Overlay */}
      {countdown !== null && countdown > 0 && (
        <div className="self-center my-auto flex flex-col items-center animate-bounce">
          <span className="text-8xl font-black text-amber-400 drop-shadow-[0_10px_20px_rgba(251,191,36,0.5)]">
            {countdown}
          </span>
          <span className="text-xl font-bold uppercase tracking-widest text-slate-300 mt-2">
            Persiapan Berangkat!
          </span>
        </div>
      )}

      {/* Bottom Info Tag */}
      <div className="flex justify-between items-end text-xs text-slate-400">
        <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
          Kurir: <strong className="text-amber-400">{playerName}</strong>
        </div>
        <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
          [SPACE] Lompat | [A/D] Atur Posisi
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Implement ResultModal**

Create `src/components/ResultModal.tsx`:
```tsx
'use client';

import React from 'react';
import { PlayerState } from '@/services/IMultiplayerService';

interface ResultModalProps {
  players: PlayerState[];
  onPlayAgain: () => void;
  onExit: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  players,
  onPlayAgain,
  onExit,
}) => {
  const sorted = [...players].sort((a, b) => {
    if (a.finished && !b.finished) return -1;
    if (!a.finished && b.finished) return 1;
    return (a.finishTime ?? 999999) - (b.finishTime ?? 999999);
  });

  const medals = ['🥇', '🥈', '🥉', '🛵'];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl">
        <span className="text-5xl">🎉</span>
        <h2 className="text-3xl font-black text-amber-400 mt-3">MBG BERHASIL DI-DROP!</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">Hasil Balapan Pengantaran Sekolah</p>

        <div className="space-y-2.5 mb-8">
          {sorted.map((p, idx) => (
            <div
              key={p.id}
              className={`flex justify-between items-center px-4 py-3 rounded-xl border ${
                idx === 0
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                  : 'bg-slate-900/60 border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{medals[idx] || '🛵'}</span>
                <span className="font-semibold text-sm">{p.name}</span>
              </div>
              <span className="font-mono text-xs">
                {p.finished && p.finishTime ? `${p.finishTime.toFixed(2)}s` : 'DNF'}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onExit}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition"
          >
            Keluar
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg transition"
          >
            Balapan Lagi! 🔄
          </button>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Implement PixiSceneRenderer**

Create `src/game/renderer/PixiSceneRenderer.ts`:
```typescript
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { GameLoop } from '../core/GameLoop';
import { RemotePlayer } from '../entities/RemotePlayer';

export class PixiSceneRenderer {
  private app: Application;
  private gameLoop: GameLoop;
  private stageContainer: Container;
  private playerGraphic: Graphics;
  private remoteGraphics: Map<string, Graphics> = new Map();
  private obstacleGraphics: Graphics;
  private bgGraphics: Graphics;

  constructor(app: Application, gameLoop: GameLoop) {
    this.app = app;
    this.gameLoop = gameLoop;

    this.stageContainer = new Container();
    this.app.stage.addChild(this.stageContainer);

    this.bgGraphics = new Graphics();
    this.obstacleGraphics = new Graphics();
    this.playerGraphic = new Graphics();

    this.stageContainer.addChild(this.bgGraphics);
    this.stageContainer.addChild(this.obstacleGraphics);
    this.stageContainer.addChild(this.playerGraphic);
  }

  public render(remotePlayers: Map<string, RemotePlayer>): void {
    const camX = this.gameLoop.camera.offsetX;
    const groundY = this.gameLoop.level.groundY;

    // 1. Draw Parallax Background & Road
    this.bgGraphics.clear();
    // Sky
    this.bgGraphics.rect(0, 0, 8000, groundY).fill(0x1a2238);
    // Ground / Road
    this.bgGraphics.rect(0, groundY, 8000, 300).fill(0x282c34);
    // Road dashes
    for (let x = 0; x < 7000; x += 120) {
      this.bgGraphics.rect(x, groundY + 40, 60, 6).fill(0xffd166);
    }
    // Finish Gate
    this.bgGraphics.rect(5800, groundY - 140, 20, 140).fill(0xef476f);
    this.bgGraphics.rect(5800, groundY - 140, 160, 40).fill(0x118ab2);

    // 2. Draw Obstacles
    this.obstacleGraphics.clear();
    for (const obs of this.gameLoop.level.obstacles) {
      if (obs.type === 'puddle') {
        this.obstacleGraphics.ellipse(obs.x + 35, obs.y + 8, 35, 8).fill(0x06d6a0);
      } else {
        this.obstacleGraphics.roundRect(obs.x, obs.y, obs.width, obs.height, 6).fill(0x8d99ae);
      }
    }

    // 3. Draw Local Player
    const player = this.gameLoop.player;
    this.playerGraphic.clear();
    // Cart/Scooter Body
    this.playerGraphic.roundRect(player.x, player.y - player.height, player.width, player.height, 8).fill(0xffbe0b);
    // Wheels
    this.playerGraphic.circle(player.x + 12, player.y, 10).fill(0x111111);
    this.playerGraphic.circle(player.x + player.width - 12, player.y, 10).fill(0x111111);

    // 4. Draw Remote Players
    for (const [id, remote] of remotePlayers) {
      let g = this.remoteGraphics.get(id);
      if (!g) {
        g = new Graphics();
        this.remoteGraphics.set(id, g);
        this.stageContainer.addChild(g);
      }
      g.clear();
      g.roundRect(remote.x, remote.y - 48, 64, 48, 8).fill(0x3a86ff);
      g.circle(remote.x + 12, remote.y, 10).fill(0x111111);
      g.circle(remote.x + 52, remote.y, 10).fill(0x111111);
    }

    // Position stage against camera
    this.stageContainer.x = -camX;
  }

  public destroy(): void {
    this.stageContainer.destroy({ children: true });
    this.remoteGraphics.clear();
  }
}
```

- [ ] **Step 4: Implement Race Screen Page**

Create `src/app/room/[roomId]/race/page.tsx`:
```tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CanvasView } from '@/components/CanvasView';
import { GameHUD } from '@/components/GameHUD';
import { ResultModal } from '@/components/ResultModal';
import { GameApp } from '@/game/core/GameApp';
import { GameLoop } from '@/game/core/GameLoop';
import { RemotePlayer } from '@/game/entities/RemotePlayer';
import { PixiSceneRenderer } from '@/game/renderer/PixiSceneRenderer';
import { getMultiplayerService } from '@/services/multiplayerSingleton';
import { PlayerState } from '@/services/IMultiplayerService';

export default function RacePage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [countdown, setCountdown] = useState<number | null>(3);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [progressRatio, setProgressRatio] = useState(0);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [showResult, setShowResult] = useState(false);

  const gameLoopRef = useRef<GameLoop | null>(null);
  const rendererRef = useRef<PixiSceneRenderer | null>(null);
  const remotePlayersRef = useRef<Map<string, RemotePlayer>>(new Map());
  const inputRef = useRef({ left: false, right: false });

  const playerName =
    typeof window !== 'undefined' ? sessionStorage.getItem('player_name') || 'Kurir' : 'Kurir';

  useEffect(() => {
    const service = getMultiplayerService();

    service.onPlayerListUpdate((list) => {
      setPlayers(list);
    });

    service.onPlayerPositionUpdate((id, x, y) => {
      let remote = remotePlayersRef.current.get(id);
      if (!remote) {
        remote = new RemotePlayer({ id, name: 'Pemain', startX: x, groundY: 400 });
        remotePlayersRef.current.set(id, remote);
      }
      remote.setTargetPosition(x, y);
    });

    service.onPlayerFinish((id, time) => {
      // Check if local player also finished to open results
      setShowResult(true);
    });

    // Countdown sequence (3.. 2.. 1.. GO!)
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(interval);
        setCountdown(null);
        gameLoopRef.current?.start();
      } else {
        setCountdown(count);
      }
    }, 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        gameLoopRef.current?.player.jump();
      }
      if (e.code === 'KeyA' || e.key === 'ArrowLeft') inputRef.current.left = true;
      if (e.code === 'KeyD' || e.key === 'ArrowRight') inputRef.current.right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.key === 'ArrowLeft') inputRef.current.left = false;
      if (e.code === 'KeyD' || e.key === 'ArrowRight') inputRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleGameReady = (game: GameApp) => {
    if (!game.app) return;

    const gameLoop = new GameLoop({
      onTick: (x, ratio, time) => {
        setTimeElapsed(time);
        setProgressRatio(ratio);
        getMultiplayerService().broadcastPosition(x, gameLoop.player.y);
      },
      onFinish: (time) => {
        getMultiplayerService().broadcastFinish(time);
        setShowResult(true);
      },
    });

    gameLoopRef.current = gameLoop;
    const renderer = new PixiSceneRenderer(game.app, gameLoop);
    rendererRef.current = renderer;

    let lastTime = performance.now();
    game.app.ticker.add(() => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      gameLoop.update(delta, inputRef.current, window.innerWidth);

      for (const remote of remotePlayersRef.current.values()) {
        remote.update(delta);
      }

      renderer.render(remotePlayersRef.current);
    });
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950">
      <CanvasView onGameReady={handleGameReady} />
      <GameHUD
        countdown={countdown}
        timeElapsed={timeElapsed}
        progressRatio={progressRatio}
        playerName={playerName}
      />
      {showResult && (
        <ResultModal
          players={players}
          onPlayAgain={() => router.push(`/room/${roomId}/lobby`)}
          onExit={() => router.push('/')}
        />
      )}
    </main>
  );
}
```

---

### Task 8: Backend Handoff Preparation (Supabase Stub & Docs)

**Files:**
- Create: `src/services/SupabaseService.stub.ts`
- Create: `docs/BACKEND_HANDOFF.md`

**Interfaces:**
- Produces: `SupabaseService` class implementing `IMultiplayerService`.
- Produces: Complete integration guide for the Supabase backend developer.

- [ ] **Step 1: Implement Supabase stub**

Create `src/services/SupabaseService.stub.ts`:
```typescript
import {
  IMultiplayerService,
  PlayerState,
  PlayerListListener,
  MatchStartListener,
  PositionListener,
  FinishListener,
} from './IMultiplayerService';

/**
 * STUB: Untuk tim Backend Supabase.
 * Implementasikan method di bawah menggunakan @supabase/supabase-js realtime channel:
 * const channel = supabase.channel(`room:${roomId}`, { config: { presence: { key: playerId } } });
 */
export class SupabaseService implements IMultiplayerService {
  public async createRoom(hostName: string): Promise<string> {
    // 1. Insert ke tabel 'rooms'
    // 2. Return generated room_code
    return 'MBG-SUPABASE';
  }

  public async joinRoom(roomId: string, playerName: string): Promise<boolean> {
    // 1. Subscribe ke channel presence & broadcast
    return true;
  }

  public leaveRoom(): void {}
  public setReady(isReady: boolean): void {}
  public startMatch(): void {}
  public broadcastPosition(x: number, y: number): void {}
  public broadcastFinish(timeElapsed: number): void {}

  public onPlayerListUpdate(callback: PlayerListListener): void {}
  public onMatchStart(callback: MatchStartListener): void {}
  public onPlayerPositionUpdate(callback: PositionListener): void {}
  public onPlayerFinish(callback: FinishListener): void {}
  public destroy(): void {}
}
```

- [ ] **Step 2: Create backend handoff documentation**

Create `docs/BACKEND_HANDOFF.md`:
```markdown
# Drop Ur EmBeGe! — Supabase Backend Integration Guide

Panduan ini dibuat untuk tim Backend / Supabase agar dapat menghubungkan real database & realtime broadcast ke dalam game tanpa merusak logika frontend atau game canvas.

## 1. Interface Kontrak
Frontend hanya berkomunikasi melalui interface:
`src/services/IMultiplayerService.ts`

Saat database siap:
1. Pasang dependency `@supabase/supabase-js`.
2. Selesaikan implementasi pada `src/services/SupabaseService.stub.ts`.
3. Ganti pemanggilan di `src/services/multiplayerSingleton.ts` dari `BroadcastChannelService` ke `SupabaseService`.

## 2. Event Realtime Supabase
- **Presence**: Gunakan `channel.track({ name, isReady })` untuk mendeteksi pemain masuk/keluar.
- **Broadcast `position`**: Kirim event broadcast `position` dengan payload `{ id, x, y }` (dibatasi 10-20 Hz).
- **Broadcast `start`**: Event pemicu start countdown dari host.
- **Broadcast `finish`**: Event saat pemain mencapai garis finish untuk mengunci podium.
```

- [ ] **Step 3: Run full test suite check**

Run: `npx vitest run`  
Expected: All tests PASS
