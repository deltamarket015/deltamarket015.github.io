/**
 * Smooth Background Particle System
 */
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particles-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 50; // Optimized for performance across devices
        this.colors = ['#ff007f', '#ff3399', '#ffb3d9']; // Neon Pink variations

        this.init();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    init() {
        this.resize();
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: Math.random() * 1 - 0.5,
            speedY: Math.random() * 1 - 0.5,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            opacity: Math.random() * 0.5 + 0.1
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            
            // Move
            p.x += p.speedX;
            p.y += p.speedY;

            // Bounce off edges smoothly
            if (p.x < 0 || p.x > this.canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.speedY *= -1;

            // Draw
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.opacity;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;
            this.ctx.fill();
        }

        // Draw connecting lines if close
        this.ctx.globalAlpha = 0.05;
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i; j < this.particles.length; j++) {
                let dx = this.particles[i].x - this.particles[j].x;
                let dy = this.particles[i].y - this.particles[j].y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = this.particles[i].color;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

/**
 * AllDown - Core Logic
 */
class App {
    constructor() {
        // DOM Elements
        this.dom = {
            input: document.getElementById('urlInput'),
            btn: document.getElementById('searchBtn'),
            pasteBtn: document.getElementById('pasteBtn'),
            clearBtn: document.getElementById('clearBtn'),
            loader: document.getElementById('loader'),
            resultArea: document.getElementById('result-area'),
            resThumb: document.getElementById('resThumb'),
            resTitle: document.getElementById('resTitle'),
            resDuration: document.getElementById('resDuration'),
            videoList: document.getElementById('tab-video'),
            audioList: document.getElementById('tab-audio'),
            tabBtns: document.querySelectorAll('.tab-btn'),
            historyList: document.getElementById('historyList'),
            clearHistoryBtn: document.getElementById('clearHistory'),
            settingsModal: document.getElementById('settingsModal'),
            settingsBtn: document.getElementById('settingsBtn'),
            historyToggle: document.getElementById('historyToggle')
        };

        // State
        this.state = {
            isLoading: false,
            currentData: null,
            saveHistory: localStorage.getItem('saveHistory') !== 'false',
            history: JSON.parse(localStorage.getItem('dl_history') || '[]')
        };

        this.init();
    }

    init() {
        this.renderHistory();
        this.bindEvents();
    }

    bindEvents() {
        // Search Actions
        this.dom.btn.addEventListener('click', () => this.fetchData());
        this.dom.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.fetchData();
        });
        
        // Input Controls
        this.dom.pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                this.dom.input.value = text;
                this.showToast('Link pasted', 'success');
            } catch (err) {
                this.showToast('Clipboard permission denied', 'error');
            }
        });
        
        this.dom.clearBtn.addEventListener('click', () => {
            this.dom.input.value = '';
            this.dom.input.focus();
        });

        // Settings
        this.dom.settingsBtn.addEventListener('click', () => {
            this.dom.settingsModal.classList.add('active');
        });
        
        this.dom.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.dom.settingsModal) {
                this.dom.settingsModal.classList.remove('active');
            }
        });

        this.dom.historyToggle.addEventListener('change', (e) => {
            this.state.saveHistory = e.target.checked;
            localStorage.setItem('saveHistory', this.state.saveHistory);
        });

        // History
        this.dom.clearHistoryBtn.addEventListener('click', () => {
            this.state.history = [];
            this.saveHistory();
            this.renderHistory();
        });
    }

    async fetchData() {
        const url = this.dom.input.value.trim();
        
        if (!url) {
            this.showToast('Please enter a valid URL', 'error');
            return;
        }
        if (!url.startsWith('http')) {
            this.showToast('URL must start with http:// or https://', 'error');
            return;
        }

        this.setLoading(true);
        this.dom.resultArea.style.display = 'none';

        try {
            const apiUrl = `https://r-gengpt-api.vercel.app/api/video/download?url=${encodeURIComponent(url)}`;
            const response = await fetch(apiUrl);
            const json = await response.json();

            const data = json.data || json; 
            
            if (!data) throw new Error('No data received from server');
            if (data.statusCode && data.statusCode !== 200) throw new Error(data.message || 'API Error');
            if (!data.medias && !data.formats) throw new Error('No video formats found');

            this.state.currentData = data;
            this.renderResult(data);
            this.addToHistory(data);
            this.showToast('Video processed successfully', 'success');

        } catch (error) {
            console.error(error);
            this.showToast(error.message || 'Failed to fetch video. Please try again.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(bool) {
        this.state.isLoading = bool;
        this.dom.btn.disabled = bool;
        
        if (bool) {
            this.dom.btn.innerHTML = '<div class="spinner"></div>';
            this.dom.loader.classList.add('active');
        } else {
            this.dom.btn.innerHTML = '<span>Download</span>';
            this.dom.loader.classList.remove('active');
        }
    }

    renderResult(data) {
        this.dom.resTitle.textContent = data.title || 'Unknown Video';
        this.dom.resThumb.src = data.thumbnail || '';
        this.dom.resDuration.textContent = this.formatTime(data.duration);
        
        this.dom.videoList.innerHTML = '';
        this.dom.audioList.innerHTML = '';

        const formats = data.medias || data.formats || [];
        
        formats.forEach((item) => {
            const isVideo = item.type === 'video' || item.mimeType?.includes('video');
            const quality = item.quality || (item.height ? `${item.height}p` : 'HQ');
            const size = item.size ? ` (${item.size})` : '';
            
            const html = `
                <div class="format-item">
                    <div class="format-info">
                        <h4>${quality} ${size}</h4>
                        <span>${item.ext?.toUpperCase() || 'MP4'}</span>
                    </div>
                    <div class="format-actions">
                        <a href="${item.url}" target="_blank" class="dl-btn">
                            Download
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                            </svg>
                        </a>
                    </div>
                </div>
            `;

            if (isVideo) {
                this.dom.videoList.insertAdjacentHTML('beforeend', html);
            } else {
                this.dom.audioList.insertAdjacentHTML('beforeend', html);
            }
        });

        this.dom.resultArea.style.display = 'block';
        this.switchTab('video');
    }

    switchTab(type) {
        this.dom.tabBtns.forEach(btn => btn.classList.remove('active'));
        if (type === 'video') {
            this.dom.tabBtns[0].classList.add('active');
            this.dom.videoList.style.display = 'flex';
            this.dom.audioList.style.display = 'none';
        } else {
            this.dom.tabBtns[1].classList.add('active');
            this.dom.videoList.style.display = 'none';
            this.dom.audioList.style.display = 'flex';
        }
    }

    addToHistory(data) {
        if (!this.state.saveHistory) return;
        
        this.state.history = this.state.history.filter(item => item.thumbnail !== data.thumbnail);
        
        const newItem = {
            title: data.title,
            thumbnail: data.thumbnail,
            url: this.dom.input.value,
            time: new Date().getTime()
        };

        this.state.history.unshift(newItem);
        if (this.state.history.length > 8) this.state.history.pop();
        
        this.saveHistory();
        this.renderHistory();
    }

    saveHistory() {
        localStorage.setItem('dl_history', JSON.stringify(this.state.history));
    }

    renderHistory() {
        if (this.state.history.length === 0) {
            this.dom.historyList.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:20px;">No recent downloads</div>';
            return;
        }

        this.dom.historyList.innerHTML = this.state.history.map(item => `
            <div class="history-item" onclick="app.loadFromHistory('${item.url}')">
                <img src="${item.thumbnail}" class="h-thumb" onerror="this.src='https://picsum.photos/seed/error/50/50'">
                <div class="h-info">
                    <div class="h-title">${item.title}</div>
                    <div class="h-time">${this.timeSince(item.time)}</div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="var(--text-muted)" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                </svg>
            </div>
        `).join('');
    }

    loadFromHistory(url) {
        this.dom.input.value = url;
        this.fetchData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    formatTime(seconds) {
        if (!seconds) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    timeSince(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return "Just now";
    }

    showToast(msg, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = type === 'success' 
            ? '<svg width="20" height="20" fill="var(--primary)" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>'
            : '<svg width="20" height="20" fill="var(--danger)" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>';

        toast.innerHTML = `${icon}<span>${msg}</span>`;
        
        const container = document.getElementById('toast-container');
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize Application and Particles
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
    window.app = new App();
});