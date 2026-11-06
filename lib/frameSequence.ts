import { progressiveOrder } from './geometry.ts';
import { asset } from './assetPath.ts';

/** Compressed blobs survive scrubbing; decoded pixels have a strict bounded lifetime. */
export class FrameSequence {
  private blobs = new Map<number, Blob>();
  private bitmaps = new Map<number, ImageBitmap>();
  private fetching = new Map<number, Promise<Blob | undefined>>();
  private decoding = new Set<number>();
  private controller = new AbortController();
  private stopped = false;
  private started = false;
  private active = true;
  private target = 0;
  private direction = 1;
  private queue: number[] = [];
  revision = 0;
  peakDecoded = 0;
  closed = 0;
  readonly base: string;
  readonly count: number;
  readonly limit: number;
  constructor(base: string, count: number, limit = 32) { this.base = asset(base); this.count = count; this.limit = limit; }
  get decodedCount() { return this.bitmaps.size; }
  get downloadedCount() { return this.blobs.size; }
  private async fetchFrame(index: number) {
    if (this.blobs.has(index)) return this.blobs.get(index);
    if (this.fetching.has(index)) return this.fetching.get(index);
    const request = fetch(`${this.base}/f_${String(index + 1).padStart(4, '0')}.webp`, { signal: this.controller.signal })
      .then(r => { if (!r.ok) throw Error(`Frame ${r.status}`); return r.blob(); })
      .then(blob => { if (!this.stopped) this.blobs.set(index, blob); return blob; })
      .catch(() => undefined).finally(() => this.fetching.delete(index));
    this.fetching.set(index, request); return request;
  }
  async preload() {
    if (this.started || this.stopped) return;
    this.started = true;
    const order = progressiveOrder(this.count);
    let cursor = 0;
    await Promise.all(Array.from({ length: 3 }, async () => {
      while (!this.stopped && cursor < order.length) {
        const index = order[cursor++]; await this.fetchFrame(index);
        if (this.active && Math.abs(index - this.target) < 25) this.pump();
      }
    }));
  }
  seek(index: number, direction = 1) {
    this.active = true; this.target = Math.round(index); this.direction = direction;
    const next = [this.target];
    for (let d = 1; d <= 24; d++) {
      next.push(this.target + d * direction);
      if (d <= 12) next.push(this.target - d * direction);
    }
    this.queue = next.filter(i => i >= 0 && i < this.count && !this.bitmaps.has(i));
    this.pump();
  }
  private pump() {
    if (this.stopped || !this.active) return;
    while (this.decoding.size < 2 && this.queue.length) {
      const index = this.queue.shift()!;
      if (this.decoding.has(index) || this.bitmaps.has(index)) continue;
      this.decoding.add(index);
      void this.decode(index);
    }
  }
  private async decode(index: number) {
    try {
      const blob = await this.fetchFrame(index);
      if (!blob || this.stopped || !this.active) return;
      const bitmap = await createImageBitmap(blob);
      if (this.stopped || !this.active || Math.abs(index - this.target) > 36) { bitmap.close(); this.closed++; return; }
      while (this.bitmaps.size >= this.limit) {
        const oldest = this.bitmaps.keys().next().value!;
        this.bitmaps.get(oldest)!.close(); this.closed++; this.bitmaps.delete(oldest);
      }
      this.bitmaps.set(index, bitmap); this.peakDecoded = Math.max(this.peakDecoded, this.bitmaps.size); this.revision++;
    } catch { /* Keep the last successfully painted image and the HTML poster. */ }
    finally { this.decoding.delete(index); this.pump(); }
  }
  nearest(index: number) {
    let best = -1, distance = Infinity;
    for (const key of this.bitmaps.keys()) if (Math.abs(key - index) < distance) { best = key; distance = Math.abs(key - index); }
    const bitmap = this.bitmaps.get(best);
    if (bitmap) { this.bitmaps.delete(best); this.bitmaps.set(best, bitmap); }
    return bitmap ? { bitmap, index: best } : undefined;
  }
  release() {
    this.active = false; this.queue = [];
    for (const bitmap of this.bitmaps.values()) { bitmap.close(); this.closed++; }
    this.bitmaps.clear();
  }
  destroy() { this.stopped = true; this.controller.abort(); this.release(); this.blobs.clear(); }
}
