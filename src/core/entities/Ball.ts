import type { BallState } from '@/core/world';

export interface CreateBallOptions {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export function createBall(opts: CreateBallOptions): BallState {
  return {
    id: opts.id,
    x: opts.x,
    y: opts.y,
    vx: opts.vx,
    vy: opts.vy,
    radius: opts.radius,
  };
}
