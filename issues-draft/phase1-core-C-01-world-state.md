# [Phase1][C-01] World と WorldState の型定義

## 背景

ゲーム全体状態は `World` クラスに集約し、`WorldState` はシリアライズ可能なプレーンオブジェクトで定義する ([`docs/architecture.md`](../docs/architecture.md) §4)。Core 層の中心となる型と骨組みを作る。

## ゴール

- `WorldState` 型と `World` クラスの骨組みを定義する。
- `World.tick()` と `World.snapshot()` の API を確定する。
- 後続の system 関数群が安心して書けるベースを作る。

## 作業内容

1. `src/core/world/WorldState.ts` を作成する。
   - `WorldState` はプレーンオブジェクト (クラスインスタンスを保持しない、function を保持しない)
   - 当面は最小限のフィールド。後続 Issue で拡張する。
   ```ts
   export interface WorldState {
     tickCount: number;
     elapsedMs: number;
     phase: 'preparing' | 'playing' | 'won' | 'lost';
     entities: {
       balls: BallState[];
       bar: BarState;
       blocks: BlockState[];
       boss: BossState;
       character: CharacterState;
     };
     field: { width: number; height: number };
     rngState: number;
   }
   ```
   - `BallState` / `BarState` / `BlockState` / `BossState` / `CharacterState` のスケルトン定義 (各 Issue で詳細化)
2. `src/core/world/World.ts` を作成する。
   ```ts
   export class World {
     readonly seed: number;
     private rng: SeededRng;
     private clock: SimClock;
     state: WorldState;
     constructor(opts: { seed: number; clock: SimClock; rng?: SeededRng; initialState?: WorldState; });
     tick(stepMs: number, inputs: ReadonlyArray<InputEvent>): void;
     snapshot(): WorldSnapshot;
   }
   export type WorldSnapshot = WorldState;
   ```
   - `tick()` 内では暫定で `tickCount++`, `elapsedMs += stepMs` のみ更新する (各 system は別 Issue で接続)
   - `snapshot()` は `structuredClone(state)` で深いコピーを返す
3. `src/core/index.ts` で公開 API を export する。
4. F-08 の `GameLoop` と接続し、矩形描画はそのままだがエンドツーエンドで `tick` が回るようにする。
5. テスト:
   - 同一シード・同一入力・同一 tick 数で `snapshot()` が一致する
   - `snapshot()` が後の状態変更で破壊されない (deep copy 確認)

## 受け入れ条件

- [ ] `World` を生成して 100 tick 回したときの snapshot がシードに対して安定 (テスト)
- [ ] `WorldState` が JSON シリアライズ可能 (`JSON.stringify(snapshot)` が成功する)
- [ ] テストが緑。

## スコープ外

- 各エンティティの実装 (C-02 以降)
- system 関数の本実装 (各 Issue)

## 依存

- F-08, F-09, F-10

## 参照

- [`docs/architecture.md`](../docs/architecture.md)
