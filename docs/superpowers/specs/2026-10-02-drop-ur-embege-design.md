# Drop Ur EmBeGe! — System Design Specification
**Date:** 2026-10-02  
**Status:** Approved  
**Target:** MVP (2-4 Players Local Web Arcade)

---

## 1. Executive Summary & Goals

**Drop Ur EmBeGe!** adalah game multiplayer side-scrolling 2D arcade berbasis web bertema balapan pengantaran Makanan Bergizi Gratis (MBG) dari dapur SPPG menuju sekolah.

### Primary Objectives (MVP Scope)
1. **Playable Local Web Arcade**: Dapat dimainkan langsung di desktop browser modern dengan performa mulus (60 FPS).
2. **Room-based Multiplayer (2–4 Players)**: Pemain dapat membuat/masuk room, menunggu di lobby, balapan bersama di rute yang sama, dan melihat posisi pemain lain secara realtime.
3. **Decoupled Architecture**: Karena integrasi Supabase, Vercel, dan GitHub ditangani pihak lain / ditunda, pengembangan lokal memanfaatkan **Mock Realtime Service (BroadcastChannel API)** sehingga 2–4 tab browser dapat balapan satu sama lain di mesin lokal secara instan.
4. **Clean Backend Handoff**: Network layer menggunakan interface `IMultiplayerService` yang modular sehingga saat tim backend selesai membuat skema Supabase, mereka tinggal mengimplementasikan adapter tanpa menyentuh kode game canvas atau UI.

---

## 2. Technical Stack

- **Framework**: Next.js 14+ (App Router) dengan TypeScript.
- **Styling**: Vanilla CSS / Tailwind CSS dengan tema retro arcade/playful.
- **2D Rendering Engine**: PixiJS v8 (rendering WebGL/WebGPU cepat, sprite container, partikel, parallax scrolling).
- **Physics**: Custom lightweight AABB (Axis-Aligned Bounding Box) collision detection dengan kinematic movement (auto-run + jump).
- **Local Realtime Mock**: Browser `BroadcastChannel` API + throttled network state updates (10–20 Hz) dengan client-side linear interpolation (lerp).

---

## 3. System Architecture & Directory Structure

```
drop-ur-embege/
├── public/
│   ├── assets/
│   │   ├── sprites/            # Sprite kurir MBG, rintangan (batu, lubang, gerobak)
│   │   └── backgrounds/        # Parallax layers (langit, pohon/SPPG, jalan)
├── src/
│   ├── app/
│   │   ├── page.tsx            # Home / Landing Screen (Play, Room Code, Instructions)
│   │   ├── room/
│   │   │   └── [roomId]/
│   │   │       ├── lobby/
│   │   │       │   └── page.tsx # Lobby Screen (Player list, Ready state, Start)
│   │   │       └── race/
│   │   │           └── page.tsx # Active Game Screen (PixiJS Canvas + HUD Overlay)
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── game/                   # Pure 2D Game Logic (No React Hooks)
│   │   ├── core/
│   │   │   ├── GameApp.ts      # Setup PixiJS Application instance
│   │   │   ├── GameLoop.ts     # Delta time, tick updates, 60fps loop
│   │   │   └── Camera.ts       # Follow-camera mengunci posisi horizontal player
│   │   ├── entities/
│   │   │   ├── Player.ts       # Local player (physics, velocity, jump, controls)
│   │   │   ├── RemotePlayer.ts # Ghost player (lerp interpolation, nickname tag)
│   │   │   └── Obstacle.ts     # Obstacles (puddle, rock, cart) with hitboxes
│   │   ├── level/
│   │   │   ├── LevelManager.ts # Track length (SPPG to School), obstacle spawner
│   │   │   └── ParallaxBg.ts   # Multi-layer background scroller
│   │   └── physics/
│   │       └── Collision.ts    # Lightweight AABB collision logic
│   │
│   ├── services/               # Networking & Realtime Layer
│   │   ├── IMultiplayerService.ts     # Contract interface for multiplayer
│   │   ├── BroadcastChannelService.ts # Local mock multi-tab implementation
│   │   └── SupabaseService.stub.ts    # Ready-to-implement template for backend team
│   │
│   └── components/             # React UI Wrappers
│       ├── CanvasView.tsx      # Mounts PixiJS canvas safely in Next.js client component
│       ├── GameHUD.tsx         # Mini-map/track progress bar, timer, countdown overlay
│       └── ResultModal.tsx     # Podium result modal (1st - 4th position & finish times)
```

---

## 4. Game Mechanics & Physics

### Movement & Controls
- **Auto-Run**: Pemain secara otomatis melaju maju dengan kecepatan konstan `BASE_SPEED = 280 px/s`.
- **Jump (`Space`)**: Memberikan impuls vertikal `velocityY = -550 px/s` yang ditarik ke bawah oleh gravitasi `GRAVITY = 1200 px/s²` hingga kembali ke `GROUND_Y`.
- **Position Nudge (`A` / `D` atau Panah Kiri / Kanan)**: Penyesuaian mikro kecepatan (+/- 40 px/s) untuk mengatur timing lompatan melewati rintangan.

