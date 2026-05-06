# [Phase1][F-06] PR プレビュー環境

## 背景

PR ごとに動作確認できるプレビュー環境を構築したい。GitHub Pages 単独では PR 単位の自動プレビューはサポートされないため、`gh-pages` ブランチのサブディレクトリにデプロイする方式を採る。

## ゴール

- PR を作成・更新するたびに、プレビュー URL (`https://<owner>.github.io/<repo>/pr-<number>/`) で動作確認できる。
- PR がクローズされたらプレビューが削除される。

## 作業内容

1. `.github/workflows/pr-preview.yml` を作成する。
   - トリガー: `pull_request` (`opened`, `synchronize`, `reopened`, `closed`)
   - 既存実装を利用するか自前実装するか判断する。候補:
     - `rossjrw/pr-preview-action` (推奨、メンテされているか確認したうえで採用)
     - 自前: ビルド → `gh-pages` ブランチの `pr-<number>/` にコピー → push、close 時に削除
   - PR にプレビューリンクをコメントで投稿する仕組みを含める。
2. Vite の `base` を、PR プレビュー時は `/<repo>/pr-<number>/` に切り替えられるようにする。
3. ブランチ保護設定および GitHub Pages のソース (`gh-pages` ブランチ) を有効化する手順を PR 本文に記載。
4. `docs/operations.md` の PR プレビュー説明を実手順で更新する。

## 受け入れ条件

- [ ] PR を作成するとプレビューがビルドされ、URL が PR コメントに投稿される。
- [ ] 同じ PR に push するとプレビューが更新される。
- [ ] PR をクローズするとプレビューが削除される。
- [ ] `docs/operations.md` が更新されている。

## スコープ外

- 本番デプロイ (F-05)

## 依存

- F-01, F-04, F-05

## 参照

- [`docs/operations.md`](../docs/operations.md)
