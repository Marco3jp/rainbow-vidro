import { describe, expect, it } from 'vitest';
import { charA, createBall, createCharacter, World, type WorldState } from '@/core';
import { calcChargeFactor, calcChargeShotMultiplier, calcHitFactor } from '@/core/systems/chargeShot';

const SLING_HORIZONTAL_RANGE_MULTIPLIER = 2;

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
        arc: { dirX: 0, dirY: 1, depth: 0 },
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
      slingPostFadeMs: 140,
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

  it('チャージ開始時に前回の向きを引き継がず、mousedown位置で向きが初期化される', () => {
    const state = createTestState();
    state.entities.bar.arc.dirX = 0.8;
    state.entities.bar.arc.dirY = 0.6;
    const world = new World({ seed: 1, initialState: state });
    world.tick(1000 / 60, [{ type: 'mousedown', x: 200, y: 20 }]);
    expect(world.state.entities.bar.mode).toBe('charging');
    expect(world.state.entities.bar.arc.dirX).toBeCloseTo(0);
    expect(world.state.entities.bar.arc.dirY).toBeCloseTo(1);
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

  it('上下どこで操作しても左右入力だけで角度が決まる', () => {
    const base = createTestState();
    const highYWorld = new World({ seed: 1, initialState: structuredClone(base) });
    highYWorld.tick(1000 / 60, [{ type: 'mousedown', x: 200, y: 40 }]);
    highYWorld.tick(1000 / 60, [{ type: 'mousemove', x: 260, y: 20 }]);

    const lowYWorld = new World({ seed: 1, initialState: structuredClone(base) });
    lowYWorld.tick(1000 / 60, [{ type: 'mousedown', x: 200, y: 220 }]);
    lowYWorld.tick(1000 / 60, [{ type: 'mousemove', x: 260, y: 230 }]);

    expect(highYWorld.state.entities.bar.arc.dirX).toBeCloseTo(lowYWorld.state.entities.bar.arc.dirX);
    expect(highYWorld.state.entities.bar.arc.dirY).toBeCloseTo(lowYWorld.state.entities.bar.arc.dirY);
    expect(highYWorld.state.entities.bar.arc.dirY).toBeGreaterThan(0);
  });

  it('チャージ中のスリング中心XはカーソルXに追従する', () => {
    const world = new World({ seed: 1, initialState: createTestState() });
    world.tick(1000 / 60, [{ type: 'mousedown', x: 248, y: 20 }]);
    world.tick(1000 / 60, [{ type: 'mousemove', x: 260, y: 220 }]);
    const centerX =
      world.state.entities.bar.zeroPosition.x +
      world.state.entities.bar.arc.dirX *
        world.state.config.slingArcMaxDepthPx *
        SLING_HORIZONTAL_RANGE_MULTIPLIER;
    expect(centerX).toBeCloseTo(260, 2);
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
    state.entities.bar.arc.dirY = 1;
    state.entities.bar.attachedBallIds = ['ball-1'];
    state.entities.balls = [createBall({ id: 'ball-1', x: 200, y: 108, vx: 0, vy: 0, radius: 8 })];
    const world = new World({ seed: 1, initialState: state });
    world.tick(1000 / 60, [{ type: 'mouseup', x: 200, y: 120 }]);
    const ball = world.state.entities.balls[0];
    expect(ball?.lastChargeHitProgress).toBe(0);
    expect(ball?.vy).toBeLessThan(0);
  });

  it('リリース中は depth が線形に減少し、完了後に normal へ戻る', () => {
    const state = createTestState();
    state.tickCount = 10;
    state.entities.bar.mode = 'releasing';
    state.entities.bar.releaseStartTick = 10;
    state.entities.bar.releaseDepth = 1;
    state.entities.bar.releaseDirX = 0;
    state.entities.bar.releaseDirY = 1;
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
    state.entities.bar.releaseDirY = 1;
    state.entities.bar.arc.depth = 0.5;
    state.entities.balls = [createBall({ id: 'ball-1', x: 200, y: 216, vx: -10, vy: 20, radius: 8 })];
    const world = new World({ seed: 1, initialState: state });
    world.tick(1000 / 60, []);
    const ball = world.state.entities.balls[0];
    expect(ball?.vy).toBeLessThan(0);
    expect(ball?.lastChargeHitProgress ?? 0).toBeGreaterThan(0);
    expect(ball?.lastChargeHitProgress ?? 0).toBeLessThanOrEqual(1);
  });

  it('リリース中に接触し続けても倍率は1回だけ適用される', () => {
    const state = createTestState();
    state.tickCount = 20;
    state.entities.bar.mode = 'releasing';
    state.entities.bar.releaseStartTick = 18;
    state.entities.bar.releaseDepth = 1;
    state.entities.bar.releaseDirX = 0;
    state.entities.bar.releaseDirY = 1;
    state.entities.bar.arc.depth = 0.5;
    state.entities.balls = [createBall({ id: 'ball-1', x: 200, y: 216, vx: 0, vy: 0, radius: 8 })];
    const world = new World({ seed: 1, initialState: state });

    world.tick(1000 / 60, []);
    const firstMultiplier = world.state.entities.balls[0]?.damageMultiplier ?? 1;
    world.tick(1000 / 60, []);
    const secondMultiplier = world.state.entities.balls[0]?.damageMultiplier ?? 1;
    expect(secondMultiplier).toBeCloseTo(firstMultiplier);
  });

  it('湾の内側にいるボールは通常進行を続ける', () => {
    const state = createTestState();
    state.entities.bar.mode = 'charging';
    state.entities.bar.arc.depth = 1;
    state.entities.bar.arc.dirX = 0;
    state.entities.bar.arc.dirY = 1;
    state.entities.balls = [createBall({ id: 'ball-1', x: 200, y: 160, vx: 0, vy: -60, radius: 8 })];
    const world = new World({ seed: 1, initialState: state });
    const beforeY = world.state.entities.balls[0]?.y ?? 0;
    world.tick(1000 / 60, []);
    const after = world.state.entities.balls[0];
    expect(after?.y).toBeLessThan(beforeY);
    expect(world.state.entities.bar.attachedBallIds).toHaveLength(0);
  });
});

describe('チャージショット倍率', () => {
  it('端点で min/max を返す', () => {
    expect(calcChargeFactor(0, { chargeFactorMin: 1, chargeFactorMax: 2.5 })).toBe(1);
    expect(calcChargeFactor(1, { chargeFactorMin: 1, chargeFactorMax: 2.5 })).toBe(2.5);
    expect(calcHitFactor(0, { hitFactorMin: 1, hitFactorMax: 2 })).toBe(1);
    expect(calcHitFactor(1, { hitFactorMin: 1, hitFactorMax: 2 })).toBe(2);
  });

  it('中間値を線形補間し、キャラ倍率を乗算する', () => {
    const state = createTestState();
    state.entities.character.stats.chargeShotMultiplier = 1.2;
    const multiplier = calcChargeShotMultiplier(0.5, 0.25, state.entities.character, state.config);
    expect(multiplier).toBeCloseTo((1.75 * 1.25) * 1.2);
  });

  it('火力ランキングに沿う係数関係を満たす', () => {
    const state = createTestState();
    const minPower = state.config.chargeFactorMin * state.config.hitFactorMin;
    const maxPower = state.config.chargeFactorMax * state.config.hitFactorMax;
    expect(minPower).toBeGreaterThanOrEqual(1);
    expect(maxPower).toBeGreaterThan(minPower);
  });
});

