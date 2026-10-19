/* ============================================================================
 * CẤU HÌNH HÌNH ẢNH HOA
 * ============================================================================ */
const ROSE_IMAGES = [
  "picture/rose1.png",
  "picture/rose2.png",
  "picture/rose3.png",
  "picture/rose4.png",
  "picture/rose5.png"
];

/* ============================================================================
 * CANVAS FLOWER ENGINE (HIỆU ỨNG HIỆN / NỞ HOA)
 * ============================================================================ */
class CanvasFlowerEngine {
  constructor(canvasId, onFullCoverage) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.onFullCoverage = onFullCoverage;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isMobile = window.innerWidth <= 768;
    this.dpr = this.isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    this.offscreenImages = [];
    this.imagesLoaded = false;

    this.bouquetRoses = [];
    this.explosionRoses = [];
    this.state = "idle"; // "idle" | "exploding"
    this.startTime = 0;
    this.animId = null;

    this._lastFrameTime = 0;
    this._frameBudget = this.isMobile ? 32 : 16;

    this.handleResize = this.handleResize.bind(this);
    this.animate = this.animate.bind(this);

    this.initCanvas();
    this.preloadImages();
    window.addEventListener("resize", this.handleResize);
  }

  initCanvas() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    if (this.ctx) {
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
  }

  handleResize() {
    this.isMobile = window.innerWidth <= 768;
    this._frameBudget = this.isMobile ? 32 : 16;
    this.initCanvas();
    if (this.state === "idle") {
      this.initBouquet();
    }
  }

  preloadImages() {
    let loadedCount = 0;

    ROSE_IMAGES.forEach((src, idx) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => {
        if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) return;

        const size = this.isMobile ? 200 : 320;
        const offCanvas = document.createElement("canvas");
        offCanvas.width = size;
        offCanvas.height = size;
        const offCtx = offCanvas.getContext("2d", { willReadFrequently: false });

        if ("filter" in offCtx) {
          offCtx.filter = "brightness(1.05) saturate(1.1)";
        }

        const pad = this.isMobile ? 6 : 10;
        const maxDraw = size - pad * 2;
        const aspect = img.naturalWidth / img.naturalHeight;
        let dw, dh;
        if (aspect >= 1) {
          dw = maxDraw;
          dh = maxDraw / aspect;
        } else {
          dh = maxDraw;
          dw = maxDraw * aspect;
        }
        const dx = (size - dw) / 2;
        const dy = (size - dh) / 2;

        offCtx.shadowColor = "rgba(0, 0, 0, 0.12)";
        offCtx.shadowBlur = this.isMobile ? 6 : 10;
        offCtx.shadowOffsetY = 3;
        offCtx.drawImage(img, dx, dy, dw, dh);

        this.offscreenImages[idx] = offCanvas;
        loadedCount++;
        if (loadedCount === ROSE_IMAGES.length) {
          this.imagesLoaded = true;
          this.startLoop();
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === ROSE_IMAGES.length) {
          this.imagesLoaded = true;
          this.startLoop();
        }
      };
    });
  }

  initBouquet() {
    this.bouquetRoses = [];
    const cx = this.width / 2;
    const cy = this.height / 2;

    const rings = this.isMobile
      ? [{ count: 2, maxR: 0 }, { count: 3, maxR: 40 }, { count: 3, maxR: 70 }]
      : [{ count: 4, maxR: 0 }, { count: 6, maxR: 60 }, { count: 8, maxR: 100 }];

    rings.forEach(({ count, maxR }) => {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const r = Math.random() * maxR;
        const size = this.isMobile ? 130 + Math.random() * 30 : 155 + Math.random() * 30;
        this.bouquetRoses.push({
          imgIdx: Math.floor(Math.random() * this.offscreenImages.length),
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r,
          size,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.003
        });
      }
    });
  }

  initExplosion() {
    this.explosionRoses = [];
    const cx = this.width / 2;
    const cy = this.height / 2;
    const maxR = Math.hypot(cx, cy) * 1.08;

    const desktopRings = [
      { count: 1,  rFrac: 0.00 },
      { count: 6,  rFrac: 0.09 },
      { count: 11, rFrac: 0.18 },
      { count: 16, rFrac: 0.28 },
      { count: 21, rFrac: 0.39 },
      { count: 26, rFrac: 0.51 },
      { count: 30, rFrac: 0.64 },
      { count: 32, rFrac: 0.77 },
      { count: 32, rFrac: 0.90 },
      { count: 25, rFrac: 1.04 }
    ];

    const mobileRings = [
      { count: 1,  rFrac: 0.00 },
      { count: 4,  rFrac: 0.14 },
      { count: 8,  rFrac: 0.28 },
      { count: 12, rFrac: 0.44 },
      { count: 15, rFrac: 0.62 },
      { count: 13, rFrac: 0.82 },
      { count: 9,  rFrac: 1.02 }
    ];

    const rings = this.isMobile ? mobileRings : desktopRings;
    const totalRings = rings.length;
    const totalBloomMs = this.isMobile ? 1900 : 2350;

    rings.forEach((ring, ringIdx) => {
      const ringOffsetAngle = Math.random() * Math.PI * 2;
      const ringDelay = (ringIdx / (totalRings - 1)) * totalBloomMs;

      for (let j = 0; j < ring.count; j++) {
        const angle = ring.count === 1
          ? 0
          : (j / ring.count) * Math.PI * 2 + ringOffsetAngle + (Math.random() - 0.5) * (Math.PI / ring.count);

        const r = ring.rFrac === 0
          ? 0
          : ring.rFrac * maxR + (Math.random() - 0.5) * (this.isMobile ? 12 : 20);

        const targetX = cx + Math.cos(angle) * r;
        const targetY = cy + Math.sin(angle) * r;

        const size = this.isMobile
          ? Math.floor(150 + Math.random() * 90)
          : Math.floor(180 + Math.random() * 180);

        const rot = Math.random() * Math.PI * 2;
        const duration = this.isMobile
          ? 600 + Math.random() * 150
          : 850 + Math.random() * 150;

        const flowerDelay = Math.max(0, ringDelay + (Math.random() - 0.5) * (this.isMobile ? 80 : 140));

        this.explosionRoses.push({
          imgIdx: Math.floor(Math.random() * this.offscreenImages.length),
          x: targetX,
          y: targetY,
          targetSize: size,
          rot,
          rotRate: (Math.random() - 0.5) * 0.003 * 0.04,
          delay: flowerDelay,
          duration
        });
      }
    });
  }

  startExplosion() {
    if (this.state === "exploding") return;
    this.state = "exploding";
    this.startTime = performance.now();
    this.initBouquet();
    this.initExplosion();
    this.startLoop();

    const coverageDelay = this.isMobile ? 2400 : 3500;
    setTimeout(() => {
      if (this.onFullCoverage) this.onFullCoverage();
    }, coverageDelay);
  }

  reset() {
    this.state = "idle";
    this._lastFrameTime = 0;
    if (this.canvas) {
      this.canvas.style.display = "block";
    }
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    this.bouquetRoses = [];
    this.explosionRoses = [];
    this.startLoop();
  }

  startLoop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.animId = requestAnimationFrame(this.animate);
  }

  animate(now) {
    this.animId = requestAnimationFrame(this.animate);

    if (now - this._lastFrameTime < this._frameBudget) {
      return;
    }
    this._lastFrameTime = now;

    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.state === "idle") {
      return;
    } else if (this.state === "exploding") {
      const elapsed = now - this.startTime;

      for (const r of this.bouquetRoses) {
        const off = this.offscreenImages[r.imgIdx];
        if (!off) continue;
        r.rot += r.rotSpeed;
        this.ctx.save();
        this.ctx.translate(r.x, r.y);
        this.ctx.rotate(r.rot);
        this.ctx.drawImage(off, -r.size / 2, -r.size / 2, r.size, r.size);
        this.ctx.restore();
      }

      for (const r of this.explosionRoses) {
        if (elapsed < r.delay) continue;
        const progress = Math.min(1, (elapsed - r.delay) / r.duration);

        const c1 = 1.15;
        const c3 = c1 + 1;
        const scale = progress >= 1 ? 1 : Math.max(0, 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2));
        const curSize = r.targetSize * scale;
        if (curSize <= 0) continue;

        const curRot = r.rot + r.rotRate * elapsed;
        const off = this.offscreenImages[r.imgIdx];
        if (!off) continue;

        this.ctx.save();
        this.ctx.translate(r.x, r.y);
        this.ctx.rotate(curRot);
        this.ctx.drawImage(off, -curSize / 2, -curSize / 2, curSize, curSize);
        this.ctx.restore();
      }
    }
  }
}

