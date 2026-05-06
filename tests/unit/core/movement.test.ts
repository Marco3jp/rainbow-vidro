import { describe, expect, it } from 'vitest';
import { createBall, World, type WorldState } from '@/core';

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
      character: { hp: 10, maxHp: 10, attackPower: 1 },
    },
    field: { width: 400, height: 200 },
    rngState: 0,
    nextBallId: 1,
    config: { ballRadius: 8, ballSpeed: 300, wallDecayFactor: 0.85 },
  };
}

describe('ボール移動', () => {
  it('1tick で速度分だけ位置更新される', () => {
    const state = createTestState();
    state.entities.balls = [createBall({ id: 'b1', x: 100, y: 100, vx: 60, vy: -30, radius: 8 })];
    const world = new World({ seed: 1, initialState: state });
    world.tick(1000, []);
    const ball = world.state.entities.balls[0];
    expect(ball?.x).toBeCloseTo(160);
    expect(ball?.y).toBeCloseTo(70);
  });

  it('複数ボールが独立して更新される', () => {
    const state = createTestState();
    state.entities.balls = [
      createBall({ id: 'b1', x: 20, y: 20, vx: 10, vy: 0, radius: 5 }),
      createBall({ id: 'b2', x: 20, y: 20, vx: 0, vy: 20, radius: 5 }),
    ];
    const world = new World({ seed: 1, initialState: state });
    world.tick(1000, []);
    expect(world.state.entities.balls[0]?.x).toBeCloseTo(30);
    expect(world.state.entities.balls[0]?.y).toBeCloseTo(20);
    expect(world.state.entities.balls[1]?.x).toBeCloseTo(20);
    expect(world.state.entities.balls[1]?.y).toBeCloseTo(40);
  });
});
