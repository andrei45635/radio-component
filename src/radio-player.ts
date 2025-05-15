import {LitElement, html, css} from 'lit';
import {customElement, property, state} from "lit/decorators.js";

interface Station {
    name: string;
    url: string;
    logo?: string;
}

@customElement('radio-player')
export class RadioPlayer extends LitElement {
    @property({type: Array}) stations: Station[] = [];
    @property({
        type: String,
        reflect: true
    }) theme: 'light' | 'dark' | 'neon' | 'cyberpunk' = 'light';

    @state() private selectedStation?: Station;
    @state() private playing = false;
    @state() private loading = false;
    @state() private muted = false;
    @state() private currentTrack = 'Unknown';
    @state() private filterText = '';
    @state() private audioInitialized = false;
    @state() private audioError: string | null = null;

    private audio?: HTMLAudioElement;
    private visualizerActive = false;

    static styles = css`
        *, *::before, *::after {
            box-sizing: border-box;
        }
        
        :host {
            display: block;
            width: 100%;
            max-width: 400px;
            margin: auto;
            padding: 1rem;
            border-radius: 12px;
            text-align: center;
            transition: background 0.3s, color 0.3s;
            font-family: Arial, sans-serif;
        }

        :host([theme="light"]) {
            background: #f9f9f9;
            color: #000;
            border: 2px solid #ccc;
            --button-bg: #fff;
            --button-text: #000;
            --input-bg: #fff;
            --input-border: #ccc;
        }

        :host([theme="dark"]) {
            background: #121212;
            color: #eee;
            border: 2px solid #333;
            --button-bg: #333;
            --button-text: #fff;
            --input-bg: #222;
            --input-border: #444;
        }

        :host([theme="neon"]) {
            background: #0f0f0f;
            color: #39ff14;
            border: 2px solid #39ff14;
            box-shadow: 0 0 10px #39ff14;
            --button-bg: #0a0a0a;
            --button-text: #39ff14;
            --input-bg: #0a0a0a;
            --input-border: #39ff14;
        }

        :host([theme="cyberpunk"]) {
            background: #1a1a2e;
            color: #ff00c8;
            border: 2px solid #ff00c8;
            box-shadow: 0 0 12px #ff00c8;
            --button-bg: #10101c;
            --button-text: #ff00c8;
            --input-bg: #10101c;
            --input-border: #ff00c8;
        }

        .container {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        h2, h3 {
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        h2 {
            font-size: 1.4rem;
            margin-bottom: 1rem;
        }

        h3 {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
        }

        .play-button, .mute-button {
            width: 60px;
            height: 60px;
            background: none;
            border: 2px solid currentColor;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            margin: 1rem auto;
            transition: background 0.3s, transform 0.3s;
        }

        .play-button:hover, .mute-button:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: scale(1.1);
        }

        .icon {
            width: 24px;
            height: 24px;
            transition: all 0.3s ease;
        }

        .play-icon {
            width: 0;
            height: 0;
            border-top: 12px solid transparent;
            border-bottom: 12px solid transparent;
            border-left: 20px solid currentColor;
        }

        .pause-icon {
            display: flex;
            justify-content: space-between;
            width: 20px;
        }

        .pause-icon div {
            background: currentColor;
            width: 6px;
            height: 24px;
            border-radius: 2px;
        }

        .mute-icon, .unmute-icon {
            font-size: 1.5rem;
        }

        .spinner {
            margin: 1rem auto;
            width: 30px;
            height: 30px;
            border: 4px solid currentColor;
            border-top: 4px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        select, input[type="search"], input[type="text"] {
            margin-top: 1rem;
            padding: 0.5rem;
            border-radius: 8px;
            border: 1px solid var(--input-border, #ccc);
            font-size: 1rem;
            width: 100%;
            background: var(--input-bg, #fff);
            color: currentColor;
        }

        input[type="range"] {
            width: 100%;
            margin-top: 1rem;
            height: 8px;
            -webkit-appearance: none;
            background: var(--input-border, #ccc);
            border-radius: 4px;
            outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: currentColor;
            cursor: pointer;
        }

        .track-info {
            margin-top: 1rem;
            font-size: 1rem;
            opacity: 0.8;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        canvas {
            margin-top: 1rem;
            width: 100%;
            height: 60px;
            background: transparent;
        }

        .manage-stations {
            width: 100%;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid currentColor;
        }

        button {
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 8px;
            background: var(--button-bg, #eee);
            color: var(--button-text, #000);
            cursor: pointer;
            font-size: 1rem;
            transition: transform 0.2s;
            width: 100%;
        }

        button:hover {
            transform: translateY(-2px);
        }
        
        .error-message {
            color: #ff3333;
            background: rgba(255, 0, 0, 0.1);
            padding: 0.5rem;
            border-radius: 4px;
            margin-top: 1rem;
            font-size: 0.9rem;
            width: 100%;
        }
    `;

