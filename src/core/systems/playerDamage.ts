import type { WorldState } from '@/core/world';

export function applyBlockReachedDamage(state: WorldState): void {
  const nextBlocks = [];
  for (const block of state.entities.blocks) {
    const blockBottom = block.y + block.height / 2;
    if (blockBottom < state.field.height) {
      nextBlocks.push(block);
      continue;
    }
    state.entities.character.stats.hp = Math.max(
      0,
      state.entities.character.stats.hp - state.config.blockReachDamage,
    );
  }
  state.entities.blocks = nextBlocks;
}
