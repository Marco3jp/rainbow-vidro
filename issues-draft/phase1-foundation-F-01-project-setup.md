# [Phase1][F-01] プロジェクトセットアップ (Vite + TypeScript + npm + Biome)

## 背景

`rainbow-vidro` リポジトリは現在 `README.md` / `LICENSE` / `AGENTS.md` / `docs/` のみが存在する。最初の実装に向けて、Webフロントエンドのビルド基盤・型チェック・Lintを整備する必要がある。

技術スタックは [`docs/architecture.md`](../docs/architecture.md) と [`docs/operations.md`](../docs/operations.md) に従う。

## ゴール

- TypeScript + Vite + npm + Biome での開発環境を構築し、`npm run dev` でローカルサーバが立ち上がり、`npm run build` で静的ビルドができる状態にする。
- 開発時に Biome による Lint と Format が動く状態にする。

## 作業内容

1. `package.json` を作成する。
   - `name`: `rainbow-vidro`
   - `version`: `0.0.0`
   - `private`: `true`
   - `type`: `module`
   - `scripts`:
     - `dev`: `vite`
     - `build`: `tsc -p tsconfig.build.json && vite build`
     - `preview`: `vite preview`
     - `lint`: `biome check .`
     - `lint:fix`: `biome check --write .`
     - `format`: `biome format --write .`
     - `typecheck`: `tsc --noEmit`
2. 依存追加 (devDependencies):
   - `vite`
   - `typescript`
   - `@biomejs/biome`
3. `tsconfig.json` を作成する。
   - `target`: `ES2022`
   - `module`: `ESNext`
   - `moduleResolution`: `bundler`
   - `strict`: `true`
   - `noUncheckedIndexedAccess`: `true`
   - `noImplicitOverride`: `true`
   - `exactOptionalPropertyTypes`: `true`
   - `verbatimModuleSyntax`: `true`
   - `lib`: `["ES2022", "DOM", "DOM.Iterable"]`
   - `paths`: `{"@/*": ["src/*"]}`
4. `tsconfig.build.json` を作成する (`tsconfig.json` を extends してビルド用に `noEmit: false` に等)。
5. `biome.json` を作成し、以下の方針で設定する。
   - フォーマッタ: 半角スペース2、シングルクォート、セミコロンあり、行幅 100
   - Lint: 推奨ルール ON
   - import の整列を ON
   - **`Math.random` の使用禁止ルール**: `noBuiltinGlobals` などで対応できない場合は、`overrides` で `src/core/**` に対してカスタム警告を出すコメントをドキュメント化 (将来 Lint 強化の余地を残す)
6. `index.html` を作成する。最低限のスケルトンと `<script type="module" src="/src/app/main.ts"></script>`。
7. `src/app/main.ts` に `console.log('rainbow-vidro')` の初期コードを置く。
8. `.gitignore` を作成する (`node_modules`, `dist`, `.DS_Store`, `*.log` 等)。
9. README に `npm install` / `npm run dev` / `npm run build` / `npm run lint` のコマンドを追記する。
10. `AGENTS.md` の `> NOTE:` (Issue #1 完了前のため動かないという記載) を、実コマンドに置き換える。
11. `docs/operations.md` の「ローカル開発のセットアップ」セクションを実手順で埋める。

## 受け入れ条件

- [ ] `npm install` が成功する。
- [ ] `npm run dev` で Vite 開発サーバが起動し、ブラウザで `index.html` が表示される (内容は空でよい)。
- [ ] `npm run build` が成功し `dist/` が生成される。
- [ ] `npm run lint` がエラー無しで通る。
- [ ] `npm run typecheck` がエラー無しで通る。
- [ ] README, AGENTS.md, docs/operations.md の関連箇所が更新されている。

## スコープ外

- テストフレームワークの導入 (F-02 で対応)
- CI 構築 (F-04 で対応)
- レンダリング・ゲームロジックの実装

## 依存

なし (最初の Issue)

## 参照

- [`docs/architecture.md`](../docs/architecture.md)
- [`docs/operations.md`](../docs/operations.md)
- [`AGENTS.md`](../AGENTS.md)
