# [Phase1][C-04] 壁反射 (上下左右、減衰倍率)

## 背景

ボールはフィールドから出ない仕様。4辺すべてで反射する。バー反射 (C-05) と異なり、壁反射には倍率の段階的な減衰がかかる ([`docs/game-design.md`](../docs/game-design.md) §2.2)。

## ゴール

- 上下左右の壁でボールが反射する。
- 反射時に壁ごとの減衰倍率を `BallState` の attack ratio 系フィールドに反映する。
- 倍率の段階的減衰仕様を実装する。

## 作業内容

1. `BallState` を拡張する。
   ```ts
   interface BallState {
     // ... existing fields
     /** 現在のショット倍率 (バー反射 / チャージで上昇、壁反射で減衰) */
     damageMultiplier: number;
   }
   ```
2. `src/core/systems/wallReflection.ts` を作成する。
   - 4辺との衝突判定 (位置 + 半径)
   - 衝突時:
     - 該当軸の速度を反転
     - 位置を境界内にクランプ (めり込み防止)
     - `damageMultiplier` を以下のルールで更新:
       - 下壁: 常に 1.0 にリセット (もしくは 1.0 と max を取る、仕様確認用 [要調整])
       - 上/左/右壁: 1.0 に向かって段階的に減衰 (例: `multiplier = max(1.0, multiplier * 0.85)`、係数は `WorldState.config.wallDecayFactor` で外出し、デフォルト [要調整])
3. `World.tick()` から呼ぶ順序は `movement → wallReflection → barReflection (C-05)` を想定。
4. ボール複製等で複数ボールが存在しても各ボールごとに正しく動作すること。
5. テスト:
   - 各壁での反射方向が正しい
   - 壁反射ごとに倍率が減衰する
   - 下壁では倍率が 1.0 になる
   - 倍率は 1.0 を下回らない

## 受け入れ条件

- [ ] テストが緑。
- [ ] 描画でボールが画面外に出ない (実機確認推奨)。

## スコープ外

- バー反射 (C-05)
- ブロック衝突 (C-06)
- チャージショット倍率 (C-10)

## 依存

- C-02

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §2.2 「反射倍率の概念」
