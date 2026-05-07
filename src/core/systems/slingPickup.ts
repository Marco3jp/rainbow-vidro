import type { WorldState } from '@/core/world';

import { calcChargeShotMultiplier } from './chargeShot';
import { getReleaseProgress, isBallTouchingArc } from './slingMath';

function removeAttachedId(list: string[], id: string): string[] {
  return list.filter((value) => value !== id);
}

function normalizeVector(x: number, y: number): { x: number; y: number } {
  const length = Math.hypot(x, y);
  if (length <= 1e-6) {
    return { x: 0, y: -1 };
  }
  return { x: x / length, y: y / length };
}

export function updateSlingPickup(state: WorldState): void {
  const bar = state.entities.bar;
  if (bar.mode !== 'charging' && bar.mode !== 'releasing') {
    return;
  }

  const releaseProgress = bar.mode === 'releasing' ? getReleaseProgress(state) : 0;
  const releaseDepth = bar.releaseDepth ?? bar.arc.depth;
  for (const ball of state.entities.balls) {
    const touching = isBallTouchingArc(state, ball);
    if (bar.mode === 'charging') {
      if (touching) {
        ball.vx = 0;
        ball.vy = 0;
        if (!bar.attachedBallIds.includes(ball.id)) {
          bar.attachedBallIds.push(ball.id);
        }
      } else if (bar.attachedBallIds.includes(ball.id)) {
        bar.attachedBallIds = removeAttachedId(bar.attachedBallIds, ball.id);
      }
      continue;
    }

    if (!touching) {
      continue;
    }
    if (ball.lastChargeHitProgress !== undefined) {
      continue;
    }
    const releaseVector = normalizeVector(bar.releaseDirX ?? 0, bar.releaseDirY ?? 1);
    const dirX = -releaseVector.x;
    const dirY = -releaseVector.y;
    const speed = state.config.slingShotBaseSpeed * state.entities.character.stats.ballSpeed;
    ball.vx = dirX * speed;
    ball.vy = dirY * speed;
    ball.lastChargeHitProgress = releaseProgress;
    ball.damageMultiplier *= calcChargeShotMultiplier(
      releaseDepth,
      releaseProgress,
      state.entities.character,
      state.config,
    );
  }
}
