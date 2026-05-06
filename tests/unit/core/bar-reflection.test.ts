import { describe, expect, it } from 'vitest';
import { charA, createBall, createCharacter, World, type WorldState } from '@/core';

function createTestState(): WorldState {
  return {
    tickCount: 0,
    elapsedMs: 0,
    phase: 'playing',
    entities: {
      balls: [],
      bar: { x: 200, y: 180, width: 100, height: 20, mode: 'normal' },
      blocks: [],
      boss: { hp: 10, maxHp: 10 },
      character: createCharacter(charA),
    },
    field: { width: 400, height: 200 },
    rngState: 0,
    nextBallId: 1,
    config: { ballRadius: 8, ballSpeed: 300, wallDecayFactor: 0.85, barBounceMaxAngleRad: 1 },
  };
}

describe('バー反射', () => {
  it('中央ヒットは x 成分ほぼ 0', () => {
    const state = createTestState();
    state.entities.balls = [createBall({ id: 'b1', x: 200, y: 170, vx: 0, vy: 100, radius: 5 })];
    const world = new World({ seed: 1, initialState: state });
    world.tick(16, []);
    expect(world.state.entities.balls[0]?.vx).toBeCloseTo(0, 6);
    expect(world.state.entities.balls[0]?.vy).toBeLessThan(0);
  });

  it('端ヒットで角度が変化する', () => {
    const state = createTestState();
    state.entities.balls = [createBall({ id: 'b1', x: 245, y: 170, vx: 0, vy: 100, radius: 5 })];
    const world = new World({ seed: 1, initialState: state });
    world.tick(16, []);
    expect(Math.abs(world.state.entities.balls[0]?.vx ?? 0)).toBeGreaterThan(0);
  });

  it('charging モードでは反射しない', () => {
    const state = createTestState();
    state.entities.bar.mode = 'charging';
    state.entities.balls = [createBall({ id: 'b1', x: 200, y: 170, vx: 0, vy: 100, radius: 5 })];
    const world = new World({ seed: 1, initialState: state });
    world.tick(16, []);
    expect(world.state.entities.balls[0]?.vy).toBeGreaterThan(0);
  });

  it('通常反射で damageMultiplier は維持される', () => {
    const state = createTestState();
    const ball = createBall({ id: 'b1', x: 200, y: 170, vx: 0, vy: 100, radius: 5 });
    ball.damageMultiplier = 2;
    state.entities.balls = [ball];
    const world = new World({ seed: 1, initialState: state });
    world.tick(16, []);
    expect(world.state.entities.balls[0]?.damageMultiplier).toBe(2);
  });

  it('下壁直後フラグ中はバーを貫通する', () => {
    const state = createTestState();
    const ball = createBall({ id: 'b1', x: 200, y: 170, vx: 0, vy: 100, radius: 5 });
    ball.bottomReflectPassthrough = true;
    state.entities.balls = [ball];
    const world = new World({ seed: 1, initialState: state });
    world.tick(16, []);
    expect(world.state.entities.balls[0]?.vy).toBeGreaterThan(0);
  });
});
