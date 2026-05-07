import type { CharacterState } from '@/core/entities';

export interface BallState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damageMultiplier: number;
  bottomReflectPassthrough: boolean;
  /** 直前のチャージショットヒット時の正規化進捗 (0=リリース位置, 1=ゼロ位置)。 */
  lastChargeHitProgress?: number;
}

export interface BarState {
  x: number;
  y: number;
  width: number;
  height: number;
  zeroPosition: { x: number; y: number; width: number; height: number };
  arc: {
    dirX: number;
    dirY: number;
    depth: number;
  };
  mode: 'normal' | 'charging' | 'releasing';
  chargeStartTick?: number;
  releaseStartTick?: number;
  releaseDepth?: number;
  releaseDirX?: number;
  releaseDirY?: number;
  attachedBallIds: string[];
}

export interface BlockState {
  id: string;
  kind: 'normal' | 'special' | 'boss' | 'bossCore';
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  expReward: number;
}

export interface BossState {
  hp: number;
  maxHp: number;
}

export interface WorldConfig {
  ballRadius: number;
  ballSpeed: number;
  wallDecayFactor: number;
  barBounceMaxAngleRad: number;
  blockAdvanceSpeed: number;
  blockReachDamage: number;
  slingChargeMaxMs: number;
  slingReleaseMs: number;
  slingPostFadeMs: number;
  slingArcMaxDepthPx: number;
  slingShotBaseSpeed: number;
  chargeFactorMin: number;
  chargeFactorMax: number;
  hitFactorMin: number;
  hitFactorMax: number;
}

export interface WorldState {
  tickCount: number;
  elapsedMs: number;
  phase: 'preparing' | 'playing' | 'won' | 'lost';
  entities: {
    balls: BallState[];
    bar: BarState;
    blocks: BlockState[];
    boss: BossState;
    character: CharacterState;
  };
  field: { width: number; height: number };
  rngState: number;
  nextBallId: number;
  config: WorldConfig;
}

export type WorldSnapshot = WorldState;
