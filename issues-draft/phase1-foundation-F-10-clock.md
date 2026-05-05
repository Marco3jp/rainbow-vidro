# [Phase1][F-10] Clock 抽象 (SimClock / RealClock)

## 背景

Core 層は実時刻に依存しない設計とする ([`docs/architecture.md`](../docs/architecture.md))。シミュレーション内部で参照する時刻は `Clock` インタフェース経由とし、実装を差し替えられるようにする。

## ゴール

- `Clock` インタフェースと `SimClock` / `RealClock` 実装を提供する。
- 各実装が決定論性とテスト容易性を満たす。

## 作業内容

1. `src/platform/clock.ts` を作成する。
   ```ts
   export interface Clock {
     /** 現在のシミュレーション内時刻 (ms) */
     now(): number;
   }

   /** 固定 step を進めるシミュレーション用 Clock */
   export class SimClock implements Clock {
     private elapsedMs = 0;
     now(): number;
     advance(stepMs: number): void;
   }

   /** 実時刻 (ブラウザ環境での参考用) */
   export class RealClock implements Clock {
     private readonly origin: number;
     constructor(originMs?: number);
     now(): number;
   }
   ```
2. `World` に `Clock` を注入できる構造を意識する (実装は C-01 で行うため、本 Issue では型整備のみで OK)。
3. `src/platform/index.ts` で公開 API を export する。
4. テスト:
   - `SimClock` の `advance` で `now()` が正しく増える
   - `RealClock` は origin を起点に計測される (テストではモックで `performance.now()` を差し替え)
5. Lint 設定で `src/core/**` から `performance.now` / `Date.now` の使用を制限する (難しければドキュメント化)。

## 受け入れ条件

- [ ] テストが緑。
- [ ] `SimClock` が決定論的に動作する。
- [ ] `Math.random` 同様、Core 層で実時刻 API を使わない方針が文書化されている。

## スコープ外

- 実際の Clock 利用 (各機能 Issue)

## 依存

- F-01, F-02

## 参照

- [`docs/architecture.md`](../docs/architecture.md)
