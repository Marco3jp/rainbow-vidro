# [Phase1][C-02] ボールの生成・移動・速度

## 背景

ブロック崩しの中核となるボールエンティティを実装する。位置・速度を持ち、tick ごとに移動する基本動作のみを担当する (反射や衝突は別 Issue)。

## ゴール

- ボールエンティティを `WorldState` に登録できる。
- 各 tick で速度に応じて位置が更新される。
- 複数ボールに対応した状態構造を持つ (将来のボール複製対応のため)。

## 作業内容

1. `src/core/entities/Ball.ts` (型定義および生成関数) を作成する。
   ```ts
   export interface BallState {
     id: string;
     x: number;
     y: number;
     vx: number;
     vy: number;
     radius: number;
   }
   export function createBall(opts: {...}): BallState;
   ```
2. `src/core/systems/movement.ts` を作成する。
   - `updateBalls(state: WorldState, dt: number): void`
   - 各ボールについて `x += vx * (dt/1000)`, `y += vy * (dt/1000)` (単位は要検討、ただし `architecture.md` の方針に揃える)
3. `World.tick()` から `updateBalls` を呼ぶ。
4. ボールの速度・半径は定数または `WorldState.config` に保持 (後の Issue で character ステータスから注入できる構造を維持)。
5. ボール ID 生成は `SeededRng` 由来 or 連番 (決定論性を保つこと)。
6. テスト:
   - 1tick 進めたときの位置変化が想定通り
   - 複数ボールが独立に更新される

## 受け入れ条件

- [ ] テストが緑。
- [ ] 同一シード/初期状態で N tick 進めた結果が再現可能。
- [ ] 描画は本 Issue ではスキップ可。ただし任意で `BallView` を仮実装し、画面に動くボールが表示されると望ましい。

## スコープ外

- 反射 (C-04, C-05)
- バーとの衝突
- ブロックとの衝突

## 依存

- C-01

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §2.1
