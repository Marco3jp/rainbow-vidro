import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { charA, createCharacter, type WorldSnapshot } from '@/core';
import type { Renderer } from '@/render';
import { GameScene } from '@/ui';

function installDomGlobals(dom: JSDOM): void {
  Object.defineProperty(globalThis, 'window', {
    value: dom.window,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'document', {
    value: dom.window.document,
    configurable: true,
  });
}

class MockRenderer implements Renderer {
  public async mount(container: HTMLElement): Promise<void> {
    const canvas = container.ownerDocument.createElement('canvas');
    container.append(canvas);
  }
  public unmount(): void {}
  public resize(_width: number, _height: number): void {}
  public render(_prev: WorldSnapshot, _curr: WorldSnapshot, _alpha: number): void {}
}

function createSnapshot(): WorldSnapshot {
  return {
    tickCount: 0,
    elapsedMs: 0,
    phase: 'playing',
    entities: {
      balls: [],
      bar: { x: 200, y: 180, width: 100, height: 20, mode: 'normal' },
      blocks: [],
      boss: { hp: 90, maxHp: 120 },
      character: createCharacter(charA),
    },
    field: { width: 400, height: 200 },
    rngState: 0,
    nextBallId: 0,
    config: {
      ballRadius: 8,
      ballSpeed: 300,
      wallDecayFactor: 0.85,
      barBounceMaxAngleRad: 1,
      blockAdvanceSpeed: 24,
      blockReachDamage: 1,
    },
  };
}

describe('GameScene HUD', () => {
  it('HP/MP と経過時間表示が snapshot 変更で更新される', async () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>');
    installDomGlobals(dom);
    const container = dom.window.document.querySelector<HTMLElement>('#app');
    if (container === null) {
      throw new Error('container missing');
    }

    const scene = new GameScene(new MockRenderer());
    await scene.mount(container);

    const prev = createSnapshot();
    const curr = createSnapshot();
    curr.entities.character.stats.hp = 75;
    curr.entities.character.stats.mana = 31;
    curr.elapsedMs = 65_000;
    scene.render(prev, curr, 1);

    const hpText = container.querySelector('[data-hud="hp-text"]')?.textContent;
    const manaText = container.querySelector('[data-hud="mana-text"]')?.textContent;
    const elapsedText = container.querySelector('[data-hud="elapsed-text"]')?.textContent;
    expect(hpText).toBe('75 / 100');
    expect(manaText).toBe('31 / 50');
    expect(elapsedText).toBe('01:05');
  });

  it('skillPoints があると振り分けボタンを表示する', async () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>');
    installDomGlobals(dom);
    const container = dom.window.document.querySelector<HTMLElement>('#app');
    if (container === null) {
      throw new Error('container missing');
    }

    const scene = new GameScene(new MockRenderer());
    await scene.mount(container);

    const snapshot = createSnapshot();
    snapshot.entities.character.skillPoints = 2;
    scene.render(snapshot, snapshot, 1);

    const button = container.querySelector<HTMLButtonElement>('[data-hud="skill-point-button"]');
    expect(button?.hidden).toBe(false);
    expect(button?.disabled).toBe(false);
    expect(button?.textContent).toContain('(2)');
  });
});
