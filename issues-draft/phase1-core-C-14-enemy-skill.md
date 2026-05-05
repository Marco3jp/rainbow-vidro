# [Phase1][C-14] 敵 (HP・スキルブロック生成)

## 背景

敵は HP を持ち、定期的に特殊ブロック (スキル) を生成してプレイヤーに不利な状況を作る ([`docs/game-design.md`](../docs/game-design.md) §2.4)。

## ゴール

- `BossState` に「スキル発動」の状態を追加する (クールダウン)。
- 敵スキルが特殊ブロック (C-11 で実装) を発生させる。
- 1stバージョンでは1〜2種類のスキルを実装する。

## 作業内容

1. `BossState` を拡張する。
   ```ts
   interface BossState {
     hp: number;
     maxHp: number;
     skills: EnemySkillState[];
   }
   interface EnemySkillState {
     id: string;
     cooldownRemainingMs: number;
     intervalMs: number;
     kind: 'spawnAttacker' | 'spawnHealer';
   }
   ```
2. `src/core/systems/enemySkills.ts` を作成する。
   - クールダウンを tick で減らす
   - 0 になったら対応する特殊ブロックをフィールドに生成し、クールダウンをリセット
3. テスト:
   - 一定間隔でスキルが発動する
   - スキル発動で特殊ブロックが追加される
   - 敵HP0 (= 勝利済み) では発動しない

## 受け入れ条件

- [ ] テストが緑。
- [ ] 実機で敵が定期的に特殊ブロックを出現させる。

## スコープ外

- 敵スキルの追加バリエーション (将来 Phase)
- ボスHPゲージ表示 (U-02)

## 依存

- C-11, C-12

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §2.4
