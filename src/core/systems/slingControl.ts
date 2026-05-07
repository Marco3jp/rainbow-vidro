import type { WorldState } from '@/core/world';
import type { InputEvent } from '@/platform';

import { getReleaseProgress } from './slingMath';

function clamp01(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

function normalizeDirection(dx: number, dy: number): { x: number; y: number } {
  const length = Math.hypot(dx, dy);
  if (length <= 1e-6) {
    return { x: 0, y: -1 };
  }
  return { x: dx / length, y: dy / length };
}

function launchBall(state: WorldState, ballId: string, hitProgress: number): void {
  const bar = state.entities.bar;
  const ball = state.entities.balls.find((candidate) => candidate.id === ballId);
  if (ball === undefined || bar.releaseDepth === undefined) {
    return;
  }
  const dirX = -(bar.releaseDirX ?? 0);
  const dirY = -(bar.releaseDirY ?? -1);
  const baseSpeed = state.config.slingShotBaseSpeed * state.entities.character.stats.ballSpeed;
  ball.vx = dirX * baseSpeed;
  ball.vy = dirY * baseSpeed;
  ball.lastChargeHitProgress = hitProgress;
}

export function updateSlingControl(
  state: WorldState,
  inputs: ReadonlyArray<InputEvent>,
  _stepMs: number,
): void {
  const bar = state.entities.bar;
  const fieldBar = state.entities.bar;
  bar.zeroPosition = {
    x: fieldBar.x,
    y: fieldBar.y,
    width: fieldBar.width,
    height: fieldBar.height,
  };

  const latestMove = [...inputs].reverse().find((input) => input.type === 'mousemove');
  const hasMouseDown = inputs.some((input) => input.type === 'mousedown');
  const hasMouseUp = inputs.some((input) => input.type === 'mouseup');

  if (bar.mode === 'normal' && hasMouseDown) {
    bar.mode = 'charging';
    bar.chargeStartTick = state.tickCount;
    bar.attachedBallIds = [];
  }

  if (bar.mode === 'charging') {
    if (latestMove !== undefined) {
      const direction = normalizeDirection(latestMove.x - bar.zeroPosition.x, latestMove.y - bar.zeroPosition.y);
      bar.arc.dirX = direction.x;
      bar.arc.dirY = direction.y;
    }
    if (bar.chargeStartTick !== undefined) {
      const elapsedTicks = state.tickCount - bar.chargeStartTick;
      const elapsedMs = elapsedTicks * (1000 / 60);
      bar.arc.depth = clamp01(elapsedMs / state.config.slingChargeMaxMs);
    }
    if (hasMouseUp) {
      bar.mode = 'releasing';
      bar.releaseStartTick = state.tickCount;
      bar.releaseDepth = bar.arc.depth;
      bar.releaseDirX = bar.arc.dirX;
      bar.releaseDirY = bar.arc.dirY;
      for (const ballId of bar.attachedBallIds) {
        launchBall(state, ballId, 0);
      }
      bar.attachedBallIds = [];
    }
    return;
  }

  if (bar.mode === 'releasing') {
    const progress = getReleaseProgress(state);
    const releaseDepth = bar.releaseDepth ?? 0;
    bar.arc.depth = releaseDepth * (1 - progress);
    if (progress >= 1) {
      bar.mode = 'normal';
      bar.arc.depth = 0;
      delete bar.chargeStartTick;
      delete bar.releaseStartTick;
      delete bar.releaseDepth;
      delete bar.releaseDirX;
      delete bar.releaseDirY;
      bar.attachedBallIds = [];
    }
  }
}
