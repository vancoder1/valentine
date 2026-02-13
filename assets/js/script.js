document.addEventListener('DOMContentLoaded', () => {
    // === 1. Time Together Counter ===
    // Start Date: August 10, 2025, 21:58 MDT
    // MDT is UTC-6. So 21:58 MDT is 03:58 UTC on August 11, 2025.
    // However, to be safe across timezones, we can parse the string directly or use specific UTC.
    // Let's use the layout: Year, Month, Day, Hour, Minute.
    // Month is 0-indexed in JS Date (0 = Jan, 7 = Aug).

    // 21:58 is 9:58 PM.
    const startDate = new Date('August 10, 2025 21:58:00');

    function updateCounter() {
        const now = new Date();
        const diff = now - startDate;

        if (diff < 0) {
            // Future date case (unlikely but good to handle)
            return;
        }

        const oneSecond = 1000;
        const oneMinute = oneSecond * 60;
        const oneHour = oneMinute * 60;
        const oneDay = oneHour * 24;
        const oneYear = oneDay * 365.25; // Approximate

        const years = Math.floor(diff / oneYear);
        const days = Math.floor((diff % oneYear) / oneDay);
        const hours = Math.floor((diff % oneDay) / oneHour);
        const minutes = Math.floor((diff % oneHour) / oneMinute);
        const seconds = Math.floor((diff % oneMinute) / oneSecond);

        document.getElementById('years').innerText = years;
        document.getElementById('days').innerText = days;
        document.getElementById('hours').innerText = hours;
        document.getElementById('minutes').innerText = minutes;
        document.getElementById('seconds').innerText = seconds;
    }

    setInterval(updateCounter, 1000);
    updateCounter(); // Run immediately

    // === 2. Scroll Reveal & Hero Animation ===
    // Hero Reveal
    setTimeout(() => {
        const heroContent = document.getElementById('hero-content');
        heroContent.classList.remove('translate-y-10', 'opacity-0');
    }, 500);

    // Scroll Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.15
    });

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
        observer.observe(el);
    });

    // === 3. 3D Gift Box Interaction ===
    const giftBox = document.getElementById('gift-box');
    const giftContainer = document.querySelector('.gift-container');

    giftBox.addEventListener('click', () => {
        if (!giftContainer.classList.contains('open')) {
            giftContainer.classList.add('open');
            fireConfetti();
        }
    });

    // === 4. Confetti Logic (Reused & Enhanced) ===
    function fireConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#6A1B9A', '#9C4DCC', '#E0E0E0', '#FFFFFF', '#FF69B4'];

        for (let i = 0; i < 400; i++) {
            particles.push({
                x: canvas.width / 2, // Start from center (behind the box approx)
                y: canvas.height / 2 + 100,
                r: Math.random() * 10 + 5,
                dx: Math.random() * 20 - 10,
                dy: Math.random() * -20 - 5, // Explode upwards
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 150,
                gravity: 0.1
            });
        }

        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, index) => {
                p.x += p.dx;
                p.y += p.dy;
                p.dy += p.gravity;
                p.life--;
                p.r = Math.max(0, p.r - 0.05);

                drawHeart(ctx, p.x, p.y, p.r, p.color);

                if (p.life <= 0) {
                    particles.splice(index, 1);
                }
            });
        }

        animate();
    }

    function drawHeart(ctx, x, y, size, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-size / 2, -size / 2, -size, size / 3, 0, size);
        ctx.bezierCurveTo(size, size / 3, size / 2, -size / 2, 0, 0);
        ctx.fill();
        ctx.restore();
    }
});
