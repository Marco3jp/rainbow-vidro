import type { Clock, InputEvent } from '@/platform';

import type { WorldSnapshot, WorldState } from './WorldState';

export class World {
  public readonly state: WorldState;

  public constructor(
    initialState: WorldState = { frame: 0 },
    private readonly clock?: Clock,
  ) {
    this.state = { ...initialState };
  }

  public tick(_stepMs: number, _inputs: ReadonlyArray<InputEvent>): void {
    this.state.frame += 1;
  }

  public snapshot(): WorldSnapshot {
    return structuredClone(this.state);
  }

  public now(): number {
    return this.clock?.now() ?? 0;
  }
}