    async firstUpdated() {
        this.initializeAudio();
        this.applySavedSettings();
        this.checkDarkModePreference();
        await this.fetchStations();
        setTimeout(() => {
            this.setupVisualizer();
        }, 1000);
    }

    private initializeAudio() {
        try {
            this.audio = new Audio();
            this.audio.addEventListener('ended', () => this.playing = false);
            this.audio.addEventListener('waiting', () => this.loading = true);
            this.audio.addEventListener('playing', () => {
                this.loading = false;
                this.audioError = null;
                console.log('Audio is playing');
            });
            this.audio.addEventListener('stalled', () => this.loading = true);

            this.audio.addEventListener('canplay', () => {
                console.log('Can play audio!');
                this.loading = false;
            });

            this.audio.addEventListener('error', (e) => {
                console.error('Audio error:', this.audio?.error);
                this.audioError = this.audio?.error?.message || 'Error playing audio';
                this.loading = false;
            });

            this.audio.addEventListener('loadedmetadata', () => {
                const title = (this.audio as any).title;
                if (title) {
                    this.currentTrack = title;
                }
            });

            this.audio.crossOrigin = 'anonymous';
            this.audio.preload = 'auto';

            setInterval(() => {
                if (this.audio && (this.audio as any).title) {
                    this.currentTrack = (this.audio as any).title;
                }
            }, 5000);

            this.audioInitialized = true;
        } catch (err) {
            console.error('Failed to initialize audio:', err);
            this.audioError = 'Failed to initialize audio player';
        }
    }

    private applySavedSettings() {
        if (!this.audio) return;
        const savedVolume = localStorage.getItem('radio-volume');
        if (savedVolume) {
            const volume = parseFloat(savedVolume);
            if (!isNaN(volume) && volume >= 0 && volume <= 1) {
                this.audio.volume = volume;
            }
        }
        const savedMute = localStorage.getItem('radio-muted');
        if (savedMute) {
            this.audio.muted = savedMute === 'true';
            this.muted = this.audio.muted;
        }
    }

