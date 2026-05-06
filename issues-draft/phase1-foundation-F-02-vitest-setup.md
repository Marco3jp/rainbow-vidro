# [Phase1][F-02] テスト基盤 (Vitest)

## 背景

`AGENTS.md` の必須ルールに「テスト必須」が含まれており、ゲームロジック層 (`src/core/`) は決定論的に書く方針 ([`docs/testing.md`](../docs/testing.md))。テストフレームワークとして Vitest を採用する。

## ゴール

- `npm run test` と `npm run test:watch` が利用でき、サンプルテストが通る状態にする。
- カバレッジ計測 (`npm run test:coverage`) のコマンドが用意されている。

## 作業内容

1. devDependencies に追加:
   - `vitest`
   - `@vitest/coverage-v8` (カバレッジ用)
2. `vitest.config.ts` を作成する。
   - `test.environment`: `node` をデフォルトに、必要に応じて `jsdom` を後で切り替えられるようにコメントで言及
   - `test.include`: `tests/**/*.{test,spec}.ts`
   - `test.coverage.provider`: `v8`
   - `test.coverage.reporter`: `['text', 'lcov']`
   - `test.coverage.include`: `src/**`
   - パスエイリアス `@/*` → `src/*` を Vite と揃える
3. `package.json` の scripts に追加:
   - `test`: `vitest run`
   - `test:watch`: `vitest`
   - `test:coverage`: `vitest run --coverage`
4. `tests/unit/sample.test.ts` を作成し、最小のサンプルテストを書く (例: `expect(1 + 1).toBe(2)`)。
5. `tests/` のディレクトリ構成を作成 (`tests/unit/`, `tests/integration/`, `tests/fixtures/` の空ディレクトリと `.gitkeep`)。
6. README にテストコマンドを追記する。
7. `docs/testing.md` の「ローカル実行コマンド」セクションを実コマンドで更新する。

## 受け入れ条件

- [ ] `npm run test` でサンプルテストが緑になる。
- [ ] `npm run test:coverage` が成功し、カバレッジレポートが生成される。
- [ ] README と `docs/testing.md` が更新されている。

## スコープ外

- E2E テスト (F-03)
- 実際のゲームロジックに対するテスト (各機能 Issue で追加)

## 依存

- F-01 (プロジェクトセットアップ)

## 参照

- [`docs/testing.md`](../docs/testing.md)
