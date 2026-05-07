import { describe, expect, it } from 'vitest';
import { charA, createCharacter, World, type WorldState } from '@/core';

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
      slingPostFadeMs: 140,
      slingArcMaxDepthPx: 72,
      slingArcSegments: 12,
      slingShotBaseSpeed: 420,
      chargeFactorMin: 1,
      chargeFactorMax: 2.5,
      hitFactorMin: 1,
      hitFactorMax: 2,
    },
  };
}

describe('バー移動', () => {
  it('mousemove でバー位置が更新される', () => {
    const world = new World({ seed: 2, initialState: createTestState() });
    world.tick(16, [{ type: 'mousemove', x: 320, y: 0 }]);
    expect(world.state.entities.bar.x).toBe(320);
  });

  it('フィールド端を超える入力はクランプされる', () => {
    const world = new World({ seed: 2, initialState: createTestState() });
    world.tick(16, [{ type: 'mousemove', x: -999, y: 0 }]);
    expect(world.state.entities.bar.x).toBe(50);
  });

  it('入力がないとバー位置は維持される', () => {
    const world = new World({ seed: 2, initialState: createTestState() });
    const before = world.state.entities.bar.x;
    world.tick(16, []);
    expect(world.state.entities.bar.x).toBe(before);
  });
});
