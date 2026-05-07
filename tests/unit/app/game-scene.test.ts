import { JSDOM } from 'jsdom';
import { describe, expect, it, vi } from 'vitest';
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
  public setCollisionDebugVisible(_visible: boolean): void {}
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
      bar: {
        x: 200,
        y: 180,
        width: 100,
        height: 20,
        zeroPosition: { x: 200, y: 180, width: 100, height: 20 },
        arc: { dirX: 0, dirY: -1, depth: 0 },
        mode: 'normal',
        attachedBallIds: [],
      },
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
      slingChargeMaxMs: 200,
      slingReleaseMs: 80,
      slingPostFadeMs: 140,
      slingArcMaxDepthPx: 72,
      slingArcSegments: 12,
      slingShotBaseSpeed: 420,
      chargeFactorMin: 1,
      chargeFactorMax: 2.5,
      hitFactorMin: 1,
      hitFactorMax: 2,
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

  it('キャラステータスとボール別情報を表示する', async () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>');
    installDomGlobals(dom);
    const container = dom.window.document.querySelector<HTMLElement>('#app');
    if (container === null) {
      throw new Error('container missing');
    }

    const scene = new GameScene(new MockRenderer());
    await scene.mount(container);

    const snapshot = createSnapshot();
    snapshot.entities.character.stats.attack = 12;
    snapshot.entities.character.stats.ballSpeed = 1.25;
    snapshot.entities.character.stats.barReflectMultiplier = 1.1;
    snapshot.entities.character.stats.chargeShotMultiplier = 1.3;
    snapshot.entities.character.stats.cdr = 0.15;
    snapshot.entities.character.stats.hpRegenPerSec = 0.5;
    snapshot.entities.character.stats.manaRegenPerSec = 2;
    snapshot.entities.balls = [
      {
        id: 'ball-0',
        x: 100,
        y: 120,
        vx: 30,
        vy: -40,
        radius: 8,
        damageMultiplier: 1.5,
        bottomReflectPassthrough: false,
      },
    ];
    scene.render(snapshot, snapshot, 1);

    const characterStats =
      container.querySelector('[data-hud="character-stats-list"]')?.textContent ?? '';
    const ballStats = container.querySelector('[data-hud="ball-state-list"]')?.textContent ?? '';
    expect(characterStats).toContain('攻撃力: 12');
    expect(characterStats).toContain('ボール速度倍率: 1.25');
    expect(characterStats).toContain('CDR: 15.0%');
    expect(ballStats).toContain('ball-0');
    expect(ballStats).toContain('攻撃: 18');
    expect(ballStats).toContain('下壁貫通: OFF');
  });

  it('戦況カードにフェーズと個数情報を表示する', async () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>');
    installDomGlobals(dom);
    const container = dom.window.document.querySelector<HTMLElement>('#app');
    if (container === null) {
      throw new Error('container missing');
    }

    const scene = new GameScene(new MockRenderer());
    await scene.mount(container);

    const snapshot = createSnapshot();
    snapshot.phase = 'playing';
    snapshot.entities.blocks = [
      {
        id: 'b1',
        kind: 'normal',
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        hp: 5,
        maxHp: 10,
        expReward: 1,
      },
      {
        id: 'b2',
        kind: 'normal',
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        hp: 15,
        maxHp: 20,
        expReward: 1,
      },
    ];
    snapshot.entities.balls = [
      {
        id: 'ball-0',
        x: 0,
        y: 0,
        vx: 10,
        vy: 20,
        radius: 8,
        damageMultiplier: 1,
        bottomReflectPassthrough: false,
      },
    ];
    scene.render(snapshot, snapshot, 1);

    expect(container.querySelector('[data-hud="phase-text"]')?.textContent).toBe('playing');
    expect(container.querySelector('[data-hud="block-count-text"]')?.textContent).toBe('2');
    expect(container.querySelector('[data-hud="ball-count-text"]')?.textContent).toBe('1');
    expect(container.querySelector('[data-hud="block-hp-avg-text"]')?.textContent).toBe('10');
  });

  it('デバッグ調整UIから設定変更コールバックを発火できる', async () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>');
    installDomGlobals(dom);
    const container = dom.window.document.querySelector<HTMLElement>('#app');
    if (container === null) {
      throw new Error('container missing');
    }

    const onDebugValueChange = vi.fn();
    const scene = new GameScene(new MockRenderer(), { onDebugValueChange });
    await scene.mount(container);
    const snapshot = createSnapshot();
    scene.render(snapshot, snapshot, 1);

    const releaseMsInput = container.querySelector<HTMLInputElement>(
      'input[type="number"][data-debug-key="slingPostFadeMs"]',
    );
    if (releaseMsInput === null) {
      throw new Error('debug input missing');
    }
    releaseMsInput.value = '96';
    releaseMsInput.dispatchEvent(new dom.window.Event('change'));

    expect(onDebugValueChange).toHaveBeenCalledWith('slingPostFadeMs', 96);
  });

  it('当たり判定トグルでレンダラへ表示フラグを渡せる', async () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>');
    installDomGlobals(dom);
    const container = dom.window.document.querySelector<HTMLElement>('#app');
    if (container === null) {
      throw new Error('container missing');
    }

    const renderer = new MockRenderer();
    const spy = vi.spyOn(renderer, 'setCollisionDebugVisible');
    const scene = new GameScene(renderer);
    await scene.mount(container);
    const toggle = container.querySelector<HTMLInputElement>('[data-hud="collision-debug-toggle"]');
    if (toggle === null) {
      throw new Error('toggle missing');
    }
    toggle.checked = true;
    toggle.dispatchEvent(new dom.window.Event('change'));
    expect(spy).toHaveBeenCalledWith(true);
  });
});
