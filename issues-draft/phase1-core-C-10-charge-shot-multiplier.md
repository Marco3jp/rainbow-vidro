# [Phase1][C-10] チャージショット倍率 (ジャスト判定)

## 背景

スリングの引っ張り解放タイミングが「弦」(理想中央タイミング) に近いほど、チャージショット倍率が高くなる音ゲー的なメカニクス ([`docs/game-design.md`](../docs/game-design.md) §2.2)。

## ゴール

- 解放タイミングのジャスト度を計算する関数を提供する。
- ジャスト度に応じて倍率を算出し、`BallState.damageMultiplier` に乗算する。

## 作業内容

1. `src/core/systems/chargeShot.ts` を作成する。
   ```ts
   export function calcJustness(elapsedMs: number, idealMs: number, windowMs: number): number;
   export function calcChargeMultiplier(justness: number, character: CharacterState): number;
   ```
   - `justness` は `0` (外れ) から `1` (完璧) の連続値
   - `chargeMultiplier` は justness と CharacterStats のチャージ倍率係数の積で算出
2. C-09 の `slingControl` から `calcChargeMultiplier` を呼び、attached ボールの `damageMultiplier` に乗算する。
3. 設定値 (idealMs, windowMs, 最大倍率) は `WorldState.config` か CharacterStats に外出し [要調整]。
4. テスト:
   - idealMs に解放したときに justness = 1
   - windowMs を超えると justness = 0
   - 倍率が単調に増加 (justness が上がると倍率も上がる)
   - 通常反射 (バー反射)・壁減衰と組み合わせて期待通りに減衰・乗算される

## 受け入れ条件

- [ ] テストが緑。
- [ ] 実機で「ジャスト解放するとダメージが大きく出る」感覚が掴める。

## スコープ外

- スリング強化スキル (H-06)

## 依存

- C-09

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §2.2
