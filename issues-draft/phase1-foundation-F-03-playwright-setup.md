# [Phase1][F-03] E2E テスト基盤 (Playwright)

## 背景

UI 主要シナリオは Playwright で E2E テストを行う方針 ([`docs/testing.md`](../docs/testing.md))。ヘッドレス CI 実行も視野に入れる。

> **NOTE**: 優先度 B (後回し) ([`docs/roadmap.md`](../docs/roadmap.md) G15)。インゲーム検証が一段落した後に着手する。Vitest による単体・統合テストは初期から行う。

## ゴール

- `npm run test:e2e` で Playwright のテストが走り、最小 E2E が通る状態にする。
- ローカル開発時は Vite 開発サーバを自動で立ち上げてテスト実行できる。

## 作業内容

1. devDependencies に追加:
   - `@playwright/test`
2. `npx playwright install --with-deps chromium` の実行手順をドキュメント化。
3. `playwright.config.ts` を作成する。
   - `testDir`: `tests/e2e`
   - `webServer`: `vite preview` または `vite` を使い、ベースURLを設定
   - `use.baseURL`
   - 既定ブラウザ: chromium
4. `package.json` の scripts に追加:
   - `test:e2e`: `playwright test`
   - `test:e2e:ui`: `playwright test --ui`
5. `tests/e2e/smoke.spec.ts` を作成する。
   - ベースURL を開いて `<title>` が空でないことを assert する程度の最小テストでよい。
6. `.gitignore` に `playwright-report/`, `test-results/` を追加。
7. README に E2E 実行コマンドを追記。
8. `docs/testing.md` を実コマンドで更新する。

## 受け入れ条件

- [ ] `npm run test:e2e` が成功する。
- [ ] CI で実行可能な構成 (ヘッドレス) になっている (CI 組み込み自体は F-04 で行うため、設定は配置しておく)。
- [ ] README と `docs/testing.md` が更新されている。

## スコープ外

- 実際のゲームに対する E2E シナリオ (各 UI Issue で追加)
- CI ワークフロー (F-04)

## 依存

- F-01, F-02

## 参照

- [`docs/testing.md`](../docs/testing.md)
