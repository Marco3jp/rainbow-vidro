import { describe, expectTypeOf, it } from 'vitest';

import type { WorldSnapshot } from '@/core/world';
import type { Renderer } from '@/render';

class MockRenderer implements Renderer {
  public async mount(_container: HTMLElement): Promise<void> {}
  public unmount(): void {}
  public resize(_width: number, _height: number): void {}
  public render(_prev: WorldSnapshot, _curr: WorldSnapshot, _alpha: number): void {}
}

describe('Renderer contract', () => {
  it('モック実装が Renderer インタフェースを満たす', () => {
    expectTypeOf(new MockRenderer()).toMatchTypeOf<Renderer>();
  });
});
