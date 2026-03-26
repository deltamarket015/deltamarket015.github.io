/**
 * ==========================================================================
 * PARTICLE.JS CONFIGURATION (Reactive Bubble/Grab/Repulse)
 * ==========================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    if(window.particlesJS) {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 90, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#ff007f" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.4, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false } },
                "size": { "value": 3, "random": true, "anim": { "enable": false } },
                "line_linked": { "enable": true, "distance": 150, "color": "#ff007f", "opacity": 0.2, "width": 1 },
                "move": { "enable": true, "speed": 1.5, "direction": "none", "random": true, "straight": false, "out_mode": "out", "bounce": false }
            },
            "interactivity": {
                "detect_on": "window", /* Reacts everywhere on the screen */
                "events": {
                    "onhover": { "enable": true, "mode": ["grab", "bubble"] }, /* Draws lines and makes them glow/grow on hover */
                    "onclick": { "enable": true, "mode": "repulse" }, /* Scatters away when clicked or touched */
                    "resize": true
                },
                "modes": {
                    "grab": { "distance": 180, "line_linked": { "opacity": 0.6 } },
                    "bubble": { "distance": 200, "size": 6, "duration": 2, "opacity": 0.8, "speed": 3 },
                    "repulse": { "distance": 250, "duration": 0.4 }, 
                    "push": { "particles_nb": 4 }
                }
            },
            "retina_detect": true
        });
    }
});

/**
 * ==========================================================================
 * CONSTANTS & DATA CONFIGURATION
 * ==========================================================================
 */
const API_ENDPOINT = "https://r-gengpt-api.vercel.app/api/image";

