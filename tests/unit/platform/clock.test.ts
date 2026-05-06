import { describe, expect, it, vi } from 'vitest';

import { RealClock, SimClock } from '@/platform';

describe('Clock', () => {
  it('SimClock は advance で時刻が進む', () => {
    const clock = new SimClock();
    clock.advance(16.67);
    clock.advance(16.67);
    expect(clock.now()).toBeCloseTo(33.34);
  });

  it('RealClock は origin を基点に now を返す', () => {
    const spy = vi.spyOn(performance, 'now');
    spy.mockReturnValueOnce(500).mockReturnValueOnce(750);
    const clock = new RealClock();
    expect(clock.now()).toBe(250);
    spy.mockRestore();
  });
});
