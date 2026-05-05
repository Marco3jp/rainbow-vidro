# [Phase1][H-03] スキルシステム基盤 (定義型・クールダウン・発動キュー)

## 背景

キャラクターはスキル2 + アルティメット + パッシブを持つ ([`docs/game-design.md`](../docs/game-design.md) §3.2)。各スキルは定義データ + 発動ロジックで構成される。決定論的に動作するためのスキルシステム基盤を整える。

## ゴール

- スキル定義型 (`SkillDef`) と発動ロジックの統一インタフェースを提供する。
- クールダウンが tick で減算される。
- スキル発動 API を提供する (キー入力 → 発動、マナ消費、CD開始)。

## 作業内容

1. `src/core/skills/SkillDef.ts` を作成する。
   ```ts
   export interface SkillContext {
     world: WorldState;
     character: CharacterState;
     skillState: SkillRuntimeState;
     rng: SeededRng;
   }
   export interface SkillDef {
     id: string;
     kind: 'active' | 'ultimate' | 'passive';
     manaCost: number;
     cooldownMs: number;
     /** スキル発動時の処理 (active / ultimate のみ) */
     onActivate?(ctx: SkillContext): void;
     /** tick ごとの処理 (passive、または継続効果) */
     onTick?(ctx: SkillContext, dt: number): void;
     /** スキルショット命中時 (パッシブ用、H-04 と関連) */
     onSkillShotHit?(ctx: SkillContext): void;
   }
   export interface SkillRuntimeState {
     id: string;
     cooldownRemainingMs: number;
     activeUntilTick?: number;
     custom?: Record<string, unknown>;
   }
   ```
2. `CharacterState` に `skillRuntime: Record<string, SkillRuntimeState>` を追加する。
3. `src/core/systems/skills.ts` を作成する。
   - `tickSkills(state, dt)`: クールダウン減算 + 各 SkillDef の `onTick` を呼ぶ
   - `tryActivateSkill(state, character, skillId): boolean`: マナ・CD チェック → `onActivate` 呼び出し → CD リセット
4. キーバインド定義 (1=スキル1, 2=スキル2, R=アルティメット 等の例 [要調整]) を `src/core/data/keybindings.ts` に置く。
5. 入力ハンドリング: `InputEvent` に `'keydown'` を追加するか別チャネルにするか検討して採用 (本 Issue 内で決定し実装)。
6. テスト:
   - クールダウンが減る
   - 発動でマナが消費される
   - マナ不足で発動失敗
   - CD 中で発動失敗
   - パッシブの onTick が呼ばれる

## 受け入れ条件

- [ ] テストが緑。
- [ ] スキル発動の基盤が動く (具体スキルは H-04 以降)。

## スコープ外

- 具体スキル実装 (H-04 以降)
- スキルショットの可視化 (描画は別 Issue)

## 依存

- H-01, H-02, F-09

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §3.2
