// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

import { MouseInputSource } from '@/platform';

describe('MouseInputSource', () => {
  it('DOM イベントを poll で取得できる', () => {
    const target = document.createElement('canvas');
    const source = new MouseInputSource(target);

    target.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 20 }));
    target.dispatchEvent(new MouseEvent('mousedown', { clientX: 11, clientY: 21 }));
    target.dispatchEvent(new MouseEvent('mouseup', { clientX: 12, clientY: 22 }));

    expect(source.poll()).toEqual([
      { type: 'mousemove', x: 10, y: 20 },
      { type: 'mousedown', x: 11, y: 21 },
      { type: 'mouseup', x: 12, y: 22 },
    ]);
    expect(source.poll()).toEqual([]);
  });

  it('座標変換関数が適用される', () => {
    const target = document.createElement('canvas');
    const source = new MouseInputSource(target, (x, y) => ({ x: x / 2, y: y / 4 }));

    target.dispatchEvent(new MouseEvent('mousemove', { clientX: 20, clientY: 40 }));

    expect(source.poll()).toEqual([{ type: 'mousemove', x: 10, y: 10 }]);
  });
});
