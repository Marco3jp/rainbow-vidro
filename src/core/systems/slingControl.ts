import type { WorldState } from '@/core/world';
import type { InputEvent } from '@/platform';

import { calcChargeShotMultiplier, clampDamageMultiplier } from './chargeShot';
import { getReleaseProgress } from './slingMath';

const SLING_HORIZONTAL_RANGE_MULTIPLIER = 2;

function clamp01(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

function normalizeVector(x: number, y: number): { x: number; y: number } {
  const length = Math.hypot(x, y);
  if (length <= 1e-6) {
    return { x: 0, y: -1 };
  }
  return { x: x / length, y: y / length };
}

function calcSlingDirectionFromPointerX(
  pointerX: number,
  zeroX: number,
  maxDepthPx: number,
): {
  x: number;
  y: number;
} {
  const safeMaxDepth = Math.max(1, maxDepthPx * SLING_HORIZONTAL_RANGE_MULTIPLIER);
  const horizontal = clamp((pointerX - zeroX) / safeMaxDepth, -1, 1);
  return { x: horizontal, y: 1 };
}

function launchBall(state: WorldState, ballId: string, hitProgress: number): void {
  const bar = state.entities.bar;
  const ball = state.entities.balls.find((candidate) => candidate.id === ballId);
  if (ball === undefined || bar.releaseDepth === undefined) {
    return;
  }
  const releaseVector = normalizeVector(bar.releaseDirX ?? 0, bar.releaseDirY ?? 1);
  const dirX = -releaseVector.x;
  const dirY = -releaseVector.y;
  const baseSpeed = state.config.slingShotBaseSpeed * state.entities.character.stats.ballSpeed;
  ball.vx = dirX * baseSpeed;
  ball.vy = dirY * baseSpeed;
  ball.lastChargeHitProgress = hitProgress;
  const next =
    ball.damageMultiplier *
    calcChargeShotMultiplier(bar.releaseDepth, hitProgress, state.entities.character, state.config);
  ball.damageMultiplier = clampDamageMultiplier(next, state.entities.character);
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

  const latestPointer = [...inputs]
    .reverse()
    .find((input) => input.type === 'mousemove' || input.type === 'mousedown');
  const hasMouseDown = inputs.some((input) => input.type === 'mousedown');
  const hasMouseUp = inputs.some((input) => input.type === 'mouseup');

  if (bar.mode === 'normal' && hasMouseDown) {
    bar.mode = 'charging';
    bar.chargeStartTick = state.tickCount;
    bar.attachedBallIds = [];
    // mousedown の時点で方向を初期化して、前回チャージの向きを持ち越さない。
    const pointerOnDown = [...inputs].reverse().find((input) => input.type === 'mousedown');
    if (pointerOnDown !== undefined) {
      const direction = calcSlingDirectionFromPointerX(
        pointerOnDown.x,
        bar.zeroPosition.x,
        state.config.slingArcMaxDepthPx,
      );
      bar.arc.dirX = direction.x;
      bar.arc.dirY = direction.y;
    } else {
      bar.arc.dirX = 0;
      bar.arc.dirY = 1;
    }
  }

  if (bar.mode === 'charging') {
    if (latestPointer !== undefined) {
      const direction = calcSlingDirectionFromPointerX(
        latestPointer.x,
        bar.zeroPosition.x,
        state.config.slingArcMaxDepthPx,
      );
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
      for (const ball of state.entities.balls) {
        delete ball.lastChargeHitProgress;
      }
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