const STYLES =[
    { id: "realistic", name: "Realistic", img: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=150&q=80" },
    { id: "anime", name: "Anime", img: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=150&q=80" },
    { id: "3d", name: "3D Render", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80" },
    { id: "cinematic", name: "Cinematic", img: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=150&q=80" },
    { id: "fantasy", name: "Fantasy", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=150&q=80" },
    { id: "pixel", name: "Pixel Art", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=150&q=80" },
    { id: "digital", name: "Digital Paint", img: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=150&q=80" },
    { id: "portrait", name: "Portrait", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" }
];

const ASPECT_RATIOS =[
    { id: "1:1", label: "Square", class: "ar-1-1" },
    { id: "16:9", label: "Wide", class: "ar-16-9" },
    { id: "9:16", label: "Story", class: "ar-9-16" },
    { id: "4:3", label: "Standard", class: "ar-4-3" },
    { id: "3:4", label: "Portrait", class: "ar-3-4" }
];

const PROMPTS =[
    "A cyberpunk samurai walking in a neon city, 8k, photorealistic",
    "A cute astronaut cat exploring the red sands of Mars, highly detailed",
    "Epic fantasy castle floating in the sky, waterfalls, glowing clouds",
    "A futuristic racing car speeding through a Tokyo-inspired metropolis",
    "Portrait of a mechanical goddess, intricate gears, golden lighting",
    "A serene Japanese garden in autumn, cinematic lighting, 4k",
    "Steampunk airship flying through a dramatic storm, lightning strikes",
    "A magical glowing forest with bioluminescent mushrooms and fairies",
    "Minimalist modern interior design of a living room with ocean view",
    "A retro-futuristic synthwave landscape with a grid and wireframe sun"
];

const LOADING_MESSAGES =[
    "Retuning the neural network...",
    "Painting digital pixels...",
    "Mixing neural colors...",
    "Processing semantic layers...",
    "Synthesizing creative vectors...",
    "Enhancing prompt fidelity...",
    "Generating masterpiece..."
];

/**
 * ==========================================================================
 * UTILITY CLASSES
 * ==========================================================================
 */

class ToastNotification {
    constructor() {
        this.container = document.getElementById('toast-container');
    }

    show(type, title, message, duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconSvg = '';
        if(type === 'success') iconSvg = '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
        else if(type === 'error') iconSvg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
        else if(type === 'warning') iconSvg = '<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
        else iconSvg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

        toast.innerHTML = `
            <div class="toast-icon">${iconSvg}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <svg class="toast-close" viewBox="0 0 24 24" onclick="this.parentElement.remove()"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            <div class="toast-progress" style="animation: progress-shrink ${duration}ms linear forwards;"></div>
        `;

        this.container.appendChild(toast);
        requestAnimationFrame(() => { toast.classList.add('show'); });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }
}

class StorageEngine {
    constructor(key = 'ai_genstudio_history') {
        this.key = key;
        this.data = this._load();
    }

    _load() {
        try {
            const data = localStorage.getItem(this.key);
            return data ? JSON.parse(data) :[];
        } catch (e) { return[]; }
    }

    _save() {
        try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) {}
    }

    addItem(prompt, style, ar, url) {
        const item = { id: Date.now().toString(36) + Math.random().toString(36).substr(2), prompt, style, ar, url, timestamp: Date.now() };
        this.data.unshift(item);
        this._save();
        return item;
    }

    getAll() { return this.data; }
    clear() { this.data =[]; this._save(); }

    getGroupedHistory() {
        const groups = { today: [], yesterday: [], older:[] };
        const now = new Date();
        const todayStr = now.toDateString();
        const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        this.data.forEach(item => {
            const itemDate = new Date(item.timestamp).toDateString();
            if (itemDate === todayStr) groups.today.push(item);
            else if (itemDate === yesterdayStr) groups.yesterday.push(item);
            else groups.older.push(item);
        });
        return groups;
    }
}

class APIHandler {
    async generate({ prompt, style, ar }) {
        try {
            const query = new URLSearchParams({ prompt, style, ar });
            const url = `${API_ENDPOINT}?${query.toString()}`;
            
            const response = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const json = await response.json();
            if (json.status === 'success' && json.data && json.data.url) return json.data.url;
            else throw new Error('Invalid API response format');
        } catch (error) { throw error; }
    }
}

class ModalManager {
    constructor(confirmCallback) {
        this.overlay = document.getElementById('modal-clear');
        this.btnCancel = document.getElementById('modal-cancel');
        this.btnConfirm = document.getElementById('modal-confirm');
        this.confirmCallback = confirmCallback;
        this._bindEvents();
    }

    _bindEvents() {
        this.btnCancel.addEventListener('click', () => this.hide());
        this.btnConfirm.addEventListener('click', () => { this.confirmCallback(); this.hide(); });
        this.overlay.addEventListener('click', (e) => { if (e.target === this.overlay) this.hide(); });
    }
    show() { this.overlay.classList.add('active'); }
    hide() { this.overlay.classList.remove('active'); }
}

class Lightbox {
    constructor() {
        this.overlay = document.getElementById('lightbox');
        this.img = document.getElementById('lightbox-img');
        this.btnClose = document.getElementById('lightbox-close');
        this.btnZoomIn = document.getElementById('lightbox-zoom-in');
        this.btnZoomOut = document.getElementById('lightbox-zoom-out');
        this.btnReset = document.getElementById('lightbox-zoom-reset');
        this.content = document.getElementById('lightbox-content');

        this.scale = 1; this.panX = 0; this.panY = 0; this.isDragging = false;
        this.startX = 0; this.startY = 0;
        this._bindEvents();
    }

    _bindEvents() {
        this.btnClose.addEventListener('click', () => this.close());
        this.btnZoomIn.addEventListener('click', () => this.zoom(0.5));
        this.btnZoomOut.addEventListener('click', () => this.zoom(-0.5));
        this.btnReset.addEventListener('click', () => this.resetTransform());

        this.img.addEventListener('pointerdown', (e) => {
            if (this.scale > 1) {
                this.isDragging = true;
                this.startX = e.clientX - this.panX;
                this.startY = e.clientY - this.panY;
                this.img.style.transition = 'none';
            }
        });

        window.addEventListener('pointermove', (e) => {
            if (!this.isDragging) return;
            this.panX = e.clientX - this.startX;
            this.panY = e.clientY - this.startY;
            this.applyTransform();
        });

        window.addEventListener('pointerup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.img.style.transition = 'transform 0.2s ease-out';
            }
        });

        this.content.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.2 : 0.2;
            this.zoom(delta);
        });
    }

    open(src) { this.img.src = src; this.resetTransform(); this.overlay.classList.add('active'); }
    close() { this.overlay.classList.remove('active'); }
    zoom(delta) {
        this.scale = Math.max(1, Math.min(this.scale + delta, 5));
        if (this.scale === 1) { this.panX = 0; this.panY = 0; }
        this.applyTransform();
    }
    resetTransform() { this.scale = 1; this.panX = 0; this.panY = 0; this.applyTransform(); }
    applyTransform() { this.img.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`; }
}

/**
 * ==========================================================================
 * MAIN APPLICATION & UI MANAGER
 * ==========================================================================
 */
class App {
    constructor() {
        this.toast = new ToastNotification();
        this.storage = new StorageEngine();
        this.api = new APIHandler();
        this.lightbox = new Lightbox();
        this.modal = new ModalManager(() => this.clearHistory());

        this.currentStyle = STYLES[0].id;
        this.currentAR = ASPECT_RATIOS[0].id;
        this.currentImageUrl = null;
        this.isGenerating = false;

        this.ui = {
            promptInput: document.getElementById('prompt-input'),
            charCounter: document.getElementById('char-counter'),
            btnClear: document.getElementById('btn-clear-prompt'),
            btnSurprise: document.getElementById('btn-surprise'),
            styleGrid: document.getElementById('style-grid'),
            arGrid: document.getElementById('ar-grid'),
            btnGenerate: document.getElementById('btn-generate'),
            
            artboardPanel: document.getElementById('artboard-panel'),
            emptyState: document.getElementById('empty-state'),
            generatedImage: document.getElementById('generated-image'),
            loadingOverlay: document.getElementById('loading-overlay'),
            loadingMsg: document.getElementById('loading-msg'),
            progressBar: document.getElementById('progress-bar'),
            progressPercent: document.getElementById('progress-percent'),
            
            imageTools: document.getElementById('image-tools'),
            btnDownload: document.getElementById('btn-download'),
            btnCopy: document.getElementById('btn-copy'),
            btnFullscreen: document.getElementById('btn-fullscreen'),
            filterSelect: document.getElementById('filter-select'),
            
            sidebar: document.getElementById('sidebar'),
            historyContainer: document.getElementById('history-container'),
            btnClearHistory: document.getElementById('clear-history-btn'),
            
            mobileNavTabs: document.querySelectorAll('.nav-tab')
        };

        this.init();
    }

    init() {
        this.renderStyleSelector();
        this.renderARSelector();
        this.bindEvents();
        this.renderHistory();
    }

    renderStyleSelector() {
        this.ui.styleGrid.innerHTML = '';
        STYLES.forEach(style => {
            const card = document.createElement('div');
            card.className = `style-card ${this.currentStyle === style.id ? 'active' : ''}`;
            card.innerHTML = `<img src="${style.img}" alt="${style.name}" loading="lazy"><div class="overlay">${style.name}</div>`;
            card.addEventListener('click', () => {
                this.currentStyle = style.id;
                document.querySelectorAll('.style-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
            this.ui.styleGrid.appendChild(card);
        });
    }

    renderARSelector() {
        this.ui.arGrid.innerHTML = '';
        ASPECT_RATIOS.forEach(ar => {
            const card = document.createElement('div');
            card.className = `ar-card ${this.currentAR === ar.id ? 'active' : ''}`;
            card.innerHTML = `<div class="ar-icon ${ar.class}"></div><span class="ar-label">${ar.label}</span>`;
            card.addEventListener('click', () => {
                this.currentAR = ar.id;
                document.querySelectorAll('.ar-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
            this.ui.arGrid.appendChild(card);
        });
    }

    bindEvents() {
        this.ui.promptInput.addEventListener('input', (e) => {
            const val = e.target.value;
            if(val.length > 500) e.target.value = val.substring(0, 500);
            this.ui.charCounter.textContent = `${e.target.value.length} / 500`;
            e.target.style.height = 'auto';
            e.target.style.height = (e.target.scrollHeight) + 'px';
        });

        this.ui.btnClear.addEventListener('click', () => {
            this.ui.promptInput.value = '';
            this.ui.promptInput.dispatchEvent(new Event('input'));
            this.ui.promptInput.focus();
        });

        this.ui.btnSurprise.addEventListener('click', () => {
            this.ui.promptInput.value = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
            this.ui.promptInput.dispatchEvent(new Event('input'));
        });

        this.ui.btnGenerate.addEventListener('click', () => this.handleGenerate());

        this.ui.btnFullscreen.addEventListener('click', () => { if (this.currentImageUrl) this.lightbox.open(this.currentImageUrl); });
        this.ui.btnCopy.addEventListener('click', () => {
            if (this.currentImageUrl) {
                navigator.clipboard.writeText(this.currentImageUrl)
                    .then(() => this.toast.show('success', 'Copied', 'Image URL copied to clipboard.'))
                    .catch(() => this.toast.show('error', 'Error', 'Failed to copy URL.'));
            }
        });

        this.ui.btnDownload.addEventListener('click', () => this.downloadGeneratedImage());
        this.ui.filterSelect.addEventListener('change', (e) => this.applyCSSFilter(e.target.value));
        this.ui.btnClearHistory.addEventListener('click', () => this.modal.show());

        this.ui.mobileNavTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                if(tab.id === 'nav-styles-scroll') {
                    this.switchMobileView('control-panel');
                    document.getElementById('style-grid').scrollIntoView({ behavior: 'smooth' });
                    return;
                }
                const targetId = tab.getAttribute('data-target');
                if (targetId) this.switchMobileView(targetId);
            });
        });
    }

    switchMobileView(targetId) {
        if (window.innerWidth >= 860) return;

        this.ui.mobileNavTabs.forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.nav-tab[data-target="${targetId}"]`);
        if(activeTab) activeTab.classList.add('active');

        if (targetId === 'sidebar') {
            this.ui.sidebar.classList.add('active');
        } else {
            this.ui.sidebar.classList.remove('active');
            if (targetId === 'control-panel') {
                document.getElementById('control-panel').style.display = 'flex';
                document.getElementById('artboard-panel').style.display = 'none';
            } else if (targetId === 'artboard-panel') {
                document.getElementById('control-panel').style.display = 'none';
                document.getElementById('artboard-panel').style.display = 'flex';
            }
        }
    }

    async handleGenerate() {
        const prompt = this.ui.promptInput.value.trim();
        if (!prompt) {
            this.toast.show('warning', 'Missing Prompt', 'Please enter a description for your image.');
            this.ui.promptInput.focus();
            return;
        }
        if (this.isGenerating) return;

        this.isGenerating = true;
        this.ui.btnGenerate.disabled = true;
        this.ui.btnGenerate.innerHTML = `<svg viewBox="0 0 24 24" class="loader-ring" style="width:20px;height:20px;border-width:2px;margin:0;box-shadow:none;"><circle cx="12" cy="12" r="10"></circle></svg> Generating...`;

        const artboardTab = document.getElementById('tab-artboard');
        artboardTab.style.display = 'flex';
        this.switchMobileView('artboard-panel');

        this.ui.emptyState.style.display = 'none';
        this.ui.generatedImage.style.display = 'none';
        this.ui.imageTools.classList.remove('active');
        this.ui.filterSelect.value = 'none';
        this.applyCSSFilter('none');
        
        this.startLoadingSimulation();

        try {
            const url = await this.api.generate({ prompt, style: this.currentStyle, ar: this.currentAR });
            await this.preloadImage(url);
            this.finishGeneration(url, prompt);
        } catch (error) {
            this.toast.show('error', 'Generation Failed', error.message || 'Something went wrong. Please try again.');
            this.resetLoadingUI();
            if (!this.currentImageUrl) this.ui.emptyState.style.display = 'flex';
        }
    }

    startLoadingSimulation() {
        this.ui.loadingOverlay.classList.add('active');
        let progress = 0;
        this.progressInterval = setInterval(() => {
            const remaining = 99 - progress;
            progress += remaining * 0.05;
            if (progress > 99) progress = 99;
            this.ui.progressBar.style.width = `${progress}%`;
            this.ui.progressPercent.textContent = `${Math.floor(progress)}%`;
        }, 100);

        let msgIdx = 0;
        this.msgInterval = setInterval(() => {
            msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
            this.ui.loadingMsg.textContent = LOADING_MESSAGES[msgIdx];
        }, 2000);
    }

    stopLoadingSimulation() {
        clearInterval(this.progressInterval);
        clearInterval(this.msgInterval);
        this.ui.progressBar.style.width = `100%`;
        this.ui.progressPercent.textContent = `100%`;
        setTimeout(() => {
            this.ui.loadingOverlay.classList.remove('active');
            setTimeout(() => {
                this.ui.progressBar.style.width = `0%`;
                this.ui.progressPercent.textContent = `0%`;
                this.ui.loadingMsg.textContent = LOADING_MESSAGES[0];
            }, 300);
        }, 500);
    }

    resetLoadingUI() {
        this.stopLoadingSimulation();
        this.isGenerating = false;
        this.ui.btnGenerate.disabled = false;
        this.ui.btnGenerate.innerHTML = `<svg viewBox="0 0 24 24" style="width:24px; height:24px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Generate Image <div class="shimmer"></div>`;
    }

    preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("Failed to load generated image."));
            img.src = url;
        });
    }

    finishGeneration(url, prompt) {
        this.currentImageUrl = url;
        this.ui.generatedImage.src = url;
        this.ui.generatedImage.style.display = 'block';
        this.ui.imageTools.classList.add('active');
        
        this.resetLoadingUI();
        this.toast.show('success', 'Creation Complete', 'Your masterpiece is ready!');

        this.storage.addItem(prompt, this.currentStyle, this.currentAR, url);
        this.renderHistory();
    }

    renderHistory() {
        const groups = this.storage.getGroupedHistory();
        this.ui.historyContainer.innerHTML = '';
        let hasHistory = false;

        const renderGroup = (title, items) => {
            if (items.length === 0) return;
            hasHistory = true;
            
            const groupTitle = document.createElement('div');
            groupTitle.className = 'history-group-title';
            groupTitle.textContent = title;
            
            const list = document.createElement('div');
            list.className = 'history-list';

            items.forEach(item => {
                const el = document.createElement('div');
                el.className = 'history-item';
                el.innerHTML = `
                    <img src="${item.url}" class="history-thumb" alt="thumb" loading="lazy">
                    <div class="history-info">
                        <div class="history-prompt">${item.prompt}</div>
                        <div class="history-meta">
                            <span>${STYLES.find(s => s.id === item.style)?.name || item.style}</span>
                            <span>${item.ar}</span>
                        </div>
                    </div>
                `;
                el.addEventListener('click', () => this.restoreHistoryItem(item));
                list.appendChild(el);
            });

            this.ui.historyContainer.appendChild(groupTitle);
            this.ui.historyContainer.appendChild(list);
        };

        renderGroup('Today', groups.today);
        renderGroup('Yesterday', groups.yesterday);
        renderGroup('Older', groups.older);

        if (!hasHistory) {
            this.ui.historyContainer.innerHTML = `<div style="text-align:center; padding: 40px 20px; color: var(--text-muted); font-size: 0.85rem;"><svg viewBox="0 0 24 24" style="width:32px; height:32px; opacity: 0.5; margin-bottom: 12px;"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg><br>No history yet. Start generating!</div>`;
            this.ui.btnClearHistory.style.display = 'none';
        } else {
            this.ui.btnClearHistory.style.display = 'flex';
        }
    }

    restoreHistoryItem(item) {
        this.ui.promptInput.value = item.prompt;
        this.ui.promptInput.dispatchEvent(new Event('input'));
        
        this.currentStyle = item.style; this.renderStyleSelector();
        this.currentAR = item.ar; this.renderARSelector();

        this.currentImageUrl = item.url;
        this.ui.emptyState.style.display = 'none';
        this.ui.generatedImage.src = item.url;
        this.ui.generatedImage.style.display = 'block';
        this.ui.imageTools.classList.add('active');
        
        this.applyCSSFilter('none');
        this.ui.filterSelect.value = 'none';

        document.getElementById('tab-artboard').style.display = 'flex';
        this.switchMobileView('artboard-panel');
        this.toast.show('info', 'Restored', 'Workspace updated from history.');
    }

    clearHistory() {
        this.storage.clear();
        this.renderHistory();
        this.toast.show('success', 'Cleared', 'History has been permanently deleted.');
    }

    async downloadGeneratedImage() {
        if (!this.currentImageUrl) return;
        const filter = this.ui.filterSelect.value;
        try {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = this.currentImageUrl;
            await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });

            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (filter !== 'none') ctx.filter = this.getFilterString(filter);

            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `GenStudio_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.toast.show('success', 'Downloaded', 'Image saved successfully.');
        } catch (e) {
            this.toast.show('warning', 'Filter Ignored', 'Saving original image due to security restrictions.');
            const link = document.createElement('a');
            link.href = this.currentImageUrl; link.target = '_blank';
            link.download = `GenStudio_${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click(); document.body.removeChild(link);
        }
    }

    getFilterString(filterType) {
        switch(filterType) {
            case 'grayscale': return 'grayscale(100%)';
            case 'sepia': return 'sepia(100%)';
            case 'contrast': return 'contrast(150%)';
            case 'brightness': return 'brightness(120%)';
            default: return 'none';
        }
    }

    applyCSSFilter(filterType) { this.ui.generatedImage.style.filter = this.getFilterString(filterType); }
}

document.addEventListener('DOMContentLoaded', () => { window.GenStudioApp = new App(); });