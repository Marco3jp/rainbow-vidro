export interface SeededRng {
  readonly seed: number;
  next(): number;
  nextInt(maxExclusive: number): number;
  nextRange(minIncl: number, maxExcl: number): number;
  fork(): SeededRng;
  getState(): number;
  setState(state: number): void;
}

class Mulberry32Rng implements SeededRng {
  private state: number;

  public constructor(
    public readonly seed: number,
    initialState?: number,
  ) {
    this.state = initialState ?? seed;
  }

  public next(): number {
    this.state += 0x6d2b79f5;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public nextInt(maxExclusive: number): number {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
      throw new RangeError('maxExclusive は 1 以上の整数である必要があります');
    }
    return Math.floor(this.next() * maxExclusive);
  }

  public nextRange(minIncl: number, maxExcl: number): number {
    if (!Number.isFinite(minIncl) || !Number.isFinite(maxExcl) || maxExcl <= minIncl) {
      throw new RangeError('範囲指定が不正です');
    }
    return minIncl + this.next() * (maxExcl - minIncl);
  }

  public fork(): SeededRng {
    const nextSeed = (this.next() * 0xffffffff) >>> 0;
    return new Mulberry32Rng(nextSeed, nextSeed);
  }

  public getState(): number {
    return this.state;
  }

  public setState(state: number): void {
    this.state = state >>> 0;
  }
}

export function createMulberry32(seed: number): SeededRng {
  return new Mulberry32Rng(seed >>> 0, seed >>> 0);
}
