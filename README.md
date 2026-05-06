# rainbow-vidro

スリングアクションを取り入れたブロック崩しゲーム。スキルを持ったキャラクターを操作し、ギミックを仕掛けてくる敵と戦う、戦略性と爽快感を両立した1プレイ約10分のWebゲームです。

## 特徴 (予定)

- **スリングメカニクス**: 一般的なブロック崩しのバーを拡張し、引っ張って射出するスリング操作
- **キャラクター**: 基礎ステータス・スキル2つ・アルティメット・パッシブを持つキャラクター
- **戦略性**: 攻撃ショット、回復、エリアギミックなどさまざまな特殊ブロック
- **対戦的なボス**: ボスブロック群で敵HPを削り、最終的に「ボスコアブロック」を破壊して勝利

## 開発状況

Phase 1 の基盤セットアップが完了し、ローカル開発コマンドが利用可能です。設計ドキュメントは [`docs/`](docs/) を参照してください。

- [`docs/requirements.md`](docs/requirements.md) — 要件と前提
- [`docs/game-design.md`](docs/game-design.md) — ゲームデザインの仕様
- [`docs/architecture.md`](docs/architecture.md) — システムアーキテクチャ
- [`docs/roadmap.md`](docs/roadmap.md) — 開発ロードマップ
- [`docs/testing.md`](docs/testing.md) — テスト戦略
- [`docs/operations.md`](docs/operations.md) — リポジトリ運用ルール

## 技術スタック

- TypeScript + Vite
- レンダラ: PixiJS v8 (レンダラ抽象化レイヤ経由で利用)
- Lint/Format: Biome
- Test: Vitest, Playwright (E2E)
- CI/CD: GitHub Actions
- Deploy: GitHub Pages

## ローカル開発コマンド

```bash
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
npm run test:watch
npm run test:coverage
```

## ライセンス

[MIT License](LICENSE)
