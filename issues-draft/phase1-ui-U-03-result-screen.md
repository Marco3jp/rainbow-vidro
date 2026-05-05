# [Phase1][U-03] 結果画面 (勝敗・統計・リプレイ保存)

## 背景

試合終了時 (`phase === 'won' | 'lost'`) に結果画面を表示する。マッチヒストリー (G で要件として確定) に保存する項目を集約する ([`docs/requirements.md`](../docs/requirements.md) §4 / [`docs/game-design.md`](../docs/game-design.md) §5)。

## ゴール

- 勝敗結果と統計 (与ダメージ、被ダメージ、破壊ブロック数、最終レベル、スキルレベル、シード) を表示する。
- 「リプレイを保存」ボタンでリプレイ JSON をダウンロードできる。
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
4. リプレイ保存ボタンで F-13 のリプレイファイルを JSON ダウンロード。
5. テスト:
   - 統計が正しく集計される
   - 結果画面に必要項目が表示される
   - リプレイ保存が機能する

## 受け入れ条件

- [ ] 実機で勝利/敗北どちらでも結果画面が表示される。
- [ ] テストが緑。

## スコープ外

- マッチヒストリー一覧 (U-04)
- リプレイ再生 UI (U-05)

## 依存

- C-08, C-13, F-13

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §5
- [`docs/requirements.md`](../docs/requirements.md) §4
