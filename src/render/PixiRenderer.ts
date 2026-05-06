import { Application, Color, Graphics } from 'pixi.js';

import type { WorldSnapshot } from '@/core/world';

import type { Renderer } from './Renderer';

export class PixiRenderer implements Renderer {
  private app: Application | null = null;
  private container: HTMLElement | null = null;
  private worldLayer: Graphics | null = null;
  private visualBarTargetX: number | null = null;
  private visualPointer: { x: number; y: number } | null = null;
  private cursorGraphics: Graphics | null = null;

  public async mount(container: HTMLElement): Promise<void> {
    this.container = container;
    const app = new Application();
    await app.init({
      antialias: true,
      backgroundColor: new Color('#101016'),
      resizeTo: container,
    });
    app.canvas.style.setProperty('cursor', 'none', 'important');
    app.canvas.style.setProperty('touch-action', 'none', 'important');
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
    this.worldLayer = null;
    this.visualBarTargetX = null;
    this.visualPointer = null;
    this.cursorGraphics = null;
  }

  public resize(width: number, height: number): void {
    this.app?.renderer.resize(width, height);
  }

  public render(prev: WorldSnapshot, curr: WorldSnapshot, alpha: number): void {
    if (this.app === null) {
      return;
    }
    if (this.worldLayer === null) {
      const layer = new Graphics();
      this.app.stage.addChild(layer);
      this.worldLayer = layer;
    }
    if (this.cursorGraphics === null) {
      const cursor = new Graphics();
      cursor.circle(0, 0, 8).stroke({ color: new Color('#f8fafc'), width: 2 });
      cursor
        .moveTo(0, -13)
        .lineTo(0, -7)
        .stroke({ color: new Color('#f8fafc'), width: 2 });
      cursor
        .moveTo(0, 7)
        .lineTo(0, 13)
        .stroke({ color: new Color('#f8fafc'), width: 2 });
      cursor
        .moveTo(-13, 0)
        .lineTo(-7, 0)
        .stroke({ color: new Color('#f8fafc'), width: 2 });
      cursor
        .moveTo(7, 0)
        .lineTo(13, 0)
        .stroke({ color: new Color('#f8fafc'), width: 2 });
      this.app.stage.addChild(cursor);
      this.cursorGraphics = cursor;
    }

    const g = this.worldLayer;
    g.clear();
    const width = this.app.renderer.width;
    const height = this.app.renderer.height;
    const scale = Math.min(width / curr.field.width, height / curr.field.height);
    const offsetX = (width - curr.field.width * scale) / 2;
    const offsetY = (height - curr.field.height * scale) / 2;

    // Field bounds (debug)
    g.rect(offsetX, offsetY, curr.field.width * scale, curr.field.height * scale).stroke({
      color: new Color('#6b7280'),
      width: 2,
    });

    // Bar (interpolated)
    const bar = curr.entities.bar;
    const prevBar = prev.entities.bar;
    const simulatedBarX = prevBar.x + (bar.x - prevBar.x) * alpha;
    const barY = prevBar.y + (bar.y - prevBar.y) * alpha;
    const halfWidth = bar.width / 2;
    const minBarX = halfWidth;
    const maxBarX = curr.field.width - halfWidth;
    const barX =
      this.visualBarTargetX === null
        ? simulatedBarX
        : Math.max(minBarX, Math.min(maxBarX, this.visualBarTargetX));
    g.rect(
      offsetX + (barX - bar.width / 2) * scale,
      offsetY + (barY - bar.height / 2) * scale,
      bar.width * scale,
      bar.height * scale,
    ).fill(new Color('#60a5fa'));

    // Balls (interpolated by id)
    const prevBalls = new Map(prev.entities.balls.map((ball) => [ball.id, ball]));
    for (const ball of curr.entities.balls) {
      const prevBall = prevBalls.get(ball.id);
      const drawX = prevBall === undefined ? ball.x : prevBall.x + (ball.x - prevBall.x) * alpha;
      const drawY = prevBall === undefined ? ball.y : prevBall.y + (ball.y - prevBall.y) * alpha;
      g.circle(offsetX + drawX * scale, offsetY + drawY * scale, ball.radius * scale).fill(
        new Color('#f59e0b'),
      );
    }

    // Blocks (interpolated by id)
    const prevBlocks = new Map(prev.entities.blocks.map((block) => [block.id, block]));
    for (const block of curr.entities.blocks) {
      const prevBlock = prevBlocks.get(block.id);
      const drawX = prevBlock === undefined ? block.x : prevBlock.x + (block.x - prevBlock.x) * alpha;
      const drawY = prevBlock === undefined ? block.y : prevBlock.y + (block.y - prevBlock.y) * alpha;
      g.rect(
        offsetX + (drawX - block.width / 2) * scale,
        offsetY + (drawY - block.height / 2) * scale,
        block.width * scale,
        block.height * scale,
      )
        .fill(new Color('#1f2937'))
        .stroke({ color: new Color('#34d399'), width: 1 });
    }

    const cursor = this.cursorGraphics;
    if (cursor !== null) {
      if (this.visualPointer === null) {
        cursor.visible = false;
      } else {
        cursor.visible = true;
        cursor.x = offsetX + this.visualPointer.x * scale;
        cursor.y = offsetY + this.visualPointer.y * scale;
      }
    }
  }

  public getCanvas(): HTMLCanvasElement | null {
    return this.app?.canvas ?? null;
  }

  public setVisualBarTargetX(x: number | null): void {
    this.visualBarTargetX = x;
  }

  public setVisualPointer(point: { x: number; y: number } | null): void {
    this.visualPointer = point;
  }

  public drawDebugRect(): void {}
}