### Level & Parallax Design
- **Lintasan Balap**: Jarak total rute dari SPPG ke Gerbang Sekolah didefinisikan sebesar `TRACK_LENGTH = 6000 px`.
- **Tiga Lapisan Parallax**:
  1. *Far Layer (Langit & Awan)*: scroll factor 0.1x.
  2. *Mid Layer (SPPG, Rumah Warga, Pepohonan)*: scroll factor 0.4x.
  3. *Foreground (Jalan Aspal, Marka Jalan, Trotoar)*: scroll factor 1.0x.
- **Rintangan (Obstacles)**:
  - *Genangan / Lubang*: Memberikan efek perlambatan (speed penalty 40% selama 1 detik).
  - *Batu / Pembatas Jalan*: Menghentikan laju horizontal selama 0.5 detik jika tidak dilompati.
- **Finish Line**: Terletak pada `x = 5800 px` (Gerbang Sekolah). Melewati garis ini langsung memicu event finish lokal dan mengirimkan waktu tempuh ke room.

---

## 5. Networking & Mock Multiplayer Contract

### Data Contracts (`IMultiplayerService.ts`)
```typescript
export interface PlayerState {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  x: number;
  y: number;
  finished: boolean;
  finishTime?: number; // millisecond timestamp / elapsed ms
}

export interface IMultiplayerService {
  createRoom(hostName: string): Promise<string>;
  joinRoom(roomId: string, playerName: string): Promise<boolean>;
  leaveRoom(): void;
  setReady(isReady: boolean): void;
  startMatch(): void;
  broadcastPosition(x: number, y: number): void;
  broadcastFinish(timeElapsed: number): void;

  onPlayerListUpdate(callback: (players: PlayerState[]) => void): void;
  onMatchStart(callback: () => void): void;
  onPlayerPositionUpdate(callback: (playerId: string, x: number, y: number) => void): void;
  onPlayerFinish(callback: (playerId: string, finishTime: number) => void): void;
}
```

### Local Multi-Tab Simulation (`BroadcastChannelService.ts`)
- Setiap sesi diidentifikasi melalui kanal: `drop_embege_room_${roomId}`.
- Pemain lokal mengirimkan paket update posisi setiap **60ms (sekitar 16 Hz)** untuk menghemat resource.
- Pemain lain (RemotePlayer) menggunakan rumus interpolasi:
  ```typescript
  renderX += (targetX - renderX) * 0.2;
  renderY += (targetY - renderY) * 0.2;
  ```
- Deteksi tab tertutup (`window.addEventListener('beforeunload', ...)`): Mengirimkan sinyal `LEAVE` sehingga pemain lain langsung membersihkan entity tanpa ghost terdampar.

---

## 6. UI Flow & State Machine

```
[HOME] 
  │
  ├──> Create Room ──┐
  └──> Join Room   ──┴─> [LOBBY] (Room Code, Player List, Ready Toggle)
                           │ 
                           │ (Host klik "Start Race" saat min. 2 ready / solo practice)
                           ▼
                        [COUNTDOWN] (3... 2... 1... GO! - Input di-lock)
                           │
                           ▼
                        [RACE SCREEN] (Canvas PixiJS + HUD Progress Bar)
                           │
                           │ (Pemain melewati garis finish atau batas waktu 60 detik)
                           ▼
                        [RESULT MODAL] (Podium 1 - 4 & catatan waktu)
                           │
                           └──> "Main Lagi" (Kembali ke Lobby) / "Keluar"
```

---

## 7. Development Order (Phased Roadmap)

Berikut adalah tahapan implementasi berurutan sesuai arahan PRD:

- **Phase 1: Project Setup & Player Core Engine**
  - Scaffold Next.js App Router + TypeScript + Tailwind.
  - Setup PixiJS canvas lifecycle dalam komponen React (`CanvasView`).
  - Implementasi `Player` dengan auto-run, jump gravity, dan collision ground.
- **Phase 2: Level 1 (SPPG to School) & Obstacles**
  - Parallax scrolling background (langit, lingkungan SPPG, jalanan).
  - Generator rintangan (lubang jalan, batu) dan AABB collision detection.
  - Finish line gate di area sekolah.
- **Phase 3: Core Game Loop & HUD**
  - State countdown 3-2-1-GO, timer balapan, dan status finish lokal.
  - Progress bar balapan di bagian atas layar (menampilkan avatar pemain bergerak menuju finish).
- **Phase 4: UI Shell & Room Management**
  - Halaman Home (nama pemain, create room, join room).
  - Halaman Lobby (menampilkan daftar pemain dan status ready).
- **Phase 5: Local Mock Realtime Sync (BroadcastChannel)**
  - Implementasi `BroadcastChannelService`.
  - Sinkronisasi status ready & trigger start match antar-tab.
  - Rendering `RemotePlayer` dengan name tag dan interpolasi posisi realtime.
- **Phase 6: Multiplayer Race & Result Standings**
  - Sinkronisasi garis finish antar pemain.
  - Menghitung urutan juara (Podium 1-4) dan menampilkan `ResultModal`.
- **Phase 7: Backend Handoff Preparation**
  - File template `SupabaseService.stub.ts` dengan instruksi pemetaan tabel/channel Supabase Realtime agar tim backend dapat mengintegrasikannya secara langsung.
