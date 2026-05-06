import type { WorldState } from '@/core/world';

export function updateBalls(state: WorldState, dtMs: number): void {
  const dtSeconds = dtMs / 1000;
  for (const ball of state.entities.balls) {
    ball.x += ball.vx * dtSeconds;
    ball.y += ball.vy * dtSeconds;
  }
}
