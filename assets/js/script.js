document.addEventListener('DOMContentLoaded', () => {
    // === 1. Time Together Counter (Existing) ===
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

        const elYears = document.getElementById('years'); if (elYears) elYears.innerText = years;
        const elDays = document.getElementById('days'); if (elDays) elDays.innerText = days;
        const elHours = document.getElementById('hours'); if (elHours) elHours.innerText = hours;
        const elMinutes = document.getElementById('minutes'); if (elMinutes) elMinutes.innerText = minutes;
        const elSeconds = document.getElementById('seconds'); if (elSeconds) elSeconds.innerText = seconds;
    }
    setInterval(updateCounter, 1000); updateCounter();

    // === 2. Scroll Reveal & Hero Animation (Existing) ===
    setTimeout(() => {
        const heroContent = document.getElementById('hero-content');
        if (heroContent) heroContent.classList.remove('translate-y-10', 'opacity-0');
    }, 500);
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));


    // === 3. Visual Softening & Polish (NEW) ===

    // A. Spotlight Effect for Cards (Replaces harsh tilt)
    // We update CSS variables --mouse-x and --mouse-y
    const cards = document.querySelectorAll('.tilt-card'); // Using same selector but logic changes

    cards.forEach(card => {
        card.classList.add('spotlight-card'); // Ensure class is added
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // B. Hero Parallax Text (Smoother)
    const heroSection = document.getElementById('hero');
    const heroText = document.getElementById('hero-content');

    // Lerp helper
    const lerp = (start, end, factor) => start + (end - start) * factor;

    let mouseX_hero = 0, mouseY_hero = 0;
    let targetX_hero = 0, targetY_hero = 0;

    if (heroSection && heroText) {
        heroSection.addEventListener('mousemove', (e) => {
            targetX_hero = (e.clientX / window.innerWidth - 0.5) * 30; // 30px range
            targetY_hero = (e.clientY / window.innerHeight - 0.5) * 30;
        });

        function animateHeroParallax() {
            mouseX_hero = lerp(mouseX_hero, targetX_hero, 0.05); // Very soft ease
            mouseY_hero = lerp(mouseY_hero, targetY_hero, 0.05);

            heroText.style.transform = `translate(${mouseX_hero}px, ${mouseY_hero}px)`;
            requestAnimationFrame(animateHeroParallax);
        }
        animateHeroParallax();
    }

    // C. Fluid Custom Cursor (Lerp)
    const cursorDot = document.createElement('div');
    const cursorOutline = document.createElement('div');
    cursorDot.className = 'cursor-dot hidden md:block';
    cursorOutline.className = 'cursor-outline hidden md:block';
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorOutline);

    let mouseX_global = 0, mouseY_global = 0;
    let cursorX = 0, cursorY = 0;
    let outlineX = 0, outlineY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX_global = e.clientX;
        mouseY_global = e.clientY;

        // Dot follows instantly
        cursorDot.style.left = `${mouseX_global}px`;
        cursorDot.style.top = `${mouseY_global}px`;

        // Check for interactive elements
        const target = e.target;
        if (target.matches('a, button, .tilt-card, .tilt-card *, input, canvas')) {
            document.body.classList.add('hovering');
        } else {
            document.body.classList.remove('hovering');
        }
    });

    // Valid Smooth Loop
    function animateCursor() {
        // Outline follows with lag
        outlineX = lerp(outlineX, mouseX_global, 0.12); // Soft lag
        outlineY = lerp(outlineY, mouseY_global, 0.12);

        cursorOutline.style.left = `${outlineX}px`;
        cursorOutline.style.top = `${outlineY}px`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();



    // D. Soft Magnetic Buttons
    const magnets = document.querySelectorAll('.btn-magical');
    magnets.forEach(btn => {
        let btnX = 0, btnY = 0;
        let targetBtnX = 0, targetBtnY = 0;

        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            // Calculate distance from center
            targetBtnX = (e.clientX - rect.left - rect.width / 2) * 0.4; // Weak pull
            targetBtnY = (e.clientY - rect.top - rect.height / 2) * 0.4;
        });

        btn.addEventListener('mouseleave', () => {
            targetBtnX = 0;
            targetBtnY = 0;
        });

        // Independent animation loop for each button for smoothness? 
        // Or just use CSS transition for simplicity + performace.
        // Actually CSS transition (0.4s ease) combined with JS setProperty is good enough for 'soft'
        // Let's stick to the previous implementation but updating style directly

        // Re-implementing with requestAnimationFrame for butter smoothness
        function animateButton() {
            btnX = lerp(btnX, targetBtnX, 0.1);
            btnY = lerp(btnY, targetBtnY, 0.1);
            btn.style.transform = `translate(${btnX}px, ${btnY}px)`;
            requestAnimationFrame(animateButton);
        }
        animateButton();
    });


    // === 4. Cosmic Ring Game Logic (Existing - Preserved) ===
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const uiEl = document.getElementById('game-ui');
    const finaleEl = document.getElementById('finale-message');
    const sectionEl = document.getElementById('surprise');

    let width, height;
    let particles = [];
    let targets = [];
    let ringParticles = [];
    let score = 0;
    const TOTAL_TARGETS = 5;
    let gameState = 'playing'; // 'playing', 'finale'
    let gMouseX = -1000;
    let gMouseY = -1000;

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

    // Track Mouse
    document.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        gMouseX = e.clientX - rect.left;
        gMouseY = e.clientY - rect.top;

        // 3D Tilt Effect for Finale Message
        if (gameState === 'finale' && finaleEl) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const tiltX = (gMouseX - centerX) / centerX * 15; // Max 15 deg tilt
            const tiltY = (gMouseY - centerY) / centerY * 15;

            // Apply tilt to the inner message container
            const container = finaleEl.querySelector('.glass-message');
            if (container) {
                container.style.transform = `perspective(1000px) rotateY(${tiltX}deg) rotateX(${-tiltY}deg)`;
            }
        }
    });

    // Track Touch
    document.addEventListener('touchmove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        gMouseX = touch.clientX - rect.left;
        gMouseY = touch.clientY - rect.top;
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchstart', () => { }, { passive: true });


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
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    class Target {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * (width - 100) + 50;
            this.y = Math.random() * (height - 100) + 50;
            this.size = 15;
            this.baseSize = 15;
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = (Math.random() - 0.5) * 4;
            this.changeDirTimer = 0;
            this.collected = false;
        }

        update(time) {
            if (this.collected) return;

            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 50 || this.x > width - 50) this.vx *= -1;
            if (this.y < 50 || this.y > height - 50) this.vy *= -1;

            this.changeDirTimer++;
            if (this.changeDirTimer > 50 + Math.random() * 50) {
                this.vx += (Math.random() - 0.5) * 2;
                this.vy += (Math.random() - 0.5) * 2;
                const speed = Math.hypot(this.vx, this.vy);
                if (speed > 5) { this.vx *= 0.8; this.vy *= 0.8; }
                this.changeDirTimer = 0;
            }

            this.size = this.baseSize + Math.sin(time * 0.005) * 3;

            const dx = gMouseX - this.x;
            const dy = gMouseY - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 50) {
                this.collect();
            }
        }

        collect() {
            this.collected = true;
            score++;
            if (scoreEl) scoreEl.innerText = score;

            for (let i = 0; i < 30; i++) {
                particles.push(new ExplosionParticle(this.x, this.y));
            }

            if (score >= TOTAL_TARGETS) {
                startFinale();
            }
        }

        draw() {
            if (this.collected) return;
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#FCD34D";
            ctx.fillStyle = "#FCD34D";
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(Date.now() * 0.002);
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size / 2, 0);
            ctx.lineTo(0, this.size);
            ctx.lineTo(-this.size / 2, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            ctx.shadowBlur = 0;
        }
    }

    class ExplosionParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.angle = Math.random() * Math.PI * 2;
            this.speed = Math.random() * 8 + 2;
            this.life = 1;
            this.decay = 0.03;
            this.color = `hsl(${Math.random() * 60 + 40}, 100%, 70%)`;
        }
        update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.life -= this.decay;
        }
        draw() {
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    class RingParticle {
        constructor(angle, radius) {
            this.angle = angle;
            this.radius = radius;
            this.yOffset = (Math.random() - 0.5) * 40;
            this.size = Math.random() * 2 + 0.5;
            this.speed = (500 - radius) * 0.00005 + 0.005;
            this.color = Math.random() > 0.5 ? '#A855F7' : '#FFFFFF';
        }
        update() {
            this.angle += this.speed;
        }
        draw(centerX, centerY, tilt) {
            const x = centerX + Math.cos(this.angle) * this.radius;
            const y = centerY + Math.sin(this.angle) * this.radius * tilt + this.yOffset;
            const scale = (Math.sin(this.angle) + 2) / 3;
            ctx.fillStyle = this.color;
            ctx.globalAlpha = scale;
            ctx.beginPath();
            ctx.arc(x, y, this.size * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    function init() {
        resize();
        for (let i = 0; i < 100; i++) particles.push(new Particle());
        resetTargets();
    }

    function resetTargets() {
        targets = [];
        score = 0;
        if (scoreEl) scoreEl.innerText = 0;
        for (let i = 0; i < TOTAL_TARGETS; i++) targets.push(new Target());
    }

    function startFinale() {
        gameState = 'finale';
        uiEl.style.opacity = '0';
        if (sectionEl) sectionEl.classList.remove('cursor-none');

        ringParticles = [];
        for (let i = 0; i < 400; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 100 + 150;
            ringParticles.push(new RingParticle(angle, radius));
        }

        setTimeout(() => {
            finaleEl.classList.add('visible');
            finaleEl.classList.remove('opacity-0', 'scale-90', 'pointer-events-none');
        }, 1000);
    }

    function drawCursor() {
        if (gameState !== 'playing') return;
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'white';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(gMouseX, gMouseY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(gMouseX, gMouseY, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    function animate(time) {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            if (p instanceof ExplosionParticle) {
                p.update();
                if (p.life > 0) p.draw();
            } else {
                p.update();
                p.draw();
            }
        });

        if (particles.length > 200) {
            particles = particles.filter(p => !(p instanceof ExplosionParticle) || p.life > 0);
        }

        if (gameState === 'playing') {
            targets.forEach(t => { t.update(time); t.draw(); });
            drawCursor();
        } else if (gameState === 'finale') {
            const cx = width / 2;
            const cy = height / 2;
            const driftX = (gMouseX - cx) * 0.05;
            const driftY = (gMouseY - cy) * 0.05;

            ringParticles.forEach(p => {
                p.update();
                p.draw(cx + driftX, cy + driftY, 0.4);
            });

            const gradient = ctx.createRadialGradient(cx + driftX, cy + driftY, 10, cx + driftX, cy + driftY, 200);
            gradient.addColorStop(0, 'rgba(168, 85, 247, 0.2)');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }
        requestAnimationFrame(animate);
    }

    if (canvas) {
        init();
        animate(0);
    }
});
