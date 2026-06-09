// Web Audio API sound manager — zero dependencies, lazy AudioContext.
// Delays AudioContext creation until first load() call to satisfy browser
// autoplay policy (requires user gesture before audio context is allowed).

export class SoundManager {
  private ctx: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private ready = false;

  /** Preload and decode a single audio file. */
  async load(url: string): Promise<void> {
    const resp = await fetch(url);
    const raw = await resp.arrayBuffer();
    this.ctx = new AudioContext();
    this.buffer = await this.ctx.decodeAudioData(raw);
    this.ready = true;
  }

  /** Play the loaded sound. Silently no-op if not loaded yet. */
  async play(): Promise<void> {
    if (!this.ready || !this.ctx || !this.buffer) return;
    if (this.ctx.state === "suspended") await this.ctx.resume();
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffer;
    src.connect(this.ctx.destination);
    src.start(0);
  }
}
