# [Phase1][C-15] ダメージ計算式の集約

## 背景

ダメージ計算は複数箇所 (壁反射倍率、バー反射、チャージ、パッシブバフ等) の倍率の積で決まる。集約された純粋関数として定義し、テスト可能にする ([`docs/game-design.md`](../docs/game-design.md) §2.1, §3)。

## ゴール

- 攻撃力と倍率列からダメージを算出する純粋関数を提供する。
- 既存システム (C-04, C-06, C-10, C-11, H-04 等) からこの関数を利用する。

## 作業内容

1. `src/core/systems/damage.ts` を作成する。
   ```ts
   export interface DamageInput {
     baseAttack: number;
     multipliers: ReadonlyArray<number>; // 反射倍率、チャージ倍率、パッシブ等
     additive?: ReadonlyArray<number>;   // 追加固定値 (将来)
     critical?: boolean;                 // 将来用
   }
   export function calcDamage(input: DamageInput): number;
   ```
   - 算出: `baseAttack * multipliers の積 + additive の和`
   - 結果は整数化 (切り捨て / 切り上げは設計判断、初期は四捨五入か Math.round 推奨) [要調整]
2. 既存の system が直接掛け算しているコードを `calcDamage` 経由にリファクタリングする。
3. テスト:
   - 倍率なしで baseAttack そのまま
   - 複数倍率の積が正しい
   - 0 倍率を含むと 0 になる
   - 整数化ルールが期待通り

## 受け入れ条件

- [ ] テストが緑。
- [ ] 既存ロジックが `calcDamage` を経由している。

## スコープ外

- クリティカル / 属性等の高度な要素 (将来 Phase)

## 依存

- C-04, C-06, C-10 (順序的にこれらが先 or 並行)

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §2.1, §3
