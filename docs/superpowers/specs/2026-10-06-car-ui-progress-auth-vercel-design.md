# Design Spec: UI Mobil SPPG, Realtime Progress Bar, Anonymous Auth Supabase, dan Vercel Ready

## 1. Konteks & Tujuan
Game web "Drop Ur EmBeGe" membutuhkan:
1. Penggantian visual mobil kurir dengan aset resmi truk SPPG (*Satuan Pelayanan Pemenuhan Gizi*) dari `public/assets/images/car.png`.
2. Sinkronisasi progress bar realtime di mode multiplayer tanpa flickering/desync.
3. Fitur autentikasi anonymous login berbasis username & password di Supabase untuk identitas pemain.
4. Kesiapan deployment Vercel dan Supabase Realtime dengan zero error/zero warning pada build dan test.

---

## 2. Rincian Desain Komponen

### A. UI Mobil & Sprite Truk SPPG (`AssetFactory.ts` & `PixiSceneRenderer.ts`)
- File gambar: `/assets/images/car.png` (sudah ditempatkan di folder `public`).
- Loader: `AssetFactory.getCourierTexture(colorScheme)` akan memuat texture dari Image bitmap `car.png` (dengan fallback kanvas 2D jika browser sedang memuat aset).
- Tinting & Identifier Multiplayer:
  - Local player: full bright / badge emas `🚗 KAMU (MBG)`.
  - Remote player: tint atau color filter sesuai palet (`cyan`, `rose`, `amber`, `emerald`) serta avatar badge yang konsisten.
  - Penyesuaian anchor & bounding box sprite agar roda menyentuh aspal dengan sempurna (`y: groundY`).

### B. Progress Bar Realtime & Sinkronisasi Multiplayer (`GameHUD.tsx`, `GameLoop.ts`, `race/page.tsx`)
- Standardisasi jarak finish: `finishX = 14000`, `startX = 100`.
- Rate broadcast posisi dinaikkan menjadi 20-30Hz saat balapan berjalan.
- Smoothing indikator di `GameHUD.tsx`:
  - Hitung progress lokal: `((currentX - startX) / (finishX - startX)) * 100`.
  - Hitung progress remote: `((p.x - startX) / (finishX - startX)) * 100`.
  - Gunakan CSS hardware acceleration `transition: left 80ms linear` agar pergerakan mobil di mini-track sangat mulus.
  - Indikator pin mobil remote dan lokal tidak saling tumpang tindih.

### C. Sistem Anonymous Auth dengan Username & Password (`src/lib/supabase/auth.ts`, `src/app/page.tsx`)
- Supabase menyediakan guest login via `supabase.auth.signInAnonymously()` atau fallback email-alias terenkripsi `user_${username}@dropembege.game` dengan password input user jika anon signin dinonaktifkan di project.
- Persistensi token sesi di browser cookies/localStorage (Supabase client).
- Tampilan UI login/guest di beranda (`/`):
  - Form Username & Password (guest mode).
  - Status koneksi Supabase indicator (Online/Guest).
  - Profil kurir tersimpan di `sessionStorage` & session Supabase.

### D. Konfigurasi Vercel & Supabase
- Konfigurasi `vercel.json` untuk header caching aset statis dan Next.js routing.
- Verifikasi tabel database Supabase (`rooms`, `room_players`, `leaderboard`) dengan RLS policies yang mengizinkan anon access.
- Validasi `.env.local` dan environment variables siap pasang di Vercel Dashboard.

### E. QC & Pengujian Zero-Error
- Perbaiki test case `tests/powerups.test.ts` (depletion rate per delta time).
- Jalankan seluruh 10 test files di `vitest run` (100% pass).
- Jalankan `npm run build` (Next.js production build tanpa error linting & typescript).

---

## 3. Rencana Pengujian
1. Unit tests: Fisika player, nitro depletion, multiplayer presence, dan Supabase client.
2. Build verification: `npm run build`.
3. Visual checking: Cek keberadaan file gambar di canvas PixiJS dan mini-map HUD.
