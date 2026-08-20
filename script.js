document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Mobile Menu Toggle
    // ----------------------------------------------------
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            if (navLinks.classList.contains('show')) {
                menuToggle.innerHTML = '&times;';
            } else {
                menuToggle.innerHTML = '&#9776;';
            }
        });
    }

    // ----------------------------------------------------
    // 2. Image Lightbox
    // ----------------------------------------------------
    // Create lightbox DOM elements
    const lightboxOverlay = document.createElement('div');
    lightboxOverlay.classList.add('lightbox-overlay');
    
    const lightboxImg = document.createElement('img');
    lightboxImg.classList.add('lightbox-img');
    
    const lightboxClose = document.createElement('button');
    lightboxClose.classList.add('lightbox-close');
    lightboxClose.innerHTML = '&times;';

    lightboxOverlay.appendChild(lightboxImg);
    lightboxOverlay.appendChild(lightboxClose);
    document.body.appendChild(lightboxOverlay);

    // Open lightbox on click
    const interactiveImages = document.querySelectorAll('.showcase-img, .gallery-img, .tech-img, .hero-screenshot');
    interactiveImages.forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightboxOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Lock scroll
        });
    });

    // Close lightbox
    const closeLightbox = () => {
        lightboxOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
        setTimeout(() => { lightboxImg.src = ''; }, 200); // Clear after animation
    };

    lightboxOverlay.addEventListener('click', (e) => {
        if (e.target !== lightboxImg) {
            closeLightbox();
        }
    });

    lightboxClose.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxOverlay.classList.contains('active')) {
            closeLightbox();
        }
    });

    // ----------------------------------------------------
    // 3. Golden Neural Particles Background
    // ----------------------------------------------------
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };

    // Optimize for mobile: Reduce count or disable if very small screen
    const isMobile = window.innerWidth <= 768;
    const particleCount = isMobile ? 30 : 80;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
        if (isMobile) return; // Disable mouse interaction on mobile
        mouse.x = e.x;
        mouse.y = e.y;
    });
    
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2.2 + 0.8; // slightly larger dots
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
            // Golden color — noticeably visible but still refined
            this.color = `rgba(212, 175, 55, ${Math.random() * 0.35 + 0.18})`;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }

        update() {
            // Very slow drift
            this.baseX += (Math.random() - 0.5) * 0.2;
            this.baseY += (Math.random() - 0.5) * 0.2;

            // Keep in bounds
            if (this.baseX > width) this.baseX = 0;
            if (this.baseX < 0) this.baseX = width;
            if (this.baseY > height) this.baseY = 0;
            if (this.baseY < 0) this.baseY = height;

            if (mouse.x != null && !isMobile) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                if (distance < mouse.radius) {
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        this.x -= dx / 20;
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        this.y -= dy / 20;
                    }
                }
            } else {
                this.x = this.baseX;
                this.y = this.baseY;
            }
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        let maxDistance = isMobile ? 80 : 120;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    let opacityValue = 1 - (distance / maxDistance);
                    // Golden lines — visible, still elegant
                    ctx.strokeStyle = `rgba(212, 175, 55, ${opacityValue * 0.22})`;
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        connectParticles();
        requestAnimationFrame(animate);
    }

    initParticles();
    animate();
});
