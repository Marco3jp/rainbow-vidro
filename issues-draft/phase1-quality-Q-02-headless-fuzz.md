# [Phase1][Q-02] ヘッドレス実行 (Node.js Fuzz)

## 背景

オートプレイをブラウザに加えて Node.js でも回せるようにし、大量シードで Fuzz テストを行う ([`docs/architecture.md`](../docs/architecture.md) §9 / [`docs/testing.md`](../docs/testing.md) §3)。

> **NOTE**: 優先度 B (後回し) ([`docs/roadmap.md`](../docs/roadmap.md) G13)。Q-01 完了後に着手する。

## ゴール

- `npm run fuzz` で Node.js から World と Autoplay を駆動できる。
- N シード (例: 100) でゲーム完走できることを確認する。
- 例外発生時にシードと簡易ログをエラー出力する。

## 作業内容

1. `scripts/fuzz.ts` を作成する。
   - 引数: `--seeds <N>`, `--max-ticks <T>`
   - 各シードで World を作り、`AutoplayInputSource` でループを回す (描画は不要、World.tick を直接駆動)
   - 完走 (勝利/敗北) または timeout (max ticks) で終了
   - 例外発生時に `{ seed, tick, error }` を JSON で stderr に出力
   - サマリー (成功/失敗カウント) を stdout に出力
2. `package.json` に `fuzz` スクリプトを追加する (`tsx scripts/fuzz.ts` 等で実行)。
3. CI のオプションジョブとして実行する設定を追加 (週次や手動実行で十分。本 Issue では設定ファイルだけ用意し、デフォルトでは実行しない)。
4. テスト:
   - スクリプト自体の単体テスト (シード 1 つで完走できる)

## 受け入れ条件

- [ ] `npm run fuzz -- --seeds 10` がエラーなく終わる。
- [ ] 例外時に再現用シードが出力される。

## スコープ外

- ヘッドレス E2E (Playwright で代替可)
- 自動オートマージなどの高度な CI 連携

## 依存

- Q-01, C 系 (主要コアが揃った段階で実施推奨)

## 参照

- [`docs/architecture.md`](../docs/architecture.md) §9
