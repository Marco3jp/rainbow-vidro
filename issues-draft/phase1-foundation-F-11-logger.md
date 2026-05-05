# [Phase1][F-11] Logger / エラーモニタ (簡易自前)

## 背景

外部 SaaS を使わず、ブラウザ実行時のエラーやログを自前で蓄積する。蓄積先は localStorage、ダウンロード機能で開発者が回収できるようにする ([`docs/architecture.md`](../docs/architecture.md) §10)。

## ゴール

- 簡易な `Logger` と `ErrorReporter` を提供する。
- `window.onerror` / `unhandledrejection` を捕捉し、localStorage に蓄積する。
- 開発用画面で蓄積ログを JSON ダウンロードできる。

## 作業内容

1. `src/platform/logger.ts` を作成する。
   ```ts
   export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
   export interface LogEntry {
     ts: number;
     level: LogLevel;
     msg: string;
     ctx?: Record<string, unknown>;
     error?: { name: string; message: string; stack?: string };
   }
   export interface Logger {
     debug(msg: string, ctx?: Record<string, unknown>): void;
     info(msg: string, ctx?: Record<string, unknown>): void;
     warn(msg: string, ctx?: Record<string, unknown>): void;
     error(msg: string, error?: unknown, ctx?: Record<string, unknown>): void;
   }
   ```
2. `ConsoleLogger` (開発時) と `BufferedLogger` (localStorage 蓄積) を実装する。
   - `BufferedLogger` は最大件数 (例: 1000) でローテート。
3. `installErrorReporter(logger: Logger)` 関数を提供する。
   - `window.onerror`, `window.onunhandledrejection` を捕捉して `logger.error` に流す。
4. ダウンロード機能:
   - `exportLogsAsJson(): Blob` 関数で localStorage の蓄積を JSON として取り出せる。
   - 開発者向け UI として、画面右上に小さな「Logs」ボタンを置く (隠しコマンドや `?debug=1` クエリでのみ表示でよい)。
5. テスト:
   - `BufferedLogger` がローテートする
   - `installErrorReporter` が `error` イベントを捕捉する (jsdom 環境でテスト)

## 受け入れ条件

- [ ] テストが緑。
- [ ] ブラウザでエラーを発生させると localStorage にログが蓄積される。
- [ ] ダウンロード UI から JSON が取得できる (ヘッドレスや単純な確認でも可)。

## スコープ外

- リプレイログ (F-13)
- 外部エラーモニタ (将来検討)

## 依存

- F-01, F-02

## 参照

- [`docs/architecture.md`](../docs/architecture.md) §10
