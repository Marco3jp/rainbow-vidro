# [Phase1][F-07] レンダラ抽象 (Renderer インタフェース + PixiRenderer 初期化)

## 背景

[`docs/architecture.md`](../docs/architecture.md) の通り、Core 層は PixiJS に依存しない設計とする。Render 層に `Renderer` インタフェースを置き、PixiJS 実装を `PixiRenderer` として配置する。

## ゴール

- `Renderer` インタフェースを定義し、`PixiRenderer` で PixiJS の Application を初期化できる。
- 任意の HTMLElement に Pixi のキャンバスをマウントし、簡単な図形 (例: 矩形1個) を描画できる。
- Core 層から PixiJS への依存が一切ないことが保証される (型レベル + import レベル)。

## 作業内容

1. dependencies に追加: `pixi.js` (v8 系)
2. `src/render/Renderer.ts` に `Renderer` インタフェースを定義する。
   ```ts
   export interface Renderer {
     mount(container: HTMLElement): Promise<void>;
     unmount(): void;
     resize(width: number, height: number): void;
     render(prev: WorldSnapshot, curr: WorldSnapshot, alpha: number): void;
   }
   ```
   `WorldSnapshot` の型は `src/core/world/WorldState.ts` から import する (C-01 で定義予定。先に最小限のプレースホルダで OK)。
3. `src/render/PixiRenderer.ts` に `PixiRenderer` 実装を作成する。
   - PIXI.Application を初期化
   - resize ハンドリング
   - `render` メソッドは現時点では空でよい (描画オブジェクトは後続 Issue で追加)
4. `src/app/main.ts` で `PixiRenderer` をインスタンス化して `#app` にマウントし、テスト用に矩形を1個描画する。
5. `src/render/index.ts` で公開 API を export する (`Renderer` のみ。`PixiRenderer` は `app/main.ts` でのみ参照する想定)。
6. Lint 設定で `src/core/**` から `pixi.js` の import を禁止するルールを追加する (`overrides` で `noRestrictedImports` 等)。
7. テスト:
   - `Renderer` インタフェースを満たすモック実装を作り、`tests/unit/render/` で型レベルのチェック (コンパイル成立) を行う。

## 受け入れ条件

- [ ] `npm run dev` でブラウザに矩形が表示される。
- [ ] `src/core/` ディレクトリ内のファイルから `pixi.js` を import すると Lint エラーになる。
- [ ] `npm run typecheck` が通る。
- [ ] テストが緑。

## スコープ外

- 実際のゲームエンティティの描画 (各エンティティ Issue で対応)
- ループ駆動 (F-08)

## 依存

- F-01, F-02

## 参照

- [`docs/architecture.md`](../docs/architecture.md)
