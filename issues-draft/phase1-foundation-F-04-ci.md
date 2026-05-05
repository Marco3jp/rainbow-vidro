# [Phase1][F-04] CI 構築 (GitHub Actions: lint + typecheck + test + build)

## 背景

`AGENTS.md` で「Lint と Test が CI で通らない PR はマージ不可」と定めている。GitHub Actions で PR / push 時に自動チェックする CI を構築する。

## ゴール

- PR と main への push で、Lint / Type check / Unit test / Build が自動実行される。
- ステータスチェックが GitHub の PR 画面に表示される。

## 作業内容

1. `.github/workflows/ci.yml` を作成する。
   - トリガー: `push` (main), `pull_request`
   - ジョブ:
     - Node セットアップ (LTS、`actions/setup-node@v4`、`cache: npm`)
     - `npm ci`
     - `npm run lint`
     - `npm run typecheck`
     - `npm run test`
     - `npm run build`
2. (任意) E2E は時間がかかる場合は別ジョブに分ける。1stバージョンでは smoke のみで分岐は不要、同ジョブ末尾で実行。
3. ブランチ保護設定 (リポジトリ設定の話) は別途依頼するため、本 Issue では言及のみ (PR 本文に「マージ前にブランチ保護を有効化してください」を明記)。
4. README にバッジを追加 (CI ステータスバッジ)。

## 受け入れ条件

- [ ] PR を作成すると CI が起動し、すべてのジョブが緑になる。
- [ ] Workflow ファイルがリポジトリの規約 (YAML、コメント日本語) に従っている。
- [ ] README に CI バッジが追加されている。

## スコープ外

- デプロイ (F-05)
- PR プレビュー (F-06)

## 依存

- F-01, F-02

## 参照

- [`docs/operations.md`](../docs/operations.md)
- [`docs/testing.md`](../docs/testing.md)
