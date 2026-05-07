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
    field: { width: 400, height: 240 },
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

describe('スリングシステム', () => {
  it('mousedown で charging に入り、depth は時間で増加して上限でクランプされる', () => {
    const world = new World({ seed: 1, initialState: createTestState() });
    world.tick(1000 / 60, [{ type: 'mousedown', x: 250, y: 120 }]);
    expect(world.state.entities.bar.mode).toBe('charging');
    expect(world.state.entities.bar.arc.depth).toBe(0);

    for (let i = 0; i < 20; i += 1) {
      world.tick(1000 / 60, []);
    }
    expect(world.state.entities.bar.arc.depth).toBeCloseTo(1, 4);
    expect(world.state.entities.bar.arc.depth).toBeLessThanOrEqual(1);
  });

  it('mouseup で releasing に遷移する', () => {
    const state = createTestState();
    state.entities.bar.mode = 'charging';
    state.entities.bar.arc.depth = 0.6;
    const world = new World({ seed: 1, initialState: state });
    world.tick(1000 / 60, [{ type: 'mouseup', x: 220, y: 120 }]);
    expect(world.state.entities.bar.mode).toBe('releasing');
    expect(world.state.entities.bar.releaseDepth).toBeCloseTo(0.6);
  });

  it('チャージ中接触で停止し attachedBallIds に入る', () => {
    const state = createTestState();
    state.entities.bar.mode = 'charging';
    state.entities.balls = [createBall({ id: 'ball-1', x: 200, y: 180, vx: 50, vy: 0, radius: 8 })];
    const world = new World({ seed: 1, initialState: state });
    world.tick(1000 / 60, []);
    const ball = world.state.entities.balls[0];
    expect(ball?.vx).toBe(0);
    expect(ball?.vy).toBe(0);
    expect(world.state.entities.bar.attachedBallIds).toContain('ball-1');
  });

  it('attached ボールはリリース位置で即射出され hitProgress=0 が記録される', () => {
    const state = createTestState();
    state.entities.bar.mode = 'charging';
    state.entities.bar.arc.depth = 1;
    state.entities.bar.arc.dirX = 0;
    state.entities.bar.arc.dirY = -1;
    state.entities.bar.attachedBallIds = ['ball-1'];
    state.entities.balls = [createBall({ id: 'ball-1', x: 200, y: 108, vx: 0, vy: 0, radius: 8 })];
    const world = new World({ seed: 1, initialState: state });
    world.tick(1000 / 60, [{ type: 'mouseup', x: 200, y: 120 }]);
    const ball = world.state.entities.balls[0];
    expect(ball?.lastChargeHitProgress).toBe(0);
    expect(ball?.vy).toBeGreaterThan(0);
  });

  it('リリース中は depth が線形に減少し、完了後に normal へ戻る', () => {
    const state = createTestState();
    state.tickCount = 10;
    state.entities.bar.mode = 'releasing';
    state.entities.bar.releaseStartTick = 10;
    state.entities.bar.releaseDepth = 1;
    state.entities.bar.releaseDirX = 0;
    state.entities.bar.releaseDirY = -1;
    state.entities.bar.arc.depth = 1;
    const world = new World({ seed: 1, initialState: state });
    world.tick(1000 / 60, []);
    expect(world.state.entities.bar.arc.depth).toBeLessThan(1);

    for (let i = 0; i < 8; i += 1) {
      world.tick(1000 / 60, []);
    }
    expect(world.state.entities.bar.mode).toBe('normal');
    expect(world.state.entities.bar.arc.depth).toBe(0);
  });

  it('リリース戻り中に接触したボールは停止せず即射出される', () => {
    const state = createTestState();
    state.tickCount = 20;
    state.entities.bar.mode = 'releasing';
    state.entities.bar.releaseStartTick = 18;
    state.entities.bar.releaseDepth = 1;
    state.entities.bar.releaseDirX = 0;
    state.entities.bar.releaseDirY = -1;
    state.entities.bar.arc.depth = 0.5;
    state.entities.balls = [createBall({ id: 'ball-1', x: 200, y: 145, vx: -10, vy: 20, radius: 8 })];
    const world = new World({ seed: 1, initialState: state });
    world.tick(1000 / 60, []);
    const ball = world.state.entities.balls[0];
    expect(ball?.vy).toBeGreaterThan(0);
    expect(ball?.lastChargeHitProgress ?? 0).toBeGreaterThan(0);
    expect(ball?.lastChargeHitProgress ?? 0).toBeLessThanOrEqual(1);
  });

  it('湾の内側にいるボールは通常進行を続ける', () => {
    const state = createTestState();
    state.entities.bar.mode = 'charging';
    state.entities.bar.arc.depth = 1;
    state.entities.bar.arc.dirX = 0;
    state.entities.bar.arc.dirY = -1;
    state.entities.balls = [createBall({ id: 'ball-1', x: 200, y: 160, vx: 0, vy: -60, radius: 8 })];
    const world = new World({ seed: 1, initialState: state });
    const beforeY = world.state.entities.balls[0]?.y ?? 0;
    world.tick(1000 / 60, []);
    const after = world.state.entities.balls[0];
    expect(after?.y).toBeLessThan(beforeY);
    expect(world.state.entities.bar.attachedBallIds).toHaveLength(0);
  });
});

