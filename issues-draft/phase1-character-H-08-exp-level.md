# [Phase1][H-08] 経験値・レベル

## 背景

ブロック破壊で経験値を獲得し、一定値でレベルアップ。レベルアップでステータス上昇 + スキルポイント1獲得 (LoL方式) ([`docs/game-design.md`](../docs/game-design.md) §3.3)。

## ゴール

- ブロック破壊で経験値が加算される。
- 一定値でレベルアップし、ステータスが上がる + スキルポイントが付与される。
- 経験値テーブルがデータ化されている。

## 作業内容

1. `src/core/data/expTable.ts` を作成する。
   - `expForLevel(level: number): number` (累計 or 各レベル必要量)
   - 初期は線形 or 緩い指数 [要調整]
2. `src/core/systems/exp.ts` を作成する。
   - `addExp(character, amount)` で経験値加算
   - レベルアップ判定とステータス成長 (`baseStats` を係数倍 or 加算 [要調整])
   - スキルポイント加算
3. `blockCollision` (C-06) でブロック破壊時に `addExp(character, block.expReward)` を呼ぶ。
4. テスト:
   - 経験値が加算される
   - 閾値到達でレベルアップする (複数レベル飛ばしも対応)
   - ステータスとスキルポイントが正しく増える

## 受け入れ条件

- [ ] テストが緑。
- [ ] 実機でブロック破壊によりレベルアップが発生する。

## スコープ外

- スキルレベル振り分け UI (H-09)
- レベル時の演出

## 依存

- H-01, C-06

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §3.3
