# Issue 原稿 (仮置き)

このディレクトリは、リポジトリ管理者が確認したのち、対応する GitHub Issue を作成するための **仮置きの原稿** です。Issue 化が完了したら、このディレクトリは削除されます。

## ファイル命名規約

`<phase>-<area>-<id>-<short-title>.md`

- `phase`: `phase1` / `phase2` 等
- `area`: `foundation` / `core` / `character` / `ui` / `quality` / `meta` 等
- `id`: ロードマップで採番した ID (`F-01` など)
- `short-title`: 短い表題 (kebab-case)

## Phase

- **Phase 1**: 1stバージョン (詳細 Issue を作成)
- **Phase 2 以降**: 概要 Issue のみ作成 (各フェーズ着手時に詳細化する)

## ラベル指針 (Issue 作成時に付与)

- `phase:1` / `phase:2` ...
- `area:foundation` / `area:core` / `area:character` / `area:ui` / `area:quality`
- `type:setup` / `type:feature` / `type:test` / `type:infra` / `type:docs`
- `priority:high` / `priority:medium` / `priority:low`
- `good-first-issue` (シンプルなものに付ける)

## 依存関係の見方

各 Issue 原稿の「依存」セクションには、先に完了している必要がある Issue を ID で記載しています。
