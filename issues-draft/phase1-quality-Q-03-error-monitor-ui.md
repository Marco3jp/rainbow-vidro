# [Phase1][Q-03] エラーモニタ強化 (UI ダウンロード)

## 背景

F-11 で実装した `BufferedLogger` のログを開発者が回収しやすくするため、UI からダウンロードできる仕組みを整える。

## ゴール

- 画面上から「ログをダウンロード」ボタンで JSON が取得できる。
- `?debug=1` 等のクエリでのみボタン表示 (本番でも露出するかは要確認、初期は表示でも可) [要調整]。
- 自動エラー収集 (window.onerror / unhandledrejection) が常時有効。

## 作業内容

1. `src/ui/components/DebugLogPanel.ts` を作成し、フローティングボタン + パネルを実装する。
2. パネル内容:
   - 直近 N 件のログを表示
   - 「JSON をダウンロード」ボタン
   - 「ログをクリア」ボタン
3. `installErrorReporter` を `main.ts` 起動時に呼ぶ。
4. テスト:
   - ボタン押下で download トリガが呼ばれる (jsdom で `URL.createObjectURL` が呼ばれる確認)
   - クリアでログが空になる

## 受け入れ条件

- [ ] 実機で `?debug=1` 付きアクセスでパネルが見える、ダウンロード可。
- [ ] テストが緑。

## スコープ外

- 外部エラーモニタ (将来)

## 依存

- F-11

## 参照

- [`docs/architecture.md`](../docs/architecture.md) §10
