export interface BallState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damageMultiplier: number;
}

export interface BarState {
  x: number;
  y: number;
  width: number;
  height: number;
  mode: 'normal' | 'charging';
}

export interface BlockState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
}

export interface BossState {
  hp: number;
  maxHp: number;
}

export interface CharacterState {
  hp: number;
  maxHp: number;
  attackPower: number;
}

export interface WorldConfig {
  ballRadius: number;
  ballSpeed: number;
  wallDecayFactor: number;
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
