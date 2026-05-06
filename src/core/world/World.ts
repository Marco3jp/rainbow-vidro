import { createBall } from '@/core/entities/Ball';
import { createBar } from '@/core/entities/Bar';
import { createCharacter } from '@/core/entities/Character';
import { charA } from '@/core/data';
import { updateBar } from '@/core/systems/barControl';
import { updateBarReflection } from '@/core/systems/barReflection';
import { updateBalls } from '@/core/systems/movement';
import { updateWallReflection } from '@/core/systems/wallReflection';
import { createMulberry32, type InputEvent, type SeededRng, SimClock } from '@/platform';

import type { WorldSnapshot, WorldState } from './WorldState';

const DEFAULT_FIELD = { width: 1200, height: 900 } as const;

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
        y: DEFAULT_FIELD.height - 140,
        width: 120,
        height: 16,
      }),
      blocks: [],
      boss: {
        hp: 100,
        maxHp: 100,
      },
      character: {
        ...createCharacter(charA),
      },
    },
    field: { ...DEFAULT_FIELD },
    rngState: rng.getState(),
    nextBallId: 1,
    config: {
      ballRadius: 8,
      ballSpeed: 300,
      wallDecayFactor: 0.85,
      barBounceMaxAngleRad: Math.PI / 3,
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
    updateWallReflection(this.state);
    updateBarReflection(this.state);
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
