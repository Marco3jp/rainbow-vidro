import type { WorldState } from '@/core/world';
import type { InputEvent } from '@/platform';

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

export function updateBar(state: WorldState, inputs: ReadonlyArray<InputEvent>): void {
  const mouseMove = [...inputs].reverse().find((input) => input.type === 'mousemove');
  if (mouseMove === undefined) {
    return;
  }

  const halfWidth = state.entities.bar.width / 2;
  state.entities.bar.x = clamp(mouseMove.x, halfWidth, state.field.width - halfWidth);
}
