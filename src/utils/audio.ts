// Web Audio API Procedural Music and Sound Synthesizer
// Provides zero-latency, reliable audio for rhythm dance gameplay

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicInterval: number | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.7;
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.8;
  private currentStep: number = 0;
  private activeBpm: number = 120;
  private activeStyle: string = 'funky_pop';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.musicInterval) {
      this.stopMusic();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolumes(master: number, music: number, sfx: number) {
    this.masterVolume = master;
    this.musicVolume = music;
    this.sfxVolume = sfx;
  }

  // Play a drum kick
  public playKick(time?: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = time || this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.35);

    gain.gain.setValueAtTime(0.7 * this.masterVolume * this.musicVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  // Play a snare / clap
  public playSnare(time?: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = time || this.ctx.currentTime;
    // Noise buffer for snap
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4 * this.masterVolume * this.musicVolume, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    // Tonal body
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);

    oscGain.gain.setValueAtTime(0.3 * this.masterVolume * this.musicVolume, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    whiteNoise.start(t);
    osc.start(t);
    whiteNoise.stop(t + 0.16);
    osc.stop(t + 0.16);
  }

  // Play HiHat
  public playHiHat(time?: number, open = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = time || this.ctx.currentTime;
    const duration = open ? 0.2 : 0.05;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 8000;
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime((open ? 0.25 : 0.15) * this.masterVolume * this.musicVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + duration);
  }

  // Play synth bass note
  public playBass(freq: number, time?: number, duration = 0.2) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = time || this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.exponentialRampToValueAtTime(150, t + duration);

    gain.gain.setValueAtTime(0.35 * this.masterVolume * this.musicVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  // Play synth lead note
  public playLead(freq: number, time?: number, duration = 0.18, type: OscillatorType = 'triangle') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = time || this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.22 * this.masterVolume * this.musicVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  // Hit sound effect based on player timing
  public playHitSound(rating: 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const vol = this.masterVolume * this.sfxVolume;

    if (rating === 'PERFECT') {
      // Sparkling double chime
      [587.33, 880, 1174.66, 1760].forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + i * 0.03);

        gain.gain.setValueAtTime(0.28 * vol, t + i * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.03 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + i * 0.03);
        osc.stop(t + i * 0.03 + 0.26);
      });
    } else if (rating === 'GREAT') {
      [523.25, 783.99, 1046.5].forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t + i * 0.04);

        gain.gain.setValueAtTime(0.22 * vol, t + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + i * 0.04);
        osc.stop(t + i * 0.04 + 0.21);
      });
    } else if (rating === 'GOOD') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(520, t + 0.12);

      gain.gain.setValueAtTime(0.2 * vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } else {
      // Miss - soft thud
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);

      gain.gain.setValueAtTime(0.12 * vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    }
  }

  // Animal Voice / Sound effect when clicked or soloing
  public playAnimalSound(type: string) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const vol = this.masterVolume * this.sfxVolume;

    switch (type) {
      case 'meow': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);
        osc.frequency.exponentialRampToValueAtTime(660, t + 0.28);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.3 * vol, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
        break;
      }
      case 'bark': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.exponentialRampToValueAtTime(140, t + 0.14);

        gain.gain.setValueAtTime(0.4 * vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.18);
        break;
      }
      case 'squeak': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, t);
        osc.frequency.linearRampToValueAtTime(1600, t + 0.08);
        osc.frequency.linearRampToValueAtTime(1200, t + 0.16);

        gain.gain.setValueAtTime(0.28 * vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      }
      case 'quack': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.linearRampToValueAtTime(280, t + 0.15);

        gain.gain.setValueAtTime(0.25 * vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.22);
        break;
      }
      case 'ribbit': {
        [0, 0.07].forEach((delay) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(180, t + delay);
          osc.frequency.exponentialRampToValueAtTime(240, t + delay + 0.06);

          gain.gain.setValueAtTime(0.2 * vol, t + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.06);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(t + delay);
          osc.stop(t + delay + 0.07);
        });
        break;
      }
      case 'growl': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(95, t);
        osc.frequency.linearRampToValueAtTime(110, t + 0.15);
        osc.frequency.linearRampToValueAtTime(80, t + 0.3);

        gain.gain.setValueAtTime(0.35 * vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
        break;
      }
      case 'chirp': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.linearRampToValueAtTime(2400, t + 0.1);

        gain.gain.setValueAtTime(0.25 * vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
      }
      default: {
        // sparkle / magic
        [784, 987, 1174, 1567].forEach((f, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t + i * 0.04);
          gain.gain.setValueAtTime(0.2 * vol, t + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(t + i * 0.04);
          osc.stop(t + i * 0.04 + 0.22);
        });
      }
    }
  }

  // Level Complete Fanfare
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [
      { f: 523.25, d: 0.12, offset: 0 },
      { f: 659.25, d: 0.12, offset: 0.12 },
      { f: 783.99, d: 0.12, offset: 0.24 },
      { f: 1046.5, d: 0.45, offset: 0.36 },
      { f: 880.0, d: 0.15, offset: 0.85 },
      { f: 1046.5, d: 0.6, offset: 1.0 },
    ];

    const t = this.ctx.currentTime;
    const vol = this.masterVolume * this.sfxVolume;

    notes.forEach((n) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t + n.offset);
      gain.gain.setValueAtTime(0.3 * vol, t + n.offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.offset + n.d);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t + n.offset);
      osc.stop(t + n.offset + n.d + 0.05);
    });
  }

  // Fever Mode Activated
  public playFeverFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const vol = this.masterVolume * this.sfxVolume;

    [440, 554.37, 659.25, 880, 1108.73, 1318.51].forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t + i * 0.05);
      gain.gain.setValueAtTime(0.25 * vol, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.28);
    });
  }

  // Unlocked New Pet Chime
  public playPetUnlockChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const vol = this.masterVolume * this.sfxVolume;
    const chords = [523.25, 659.25, 783.99, 987.77, 1318.51, 1567.98];

    chords.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      gain.gain.setValueAtTime(0.3 * vol, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.65);
    });
  }

  // Start background groove music loop
  public startMusic(bpm: number = 120, style: string = 'funky_pop', onStep?: (step: number) => void) {
    if (this.isMuted) return;
    this.initContext();
    this.stopMusic();

    this.activeBpm = bpm;
    this.activeStyle = style;
    this.currentStep = 0;

    // 16th note interval (4 steps per beat)
    const stepDurationMs = (60 / bpm / 4) * 1000;

    // Music scales (Pentatonic / Funk scales)
    const scaleMap: Record<string, number[]> = {
      funky_pop: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25], // C Major Pentatonic + 2
      beach_calypso: [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 659.25], // D Major
      neon_disco: [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33], // A Minor Funk
      sakura_chill: [261.63, 277.18, 349.23, 392.0, 415.3, 523.25], // Japanese Insen
      bamboo_groove: [196.0, 220.0, 261.63, 293.66, 329.63, 392.0, 440.0], // G Pentatonic
      cosmic_synth: [174.61, 220.0, 261.63, 329.63, 349.23, 440.0, 523.25], // F Lydian
      carnival_bounce: [261.63, 329.63, 392.0, 493.88, 523.25, 659.25], // C Major Arp
      cyber_arcade: [164.81, 196.0, 220.0, 246.94, 293.66, 329.63], // E Minor Cyber
    };

    const currentScale = scaleMap[style] || scaleMap.funky_pop;
    const bassRoot = currentScale[0] / 2;
    const bassFifth = (currentScale[3] || currentScale[2]) / 2;

    this.musicInterval = window.setInterval(() => {
      const step = this.currentStep % 16;
      if (onStep) onStep(step);

      // Drum patterns
      // Kick on 0, 4, 8, 12 (four on the floor)
      if (step === 0 || step === 4 || step === 8 || step === 12) {
        this.playKick();
      }
      // Additional syncopated kick
      if (step === 10 || (style === 'carnival_bounce' && step === 6)) {
        this.playKick();
      }

      // Snare on 4, 12
      if (step === 4 || step === 12) {
        this.playSnare();
      }

      // Hi-hat on every 2 steps, open on offbeats (2, 6, 10, 14)
      if (step % 2 === 0) {
        const isOpen = step % 4 === 2;
        this.playHiHat(undefined, isOpen);
      }

      // Bassline
      if (step % 4 === 0) {
        const f = step < 8 ? bassRoot : bassFifth;
        this.playBass(f, undefined, 0.18);
      } else if (step === 2 || step === 6 || step === 14) {
        const f = step === 14 ? (currentScale[1] / 2) : bassRoot;
        this.playBass(f, undefined, 0.12);
      }

      // Melodic arpeggio / lead hooks
      if (step === 0 || step === 3 || step === 6 || step === 8 || step === 11 || step === 14) {
        const noteIdx = (step + Math.floor(this.currentStep / 16)) % currentScale.length;
        const noteFreq = currentScale[noteIdx];
        this.playLead(noteFreq, undefined, 0.15, style === 'cyber_arcade' ? 'square' : 'triangle');
      }

      this.currentStep++;
    }, stepDurationMs);
  }

  public stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const sound = new SoundEngine();
