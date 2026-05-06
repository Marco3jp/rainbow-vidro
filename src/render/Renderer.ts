import type { WorldSnapshot } from '@/core/world';

export interface Renderer {
  mount(container: HTMLElement): Promise<void>;
  unmount(): void;
  resize(width: number, height: number): void;
  render(prev: WorldSnapshot, curr: WorldSnapshot, alpha: number): void;
}
