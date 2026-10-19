
    // === CÁC BIẾN CƠ BẢN VÀ CANVAS CẦN THIẾT ===
    const anhHaiNguoi = document.getElementById('anh-hai-nguoi');
    const laCanvas = document.getElementById('laCanvas');
    const coHoa = document.getElementById('co-hoa');

    let laDaChay = false;
    let dungVeLaVang = false;
    let dangLiec = false;
    let henLiec = null;
    let huongCu = -1;

    // === 1. LOGIC LÁ VÀNG VÀ HOA RƠI (laCanvas) ===
    function khoiDongLaVang() {
        if (!laCanvas) return;
        const ctx = laCanvas.getContext('2d');
        let w = 0, h = 0;

        function resize() {
            const mobileCanvas = window.innerWidth <= 600;
            const dpr = Math.min(window.devicePixelRatio || 1, mobileCanvas ? 1.15 : 1.4);
            w = laCanvas.clientWidth; 
            h = laCanvas.clientHeight;
            laCanvas.width = Math.max(1, Math.round(w * dpr));
            laCanvas.height = Math.max(1, Math.round(h * dpr));
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();
        window.addEventListener('resize', resize);

        function taoLa(mau) {
            const c = document.createElement('canvas');
            c.width = 60; c.height = 40;
            const x = c.getContext('2d');
            x.shadowBlur = 6; x.shadowColor = 'rgba(255, 190, 0, 0.7)';
            x.fillStyle = mau;
            x.beginPath();
            x.moveTo(6, 20);
            x.bezierCurveTo(18, 2, 44, 3, 55, 20);
            x.bezierCurveTo(44, 37, 18, 38, 6, 20);
            x.fill();
            x.shadowBlur = 0;
            x.strokeStyle = 'rgba(130, 75, 0, 0.55)';
            x.lineWidth = 1.2;
            x.beginPath(); x.moveTo(2, 20); x.lineTo(50, 20); x.stroke();
            for (let i = 0; i < 3; i++) {
                const px = 16 + i * 12;
                x.beginPath(); x.moveTo(px, 20); x.lineTo(px + 7, 11); x.moveTo(px, 20); x.lineTo(px + 7, 29); x.stroke();
            }
            return c;
        }

        function taoCanhHoa() {
            const c = document.createElement('canvas');
            c.width = 40; c.height = 40;
            const x = c.getContext('2d');
            x.shadowBlur = 6; x.shadowColor = 'rgba(255, 190, 0, 0.8)';
            x.fillStyle = 'rgba(255, 228, 120, 0.95)';
            x.beginPath();
            x.moveTo(20, 20);
            x.bezierCurveTo(30, 10, 30, 30, 20, 40);
            x.bezierCurveTo(10, 30, 10, 10, 20, 20);
            x.fill();
            return c;
        }

        const sprites = [
            taoLa('#ffd23f'), taoLa('#f5b700'), taoLa('#e8a317'), taoLa('#ffe066'), taoLa('#d98c00'),
            taoCanhHoa(), taoCanhHoa()
        ];

        const mobile = window.innerWidth <= 600;
        const soLuong = mobile ? 27 : 52;
        const hat = [];

        function datLai(p, taiSinh) {
            p.sprite = sprites[Math.floor(Math.random() * sprites.length)];
            p.size = Math.random() * 0.45 + 0.45;
            p.vy = Math.random() * 0.7 + 0.48;
            p.vx = -(Math.random() * 1.75 + 1.35);
            p.lechX = Math.random() * 0.9 + 0.8;
            p.lechY = Math.random() * 0.35 + 0.12;
            p.gocXoay = Math.random() * Math.PI * 2;
            p.tocDoXoay = Math.random() * 0.035 - 0.0175;
            p.lat = Math.random() * Math.PI * 2;
            p.tocDoLat = Math.random() * 0.05 + 0.02;
            p.lac = Math.random() * Math.PI * 2;
            p.alpha = Math.random() * 0.3 + 0.65;
            if (!taiSinh) {
                p.x = Math.random() * (w + 40);
                p.y = Math.random() * h;
            } else if (Math.random() < 0.72) {
                p.x = w + 80 + Math.random() * 150;
                p.y = Math.random() * h * 0.84;
            } else {
                p.x = Math.random() * (w + 120);
                p.y = -55 - Math.random() * 90;
            }
        }

        for (let i = 0; i < soLuong; i++) { const p = {}; datLai(p, false); hat.push(p); }

        const buocKhung = 1000 / 45;
        let khungTruoc = 0;

        function vong(thoiGian) {
            if (dungVeLaVang) {
                ctx.clearRect(0, 0, w, h);
                return;
            }
            if (document.hidden) { khungTruoc = thoiGian; requestAnimationFrame(vong); return; }
            if (khungTruoc && thoiGian - khungTruoc < buocKhung) {
                requestAnimationFrame(vong);
                return;
            }
            const heSo = khungTruoc ? Math.min(2.5, (thoiGian - khungTruoc) / (1000 / 60)) : 1;
            khungTruoc = thoiGian;
            ctx.clearRect(0, 0, w, h);
            for (const p of hat) {
                p.lac += 0.026 * heSo;
                p.y += (p.vy + Math.sin(p.lac * 0.9) * p.lechY) * heSo;
                p.x += (p.vx + Math.sin(p.lac) * p.lechX) * heSo;
                p.gocXoay += p.tocDoXoay * heSo;
                p.lat += p.tocDoLat * heSo;
                if (p.y > h + 60 || p.x < -160) datLai(p, true);
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.gocXoay);
                ctx.scale(p.size * (0.3 + 0.7 * Math.abs(Math.cos(p.lat))), p.size);
                ctx.globalAlpha = p.alpha;
                ctx.drawImage(p.sprite, -p.sprite.width / 2, -p.sprite.height / 2);
                ctx.restore();
            }
            requestAnimationFrame(vong);
        }
        requestAnimationFrame(vong);
    }

    // === 3. LOGIC CỎ, HOA, LÁ VẼ NÉT ĐUNG ĐƯA THEO GIÓ ===
    if (coHoa) {
        const SVGNS = 'http://www.w3.org/2000/svg';
        const rnd = (a, b) => a + Math.random() * (b - a);
        const chon = (arr) => arr[Math.floor(Math.random() * arr.length)];

        const MAU_XANH = ['#5cf0a0', '#8be04e', '#2fd4b4', '#b4f03c', '#4fd8f0'];
        const MAU_HOA  = ['#ff6fae', '#ff4f84', '#b388ff', '#5fb8ff', '#ff9a4d', '#ffffff', '#ff8fd0'];
        const MAU_TAM  = ['#ffffff', '#ff9a4d', '#7a5cff'];
        let mau = '#ffffff';

        function el(tag, attrs, parent) {
            const e = document.createElementNS(SVGNS, tag);
            for (const k in attrs) e.setAttribute(k, attrs[k]);
            if (parent) parent.appendChild(e);
            return e;
        }

        function net(parent, d, delay) {
            const p = el('path', { d: d, class: 'net', pathLength: 1 }, parent);
            p.style.setProperty('--d', delay.toFixed(2) + 's');
            p.style.setProperty('--mau', mau);
            return p;
        }

        function nhomLac(parent, ox, oy, amp, t, dl) {
            const g = el('g', { class: 'lac' }, parent);
            g.style.transformOrigin = ox + 'px ' + oy + 'px';
            g.style.setProperty('--a', amp.toFixed(2) + 'deg');
            g.style.animationDuration = t + 's';
            g.style.animationDelay = dl.toFixed(2) + 's';
            return g;
        }

        function qp(p0, p1, p2, t) {
            const u = 1 - t;
            return {
                x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
                y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
                ang: Math.atan2(2 * u * (p1.y - p0.y) + 2 * t * (p2.y - p1.y),
                                2 * u * (p1.x - p0.x) + 2 * t * (p2.x - p1.x)) * 180 / Math.PI
            };
        }

        function vongTron(parent, cx, cy, r, delay) {
            return net(parent, `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`, delay);
        }

        function chiLa(parent, x, y, goc, dai, rong, delay) {
            const g = el('g', { transform: `translate(${x} ${y}) rotate(${goc})` }, parent);
            net(g, `M 0 0 Q ${dai * 0.5} ${-rong} ${dai} 0 Q ${dai * 0.5} ${rong} 0 0`, delay);
            net(g, `M 0 0 L ${dai * 0.88} 0`, delay + 0.15);
            for (let k = 1; k <= 3; k++) {
                const px = dai * (0.15 + k * 0.2);
                const dy = rong * 0.55 * (1 - k * 0.2);
                net(g, `M ${px} 0 L ${px + dai * 0.1} ${-dy} M ${px} 0 L ${px + dai * 0.1} ${dy}`, delay + 0.2);
            }
        }

        function hoaCuc(parent, cx, cy, R, delay, mauCanh, mauTam) {
            const g = el('g', { transform: `translate(${cx} ${cy}) rotate(${rnd(-25, 25)})` }, parent);
            const n = Math.round(rnd(8, 12)), r0 = R * 0.26, pw = R * 0.24;
            mau = mauCanh;
            for (let i = 0; i < n; i++) {
                const pg = el('g', { transform: `rotate(${i * 360 / n})` }, g);
                net(pg, `M ${r0} 0 Q ${(r0 + R) / 2} ${-pw} ${R} 0 Q ${(r0 + R) / 2} ${pw} ${r0} 0`, delay + i * 0.03);
            }
            mau = mauTam;
            vongTron(g, 0, 0, r0, delay + 0.1);
            vongTron(g, 0, 0, r0 * 0.45, delay + 0.2);
        }

        function hoaSen(parent, cx, cy, R, delay, mauCanh) {
            const g = el('g', { transform: `translate(${cx} ${cy}) rotate(${rnd(-12, 12)})` }, parent);
            const lop = [{ n: 7, len: R, sp: 150 }, { n: 5, len: R * 0.72, sp: 110 }];
            lop.forEach((L, li) => {
                mau = li === 0 ? mauCanh : '#ffffff';
                for (let i = 0; i < L.n; i++) {
                    const a = -90 + (i / (L.n - 1) - 0.5) * L.sp;
                    const pg = el('g', { transform: `rotate(${a})` }, g);
                    net(pg, `M 0 0 Q ${L.len * 0.4} ${-L.len * 0.4} ${L.len} 0 Q ${L.len * 0.4} ${L.len * 0.4} 0 0`, delay + li * 0.2 + i * 0.04);
                }
            });
        }

        function hoaNam(parent, cx, cy, R, delay, mauCanh, mauTam) {
            const g = el('g', { transform: `translate(${cx} ${cy}) rotate(${rnd(0, 72)})` }, parent);
            mau = mauCanh;
            for (let i = 0; i < 5; i++) {
                const pg = el('g', { transform: `rotate(${i * 72})` }, g);
                net(pg, `M 0 0 C ${R * 0.2} ${-R * 0.55} ${R * 0.8} ${-R * 0.55} ${R * 0.85} 0 C ${R * 0.8} ${R * 0.55} ${R * 0.2} ${R * 0.55} 0 0`, delay + i * 0.05);
            }
            mau = mauTam;
            vongTron(g, 0, 0, R * 0.16, delay + 0.2);
        }

        function cayHoa(parent, x, goc, h, kieu, delay, W) {
            const bend = rnd(-0.2, 0.08) * h;
            const p0 = { x: x, y: goc }, p1 = { x: x + bend * 1.6, y: goc - h * 0.55 }, p2 = { x: x + bend, y: goc - h };
            const g = nhomLac(parent, x, goc, rnd(1.2, 2.6), 3.4, -(x / W) * 3 - rnd(0, 0.4));
            mau = chon(MAU_XANH);
            net(g, `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`, delay);
            [0.28, 0.48, 0.66].forEach((t, i) => {
                const q = qp(p0, p1, p2, t);
                const dai = Math.max(16, Math.min(46, h * 0.17));
                mau = chon(MAU_XANH);
                chiLa(g, q.x, q.y, q.ang + (i % 2 ? 1 : -1) * rnd(35, 55), dai, dai * 0.3, delay + 0.3 + i * 0.15);
            });
            const R = Math.max(11, Math.min(24, h * 0.085));
            const mc = chon(MAU_HOA), mt = chon(MAU_TAM);
            if (kieu === 0) hoaCuc(g, p2.x, p2.y, R, delay + 0.8, mc, mt);
            else if (kieu === 1) hoaSen(g, p2.x, p2.y, R * 1.35, delay + 0.8, mc);
            else hoaNam(g, p2.x, p2.y, R, delay + 0.8, mc, mt);
        }

        function canhLa(parent, x, goc, dx, dy, soLa, delay, W) {
            const p0 = { x: x, y: goc }, p1 = { x: x + dx * 0.1, y: goc - dy * 0.65 }, p2 = { x: x + dx, y: goc - dy };
            const g = nhomLac(parent, x, goc, rnd(1, 1.8), 4.2, -(x / W) * 3);
            mau = '#d9a066';
            net(g, `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`, delay);
            for (let i = 0; i < soLa; i++) {
                const t = 0.2 + 0.75 * i / (soLa - 1);
                const q = qp(p0, p1, p2, t);
                const dai = 46 - 24 * t;
                mau = chon(MAU_XANH);
                chiLa(g, q.x, q.y, q.ang + (i % 2 ? 1 : -1) * rnd(38, 55), dai, dai * 0.3, delay + 0.3 + i * 0.12);
            }
            const qe = qp(p0, p1, p2, 1);
            mau = chon(MAU_XANH);
            chiLa(g, qe.x, qe.y, qe.ang, 24, 7, delay + 1.6);
            hoaNam(g, p2.x + 4, p2.y - 8, 12, delay + 1.8, chon(MAU_HOA), '#ffffff');
        }

        function dungCoHoa() {
            const W = window.innerWidth;
            const mobile = W <= 600;
            const Hh = Math.round(Math.min(window.innerHeight * (mobile ? 0.41 : 0.44), mobile ? 330 : 430));

            coHoa.setAttribute('overflow', 'visible');
            coHoa.style.overflow = 'visible';
            coHoa.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
            coHoa.setAttribute('width', W);
            coHoa.setAttribute('height', Hh);
            coHoa.innerHTML = '';

            const base = Hh + 4;
            const imgH = anhHaiNguoi ? anhHaiNguoi.getBoundingClientRect().height : 0;
            const vungX = W - imgH * 0.634 - W * 0.02 - 20;

            const ph = rnd(0, 6);
            const nhomCo = new Map(MAU_XANH.map(m => [m, []]));
            for (let x = -10; x < W + 10; x += rnd(3.1, 6.2)) {
                let h = Hh * (0.22 + 0.42 * rnd(0.35, 1) * (0.65 + 0.35 * Math.sin(x / 85 + ph)));
                if (x > vungX) h *= 0.98;
                const lean = rnd(-0.3, 0.08) * h;
                const w = rnd(2.5, 6);
                const d = `M ${x - w} ${base} Q ${x - w + lean * .35} ${base - h * .55} ${x + lean} ${base - h} Q ${x + w + lean * .35} ${base - h * .5} ${x + w} ${base}`;
                nhomCo.get(chon(MAU_XANH)).push(d);
            }
            nhomCo.forEach((netCo, mauCo) => {
                el('path', { class: 'co-ngan', d: netCo.join(' '), stroke: mauCo }, coHoa);
            });

            canhLa(coHoa, W * 0.02, base, W * (mobile ? 0.26 : 0.15), Hh * 0.95, mobile ? 6 : 8, 0.6, W);
            if (!mobile) canhLa(coHoa, W * 0.32, base, W * 0.1, Hh * 0.8, 6, 1.0, W);

            const soHoa = mobile ? 5 : 9;
            const dau = W * 0.06, cuoi = Math.max(dau + 50, vungX - 30);
            for (let i = 0; i < soHoa; i++) {
                const x = dau + (cuoi - dau) * (i + rnd(0.2, 0.8)) / soHoa;
                cayHoa(coHoa, x, base, Hh * rnd(0.7, 1.0), i % 3, 0.8 + (x / W) * 1.5, W);
            }

            if (vungX < W - 40) {
                const soHoaChan = mobile ? 4 : 6;
                for (let i = 0; i < soHoaChan; i++) {
                    const x = Math.max(0, vungX) + (W - Math.max(0, vungX)) * (i + .5) / soHoaChan;
                    cayHoa(coHoa, x, base, Hh * rnd(.38, .66), i % 3, 1.4 + i * .14, W);
                }
            }
        }

        let rongCuoi = window.innerWidth, henGio;
        window.addEventListener('resize', () => {
            clearTimeout(henGio);
            henGio = setTimeout(() => {
                if (window.innerWidth !== rongCuoi) { rongCuoi = window.innerWidth; dungCoHoa(); }
            }, 300);
        });
        dungCoHoa();
    }

    // === 4. LOGIC TRỜI SAO VÀ THIÊN THẠCH / SAO BĂNG ===
    (() => {
        const sky = document.getElementById('tiny-sky');
        if (sky) {
            for (let i = 0; i < 78; i++) {
                const star = document.createElement('span');
                star.className = 'tiny-star';
                star.style.left = (Math.random() * 100) + '%';
                star.style.top = (Math.random() * 75) + '%';
                star.style.setProperty('--size', (1 + Math.random() * 2) + 'px');
                star.style.setProperty('--twinkle', (1.4 + Math.random() * 3.2) + 's');
                star.style.setProperty('--delay', (-Math.random() * 5) + 's');
                sky.appendChild(star);
            }
        }

        const lower = document.getElementById('lower-stars');
        if (lower) {
            for (let i = 0; i < 28; i++) {
                const star = document.createElement('span');
                star.className = 'lower-star';
                star.style.left = (Math.random() * 100) + '%';
                star.style.top = (76 + Math.random() * 20) + '%';
                star.style.setProperty('--size', (1 + Math.random() * 2.4) + 'px');
                star.style.setProperty('--twinkle', (1.5 + Math.random() * 3) + 's');
                star.style.setProperty('--delay', (-Math.random() * 5) + 's');
                lower.appendChild(star);
            }
        }

        if (sky) {
            const meteors = [];
            function quyDaoSao(meteor) {
                const w = window.innerWidth, h = window.innerHeight;
                const dx = w * Number(meteor.dataset.flyX), dy = h * Number(meteor.dataset.flyY);
                const goc = Math.atan2(-dy, dx) * 180 / Math.PI;
                meteor.style.setProperty('--meteor-angle', goc.toFixed(1) + 'deg');
                for (const t of [8, 20, 36, 53, 100]) {
                    meteor.style.setProperty('--meteor-x' + String(t).padStart(2, '0'), (-dx * t / 100).toFixed(1) + 'px');
                    meteor.style.setProperty('--meteor-y' + String(t).padStart(2, '0'), (dy * t / 100).toFixed(1) + 'px');
                }
            }

            function datSaoNgauNhien(meteor) {
                const x = 23 + Math.random() * 63;
                const y = 7 + Math.random() * 46;
                meteor.style.left = x.toFixed(2) + '%';
                meteor.style.top = y.toFixed(2) + '%';
                meteor.dataset.flyX = String(Math.min(.14 + Math.random() * .13, x / 100 - .07));
                meteor.dataset.flyY = String(.10 + Math.random() * .12);
                quyDaoSao(meteor);
            }

            for (let i = 0; i < 4; i++) {
                const meteor = document.createElement('span');
                meteor.className = 'tiny-meteor';
                meteor.style.setProperty('--period', (6.1 + Math.random() * 1.4) + 's');
                meteor.style.setProperty('--meteor-delay', (-i * 1.65) + 's');
                datSaoNgauNhien(meteor);
                meteor.addEventListener('animationiteration', () => datSaoNgauNhien(meteor));
                sky.appendChild(meteor);
                meteors.push(meteor);
            }

            let resizeSao;
            window.addEventListener('resize', () => {
                clearTimeout(resizeSao);
                resizeSao = setTimeout(() => meteors.forEach(quyDaoSao), 200);
            });
        }
    })();

    // === KHỞI CHẠY LÁ VÀNG VÀ GIÓ LIẾC MẮT ===
    // Hàm bật lại hiệu ứng lá rơi nếu bị tắt
    function hienLaVang() {
        dungVeLaVang = false;
        khoiDongLaVang();
    }

    // Hàm vẽ lại cỏ hoa (tự động tính toán theo kích thước màn hình)
    function hienCoHoa() {
        if (typeof dungCoHoa === 'function') {
            dungCoHoa();
        }
    }


    // Chạy tất cả ngay khi trang web hoàn tất tải dữ liệu
    window.addEventListener('DOMContentLoaded', () => {
        hienLaVang();
        hienCoHoa();
    });
    khoiDongLaVang();