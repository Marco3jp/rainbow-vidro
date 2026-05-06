# [Phase1][C-08] プレイヤー HP / 敗北判定

## 背景

ブロックがプレイヤー領域 (フィールド下端) に接触するとプレイヤーがダメージを受ける。HP が 0 になると敗北 ([`docs/game-design.md`](../docs/game-design.md) §1)。

## ゴール

- ブロックが下端に到達した際にプレイヤー HP が減る。
- プレイヤー HP が 0 になると `WorldState.phase === 'lost'` に遷移する。

## 作業内容

1. `src/core/systems/playerDamage.ts` を作成する。
   - `applyBlockReachedDamage(state: WorldState): void`
   - 下端を超えたブロックを検出し、ブロックごとにプレイヤーへ固定ダメージを与え、該当ブロックを除去する
   - ダメージ量は `WorldState.config.blockReachDamage` で外出し [要調整]
2. `src/core/systems/winLoseCheck.ts` を作成する (もしくは C-13 の勝利判定と統合)。
   - `WorldState.entities.character.hp <= 0` で `phase` を `'lost'` に設定
3. `World.tick()` の最後に勝敗判定を入れる。
4. `phase !== 'playing'` のときは他 system の更新を停止する (ループ自体は走る)。
5. テスト:
   - 下端を超えたブロックで HP が減る
   - HP 0 で `phase === 'lost'`
   - 既に `lost` のときに更に処理が走らない

## 受け入れ条件

- [ ] テストが緑。
- [ ] 実機で「ブロックが届くとライフが減って負ける」体験ができる。

## スコープ外

- 結果画面 (U-03)
- ボス勝利判定 (C-13)

## 依存

- C-07, H-01

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §1
