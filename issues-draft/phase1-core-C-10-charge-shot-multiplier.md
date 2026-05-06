# [Phase1][C-10] チャージショット倍率 (ジャストタイミング判定)

## 背景

スリングのチャージショットは「マウスを離した瞬間のボール位置」で倍率が決まる ([`docs/game-design.md`](../docs/game-design.md) §2.2)。

- **ベスト**: ボールが `baseArc` 直近にいる状態で離す (= バーが戻り終えたタイミングでボールが元の弧位置にピッタリ来る)
- **ワースト**: ボールが `pulledArc` に接触して停止している状態で離す (倍率最低、ただしボールを止められる戦術メリットあり)

## ゴール

- マウスを離した瞬間の各 attached ボールの位置から「ジャスト度」を算出する関数を提供する。
- ジャスト度に応じてチャージショット倍率を算出し、`BallState.damageMultiplier` に乗算する。
- 既存の C-09 の射出処理にこの倍率を組み込む。

## 作業内容

1. `src/core/systems/chargeShot.ts` を作成する。
   ```ts
   /**
    * 吸い込み状態のボールについて、ジャスト度を [0, 1] で返す。
    * 1.0 = baseArc 直近 (ベスト)
    * 0.0 = pulledArc に接触して停止 (ワースト)
    */
   export function calcJustness(args: {
     ballX: number;
     ballY: number;
     baseArc: BarState['baseArc'];
     pulledArc: BarState['pulledArc'];
     ballAttached: boolean; // pulledArc に接触して止まっているか
   }): number;

   /**
    * ジャスト度とキャラステータスからチャージショット倍率を返す。
    */
   export function calcChargeMultiplier(
     justness: number,
     character: CharacterState,
   ): number;
   ```
   - `calcJustness` の実装方針: `baseArc` からの距離を 0、`pulledArc` までの距離を 1 として正規化し、`1 - 正規化距離` を返す。`ballAttached === true` の場合は最低値 (例: `WorldState.config.attachedJustness`、初期 0.0 [要調整]) を返す
   - `calcChargeMultiplier` の実装方針: `chargeShotBase + (chargeShotMax - chargeShotBase) * justness` を `character.stats.chargeShotMultiplier` で乗算 [要調整]
2. C-09 の `slingControl.ts` の `mouseup` ハンドラを修正し、各 attached ボールについて以下を行う:
   - `calcJustness` で justness 算出
   - `calcChargeMultiplier` で倍率算出
   - 射出ベクトル × 速度 を設定
   - `BallState.damageMultiplier *= chargeMultiplier` を適用 (壁減衰は C-04 のとおり次の壁衝突で減衰する)
3. ジャスト度が「ワーストでも 0 ではない」ことを仕様化:
   - 設定値 `WorldState.config.attachedJustness` (初期 0.0 想定だが調整余地あり [要調整])
   - 設計コメントで「ワーストはチャージショットの中で最低、ただし停止メリットがある」を残す
4. テスト:
   - ボールが `baseArc` 上にいるとき justness = 1
   - ボールが `pulledArc` 上 (= 接触停止) にいるとき justness = `attachedJustness`
   - 中間位置で線形補間される
   - 倍率が justness に対して単調増加
   - 既存の壁減衰 (C-04) と組み合わせて期待通り適用される

## 受け入れ条件

- [ ] テストが緑。
- [ ] 実機で「タイミングよく離すとダメージが大きい / バーで止めて確実に当てるとダメージは控えめ」というトレードオフが体感できる。

## スコープ外

- スリング強化スキル (H-06)
- 湾曲バーの描画演出

## 依存

- C-09

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §2.2 「ジャスト判定 (チャージショット倍率)」
