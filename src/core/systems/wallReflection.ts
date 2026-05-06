import type { WorldState } from '@/core/world';

function abs(value: number): number {
  return value < 0 ? -value : value;
}

function max(a: number, b: number): number {
  return a > b ? a : b;
}

export function updateWallReflection(state: WorldState): void {
  for (const ball of state.entities.balls) {
    const minX = ball.radius;
    const maxX = state.field.width - ball.radius;
    const minY = ball.radius;
    const maxY = state.field.height - ball.radius;
    let reflected = false;

    if (ball.x <= minX) {
      ball.x = minX;
      ball.vx = abs(ball.vx);
      reflected = true;
    } else if (ball.x >= maxX) {
      ball.x = maxX;
      ball.vx = -abs(ball.vx);
      reflected = true;
    }

    if (ball.y <= minY) {
      ball.y = minY;
      ball.vy = abs(ball.vy);
      reflected = true;
    } else if (ball.y >= maxY) {
      ball.y = maxY;
      ball.vy = -abs(ball.vy);
      ball.damageMultiplier = 1;
      continue;
    }

    if (reflected) {
      ball.damageMultiplier = max(1, ball.damageMultiplier * state.config.wallDecayFactor);
    }
  }
}
