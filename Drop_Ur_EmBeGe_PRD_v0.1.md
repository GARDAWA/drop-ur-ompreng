# DROP UR EMBEGE!
## Product Requirements Document
**Versi 0.1 - MVP**

> Dokumen ini adalah pedoman produk dan arsitektur tingkat konsep. Bukan dokumen kode atau implementasi.

---

## 1. Product Overview

**Drop Ur EmBeGe!** adalah game multiplayer berbasis web dengan fokus pada pengalaman arcade yang cepat, ringan, dan mudah dipahami. Game mengambil tema pengantaran Makanan Bergizi Gratis (MBG) dari SPPG menuju sekolah, lalu mengubah perjalanan tersebut menjadi lomba menghindari rintangan.

| Aspek | Definisi |
|---|---|
| **Problem / kebutuhan** | Membuat game multiplayer yang dapat dimainkan di browser tanpa arsitektur yang terlalu kompleks untuk developer pemula. |
| **Player promise** | Masuk room, mulai balapan, hindari rintangan, lalu **“Drop MBG!”** secepat mungkin. |
| **Primary fun** | Timing lompatan, menghindari obstacle, melihat pemain lain, dan mengejar posisi. |
| **Session target** | Satu match dibuat singkat agar mudah replay. Durasi final akan dituning saat prototyping. |
| **Success MVP** | 2-4 pemain dapat masuk satu room dan menyelesaikan satu race dengan state multiplayer yang cukup sinkron. |

---

## 2. Goals & Non-Goals

### Goals

- Game dapat dimainkan langsung di browser.
- Game multiplayer room-based untuk 2-4 pemain.
- Satu level sudah cukup untuk membuktikan gameplay.
- Interaksi utama sederhana: bergerak, lompat, hindari obstacle, finish.
- Realtime digunakan secukupnya untuk membuat pemain lain terlihat hidup.
- Arsitektur mudah dipahami dan dirawat oleh developer pemula.

### Non-Goals MVP

- Open world penuh.
- Game kompetitif skala besar / 20+ pemain.
- Combat, skill, item inventory, shop, atau progression kompleks.
- Chat suara atau sistem sosial besar.
- Mobile control penuh pada tahap pertama.
- Server physics kompleks atau dedicated game server.

---

## 3. Product Decisions - Baseline MVP

PRD ini memakai keputusan baseline dari brainstorming. Keputusan tersebut boleh diubah oleh Product Owner sebelum implementasi dimulai, tetapi perubahan setelah development berjalan dapat menambah scope.

| Keputusan | Baseline MVP | Alasan |
|---|---|---|
| **Perspektif** | Side-scrolling 2D | Collision, level, dan kamera lebih sederhana. |
| **Movement** | Auto-run | Kontrol lebih sedikit dan sinkronisasi multiplayer lebih ringan. |
| **Mode** | Race | Aturan kemenangan mudah dipahami. |
| **Win condition** | Pertama mencapai sekolah / Drop MBG | Tidak membutuhkan sistem skor kompleks. |
| **Player interaction** | Melihat posisi pemain lain | Memberi rasa multiplayer tanpa physics antarpemain yang rumit. |
| **Room size** | 2-4 pemain | Batas realistis untuk MVP pemula. |
| **Platform** | Desktop browser | Keyboard paling mudah untuk tahap awal. |

### Design Principle

> Jangan menambah fitur hanya untuk terlihat kompleks. Setiap fitur baru harus menjawab: apakah ini membuat MVP lebih **playable, multiplayer, stable, atau fun**?

---

## 4. Core Gameplay

Core gameplay harus dapat dilakukan berulang kali dengan aturan yang mudah dipahami.

| Step | Player action | Expected result |
|---|---|---|
| **1. Join** | Create atau Join Room | Player masuk lobby. |
| **2. Ready** | Player menekan Ready | Status player menjadi siap. |
| **3. Start** | Game dimulai saat kondisi start terpenuhi | Countdown lalu semua player masuk level. |
| **4. Drive** | Kendaraan auto-run | Kendaraan bergerak menuju sekolah. |
| **5. Jump** | Tekan Space saat perlu | Kendaraan melewati obstacle tertentu. |
| **6. Race** | Pertahankan ritme dan timing | Posisi relatif terhadap player lain berubah. |
| **7. Drop** | Mencapai area sekolah | Player finish dan hasil dicatat untuk match. |
| **8. Result** | Melihat hasil | Urutan finish dan waktu tampil. |

### Kontrol MVP

| Input | Fungsi |
|---|---|
| **A / Left Arrow** | Gerak kiri / koreksi posisi jika diperlukan |
| **D / Right Arrow** | Gerak kanan / koreksi posisi jika diperlukan |
| **Space** | Jump |

