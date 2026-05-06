import { describe, expect, it, vi } from 'vitest';
import { type FrameScheduler, GameLoop, type TimeSource } from '@/app/GameLoop';
import { charA, createCharacter } from '@/core';
import type { World, WorldState } from '@/core/world';
import type { InputSource } from '@/platform';
import type { Renderer } from '@/render';

class FakeScheduler implements FrameScheduler {
  private callbacks = new Map<number, FrameRequestCallback>();
  private nextId = 1;

  public requestAnimationFrame(callback: FrameRequestCallback): number {
    const id = this.nextId++;
    this.callbacks.set(id, callback);
    return id;
  }

  public cancelAnimationFrame(id: number): void {
    this.callbacks.delete(id);
  }

  public flush(): void {
    const callbacks = [...this.callbacks.values()];
    this.callbacks.clear();
    for (const callback of callbacks) {
      callback(0);
    }
  }
}

describe('GameLoop', () => {
  const makeSnapshot = (): WorldState => ({
    tickCount: 0,
    elapsedMs: 0,
    phase: 'playing',
    entities: {
      balls: [],
      bar: { x: 0, y: 0, width: 100, height: 10, mode: 'normal' },
      blocks: [],
      boss: { hp: 10, maxHp: 10 },
      character: createCharacter(charA),
    },
    field: { width: 100, height: 100 },
    rngState: 0,
    nextBallId: 0,
    config: { ballRadius: 8, ballSpeed: 300, wallDecayFactor: 0.85, barBounceMaxAngleRad: 1 },
  });

  it('100ms 経過で期待 tick 数を実行する', () => {
    const world: Pick<World, 'tick' | 'snapshot'> = {
      tick: vi.fn(),
      snapshot: vi.fn(() => makeSnapshot()),
    };
    const renderer: Renderer = {
      mount: vi.fn(async () => {}),
      unmount: vi.fn(),
      resize: vi.fn(),
      render: vi.fn(),
    };
    const inputSource: InputSource = {
      poll: vi.fn(() => []),
      dispose: vi.fn(),
    };

    const scheduler = new FakeScheduler();
    let now = 0;
    const time: TimeSource = { now: () => now };
    const loop = new GameLoop(world as World, renderer, inputSource, scheduler, time);
    loop.start();
    now = 100;
    scheduler.flush();

    expect(world.tick).toHaveBeenCalledTimes(5);
    expect(renderer.render).toHaveBeenCalled();
    const alpha = (renderer.render as ReturnType<typeof vi.fn>).mock.calls.at(-1)?.[2] as number;
    expect(alpha).toBeGreaterThanOrEqual(0);
    expect(alpha).toBeLessThan(1);
  });

  it('大遅延時はスパイラル防止クランプが効く', () => {
    const world: Pick<World, 'tick' | 'snapshot'> = {
      tick: vi.fn(),
      snapshot: vi.fn(() => makeSnapshot()),
    };
    const renderer: Renderer = {
      mount: vi.fn(async () => {}),
      unmount: vi.fn(),
      resize: vi.fn(),
      render: vi.fn(),
    };
    const inputSource: InputSource = {
      poll: vi.fn(() => []),
      dispose: vi.fn(),
    };

    const scheduler = new FakeScheduler();
    let now = 0;
    const time: TimeSource = { now: () => now };
    const loop = new GameLoop(world as World, renderer, inputSource, scheduler, time);
    loop.start();
    now = 1000;
    scheduler.flush();

    expect(world.tick).toHaveBeenCalledTimes(5);
  });
});
