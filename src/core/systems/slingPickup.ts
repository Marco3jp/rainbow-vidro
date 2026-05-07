import type { WorldState } from '@/core/world';

import { calcChargeShotMultiplier } from './chargeShot';
import { getReleaseProgress, isBallTouchingArc } from './slingMath';

function removeAttachedId(list: string[], id: string): string[] {
  return list.filter((value) => value !== id);
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
    const dirX = -(bar.releaseDirX ?? 0);
    const dirY = -(bar.releaseDirY ?? 1);
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
