# [Phase1][C-11] 特殊ブロック (1〜2種)

## 背景

特殊ブロックは攻撃ショットの射出、周囲ブロックの回復、エリアスキルなど多彩な役割を持つ ([`docs/game-design.md`](../docs/game-design.md) §2.3)。1stバージョンでは1〜2種のみ実装し、特殊ブロック基盤を整える。

## ゴール

- 特殊ブロックの種類定義と発動ロジックの共通基盤を作る。
- 1stバージョンでは以下の2種を実装する:
  - **アタッカー**: 一定間隔でボールに向けて攻撃ショットを撃つ (プレイヤーへスリング命中で高ダメージ、下端到達で軽減ダメージ)
  - **ヒーラー**: 一定間隔で周囲のブロックの HP を回復する

## 作業内容

1. `BlockState.kind` の union を拡張する。
   ```ts
   kind: 'normal' | 'attacker' | 'healer' | 'boss' | 'bossCore';
   ```
2. `src/core/entities/SpecialBlock.ts` (型・生成関数) を作成する。
3. `src/core/systems/specialBlocks.ts` を作成する。
   - 各種類の発動ロジックを `tick()` ごとに実行
   - アタッカー: 内部クールダウンを持ち、トリガで「敵ショット」エンティティを生成 (`EnemyShotState`)
   - ヒーラー: 周囲 N マス内のブロック HP を回復
4. 「敵ショット」エンティティを `WorldState` に追加する。
   ```ts
   interface EnemyShotState {
     id: string;
     x: number;
     y: number;
     vx: number;
     vy: number;
     damageHigh: number; // スリング命中時
     damageLow: number;  // 下端到達時
   }
   ```
   - スリング (バー) と衝突するとプレイヤーは大ダメージ、下端到達で軽減ダメージ
5. テスト:
   - アタッカーが定期的にショットを生成する
   - ショットがバーに当たるとプレイヤーHPが大きく減る
   - ショットが下端に到達すると軽減ダメージ
   - ヒーラーが周囲ブロックを回復する

## 受け入れ条件

- [ ] テストが緑。
- [ ] 実機で特殊ブロックのギミックが動作する。

## スコープ外

- 「エリアを歪曲してボール速度低下」「スリング移動速度低下」などの3種以上の特殊ブロック (将来 Phase)
- 敵ショットによる特殊エフェクト (将来 Phase)

## 依存

- C-06, H-01, H-08

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §2.3
