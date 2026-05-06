import { describe, expect, it } from 'vitest';
import { World } from '@/core/world';

describe('World', () => {
  it('同一シード・同一入力で snapshot が一致する', () => {
    const worldA = new World({ seed: 42 });
    const worldB = new World({ seed: 42 });

    for (let i = 0; i < 100; i += 1) {
      worldA.tick(1000 / 60, []);
      worldB.tick(1000 / 60, []);
    }

    expect(worldA.snapshot()).toEqual(worldB.snapshot());
  });

  it('snapshot は後続更新で破壊されない', () => {
    const world = new World({ seed: 7 });
    const snap1 = world.snapshot();
    world.tick(1000 / 60, []);
    expect(snap1.tickCount).toBe(0);
  });

  it('snapshot は JSON シリアライズ可能', () => {
    const world = new World({ seed: 9 });
    const serialized = JSON.stringify(world.snapshot());
    expect(serialized.length).toBeGreaterThan(0);
  });
});