**Catatan scope:** Bila prototype menunjukkan auto-run sudah cukup, tombol kiri/kanan dapat dikurangi. Jangan mempertahankan kontrol yang tidak memberi nilai gameplay.

---

## 5. Gameplay Rules

| Rule | MVP requirement |
|---|---|
| **Start** | Match dimulai setelah lobby memenuhi aturan start yang ditetapkan. |
| **Race** | Semua player memainkan level yang sama dan memiliki garis finish yang sama. |
| **Obstacle** | Obstacle memiliki perilaku konsisten dan dapat dipelajari melalui trial-and-error. |
| **Collision** | Collision tidak boleh membuat player lain bergantung pada physics player secara langsung. |
| **Finish** | Player dianggap finish saat mencapai area finish sekolah. |
| **Result** | Urutan utama berdasarkan waktu finish; player yang belum finish ditampilkan sebagai belum selesai saat match berakhir. |
| **Replay** | Setelah result, player dapat kembali ke lobby / membuat room baru. |

---

## 6. Multiplayer Design

Multiplayer menggunakan **room-based session**. Setiap match adalah kelompok kecil pemain yang berbagi satu level.

### Flow

```text
Create Room -> Share Code -> Join -> Lobby -> Ready -> Start -> Realtime Match -> Finish -> Result
```

### Responsibility per Technology

| Komponen | Responsibility |
|---|---|
| **Next.js** | UI, routing, lobby, game screen, dan state lokal game. |
| **Supabase Database** | Menyimpan data room/player/session yang memang perlu dipersist. |
| **Supabase Realtime** | Mendistribusikan perubahan state multiplayer secara realtime. |
| **GitHub** | Source control, branch/commit, dan kolaborasi. |
| **Vercel** | Deployment web app. |

### Realtime Scope

- Player join / leave room.
- Ready state.
- Game start / session state.
- Posisi atau movement state player secara berkala.
- Finish state dan result event.
- Disconnect / reconnect state bila memungkinkan dalam scope MVP.

### Yang Bukan Tanggung Jawab Realtime

- Menyimpan setiap frame gerakan player ke database permanen.
- Menyimpan seluruh histori posisi selama match.
- Menggantikan seluruh logic game lokal.

---

## 7. Player Interaction

| Interaction | MVP? | Detail |
|---|---|---|
| **See other players** | **WAJIB** | Player lain terlihat bergerak pada level yang sama. |
| **Race / overtake** | **WAJIB** | Posisi pemain menjadi bagian dari keseruan. |
| **Physical bump** | DITUNDA | Menghindari konflik physics multiplayer. |
| **Chat** | DITUNDA | Tidak penting untuk membuktikan core loop. |
| **Voice chat** | DITUNDA | Di luar scope dan menambah kompleksitas. |
| **Attack / combat** | DITUNDA | Tidak sesuai core concept MVP. |

---

## 8. Win / Lose / Match End

### MVP

- **Win / position:** player pertama yang mencapai sekolah menjadi urutan pertama.
- **Finish:** setiap player dapat selesai secara individual.
- **Match end:** match ditutup setelah semua player selesai atau setelah kondisi timeout yang nantinya ditentukan saat balancing.
- **Result:** tampilkan urutan, nama/display name, dan waktu finish bila tersedia.

### Belum Digunakan

- HP / health bar
- MBG integrity meter
- Penalty score
- Coin / score economy

---

## 9. MVP Feature List

> **MVP = wajib agar game dapat dimainkan.**

| Feature | Priority | Acceptance criteria ringkas |
|---|---|---|
| **Home** | WAJIB | Player dapat mulai membuat/join room. |
| **Create Room** | WAJIB | Room code dibuat dan lobby dapat diakses. |
| **Join Room** | WAJIB | Player dengan code valid dapat masuk. |
| **Lobby** | WAJIB | Daftar player terlihat dan status ready tersedia. |
| **Single level** | WAJIB | Ada satu rute SPPG -> sekolah yang dapat diselesaikan. |
| **Movement** | WAJIB | Player dapat bergerak dan melakukan jump. |
| **Obstacles** | WAJIB | Beberapa obstacle dapat memengaruhi perjalanan. |
| **Realtime player** | WAJIB | Player dapat melihat pergerakan player lain secara cukup realtime. |
| **Finish** | WAJIB | Game mengenali player yang mencapai finish. |
| **Result** | WAJIB | Urutan hasil dapat dilihat setelah match. |
| **Basic error state** | WAJIB | Room/game gagal menampilkan pesan yang jelas. |

---

## 10. Optional Backlog

> **Optional = dikerjakan setelah MVP selesai dan stabil.**

