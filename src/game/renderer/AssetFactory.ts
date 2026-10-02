import { Texture } from 'pixi.js';

export class AssetFactory {
  private static cache: Map<string, Texture> = new Map();

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
   * Courier Scooter & Rider (Masterpiece High-Definition Arcade Sprite)
   * Detailed Vespa-style scooter, 3D gradient fairings, chrome trims,
   * insulated MBG thermal box, stylish courier with helmet, gloss visor & waving Merah-Putih scarf.
   */
  public static getCourierTexture(colorScheme: 'green' | 'blue' | 'red' | 'purple' = 'green'): Texture {
    const key = `courier_v2_${colorScheme}`;
    return this.fromCanvas(key, 120, 84, (ctx) => {
      const palette = {
        green: {
          primary: '#10b981',
          primaryDark: '#047857',
          primaryLight: '#6ee7b7',
          accent: '#f59e0b',
          accentDark: '#b45309',
          helmet: '#059669',
          jacket: '#1e293b',
          glow: 'rgba(16, 185, 129, 0.4)',
        },
        blue: {
          primary: '#0284c7',
          primaryDark: '#0369a1',
          primaryLight: '#38bdf8',
          accent: '#ec4899',
          accentDark: '#be185d',
          helmet: '#0284c7',
          jacket: '#0f172a',
          glow: 'rgba(2, 132, 199, 0.4)',
        },
        red: {
          primary: '#e11d48',
          primaryDark: '#be123c',
          primaryLight: '#fda4af',
          accent: '#8b5cf6',
          accentDark: '#6d28d9',
          helmet: '#e11d48',
          jacket: '#18181b',
          glow: 'rgba(225, 29, 72, 0.4)',
        },
        purple: {
          primary: '#9333ea',
          primaryDark: '#7e22ce',
          primaryLight: '#d8b4fe',
          accent: '#06b6d4',
          accentDark: '#0e7490',
          helmet: '#9333ea',
          jacket: '#1e1b4b',
          glow: 'rgba(147, 51, 234, 0.4)',
        },
      }[colorScheme];

      // Ground shadow
      const shadowGrad = ctx.createRadialGradient(60, 78, 10, 60, 78, 48);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(60, 77, 46, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- 1. REAR WHEEL (x=26, y=62) ---
      // Outer tire with tread
      const tireGrad1 = ctx.createRadialGradient(26, 62, 7, 26, 62, 16);
      tireGrad1.addColorStop(0, '#334155');
      tireGrad1.addColorStop(0.7, '#1e293b');
      tireGrad1.addColorStop(1, '#0f172a');
      ctx.fillStyle = tireGrad1;
      ctx.beginPath();
      ctx.arc(26, 62, 16, 0, Math.PI * 2);
      ctx.fill();

      // Tire tread notches
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 1.5;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.moveTo(26 + Math.cos(a) * 12, 62 + Math.sin(a) * 12);
        ctx.lineTo(26 + Math.cos(a) * 16, 62 + Math.sin(a) * 16);
        ctx.stroke();
      }

      // Metallic rim & hub
      const rimGrad1 = ctx.createLinearGradient(18, 54, 34, 70);
      rimGrad1.addColorStop(0, '#e2e8f0');
      rimGrad1.addColorStop(0.5, '#94a3b8');
      rimGrad1.addColorStop(1, '#475569');
      ctx.fillStyle = rimGrad1;
      ctx.beginPath();
      ctx.arc(26, 62, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(26, 62, 3, 0, Math.PI * 2);
      ctx.fill();

      // --- 2. FRONT WHEEL (x=92, y=62) ---
      const tireGrad2 = ctx.createRadialGradient(92, 62, 7, 92, 62, 16);
      tireGrad2.addColorStop(0, '#334155');
      tireGrad2.addColorStop(0.7, '#1e293b');
      tireGrad2.addColorStop(1, '#0f172a');
      ctx.fillStyle = tireGrad2;
      ctx.beginPath();
      ctx.arc(92, 62, 16, 0, Math.PI * 2);
      ctx.fill();

      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.moveTo(92 + Math.cos(a) * 12, 62 + Math.sin(a) * 12);
        ctx.lineTo(92 + Math.cos(a) * 16, 62 + Math.sin(a) * 16);
        ctx.stroke();
      }

      ctx.fillStyle = rimGrad1;
      ctx.beginPath();
      ctx.arc(92, 62, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(92, 62, 3, 0, Math.PI * 2);
      ctx.fill();

      // Front suspension fork
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(92, 62);
      ctx.lineTo(84, 42);
      ctx.stroke();

      // --- 3. EXHAUST & MUFFLER ---
      const mufflerGrad = ctx.createLinearGradient(6, 56, 28, 64);
      mufflerGrad.addColorStop(0, '#475569');
      mufflerGrad.addColorStop(0.4, '#cbd5e1');
      mufflerGrad.addColorStop(0.8, '#3b82f6'); // heat bluing
      mufflerGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = mufflerGrad;
      ctx.beginPath();
      ctx.roundRect(8, 58, 24, 7, 3);
      ctx.fill();
      // Exhaust tip
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(8, 61.5, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // --- 4. SCOOTER MAIN CHASSIS & FAIRINGS ---
      // Floorboard (Pijakan kaki)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(32, 58, 38, 7, 2);
      ctx.fill();
      ctx.fillStyle = '#334155';
      ctx.fillRect(36, 59, 30, 2);

      // Rear Cowl & Engine Cover
      const bodyGrad = ctx.createLinearGradient(20, 36, 65, 60);
      bodyGrad.addColorStop(0, palette.primaryLight);
      bodyGrad.addColorStop(0.35, palette.primary);
      bodyGrad.addColorStop(1, palette.primaryDark);
      ctx.fillStyle = bodyGrad;

      ctx.beginPath();
      ctx.moveTo(22, 54);
      ctx.quadraticCurveTo(20, 38, 36, 38);
      ctx.lineTo(60, 40);
      ctx.lineTo(68, 54);
      ctx.quadraticCurveTo(50, 60, 22, 54);
      ctx.closePath();
      ctx.fill();

      // Specular highlight on rear body
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(25, 43);
      ctx.quadraticCurveTo(34, 40, 56, 42);
      ctx.stroke();

      // Front Legshield & Steering Column
      const shieldGrad = ctx.createLinearGradient(60, 28, 92, 56);
      shieldGrad.addColorStop(0, palette.primaryLight);
      shieldGrad.addColorStop(0.4, palette.primary);
      shieldGrad.addColorStop(1, palette.primaryDark);
      ctx.fillStyle = shieldGrad;

      ctx.beginPath();
      ctx.moveTo(68, 54);
      ctx.lineTo(66, 34);
      ctx.quadraticCurveTo(74, 24, 88, 30);
      ctx.lineTo(95, 48);
      ctx.quadraticCurveTo(86, 58, 68, 54);
      ctx.closePath();
      ctx.fill();

      // Front Mudguard
      ctx.fillStyle = palette.primary;
      ctx.beginPath();
      ctx.moveTo(82, 52);
      ctx.quadraticCurveTo(94, 44, 102, 56);
      ctx.quadraticCurveTo(92, 56, 82, 52);
      ctx.fill();

      // Chrome side trim
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(34, 48);
      ctx.lineTo(64, 49);
      ctx.stroke();

      // Headlight with luminous beam
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(95, 34, 6.5, 0, Math.PI * 2);
      ctx.fill();

      const lensGrad = ctx.createRadialGradient(95, 34, 1, 95, 34, 6);
      lensGrad.addColorStop(0, '#ffffff');
      lensGrad.addColorStop(0.6, '#fef08a');
      lensGrad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = lensGrad;
      ctx.beginPath();
      ctx.arc(95, 34, 5, 0, Math.PI * 2);
      ctx.fill();

      // Projected Headlight Glow
      const beamGrad = ctx.createRadialGradient(98, 34, 3, 118, 34, 20);
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.6)');
      beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.arc(98, 34, 18, -Math.PI / 4, Math.PI / 4);
      ctx.fill();

      // Handlebars & Grips
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(80, 30);
      ctx.lineTo(76, 20);
      ctx.lineTo(84, 18);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(80, 16, 7, 5); // Rubber grip

      // --- 5. MBG INSULATED THERMAL BOX (Peti Makanan Bergizi) ---
      // Box body with metallic frame
      const boxGrad = ctx.createLinearGradient(12, 14, 42, 42);
      boxGrad.addColorStop(0, palette.accent);
      boxGrad.addColorStop(0.6, palette.accentDark);
      boxGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = boxGrad;
      ctx.beginPath();
      ctx.roundRect(14, 16, 32, 26, 4);
      ctx.fill();

      // Metal reinforced corner brackets
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(14, 16, 6, 6);
      ctx.fillRect(40, 16, 6, 6);
      ctx.fillRect(14, 36, 6, 6);
      ctx.fillRect(40, 36, 6, 6);

      // Box horizontal strap & lock buckle
      ctx.fillStyle = '#451a03';
      ctx.fillRect(14, 26, 32, 4);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(27, 25, 6, 6);

      // Emblem "MBG" text
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 10px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MBG', 30, 23);

      // Temperature indicator LED
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(19, 34, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 6px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('72°C', 23, 36);

      // --- 6. COURIER DRIVER (Kurir Berdedikasi) ---
      // Driver torso & jacket with safety vest accents
      const jacketGrad = ctx.createLinearGradient(46, 22, 68, 44);
      jacketGrad.addColorStop(0, '#334155');
      jacketGrad.addColorStop(1, palette.jacket);
      ctx.fillStyle = jacketGrad;
      ctx.beginPath();
      ctx.roundRect(46, 24, 18, 24, 5);
      ctx.fill();

      // High-visibility reflective neon stripes on jacket
      ctx.fillStyle = '#a3e635';
      ctx.fillRect(48, 32, 15, 3.5);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(48, 33, 15, 1.5);

      // Driver arm leaning forward to grips
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(56, 28);
      ctx.lineTo(70, 26);
      ctx.lineTo(82, 20);
      ctx.stroke();

      // Glove
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(82, 20, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Driver Head & Aerodynamic Modern Helmet
      const helmetGrad = ctx.createRadialGradient(58, 14, 2, 58, 14, 13);
      helmetGrad.addColorStop(0, palette.primaryLight);
      helmetGrad.addColorStop(0.5, palette.helmet);
      helmetGrad.addColorStop(1, palette.primaryDark);
      ctx.fillStyle = helmetGrad;
      ctx.beginPath();
      ctx.arc(58, 14, 12, 0, Math.PI * 2);
      ctx.fill();

      // Visor with iridescent rainbow reflection
      const visorGrad = ctx.createLinearGradient(60, 10, 70, 18);
      visorGrad.addColorStop(0, '#06b6d4');
      visorGrad.addColorStop(0.5, '#3b82f6');
      visorGrad.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = visorGrad;
      ctx.beginPath();
      ctx.roundRect(60, 10, 10, 8, 3);
      ctx.fill();

      // Visor white reflection arc
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(62, 12);
      ctx.lineTo(68, 12);
      ctx.stroke();

      // Dynamic Waving Indonesian Merah-Putih Scarf (Berkibar di Udara)
      // Red upper wave
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(48, 25);
      ctx.quadraticCurveTo(38, 18, 26, 21);
      ctx.quadraticCurveTo(34, 26, 48, 28);
      ctx.closePath();
      ctx.fill();

      // White lower wave
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(48, 28);
      ctx.quadraticCurveTo(34, 26, 26, 21);
      ctx.quadraticCurveTo(30, 31, 48, 31);
      ctx.closePath();
      ctx.fill();
    });
  }

  /**
   * Gerobak Bakso / Authentic Indonesian Street Food Cart
   * Detailed teak wood slats, clear glass vitrine with noodles & meatballs,
   * steaming aluminum broth cauldron, condiments, scalloped canopy awning.
   */
  public static getCartTexture(): Texture {
    return this.fromCanvas('cart_tex_hd', 110, 78, (ctx) => {
      // Ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(55, 74, 48, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // 1. Spoke Wheels (Roda Gerobak Kayu)
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(32, 60, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(32, 60, 11, 0, Math.PI * 2);
      ctx.fill();

      // Spokes
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const rad = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(32 + Math.cos(rad) * 4, 60 + Math.sin(rad) * 4);
        ctx.lineTo(32 + Math.cos(rad) * 11, 60 + Math.sin(rad) * 11);
        ctx.stroke();
      }

      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(32, 60, 4, 0, Math.PI * 2);
      ctx.fill();

      // Front caster wheel
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(92, 66, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(92, 66, 3, 0, Math.PI * 2);
      ctx.fill();

      // Wooden legs & handle
      ctx.fillStyle = '#78350f';
      ctx.fillRect(16, 56, 6, 14);
      ctx.fillRect(12, 34, 10, 5); // Push handle

      // 2. Main Teak Wood Cart Body
      const woodGrad = ctx.createLinearGradient(20, 30, 20, 58);
      woodGrad.addColorStop(0, '#b45309');
      woodGrad.addColorStop(0.5, '#92400e');
      woodGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = woodGrad;
      ctx.fillRect(18, 32, 85, 26);

      // Wood plank lines & shading
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1;
      for (let y = 37; y < 58; y += 6) {
        ctx.beginPath();
        ctx.moveTo(18, y);
        ctx.lineTo(103, y);
        ctx.stroke();
      }

      // 3. Soup Cauldron (Panci Kuah Stainless Berasap)
      const potGrad = ctx.createLinearGradient(22, 18, 48, 32);
      potGrad.addColorStop(0, '#f8fafc');
      potGrad.addColorStop(0.4, '#cbd5e1');
      potGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = potGrad;
      ctx.beginPath();
      ctx.roundRect(24, 18, 24, 15, 3);
      ctx.fill();

      // Cauldron lid handle & rim
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(22, 16, 28, 3);
      ctx.fillStyle = '#334155';
      ctx.fillRect(33, 13, 6, 4);

      // Steam wisps
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(30, 12);
      ctx.quadraticCurveTo(28, 6, 33, 2);
      ctx.moveTo(38, 12);
      ctx.quadraticCurveTo(42, 6, 39, 2);
      ctx.stroke();

      // 4. Glass Vitrine (Etalase Kaca Bakso & Mi)
      ctx.fillStyle = 'rgba(224, 242, 254, 0.45)';
      ctx.fillRect(52, 14, 48, 18);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(52, 14, 48, 18);

      // Hanging Yellow Noodles
      ctx.fillStyle = '#facc15';
      for (let x = 56; x < 72; x += 3) {
        ctx.fillRect(x, 16, 2, 10);
      }

      // Meatballs in glass (Bakso Sapi Halus & Urat)
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(80, 24, 4.5, 0, Math.PI * 2);
      ctx.arc(88, 23, 4, 0, Math.PI * 2);
      ctx.arc(84, 19, 3.5, 0, Math.PI * 2);
      ctx.arc(94, 25, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Sauce bottles (Kecap & Saus Sambal)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(94, 16, 4, 9);
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(90, 17, 3.5, 8);

      // 5. Scalloped Awning Roof (Atap Terpal Khas Gerobak)
      const awningGrad = ctx.createLinearGradient(12, 4, 108, 14);
      awningGrad.addColorStop(0, '#0284c7');
      awningGrad.addColorStop(0.5, '#38bdf8');
      awningGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = awningGrad;
      ctx.beginPath();
      ctx.moveTo(14, 14);
      ctx.lineTo(106, 14);
      ctx.lineTo(100, 4);
      ctx.lineTo(20, 4);
      ctx.closePath();
      ctx.fill();

      // Scalloped fringes
      ctx.fillStyle = '#ffffff';
      for (let x = 16; x < 104; x += 10) {
        ctx.beginPath();
        ctx.arc(x + 5, 14, 4.5, 0, Math.PI);
        ctx.fill();
      }

      // Banner text "BAKSO MBG"
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(24, 40, 72, 12, 3);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 9px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🍲 BAKSO SAPI MBG', 60, 49);
    });
  }

  /**
   * Ayam Jago / Indonesian Hopping Rooster
   * Iridescent emerald-black sickle tail, golden orange cape,
   * bright crimson serrated comb & wattles, sharp talons.
   */
  public static getChickenTexture(): Texture {
    return this.fromCanvas('chicken_tex_hd', 52, 44, (ctx) => {
      // 1. Shimmering green-black tail plumes
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.moveTo(18, 26);
      ctx.quadraticCurveTo(4, 10, 1, 4);
      ctx.quadraticCurveTo(10, 18, 22, 22);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#0f766e';
      ctx.beginPath();
      ctx.moveTo(19, 28);
      ctx.quadraticCurveTo(8, 16, 6, 8);
      ctx.quadraticCurveTo(14, 22, 24, 25);
      ctx.closePath();
      ctx.fill();

      // 2. Body feathers (Orange-red gradient)
      const bodyGrad = ctx.createLinearGradient(14, 16, 38, 36);
      bodyGrad.addColorStop(0, '#f97316');
      bodyGrad.addColorStop(0.6, '#ea580c');
      bodyGrad.addColorStop(1, '#9a3412');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(26, 26, 14, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Wing feather layers
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.ellipse(24, 27, 9, 6, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 4. Golden hackle neck feathers
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(28, 24);
      ctx.lineTo(38, 16);
      ctx.lineTo(34, 26);
      ctx.closePath();
      ctx.fill();

      // 5. Head
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(36, 16, 7.5, 0, Math.PI * 2);
      ctx.fill();

      // 6. Serrated red comb (Jengger Ayam)
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(36, 8, 3.5, 0, Math.PI * 2);
      ctx.arc(33, 10, 3, 0, Math.PI * 2);
      ctx.arc(39, 9, 3, 0, Math.PI * 2);
      ctx.fill();

      // Dual wattles below beak
      ctx.beginPath();
      ctx.ellipse(37, 23, 2.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // 7. Sharp yellow beak
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(42, 15);
      ctx.lineTo(49, 18);
      ctx.lineTo(42, 21);
      ctx.closePath();
      ctx.fill();

      // 8. Expressive eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(38, 15, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(38.5, 15, 1.3, 0, Math.PI * 2);
      ctx.fill();

      // 9. Scaled yellow feet & claws
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      // Back foot
      ctx.moveTo(22, 35);
      ctx.lineTo(20, 42);
      ctx.lineTo(16, 43);
      // Front foot
      ctx.moveTo(29, 35);
      ctx.lineTo(31, 42);
      ctx.lineTo(35, 43);
      ctx.stroke();
    });
  }

  /**
   * Polisi Tidur (Speed Bump) Bergaris Kuning-Hitam & Mata Kucing
   * Cambered asphalt curvature, high-contrast hazard chevrons,
   * embedded glowing cat-eye reflectors, asphalt road wear.
   */
  public static getSpeedBumpTexture(): Texture {
    return this.fromCanvas('speedbump_tex_hd', 84, 24, (ctx) => {
      // Base asphalt bevel shadow
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.ellipse(42, 14, 40, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Raised asphalt hump
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(42, 12, 38, 8, 0, 0, Math.PI * 2);
      ctx.clip();

      // Alternating yellow and black angled hazard chevrons
      for (let x = 0; x < 90; x += 14) {
        ctx.fillStyle = '#facc15'; // Vibrant road yellow
        ctx.fillRect(x, 0, 7, 24);
        ctx.fillStyle = '#0f172a'; // Deep asphalt dark
        ctx.fillRect(x + 7, 0, 7, 24);
      }

      // Asphalt texture grain overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, 84, 24);
      ctx.restore();

      // Top ridge highlight
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(42, 8, 34, 4, 0, Math.PI, Math.PI * 2);
      ctx.stroke();

      // Embedded glass cat-eyes (Mata Kucing Reflektor)
      const drawCatEye = (cx: number, cy: number) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(cx - 3, cy - 2, 6, 4, 1);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(cx - 2, cy - 1, 4, 2, 0.5);
        ctx.fill();
      };

      drawCatEye(24, 10);
      drawCatEye(42, 9);
      drawCatEye(60, 10);
    });
  }

  /**
   * Peti Kayu (Heavy-duty Shipping Crate)
   * Wood grain planks, bolted cast-iron corner brackets, fragile stencils.
   */
  public static getCrateTexture(): Texture {
    return this.fromCanvas('crate_tex_hd', 56, 52, (ctx) => {
      // Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(28, 48, 24, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main box wood gradient
      const woodGrad = ctx.createLinearGradient(6, 6, 50, 46);
      woodGrad.addColorStop(0, '#ca8a04');
      woodGrad.addColorStop(0.5, '#a16207');
      woodGrad.addColorStop(1, '#713f12');
      ctx.fillStyle = woodGrad;
      ctx.beginPath();
      ctx.roundRect(6, 6, 44, 40, 3);
      ctx.fill();

      // Horizontal plank grooves
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(6, 16); ctx.lineTo(50, 16);
      ctx.moveTo(6, 26); ctx.lineTo(50, 26);
      ctx.moveTo(6, 36); ctx.lineTo(50, 36);
      ctx.stroke();

      // Diagonal cross brace
      ctx.fillStyle = '#854d0e';
      ctx.beginPath();
      ctx.moveTo(8, 8); ctx.lineTo(14, 8);
      ctx.lineTo(48, 42); ctx.lineTo(42, 42);
      ctx.closePath();
      ctx.fill();

      // Outer metal frame border
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      ctx.strokeRect(6, 6, 44, 40);

      // Steel corner reinforcement plates with bolts
      ctx.fillStyle = '#334155';
      const drawBracket = (x: number, y: number) => {
        ctx.fillRect(x, y, 9, 9);
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(x + 4.5, y + 4.5, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#334155';
      };

      drawBracket(6, 6);
      drawBracket(41, 6);
      drawBracket(6, 37);
      drawBracket(41, 37);

      // Stenciled fragile umbrella & arrows
      ctx.fillStyle = '#451a03';
      ctx.font = '900 8px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MBG ⬆️', 28, 23);
      ctx.fillText('RUKO', 28, 33);
    });
  }

  /**
   * Puddle / Kubangan Air & Lubang Aspal Retak
   * Jagged asphalt fracture, muddy water ripples, sky reflection, splash droplets.
   */
  public static getPuddleTexture(): Texture {
    return this.fromCanvas('puddle_tex_hd', 96, 28, (ctx) => {
      // Broken asphalt rim with rough edges
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.ellipse(48, 15, 45, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Gravel & asphalt texture points
      ctx.fillStyle = '#334155';
      ctx.fillRect(10, 10, 3, 2);
      ctx.fillRect(82, 12, 4, 3);
      ctx.fillRect(44, 4, 3, 2);

      // Water body gradient (deep indigo to radiant sky blue reflection)
      const waterGrad = ctx.createLinearGradient(16, 8, 80, 22);
      waterGrad.addColorStop(0, '#0369a1');
      waterGrad.addColorStop(0.35, '#38bdf8');
      waterGrad.addColorStop(0.7, '#0284c7');
      waterGrad.addColorStop(1, '#075985');
      ctx.fillStyle = waterGrad;
      ctx.beginPath();
      ctx.ellipse(48, 14, 40, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Concentric surface ripples
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(44, 13, 22, 4, 0, 0, Math.PI);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(54, 15, 14, 2.5, 0, 0, Math.PI);
      ctx.stroke();

      // Floating water droplets / splash
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(16, 8, 2.5, 0, Math.PI * 2);
      ctx.arc(80, 7, 2, 0, Math.PI * 2);
      ctx.arc(48, 5, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Pembatas Jalan / Heavy-duty Traffic Cone & Batu Kali
   * High-visibility neon orange PVC with prismatic micro-reflective collars and mossy boulder.
   */
  public static getRockTexture(): Texture {
    return this.fromCanvas('rock_tex_hd', 64, 52, (ctx) => {
      // Ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(32, 48, 28, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- Muted Mossy Boulder (Right side) ---
      const rockGrad = ctx.createRadialGradient(44, 34, 4, 44, 34, 18);
      rockGrad.addColorStop(0, '#94a3b8');
      rockGrad.addColorStop(0.6, '#475569');
      rockGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = rockGrad;
      ctx.beginPath();
      ctx.moveTo(34, 48);
      ctx.lineTo(38, 32);
      ctx.lineTo(48, 26);
      ctx.lineTo(58, 36);
      ctx.lineTo(58, 48);
      ctx.closePath();
      ctx.fill();

      // Moss patch on rock
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(46, 30, 6, 3, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // --- Heavy-Duty Traffic Cone (Left side) ---
      // Weighted black rubber base
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(8, 44, 36, 6, 2);
      ctx.fill();

      // Fluorescent orange cone body
      const coneGrad = ctx.createLinearGradient(12, 10, 36, 44);
      coneGrad.addColorStop(0, '#fb923c');
      coneGrad.addColorStop(0.5, '#ea580c');
      coneGrad.addColorStop(1, '#c2410c');
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(26, 6);
      ctx.lineTo(12, 44);
      ctx.lineTo(40, 44);
      ctx.closePath();
      ctx.fill();

      // Top handle hole
      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.arc(26, 7, 3, 0, Math.PI * 2);
      ctx.fill();

      // White micro-prismatic reflective stripes (Upper & Lower)
      ctx.fillStyle = '#ffffff';
      // Upper reflective band
      ctx.beginPath();
      ctx.moveTo(22, 18);
      ctx.lineTo(30, 18);
      ctx.lineTo(33, 26);
      ctx.lineTo(19, 26);
      ctx.closePath();
      ctx.fill();

      // Lower reflective band
      ctx.beginPath();
      ctx.moveTo(17, 31);
      ctx.lineTo(35, 31);
      ctx.lineTo(38, 39);
      ctx.lineTo(14, 39);
      ctx.closePath();
      ctx.fill();

      // Reflective honeycomb pattern dots
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(24, 21, 2, 2);
      ctx.fillRect(28, 21, 2, 2);
      ctx.fillRect(22, 34, 2, 2);
      ctx.fillRect(30, 34, 2, 2);
    });
  }

  /**
   * Dapur SPPG (Pusat Pelayanan Gizi MBG)
   * High-resolution modern catering facility: glass facades, loading docks,
   * exhaust chimney steam, official national nutrition signage.
   */
  public static getSPPGBuildingTexture(): Texture {
    return this.fromCanvas('sppg_bldg_hd', 360, 200, (ctx) => {
      // Main Building Body (Clean hospital/nutrition hygiene white & teal)
      const bldgGrad = ctx.createLinearGradient(0, 30, 0, 200);
      bldgGrad.addColorStop(0, '#f8fafc');
      bldgGrad.addColorStop(0.6, '#f1f5f9');
      bldgGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = bldgGrad;
      ctx.fillRect(20, 40, 320, 160);

      // Architectural roof parapet with teal trim
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(15, 34, 330, 10);
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(10, 28, 340, 6);

      // Industrial kitchen ventilation hoods & chimneys
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(270, 10, 26, 22);
      ctx.fillRect(305, 14, 20, 18);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(266, 8, 34, 4);
      ctx.fillRect(302, 12, 26, 4);

      // Chimney steam
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(283, 6); ctx.quadraticCurveTo(280, -4, 287, -12);
      ctx.moveTo(315, 10); ctx.quadraticCurveTo(318, 0, 314, -8);
      ctx.stroke();

      // Prominent SPPG Signboard with Gold/Emerald Seal
      const signGrad = ctx.createLinearGradient(40, 48, 320, 78);
      signGrad.addColorStop(0, '#047857');
      signGrad.addColorStop(0.5, '#059669');
      signGrad.addColorStop(1, '#10b981');
      ctx.fillStyle = signGrad;
      ctx.beginPath();
      ctx.roundRect(40, 48, 280, 32, 6);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Signboard Typography
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 13px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏢 DAPUR PUSAT GIZI SPPG (DROP MBG)', 180, 65);
      ctx.font = '700 9px Inter, Arial, sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('PROGRAM MAKANAN BERGIZI GRATIS - DARI DAPUR KE SEKOLAH', 180, 75);

      // Commercial Kitchen Glass Windows with warm light
      const windowGrad = ctx.createLinearGradient(40, 92, 40, 140);
      windowGrad.addColorStop(0, '#fef08a');
      windowGrad.addColorStop(1, '#fde047');
      ctx.fillStyle = windowGrad;
      ctx.fillRect(40, 92, 70, 46);
      ctx.fillRect(250, 92, 70, 46);

      // Window frames & mullions
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(40, 92, 70, 46);
      ctx.strokeRect(250, 92, 70, 46);
      ctx.beginPath();
      ctx.moveTo(75, 92); ctx.lineTo(75, 138);
      ctx.moveTo(40, 115); ctx.lineTo(110, 115);
      ctx.moveTo(285, 92); ctx.lineTo(285, 138);
      ctx.moveTo(250, 115); ctx.lineTo(320, 115);
      ctx.stroke();

      // Loading Dock Roller Shutter (Pintu Distribusi MBG)
      ctx.fillStyle = '#334155';
      ctx.fillRect(135, 92, 90, 108);
      // Roller shutter slats
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      for (let y = 96; y < 195; y += 7) {
        ctx.beginPath();
        ctx.moveTo(135, y);
        ctx.lineTo(225, y);
        ctx.stroke();
      }

      // Loading bay hazard stripes
      for (let x = 135; x < 225; x += 15) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(x, 192, 8, 8);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 8, 192, 7, 8);
      }
    });
  }

  /**
   * SDN 01 Merdeka (School Finish Area)
   * Authentic Indonesian public elementary school:
   * Terracotta colonial roof, Sang Saka Merah Putih flagpole,
   * triumphant finish archway, cheering students in red & white uniforms.
   */
  public static getSchoolFinishTexture(): Texture {
    return this.fromCanvas('school_finish_hd', 440, 220, (ctx) => {
      // 1. School Main Building
      // Walls
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(80, 50, 280, 170);

      // Royal blue wainscot & base trim (Khas Sekolah Negeri Indonesia)
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(80, 160, 280, 60);

      // Terracotta Tiled Roof
      const roofGrad = ctx.createLinearGradient(60, 50, 220, 10);
      roofGrad.addColorStop(0, '#b91c1c');
      roofGrad.addColorStop(0.5, '#dc2626');
      roofGrad.addColorStop(1, '#991b1b');
      ctx.fillStyle = roofGrad;
      ctx.beginPath();
      ctx.moveTo(60, 50);
      ctx.lineTo(220, 10);
      ctx.lineTo(380, 50);
      ctx.closePath();
      ctx.fill();

      // School Clock Tower
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(195, 6, 50, 36);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(190, 6);
      ctx.lineTo(220, -10);
      ctx.lineTo(250, 6);
      ctx.closePath();
      ctx.fill();

      // Clock Face (11:30 AM - Waktunya Makan Siang MBG!)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(220, 24, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Hands
      ctx.beginPath();
      ctx.moveTo(220, 24); ctx.lineTo(220, 16); // 12
      ctx.moveTo(220, 24); ctx.lineTo(220, 29); // 6
      ctx.stroke();

      // School Name Board
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.roundRect(110, 60, 220, 26, 4);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 12px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏫 SDN 01 MERDEKA (PENERIMA MBG)', 220, 77);

      // Windows
      ctx.fillStyle = '#38bdf8';
      for (let x = 100; x < 350; x += 60) {
        ctx.fillRect(x, 100, 35, 42);
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, 100, 35, 42);
      }

      // 2. Ceremonial Flagpole with Sang Saka Merah Putih
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(50, 220);
      ctx.lineTo(50, 20);
      ctx.stroke();

      // Golden flagpole finial
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(50, 18, 4, 0, Math.PI * 2);
      ctx.fill();

      // Fluttering Merah-Putih Flag
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(52, 22, 38, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(52, 34, 38, 12);
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.strokeRect(52, 22, 38, 24);

      // 3. Grand Triumphant Finish Archway (Gapura Garis Finish)
      // Checkered Gate Posts
      for (let y = 70; y < 220; y += 15) {
        ctx.fillStyle = (y / 15) % 2 === 0 ? '#0f172a' : '#ffffff';
        ctx.fillRect(0, y, 16, 15);
      }

      // Festive Finish Arch Banner
      const archGrad = ctx.createLinearGradient(0, 68, 180, 96);
      archGrad.addColorStop(0, '#e11d48');
      archGrad.addColorStop(0.5, '#f43f5e');
      archGrad.addColorStop(1, '#fb7185');
      ctx.fillStyle = archGrad;
      ctx.beginPath();
      ctx.roundRect(0, 68, 190, 28, 4);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 13px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏁 GARIS FINISH DROP MBG 🏁', 95, 87);

      // Festive balloon clusters on archway
      const drawBalloon = (bx: number, by: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(bx, by, 7, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.stroke();
      };
      drawBalloon(185, 60, '#ef4444');
      drawBalloon(195, 66, '#facc15');
      drawBalloon(182, 72, '#10b981');
      drawBalloon(193, 76, '#3b82f6');

      // 4. Cheering School Children in Seragam Merah-Putih
      const drawStudent = (sx: number, sy: number, hairColor: string, isGirl: boolean) => {
        // Head
        ctx.fillStyle = '#fcd34d'; // skin
        ctx.beginPath();
        ctx.arc(sx, sy - 28, 8, 0, Math.PI * 2);
        ctx.fill();

        // Hair / Red School Cap
        ctx.fillStyle = '#dc2626'; // Red school cap
        ctx.beginPath();
        ctx.arc(sx, sy - 31, 8.5, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(sx, sy - 31, 6, 2); // visor of cap

        // Smiling face
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(sx + 2, sy - 28, 1.2, 0, Math.PI * 2); // eye
        ctx.arc(sx - 2, sy - 28, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx, sy - 25, 3, 0, Math.PI); // smile
        ctx.stroke();

        // White Shirt (Seragam Putih) with Red Tie
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(sx - 7, sy - 20, 14, 12, 2);
        ctx.fill();
        // Red tie
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(sx, sy - 20); ctx.lineTo(sx + 2, sy - 13); ctx.lineTo(sx - 2, sy - 13);
        ctx.closePath();
        ctx.fill();

        // Red Pants / Skirt
        ctx.fillStyle = '#dc2626';
        if (isGirl) {
          ctx.beginPath();
          ctx.moveTo(sx - 8, sy - 8); ctx.lineTo(sx + 8, sy - 8); ctx.lineTo(sx + 10, sy); ctx.lineTo(sx - 10, sy);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(sx - 6, sy - 8, 5, 10);
          ctx.fillRect(sx + 1, sy - 8, 5, 10);
        }

        // Cheering Arms Waving Upwards!
        ctx.strokeStyle = '#fcd34d';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(sx - 6, sy - 18); ctx.lineTo(sx - 13, sy - 32);
        ctx.moveTo(sx + 6, sy - 18); ctx.lineTo(sx + 13, sy - 32);
        ctx.stroke();

        // Mini Indonesian Flag in Hand
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(sx + 13, sy - 38, 10, 3.5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx + 13, sy - 34.5, 10, 3.5);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx + 13, sy - 31); ctx.lineTo(sx + 13, sy - 39);
        ctx.stroke();
      };

      drawStudent(85, 215, '#1e293b', false);
      drawStudent(115, 215, '#78350f', true);
      drawStudent(145, 215, '#1c1917', false);
      drawStudent(175, 215, '#451a03', true);
    });
  }

  /**
   * Tropical Palm Tree & Blooming Bougainvillea Bush
   */
  public static getTreeTexture(): Texture {
    return this.fromCanvas('tree_tex_hd', 100, 160, (ctx) => {
      // Slender curving tropical palm trunk
      const trunkGrad = ctx.createLinearGradient(44, 160, 56, 40);
      trunkGrad.addColorStop(0, '#78350f');
      trunkGrad.addColorStop(0.5, '#92400e');
      trunkGrad.addColorStop(1, '#a16207');
      ctx.strokeStyle = trunkGrad;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(50, 160);
      ctx.quadraticCurveTo(42, 100, 52, 45);
      ctx.stroke();

      // Trunk segment rings
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      for (let y = 60; y < 150; y += 14) {
        ctx.beginPath();
        ctx.moveTo(44, y); ctx.lineTo(54, y + 2);
        ctx.stroke();
      }

      // Lush Palm Canopy Fronds (Daun Kelapa Tropis)
      const drawFrond = (endX: number, endY: number, ctrlX: number, ctrlY: number) => {
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(52, 45);
        ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
        ctx.stroke();

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(52, 45);
        ctx.quadraticCurveTo(ctrlX, ctrlY - 2, endX, endY);
        ctx.stroke();
      };

      drawFrond(6, 40, 22, 22);
      drawFrond(96, 42, 80, 24);
      drawFrond(16, 68, 28, 52);
      drawFrond(88, 70, 76, 54);
      drawFrond(50, 12, 48, 22);

      // Blooming Magenta Bougainvillea Bush at Base (Bunga Kertas Tropis)
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(50, 148, 22, 0, Math.PI * 2);
      ctx.fill();

      // Vibrant fuchsia flowers
      const flowerColors = ['#f43f5e', '#e11d48', '#fda4af', '#fb7185'];
      for (let i = 0; i < 24; i++) {
        const fx = 35 + Math.random() * 32;
        const fy = 135 + Math.random() * 22;
        ctx.fillStyle = flowerColors[i % flowerColors.length];
        ctx.beginPath();
        ctx.arc(fx, fy, 2.5 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  /**
   * Indonesian Concrete Utility Pole with Tangled Cable Wires & Transformer
   * Typical Indonesian urban street scenery.
   */
  public static getUtilityPoleTexture(): Texture {
    return this.fromCanvas('utility_pole_hd', 60, 240, (ctx) => {
      // Concrete pole body
      const poleGrad = ctx.createLinearGradient(24, 0, 36, 0);
      poleGrad.addColorStop(0, '#64748b');
      poleGrad.addColorStop(0.5, '#cbd5e1');
      poleGrad.addColorStop(1, '#475569');
      ctx.fillStyle = poleGrad;
      ctx.fillRect(26, 0, 9, 240);

      // Crossarms at top
      ctx.fillStyle = '#334155';
      ctx.fillRect(8, 24, 44, 6);
      ctx.fillRect(14, 44, 32, 5);

      // Ceramic insulators
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(12, 17, 5, 7);
      ctx.fillRect(28, 17, 5, 7);
      ctx.fillRect(44, 17, 5, 7);

      // Heavy power transformer canister (Trafo PLN)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(14, 58, 18, 28, 3);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(17, 62, 12, 3);

      // Tangled hanging cable bundle loops
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, 26); ctx.quadraticCurveTo(24, 32, 60, 26);
      ctx.moveTo(0, 46); ctx.quadraticCurveTo(30, 56, 60, 46);
      ctx.stroke();
    });
  }
}
