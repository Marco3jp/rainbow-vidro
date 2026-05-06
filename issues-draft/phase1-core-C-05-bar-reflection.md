# [Phase1][C-05] バー反射 (1倍)

## 背景

通常状態 (引っ張りモードでない) のバーにボールが当たった場合、バーは1倍倍率で反射する。チャージショット時の倍率は C-10 で扱う。

## ゴール

- バーとボールの衝突を判定し、反射する。
- 反射時のボール速度方向はバー上の当たった位置に応じて変化させる (一般的なブロック崩しの「中心ほど真上」「端ほど斜め」)。
- 通常反射時は `damageMultiplier` を 1.0 で乗算 (= 維持) する。
- **下端反射直後のボールはバーを貫通させる** ([`docs/game-design.md`](../docs/game-design.md) §2.2)。下壁とバーの間で無意味なピンポンが起きないようにする。
- チャージモード中の挙動は本 Issue ではスキップ (C-09 で実装)。

## 作業内容

1. `BallState` に下端反射直後フラグを追加する。
   ```ts
   interface BallState {
     // ... existing fields
     /** 下端で反射した直後で、次のブロック/上壁/左右壁に当たるまでバーを貫通する */
     bottomReflectPassthrough: boolean;
   }
   ```
2. `src/core/systems/wallReflection.ts` (C-04) を更新し、下壁で反射したときに `bottomReflectPassthrough = true` をセットする。上/左/右壁との反射、およびブロックとの衝突 (C-06) で `false` にリセットする。
3. `src/core/systems/barReflection.ts` を作成する。
   - ボールとバーの AABB / Circle-AABB 衝突判定
   - `bottomReflectPassthrough === true` のボールは衝突しても反射処理をスキップ (= 貫通)
   - それ以外で衝突したら速度の y 成分を反転、x 成分はバー中央からのオフセットに応じて補正 (典型例: `vx = baseSpeed * sin(angleFromCenter)`、`vy = -baseSpeed * cos(angleFromCenter)`)
   - 衝突後の位置クランプ
   - `BarState.mode === 'charging'` の場合は本 Issue ではスキップ (`return`)、`normal` のときのみ反射処理 (湾曲バーの挙動は C-09 で実装)
4. `World.tick()` の system 呼び出し順を確認・更新。
5. テスト:
   - バー中央への垂直入射で速度の x 成分がほぼ 0 になる
   - バー端への入射で角度が変化する
   - `mode === 'charging'` のバーには反射しない (= 本 Issue では何も起きない、C-09 で湾曲挙動を実装)
   - 反射後 `damageMultiplier` が変わらない
   - `bottomReflectPassthrough === true` のボールはバーを貫通する
   - 上/左/右壁またはブロックに当たると `bottomReflectPassthrough` がリセットされる

## 受け入れ条件

- [ ] テストが緑。
- [ ] 実機でブロック崩しらしくボールが返ってくる。

## スコープ外

- チャージショット (C-09, C-10)
- 「下壁を超えたボールは消失しない」挙動の調整 (C-04)

## 依存

- C-02, C-03, C-04

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §2.2
