# [Phase1][F-09] Seeded RNG (Mulberry32)

## 背景

決定論性の要として、`Math.random` の代わりに seed ベースの RNG を全コア層で使う方針 ([`docs/architecture.md`](../docs/architecture.md))。Mulberry32 を採用する。

## ゴール

- `SeededRng` インタフェースと `Mulberry32` 実装を提供する。
- 同一シードで同一の乱数列が得られることをテストで保証する。
- Core 層 (`src/core/`) では `Math.random` を使わない設計を維持する (Lint で警告できればなお可)。

## 作業内容

1. `src/platform/rng.ts` を作成する。
   ```ts
   export interface SeededRng {
     readonly seed: number;
     next(): number;          // [0, 1)
     nextInt(maxExclusive: number): number;
     nextRange(minIncl: number, maxExcl: number): number;
     fork(): SeededRng;       // 子 RNG (内部状態を派生)
     getState(): number;
     setState(state: number): void;
   }
   export function createMulberry32(seed: number): SeededRng;
   ```
2. `Mulberry32` の実装を行う。
3. `src/platform/index.ts` で公開 API を export する。
4. テスト:
   - 同一シードで `next()` を 1000 回呼んだときの乱数列が固定 (スナップショットテスト) になる
   - `getState/setState` で再現可能
   - `nextInt(0)` などのエッジケース挙動定義 (例: 例外を投げる) を仕様化
   - `fork()` の結果が親と独立した乱数列を生成する
5. Biome に `noGlobalUsage` 系で `Math.random` を `src/core/**` で警告するルールを設定する (Biome 標準で困難な場合は `// biome-ignore` コメントで意図を残し、ESLint 移行時の TODO コメントを書く)。

## 受け入れ条件

- [ ] テストが緑。
- [ ] Lint で `src/core/` 内の `Math.random` 使用を検出できる (難しければ次善策として CI スクリプトで grep する)。
- [ ] スナップショット (期待される乱数列の最初の数値) がドキュメント化されている。

## スコープ外

- 実際の RNG の利用箇所 (各機能 Issue で利用)

## 依存

- F-01, F-02

## 参照

- [`docs/architecture.md`](../docs/architecture.md)
