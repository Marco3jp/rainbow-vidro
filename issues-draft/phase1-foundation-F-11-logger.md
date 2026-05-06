# [Phase1][F-11] Logger MVP (Console + 自動エラー収集)

## 背景

開発中のエラー追跡を最低限担保するため、起動直後から `window.onerror` / `unhandledrejection` を捕捉できる Logger を用意する ([`docs/architecture.md`](../docs/architecture.md) §10)。

> **NOTE**: 本 Issue は MVP に絞り、localStorage 蓄積・ダウンロード UI は Q-03 (優先度 B) で扱う。インゲーム体験の検証を最優先とする方針 ([`docs/roadmap.md`](../docs/roadmap.md) Phase 1 の作業グループと優先度) に従う。

## ゴール

- `Logger` インタフェースを定義する。
- ConsoleLogger 実装を提供する (debug/info/warn/error)。
- `installErrorReporter(logger)` で `window.onerror` と `unhandledrejection` を捕捉して `logger.error` に流せる。
- 起動時にこれを有効化する。

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
   export function createConsoleLogger(): Logger;
   export function installErrorReporter(logger: Logger): () => void; // 戻り値は uninstall 関数
   ```
2. `ConsoleLogger` の実装。
3. `installErrorReporter` の実装 (jsdom テストで動作確認できる形にする)。
4. `src/app/main.ts` で起動時にロガーを構築・install する。
5. テスト:
   - 各レベルで console の対応メソッドが呼ばれる
   - `installErrorReporter` が `window.onerror` / `unhandledrejection` を捕捉して `logger.error` を呼ぶ
   - `uninstall` でハンドラが解除される

## 受け入れ条件

- [ ] テストが緑。
- [ ] ブラウザでエラーを発生させると console に整形ログが出る。

## スコープ外 (Q-03 で扱う)

- localStorage への蓄積とローテート
- ログのダウンロード UI

## 依存

- F-01, F-02

## 参照

- [`docs/architecture.md`](../docs/architecture.md) §10
