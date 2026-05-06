import { createBall } from '@/core/entities/Ball';
import { createBar } from '@/core/entities/Bar';
import { updateBar } from '@/core/systems/barControl';
import { updateBalls } from '@/core/systems/movement';
import { createMulberry32, type InputEvent, type SeededRng, SimClock } from '@/platform';

import type { WorldSnapshot, WorldState } from './WorldState';

const DEFAULT_FIELD = { width: 960, height: 540 } as const;

function createInitialState(rng: SeededRng): WorldState {
  return {
    tickCount: 0,
    elapsedMs: 0,
    phase: 'preparing',
    entities: {
      balls: [
        createBall({
          id: 'ball-0',
          x: DEFAULT_FIELD.width / 2,
          y: DEFAULT_FIELD.height * 0.7,
          vx: 160,
          vy: -260,
          radius: 8,
        }),
      ],
      bar: createBar({
        x: DEFAULT_FIELD.width / 2,
        y: DEFAULT_FIELD.height - 30,
        width: 120,
        height: 16,
      }),
      blocks: [],
      boss: {
        hp: 100,
        maxHp: 100,
      },
      character: {
        hp: 10,
        maxHp: 10,
        attackPower: 1,
      },
    },
    field: { ...DEFAULT_FIELD },
    rngState: rng.getState(),
    nextBallId: 1,
    config: {
      ballRadius: 8,
      ballSpeed: 300,
    },
  };
}

export class World {
  public readonly seed: number;
  private readonly rng: SeededRng;
  private readonly clock: SimClock;
  public readonly state: WorldState;

  public constructor(
    opts: {
      seed?: number;
      clock?: SimClock;
      rng?: SeededRng;
      initialState?: WorldState;
    } = {},
  ) {
    this.seed = opts.seed ?? 1;
    this.rng = opts.rng ?? createMulberry32(this.seed);
    this.clock = opts.clock ?? new SimClock();
    this.state = structuredClone(opts.initialState ?? createInitialState(this.rng));
    this.state.rngState = this.rng.getState();
  }

  public tick(stepMs: number, inputs: ReadonlyArray<InputEvent>): void {
    this.state.tickCount += 1;
    this.state.elapsedMs += stepMs;
    this.clock.advance(stepMs);
    updateBar(this.state, inputs);
    updateBalls(this.state, stepMs);
    this.state.rngState = this.rng.getState();
    if (this.state.phase === 'preparing') {
      this.state.phase = 'playing';
    }
  }

  public snapshot(): WorldSnapshot {
    return structuredClone(this.state);
  }

  public now(): number {
    return this.clock.now();
  }

  public nextBallId(): string {
    const id = `ball-${this.state.nextBallId}`;
    this.state.nextBallId += 1;
    return id;
  }
}
