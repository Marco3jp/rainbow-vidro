import { describe, expect, it } from 'vitest';
import { charA, createBall, createCharacter, World, type WorldState } from '@/core';

function createTestState(): WorldState {
  return {
    tickCount: 0,
    elapsedMs: 0,
    phase: 'playing',
    entities: {
      balls: [],
      bar: {
        x: 200,
        y: 180,
        width: 100,
        height: 20,
        zeroPosition: { x: 200, y: 180, width: 100, height: 20 },
        arc: { dirX: 0, dirY: -1, depth: 0 },
        mode: 'normal',
        attachedBallIds: [],
      },
      blocks: [],
      boss: { hp: 10, maxHp: 10 },
      character: createCharacter(charA),
    },
    field: { width: 400, height: 200 },
    rngState: 0,
    nextBallId: 1,
    config: {
      ballRadius: 8,
      ballSpeed: 300,
      wallDecayFactor: 0.85,
      barBounceMaxAngleRad: 1,
      blockAdvanceSpeed: 24,
      blockReachDamage: 1,
      slingChargeMaxMs: 200,
      slingReleaseMs: 80,
      slingArcMaxDepthPx: 72,
      slingShotBaseSpeed: 420,
      chargeFactorMin: 1,
      chargeFactorMax: 2.5,
      hitFactorMin: 1,
      hitFactorMax: 2,
    },
  };
}

describe('壁反射', () => {
  it('左右上で反射し倍率が減衰する', () => {
    const state = createTestState();
    const ball = createBall({ id: 'b1', x: 3, y: 3, vx: -100, vy: -100, radius: 5 });
    ball.damageMultiplier = 2;
    state.entities.balls = [ball];
    const world = new World({ seed: 1, initialState: state });
    world.tick(16, []);
    const reflected = world.state.entities.balls[0];
    expect(reflected?.vx).toBeGreaterThan(0);
    expect(reflected?.vy).toBeGreaterThan(0);
    expect(reflected?.damageMultiplier).toBeCloseTo(1.7);
  });

  it('下壁で倍率が 1.0 になる', () => {
    const state = createTestState();
    const ball = createBall({ id: 'b1', x: 200, y: 198, vx: 0, vy: 100, radius: 5 });
    ball.damageMultiplier = 3;
    state.entities.balls = [ball];
    const world = new World({ seed: 1, initialState: state });
    world.tick(16, []);
    expect(world.state.entities.balls[0]?.damageMultiplier).toBe(1);
    expect(world.state.entities.balls[0]?.bottomReflectPassthrough).toBe(true);
  });

  it('倍率は 1.0 未満にならない', () => {
    const state = createTestState();
    const ball = createBall({ id: 'b1', x: 3, y: 3, vx: -10, vy: -10, radius: 5 });
    ball.damageMultiplier = 1;
    state.entities.balls = [ball];
    const world = new World({ seed: 1, initialState: state });
    world.tick(16, []);
    expect(world.state.entities.balls[0]?.damageMultiplier).toBe(1);
  });

  it('上壁反射で貫通フラグがリセットされる', () => {
    const state = createTestState();
    const ball = createBall({ id: 'b1', x: 200, y: 3, vx: 0, vy: -100, radius: 5 });
    ball.bottomReflectPassthrough = true;
    state.entities.balls = [ball];
    const world = new World({ seed: 1, initialState: state });
    world.tick(16, []);
    expect(world.state.entities.balls[0]?.bottomReflectPassthrough).toBe(false);
  });
});
