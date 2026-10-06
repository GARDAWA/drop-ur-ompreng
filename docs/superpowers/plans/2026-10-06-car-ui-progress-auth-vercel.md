# Rencana Implementasi: UI Mobil SPPG, Progress Bar Realtime, Supabase Auth & Vercel Readiness

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (Native execution). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementasi aset visual truk SPPG MBG, perbaikan sinkronisasi progress bar multiplayer realtime, sistem login anonymous username & password via Supabase Auth, kesiapan Vercel, serta QC zero error.

**Architecture:** Modifikasi `AssetFactory` untuk memuat truk SPPG `car.png` dengan canvas-texture loader dan tinting warna palet multiplayer; sinkronisasi koordinat x dan progress bar HUD secara realtime di Next.js & Supabase channels; integrasi auth Supabase guest session; konfigurasi deployment Vercel.

**Tech Stack:** Next.js 14 App Router, PixiJS, Supabase (Auth, Database, Realtime), Tailwind CSS, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-06-car-ui-progress-auth-vercel-design.md`

## Global Constraints
- Target startX = 100, finishX = 14000.
- Asset truk resmi berada di `public/assets/images/car.png`.
- Bebas error dan warning saat dijalankan `vitest run` dan `npm run build`.

---

### Task 1: Fix Existing Vitest Assertion di Powerups Test
**Files:**
- Modify: `tests/powerups.test.ts:18-35`
- Test: `tests/powerups.test.ts`

- [ ] **Step 1: Inspect and fix nitro test assertion**
- [ ] **Step 2: Run vitest to ensure all 10 test files pass**

### Task 2: Integrasi UI Mobil Truk SPPG MBG
**Files:**
- Create: `public/assets/images/car.png` (sudah disalin)
- Modify: `src/game/renderer/AssetFactory.ts`
- Modify: `src/game/renderer/PixiSceneRenderer.ts`
- Modify: `src/app/page.tsx` (tampilkan thumbnail/badge mobil resmi di menu awal)
- Test: `tests/renderer_asset.test.ts`

- [ ] **Step 1: Tambahkan helper texture loader untuk truk SPPG di AssetFactory**
- [ ] **Step 2: Sesuaikan anchor & rendering sprite di PixiSceneRenderer**
- [ ] **Step 3: Jalankan test dan build check**

### Task 3: Perbaikan Progress Bar Realtime & Multiplayer
**Files:**
- Modify: `src/game/core/GameLoop.ts`
- Modify: `src/components/GameHUD.tsx`
- Modify: `src/app/room/[roomId]/race/page.tsx`
- Test: `tests/e2e_game_simulation.test.ts`

- [ ] **Step 1: Normalisasi kalkulasi progressRatio (100 -> 14000)**
- [ ] **Step 2: Tingkatkan frekuensi sync posisi dan update realtime HUD**
- [ ] **Step 3: Uji simulasi multiplayer progress bar**

### Task 4: Sistem Autentikasi Login (Anonymous Guest with Username & Password)
**Files:**
- Create: `src/lib/supabase/auth.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/lib/supabase/database.types.ts`
- Test: `tests/supabase_auth.test.ts`

- [ ] **Step 1: Buat auth helper `signInGuest(username, password)` memanfaatkan Supabase client**
- [ ] **Step 2: Pasang UI modal/form Login Guest di HomePage**
- [ ] **Step 3: Integrasikan persistensi user profile ke session**

### Task 5: Kesiapan Vercel & Supabase Multiplayer
**Files:**
- Create: `vercel.json`
- Modify: `src/services/SupabaseRealtimeService.ts`
- Modify: `package.json`

- [ ] **Step 1: Buat file vercel.json dengan header caching aset dan route config**
- [ ] **Step 2: Verifikasi koneksi Realtime Supabase untuk environment Vercel**
- [ ] **Step 3: Jalankan full suite test dan `npm run build` zero-error**
