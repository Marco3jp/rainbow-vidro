# [Phase1][C-06] ブロック (HP・衝突・破壊・経験値)

## 背景

通常ブロックを実装する。HP を持ち、ボールの衝突でダメージを受け、HP0 で破壊される。破壊時に経験値を発生させる ([`docs/game-design.md`](../docs/game-design.md) §2.3)。

## ゴール

- ブロックエンティティを `WorldState` に登録できる。
- ボールとブロックの衝突判定が正しく動作する。
- ブロック破壊時に経験値が `CharacterState` に加算される。

## 作業内容

1. `src/core/entities/Block.ts` を作成する。
   ```ts
   export interface BlockState {
     id: string;
     kind: 'normal'; // 後続 Issue で 'special' / 'boss' / 'bossCore' を追加
     x: number;
     y: number;
     width: number;
     height: number;
     hp: number;
     maxHp: number;
     expReward: number;
   }
   ```
2. `src/core/systems/blockCollision.ts` を作成する。
   - ボールと全ブロックの衝突判定 (Circle-AABB)
   - 衝突時:
     - ブロックの該当辺を判定し、ボール速度を反射 (壁反射と同じ計算)
     - ブロック HP を `damage = character.attack * ball.damageMultiplier` で減算
     - HP <= 0 なら破壊フラグを立て、本 tick の後処理で削除
     - 破壊時にキャラクターに経験値を加算 (経験値計算は H-08 と同期)
3. ボール反射時の倍率減衰についてはブロック反射では起こさない (= バー反射と同様、`damageMultiplier` 維持) を初期仕様とする [要調整]。
4. ブロックの初期配置は固定パターン (例: 上部に N x M の格子) を提供する関数を用意。
5. テスト:
   - ボールが当たるとブロック HP が減る
   - HP 0 でブロックが除去される
   - キャラクター経験値が加算される
   - 同 tick 内で複数ボールが同じブロックに当たっても正しく処理される (順序依存しない)

## 受け入れ条件

- [ ] テストが緑。
- [ ] 実機でブロックが破壊できる。

## スコープ外

- 特殊ブロック (C-11)
- ボスブロック (C-12)
- ボスコアブロック (C-13)
- ブロック前進 (C-07)

## 依存

- C-02, C-04, C-05, H-01 (キャラクター基礎ステータス)

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §2.3
