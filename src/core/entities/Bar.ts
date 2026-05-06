import type { BarState } from '@/core/world';

export interface CreateBarOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  mode?: BarState['mode'];
}

export function createBar(opts: CreateBarOptions): BarState {
  return {
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    mode: opts.mode ?? 'normal',
  };
}
