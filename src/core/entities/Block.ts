import type { BlockState } from '@/core/world';

export interface CreateBlockOptions {
  id: string;
  kind?: BlockState['kind'];
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp?: number;
  expReward?: number;
}

export function createBlock(opts: CreateBlockOptions): BlockState {
  return {
    id: opts.id,
    kind: opts.kind ?? 'normal',
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    hp: opts.hp,
    maxHp: opts.maxHp ?? opts.hp,
    expReward: opts.expReward ?? 1,
  };
}

export interface BlockGridConfig {
  rows: number;
  cols: number;
  startX: number;
  startY: number;
  blockWidth: number;
  blockHeight: number;
  gapX: number;
  gapY: number;
  hp: number;
  expReward: number;
}

export function createBlockGrid(config: BlockGridConfig): BlockState[] {
  const blocks: BlockState[] = [];
  for (let row = 0; row < config.rows; row += 1) {
    for (let col = 0; col < config.cols; col += 1) {
      blocks.push(
        createBlock({
          id: `block-${row}-${col}`,
          x: config.startX + col * (config.blockWidth + config.gapX),
          y: config.startY + row * (config.blockHeight + config.gapY),
          width: config.blockWidth,
          height: config.blockHeight,
          hp: config.hp,
          expReward: config.expReward,
        }),
      );
    }
  }
  return blocks;
}
