import type { BallState, BarState, WorldState } from '@/core/world';

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

export function getReleaseProgress(state: WorldState): number {
  const bar = state.entities.bar;
  if (bar.mode !== 'releasing' || bar.releaseStartTick === undefined) {
    return 0;
  }
  const elapsedTicks = state.tickCount - bar.releaseStartTick;
  const elapsedMs = elapsedTicks * (1000 / 60);
  return clamp01(elapsedMs / state.config.slingReleaseMs);
}

function calcHorizontalOffset(state: WorldState, bar: BarState): number {
  const horizontalMax = bar.arc.dirX * state.config.slingArcMaxDepthPx * SLING_HORIZONTAL_RANGE_MULTIPLIER;
  if (bar.mode !== 'releasing') {
    return horizontalMax;
  }
  const releaseDepth = bar.releaseDepth ?? 0;
  if (releaseDepth <= 1e-6) {
    return 0;
  }
  const t = clamp01(bar.arc.depth / releaseDepth);
  return horizontalMax * t;
}

export function getArcCenter(state: WorldState, bar: BarState): { x: number; y: number } {
  const verticalOffset = bar.arc.depth * state.config.slingArcMaxDepthPx;
  const horizontalOffset = calcHorizontalOffset(state, bar);
  return {
    x: bar.zeroPosition.x + horizontalOffset,
    y: bar.zeroPosition.y + bar.arc.dirY * verticalOffset,
  };
}

export function isBallTouchingArc(state: WorldState, ball: BallState): boolean {
  const bar = state.entities.bar;
  const arcCenter = getArcCenter(state, bar);
  const halfWidth = bar.zeroPosition.width / 2;
  const halfHeight = bar.zeroPosition.height / 2;
  const left = arcCenter.x - halfWidth;
  const right = arcCenter.x + halfWidth;
  const top = arcCenter.y - halfHeight;
  const bottom = arcCenter.y + halfHeight;
  const nearestX = Math.max(left, Math.min(right, ball.x));
  const nearestY = Math.max(top, Math.min(bottom, ball.y));
  const dx = ball.x - nearestX;
  const dy = ball.y - nearestY;
  return dx * dx + dy * dy <= ball.radius * ball.radius;
}
