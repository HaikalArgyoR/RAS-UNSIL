class AquariumScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.offsetWidth;
        this.height = canvas.offsetHeight;
        canvas.width = this.width;
        canvas.height = this.height;
        this.particles = [];
        this.fishes = [];
        this.time = 0;
        this.initParticles();
        this.initFishes();
        this.animate();
        window.addEventListener('resize', () => this.handleResize());
    }

    initParticles() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 2,
                speedY: Math.random() * 0.5 + 0.2,
                opacity: Math.random() * 0.3 + 0.1,
                jitter: Math.random() * 2 - 1
            });
        }
    }

    initFishes() {
        this.fishes = [
            { x: 100, y: 100, size: 30, speed: 2, direction: 1, bodyColor: '#06b6d4', finOffset: 0 },
            { x: 300, y: 250, size: 25, speed: 1.5, direction: -1, bodyColor: '#22d3ee', finOffset: Math.PI / 2 },
            { x: 500, y: 150, size: 28, speed: 1.8, direction: 1, bodyColor: '#34d399', finOffset: Math.PI }
        ];
    }

    drawFish(fish) {
        const { x, y, size, direction, bodyColor, finOffset } = fish;
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(direction, 1);
        this.ctx.fillStyle = bodyColor;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(size * 0.3, -size * 0.2, size * 0.15, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#0a0e27';
        this.ctx.beginPath();
        this.ctx.arc(size * 0.35, -size * 0.2, size * 0.08, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = bodyColor;
        this.ctx.lineWidth = size * 0.15;
        this.ctx.beginPath();
        this.ctx.moveTo(-size * 0.5, 0);
        const tailWave = Math.sin(this.time * 0.1 + finOffset) * size * 0.3;
        this.ctx.quadraticCurveTo(-size * 0.7, tailWave, -size * 0.9, 0);
        this.ctx.stroke();
        this.ctx.fillStyle = bodyColor;
        this.ctx.globalAlpha = 0.6;
        this.ctx.beginPath();
        const finOffset2 = Math.sin(this.time * 0.15 + finOffset) * size * 0.2;
        this.ctx.moveTo(0, -size * 0.4);
        this.ctx.lineTo(size * 0.3, -size * 0.8 + finOffset2);
        this.ctx.lineTo(0, 0);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
        this.ctx.restore();
    }

    updateFishes() {
        this.fishes.forEach(fish => {
            fish.x += fish.speed * fish.direction;
            if (fish.direction > 0 && fish.x > this.width + fish.size) fish.x = -fish.size;
            else if (fish.direction < 0 && fish.x < -fish.size) fish.x = this.width + fish.size;
            fish.y += Math.sin(this.time * 0.02 + fish.x * 0.01) * 0.5;
            fish.y = Math.max(fish.size, Math.min(this.height - fish.size, fish.y));
        });
    }

    drawBubbles() {
        this.particles.forEach(p => {
            p.y -= p.speedY;
            p.x += p.jitter * 0.05;
            if (p.y < 0) { p.y = this.height; p.x = Math.random() * this.width; }
            this.ctx.fillStyle = `rgba(34, 211, 238, ${p.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, 'rgba(15, 26, 58, 0.6)');
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.1)');
        gradient.addColorStop(1, 'rgba(10, 14, 39, 0.8)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.globalAlpha = 0.05;
        for (let i = 0; i < 3; i++) {
            this.ctx.fillStyle = '#06b6d4';
            this.ctx.beginPath();
            this.ctx.arc(
                this.width / 2 + Math.sin(this.time * 0.01 + i) * 100,
                this.height / 2 + Math.cos(this.time * 0.01 + i) * 100,
                150 + Math.sin(this.time * 0.02 + i) * 50,
                0, Math.PI * 2
            );
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
    }

    animate() {
        this.drawBackground();
        this.drawBubbles();
        this.updateFishes();
        this.fishes.forEach(fish => this.drawFish(fish));
        this.time++;
        requestAnimationFrame(() => this.animate());
    }

    handleResize() {
        this.width = this.canvas.offsetWidth;
        this.height = this.canvas.offsetHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
}

// Expose init function
window.initAquarium = function() {
    const canvas = document.getElementById('aquariumCanvas');
    if (canvas) new AquariumScene(canvas);
};