| Feature | Kenapa ditunda |
|---|---|
| **Multiple maps** | MVP cukup dengan satu map untuk validasi core loop. |
| **Multiple vehicles** | Menambah balancing, asset, dan test. |
| **Skins / customization** | Tidak memengaruhi gameplay inti. |
| **Power-up** | Menambah rules dan synchronization. |
| **Leaderboard global** | Membutuhkan persistence dan desain ranking. |
| **Account system lengkap** | Guest/display name sudah cukup untuk eksperimen awal. |
| **Chat** | Tidak penting untuk core loop. |
| **Mobile controls** | Desktop-first untuk mengurangi variasi input. |
| **Open world** | Scope jauh lebih besar dari kebutuhan MVP. |

---

## 11. Supabase Data Model - Conceptual

Model berikut bersifat konseptual. Nama tabel/kolom final dapat disesuaikan saat desain database. Prinsip utamanya adalah menyimpan data sesedikit mungkin.

| Entity | Data inti | Fungsi |
|---|---|---|
| **rooms** | room id, status, max player, created time, creator/host reference | Mewakili satu lobby/match. |
| **players** | player id, room id, display name, ready state, connection state, finish state | Mewakili player di sebuah room. |
| **game sessions** | session id, room id, start time, end state | Opsional bila state match perlu dipisahkan dari room. |

### Database Rule

Posisi realtime player sebaiknya tidak ditulis terus-menerus sebagai record permanen. Gunakan channel/state realtime untuk komunikasi match, lalu simpan hanya data hasil yang diperlukan.

---

## 12. Main Pages / Screen Structure

| Screen | Isi utama | Aksi utama |
|---|---|---|
| **Home** | Judul game, tombol Play, How to Play | Masuk flow permainan. |
| **Create Room** | Nama/display name, create | Membuat room. |
| **Join Room** | Room code, nama/display name | Masuk room. |
| **Lobby** | Room code, player list, ready, start | Persiapan match. |
| **Game** | Canvas/game area, player, obstacles, status finish | Bermain. |
| **Result** | Urutan finish, waktu, replay/back | Mengulang atau keluar. |

### Struktur Flow

```text
Home
  |
  +--> Create Room ----+
  |                    |
  +--> Join Room ------+--> Lobby --> Game --> Result
```

---

## 13. Technical Constraints

| Constraint | Rule |
|---|---|
| **Framework** | Gunakan Next.js. |
| **Backend / DB** | Gunakan Supabase. |
| **Realtime** | Gunakan Supabase Realtime. |
| **Repository** | Gunakan GitHub. |
| **Deployment** | Gunakan Vercel. |
| **Extra technology** | Jangan menambah teknologi lain kecuali ada kebutuhan teknis yang benar-benar tidak dapat dipenuhi oleh stack ini. |
| **Browser** | Target desktop modern browser pada MVP. |
| **Security** | Jangan menaruh secret key di client. Detail implementasi mengikuti konfigurasi Supabase/Vercel yang aman. |

---

## 14. Non-Functional Requirements

| Area | Requirement MVP |
|---|---|
| **Performance** | Game terasa responsif di perangkat desktop target; hindari update network yang tidak perlu. |
| **Stability** | Player yang disconnect tidak boleh membuat room crash secara permanen. |
| **Usability** | Aturan permainan dapat dipahami dari UI tanpa tutorial panjang. |
| **Maintainability** | Struktur project dan naming harus mudah dipahami siswa/developer pemula. |
| **Deployment** | Build dan deploy dapat dilakukan melalui GitHub -> Vercel dengan proses sederhana. |
| **Error handling** | Tampilkan status loading, room not found, room full, dan game unavailable secara jelas. |

---

## 15. Risiko Teknis & Mitigasi

| Risk | Impact | Mitigation MVP |
|---|---|---|
| **Realtime desync** | High | Batasi scope interaction, kirim state berkala, dan prioritaskan visual sync yang cukup. |
| **Physics/collision bug** | High | Gunakan movement dan obstacle sederhana; test satu mekanik sebelum menambah lainnya. |
| **Room state stuck** | Medium | Definisikan state room dengan jelas dan tangani player leave/disconnect. |
| **Too many network updates** | High | Jangan mengirim setiap frame; gunakan update berkala. |
| **Scope creep** | High | Fitur di luar MVP masuk backlog, bukan langsung dikerjakan. |
| **Mobile/browser issue** | Medium | Desktop-first pada MVP. |
| **Asset overload** | Medium | Gunakan jumlah asset minimal untuk satu level. |

---

## 16. Development Order

