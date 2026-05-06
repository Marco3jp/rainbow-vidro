import type { World, WorldSnapshot } from '@/core/world';
import type { InputSource } from '@/platform';
import type { Renderer } from '@/render';

const STEP_MS = 1000 / 60;
const MAX_ACCUM_MS = STEP_MS * 6;

export interface FrameScheduler {
  requestAnimationFrame(callback: FrameRequestCallback): number;
  cancelAnimationFrame(id: number): void;
}

export interface TimeSource {
  now(): number;
}

export class GameLoop {
  private running = false;
  private rafId: number | null = null;
  private lastNowMs = 0;
  private accumulatorMs = 0;
  private prevSnapshot: WorldSnapshot;
  private currSnapshot: WorldSnapshot;

  public constructor(
    private readonly world: World,
    private readonly renderer: Renderer,
    private readonly inputSource: InputSource,
    private readonly scheduler: FrameScheduler = window,
    private readonly timeSource: TimeSource = performance,
  ) {
    this.currSnapshot = world.snapshot();
    this.prevSnapshot = this.currSnapshot;
  }

  public start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastNowMs = this.timeSource.now();
    this.rafId = this.scheduler.requestAnimationFrame(this.frame);
  }

  public stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      this.scheduler.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private readonly frame: FrameRequestCallback = () => {
    if (!this.running) {
      return;
    }

    const now = this.timeSource.now();
    const delta = now - this.lastNowMs;
    this.lastNowMs = now;
    this.accumulatorMs = Math.min(this.accumulatorMs + delta, MAX_ACCUM_MS);

    while (this.accumulatorMs >= STEP_MS) {
      const inputs = this.inputSource.poll();
      this.world.tick(STEP_MS, inputs);
      this.prevSnapshot = this.currSnapshot;
      this.currSnapshot = this.world.snapshot();
      this.accumulatorMs -= STEP_MS;
    }

    const alpha = this.accumulatorMs / STEP_MS;
    this.renderer.render(this.prevSnapshot, this.currSnapshot, alpha);
    this.rafId = this.scheduler.requestAnimationFrame(this.frame);
  };
}

export const LoopConstants = { STEP_MS, MAX_ACCUM_MS };
