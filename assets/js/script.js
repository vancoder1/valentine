document.addEventListener('DOMContentLoaded', () => {
    // === 1. Time Together Counter ===
    const startDate = new Date('August 10, 2025 21:58:00');
    function updateCounter() {
        const now = new Date();
        const diff = now - startDate;
        if (diff < 0) return;

        const oneSecond = 1000;
        const oneMinute = oneSecond * 60;
        const oneHour = oneMinute * 60;
        const oneDay = oneHour * 24;
        const oneYear = oneDay * 365.25;

        const years = Math.floor(diff / oneYear);
        const days = Math.floor((diff % oneYear) / oneDay);
        const hours = Math.floor((diff % oneDay) / oneHour);
        const minutes = Math.floor((diff % oneHour) / oneMinute);
        const seconds = Math.floor((diff % oneMinute) / oneSecond);

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
        set('years', years);
        set('days', days);
        set('hours', hours);
        set('minutes', minutes);
        set('seconds', seconds);
    }
    setInterval(updateCounter, 1000); updateCounter();

    // === 2. Scroll Reveal & Hero Animation ===
    setTimeout(() => {
        const heroContent = document.getElementById('hero-content');
        if (heroContent) heroContent.classList.remove('translate-y-10', 'opacity-0');
    }, 100);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));


    // === 3. Global Interactions ===
    const cursorDot = document.createElement('div');
    const cursorOutline = document.createElement('div');
    cursorDot.className = 'cursor-dot hidden md:block';
    cursorOutline.className = 'cursor-outline hidden md:block';
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorOutline);

    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => card.classList.add('spotlight-card'));

    const magneticBtns = document.querySelectorAll('.btn-cosmic');
    const btnStates = new Map();
    magneticBtns.forEach(btn => btnStates.set(btn, { x: 0, y: 0, targetX: 0, targetY: 0 }));

    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    const lerp = (start, end, factor) => start + (end - start) * factor;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;

        const target = e.target;
        if (target.matches('a, button, .tilt-card, .tilt-card *, input, canvas, .btn-cosmic')) {
            document.body.classList.add('hovering');
        } else {
            document.body.classList.remove('hovering');
        }
    });

    const spotlightElements = document.querySelectorAll('.spotlight-card, .btn-cosmic');
    spotlightElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });

    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const state = btnStates.get(btn);
            state.targetX = (e.clientX - rect.left - rect.width / 2) * 0.3;
            state.targetY = (e.clientY - rect.top - rect.height / 2) * 0.3;
        });
        btn.addEventListener('mouseleave', () => {
            const state = btnStates.get(btn);
            state.targetX = 0;
            state.targetY = 0;
        });
    });

    function animateGlobal() {
        outlineX = lerp(outlineX, mouseX, 0.12);
        outlineY = lerp(outlineY, mouseY, 0.12);
        cursorOutline.style.left = `${outlineX}px`;
        cursorOutline.style.top = `${outlineY}px`;

        magneticBtns.forEach(btn => {
            const state = btnStates.get(btn);
            if (Math.abs(state.x - state.targetX) > 0.1 || Math.abs(state.y - state.targetY) > 0.1) {
                state.x = lerp(state.x, state.targetX, 0.1);
                state.y = lerp(state.y, state.targetY, 0.1);
                btn.style.transform = `translate(${state.x}px, ${state.y}px)`;
            }
        });

        requestAnimationFrame(animateGlobal);
    }
    animateGlobal();


    // === 4. Hero Parallax ===
    const heroSection = document.getElementById('hero');
    const heroText = document.getElementById('hero-content');
    if (heroSection && heroText) {
        let hMouseX = 0, hMouseY = 0;
        let hTargetX = 0, hTargetY = 0;

        heroSection.addEventListener('mousemove', (e) => {
            hTargetX = (e.clientX / window.innerWidth - 0.5) * 30;
            hTargetY = (e.clientY / window.innerHeight - 0.5) * 30;
        });

        function animateHero() {
            hMouseX = lerp(hMouseX, hTargetX, 0.05);
            hMouseY = lerp(hMouseY, hTargetY, 0.05);
            heroText.style.transform = `translate(${hMouseX}px, ${hMouseY}px)`;
            requestAnimationFrame(animateHero);
        }
        animateHero();
    }


    // === 5. Cosmic Ring Game Logic ===
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const uiEl = document.getElementById('game-ui');
    const finaleEl = document.getElementById('finale-message');
    const sectionEl = document.getElementById('surprise');

    let width, height;
    let particles = [], targets = [], ringParticles = [];
    let score = 0;
    const TOTAL_TARGETS = 5;
    let gameState = 'playing';
    let gMouseX = -1000, gMouseY = -1000;

    function resize() {
        if (sectionEl) {
            width = canvas.width = sectionEl.offsetWidth;
            height = canvas.height = sectionEl.offsetHeight;
        } else {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
    }
    window.addEventListener('resize', resize);
    setTimeout(resize, 100);

    // Touch
    canvas.addEventListener('touchmove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        gMouseX = touch.clientX - rect.left;
        gMouseY = touch.clientY - rect.top;
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (e.target !== canvas) {
            const touch = e.touches[0];
            mouseX = touch.clientX;
            mouseY = touch.clientY;
        }
    }, { passive: true });
    document.addEventListener('touchstart', () => { }, { passive: true });

    // Mouse
    document.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        gMouseX = e.clientX - rect.left;
        gMouseY = e.clientY - rect.top;

        // Finale Tilt
        if (gameState === 'finale' && finaleEl) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const tiltX = (gMouseX - centerX) / centerX * 15;
            const tiltY = (gMouseY - centerY) / centerY * 15;

            const container = finaleEl.querySelector('.glass-message');
            if (container) {
                container.style.transform = `perspective(1000px) rotateY(${tiltX}deg) rotateX(${-tiltY}deg)`;
            }
        }
    });

    // FINALE FUNCTION - Defined here to ensure access
    function startFinale() {
        console.log("Starting Finale Sequence");
        gameState = 'finale';

        // Hide UI immediately
        if (uiEl) {
            uiEl.style.opacity = '0';
            uiEl.style.pointerEvents = 'none';
        }

        if (sectionEl) sectionEl.classList.remove('cursor-none');

        // Create Rings
        ringParticles = [];
        for (let i = 0; i < 400; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 100 + 150;
            ringParticles.push(new RingParticle(angle, radius));
        }

        // Show Message (Fast Reveal)
        setTimeout(() => {
            if (finaleEl) {
                // Remove hidden classes
                finaleEl.classList.remove('opacity-0', 'scale-90', 'pointer-events-none');

                // Add visible class to BOTH parent and child to ensure CSS triggers
                finaleEl.classList.add('visible');
                const inner = finaleEl.querySelector('.glass-message');
                if (inner) inner.classList.add('visible');
            }
        }, 100);
    }

    class Particle {
        constructor(x, y, color) {
            this.x = x || Math.random() * width;
            this.y = y || Math.random() * height;
            this.size = Math.random() * 2;
            this.color = color || `rgba(255, 255, 255, ${Math.random()})`;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
        }
        update() {
            this.x += this.speedX; this.y += this.speedY;
            if (this.x < 0) this.x = width; if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height; if (this.y > height) this.y = 0;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
        }
    }

    class Target {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * (width - 100) + 50;
            this.y = Math.random() * (height - 100) + 50;
            this.size = 15; this.baseSize = 15;
            this.vx = (Math.random() - 0.5) * 4; this.vy = (Math.random() - 0.5) * 4;
            this.changeDirTimer = 0; this.collected = false;
        }
        update(time) {
            if (this.collected) return;
            this.x += this.vx; this.y += this.vy;
            if (this.x < 50 || this.x > width - 50) this.vx *= -1;
            if (this.y < 50 || this.y > height - 50) this.vy *= -1;

            this.changeDirTimer++;
            if (this.changeDirTimer > 50 + Math.random() * 50) {
                this.vx += (Math.random() - 0.5) * 2; this.vy += (Math.random() - 0.5) * 2;
                const speed = Math.hypot(this.vx, this.vy);
                if (speed > 5) { this.vx *= 0.8; this.vy *= 0.8; }
                this.changeDirTimer = 0;
            }
            this.size = this.baseSize + Math.sin(time * 0.005) * 3;
            if (Math.hypot(gMouseX - this.x, gMouseY - this.y) < 50) this.collect();
        }
        collect() {
            this.collected = true;
            score++;
            if (scoreEl) scoreEl.innerText = score;
            for (let i = 0; i < 30; i++) particles.push(new ExplosionParticle(this.x, this.y));

            // Check win condition
            if (score >= TOTAL_TARGETS) {
                startFinale();
            }
        }
        draw() {
            if (this.collected) return;
            ctx.shadowBlur = 20; ctx.shadowColor = "#FCD34D"; ctx.fillStyle = "#FCD34D";
            ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(Date.now() * 0.002);
            ctx.beginPath(); ctx.moveTo(0, -this.size); ctx.lineTo(this.size / 2, 0); ctx.lineTo(0, this.size); ctx.lineTo(-this.size / 2, 0);
            ctx.closePath(); ctx.fill(); ctx.restore(); ctx.shadowBlur = 0;
        }
    }

    class ExplosionParticle {
        constructor(x, y) {
            this.x = x; this.y = y;
            this.angle = Math.random() * Math.PI * 2;
            this.speed = Math.random() * 8 + 2;
            this.life = 1; this.decay = 0.03;
            this.color = `hsl(${Math.random() * 60 + 40}, 100%, 70%)`;
        }
        update() { this.x += Math.cos(this.angle) * this.speed; this.y += Math.sin(this.angle) * this.speed; this.life -= this.decay; }
        draw() {
            ctx.globalAlpha = this.life; ctx.fillStyle = this.color;
            ctx.beginPath(); ctx.arc(this.x, this.y, 4, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        }
    }

    class RingParticle {
        constructor(angle, radius) {
            this.angle = angle; this.radius = radius;
            this.yOffset = (Math.random() - 0.5) * 40;
            this.size = Math.random() * 2 + 0.5;
            this.speed = (500 - radius) * 0.00005 + 0.005;
            this.color = Math.random() > 0.5 ? '#A855F7' : '#FFFFFF';
        }
        update() { this.angle += this.speed; }
        draw(cx, cy, tilt) {
            const x = cx + Math.cos(this.angle) * this.radius;
            const y = cy + Math.sin(this.angle) * this.radius * tilt + this.yOffset;
            const scale = (Math.sin(this.angle) + 2) / 3;
            ctx.fillStyle = this.color; ctx.globalAlpha = scale;
            ctx.beginPath(); ctx.arc(x, y, this.size * scale, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        }
    }

    function init() {
        resize();
        for (let i = 0; i < 100; i++) particles.push(new Particle());
        resetTargets();
    }
    function resetTargets() {
        targets = []; score = 0;
        if (scoreEl) scoreEl.innerText = 0;
        for (let i = 0; i < TOTAL_TARGETS; i++) targets.push(new Target());
    }

    function animate(time) {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            if (p instanceof ExplosionParticle) { p.update(); if (p.life > 0) p.draw(); }
            else { p.update(); p.draw(); }
        });
        particles = particles.filter(p => !(p instanceof ExplosionParticle) || p.life > 0);

        if (gameState === 'playing') {
            targets.forEach(t => { t.update(time); t.draw(); });
            // Cursor
            ctx.shadowBlur = 20; ctx.shadowColor = 'white'; ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath(); ctx.arc(gMouseX, gMouseY, 6, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(gMouseX, gMouseY, 12, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
        } else if (gameState === 'finale') {
            const cx = width / 2; const cy = height / 2;
            const driftX = (gMouseX - cx) * 0.05; const driftY = (gMouseY - cy) * 0.05;
            ringParticles.forEach(p => { p.update(); p.draw(cx + driftX, cy + driftY, 0.4); });

            const gradient = ctx.createRadialGradient(cx + driftX, cy + driftY, 10, cx + driftX, cy + driftY, 200);
            gradient.addColorStop(0, 'rgba(168, 85, 247, 0.2)'); gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
        }
        requestAnimationFrame(animate);
    }

    if (canvas) { init(); animate(0); }
});
