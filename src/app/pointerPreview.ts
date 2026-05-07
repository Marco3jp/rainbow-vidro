export interface PointerPreviewSink {
  setVisualBarTargetX(x: number | null): void;
  setVisualPointer(point: { x: number; y: number } | null): void;
}

export type FieldMapper = (clientX: number, clientY: number) => { x: number; y: number };

export function attachPointerPreview(
  target: EventTarget,
  mapper: FieldMapper,
  sink: PointerPreviewSink,
): () => void {
  const onMouseMove = (event: MouseEvent): void => {
    const mapped = mapper(event.clientX, event.clientY);
    sink.setVisualBarTargetX(mapped.x);
    sink.setVisualPointer(mapped);
  };

  const onMouseLeave = (): void => {
    sink.setVisualBarTargetX(null);
    sink.setVisualPointer(null);
  };

  target.addEventListener('mousemove', onMouseMove as EventListener);
  target.addEventListener('mouseleave', onMouseLeave as EventListener);

  return () => {
    target.removeEventListener('mousemove', onMouseMove as EventListener);
    target.removeEventListener('mouseleave', onMouseLeave as EventListener);
  };
}
