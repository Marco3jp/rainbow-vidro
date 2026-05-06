import type { WorldState } from '@/core/world';

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

export function updateBarReflection(state: WorldState): void {
  const bar = state.entities.bar;
  if (bar.mode === 'charging') {
    return;
  }

  const halfWidth = bar.width / 2;
  const halfHeight = bar.height / 2;
  const left = bar.x - halfWidth;
  const right = bar.x + halfWidth;
  const top = bar.y - halfHeight;
  const bottom = bar.y + halfHeight;

  for (const ball of state.entities.balls) {
    if (ball.bottomReflectPassthrough || ball.vy <= 0) {
      continue;
    }

    const nearestX = clamp(ball.x, left, right);
    const nearestY = clamp(ball.y, top, bottom);
    const dx = ball.x - nearestX;
    const dy = ball.y - nearestY;
    if (dx * dx + dy * dy > ball.radius * ball.radius) {
      continue;
    }

    const speed = Math.hypot(ball.vx, ball.vy);
    const normalizedOffset = clamp((ball.x - bar.x) / halfWidth, -1, 1);
    const angle = normalizedOffset * state.config.barBounceMaxAngleRad;
    ball.vx = speed * Math.sin(angle);
    ball.vy = -Math.abs(speed * Math.cos(angle));
    ball.y = top - ball.radius;
  }
}
