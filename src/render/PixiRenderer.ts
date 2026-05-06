import { Application, Color, Graphics } from 'pixi.js';

import type { WorldSnapshot } from '@/core/world';

import type { Renderer } from './Renderer';

export class PixiRenderer implements Renderer {
  private app: Application | null = null;
  private container: HTMLElement | null = null;
  private debugRect: Graphics | null = null;

  public async mount(container: HTMLElement): Promise<void> {
    this.container = container;
    const app = new Application();
    await app.init({
      antialias: true,
      backgroundColor: new Color('#101016'),
      resizeTo: container,
    });
    container.appendChild(app.canvas);
    this.app = app;
  }

  public unmount(): void {
    if (this.app === null || this.container === null) {
      return;
    }
    this.app.destroy(true, { children: true, texture: true });
    this.container = null;
    this.app = null;
    this.debugRect = null;
  }

  public resize(width: number, height: number): void {
    this.app?.renderer.resize(width, height);
  }

  public render(_prev: WorldSnapshot, _curr: WorldSnapshot, _alpha: number): void {}

  public getCanvas(): HTMLCanvasElement | null {
    return this.app?.canvas ?? null;
  }

  public drawDebugRect(): void {
    if (this.app === null) {
      return;
    }
    if (this.debugRect !== null) {
      return;
    }
    const rect = new Graphics();
    rect.rect(80, 80, 180, 120).fill(new Color('#4fd1c5'));
    this.app.stage.addChild(rect);
    this.debugRect = rect;
  }
}
