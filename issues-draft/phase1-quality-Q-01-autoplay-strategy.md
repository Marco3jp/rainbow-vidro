# [Phase1][Q-01] オートプレイ戦略 (簡易)

## 背景

オートプレイはバグ検出 (進行不可、クラッシュ) が主目的 ([`docs/architecture.md`](../docs/architecture.md) §9, [`docs/requirements.md`](../docs/requirements.md) §4)。1stバージョンでは単純戦略でゲームを完走できることを目標とする。

## ゴール

- `AutoplayInputSource` を実装する (`InputSource` 互換)。
- 簡易戦略でゲーム終了 (勝利または敗北) まで進行可能。

## 作業内容

1. `src/autoplay/strategies/SimpleStrategy.ts` を作成する。
   - 入力ロジック例:
     - 最も低い位置のボールの x を追跡してバーを移動
     - 一定間隔でクリックを発生させてチャージショット (タイミングは固定)
     - 一定間隔でスキル発動 (キー入力)
2. `src/autoplay/AutoplayInputSource.ts` を作成し、戦略から `InputEvent` を生成する。
3. 入力先は `WorldState.snapshot()` (または `WorldState` への read-only な参照)。Core 内には Autoplay 依存を作らない。
4. メインアプリで `?autoplay=1` クエリ等を付けるとオートプレイが有効化されるようにする (開発・E2E 用)。
5. テスト:
   - 簡易戦略で N tick 動かしてもクラッシュしない
   - シードを固定すれば結果が再現する

## 受け入れ条件

- [ ] テストが緑。
- [ ] 実機で `?autoplay=1` で完走する。

## スコープ外

- 高度な戦略 (将来)
- マシンラーニング系

## 依存

- F-12, C-01 (および可能な限り多くのコアシステム)

## 参照

- [`docs/architecture.md`](../docs/architecture.md) §9
