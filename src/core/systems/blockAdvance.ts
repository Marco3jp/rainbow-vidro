import type { WorldState } from '@/core/world';

export function advanceBlocks(state: WorldState, dtMs: number): void {
  const distance = state.config.blockAdvanceSpeed * (dtMs / 1000);
  for (const block of state.entities.blocks) {
    block.y += distance;
  }
}
