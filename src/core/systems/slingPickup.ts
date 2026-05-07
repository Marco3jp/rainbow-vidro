import type { WorldState } from '@/core/world';

import { calcChargeShotMultiplier, clampDamageMultiplier } from './chargeShot';
import { getArcCenterFromParams, getReleaseProgress, isPointTouchingArc } from './slingMath';

const COLLISION_TARGET_STEP_PX = 5;
const COLLISION_MAX_SUBSTEPS = 6;

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
  const stepMs = 1000 / 60;
  const dtSeconds = stepMs / 1000;
  const releaseProgressStart =
    bar.mode === 'releasing'
      ? Math.max(
          0,
          (releaseProgress * state.config.slingReleaseMs - stepMs) / state.config.slingReleaseMs,
        )
      : releaseProgress;
  const depthStart =
    bar.mode === 'releasing' ? releaseDepth * (1 - releaseProgressStart) : bar.arc.depth;
  const arcStartCenter = getArcCenterFromParams(state, {
    mode: bar.mode,
    depth: depthStart,
    dirX: bar.arc.dirX,
    dirY: bar.arc.dirY,
    releaseDepth: bar.releaseDepth,
  });
  const arcEndCenter = getArcCenterFromParams(state, {
    mode: bar.mode,
    depth: bar.arc.depth,
    dirX: bar.arc.dirX,
    dirY: bar.arc.dirY,
    releaseDepth: bar.releaseDepth,
  });
  for (const ball of state.entities.balls) {
    const startX = ball.x - ball.vx * dtSeconds;
    const startY = ball.y - ball.vy * dtSeconds;
    const ballMovePx = Math.hypot(ball.x - startX, ball.y - startY);
    const arcMovePx = Math.hypot(
      arcEndCenter.x - arcStartCenter.x,
      arcEndCenter.y - arcStartCenter.y,
    );
    const subSteps = Math.max(
      1,
      Math.min(
        COLLISION_MAX_SUBSTEPS,
        Math.ceil(Math.max(ballMovePx, arcMovePx) / COLLISION_TARGET_STEP_PX),
      ),
    );
    let touched = false;
    let touchedProgress = releaseProgress;
    for (let i = 1; i <= subSteps; i += 1) {
      const t = i / subSteps;
      const sampleX = startX + (ball.x - startX) * t;
      const sampleY = startY + (ball.y - startY) * t;
      const sampleDepth = depthStart + (bar.arc.depth - depthStart) * t;
      const sampleProgress = releaseProgressStart + (releaseProgress - releaseProgressStart) * t;
      if (
        isPointTouchingArc(state, {
          x: sampleX,
          y: sampleY,
          radius: ball.radius,
          mode: bar.mode,
          depth: sampleDepth,
          dirX: bar.arc.dirX,
          dirY: bar.arc.dirY,
          releaseDepth: bar.releaseDepth,
        })
      ) {
        touched = true;
        touchedProgress = sampleProgress;
        break;
      }
    }
    if (bar.mode === 'charging') {
      if (touched) {
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

    if (!touched) {
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
    ball.lastChargeHitProgress = touchedProgress;
    const carried = clampDamageMultiplier(ball.damageMultiplier, state.entities.character);
    ball.damageMultiplier =
      carried *
      calcChargeShotMultiplier(
        releaseDepth,
        touchedProgress,
        state.entities.character,
        state.config,
      );
  }
}