/* ============================================================================
 * TRÌNH ĐIỀU PHỐI LOGIC HIỆN VÀ TỰ ĐỘNG ẨN HOA
 * ============================================================================ */
class FlowerController {
  constructor() {
    this.state = "waiting"; // 'waiting' -> 'exploding' -> 'full' -> 'hidden'

    this.flowerEngine = new CanvasFlowerEngine("flowerCanvas", () => {
      this.state = "full";
      
      // Tự động kích hoạt ẩn hoa sau 1 giây (1000ms) khi đã nở đầy
      setTimeout(() => {
        this.hideFlowers();
      }, 1000);
    });

    this.initUIEvents();
  }

  // Logic NỞ HOA (Hiện hoa)
  showFlowers() {
    if (this.state !== "waiting") return;
    this.state = "exploding";

    const introObj = document.getElementById("s1IntroObject");
    if (introObj) {
      introObj.classList.add("bursting");
      setTimeout(() => {
        introObj.classList.add("hidden");
        document.querySelector("#s1TapHint").classList.add("hidden");
      }, 400);
    }

    setTimeout(() => {
      this.flowerEngine.startExplosion();
    }, 300);
  }

  // Logic ẨN HOA
  hideFlowers() {
    if (this.state !== "full" && this.state !== "exploding") return;
    this.state = "hidden";

    // Danh sách ID các phần tử cần thêm class "hien-thi"
    const ids = ["tiny-sky", "lower-stars", "anh-hai-nguoi", "co-hoa", "natureCanvas", "laCanvas", "text"];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add("hien-thi");
      document.querySelector("#vang-overlay").classList.add('loe'); 
      document.querySelector("#vang-overlay").style.opacity = '1';
    });

    const flowerCanvas = document.getElementById("flowerCanvas");
    if (flowerCanvas) {
      flowerCanvas.style.transition = "opacity 1s ease";
      flowerCanvas.style.opacity = "0";

      setTimeout(() => {
        flowerCanvas.style.display = "none";
        this.flowerEngine.reset();
        flowerCanvas.style.opacity = "1";
      }, 1000);
    }
  }

  initUIEvents() {
    let lastTapTime = 0;
    const handleScreenTap = (e) => {
      const now = Date.now();
      if (now - lastTapTime < 350) return;

      if (e.target.closest("button, a, input, textarea")) {
        return;
      }

      // Chỉ giữ sự kiện kích hoạt mở nở hoa khi bấm màn hình lần đầu
      if (this.state === "waiting") {
        lastTapTime = now;
        this.showFlowers();
      }
    };

    window.addEventListener("pointerdown", handleScreenTap);
  }
}

// Khởi tạo
document.addEventListener("DOMContentLoaded", () => {
  window.flowerApp = new FlowerController();
});