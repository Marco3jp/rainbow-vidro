# [Phase1][F-05] GitHub Pages デプロイ

## 背景

[`docs/operations.md`](../docs/operations.md) で本番デプロイは GitHub Pages に決定している。main マージで自動デプロイされる仕組みを作る。

## ゴール

- `main` ブランチへのマージで、ビルド成果物 (`dist/`) が自動的に GitHub Pages にデプロイされる。
- リポジトリの GitHub Pages 設定で公開 URL が確認できる。

## 作業内容

1. `.github/workflows/deploy.yml` を作成する。
   - トリガー: `push` to `main` および手動 (`workflow_dispatch`)
   - 公式アクションを利用 (`actions/upload-pages-artifact`, `actions/deploy-pages`)
   - 権限: `pages: write`, `id-token: write`
   - ステップ:
     - Node セットアップ
     - `npm ci`
     - `npm run build`
     - artifact upload (`./dist`)
     - deploy
2. Vite の `base` 設定を、Pages のサブパス公開に対応させる。
   - `vite.config.ts` で `base: process.env.BASE_PATH ?? '/'` を環境変数で切り替え
   - Workflow で `BASE_PATH=/<repository-name>/` を設定 (リポジトリ名に応じて)
3. README に公開 URL を追記する (デプロイ後に判明する URL)。
4. リポジトリの Pages 設定 (Source: GitHub Actions) を有効化する手順を PR 本文に明記。

## 受け入れ条件

- [ ] Workflow が main マージで動作し、Pages にデプロイされる。
- [ ] 公開 URL でゲームのスケルトン (空の index.html でも可) が表示される。
- [ ] README に公開 URL とバッジが追加されている。

## スコープ外

- PR プレビュー (F-06)

## 依存

- F-01, F-04

## 参照

- [`docs/operations.md`](../docs/operations.md)
