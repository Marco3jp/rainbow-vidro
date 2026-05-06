# リポジトリ運用

## 1. ブランチ戦略

- `main`: 常にデプロイ可能な状態を維持
- 直 push 禁止。PR 経由でのみマージする
- トピックブランチ命名: `cursor/<descriptive-name>-<suffix>` (コーディングエージェント) または `feature/<name>` `fix/<name>` (人間)

## 2. PR 運用

- PR はデフォルトで Draft で作成
- レビューは1件以上必須
- CI (Lint + Type check + Test + Build) が緑であること
- 関連 Issue を本文にリンク (`Closes #N`)
- タイトル・本文は **日本語**

### マージ方針

- Squash merge を基本とする (Issue 単位のコミット履歴を main に残す)
- リリース時はタグ (`v1.2.3`) を打ち、`package.json` の `version` を Conventional Commits に基づいて更新

## 3. コミット規約

- **Conventional Commits** に従う
- メッセージは **日本語** で書く
- 例:
  - `feat: スリングのチャージショットを実装する`
  - `fix: ボールが下端で消失する不具合を修正する`
  - `docs: アーキテクチャの状態管理方針を追記する`
  - `refactor: World の tick ロジックを system 関数に分離する`
  - `test: ブロック破壊系の統合テストを追加する`
  - `chore: Biome の設定を更新する`
  - `ci: GitHub Pages デプロイに PR プレビューを追加する`
- 1コミット = 1論理変更。複数論理変更の混在禁止

### 破壊的変更

- `feat!: ...` または body に `BREAKING CHANGE:` を記載
- メジャーバージョンを上げる

## 4. バージョニング

- セマンティックバージョニング
- リリース時のフロー:
  1. `package.json` の `version` を更新
  2. CHANGELOG (将来追加) を更新
  3. `vX.Y.Z` タグを打つ
  4. main ブランチからデプロイ

## 5. CI/CD (予定)

GitHub Actions:

- `ci.yml`: PR と main への push で Lint / Type / Test / Build
- `deploy.yml`: main マージで GitHub Pages へ本番デプロイ
- `pr-preview.yml`: PR open/sync で `gh-pages` のサブディレクトリ (`/pr-<number>/`) へプレビュー配信。PR close 時にクリーンアップ

実装は Phase 1 の F-04, F-05, F-06 で行う。

## 6. Issue 運用

- ロードマップに沿った Issue は [`docs/roadmap.md`](roadmap.md) を起点に作成
- 各 Issue は **独立したコーディングエージェントが担当できるように、必要な前提・成果物・受け入れ条件を明記**
- 大きすぎる Issue は分割する (1 Issue = 1 PR、ビルド可能な単位)

## 7. ドキュメント更新

- 仕様変更を伴う PR は対応するドキュメントを同じ PR で更新する
- 設計方針が変わった場合は `docs/architecture.md` を必ず更新
- 新しい Tooling やビルドコマンドが入った場合は `AGENTS.md` の該当節を更新

## 8. ローカル開発のセットアップ

> Phase 1 の F-01 完了後にこのセクションを実手順で埋める。

## 9. デプロイ

- 本番: GitHub Pages (URL は Pages 設定後に追記)
- PR プレビュー: `gh-pages/pr-<number>/` 以下 (Phase 1 の F-06 完了後)

## 10. ライセンスと貢献

- ライセンス: MIT
- 外部コントリビュータからの PR を受ける際の規約は将来追加予定