    private checkDarkModePreference() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark && this.theme === 'light') {
            this.theme = 'dark';
        }
    }

    private async fetchStations() {
        try {
            const response = await fetch('https://de1.api.radio-browser.info/json/stations/search?country=Romania');
            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                this.stations = data.map((station: any) => ({
                    name: station.name,
                    url: station.url_resolved,
                    logo: station.favicon
                }));
                console.log('Loaded stations from API:', this.stations.length);
            } else {
                throw new Error('No stations returned from API');
            }
        } catch (error) {
            console.warn('API failed, trying local fallback', error);
            try {
                const localResponse = await fetch('/utils/stations.json');
                const localData = await localResponse.json();
                if (Array.isArray(localData) && localData.length > 0) {
                    this.stations = localData;
                    console.log('Loaded stations from local fallback:', this.stations.length);
                } else {
                    throw new Error('No stations in local fallback');
                }
            } catch (fallbackError) {
                console.error('Local fallback failed, using hardcoded stations', fallbackError);
                // Hardcoded fallback stations
                this.stations = [
                    { name: 'DIGI FM', url: 'https://edge126.rcs-rds.ro/digifm/digifm.mp3' },
                    { name: 'Europa FM', url: 'https://astreaming.edi.ro:8443/EuropaFM_aac' },
                    { name: 'Radio ZU', url: 'https://live.romaniaradio.ro/zu-bucuresti' }
                ];
                console.log('Using hardcoded fallback stations');
            }
        }

        if (this.stations.length > 0) {
            this.selectedStation = this.stations[0];

            if (this.audio && this.selectedStation) {
                this.audio.crossOrigin = 'anonymous';
                this.audio.src = this.selectedStation.url;
                console.log('Set initial station:', this.selectedStation.name);
            }
        }
    }

    private togglePlay() {
        if (!this.audio || !this.selectedStation) return;

        try {
            if (this.playing) {
                console.log('Pausing audio');
                this.audio.pause();
                this.dispatchEvent(new CustomEvent('pause'));
                this.playing = false;
            } else {
                console.log('🔊 Attempting to play:', this.audio.src);
                if (!this.audio.src && this.selectedStation) {
                    this.audio.src = this.selectedStation.url;
                }
                this.audioError = null;
                this.audio.play()
                    .then(() => {
                        console.log('Audio playback started');
                        this.playing = true;
                        this.dispatchEvent(new CustomEvent('play'));
                    })
                    .catch((err) => {
                        console.error('Audio playback failed:', err);
                        this.audioError = err.message || 'Failed to play audio';
                        this.playing = false;
                    });
            }
        } catch (err) {
            console.error('Error toggling play state:', err);
            this.audioError = 'Error controlling playback';
        }
    }

    private toggleMute() {
        if (!this.audio) return;
        try {
            this.audio.muted = !this.audio.muted;
            this.muted = this.audio.muted;
            localStorage.setItem('radio-muted', this.muted.toString());
        } catch (err) {
            console.error('Error toggling mute:', err);
        }
    }

    private async changeStation(e: Event) {
        const target = e.target as HTMLSelectElement;
        const station = this.stations.find(s => s.url === target.value);

        if (station && this.audio) {
            try {
                console.log('Changing station to:', station.name);
                this.audioError = null;
                if (this.playing) {
                    await this.fadeVolume(this.audio.volume, 0, 300);
                }

                this.audio.pause();
                this.audio.crossOrigin = 'anonymous';
                this.audio.src = station.url;
                this.audio.load();
                this.selectedStation = station;
                this.currentTrack = 'Unknown';

                try {
                    await this.audio.play();
                    this.playing = true;
                    await this.fadeVolume(0, Math.min(this.audio.volume || 0.8, 1), 300);
                    this.dispatchEvent(new CustomEvent('station-change', {detail: {station}}));
                } catch (playError) {
                    console.error('Failed to play new station:', playError);
                    this.audioError = 'Failed to play this station';
                    this.playing = false;
                }
            } catch (err) {
                console.error('Error changing station:', err);
                this.audioError = 'Error changing station';
            }
        }
    }

    private fadeVolume(start: number, end: number, duration: number) {
        return new Promise<void>((resolve) => {
            if(!this.audio) return resolve();
            const actualStart = isNaN(start) ? (this.audio.volume || 0) : start;
            const steps = 10;
            const stepTime = duration / steps;
            let currentStep = 0;

            const interval = setInterval(() => {
                if(!this.audio) {
                    clearInterval(interval);
                    return resolve();
                }

                currentStep++;
                const newVolume = actualStart + (end - actualStart) * (currentStep / steps);
                this.audio.volume = Math.min(Math.max(newVolume, 0), 1);

                if(currentStep >= steps) {
                    clearInterval(interval);
                    resolve();
                }
            }, stepTime);
        });
    }

    private changeVolume(e: Event) {
        if(!this.audio) return;
        try {
            const target = e.target as HTMLInputElement;
            const volume = Number(target.value);

            if (!isNaN(volume) && volume >= 0 && volume <= 1) {
                this.audio.volume = volume;
                localStorage.setItem('radio-volume', volume.toString());

                // If changing from 0, make sure we're not muted
                if (volume > 0 && this.muted) {
                    this.audio.muted = false;
                    this.muted = false;
                    localStorage.setItem('radio-muted', 'false');
                }
            }
        } catch (err) {
            console.error('Error changing volume:', err);
        }
    }

    private filterStations(e: Event) {
        const target = e.target as HTMLInputElement;
        this.filterText = target.value.toLowerCase();
    }

    private addStation() {
        const nameInput = this.shadowRoot?.getElementById('stationName') as HTMLInputElement;
        const urlInput = this.shadowRoot?.getElementById('stationUrl') as HTMLInputElement;
        const logoInput = this.shadowRoot?.getElementById('stationLogo') as HTMLInputElement;

        if(!nameInput || !urlInput) return;

        if(!nameInput.value || !urlInput.value) {
            alert("Name and URL are required!");
            return;
        }

        try {
            const newStation: Station = {
                name: nameInput.value,
                url: urlInput.value,
                logo: logoInput?.value || undefined
            };

            this.stations = [...this.stations, newStation];

            this.selectedStation = newStation;
            if (this.audio) {
                this.audio.crossOrigin = 'anonymous';
                this.audio.src = newStation.url;
                this.audio.load();
            }

            nameInput.value = '';
            urlInput.value = '';
            if (logoInput) logoInput.value = '';

            console.log('Added new station:', newStation.name);
        } catch (err) {
            console.error('Error adding station:', err);
        }
    }

    private setupVisualizer() {
        if (this.visualizerActive || !this.audio) return;

        try {
            const canvas = this.shadowRoot?.getElementById('visualizer') as HTMLCanvasElement;
            if (!canvas) {
                console.warn('Visualizer canvas not found');
                return;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.warn('Canvas 2D context not available');
                return;
            }

            let audioCtx: AudioContext;
            try {
                audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (error) {
                console.warn('AudioContext not supported:', error);
                return;
            }

            let source: MediaElementAudioSourceNode;
            try {
                source = audioCtx.createMediaElementSource(this.audio);
                this.visualizerActive = true;
            } catch (err) {
                console.warn("Visualizer disabled:", err);
                return;
            }

            const analyser = audioCtx.createAnalyser();
            source.connect(analyser);
            analyser.connect(audioCtx.destination);

            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.7;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const draw = () => {
                if (!this.visualizerActive) return;
                requestAnimationFrame(draw);
                analyser.getByteFrequencyData(dataArray);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const barWidth = (canvas.width / bufferLength) * 1.5;
                let x = 0;
                for (let i = 0; i < bufferLength; ++i) {
                    const value = dataArray[i] / 255;
                    const barHeight = value * canvas.height;
                    ctx.fillStyle = this.theme === 'neon' ? '#39ff14'
                        : this.theme === 'cyberpunk' ? '#ff00c8'
                            : this.theme === 'dark' ? '#ffffff'
                                : '#000000';
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    x += barWidth + 1;
                }
            };
            draw();
            console.log('Visualizer initialized');
        } catch (err) {
            console.error('Error setting up visualizer:', err);
        }
    }

    updated(changedProperties: Map<string, any>) {
        if (changedProperties.has('theme')) {
            console.log('Theme changed to:', this.theme);
            this.setAttribute('theme', this.theme);
        }
    }

    render() {
        return html`
            <div class="container">
                <h2>${this.selectedStation?.name || 'Radio Player'}</h2>

                <div class="play-button" @click=${this.togglePlay}>
                    ${this.playing
            ? html`
                                <div class="pause-icon">
                                    <div></div>
                                    <div></div>
                                </div>`
            : html`
                                <div class="play-icon"></div>`
        }
                </div>

                ${this.loading ? html`
                    <div class="spinner"></div>` : ''}
                    
                ${this.audioError ? html`
                    <div class="error-message">${this.audioError}</div>` : ''}

                <!--div class="track-info">Currently Playing: ${this.currentTrack}</div-->

                <div class="mute-button" @click=${this.toggleMute}>
                    ${this.muted
            ? html`<span class="mute-icon">🔇</span>`
            : html`<span class="unmute-icon">🔊</span>`
        }
                </div>

                <input type="search" placeholder="Search stations..." @input=${this.filterStations}>

                <select @change=${this.changeStation}>
                    ${this.stations
            .filter(station => station.name.toLowerCase().includes(this.filterText))
            .map(station => html`
                <option value="${station.url}" ?selected=${station.url === this.selectedStation?.url}>
                    ${station.name}
                </option>
            `)}
                </select>

                <input type="range" min="0" max="1" step="0.01" @input=${this.changeVolume}
                       value="${this.audio?.volume || 1}">

                <canvas id="visualizer" width="300" height="60"></canvas>

                <audio id="hiddenAudio" style="display:none;" crossorigin="anonymous"></audio>

                <div class="manage-stations">
                    <h3>Manage Stations</h3>
                    <input type="text" id="stationName" placeholder="Station Name">
                    <input type="text" id="stationUrl" placeholder="Stream URL">
                    <input type="text" id="stationLogo" placeholder="Logo URL (optional)">
                    <button @click=${this.addStation}>Add Station</button>
                </div>
            </div>
        `;
    }
}