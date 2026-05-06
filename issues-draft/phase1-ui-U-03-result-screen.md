# [Phase1][U-03] 結果画面 (勝敗・統計表示)

## 背景

試合終了時 (`phase === 'won' | 'lost'`) に結果画面を表示する ([`docs/requirements.md`](../docs/requirements.md) §4 / [`docs/game-design.md`](../docs/game-design.md) §5)。

> **NOTE**: 「リプレイ保存」ボタンはリプレイ基盤 (F-13) が後回しなので、**本 Issue では含めない**。F-13 完了後に追加 Issue で対応する。

## ゴール

- 勝敗結果と統計 (与ダメージ、被ダメージ、破壊ブロック数、最終レベル、スキルレベル、シード) を表示する。
- 「もう一度プレイ」「タイトルへ」のボタンを提供する。

## 作業内容

1. `src/ui/scenes/ResultScene.ts` を作成する。
2. World から統計 (`WorldState.stats`) を表示する。統計フィールドが存在しない場合は本 Issue で `WorldState.stats` を追加し、各 system 側で更新する。
   ```ts
   interface MatchStats {
     damageDealt: number;
     damageTaken: number;
     blocksDestroyed: number;
     bossBlocksDestroyed: number;
     finalLevel: number;
     finalSkillLevels: Record<string, number>;
     elapsedMs: number;
     seed: number;
   }
   ```
3. 関連する system (`blockCollision`, `playerDamage` 等) を更新し統計を加算する。
4. 「もう一度プレイ」「タイトルへ」ボタンを実装する。
5. テスト:
   - 統計が正しく集計される
   - 結果画面に必要項目が表示される
   - ボタンで適切なシーンに遷移する

## 受け入れ条件

- [ ] 実機で勝利/敗北どちらでも結果画面が表示される。
- [ ] テストが緑。

## スコープ外

- マッチヒストリー一覧 (U-04)
- リプレイ保存ボタン (F-13 後の追加 Issue)
- リプレイ再生 UI (U-05、優先度 B)

## 依存

- C-08, C-13

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §5
- [`docs/requirements.md`](../docs/requirements.md) §4
