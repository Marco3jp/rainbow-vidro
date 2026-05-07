import { Application, Color, Graphics } from 'pixi.js';

import type { WorldSnapshot } from '@/core/world';

import type { Renderer } from './Renderer';

const SLING_HORIZONTAL_RANGE_MULTIPLIER = 2;
const SLING_ARC_DEPTH_MULTIPLIER = 3;
const FIXED_STEP_MS = 1000 / 60;

function clamp01(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function calcHorizontalOffset(
  mode: WorldSnapshot['entities']['bar']['mode'],
  dirX: number,
  depth: number,
  releaseDepth: number | undefined,
  maxDepth: number,
): number {
  const horizontalMax = maxDepth * SLING_HORIZONTAL_RANGE_MULTIPLIER * dirX;
  if (mode !== 'releasing') {
    return horizontalMax;
  }
  const safeReleaseDepth = releaseDepth ?? 0;
  if (safeReleaseDepth <= 1e-6) {
    return 0;
  }
  const t = clamp01(depth / safeReleaseDepth);
  return horizontalMax * t;
}

function drawQuadraticCurve(
  g: Graphics,
  start: { x: number; y: number },
  control: { x: number; y: number },
  end: { x: number; y: number },
  segments: number,
): void {
  g.moveTo(start.x, start.y);
  for (let i = 1; i <= segments; i += 1) {
    const t = i / segments;
    const mt = 1 - t;
    const x = mt * mt * start.x + 2 * mt * t * control.x + t * t * end.x;
    const y = mt * mt * start.y + 2 * mt * t * control.y + t * t * end.y;
    g.lineTo(x, y);
  }
}

export class PixiRenderer implements Renderer {
  private app: Application | null = null;
  private container: HTMLElement | null = null;
  private worldLayer: Graphics | null = null;
  private visualBarTargetX: number | null = null;
  private visualPointer: { x: number; y: number } | null = null;
  private cursorGraphics: Graphics | null = null;
  private showCollisionDebug = false;
  private postReleaseFadeMs = 0;
  private prevBarMode: WorldSnapshot['entities']['bar']['mode'] = 'normal';

  public async mount(container: HTMLElement): Promise<void> {
    this.container = container;
    const app = new Application();
    await app.init({
      antialias: true,
      backgroundColor: new Color('#101016'),
      resizeTo: container,
    });
    // Pixi EventSystem defaults to cursor: inherit; pin default to none instead.
    app.renderer.events.cursorStyles.default = 'none';
    app.canvas.style.cursor = 'none';
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
    this.showCollisionDebug = false;
    this.postReleaseFadeMs = 0;
    this.prevBarMode = 'normal';
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
    const barMode = curr.entities.bar.mode;
    if (this.prevBarMode === 'releasing' && barMode === 'normal') {
      this.postReleaseFadeMs = curr.config.slingPostFadeMs;
    }
    if (barMode !== 'normal') {
      this.postReleaseFadeMs = 0;
    } else if (this.postReleaseFadeMs > 0) {
      this.postReleaseFadeMs = Math.max(0, this.postReleaseFadeMs - FIXED_STEP_MS);
    }
    this.prevBarMode = barMode;
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
    const renderedBarHeight = bar.height;
    const prevReleaseToNormal = prevBar.mode === 'releasing' && bar.mode === 'normal';
    const displayMode = prevReleaseToNormal ? 'releasing' : bar.mode;
    if (displayMode === 'normal') {
      g.rect(
        offsetX + (barX - bar.width / 2) * scale,
        offsetY + (barY - renderedBarHeight / 2) * scale,
        bar.width * scale,
        renderedBarHeight * scale,
      ).fill(new Color('#60a5fa'));
    } else {
      const guideAlpha = displayMode === 'releasing' ? 0.62 : 0.5;
      // チャージ/リリース中は通常バーを消し、現在カーソル基準の予告位置を薄く表示する。
      g.rect(
        offsetX + (barX - bar.width / 2) * scale,
        offsetY + (barY - renderedBarHeight / 2) * scale,
        bar.width * scale,
        renderedBarHeight * scale,
      )
        .fill({ color: new Color('#60a5fa'), alpha: guideAlpha })
        .stroke({ color: new Color('#93c5fd'), width: 1, alpha: guideAlpha + 0.1 });
    }
    const displayDepth = prevReleaseToNormal
      ? lerp(prevBar.arc.depth, 0, alpha)
      : lerp(prevBar.arc.depth, bar.arc.depth, alpha);
    const displayDirX = lerp(prevBar.arc.dirX, bar.arc.dirX, alpha);
    const displayDirY = lerp(prevBar.arc.dirY, bar.arc.dirY, alpha);
    if (displayMode !== 'normal' && displayDepth > 0) {
      const verticalOffset =
        curr.config.slingArcMaxDepthPx * SLING_ARC_DEPTH_MULTIPLIER * displayDepth;
      const displayReleaseDepth = prevReleaseToNormal
        ? prevBar.releaseDepth
        : alpha < 1
          ? (prevBar.releaseDepth ?? bar.releaseDepth)
          : bar.releaseDepth;
      const horizontalOffset = calcHorizontalOffset(
        displayMode,
        displayDirX,
        displayDepth,
        displayReleaseDepth,
        curr.config.slingArcMaxDepthPx,
      );
      const arcX = bar.zeroPosition.x + horizontalOffset;
      const arcY = bar.zeroPosition.y + displayDirY * verticalOffset;
      const slingColor = displayMode === 'charging' ? new Color('#c084fc') : new Color('#f472b6');
      const slingAlpha = displayMode === 'charging' ? 0.95 : 0.9;
      const slingZeroAlpha = displayMode === 'charging' ? 0.3 : 0.38;
      // スリング側のゼロ位置ガイド。
      g.rect(
        offsetX + (bar.zeroPosition.x - bar.width / 2) * scale,
        offsetY + (bar.zeroPosition.y - renderedBarHeight / 2) * scale,
        bar.width * scale,
        renderedBarHeight * scale,
      ).fill({ color: slingColor, alpha: slingZeroAlpha });
      const slingLeft = {
        x: offsetX + (bar.zeroPosition.x - bar.width / 2) * scale,
        y: offsetY + bar.zeroPosition.y * scale,
      };
      const slingRight = {
        x: offsetX + (bar.zeroPosition.x + bar.width / 2) * scale,
        y: offsetY + bar.zeroPosition.y * scale,
      };
      const slingControl = {
        x: offsetX + arcX * scale,
        y: offsetY + arcY * scale,
      };
      const segmentCount = Math.max(3, Math.floor(curr.config.slingArcSegments));
      drawQuadraticCurve(g, slingLeft, slingControl, slingRight, segmentCount);
      g.stroke({
        color: slingColor,
        width: Math.max(2, bar.height * 0.28 * scale),
        alpha: slingAlpha,
        cap: 'round',
      });
    }
    if (bar.mode === 'normal' && this.postReleaseFadeMs > 0) {
      const postFadeProgress = clamp01(this.postReleaseFadeMs / Math.max(1, curr.config.slingPostFadeMs));
      const postFadeAlpha = 0.6 * postFadeProgress;
      g.rect(
        offsetX + (bar.zeroPosition.x - bar.width / 2) * scale,
        offsetY + (bar.zeroPosition.y - renderedBarHeight / 2) * scale,
        bar.width * scale,
        renderedBarHeight * scale,
      ).fill({ color: new Color('#f472b6'), alpha: postFadeAlpha });
    }
    if (this.showCollisionDebug) {
      this.drawCollisionDebug(g, curr, offsetX, offsetY, scale);
    }

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
      const drawX =
        prevBlock === undefined ? block.x : prevBlock.x + (block.x - prevBlock.x) * alpha;
      const drawY =
        prevBlock === undefined ? block.y : prevBlock.y + (block.y - prevBlock.y) * alpha;
      g.rect(
        offsetX + (drawX - block.width / 2) * scale,
        offsetY + (drawY - block.height / 2) * scale,
        block.width * scale,
        block.height * scale,
      )
        .fill(new Color('#1f2937'))
        .stroke({ color: new Color('#34d399'), width: 1 });

      const hpRate = block.maxHp <= 0 ? 0 : Math.max(0, Math.min(1, block.hp / block.maxHp));
      const hpBarWidth = block.width * 0.72 * scale;
      const hpBarHeight = Math.max(3, block.height * 0.08 * scale);
      const hpBarX = offsetX + (drawX * scale - hpBarWidth / 2);
      const hpBarY = offsetY + drawY * scale - hpBarHeight / 2;
      g.rect(hpBarX, hpBarY, hpBarWidth, hpBarHeight).fill(new Color('#111827'));
      g.rect(hpBarX, hpBarY, hpBarWidth * hpRate, hpBarHeight).fill(new Color('#22c55e'));
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

  public setCollisionDebugVisible(visible: boolean): void {
    this.showCollisionDebug = visible;
  }

  public drawDebugRect(): void {}

  private drawCollisionDebug(
    g: Graphics,
    snapshot: WorldSnapshot,
    offsetX: number,
    offsetY: number,
    scale: number,
  ): void {
    const bar = snapshot.entities.bar;
    const halfWidth = bar.width / 2;
    const halfHeight = bar.height / 2;
    g.rect(
      offsetX + (bar.x - halfWidth) * scale,
      offsetY + (bar.y - halfHeight) * scale,
      bar.width * scale,
      bar.height * scale,
    ).stroke({ color: new Color('#f43f5e'), width: 1, alpha: 0.9 });
    if (bar.mode === 'normal') {
      return;
    }

    const centerX = bar.zeroPosition.x + calcHorizontalOffset(
      bar.mode,
      bar.arc.dirX,
      bar.arc.depth,
      bar.releaseDepth,
      snapshot.config.slingArcMaxDepthPx,
    );
    const centerY =
      bar.zeroPosition.y +
      bar.arc.dirY * snapshot.config.slingArcMaxDepthPx * SLING_ARC_DEPTH_MULTIPLIER * bar.arc.depth;
    const start = { x: bar.zeroPosition.x - bar.zeroPosition.width / 2, y: bar.zeroPosition.y };
    const control = { x: centerX, y: centerY };
    const end = { x: bar.zeroPosition.x + bar.zeroPosition.width / 2, y: bar.zeroPosition.y };
    const segments = Math.max(3, Math.floor(snapshot.config.slingArcSegments));
    let prev = start;
    for (let i = 1; i <= segments; i += 1) {
      const t = i / segments;
      const point = evaluateBezierPoint(start, control, end, t);
      const minX = Math.min(prev.x, point.x) - bar.height / 2;
      const maxX = Math.max(prev.x, point.x) + bar.height / 2;
      const minY = Math.min(prev.y, point.y) - bar.height / 2;
      const maxY = Math.max(prev.y, point.y) + bar.height / 2;
      g.rect(
        offsetX + minX * scale,
        offsetY + minY * scale,
        (maxX - minX) * scale,
        (maxY - minY) * scale,
      ).stroke({ color: new Color('#f97316'), width: 1, alpha: 0.5 });
      prev = point;
    }
  }
}

function evaluateBezierPoint(
  start: { x: number; y: number },
  control: { x: number; y: number },
  end: { x: number; y: number },
  t: number,
): { x: number; y: number } {
  const mt = 1 - t;
  return {
    x: mt * mt * start.x + 2 * mt * t * control.x + t * t * end.x,
    y: mt * mt * start.y + 2 * mt * t * control.y + t * t * end.y,
  };
}
