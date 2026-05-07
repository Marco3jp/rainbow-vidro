// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { attachPointerPreview } from '@/app/pointerPreview';

describe('attachPointerPreview', () => {
  it('mousemove で可視カーソル座標を更新する', () => {
    const target = document.createElement('canvas');
    const sink = {
      setVisualBarTargetX: vi.fn(),
      setVisualPointer: vi.fn(),
    };
    const dispose = attachPointerPreview(target, (x, y) => ({ x: x - 10, y: y - 20 }), sink);

    target.dispatchEvent(new MouseEvent('mousemove', { clientX: 110, clientY: 220 }));

    expect(sink.setVisualBarTargetX).toHaveBeenCalledWith(100);
    expect(sink.setVisualPointer).toHaveBeenCalledWith({ x: 100, y: 200 });

    dispose();
  });

  it('mouseleave と dispose が正しく反映される', () => {
    const target = document.createElement('canvas');
    const sink = {
      setVisualBarTargetX: vi.fn(),
      setVisualPointer: vi.fn(),
    };
    const dispose = attachPointerPreview(target, (x, y) => ({ x, y }), sink);

    target.dispatchEvent(new MouseEvent('mouseleave'));
    expect(sink.setVisualBarTargetX).toHaveBeenCalledWith(null);
    expect(sink.setVisualPointer).toHaveBeenCalledWith(null);

    dispose();
    sink.setVisualBarTargetX.mockClear();
    sink.setVisualPointer.mockClear();

    target.dispatchEvent(new MouseEvent('mousemove', { clientX: 1, clientY: 2 }));
    expect(sink.setVisualBarTargetX).not.toHaveBeenCalled();
    expect(sink.setVisualPointer).not.toHaveBeenCalled();
  });
});
