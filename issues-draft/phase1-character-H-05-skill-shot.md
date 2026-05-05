# [Phase1][H-05] スキル1: スキルショット

## 背景

スキル1は「任意のタイミングでスリングから攻撃ショットを撃つ」アクティブスキル ([`docs/game-design.md`](../docs/game-design.md) §3.2)。

## ゴール

- スキル発動時にバーから現在のスリング照準方向にスキルショットエンティティが射出される。
- スキルショットがブロックに命中するとダメージを与える。
- パッシブ (H-04) と連動する命中フックを発火させる。

## 作業内容

1. `WorldState` に `skillShots: SkillShotState[]` を追加する。
   ```ts
   interface SkillShotState {
     id: string;
     sourceCharacterId: string;
     skillId: string;
     x: number;
     y: number;
     vx: number;
     vy: number;
     radius: number;
     damageMultiplier: number;
     remainingMs: number;
   }
   ```
2. `src/core/skills/skillShot.ts` に `SkillDef` を実装する。
   - `onActivate`: バーの位置と現在のエイム方向 (チャージ中はチャージ方向、それ以外はマウス方向) からスキルショットを生成
   - manaCost / cooldownMs は `WorldState.config` または定数 [要調整]
3. `src/core/systems/skillShots.ts` を作成する。
   - スキルショットの移動・寿命管理
   - ブロック・敵ショット・壁との衝突判定
   - 命中時にダメージ計算 (C-15)、ブロックHP減算
   - 命中時にパッシブの `onSkillShotHit` を呼ぶ
4. テスト:
   - 発動で SkillShot が生成される
   - 移動と寿命が正しい
   - ブロックに命中するとダメージ
   - パッシブフックが呼ばれる

## 受け入れ条件

- [ ] テストが緑。
- [ ] 実機でスキル1を発動すると弾が飛んでブロックを攻撃できる。

## スコープ外

- 描画演出
- スキル1の追加効果 (将来)

## 依存

- H-03, C-15

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §3.2
