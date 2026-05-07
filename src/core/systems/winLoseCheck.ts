import type { WorldState } from '@/core/world';

export function updateWinLosePhase(state: WorldState): void {
  if (state.entities.character.stats.hp <= 0) {
    state.phase = 'lost';
  }
}
