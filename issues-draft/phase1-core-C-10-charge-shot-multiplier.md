# [Phase1][C-10] チャージショット倍率 (チャージ倍率 × ヒット倍率)

## 背景

スリングのチャージショットは **2軸の積** で倍率が決まる ([`docs/game-design.md`](../docs/game-design.md) §2.2)。

- **チャージ倍率 (`chargeFactor`)**: リリース位置 (= リリース時の弧深さ) によって決まる。最大チャージ位置でリリース = 最大、ゼロ位置に近いほど小さい
- **ヒット倍率 (`hitFactor`)**: ヒット位置 (= リリース戻り中の弧位置) によって決まる。ゼロ位置で当てる = 最大、リリース位置で当てる = 最小

最終倍率: `chargeShotMultiplier = chargeFactor × hitFactor × character.stats.chargeShotMultiplier`

## ゴール

- C-09 が記録した `BarState.releaseDepth` と `BallState.lastChargeHitProgress` から二軸の倍率を算出する純粋関数を提供する。
- 既存の C-09 の射出処理にこの倍率を組み込み、ボールの `damageMultiplier` に乗算する。

## 作業内容

1. `src/core/systems/chargeShot.ts` を作成する。
   ```ts
   /**
    * チャージ倍率を返す。
    * @param releaseDepth リリース時の弧深さ (0..1)。1 = 最大チャージ位置
    * @param config 倍率設定値
    */
   export function calcChargeFactor(
     releaseDepth: number,
     config: { chargeFactorMin: number; chargeFactorMax: number },
   ): number;

   /**
    * ヒット倍率を返す。
    * @param hitProgress ヒット位置の正規化進捗 (0..1)。0 = リリース位置, 1 = ゼロ位置
    * @param config 倍率設定値
    */
   export function calcHitFactor(
     hitProgress: number,
     config: { hitFactorMin: number; hitFactorMax: number },
   ): number;

   /**
    * チャージショット最終倍率
    */
   export function calcChargeShotMultiplier(
     releaseDepth: number,
     hitProgress: number,
     character: CharacterState,
     config: WorldConfig,
   ): number;
   ```
   - `chargeFactor`: `chargeFactorMin + (chargeFactorMax - chargeFactorMin) * releaseDepth` (線形補間、初期値 [要調整]: min=1.0, max=2.5 程度を想定)
   - `hitFactor`: `hitFactorMin + (hitFactorMax - hitFactorMin) * hitProgress` (線形補間、初期値 [要調整]: min=1.0, max=2.0 程度を想定)
   - 最終倍率: `chargeFactor * hitFactor * character.stats.chargeShotMultiplier`
2. C-09 の `slingControl.ts` / `slingPickup.ts` のヒット時射出処理から `calcChargeShotMultiplier` を呼び、`BallState.damageMultiplier *= multiplier` を適用する。
3. `WorldState.config` に以下を追加:
   - `chargeFactorMin`, `chargeFactorMax` **[要調整]**
   - `hitFactorMin`, `hitFactorMax` **[要調整]**
4. テスト:
   - `releaseDepth = 0`, `hitProgress = 0` で `chargeFactor = chargeFactorMin`, `hitFactor = hitFactorMin` (理論上の最低値)
   - `releaseDepth = 1`, `hitProgress = 1` で `chargeFactor = chargeFactorMax`, `hitFactor = hitFactorMax` (理論上の最大値)
   - 中間値で線形補間される
   - キャラの `chargeShotMultiplier` ステータスが正しく乗算される
   - C-09 の attached ボールが射出されたケース (`hitProgress === 0`) でヒット倍率が `hitFactorMin` になる
   - 戻り完了直前のヒット (`hitProgress ≒ 1`) でヒット倍率が `hitFactorMax` 近辺になる
   - 火力ランキング ([`docs/game-design.md`](../docs/game-design.md) §2.2) を満たす数値関係になっている (`chargeFactorMin × hitFactorMin >= 1.0` などを assert)

## 受け入れ条件

- [ ] テストが緑。
- [ ] 実機で「最大チャージ + ジャストタイミングでゼロ位置ヒット」が他のヒット条件より明確に高ダメージになる。
- [ ] 火力ランキングがゲームデザイン通り (下壁 < ノーチャージバー反射 < チャージ途中リリース < 最大チャージリリース)。

## スコープ外

- スリング強化スキル (H-06)
- イージング (リリース戻りの時間カーブ) — 線形で実装し、必要なら C-09 で別途調整

## 依存

- C-09

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §2.2 「チャージショット (リリーススイープ型メカニクス)」「火力ランキング」
