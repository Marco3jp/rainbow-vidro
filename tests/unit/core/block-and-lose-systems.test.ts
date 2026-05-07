import { describe, expect, it } from 'vitest';
import { charA, createBall, createBlock, createCharacter, World, type WorldState } from '@/core';

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

describe('ブロック衝突・前進・敗北判定', () => {
  it('ボール衝突でブロックHPが減る', () => {
    const state = createTestState();
    state.entities.balls = [createBall({ id: 'ball-1', x: 200, y: 120, vx: 0, vy: 60, radius: 8 })];
    state.entities.blocks = [
      createBlock({ id: 'block-1', x: 200, y: 130, width: 60, height: 24, hp: 20 }),
    ];
    const world = new World({ seed: 1, initialState: state });
    world.tick(16, []);
    expect(world.state.entities.blocks[0]?.hp).toBe(10);
  });

  it('HPが0になるとブロック削除と経験値加算が行われる', () => {
    const state = createTestState();
    state.entities.balls = [createBall({ id: 'ball-1', x: 200, y: 120, vx: 0, vy: 60, radius: 8 })];
    state.entities.blocks = [
      createBlock({ id: 'block-1', x: 200, y: 130, width: 60, height: 24, hp: 10, expReward: 4 }),
    ];
    const world = new World({ seed: 1, initialState: state });
    world.tick(16, []);
    expect(world.state.entities.blocks).toHaveLength(0);
    expect(world.state.entities.character.exp).toBe(4);
  });

  it('破壊できるブロックに当たった場合は反射せずに貫通する', () => {
    const state = createTestState();
    state.entities.balls = [createBall({ id: 'ball-1', x: 200, y: 120, vx: 0, vy: 60, radius: 8 })];
    state.entities.blocks = [
      createBlock({ id: 'block-1', x: 200, y: 130, width: 60, height: 24, hp: 10, expReward: 1 }),
    ];
    const world = new World({ seed: 1, initialState: state });
    world.tick(16, []);
    expect(world.state.entities.blocks).toHaveLength(0);
    expect(world.state.entities.balls[0]?.vy).toBeGreaterThan(0);
  });

  it('同tickの複数ボール命中でも合算ダメージで順序依存しない', () => {
    const state = createTestState();
    state.entities.balls = [
      createBall({ id: 'ball-1', x: 180, y: 120, vx: 0, vy: 60, radius: 8 }),
      createBall({ id: 'ball-2', x: 220, y: 120, vx: 0, vy: 60, radius: 8 }),
    ];
    state.entities.blocks = [
      createBlock({ id: 'block-1', x: 200, y: 130, width: 80, height: 24, hp: 20 }),
    ];
    const world = new World({ seed: 1, initialState: state });
    world.tick(16, []);
    expect(world.state.entities.blocks).toHaveLength(0);
  });

  it('ブロックは設定速度で前進する', () => {
    const state = createTestState();
    state.config.blockAdvanceSpeed = 50;
    state.entities.blocks = [
      createBlock({ id: 'block-1', x: 200, y: 80, width: 60, height: 24, hp: 10 }),
    ];
    const world = new World({ seed: 1, initialState: state });
    world.tick(1000, []);
    expect(world.state.entities.blocks[0]?.y).toBeCloseTo(130);
  });

  it('下端到達ブロックはプレイヤーへダメージを与えて削除される', () => {
    const state = createTestState();
    state.config.blockAdvanceSpeed = 0;
    state.entities.blocks = [
      createBlock({ id: 'block-1', x: 200, y: 195, width: 60, height: 20, hp: 10 }),
    ];
    const world = new World({ seed: 1, initialState: state });
    world.tick(16, []);
    expect(world.state.entities.character.stats.hp).toBe(charA.baseStats.hp - 1);
    expect(world.state.entities.blocks).toHaveLength(0);
  });

  it('HPが0になるとlostへ遷移し以後更新停止する', () => {
    const state = createTestState();
    state.config.blockAdvanceSpeed = 0;
    state.config.blockReachDamage = charA.baseStats.hp;
    state.entities.blocks = [
      createBlock({ id: 'block-1', x: 200, y: 195, width: 60, height: 20, hp: 10 }),
    ];
    const world = new World({ seed: 1, initialState: state });
    world.tick(16, []);
    expect(world.state.phase).toBe('lost');

    const tickCount = world.state.tickCount;
    const hp = world.state.entities.character.stats.hp;
    world.tick(16, [{ type: 'mousemove', x: 340, y: 0 }]);
    expect(world.state.tickCount).toBe(tickCount + 1);
    expect(world.state.entities.character.stats.hp).toBe(hp);
    expect(world.state.entities.bar.x).toBe(200);
  });
});
