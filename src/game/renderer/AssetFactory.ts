import { Texture, Assets } from 'pixi.js';

export class AssetFactory {
  private static cache: Map<string, Texture> = new Map();
  private static officialCarImage: HTMLImageElement | null = null;
  private static officialCarLoaded: boolean = false;

  public static init(): void {
    if (typeof window !== 'undefined' && !this.officialCarImage) {
      const img = new Image();
      img.src = '/assets/images/car.png';
      img.onload = () => {
        this.officialCarImage = img;
        this.officialCarLoaded = true;
      };
      this.officialCarImage = img;
    }
  }

  /**
   * Helper to create a PixiJS Texture from a high-resolution 2D canvas drawing
   */
  private static fromCanvas(
    key: string,
    width: number,
    height: number,
    draw: (ctx: CanvasRenderingContext2D) => void
  ): Texture {
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
      ctx.imageSmoothingEnabled = true;
      draw(ctx);
    }

    const texture = Texture.from(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * MBG Delivery Car (Satuan Pelayanan Pemenuhan Gizi Truk Resmi)
   */
  public static getCourierTexture(colorScheme: 'green' | 'blue' | 'red' | 'purple' = 'green'): Texture {
    const key = `mbg_sppg_car_v2_${colorScheme}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Try creating texture from official car image if available
    if (typeof document !== 'undefined') {
      const targetW = 160;
      const targetH = 100;
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.imageSmoothingEnabled = true;

        if (this.officialCarImage && this.officialCarImage.complete && this.officialCarImage.naturalWidth > 0) {
          // Render official car image with shadow and optional multiplayer player tint
          ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
          ctx.beginPath();
          ctx.ellipse(80, 94, 66, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.drawImage(this.officialCarImage, 4, 8, targetW - 8, targetH - 12);

          // If remote player, apply tint glow overlay
          if (colorScheme !== 'green') {
            const tintMap = {
              blue: 'rgba(56, 189, 248, 0.28)',
              red: 'rgba(244, 63, 94, 0.28)',
              purple: 'rgba(168, 85, 247, 0.28)',
            };
            ctx.save();
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = tintMap[colorScheme] || 'rgba(56, 189, 248, 0.25)';
            ctx.fillRect(0, 0, targetW, targetH);
            ctx.restore();
          }

          const texture = Texture.from(canvas);
          this.cache.set(key, texture);
          return texture;
        }
      }
    }

    return this.fromCanvas(key, 160, 100, (ctx) => {
      const palette = {
        green: {
          primary: '#10b981',
          primaryDark: '#047857',
          primaryLight: '#6ee7b7',
          accent: '#f59e0b',
          window: '#38bdf8',
        },
        blue: {
          primary: '#0284c7',
          primaryDark: '#0369a1',
          primaryLight: '#38bdf8',
          accent: '#ec4899',
          window: '#7dd3fc',
        },
        red: {
          primary: '#e11d48',
          primaryDark: '#be123c',
          primaryLight: '#fda4af',
          accent: '#8b5cf6',
          window: '#38bdf8',
        },
        purple: {
          primary: '#9333ea',
          primaryDark: '#7e22ce',
          primaryLight: '#d8b4fe',
          accent: '#06b6d4',
          window: '#7dd3fc',
        },
      }[colorScheme];

      ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
      ctx.beginPath();
      ctx.ellipse(80, 92, 60, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      const tireGrad = ctx.createRadialGradient(38, 82, 6, 38, 82, 14);
      tireGrad.addColorStop(0, '#334155');
      tireGrad.addColorStop(0.7, '#1e293b');
      tireGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = tireGrad;
      ctx.beginPath();
      ctx.arc(38, 82, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 1.4;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.moveTo(38 + Math.cos(a) * 10, 82 + Math.sin(a) * 10);
        ctx.lineTo(38 + Math.cos(a) * 14, 82 + Math.sin(a) * 14);
        ctx.stroke();
      }

      const rimGrad = ctx.createLinearGradient(30, 76, 46, 88);
      rimGrad.addColorStop(0, '#f8fafc');
      rimGrad.addColorStop(0.5, '#94a3b8');
      rimGrad.addColorStop(1, '#475569');
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(38, 82, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(38, 82, 3, 0, Math.PI * 2);
      ctx.fill();

      const tireGrad2 = ctx.createRadialGradient(122, 82, 6, 122, 82, 14);
      tireGrad2.addColorStop(0, '#334155');
      tireGrad2.addColorStop(0.7, '#1e293b');
      tireGrad2.addColorStop(1, '#090d16');
      ctx.fillStyle = tireGrad2;
      ctx.beginPath();
      ctx.arc(122, 82, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 1.4;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.moveTo(122 + Math.cos(a) * 10, 82 + Math.sin(a) * 10);
        ctx.lineTo(122 + Math.cos(a) * 14, 82 + Math.sin(a) * 14);
        ctx.stroke();
      }

      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(122, 82, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(122, 82, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(20, 68, 120, 14, 4);
      ctx.fill();

      const bodyGrad = ctx.createLinearGradient(12, 30, 148, 72);
      bodyGrad.addColorStop(0, palette.primaryLight);
      bodyGrad.addColorStop(0.3, palette.primary);
      bodyGrad.addColorStop(1, palette.primaryDark);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(14, 70);
      ctx.lineTo(14, 44);
      ctx.quadraticCurveTo(16, 36, 30, 36);
      ctx.lineTo(90, 36);
      ctx.lineTo(90, 70);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(90, 70);
      ctx.lineTo(90, 36);
      ctx.quadraticCurveTo(100, 28, 118, 28);
      ctx.lineTo(148, 28);
      ctx.quadraticCurveTo(154, 28, 154, 36);
      ctx.lineTo(154, 70);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(20, 42);
      ctx.quadraticCurveTo(55, 38, 88, 42);
      ctx.stroke();

      ctx.fillStyle = palette.window;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.roundRect(94, 32, 50, 24, 4);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      ctx.strokeStyle = palette.primaryDark;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(119, 32);
      ctx.lineTo(119, 56);
      ctx.stroke();

      const winGrad = ctx.createLinearGradient(94, 32, 144, 56);
      winGrad.addColorStop(0, 'rgba(255,255,255,0.3)');
      winGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = winGrad;
      ctx.fillRect(94, 32, 50, 12);

      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect(148, 38, 10, 14, 3);
      ctx.fill();

      const lensGrad = ctx.createRadialGradient(153, 45, 1, 153, 45, 5);
      lensGrad.addColorStop(0, '#ffffff');
      lensGrad.addColorStop(0.5, '#fef08a');
      lensGrad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = lensGrad;
      ctx.beginPath();
      ctx.roundRect(149, 39, 8, 12, 2);
      ctx.fill();

      const beamGrad = ctx.createRadialGradient(155, 45, 3, 160, 45, 16);
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.6)');
      beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.arc(155, 45, 16, -Math.PI / 3, Math.PI / 3);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(8, 42, 8, 12, 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.roundRect(10, 44, 4, 4, 1);
      ctx.fill();

      ctx.fillStyle = palette.accent;
      ctx.fillRect(14, 34, 76, 4);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(14, 35.5, 76, 1.5);

      const boxGrad = ctx.createLinearGradient(20, 8, 80, 34);
      boxGrad.addColorStop(0, '#10b981');
      boxGrad.addColorStop(0.5, '#059669');
      boxGrad.addColorStop(1, '#047857');
      ctx.fillStyle = boxGrad;
      ctx.beginPath();
      ctx.roundRect(20, 8, 66, 28, 5);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(20, 8, 5, 5);
      ctx.fillRect(81, 8, 5, 5);
      ctx.fillRect(20, 31, 5, 5);
      ctx.fillRect(81, 31, 5, 5);

      ctx.fillStyle = '#facc15';
      ctx.fillRect(20, 18, 66, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, 19.5, 66, 2);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 11px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MBG', 53, 17);

      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.roundRect(28, 26, 24, 7, 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.font = '900 5.5px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('74°C', 31, 32);

      ctx.fillStyle = palette.primaryDark;
      ctx.beginPath();
      ctx.roundRect(22, 66, 116, 6, 2);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.roundRect(56, 64, 12, 10, 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(60, 65, 4, 8);
    });
  }

  /**
   * Gerobak Bakso Solo & Mie Ayam (Masterpiece Street Food Cart)
   */
  public static getCartTexture(): Texture {
    return this.fromCanvas('cart_tex_hd_v2', 120, 84, (ctx) => {
      // Cast shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.beginPath();
      ctx.ellipse(60, 80, 52, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- 1. WHEELS ---
      // Rear Large Bicycle Spoke Wheel (x=36, y=64)
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(36, 64, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(36, 64, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 8; i++) {
        const rad = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(36 + Math.cos(rad) * 4, 64 + Math.sin(rad) * 4);
        ctx.lineTo(36 + Math.cos(rad) * 12, 64 + Math.sin(rad) * 12);
        ctx.stroke();
      }

      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(36, 64, 4, 0, Math.PI * 2);
      ctx.fill();

      // Front Caster Wheel (x=102, y=70)
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(102, 70, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(102, 70, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Wooden Leg & Handle
      ctx.fillStyle = '#78350f';
      ctx.fillRect(18, 60, 6, 16);
      ctx.fillRect(12, 38, 12, 5);

      // --- 2. TEAK WOOD CART BODY ---
      const woodGrad = ctx.createLinearGradient(22, 34, 22, 64);
      woodGrad.addColorStop(0, '#b45309');
      woodGrad.addColorStop(0.5, '#92400e');
      woodGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = woodGrad;
      ctx.beginPath();
      ctx.roundRect(22, 34, 94, 28, 3);
      ctx.fill();

      // Wood plank groove lines
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.2;
      for (let y = 40; y < 62; y += 7) {
        ctx.beginPath();
        ctx.moveTo(22, y);
        ctx.lineTo(116, y);
        ctx.stroke();
      }

      // --- 3. SOUP CAULDRON (Stainless Steel Dandang Bakso) ---
      const potGrad = ctx.createLinearGradient(28, 20, 56, 36);
      potGrad.addColorStop(0, '#f8fafc');
      potGrad.addColorStop(0.4, '#cbd5e1');
      potGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = potGrad;
      ctx.beginPath();
      ctx.roundRect(30, 20, 26, 16, 3);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(28, 18, 30, 3);
      // Ladle handle
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(43, 20);
      ctx.lineTo(46, 10);
      ctx.stroke();

      // Swirling Steam Wisps
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(35, 14); ctx.quadraticCurveTo(32, 6, 38, 2);
      ctx.moveTo(44, 14); ctx.quadraticCurveTo(48, 6, 43, 2);
      ctx.moveTo(52, 14); ctx.quadraticCurveTo(50, 7, 54, 2);
      ctx.stroke();

      // --- 4. GLASS SHOWCASE (Etalase Kaca dengan Lampu Kuning) ---
      // Warm glowing interior bulb
      const bulbGlow = ctx.createRadialGradient(85, 24, 2, 85, 24, 28);
      bulbGlow.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
      bulbGlow.addColorStop(0.5, 'rgba(253, 224, 71, 0.45)');
      bulbGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = bulbGlow;
      ctx.fillRect(60, 16, 54, 20);

      // Glass vitrine frame
      ctx.fillStyle = 'rgba(224, 242, 254, 0.4)';
      ctx.fillRect(60, 16, 54, 20);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(60, 16, 54, 20);

      // Yellow curly noodles (Mie Kuning & Bihun)
      ctx.fillStyle = '#facc15';
      for (let x = 64; x < 82; x += 3.5) {
        ctx.fillRect(x, 18, 2.2, 12);
      }
      ctx.fillStyle = '#ffffff';
      for (let x = 84; x < 94; x += 3) {
        ctx.fillRect(x, 20, 1.8, 10);
      }

      // Meatballs (Bakso Daging Bulat)
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(98, 26, 4.5, 0, Math.PI * 2);
      ctx.arc(106, 25, 4, 0, Math.PI * 2);
      ctx.arc(102, 21, 3.8, 0, Math.PI * 2);
      ctx.arc(111, 27, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Condiment Bottles (Kecap Bango & Saos Sambal)
      ctx.fillStyle = '#ef4444'; // Red chili sauce
      ctx.fillRect(108, 18, 4, 10);
      ctx.fillStyle = '#1c1917'; // Dark sweet soy sauce
      ctx.fillRect(104, 19, 3.5, 9);

      // --- 5. CANOPY AWNING (Tenda Biru-Putih Bergelombang) ---
      const awningGrad = ctx.createLinearGradient(16, 6, 118, 16);
      awningGrad.addColorStop(0, '#0284c7');
      awningGrad.addColorStop(0.5, '#38bdf8');
      awningGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = awningGrad;
      ctx.beginPath();
      ctx.moveTo(18, 16);
      ctx.lineTo(116, 16);
      ctx.lineTo(110, 6);
      ctx.lineTo(24, 6);
      ctx.closePath();
      ctx.fill();

      // Scalloped ruffle edge
      ctx.fillStyle = '#ffffff';
      for (let x = 20; x < 114; x += 11) {
        ctx.beginPath();
        ctx.arc(x + 5.5, 16, 5, 0, Math.PI);
        ctx.fill();
      }

      // Signboard: BAKSO SAPI SOLO MBG
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(30, 42, 78, 13, 3);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 9.5px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🍲 BAKSO SAPI SOLO MBG', 69, 52);
    });
  }

  /**
   * Ayam Jago Kampung (Lively Indonesian Fighting Rooster)
   */
  public static getChickenTexture(): Texture {
    return this.fromCanvas('chicken_tex_hd_v2', 60, 50, (ctx) => {
      // Shimmering Emerald Green-Black Arching Tail Plumes
      const tailGrad = ctx.createLinearGradient(4, 4, 24, 30);
      tailGrad.addColorStop(0, '#064e3b');
      tailGrad.addColorStop(0.5, '#047857');
      tailGrad.addColorStop(1, '#022c22');
      ctx.fillStyle = tailGrad;

      ctx.beginPath();
      ctx.moveTo(22, 30);
      ctx.quadraticCurveTo(6, 12, 2, 4);
      ctx.quadraticCurveTo(12, 20, 26, 25);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(23, 32);
      ctx.quadraticCurveTo(10, 18, 8, 8);
      ctx.quadraticCurveTo(16, 24, 28, 28);
      ctx.closePath();
      ctx.fill();

      // Plump Round Body (Warm Orange-Brown Gradient)
      const bodyGrad = ctx.createLinearGradient(16, 18, 42, 40);
      bodyGrad.addColorStop(0, '#f97316');
      bodyGrad.addColorStop(0.5, '#ea580c');
      bodyGrad.addColorStop(1, '#9a3412');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(30, 30, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wing Feathers
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.ellipse(28, 31, 10, 7, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Golden Neck Hackles
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(32, 26);
      ctx.lineTo(44, 18);
      ctx.lineTo(38, 30);
      ctx.closePath();
      ctx.fill();

      // Head
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(42, 18, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // Crimson Serrated Comb (Jengger Bergerigi)
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(42, 9, 4, 0, Math.PI * 2);
      ctx.arc(38, 11, 3.5, 0, Math.PI * 2);
      ctx.arc(46, 10, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Wattles (Gelambir Merah)
      ctx.beginPath();
      ctx.ellipse(43, 26, 3, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Golden Beak
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(48, 17);
      ctx.lineTo(56, 20);
      ctx.lineTo(48, 23);
      ctx.closePath();
      ctx.fill();

      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(44, 17, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(44.5, 17, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Scaled Yellow Legs & Claws
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(26, 39); ctx.lineTo(24, 47); ctx.lineTo(19, 48);
      ctx.moveTo(33, 39); ctx.lineTo(35, 47); ctx.lineTo(40, 48);
      ctx.stroke();
    });
  }

  /**
   * Polisi Tidur (Speed Bump) Bergaris Kuning-Hitam & Mata Kucing Reflektif
   */
  public static getSpeedBumpTexture(): Texture {
    return this.fromCanvas('speedbump_tex_hd_v2', 90, 26, (ctx) => {
      // Contact shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
      ctx.beginPath();
      ctx.ellipse(45, 16, 44, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3D Beveled Rubber profile
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(45, 14, 42, 8.5, 0, 0, Math.PI * 2);
      ctx.clip();

      for (let x = 0; x < 95; x += 15) {
        ctx.fillStyle = '#facc15'; // High-vis yellow
        ctx.fillRect(x, 0, 8, 26);
        ctx.fillStyle = '#0f172a'; // Matte rubber black
        ctx.fillRect(x + 8, 0, 7, 26);
      }
      ctx.restore();

      // 3D Top Highlight specular rim
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(45, 9, 38, 4, 0, Math.PI, Math.PI * 2);
      ctx.stroke();

      // Embedded Cat-Eye Reflectors (Mata Kucing Jalan)
      const drawCatEye = (cx: number, cy: number) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(cx - 3.5, cy - 2.5, 7, 5, 1.5);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(cx - 2.5, cy - 1.5, 5, 3, 1);
        ctx.fill();
      };

      drawCatEye(24, 11);
      drawCatEye(45, 10);
      drawCatEye(66, 11);
    });
  }

  /**
   * Peti Kayu & Susunan Rantang Ompreng MBG (Delivery Crate)
   */
  public static getCrateTexture(): Texture {
    return this.fromCanvas('crate_tex_hd_v2', 64, 56, (ctx) => {
      // Ground shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.beginPath();
      ctx.ellipse(32, 52, 28, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pine Wooden Crate Box
      const woodGrad = ctx.createLinearGradient(8, 12, 56, 50);
      woodGrad.addColorStop(0, '#ca8a04');
      woodGrad.addColorStop(0.5, '#a16207');
      woodGrad.addColorStop(1, '#713f12');
      ctx.fillStyle = woodGrad;
      ctx.beginPath();
      ctx.roundRect(8, 12, 48, 40, 4);
      ctx.fill();

      // Wood plank gaps
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(8, 22); ctx.lineTo(56, 22);
      ctx.moveTo(8, 32); ctx.lineTo(56, 32);
      ctx.moveTo(8, 42); ctx.lineTo(56, 42);
      ctx.stroke();

      // Diagonal brace
      ctx.fillStyle = '#854d0e';
      ctx.beginPath();
      ctx.moveTo(10, 14); ctx.lineTo(16, 14);
      ctx.lineTo(54, 48); ctx.lineTo(48, 48);
      ctx.closePath();
      ctx.fill();

      // Black Steel Corner Reinforcements with Rivets
      const drawBracket = (x: number, y: number) => {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y, 10, 10);
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(x + 5, y + 5, 1.8, 0, Math.PI * 2);
        ctx.fill();
      };

      drawBracket(8, 12);
      drawBracket(46, 12);
      drawBracket(8, 42);
      drawBracket(46, 42);

      // Stenciled MBG Text
      ctx.fillStyle = '#451a03';
      ctx.font = '900 8.5px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MBG ⬆️', 32, 29);
      ctx.font = '700 7px Inter, Arial, sans-serif';
      ctx.fillText('SPPG GIZI', 32, 39);

      // Stainless Steel Ompreng Carrier (Rantang Susun MBG) on top!
      const omprengGrad = ctx.createLinearGradient(20, 2, 44, 12);
      omprengGrad.addColorStop(0, '#f8fafc');
      omprengGrad.addColorStop(0.5, '#cbd5e1');
      omprengGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = omprengGrad;
      ctx.beginPath();
      ctx.roundRect(22, 4, 20, 9, 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Carrier handle
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(22, 6);
      ctx.lineTo(32, 1);
      ctx.lineTo(42, 6);
      ctx.stroke();
    });
  }

  /**
   * Puddle / Kubangan Air & Lubang Aspal Hancur (Broken Road Pothole)
   */
  public static getPuddleTexture(): Texture {
    return this.fromCanvas('puddle_tex_hd_v2', 100, 30, (ctx) => {
      // Broken asphalt rim cavity
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.ellipse(50, 16, 48, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Jagged broken asphalt stones
      ctx.fillStyle = '#334155';
      ctx.fillRect(10, 11, 4, 3);
      ctx.fillRect(86, 13, 5, 3);
      ctx.fillRect(46, 5, 4, 3);
      ctx.fillRect(68, 22, 4, 2);

      // Deep Water Pool with Sky & Sun Reflection
      const waterGrad = ctx.createLinearGradient(18, 8, 82, 24);
      waterGrad.addColorStop(0, '#0284c7');
      waterGrad.addColorStop(0.35, '#38bdf8'); // Sky reflection
      waterGrad.addColorStop(0.65, '#0ea5e9');
      waterGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = waterGrad;
      ctx.beginPath();
      ctx.ellipse(50, 15, 42, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Concentric ripple rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(46, 14, 24, 4.5, 0, 0, Math.PI);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)'; // Warm sun glint
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(56, 16, 15, 3, 0, 0, Math.PI);
      ctx.stroke();

      // Floating splash beads
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.arc(18, 9, 2.8, 0, Math.PI * 2);
      ctx.arc(84, 8, 2.2, 0, Math.PI * 2);
      ctx.arc(52, 6, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Pembatas Jalan Kerucut & Batu Kali (Traffic Cone & River Stone)
   */
  public static getRockTexture(): Texture {
    return this.fromCanvas('rock_tex_hd_v2', 70, 56, (ctx) => {
      // Ground contact shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.beginPath();
      ctx.ellipse(35, 50, 32, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Volcanic River Stone (Batu Kali Berlumut)
      const rockGrad = ctx.createRadialGradient(48, 36, 4, 48, 36, 20);
      rockGrad.addColorStop(0, '#94a3b8');
      rockGrad.addColorStop(0.6, '#475569');
      rockGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = rockGrad;
      ctx.beginPath();
      ctx.moveTo(38, 50);
      ctx.lineTo(42, 34);
      ctx.lineTo(52, 28);
      ctx.lineTo(64, 38);
      ctx.lineTo(64, 50);
      ctx.closePath();
      ctx.fill();

      // Mossy green patch
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(50, 32, 7, 3.5, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Heavy Rubber Base of Traffic Cone
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(8, 46, 38, 7, 2);
      ctx.fill();

      // Fluorescent Orange Cone
      const coneGrad = ctx.createLinearGradient(12, 12, 38, 46);
      coneGrad.addColorStop(0, '#fb923c');
      coneGrad.addColorStop(0.5, '#ea580c');
      coneGrad.addColorStop(1, '#c2410c');
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(27, 8);
      ctx.lineTo(13, 46);
      ctx.lineTo(41, 46);
      ctx.closePath();
      ctx.fill();

      // Rounded tip
      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.arc(27, 9, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Micro-prismatic Retroreflective White Bands
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(23, 20); ctx.lineTo(31, 20); ctx.lineTo(34, 28); ctx.lineTo(20, 28);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(18, 33); ctx.lineTo(36, 33); ctx.lineTo(39, 41); ctx.lineTo(15, 41);
      ctx.closePath();
      ctx.fill();

      // Reflective honeycomb grid texture
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(25, 23, 2, 2);
      ctx.fillRect(29, 23, 2, 2);
      ctx.fillRect(23, 36, 2, 2);
      ctx.fillRect(31, 36, 2, 2);
    });
  }

  /**
   * Dapur SPPG (Pusat Pelayanan Gizi MBG Mandiri - Start Area)
   */
  public static getSPPGBuildingTexture(): Texture {
    return this.fromCanvas('sppg_bldg_hd_v2', 420, 220, (ctx) => {
      // Main Facility Facade
      const bldgGrad = ctx.createLinearGradient(0, 30, 0, 220);
      bldgGrad.addColorStop(0, '#ffffff');
      bldgGrad.addColorStop(0.6, '#f1f5f9');
      bldgGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = bldgGrad;
      ctx.fillRect(20, 40, 380, 180);

      // Corporate Blue Roof Cornice
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(15, 32, 390, 12);
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(10, 26, 400, 7);

      // Industrial Roof Exhaust Chimneys with Steam
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(320, 8, 28, 24);
      ctx.fillRect(360, 12, 24, 20);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(316, 6, 36, 4);
      ctx.fillRect(356, 10, 32, 4);

      // Billowing White Kitchen Steam
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(334, 4); ctx.quadraticCurveTo(330, -8, 338, -16);
      ctx.moveTo(372, 8); ctx.quadraticCurveTo(376, -2, 370, -12);
      ctx.stroke();

      // Big Signage Board: DAPUR PUSAT GIZI SPPG
      const signGrad = ctx.createLinearGradient(40, 48, 380, 82);
      signGrad.addColorStop(0, '#047857');
      signGrad.addColorStop(0.5, '#059669');
      signGrad.addColorStop(1, '#10b981');
      ctx.fillStyle = signGrad;
      ctx.beginPath();
      ctx.roundRect(40, 48, 340, 36, 7);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 14px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏢 DAPUR PUSAT GIZI SPPG (DROP MBG)', 210, 67);
      ctx.font = '700 9.5px Inter, Arial, sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('PROGRAM MAKANAN BERGIZI GRATIS - DARI DAPUR KE SEKOLAH', 210, 78);

      // Kitchen Prep Windows with Warm Illumination
      const windowGrad = ctx.createLinearGradient(40, 94, 40, 144);
      windowGrad.addColorStop(0, '#fef08a');
      windowGrad.addColorStop(1, '#fde047');
      ctx.fillStyle = windowGrad;
      ctx.fillRect(40, 94, 80, 48);
      ctx.fillRect(300, 94, 80, 48);

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(40, 94, 80, 48);
      ctx.strokeRect(300, 94, 80, 48);

      ctx.beginPath();
      ctx.moveTo(80, 94); ctx.lineTo(80, 142);
      ctx.moveTo(40, 118); ctx.lineTo(120, 118);
      ctx.moveTo(340, 94); ctx.lineTo(340, 142);
      ctx.moveTo(300, 118); ctx.lineTo(380, 118);
      ctx.stroke();

      // Loading Dock Roller Shutter Door
      ctx.fillStyle = '#334155';
      ctx.fillRect(150, 94, 120, 126);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.8;
      for (let y = 98; y < 215; y += 8) {
        ctx.beginPath();
        ctx.moveTo(150, y);
        ctx.lineTo(270, y);
        ctx.stroke();
      }

      // Yellow-Black Hazard Striping on Dock Ramp
      for (let x = 150; x < 270; x += 16) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(x, 212, 8, 8);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 8, 212, 8, 8);
      }
    });
  }

  /**
   * SDN 01 Merdeka (Elementary School Finish Area)
   */
  public static getSchoolFinishTexture(): Texture {
    return this.fromCanvas('school_finish_hd_v3', 520, 240, (ctx) => {
      // School Main Building Body
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(100, 60, 320, 180);

      // Navy Blue Wainscoting (Dinding Bawah Biru Sekolah)
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(100, 170, 320, 70);

      // Terracotta Clay Hip Roof (Atap Genteng Merah)
      const roofGrad = ctx.createLinearGradient(80, 60, 260, 15);
      roofGrad.addColorStop(0, '#b91c1c');
      roofGrad.addColorStop(0.5, '#dc2626');
      roofGrad.addColorStop(1, '#991b1b');
      ctx.fillStyle = roofGrad;
      ctx.beginPath();
      ctx.moveTo(80, 60);
      ctx.lineTo(260, 15);
      ctx.lineTo(440, 60);
      ctx.closePath();
      ctx.fill();

      // Roof ridge caps
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(80, 60); ctx.lineTo(260, 15); ctx.lineTo(440, 60);
      ctx.stroke();

      // Clock Tower
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(235, 12, 50, 42);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(230, 12);
      ctx.lineTo(260, -8);
      ctx.lineTo(290, 12);
      ctx.closePath();
      ctx.fill();

      // Clock Face (08:30 WIB)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(260, 32, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(260, 32); ctx.lineTo(260, 24); // Hour hand pointing to 8
      ctx.moveTo(260, 32); ctx.lineTo(268, 32); // Minute hand pointing to 6/30
      ctx.stroke();

      // School Name Board: SDN 01 MERDEKA
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.roundRect(130, 66, 260, 28, 5);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 13px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏫 SDN 01 MERDEKA (PENERIMA MBG)', 260, 84);

      // Louvered School Windows
      ctx.fillStyle = '#38bdf8';
      for (let x = 120; x < 400; x += 65) {
        ctx.fillRect(x, 110, 40, 46);
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 2.2;
        ctx.strokeRect(x, 110, 40, 46);
        // Louver slats
        ctx.beginPath();
        ctx.moveTo(x, 125); ctx.lineTo(x + 40, 125);
        ctx.moveTo(x, 140); ctx.lineTo(x + 40, 140);
        ctx.stroke();
      }

      // Sang Saka Merah Putih Flagpole
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(60, 240);
      ctx.lineTo(60, 25);
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(60, 23, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Fluttering Merah-Putih Flag
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(62, 28, 44, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(62, 42, 44, 14);
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.strokeRect(62, 28, 44, 28);

      // Finish Arch Gate Posts (Checkered black-and-white)
      for (let y = 80; y < 240; y += 16) {
        ctx.fillStyle = (y / 16) % 2 === 0 ? '#0f172a' : '#ffffff';
        ctx.fillRect(0, y, 18, 16);
      }

      // Finish Arch Banner
      const archGrad = ctx.createLinearGradient(0, 36, 210, 68);
      archGrad.addColorStop(0, '#e11d48');
      archGrad.addColorStop(0.5, '#f43f5e');
      archGrad.addColorStop(1, '#fb7185');
      ctx.fillStyle = archGrad;
      ctx.beginPath();
      ctx.roundRect(0, 36, 210, 30, 5);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 13px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏁 GARIS FINISH DROP MBG 🏁', 105, 55);

      // Cheering Helium Balloons
      const drawBalloon = (bx: number, by: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(bx, by, 7, 9.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.stroke();
      };
      drawBalloon(205, 30, '#ef4444');
      drawBalloon(216, 35, '#facc15');
      drawBalloon(202, 40, '#10b981');
      drawBalloon(215, 45, '#3b82f6');

      // Cheering Indonesian Students in Merah-Putih Uniforms
      const drawStudent = (sx: number, sy: number, isGirl: boolean) => {
        // Head & Face
        ctx.fillStyle = '#fcd34d';
        ctx.beginPath();
        ctx.arc(sx, sy - 30, 8.5, 0, Math.PI * 2);
        ctx.fill();

        // Red SD School Cap (Topi SD Merah)
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(sx, sy - 33, 9, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(sx, sy - 33, 7, 2.5);

        // Smile and eyes
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(sx + 2, sy - 30, 1.2, 0, Math.PI * 2);
        ctx.arc(sx - 2, sy - 30, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(sx, sy - 27, 3.2, 0, Math.PI);
        ctx.stroke();

        // White Shirt (Kemeja Putih)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(sx - 8, sy - 21, 16, 13, 2);
        ctx.fill();

        // Red Tie (Dasi Merah SD)
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(sx, sy - 21); ctx.lineTo(sx + 2.5, sy - 14); ctx.lineTo(sx - 2.5, sy - 14);
        ctx.closePath();
        ctx.fill();

        // Red Pants/Skirt (Celana / Rok Merah)
        ctx.fillStyle = '#dc2626';
        if (isGirl) {
          ctx.beginPath();
          ctx.moveTo(sx - 9, sy - 8); ctx.lineTo(sx + 9, sy - 8); ctx.lineTo(sx + 11, sy); ctx.lineTo(sx - 11, sy);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(sx - 7, sy - 8, 6, 11);
          ctx.fillRect(sx + 1, sy - 8, 6, 11);
        }

        // Cheering Arms in Air
        ctx.strokeStyle = '#fcd34d';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(sx - 7, sy - 19); ctx.lineTo(sx - 14, sy - 34);
        ctx.moveTo(sx + 7, sy - 19); ctx.lineTo(sx + 14, sy - 34);
        ctx.stroke();

        // Handheld Mini Indonesian Flag
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(sx + 14, sy - 40, 11, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx + 14, sy - 36, 11, 4);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(sx + 14, sy - 33); ctx.lineTo(sx + 14, sy - 42);
        ctx.stroke();
      };

      drawStudent(100, 235, false);
      drawStudent(135, 235, true);
      drawStudent(170, 235, false);
      drawStudent(205, 235, true);
    });
  }

  /**
   * Warung Makan & Toko Kelontong Indonesia (Roadside Indonesian Warung)
   */
  public static getWarungTexture(warungType: 1 | 2 = 1): Texture {
    const key = `warung_hd_${warungType}`;
    return this.fromCanvas(key, 280, 180, (ctx) => {
      // Main Warung Facade
      const wallGrad = ctx.createLinearGradient(20, 40, 20, 180);
      wallGrad.addColorStop(0, warungType === 1 ? '#047857' : '#0369a1');
      wallGrad.addColorStop(0.5, warungType === 1 ? '#065f46' : '#075985');
      wallGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(20, 40, 240, 140);

      // Corrugated Zinc / Clay Roof
      const roofGrad = ctx.createLinearGradient(10, 40, 270, 10);
      roofGrad.addColorStop(0, '#92400e');
      roofGrad.addColorStop(0.5, '#b45309');
      roofGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = roofGrad;
      ctx.beginPath();
      ctx.moveTo(10, 40);
      ctx.lineTo(140, 10);
      ctx.lineTo(270, 40);
      ctx.closePath();
      ctx.fill();

      // Large Banner (Spanduk Warung Makan / Indomie)
      const bannerGrad = ctx.createLinearGradient(30, 46, 250, 78);
      bannerGrad.addColorStop(0, '#dc2626');
      bannerGrad.addColorStop(0.5, '#ef4444');
      bannerGrad.addColorStop(1, '#f97316');
      ctx.fillStyle = bannerGrad;
      ctx.beginPath();
      ctx.roundRect(30, 46, 220, 32, 4);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 11px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      if (warungType === 1) {
        ctx.fillText('🍲 WARUNG NASI BU IIN - SOTO & AYAM', 140, 62);
        ctx.font = '700 8.5px Inter, Arial, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText('SEDIA ES TEH JUMBO & GORENGAN HANGAT', 140, 73);
      } else {
        ctx.fillText('🏪 TOKO BERKAH - SEMBAKO & PULSA', 140, 62);
        ctx.font = '700 8.5px Inter, Arial, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText('MINUMAN DINGIN & CEMILAN SEGAR', 140, 73);
      }

      // Display Counter & Glass Kerupuk Jars (Blek Kerupuk Kaleng Merah)
      ctx.fillStyle = '#78350f';
      ctx.fillRect(40, 100, 200, 80);

      // Glass Kerupuk Tin (Kaleng Kerupuk Tradisional)
      const drawKerupukTin = (kx: number, ky: number) => {
        // Blue tin body with glass front
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(kx, ky, 22, 28);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(kx + 2, ky + 4, 18, 20);
        // Kerupuk white circles inside
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(kx + 7, ky + 10, 3.5, 0, Math.PI * 2);
        ctx.arc(kx + 14, ky + 11, 4, 0, Math.PI * 2);
        ctx.arc(kx + 11, ky + 18, 4.5, 0, Math.PI * 2);
        ctx.fill();
        // Red lid
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(kx - 1, ky - 3, 24, 4);
      };

      drawKerupukTin(50, 102);
      drawKerupukTin(76, 102);

      // Hanging sachets (Kopi, Teh, Nutrisari)
      const sachetColors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = sachetColors[i];
        ctx.fillRect(110 + i * 14, 82, 10, 18);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.strokeRect(110 + i * 14, 82, 10, 18);
      }

      // Plastic Stools (Kursi Plastik Merah & Biru)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(180, 135, 18, 14, 2);
      ctx.fill();
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.roundRect(205, 135, 18, 14, 2);
      ctx.fill();
    });
  }

  /**
   * Pohon Pisang (Indonesian Banana Tree with Wide Emerald Leaves)
   */
  public static getBananaTreeTexture(): Texture {
    return this.fromCanvas('banana_tree_hd', 120, 150, (ctx) => {
      // Trunk (Batang Semu Pisang Berlapis)
      const trunkGrad = ctx.createLinearGradient(54, 150, 66, 60);
      trunkGrad.addColorStop(0, '#15803d');
      trunkGrad.addColorStop(0.5, '#4ade80');
      trunkGrad.addColorStop(1, '#86efac');
      ctx.strokeStyle = trunkGrad;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(60, 150);
      ctx.quadraticCurveTo(55, 100, 60, 65);
      ctx.stroke();

      // Broad graceful banana leaves (Daun Pisang Robek Alami)
      const drawBananaLeaf = (endX: number, endY: number, ctrlX: number, ctrlY: number) => {
        // Main midrib
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(60, 65);
        ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
        ctx.stroke();

        // Leaf Blade with emerald gradient
        ctx.fillStyle = 'rgba(34, 197, 94, 0.85)';
        ctx.beginPath();
        ctx.moveTo(60, 65);
        ctx.quadraticCurveTo(ctrlX - 10, ctrlY - 8, endX, endY);
        ctx.quadraticCurveTo(ctrlX + 10, ctrlY + 8, 60, 65);
        ctx.closePath();
        ctx.fill();

        // Leaf tear notches
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(ctrlX - 5, ctrlY - 4); ctx.lineTo(ctrlX - 15, ctrlY - 12);
        ctx.moveTo(ctrlX + 4, ctrlY + 4); ctx.lineTo(ctrlX + 14, ctrlY + 12);
        ctx.stroke();
      };

      drawBananaLeaf(10, 45, 30, 30);
      drawBananaLeaf(110, 48, 90, 32);
      drawBananaLeaf(20, 75, 38, 60);
      drawBananaLeaf(102, 78, 85, 62);
      drawBananaLeaf(60, 15, 58, 35);

      // Hanging Bunch of Green Bananas & Purple Blossom (Jantung Pisang)
      ctx.fillStyle = '#a3e635';
      ctx.beginPath();
      ctx.ellipse(62, 74, 5, 8, 0.2, 0, Math.PI * 2);
      ctx.ellipse(58, 76, 4.5, 7, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Purple Jantung Pisang
      ctx.fillStyle = '#701a75';
      ctx.beginPath();
      ctx.moveTo(56, 82);
      ctx.lineTo(64, 82);
      ctx.lineTo(60, 94);
      ctx.closePath();
      ctx.fill();
    });
  }

  /**
   * Tropical Palm Tree & Blooming Bougainvillea Bush
   */
  public static getTreeTexture(): Texture {
    return this.fromCanvas('tree_tex_hd_v2', 110, 170, (ctx) => {
      // Textured Palm Trunk
      const trunkGrad = ctx.createLinearGradient(48, 170, 60, 45);
      trunkGrad.addColorStop(0, '#78350f');
      trunkGrad.addColorStop(0.5, '#92400e');
      trunkGrad.addColorStop(1, '#a16207');
      ctx.strokeStyle = trunkGrad;
      ctx.lineWidth = 13;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(55, 170);
      ctx.quadraticCurveTo(46, 105, 56, 48);
      ctx.stroke();

      // Segment rings on palm trunk
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.2;
      for (let y = 65; y < 160; y += 15) {
        ctx.beginPath();
        ctx.moveTo(49, y); ctx.lineTo(61, y + 2);
        ctx.stroke();
      }

      // Curving Palm Fronds
      const drawFrond = (endX: number, endY: number, ctrlX: number, ctrlY: number) => {
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(56, 48);
        ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
        ctx.stroke();

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(56, 48);
        ctx.quadraticCurveTo(ctrlX, ctrlY - 2, endX, endY);
        ctx.stroke();
      };

      drawFrond(8, 42, 24, 24);
      drawFrond(104, 44, 86, 26);
      drawFrond(18, 72, 30, 56);
      drawFrond(96, 74, 82, 58);
      drawFrond(55, 14, 53, 24);

      // Coconuts at crown
      ctx.fillStyle = '#713f12';
      ctx.beginPath();
      ctx.arc(52, 50, 4.5, 0, Math.PI * 2);
      ctx.arc(60, 51, 4.5, 0, Math.PI * 2);
      ctx.arc(56, 55, 4, 0, Math.PI * 2);
      ctx.fill();

      // Bushy base with blooming Bougainvillea Flowers
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(55, 156, 24, 0, Math.PI * 2);
      ctx.fill();

      const flowerColors = ['#f43f5e', '#e11d48', '#fda4af', '#fb7185'];
      for (let i = 0; i < 28; i++) {
        const fx = 38 + Math.random() * 34;
        const fy = 142 + Math.random() * 24;
        ctx.fillStyle = flowerColors[i % flowerColors.length];
        ctx.beginPath();
        ctx.arc(fx, fy, 2.5 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  /**
   * Indonesian Concrete Utility Pole with Tangled Cable Wires & Transformer
   */
  public static getUtilityPoleTexture(): Texture {
    return this.fromCanvas('utility_pole_hd_v2', 65, 250, (ctx) => {
      // Octagonal Concrete Pole
      const poleGrad = ctx.createLinearGradient(26, 0, 38, 0);
      poleGrad.addColorStop(0, '#64748b');
      poleGrad.addColorStop(0.5, '#cbd5e1');
      poleGrad.addColorStop(1, '#475569');
      ctx.fillStyle = poleGrad;
      ctx.fillRect(28, 0, 10, 250);

      // Metal Crossarms
      ctx.fillStyle = '#334155';
      ctx.fillRect(8, 24, 50, 7);
      ctx.fillRect(14, 46, 38, 6);

      // Porcelain White Insulators
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(12, 16, 6, 8);
      ctx.fillRect(30, 16, 6, 8);
      ctx.fillRect(48, 16, 6, 8);

      // Distribution Transformer Cylinder (Trafo PLN)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(16, 60, 20, 30, 4);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(19, 64, 14, 3);

      // Tangled Overhead Cables (Khas Jalanan Indonesia)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, 26); ctx.quadraticCurveTo(28, 34, 65, 26);
      ctx.moveTo(0, 48); ctx.quadraticCurveTo(34, 58, 65, 48);
      ctx.moveTo(0, 75); ctx.quadraticCurveTo(30, 88, 65, 75);
      ctx.stroke();
    });
  }

  /**
   * Susu UHT MBG (Nutrient Pack Pickup - +25 Nitro)
   */
  public static getMilkTexture(): Texture {
    return this.fromCanvas('pickup_milk_v1', 64, 64, (ctx) => {
      // Golden outer glow
      const glow = ctx.createRadialGradient(32, 32, 10, 32, 32, 30);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, Math.PI * 2);
      ctx.fill();

      // Milk carton body
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(18, 18, 28, 38, 5);
      ctx.fill();

      // Blue top gable
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(18, 18);
      ctx.lineTo(32, 8);
      ctx.lineTo(46, 18);
      ctx.closePath();
      ctx.fill();

      // Diagonal decorative strip
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(18, 30);
      ctx.lineTo(46, 26);
      ctx.lineTo(46, 42);
      ctx.lineTo(18, 46);
      ctx.closePath();
      ctx.fill();

      // Straw
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(34, 10);
      ctx.lineTo(38, 2);
      ctx.stroke();

      // Text "MBG"
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MBG', 32, 38);

      // Star sparkle
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(42, 14, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Apel Segar / Buah MBG (Nutrient Shield Pickup - 3.5s Invulnerability)
   */
  public static getFruitTexture(): Texture {
    return this.fromCanvas('pickup_fruit_v1', 64, 64, (ctx) => {
      // Emerald / Jade outer glow
      const glow = ctx.createRadialGradient(32, 32, 10, 32, 32, 30);
      glow.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
      glow.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, Math.PI * 2);
      ctx.fill();

      // Apple Body
      const appleGrad = ctx.createRadialGradient(28, 28, 4, 32, 36, 22);
      appleGrad.addColorStop(0, '#f87171');
      appleGrad.addColorStop(0.5, '#dc2626');
      appleGrad.addColorStop(1, '#991b1b');
      ctx.fillStyle = appleGrad;
      ctx.beginPath();
      ctx.arc(26, 34, 14, 0, Math.PI * 2);
      ctx.arc(38, 34, 14, 0, Math.PI * 2);
      ctx.fill();

      // Apple dimple base
      ctx.beginPath();
      ctx.arc(32, 40, 13, 0, Math.PI * 2);
      ctx.fill();

      // Stem
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(32, 22);
      ctx.quadraticCurveTo(34, 14, 38, 12);
      ctx.stroke();

      // Green Leaf
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(39, 18, 7, 4, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Glossy shine highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.ellipse(24, 28, 5, 2.5, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Ompreng Emas Super (Golden Bento - 100% Full Nitro + Shield)
   */
  public static getBentoTexture(): Texture {
    return this.fromCanvas('pickup_bento_v1', 72, 72, (ctx) => {
      // Golden radiant starburst glow
      const glow = ctx.createRadialGradient(36, 36, 8, 36, 36, 34);
      glow.addColorStop(0, 'rgba(250, 204, 21, 0.7)');
      glow.addColorStop(0.7, 'rgba(234, 179, 8, 0.25)');
      glow.addColorStop(1, 'rgba(234, 179, 8, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(36, 36, 34, 0, Math.PI * 2);
      ctx.fill();

      // Golden Ompreng Tray
      const goldGrad = ctx.createLinearGradient(16, 20, 56, 56);
      goldGrad.addColorStop(0, '#fef08a');
      goldGrad.addColorStop(0.3, '#facc15');
      goldGrad.addColorStop(0.7, '#ca8a04');
      goldGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.roundRect(14, 22, 44, 30, 8);
      ctx.fill();

      // Metallic border
      ctx.strokeStyle = '#fef9c3';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Bento compartments
      ctx.fillStyle = '#713f12';
      ctx.beginPath();
      ctx.roundRect(18, 26, 17, 22, 4);
      ctx.roundRect(39, 26, 15, 10, 3);
      ctx.roundRect(39, 38, 15, 10, 3);
      ctx.fill();

      // Nasi Putih + Lauk
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(19, 27, 15, 20, 3);
      ctx.fill();

      // Ayam Goreng
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(46, 31, 4, 0, Math.PI * 2);
      ctx.fill();

      // Sayur Hijau
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(46, 43, 4, 0, Math.PI * 2);
      ctx.fill();

      // Shimmering star
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(52, 22, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Energy Shield Forcefield Bubble (Around Courier during shield active)
   */
  public static getShieldBubbleTexture(): Texture {
    return this.fromCanvas('shield_bubble_v1', 140, 110, (ctx) => {
      const shieldGrad = ctx.createRadialGradient(70, 55, 30, 70, 55, 60);
      shieldGrad.addColorStop(0, 'rgba(56, 189, 248, 0.05)');
      shieldGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.25)');
      shieldGrad.addColorStop(0.9, 'rgba(125, 211, 252, 0.6)');
      shieldGrad.addColorStop(1, 'rgba(255, 255, 255, 0.8)');

      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.ellipse(70, 55, 64, 48, 0, 0, Math.PI * 2);
      ctx.fill();

      // Electric hex ring
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(70, 55, 62, 46, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Shimmer sparks
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(30, 30, 3, 0, Math.PI * 2);
      ctx.arc(110, 40, 2.5, 0, Math.PI * 2);
      ctx.arc(80, 95, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Nitro Flame Tail (Exhaust flame when boosting)
   */
  public static getNitroFlameTexture(): Texture {
    return this.fromCanvas('nitro_flame_v1', 60, 30, (ctx) => {
      // Fiery jet exhaust pointing leftwards behind scooter
      const grad = ctx.createLinearGradient(60, 15, 0, 15);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.2, '#38bdf8');
      grad.addColorStop(0.5, '#f59e0b');
      grad.addColorStop(0.8, '#ef4444');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(60, 10);
      ctx.quadraticCurveTo(35, 8, 0, 15);
      ctx.quadraticCurveTo(35, 22, 60, 20);
      ctx.closePath();
      ctx.fill();

      // Core white-hot blast
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(50, 15, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}
