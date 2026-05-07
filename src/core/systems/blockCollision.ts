import { calcDamage } from '@/core/systems/damage';
import type { BallState, BlockState, WorldState } from '@/core/world';

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

function resolveBlockReflection(ball: BallState, block: BlockState): void {
  const halfWidth = block.width / 2;
  const halfHeight = block.height / 2;
  const dx = ball.x - block.x;
  const dy = ball.y - block.y;
  const overlapX = halfWidth + ball.radius - Math.abs(dx);
  const overlapY = halfHeight + ball.radius - Math.abs(dy);

  if (overlapX < overlapY) {
    if (dx < 0) {
      ball.x = block.x - halfWidth - ball.radius;
      ball.vx = -Math.abs(ball.vx);
    } else {
      ball.x = block.x + halfWidth + ball.radius;
      ball.vx = Math.abs(ball.vx);
    }
  } else if (dy < 0) {
    ball.y = block.y - halfHeight - ball.radius;
    ball.vy = -Math.abs(ball.vy);
  } else {
    ball.y = block.y + halfHeight + ball.radius;
    ball.vy = Math.abs(ball.vy);
  }

  ball.bottomReflectPassthrough = false;
}

function isBallCollidingWithBlock(ball: BallState, block: BlockState): boolean {
  const left = block.x - block.width / 2;
  const right = block.x + block.width / 2;
  const top = block.y - block.height / 2;
  const bottom = block.y + block.height / 2;
  const nearestX = clamp(ball.x, left, right);
  const nearestY = clamp(ball.y, top, bottom);
  const dx = ball.x - nearestX;
  const dy = ball.y - nearestY;
  return dx * dx + dy * dy <= ball.radius * ball.radius;
}

export function updateBlockCollision(state: WorldState): void {
  if (state.entities.blocks.length === 0 || state.entities.balls.length === 0) {
    return;
  }

  const pendingDamage = new Map<string, number>();
  const blockById = new Map(state.entities.blocks.map((block) => [block.id, block]));

  for (const ball of state.entities.balls) {
    for (const block of state.entities.blocks) {
      if (!isBallCollidingWithBlock(ball, block)) {
        continue;
      }

      const damage = calcDamage({
        baseAttack: state.entities.character.stats.attack,
        multipliers: [ball.damageMultiplier],
      });
      const accumulatedDamage = pendingDamage.get(block.id) ?? 0;
      pendingDamage.set(block.id, accumulatedDamage + damage);
      const willBeDestroyed = block.hp - (accumulatedDamage + damage) <= 0;
      if (willBeDestroyed) {
        // 破壊できるブロックは貫通して進行する。
        continue;
      }
      resolveBlockReflection(ball, block);
      break;
    }
  }

  if (pendingDamage.size === 0) {
    return;
  }

  const destroyed = new Set<string>();
  for (const [blockId, damage] of pendingDamage) {
    const block = blockById.get(blockId);
    if (block === undefined) {
      continue;
    }
    block.hp -= damage;
    if (block.hp <= 0) {
      destroyed.add(block.id);
      state.entities.character.exp += block.expReward;
    }
  }

  if (destroyed.size > 0) {
    state.entities.blocks = state.entities.blocks.filter((block) => !destroyed.has(block.id));
  }
}
