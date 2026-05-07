export type InputEvent =
  | { type: 'mousemove'; x: number; y: number }
  | { type: 'mousedown'; x: number; y: number }
  | { type: 'mouseup'; x: number; y: number };

export interface InputSource {
  poll(): InputEvent[];
  dispose(): void;
}

type CoordinateMapper = (x: number, y: number) => { x: number; y: number };

export class MouseInputSource implements InputSource {
  private readonly queue: InputEvent[] = [];
  private readonly globalTarget: EventTarget | null;
  private readonly onMouseMove = (event: MouseEvent): void => {
    this.push('mousemove', event.clientX, event.clientY);
  };
  private readonly onMouseDown = (event: MouseEvent): void => {
    this.push('mousedown', event.clientX, event.clientY);
  };
  private readonly onMouseUp = (event: MouseEvent): void => {
    this.push('mouseup', event.clientX, event.clientY);
  };

  public constructor(
    private readonly target: EventTarget,
    private readonly mapper: CoordinateMapper = (x, y) => ({ x, y }),
  ) {
    this.globalTarget = typeof window === 'undefined' ? null : window;
    target.addEventListener('mousemove', this.onMouseMove as EventListener);
    target.addEventListener('mousedown', this.onMouseDown as EventListener);
    target.addEventListener('mouseup', this.onMouseUp as EventListener);
    this.globalTarget?.addEventListener('mouseup', this.onMouseUp as EventListener);
  }

  public poll(): InputEvent[] {
    return this.queue.splice(0, this.queue.length);
  }

  public dispose(): void {
    this.target.removeEventListener('mousemove', this.onMouseMove as EventListener);
    this.target.removeEventListener('mousedown', this.onMouseDown as EventListener);
    this.target.removeEventListener('mouseup', this.onMouseUp as EventListener);
    this.globalTarget?.removeEventListener('mouseup', this.onMouseUp as EventListener);
    this.queue.length = 0;
  }

  private push(type: InputEvent['type'], x: number, y: number): void {
    const mapped = this.mapper(x, y);
    this.queue.push({ type, x: mapped.x, y: mapped.y });
  }
}

export class ReplayInputSource implements InputSource {
  public poll(): InputEvent[] {
    return [];
  }

  public dispose(): void {}
}
