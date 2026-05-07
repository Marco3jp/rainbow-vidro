import type { BallState, BarState, WorldState } from '@/core/world';

const SLING_HORIZONTAL_RANGE_MULTIPLIER = 2;
const SLING_ARC_DEPTH_MULTIPLIER = 3;
const ARC_COLLISION_THICKNESS_FACTOR = 0.18;
const ARC_COLLISION_MIN_THICKNESS = 0.75;

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

function calcHorizontalOffsetFromParams(
  maxDepthPx: number,
  mode: BarState['mode'],
  dirX: number,
  depth: number,
  releaseDepth: number | undefined,
): number {
  const horizontalMax = dirX * maxDepthPx * SLING_HORIZONTAL_RANGE_MULTIPLIER;
  if (mode !== 'releasing') {
    return horizontalMax;
  }
  const effectiveReleaseDepth = releaseDepth ?? 0;
  if (effectiveReleaseDepth <= 1e-6) {
    return 0;
  }
  const t = clamp01(depth / effectiveReleaseDepth);
  return horizontalMax * t;
}

export function getArcCenter(state: WorldState, bar: BarState): { x: number; y: number } {
  const verticalOffset = bar.arc.depth * state.config.slingArcMaxDepthPx * SLING_ARC_DEPTH_MULTIPLIER;
  const horizontalOffset = calcHorizontalOffset(state, bar);
  return {
    x: bar.zeroPosition.x + horizontalOffset,
    y: bar.zeroPosition.y + bar.arc.dirY * verticalOffset,
  };
}

export function getArcCenterFromParams(
  state: WorldState,
  params: {
    mode: BarState['mode'];
    depth: number;
    dirX: number;
    dirY: number;
    releaseDepth: number | undefined;
  },
): { x: number; y: number } {
  const verticalOffset =
    params.depth * state.config.slingArcMaxDepthPx * SLING_ARC_DEPTH_MULTIPLIER;
  const horizontalOffset = calcHorizontalOffsetFromParams(
    state.config.slingArcMaxDepthPx,
    params.mode,
    params.dirX,
    params.depth,
    params.releaseDepth,
  );
  const bar = state.entities.bar;
  return {
    x: bar.zeroPosition.x + horizontalOffset,
    y: bar.zeroPosition.y + params.dirY * verticalOffset,
  };
}

export function isBallTouchingArc(state: WorldState, ball: BallState): boolean {
  return isPointTouchingArc(state, {
    x: ball.x,
    y: ball.y,
    radius: ball.radius,
    mode: state.entities.bar.mode,
    depth: state.entities.bar.arc.depth,
    dirX: state.entities.bar.arc.dirX,
    dirY: state.entities.bar.arc.dirY,
    releaseDepth: state.entities.bar.releaseDepth,
  });
}

export function isPointTouchingArc(
  state: WorldState,
  params: {
    x: number;
    y: number;
    radius: number;
    mode: BarState['mode'];
    depth: number;
    dirX: number;
    dirY: number;
    releaseDepth: number | undefined;
  },
): boolean {
  const bar = state.entities.bar;
  const center = getArcCenterFromParams(state, params);
  const start = { x: bar.zeroPosition.x - bar.zeroPosition.width / 2, y: bar.zeroPosition.y };
  const end = { x: bar.zeroPosition.x + bar.zeroPosition.width / 2, y: bar.zeroPosition.y };
  const control = { x: center.x, y: center.y };
  const segmentCount = Math.max(3, Math.floor(state.config.slingArcSegments));
  const arcThickness = Math.max(
    ARC_COLLISION_MIN_THICKNESS,
    bar.zeroPosition.height * ARC_COLLISION_THICKNESS_FACTOR,
  );
  let prevPoint = start;
  for (let i = 1; i <= segmentCount; i += 1) {
    const t = i / segmentCount;
    const mt = 1 - t;
    const point = {
      x: mt * mt * start.x + 2 * mt * t * control.x + t * t * end.x,
      y: mt * mt * start.y + 2 * mt * t * control.y + t * t * end.y,
    };
    const nearest = nearestPointOnSegment(params.x, params.y, prevPoint.x, prevPoint.y, point.x, point.y);
    const dx = params.x - nearest.x;
    const dy = params.y - nearest.y;
    const allowed = params.radius + arcThickness;
    if (dx * dx + dy * dy <= allowed * allowed) {
      return true;
    }
    prevPoint = point;
  }
  return false;
}

function nearestPointOnSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): { x: number; y: number } {
  const vx = x2 - x1;
  const vy = y2 - y1;
  const lengthSq = vx * vx + vy * vy;
  if (lengthSq <= 1e-8) {
    return { x: x1, y: y1 };
  }
  const t = clamp01(((px - x1) * vx + (py - y1) * vy) / lengthSq);
  return {
    x: x1 + vx * t,
    y: y1 + vy * t,
  };
}
