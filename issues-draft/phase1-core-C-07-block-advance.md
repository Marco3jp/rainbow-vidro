# [Phase1][C-07] ブロック前進 (連続・固定速度)

## 背景

ブロックは時間経過で連続的にプレイヤー側へ前進する ([`docs/game-design.md`](../docs/game-design.md) §2.3 「ブロックの前進」)。前進速度はスキルやギミックで変動する設計とする (本 Issue では固定速度のみ実装)。

## ゴール

- 各 tick で全ブロックが固定速度で前進する。
- `WorldState.config.blockAdvanceSpeed` のような設定値で速度を外出しする。
- 後続 Issue で速度倍率を差し込めるようにする。

## 作業内容

1. `src/core/systems/blockAdvance.ts` を作成する。
   - `advanceBlocks(state: WorldState, dt: number): void`
   - 全ブロックの y 座標を `speed * (dt/1000)` で増加 (画面上端→下端方向)
   - 前進速度は `state.config.blockAdvanceSpeed` から取得
2. 設定値は `WorldState.config` に持たせ、初期値を定数で定義 [要調整]。
3. `World.tick()` から呼ぶ。順序は移動・反射・衝突・前進・後処理。
4. テスト:
   - 1 秒経過でブロックが想定距離だけ進む
   - 速度を変えると進む量も変わる
   - ボスコアブロック (将来) や特殊ブロック (将来) も同じ前進ロジックで動く前提のテスト構成

## 受け入れ条件

- [ ] テストが緑。
- [ ] 実機でブロックが連続的に下りてくる。

## スコープ外

- 下端到達でのプレイヤーダメージ (C-08)
- 速度変更スキル (将来 Phase で対応)

## 依存

- C-06

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §2.3
