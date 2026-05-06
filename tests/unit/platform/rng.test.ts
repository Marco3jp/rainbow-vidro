import { describe, expect, it } from 'vitest';

import { createMulberry32 } from '@/platform';

describe('Mulberry32 RNG', () => {
  it('同一シードで同一の乱数列になる', () => {
    const rngA = createMulberry32(123456789);
    const rngB = createMulberry32(123456789);
    const seqA = Array.from({ length: 1000 }, () => rngA.next());
    const seqB = Array.from({ length: 1000 }, () => rngB.next());

    expect(seqA).toEqual(seqB);
    expect(seqA.slice(0, 5)).toEqual([
      0.2577907438389957, 0.9707721115555614, 0.7853280142880976, 0.20616457983851433,
      0.30307188746519387,
    ]);
  });

  it('getState/setState で乱数列を再現できる', () => {
    const rng = createMulberry32(42);
    const first = rng.next();
    const state = rng.getState();
    const second = rng.next();
    rng.setState(state);

    expect(rng.next()).toBe(second);
    expect(first).not.toBe(second);
  });

  it('nextInt(0) は例外を投げる', () => {
    const rng = createMulberry32(1);
    expect(() => rng.nextInt(0)).toThrow(RangeError);
  });

  it('fork の結果は親と独立した乱数列になる', () => {
    const parent = createMulberry32(2026);
    const child = parent.fork();
    const parentSeq = [parent.next(), parent.next(), parent.next()];
    const childSeq = [child.next(), child.next(), child.next()];

    expect(childSeq).not.toEqual(parentSeq);
  });
});
