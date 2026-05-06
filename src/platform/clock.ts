export interface Clock {
  now(): number;
}

export class SimClock implements Clock {
  private elapsedMs = 0;

  public now(): number {
    return this.elapsedMs;
  }

  public advance(stepMs: number): void {
    if (!Number.isFinite(stepMs) || stepMs < 0) {
      throw new RangeError('stepMs は 0 以上の数値である必要があります');
    }
    this.elapsedMs += stepMs;
  }
}

export class RealClock implements Clock {
  private readonly origin: number;

  public constructor(originMs: number = performance.now()) {
    this.origin = originMs;
  }

  public now(): number {
    return performance.now() - this.origin;
  }
}
