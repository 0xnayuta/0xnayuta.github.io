// Web Audio API sound manager — AudioContext created lazily on first play()
// (inside a user gesture), so browser autoplay policy is satisfied.
// load() only fetches the raw audio data; decoding and playback are deferred
// to play(). Failures are silently swallowed — audio is optional UX.

export class SoundManager {
  private ctx: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private rawData: ArrayBuffer | null = null;
  private ready = false;

  /** Pre-fetch audio data. Call early (e.g. at module init) to warm the cache.
   *  No AudioContext is created — that happens lazily inside play(). */
  async load(url: string): Promise<void> {
    try {
      const resp = await fetch(url);
      this.rawData = await resp.arrayBuffer();
    } catch {
      // network failure — play() will silently no-op
    }
  }

  /** Play the loaded sound. Creates AudioContext + decodes on first call.
   *  Silently no-op if load() hasn't completed or data is unavailable. */
  async play(): Promise<void> {
    if (!this.rawData) return;
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext();
        this.buffer = await this.ctx.decodeAudioData(this.rawData.slice(0));
        this.ready = true;
      }
      if (this.ctx.state === "suspended") await this.ctx.resume();
      if (!this.ready || !this.buffer) return;
      const src = this.ctx.createBufferSource();
      src.buffer = this.buffer;
      src.connect(this.ctx.destination);
      src.start(0);
    } catch {
      // audio is optional UX — swallow decode/playback errors
    }
  }
}
