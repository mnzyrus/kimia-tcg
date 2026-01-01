export class SoundManager {
    private bgm: HTMLAudioElement | null = null;
    private ctx: AudioContext | null = null;
    private masterVolume: number = 1.0;
    private bgmVolume: number = 0.7;
    private sfxVolume: number = 0.7;
    private isMuted: boolean = false;

    private sounds = {
        menuBgm: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Sci-Fi/Techno placeholder
        battleBgm: 'https://soundimage.org/wp-content/uploads/2022/04/High-Seas-Adventures.mp3', // Epic placeholder
    };

    constructor() {
        if (typeof window !== 'undefined') {
            try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContextClass) {
                    this.ctx = new AudioContextClass();
                }
            } catch (e) {
                console.warn('Web Audio API not supported');
            }
        }
    }

    setMasterVolume(vol: number) {
        this.masterVolume = Math.max(0, Math.min(1, vol));
        this.updateBGMVolume();
    }

    setBGMVolume(vol: number) {
        this.bgmVolume = Math.max(0, Math.min(1, vol));
        this.updateBGMVolume();
    }

    setSFXVolume(vol: number) {
        this.sfxVolume = Math.max(0, Math.min(1, vol));
    }

    private updateBGMVolume() {
        if (this.bgm) {
            this.bgm.volume = this.getEffectiveBGMVolume();
            this.bgm.muted = this.isMuted;
        }
    }

    getEffectiveBGMVolume() {
        return this.bgmVolume * this.masterVolume;
    }

    getEffectiveSFXVolume() {
        return this.sfxVolume * this.masterVolume;
    }

    getBGMVolume() { return this.bgmVolume; }
    getSFXVolume() { return this.sfxVolume; }
    getMasterVolume() { return this.masterVolume; }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateBGMVolume();
    }

    playBGM(type: 'menu' | 'battle') {
        const url = type === 'menu' ? this.sounds.menuBgm : this.sounds.battleBgm;

        // Prevent restarting same song
        if (this.bgm && this.bgm.src === url && !this.bgm.paused) return;

        // Fade out old? For now just stop.
        if (this.bgm) {
            this.bgm.pause();
        }

        this.bgm = new Audio(url);
        this.bgm.loop = true;
        this.bgm.volume = this.getEffectiveBGMVolume();
        this.bgm.muted = this.isMuted;

        const playPromise = this.bgm.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Audio autoplay prevented. Interaction needed.");
            });
        }
    }

    stopBGM() {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm = null;
        }
    }

    // Generate SFX using Web Audio API (No downloads needed)
    playSFX(type: 'click' | 'error' | 'success' | 'synthesize' | 'attack' | 'start') {
        if (this.isMuted || !this.ctx) return;

        // Ensure context is running (browser policy)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => { });
        }

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        try {
            switch (type) {
                case 'click':
                    // High blip
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(800, t);
                    osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);
                    gain.gain.setValueAtTime(0.1 * this.getEffectiveSFXVolume(), t);
                    gain.gain.exponentialRampToValueAtTime(0.01 * this.getEffectiveSFXVolume(), t + 0.1);
                    osc.start(t);
                    osc.stop(t + 0.1);
                    break;

                case 'error':
                    // Low buzz
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(150, t);
                    osc.frequency.linearRampToValueAtTime(100, t + 0.3);
                    gain.gain.setValueAtTime(0.2 * this.getEffectiveSFXVolume(), t);
                    gain.gain.linearRampToValueAtTime(0.01 * this.getEffectiveSFXVolume(), t + 0.3);
                    osc.start(t);
                    osc.stop(t + 0.3);
                    break;

                case 'success':
                    // Major arpeggio
                    this.playTone(523.25, 'sine', 0.1, t);       // C5
                    this.playTone(659.25, 'sine', 0.1, t + 0.1); // E5
                    this.playTone(783.99, 'sine', 0.2, t + 0.2); // G5
                    break;

                case 'start':
                    // Power up
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(220, t);
                    osc.frequency.exponentialRampToValueAtTime(880, t + 1);
                    gain.gain.setValueAtTime(0.2 * this.getEffectiveSFXVolume(), t);
                    gain.gain.linearRampToValueAtTime(0, t + 1);
                    osc.start(t);
                    osc.stop(t + 1);
                    break;

                case 'synthesize':
                    // Magical slide
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(400, t);
                    osc.frequency.linearRampToValueAtTime(1200, t + 0.5);
                    gain.gain.setValueAtTime(0.1 * this.getEffectiveSFXVolume(), t);
                    gain.gain.exponentialRampToValueAtTime(0.01 * this.getEffectiveSFXVolume(), t + 0.5);
                    osc.start(t);
                    osc.stop(t + 0.5);

                    // Add some sparkle
                    setTimeout(() => this.playTone(1500, 'sine', 0.1), 100);
                    setTimeout(() => this.playTone(1800, 'sine', 0.1), 200);
                    break;

                case 'attack':
                    // White noise burst approximation using simplified osc chaos
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(100, t);
                    osc.frequency.linearRampToValueAtTime(50, t + 0.2);
                    gain.gain.setValueAtTime(0.3 * this.getEffectiveSFXVolume(), t);
                    gain.gain.exponentialRampToValueAtTime(0.01 * this.getEffectiveSFXVolume(), t + 0.2);
                    osc.start(t);
                    osc.stop(t + 0.2);
                    break;
            }
        } catch (e) {
            console.warn("SFX Error", e);
        }
    }

    private playTone(freq: number, type: 'sine' | 'square' | 'triangle', dur: number, startTime?: number) {
        if (!this.ctx) return;
        const t = startTime || this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.1 * this.getEffectiveSFXVolume(), t);
        gain.gain.exponentialRampToValueAtTime(0.01 * this.getEffectiveSFXVolume(), t + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + dur);
    }
}

export const soundManager = new SoundManager();
