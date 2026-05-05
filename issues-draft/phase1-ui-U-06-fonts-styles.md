# [Phase1][U-06] フォント・基本スタイル (Noto Sans JP)

## 背景

UI フォントは Noto Sans JP を採用する ([`docs/requirements.md`](../docs/requirements.md) §5)。最低限の CSS と文字レンダリングを整える。

## ゴール

- Noto Sans JP が Web から読み込まれ、UI 全体に適用されている。
- 最低限のリセット CSS と基調色のスタイルが整っている。
- 16:9 のフレキシブルなレイアウトで表示崩れがない。

## 作業内容

1. `src/ui/styles/global.css` を作成し、リセット CSS とベース色・タイポを定義する。
2. Noto Sans JP の読み込み:
   - `<link rel="preconnect">` + `<link rel="stylesheet">` で Google Fonts から読む (CSP・オフライン使用は将来検討)
   - 必要なウェイト (Regular, Bold) のみ取得
3. 16:9 のセーフエリアを CSS で確保 (例: `aspect-ratio: 16/9; max-width: 100vw; max-height: 100vh;`)。
4. フィールド領域とサイド領域のラフレイアウトを CSS Grid / Flex で組む (4:3 もしくは 3:4 切替が容易な構造)。
5. テスト:
   - E2E でページを開いたときにフォント名が `Noto Sans JP` を含むことを確認 (ヘッドレスでも CSS 値を確認)
   - レスポンシブで主要要素が画面内に収まる

## 受け入れ条件

- [ ] 実機で Noto Sans JP が適用されている。
- [ ] 16:9 のレイアウトが崩れない。
- [ ] テストが緑。

## スコープ外

- リッチなアニメーション
- 多言語

## 依存

- U-01, U-02 (順序ではなく参照)

## 参照

- [`docs/requirements.md`](../docs/requirements.md) §5
