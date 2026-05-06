# AGENTS.md

このリポジトリで開発を行うコーディングエージェント (および人間の開発者) が遵守すべきルールをまとめたドキュメントです。

## プロジェクト概要

`rainbow-vidro` はスリング操作を取り入れたブロック崩しベースのWebゲームです。詳細は [`README.md`](README.md) と [`docs/`](docs/) を参照してください。

設計ドキュメント:
- 要件: [`docs/requirements.md`](docs/requirements.md)
- ゲームデザイン: [`docs/game-design.md`](docs/game-design.md)
- アーキテクチャ: [`docs/architecture.md`](docs/architecture.md)
- ロードマップ: [`docs/roadmap.md`](docs/roadmap.md)
- テスト戦略: [`docs/testing.md`](docs/testing.md)
- 運用: [`docs/operations.md`](docs/operations.md)

## 開発環境 (現状)

- ランタイム: ブラウザ (PCブラウザのみ、PixiJSで描画)
- 言語: TypeScript
- ビルド: Vite (予定)
- パッケージマネージャ: npm
- Lint/Format: Biome (予定)
- Test: Vitest (単体・統合) + Playwright (E2E、予定)

> **NOTE**: 2026-05時点では Issue #1 (プロジェクトセットアップ) 完了前のため、`npm install` 等のコマンドはまだ動作しません。Issue #1 完了後にこのファイルを更新してください。

## 必須ルール

### コード規約

1. **決定論性**: ゲームロジック層 (`src/core/`) では `Math.random()` / `Date.now()` / `performance.now()` の直接使用を **禁止** します。乱数は seeded RNG (Mulberry32 等) を経由し、時刻は注入された clock 経由で取得してください。
2. **レイヤ境界**: `src/core/` (ゲームロジック) は `pixi.js` を import してはいけません。描画は `src/render/` に閉じます。
3. **状態管理**: ゲーム状態は `World` クラスに集約し、シリアライズ可能を維持してください (リプレイとテストのため)。
4. **OOP方針**: エンティティは深い継承よりも、プロパティとコンポジションで属性を表現することを優先してください。共通振る舞いは小さなシステム関数で表現します。
5. **公開API**: 各モジュールは `index.ts` で公開APIを明示し、内部実装は import 禁止にしてください。
6. **型**: `any` の使用は原則禁止 (やむを得ない場合は `// biome-ignore` コメントで理由を明記)。

### コミット規約

- **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `ci:` など)
- メッセージは **日本語** で書く (例: `feat: スリングのチャージショットを実装する`)
- 1コミット = 1論理変更 (バッチコミット禁止)
- `package.json` の `version` は Conventional Commits に基づいて更新し、リリース時には対応する Git タグ (`v1.2.3`) を打つ

### ブランチ・PR

- `main` への直push禁止
- 機能開発はトピックブランチで行う (`cursor/<descriptive-name>-<suffix>` 等)
- PR にはレビュー1件以上が必要
- PR タイトル・本文は日本語
- PR を作成する前に Lint と Test がローカルで通ることを確認すること

### テスト

- 各 Issue / PR には対応するテストを必ず追加する (テスト不要な場合は理由を PR 本文に書く)
- ゲームロジックは決定論的にテスト可能な形で書く (固定シード + 固定 tick で再現できること)
- Lint と Test が CI で通らない PR はマージ不可

### ドキュメント

- README, AGENTS.md, `docs/` 配下、コミット、PR、Issue は **すべて日本語**
- 仕様変更を伴う PR は対応するドキュメントを同じ PR で更新する

## 各エージェント向けの作業指針

1. Issue を着手する前に、対象 Issue の説明と、Issue 内で参照されている `docs/` のファイルを必ず読むこと
2. 不明点があれば想像で実装せず、まず Issue / PR コメントで質問すること
3. Issue で指定された Acceptance Criteria を全て満たすこと (満たせない場合は Draft のまま PR コメントで相談)
4. 1 Issue = 1 PR を原則とする (例外がある場合は Issue 内で言及)
5. PR 作成後、CI が通ることを必ず確認する

## このファイルの更新タイミング

以下のいずれかに該当する変更が入った場合、このファイルを同じ PR で更新してください。

- 開発環境のセットアップ手順が変わった (依存追加・ツール変更)
- ビルド・テスト・Lint のコマンドが変わった
- コーディング規約・ブランチ運用・コミット規約が変わった
- レイヤ境界やアーキテクチャの根本方針が変わった
