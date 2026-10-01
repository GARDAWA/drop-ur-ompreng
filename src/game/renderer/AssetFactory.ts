import { Texture } from 'pixi.js';

export class AssetFactory {
  private static cache: Map<string, Texture> = new Map();

  /**
   * Helper to create a PixiJS Texture from a custom 2D canvas drawing
   */
  private static fromCanvas(key: string, width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void): Texture {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    if (typeof document === 'undefined') {
      return Texture.WHITE;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      draw(ctx);
    }

    const texture = Texture.from(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * High-detail Courier Scooter with rider and MBG box
   */
  public static getCourierTexture(colorScheme: 'green' | 'blue' | 'red' | 'purple' = 'green'): Texture {
    const key = `courier_${colorScheme}`;
    return this.fromCanvas(key, 96, 72, (ctx) => {
      const colors = {
        green: { body: '#10b981', bodyDark: '#047857', box: '#f59e0b', helmet: '#34d399' },
        blue: { body: '#3b82f6', bodyDark: '#1d4ed8', box: '#ec4899', helmet: '#60a5fa' },
        red: { body: '#ef4444', bodyDark: '#b91c1c', box: '#8b5cf6', helmet: '#f87171' },
        purple: { body: '#a855f7', bodyDark: '#7e22ce', box: '#06b6d4', helmet: '#c084fc' },
      }[colorScheme];

      // 1. Wheels
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(22, 54, 13, 0, Math.PI * 2);
      ctx.arc(74, 54, 13, 0, Math.PI * 2);
      ctx.fill();

      // Rims & Hubs
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(22, 54, 6, 0, Math.PI * 2);
      ctx.arc(74, 54, 6, 0, Math.PI * 2);
      ctx.fill();

      // Rim spokes
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(22, 44); ctx.lineTo(22, 64);
      ctx.moveTo(12, 54); ctx.lineTo(32, 54);
      ctx.moveTo(74, 44); ctx.lineTo(74, 64);
      ctx.moveTo(64, 54); ctx.lineTo(84, 54);
      ctx.stroke();

      // 2. Exhaust Pipe & Muffler
      ctx.fillStyle = '#475569';
      ctx.fillRect(8, 50, 18, 5);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(4, 48, 8, 8);

      // 3. Scooter Chassis / Body
      ctx.fillStyle = colors.bodyDark;
      ctx.beginPath();
      ctx.roundRect(20, 42, 56, 12, 4);
      ctx.fill();

      ctx.fillStyle = colors.body;
      ctx.beginPath();
      ctx.moveTo(28, 42);
      ctx.lineTo(44, 42);
      ctx.lineTo(54, 32);
      ctx.lineTo(72, 34);
      ctx.lineTo(80, 46);
      ctx.lineTo(70, 52);
      ctx.lineTo(26, 52);
      ctx.closePath();
      ctx.fill();

      // Headlight
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(82, 38, 5, 0, Math.PI * 2);
      ctx.fill();

      // Handlebar
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(68, 32);
      ctx.lineTo(64, 22);
      ctx.lineTo(70, 20);
      ctx.stroke();

      // 4. MBG Insulated Delivery Box (Peti MBG)
      ctx.fillStyle = colors.box;
      ctx.beginPath();
      ctx.roundRect(14, 20, 28, 24, 4);
      ctx.fill();

      // Box straps & lock
      ctx.fillStyle = '#78350f';
      ctx.fillRect(14, 30, 28, 3);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(25, 29, 6, 5);

      // Text "MBG"
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px Arial, sans-serif';
      ctx.fillText('MBG', 18, 27);

      // 5. Courier Driver
      // Body / Jacket
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(42, 22, 16, 20, 4);
      ctx.fill();

      // Arms holding handlebars
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(48, 26);
      ctx.lineTo(60, 24);
      ctx.lineTo(66, 22);
      ctx.stroke();

      // Helmet
      ctx.fillStyle = colors.helmet;
      ctx.beginPath();
      ctx.arc(50, 15, 11, 0, Math.PI * 2);
      ctx.fill();

      // Visor / Goggles
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(50, 12, 10, 6, 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(52, 13, 6, 2); // reflection highlight

      // Red/White scarf (Syall Merah Putih berkibar)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(42, 24);
      ctx.lineTo(32, 22);
      ctx.lineTo(34, 28);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(34, 25);
      ctx.lineTo(26, 23);
      ctx.lineTo(28, 29);
      ctx.closePath();
      ctx.fill();
    });
  }

  /**
   * Puddle / Lubang Jalan dengan retakan aspal & cipratan air
   */
  public static getPuddleTexture(): Texture {
    return this.fromCanvas('puddle_tex', 80, 24, (ctx) => {
      // Aspal retak
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(40, 14, 38, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Air genangan berlumpur memantul
      const grad = ctx.createLinearGradient(15, 8, 65, 18);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.5, '#38bdf8');
      grad.addColorStop(1, '#0369a1');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(40, 13, 32, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ripple reflection
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(36, 12, 16, 3, 0, 0, Math.PI);
      ctx.stroke();

      // Water droplets
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.arc(68, 6, 2, 0, Math.PI * 2);
      ctx.arc(14, 8, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Batu kali besar & Cone Pembatas
   */
  public static getRockTexture(): Texture {
    return this.fromCanvas('rock_tex', 52, 44, (ctx) => {
      // Traffic Cone oranye neon
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(26, 4);
      ctx.lineTo(8, 38);
      ctx.lineTo(44, 38);
      ctx.closePath();
      ctx.fill();

      // Base plate
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.roundRect(4, 36, 44, 6, 2);
      ctx.fill();

      // White reflective stripes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(22, 15);
      ctx.lineTo(30, 15);
      ctx.lineTo(34, 22);
      ctx.lineTo(18, 22);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(16, 26);
      ctx.lineTo(36, 26);
      ctx.lineTo(40, 33);
      ctx.lineTo(12, 33);
      ctx.closePath();
      ctx.fill();

      // Cone shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(26, 4, 18, 34);
    });
  }

  /**
   * Bangunan Dapur SPPG (Pusat Pelayanan Gizi)
   */
  public static getSPPGBuildingTexture(): Texture {
    return this.fromCanvas('sppg_bldg', 280, 160, (ctx) => {
      // Dinding Gedung
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(10, 30, 260, 130);

      // Atap Segitiga
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(0, 30);
      ctx.lineTo(140, 2);
      ctx.lineTo(280, 30);
      ctx.closePath();
      ctx.fill();

      // Pintu Masuk Dapur
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(110, 80, 60, 80);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(115, 85, 22, 35);
      ctx.fillRect(143, 85, 22, 35);

      // Jendela
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(30, 60, 45, 40);
      ctx.fillRect(205, 60, 45, 40);

      // Plang Banner SPPG
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(40, 36, 200, 22);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 36, 200, 22);

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏢 DAPUR MBG - SPPG PUSAT', 140, 52);

      // Cerobong asap
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(220, 6, 20, 25);
    });
  }

  /**
   * Gerbang Sekolah SDN Merdeka + Anak-anak SD bersorak
   */
  public static getSchoolFinishTexture(): Texture {
    return this.fromCanvas('school_finish', 340, 180, (ctx) => {
      // Gedung Sekolah latar belakang
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(60, 30, 220, 150);

      // Atap Genteng Merah
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(40, 30);
      ctx.lineTo(170, 4);
      ctx.lineTo(300, 30);
      ctx.closePath();
      ctx.fill();

      // Papan Sekolah
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(80, 38, 180, 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏫 SDN 01 MERDEKA (DROP MBG)', 170, 55);

      // Tiang Bendera Merah Putih
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(35, 180);
      ctx.lineTo(35, 20);
      ctx.stroke();

      // Bendera Indonesia
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(36, 20, 28, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(36, 30, 28, 10);

      // Gerbang Gapura Finish Line (Catur Hitam Putih)
      for (let y = 50; y < 180; y += 15) {
        ctx.fillStyle = (y / 15) % 2 === 0 ? '#111827' : '#ffffff';
        ctx.fillRect(0, y, 14, 15);
      }

      // Spanduk Finish
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(0, 50, 160, 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'black 13px Arial, sans-serif';
      ctx.fillText('🏁 FINISH LINE 🏁', 80, 67);

      // Anak-anak SD bergembira menyambut (Seragam Putih Merah)
      const drawChild = (x: number, y: number, hair: string) => {
        // Kepala
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(x, y - 24, 7, 0, Math.PI * 2);
        ctx.fill();
        // Rambut
        ctx.fillStyle = hair;
        ctx.beginPath();
        ctx.arc(x, y - 26, 7, Math.PI, Math.PI * 2);
        ctx.fill();
        // Baju Putih
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 5, y - 17, 10, 10);
        // Celana/Rok Merah
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x - 5, y - 7, 10, 9);
        // Tangan melambai
        ctx.strokeStyle = '#fbcfe8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 14); ctx.lineTo(x - 10, y - 24);
        ctx.moveTo(x + 5, y - 14); ctx.lineTo(x + 10, y - 24);
        ctx.stroke();
      };

      drawChild(70, 175, '#1e1b4b');
      drawChild(95, 175, '#78350f');
      drawChild(120, 175, '#1e293b');
      drawChild(145, 175, '#451a03');
    });
  }

  /**
   * Pohon Kelapa & Warung Tropis pinggir jalan
   */
  public static getTreeTexture(): Texture {
    return this.fromCanvas('tree_tex', 80, 140, (ctx) => {
      // Batang pohon
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(40, 140);
      ctx.quadraticCurveTo(35, 80, 42, 45);
      ctx.stroke();

      // Daun pohon rimbun
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(42, 40, 28, 0, Math.PI * 2);
      ctx.arc(20, 48, 22, 0, Math.PI * 2);
      ctx.arc(64, 48, 22, 0, Math.PI * 2);
      ctx.arc(42, 22, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(36, 36, 18, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}
