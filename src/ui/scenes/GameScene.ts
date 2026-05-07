import type { WorldSnapshot } from '@/core/world';
import type { Renderer } from '@/render';

interface PointerRenderable {
  setVisualBarTargetX(x: number | null): void;
  setVisualPointer(point: { x: number; y: number } | null): void;
}

function clamp01(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export class GameScene implements Renderer {
  private fieldArea: HTMLDivElement | null = null;
  private hpText: HTMLSpanElement | null = null;
  private hpFill: HTMLDivElement | null = null;
  private manaText: HTMLSpanElement | null = null;
  private manaFill: HTMLDivElement | null = null;
  private enemyHpText: HTMLSpanElement | null = null;
  private enemyHpFill: HTMLDivElement | null = null;
  private elapsedText: HTMLSpanElement | null = null;
  private expText: HTMLSpanElement | null = null;
  private expFill: HTMLDivElement | null = null;
  private levelText: HTMLSpanElement | null = null;
  private skillList: HTMLUListElement | null = null;
  private skillPointButton: HTMLButtonElement | null = null;

  public constructor(private readonly renderer: Renderer) {}

  public async mount(container: HTMLElement): Promise<void> {
    const root = document.createElement('div');
    root.className = 'game-scene';
    const fieldArea = document.createElement('div');
    fieldArea.className = 'game-scene__field';
    const hudLeft = document.createElement('aside');
    hudLeft.className = 'game-scene__hud game-scene__hud--left';
    hudLeft.innerHTML = `
      <section class="hud-card hud-card--placeholder">
        <h2>左HUD</h2>
        <p>将来の表示領域</p>
      </section>
    `;
    const hudRight = document.createElement('aside');
    hudRight.className = 'game-scene__hud game-scene__hud--right';
    hudRight.innerHTML = `
      <section class="hud-card">
        <h2>プレイヤー</h2>
        <div class="hud-row">
          <span>HP</span>
          <span data-hud="hp-text"></span>
        </div>
        <div class="hud-bar"><div data-hud="hp-fill"></div></div>
        <div class="hud-row">
          <span>MP</span>
          <span data-hud="mana-text"></span>
        </div>
        <div class="hud-bar"><div data-hud="mana-fill"></div></div>
      </section>
      <section class="hud-card">
        <h2>敵</h2>
        <div class="hud-row">
          <span>HP</span>
          <span data-hud="enemy-hp-text"></span>
        </div>
        <div class="hud-bar"><div data-hud="enemy-hp-fill"></div></div>
      </section>
      <section class="hud-card">
        <h2>進行</h2>
        <div class="hud-row"><span>経過時間</span><span data-hud="elapsed-text"></span></div>
        <div class="hud-row"><span>レベル</span><span data-hud="level-text"></span></div>
        <div class="hud-row"><span>EXP</span><span data-hud="exp-text"></span></div>
        <div class="hud-bar"><div data-hud="exp-fill"></div></div>
      </section>
      <section class="hud-card">
        <h2>スキル</h2>
        <ul class="hud-skills" data-hud="skill-list"></ul>
        <button type="button" data-hud="skill-point-button">スキルポイントを振る</button>
      </section>
    `;
    root.append(fieldArea, hudLeft, hudRight);
    container.replaceChildren(root);

    this.fieldArea = fieldArea;
    this.hpText = root.querySelector('[data-hud="hp-text"]');
    this.hpFill = root.querySelector('[data-hud="hp-fill"]');
    this.manaText = root.querySelector('[data-hud="mana-text"]');
    this.manaFill = root.querySelector('[data-hud="mana-fill"]');
    this.enemyHpText = root.querySelector('[data-hud="enemy-hp-text"]');
    this.enemyHpFill = root.querySelector('[data-hud="enemy-hp-fill"]');
    this.elapsedText = root.querySelector('[data-hud="elapsed-text"]');
    this.expText = root.querySelector('[data-hud="exp-text"]');
    this.expFill = root.querySelector('[data-hud="exp-fill"]');
    this.levelText = root.querySelector('[data-hud="level-text"]');
    this.skillList = root.querySelector('[data-hud="skill-list"]');
    this.skillPointButton = root.querySelector('[data-hud="skill-point-button"]');
    await this.renderer.mount(fieldArea);
  }

  public unmount(): void {
    this.renderer.unmount();
    this.fieldArea = null;
  }

  public resize(width: number, height: number): void {
    this.renderer.resize(width, height);
  }

  public render(prev: WorldSnapshot, curr: WorldSnapshot, alpha: number): void {
    this.renderer.render(prev, curr, alpha);
    this.updateHud(curr);
  }

  public getInputTarget(): HTMLElement | null {
    return this.fieldArea?.querySelector('canvas') ?? this.fieldArea;
  }

  public setVisualBarTargetX(x: number | null): void {
    if (this.isPointerRenderable(this.renderer)) {
      this.renderer.setVisualBarTargetX(x);
    }
  }

  public setVisualPointer(point: { x: number; y: number } | null): void {
    if (this.isPointerRenderable(this.renderer)) {
      this.renderer.setVisualPointer(point);
    }
  }

  private updateHud(snapshot: WorldSnapshot): void {
    const character = snapshot.entities.character;
    const hpRate = clamp01(character.stats.hp / character.stats.maxHp);
    const manaRate = clamp01(character.stats.mana / character.stats.maxMana);
    const enemyHpRate = clamp01(snapshot.entities.boss.hp / snapshot.entities.boss.maxHp);
    const expRate = clamp01((character.exp % 100) / 100);

    if (this.hpText !== null) {
      this.hpText.textContent = `${Math.round(character.stats.hp)} / ${Math.round(character.stats.maxHp)}`;
    }
    if (this.hpFill !== null) {
      this.hpFill.style.width = `${hpRate * 100}%`;
    }
    if (this.manaText !== null) {
      this.manaText.textContent = `${Math.round(character.stats.mana)} / ${Math.round(character.stats.maxMana)}`;
    }
    if (this.manaFill !== null) {
      this.manaFill.style.width = `${manaRate * 100}%`;
    }
    if (this.enemyHpText !== null) {
      this.enemyHpText.textContent = `${Math.round(snapshot.entities.boss.hp)} / ${Math.round(snapshot.entities.boss.maxHp)}`;
    }
    if (this.enemyHpFill !== null) {
      this.enemyHpFill.style.width = `${enemyHpRate * 100}%`;
    }
    if (this.elapsedText !== null) {
      this.elapsedText.textContent = formatTime(snapshot.elapsedMs);
    }
    if (this.expText !== null) {
      this.expText.textContent = `${character.exp} EXP`;
    }
    if (this.expFill !== null) {
      this.expFill.style.width = `${expRate * 100}%`;
    }
    if (this.levelText !== null) {
      this.levelText.textContent = `${character.level}`;
    }

    if (this.skillList !== null) {
      this.skillList.replaceChildren();
      const entries = Object.entries(character.skillLevels);
      if (entries.length === 0) {
        const item = document.createElement('li');
        item.textContent = 'スキルデータなし';
        this.skillList.append(item);
      } else {
        for (const [skillId, level] of entries) {
          const item = document.createElement('li');
          item.textContent = `${skillId}: Lv.${level}`;
          this.skillList.append(item);
        }
      }
    }

    if (this.skillPointButton !== null) {
      this.skillPointButton.hidden = character.skillPoints <= 0;
      this.skillPointButton.disabled = character.skillPoints <= 0;
      this.skillPointButton.textContent = `スキルポイントを振る (${character.skillPoints})`;
    }
  }

  private isPointerRenderable(renderer: Renderer): renderer is Renderer & PointerRenderable {
    return (
      'setVisualBarTargetX' in renderer &&
      typeof renderer.setVisualBarTargetX === 'function' &&
      'setVisualPointer' in renderer &&
      typeof renderer.setVisualPointer === 'function'
    );
  }
}
