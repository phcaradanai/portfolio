/**
 * Web Audio Ambient & Interactive Soundscape for Future Museum.
 * Pure procedural synthesis: 0KB asset download, zero external requests,
 * conforms to Web Audio autoplay policy (requires user gesture).
 */

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private droneOscA: OscillatorNode | null = null;
  private droneOscB: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private isRunning = false;

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Lowpass resonant filter for museum warmth (curated warm frequency)
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.setValueAtTime(280, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(1.2, this.ctx.currentTime);
      this.filter.connect(this.masterGain);

      // Ambient drone gain
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.ambientGain.connect(this.filter);

      // Deep harmonic drone (55Hz A1 + 110Hz A2 + gentle detune)
      this.droneOscA = this.ctx.createOscillator();
      this.droneOscA.type = "sine";
      this.droneOscA.frequency.setValueAtTime(55, this.ctx.currentTime);
      this.droneOscA.connect(this.ambientGain);
      this.droneOscA.start();

      this.droneOscB = this.ctx.createOscillator();
      this.droneOscB.type = "triangle";
      this.droneOscB.frequency.setValueAtTime(110.4, this.ctx.currentTime);
      this.droneOscB.connect(this.ambientGain);
      this.droneOscB.start();

      this.isRunning = true;
    } catch {
      // AudioContext not supported or blocked
    }
  }

  public setEnabled(enabled: boolean) {
    if (typeof window === "undefined") return;

    if (enabled) {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.35, now + 0.6);
    } else {
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    }
  }

  /** Subtle crystal chime on district / waypoint jump */
  public playWaypointChime(pitchMultiplier = 1) {
    if (!this.ctx || !this.masterGain || this.masterGain.gain.value < 0.01) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440 * pitchMultiplier, now);
      osc.frequency.exponentialRampToValueAtTime(880 * pitchMultiplier, now + 0.12);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio playback safety catch
    }
  }

  /** Micro-interaction tactile click on hover or button select */
  public playHapticTick() {
    if (!this.ctx || !this.masterGain || this.masterGain.gain.value < 0.01) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.04);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Safety catch
    }
  }
}

export const soundscape = typeof window !== "undefined" ? new SoundscapeEngine() : (null as unknown as SoundscapeEngine);
