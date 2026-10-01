# Drop Ur EmBeGe! — Supabase Backend Integration Guide

Dokumen panduan ini ditujukan untuk tim Backend / Supabase untuk menghubungkan Supabase Database dan Realtime ke dalam frontend game **Drop Ur EmBeGe!** secara mulus tanpa mengganggu game engine PixiJS atau UI Next.js.

---

## 1. Arsitektur Jaringan Decoupled
Frontend dan Game Canvas **hanya berkomunikasi melalui satu interface kontrak**:
`src/services/IMultiplayerService.ts`

Saat ini mode dev lokal menggunakan `src/services/BroadcastChannelService.ts`. Ketika database Supabase siap, kalian hanya perlu:
1. Mengisi implementasi di `src/services/SupabaseService.stub.ts` (atau buat file `src/services/SupabaseService.ts`).
2. Mengubah inisialisasi di `src/services/multiplayerSingleton.ts` untuk mengembalikan instance `SupabaseService`.

---

## 2. Model Tabel Supabase yang Disarankan (PRD Section 11)

### Tabel `rooms`
- `id` (uuid, primary key)
- `room_code` (varchar 10, unique, index) — contoh: `MBG-842`
- `status` (varchar 20) — `'waiting' | 'racing' | 'finished'`
- `created_at` (timestamp with time zone)

### Tabel `players`
- `id` (uuid, primary key)
- `room_id` (uuid, foreign key -> rooms.id)
- `player_name` (text)
- `is_host` (boolean, default false)
- `is_ready` (boolean, default false)
- `finish_time` (float, nullable) — waktu tempuh balapan dalam detik (misal: `18.42`)
- `created_at` (timestamp with time zone)

---

## 3. Realtime Channel Specification

Kanal per room: `room:${room_code}`

### A. Presence (Player Join / Leave / Ready)
Gunakan Supabase Presence untuk mendeteksi siapa saja yang berada di dalam room secara otomatis tanpa polling database:
```typescript
channel.track({
  id: playerId,
  name: playerName,
  isHost: isHost,
  isReady: isReady,
});
```
Event listener:
```typescript
channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState();
  // Transform ke PlayerState[] lalu panggil callback
});
```

### B. Broadcast: Posisi Player Lain (`pos`)
Kirimkan update koordinat x dan y (dibatasi 10–20 Hz):
```typescript
channel.send({
  type: 'broadcast',
  event: 'pos',
  payload: { id: playerId, x, y },
});
```

### C. Broadcast: Host Memulai Balapan (`start_match`)
Saat host menekan "Mulai Balapan!":
```typescript
channel.send({
  type: 'broadcast',
  event: 'start_match',
  payload: {},
});
```

### D. Broadcast: Finish (`finish`)
Saat seorang pemain mencapai koordinat finish `x >= 5800`:
```typescript
channel.send({
  type: 'broadcast',
  event: 'finish',
  payload: { id: playerId, timeElapsed },
});
```
Sekaligus simpan `finish_time` ke tabel `players` untuk rekapitulasi.

---

## 4. Environment Variables
Siapkan file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