| Phase | Output | Definition of done |
|---|---|---|
| **1. Prototype player** | Movement + jump + camera | Player bisa menyelesaikan test area. |
| **2. Prototype level** | SPPG -> school + obstacle | Satu rute dapat dimainkan sampai finish. |
| **3. Game states** | Start, playing, finish, result | Single-player loop lengkap. |
| **4. Room system** | Create, join, lobby | 2-4 player dapat berada di satu room. |
| **5. Realtime sync** | Player state sync | Player dapat melihat player lain bergerak. |
| **6. Multiplayer finish** | Race + result | Match 2-4 player dapat selesai dengan result. |
| **7. Stabilization** | Reconnect/error handling | Kasus umum gagal/leave tidak merusak session. |
| **8. Polish** | UI/animation/audio ringan bila perlu | Game terasa lebih rapi tanpa menambah core scope. |

### Prioritas pengerjaan

```text
Single Player
    ↓
Playable Level
    ↓
Game State
    ↓
Room
    ↓
Realtime
    ↓
Multiplayer Finish
    ↓
Stability
    ↓
Polish
```

---

## 17. Acceptance Criteria - MVP Complete

MVP dianggap complete ketika seluruh kondisi berikut terpenuhi:

1. Player dapat membuka game dari browser desktop.
2. Player dapat membuat room dan mendapatkan room code.
3. Player lain dapat join menggunakan room code yang valid.
4. Lobby menampilkan 2-4 player dalam room.
5. Player dapat masuk ke match dan melihat level yang sama.
6. Player dapat menjalankan movement dan jump.
7. Obstacle dapat dilalui/diatasi dengan timing yang sesuai.
8. Posisi atau state player lain terlihat diperbarui secara realtime dengan toleransi yang wajar.
9. Player dapat mencapai sekolah dan status finish terdeteksi.
10. Result menampilkan urutan finish.
11. Room/game memiliki state error dasar seperti room penuh atau tidak ditemukan.
12. Aplikasi dapat di-deploy ke Vercel dari repository GitHub.

---

## 18. Definition of Done untuk Developer

- Requirement yang dikerjakan sesuai PRD dan tidak diam-diam menambah fitur baru.
- Fitur diuji pada local development sebelum merge/deploy.
- Perubahan penting memiliki commit yang jelas di GitHub.
- Tidak ada secret key yang masuk ke repository.
- Flow utama **Create/Join -> Lobby -> Game -> Result** dapat dicoba dari awal sampai akhir.
- Bug yang menghentikan core loop harus diprioritaskan di atas polish atau fitur tambahan.

---

## 19. AI Agent Handoff Rules

Bagian ini dibuat agar PRD dapat dipakai sebagai konteks awal untuk AI coding/game agent pada tahap implementasi.

- Anggap PRD v0.1 sebagai **source of truth** untuk MVP.
- Jangan menambah framework, library, service, atau sistem baru tanpa alasan teknis yang jelas.
- Jangan mengimplementasikan fitur Optional sebelum seluruh acceptance criteria MVP terpenuhi.
- Saat menemukan keputusan yang belum didefinisikan dan berdampak besar pada architecture/gameplay, berhenti dan minta keputusan Product Owner.
- Prioritaskan playable flow daripada polish visual.
- Gunakan Supabase Realtime secukupnya; jangan memindahkan semua logic game ke database.
- Setiap perubahan yang memperbesar scope harus diberi label sebagai backlog / optional, bukan dianggap requirement MVP.

### Implementation Target

> Hasil akhir tahap MVP bukan “game lengkap”. Hasil akhir yang dicari adalah satu game kecil yang benar-benar bisa dimainkan oleh 2-4 orang melalui browser dan selesai dari lobby sampai result.

---

## 20. Backlog Ideas - Setelah MVP Stabil

| Area | Contoh pengembangan |
|---|---|
| **Content** | Map kedua, obstacle baru, variasi sekolah/SPPG. |
| **Gameplay** | Power-up sederhana, shortcut, risk/reward route. |
| **Cosmetic** | Skin kendaraan, warna, efek sederhana. |
| **Multiplayer** | Matchmaking, reconnect yang lebih kuat, spectator. |

---

## Project Snapshot

| Item | Baseline |
|---|---|
| **Nama** | Drop Ur EmBeGe! |
| **Genre** | 2D arcade delivery / race |
| **Target** | Gamer web |
| **Visual** | Flat graphic, simple and playful |
| **Platform** | Desktop modern browser |
| **Player per room** | 2-4 |
| **Multiplayer** | Room-based + Supabase Realtime |
| **Game mode** | Race |
| **Movement** | Auto-run + jump |
| **Level MVP** | 1 level, SPPG -> sekolah |
| **Stack** | Next.js + Supabase + Supabase Realtime + GitHub + Vercel |
| **Developer context** | Pemula / siswa RPL |
| **Scope principle** | Simple -> Playable -> Multiplayer -> Stable -> Fun |
