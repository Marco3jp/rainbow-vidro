# [Phase1][C-12] ボスブロック (時間出現・敵HPへの反映)

## 背景

ボスブロックは時間で出現し、破壊することで「敵」のHPを大きく削る ([`docs/game-design.md`](../docs/game-design.md) §2.3 / §2.4)。

## ゴール

- ボスブロックを `kind: 'boss'` として実装する。
- 一定時間ごとにボスブロックが生成される。
- ボスブロック破壊で敵HPに反映される。

## 作業内容

1. `BlockState.kind` に `'boss'` を含める (C-11 で完了済みなら不要)。
2. `BossState` を `WorldState.entities.boss` に追加する。
   ```ts
   interface BossState {
     hp: number;
     maxHp: number;
   }
   ```
3. `src/core/systems/bossSpawn.ts` を作成する。
   - 出現間隔 `state.config.bossSpawnIntervalMs` で `kind: 'boss'` のブロックを生成
   - 出現位置はフィールド上部 (具体配置は [要調整])
4. ボスブロック破壊時に敵HPを `block.bossHpDamage` で減らすロジックを追加する。
5. テスト:
   - 一定 tick 経過後にボスブロックが出現する
   - ボスブロックが破壊されると敵HPが減る
   - 敵HPが下限値を下回らない

## 受け入れ条件

- [ ] テストが緑。
- [ ] 実機でボスブロックを破壊して敵HPゲージが減る。

## スコープ外

- ボスコアブロックの出現と勝利判定 (C-13)
- 敵スキル発動 (C-14)

## 依存

- C-06

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §2.3, §2.4
