# [Phase1][F-08] 固定タイムステップ + 補間レンダリングループ

## 背景

[`docs/architecture.md`](../docs/architecture.md) の方針に従い、シミュレーションは固定 60Hz、描画は requestAnimationFrame で動かす "Fix Your Timestep!" パターンを採用する。120/144Hz モニタでも快適に表示するため、描画は前後 tick の補間を行う。

## ゴール

- アプリケーション層に固定タイムステップでシミュレーションを駆動するループを実装する。
- 描画は `Renderer.render(prev, curr, alpha)` に補間用の値 `alpha` を渡せるようにする。
- ループは「決定論性を壊さない」設計 (入力は tick 境界でのみ反映)。

## 作業内容

1. `src/app/GameLoop.ts` を作成する。
   - 引数: `World`, `Renderer`, `InputSource`
   - 定数: `STEP_MS = 1000 / 60`, `MAX_ACCUM_MS` (大遅延でのスパイラル防止、例: `STEP_MS * 5`)
   - `start()` / `stop()`
   - 内部で `requestAnimationFrame` を回す
   - 1 フレームの処理:
     1. 経過時間を accumulator に加算 (上限クランプ)
     2. accumulator が STEP_MS 以上ある間: `inputs = inputSource.poll()` → `world.tick(STEP_MS, inputs)` → `prev = curr; curr = world.snapshot()` → accumulator を減算
     3. `alpha = accumulator / STEP_MS`
     4. `renderer.render(prev, curr, alpha)`
2. `World` に対する暫定インタフェース (C-01 と整合する形) を作成または import する。
   - `tick(stepMs: number, inputs: ReadonlyArray<InputEvent>): void`
   - `snapshot(): WorldSnapshot`
3. `InputSource` 暫定インタフェース (F-12 と整合) を作成または import する。
4. `src/app/main.ts` を更新し、`GameLoop` を起動する (描画内容は F-07 のサンプル矩形のままで可)。
5. テスト (`tests/unit/app/`):
   - 偽の `Clock` / `RAF` を注入し、固定 dt を流したときに想定通り tick が回る (例: 100ms 経過で 6 tick) ことを検証
   - スパイラルクランプが効いている (1秒の遅延で6 tick以上発生しない) ことを検証
6. `Clock` および RAF を依存注入で差し替え可能にする (テストのため)。

## 受け入れ条件

- [ ] ループが 60Hz で安定して回る (実機で確認、ログで tick 数を出力可)。
- [ ] 補間値 `alpha` が `[0, 1)` の範囲で渡される。
- [ ] スパイラル防止のクランプが効く。
- [ ] 上記テストが緑。

## スコープ外

- 実際のゲームロジック (Core 層)
- 入力処理の実装 (F-12)

## 依存

- F-07

## 参照

- [`docs/architecture.md`](../docs/architecture.md)
