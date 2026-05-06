# [Phase1][Q-03] ロガー強化 (localStorage 蓄積 + ダウンロード UI)

## 背景

F-11 で起動時のエラー収集 (Console + window.onerror) が動いている前提で、開発者がブラウザを閉じてもログを失わないよう localStorage に蓄積し、UI から JSON ダウンロードできるようにする。

> **NOTE**: 優先度 B (後回し)。インゲーム体験検証が一段落した後に着手する。

## ゴール

- `BufferedLogger` 実装を追加する (localStorage 蓄積、上限到達でローテート)。
- `?debug=1` 等のクエリでフローティングパネルが表示され、ログ閲覧と JSON ダウンロードができる。

## 作業内容

1. `src/platform/logger.ts` (F-11 で作成) に `BufferedLogger` を追加する。
   - 内部に `LogEntry[]` のキューを持ち、localStorage に永続化
   - 上限件数 (例: 1000) でローテート
   - `getEntries(): LogEntry[]`, `clear(): void`, `exportAsJson(): Blob` を提供
2. `ConsoleLogger` と `BufferedLogger` の合成 Logger (`createCompositeLogger([...])`) を提供する。
3. `src/ui/components/DebugLogPanel.ts` を作成し、`?debug=1` 付きアクセスでフローティングボタン + パネルを表示する。
   - 直近 N 件のログをスクロール可能に表示
   - 「JSON をダウンロード」ボタン
   - 「ログをクリア」ボタン
4. `installErrorReporter(logger)` のターゲットを `compositeLogger` にする。
5. テスト:
   - 蓄積・ローテートが正しい
   - ダウンロード時に `URL.createObjectURL` が呼ばれる (jsdom)
   - クリアでログが空になる
   - `?debug=1` 無しではパネル要素が DOM に出ない

## 受け入れ条件

- [ ] テストが緑。
- [ ] 実機で `?debug=1` 付きアクセスでパネルが見え、JSON ダウンロード可。
- [ ] localStorage 容量上限に近づいてもローテートで動作継続。

## スコープ外

- 外部エラーモニタ (将来検討)
- リプレイファイルとの統合 (F-13 と連動するなら別 Issue)

## 依存

- F-11

## 参照

- [`docs/architecture.md`](../docs/architecture.md) §10
- [`docs/roadmap.md`](../docs/roadmap.md) 優先度 B / G14
