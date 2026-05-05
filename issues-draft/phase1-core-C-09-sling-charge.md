# [Phase1][C-09] スリングのチャージ操作 (引っ張りモード・タイミング・方向)

## 背景

スリングのコアメカニクスである「引っ張り → 方向決定 → 解放」の入力処理を実装する ([`docs/game-design.md`](../docs/game-design.md) §2.2)。

## ゴール

- マウス押下で `BarState.mode` が `'charging'` になる。
- 引っ張り中、`BarState` に「射出方向」「チャージ進行度」が保持される。
- 引っ張り中、ボールがスリングの弧の中にある場合、ボールが「吸い込み」状態になる (= バーに沿って移動 / 速度0 / 弧上に固定など、選択肢のうち実装簡単なものを採用)。
- マウスを離すと `'normal'` に戻り、吸い込まれていたボールがチャージ方向に射出される。

## 作業内容

1. `BarState` を拡張する。
   ```ts
   interface BarState {
     // ... existing
     mode: 'normal' | 'charging';
     chargeStartTick?: number;
     chargeAimX?: number;
     chargeAimY?: number;
     /** 吸い込み中のボール ID リスト */
     attachedBallIds: string[];
   }
   ```
2. `src/core/systems/slingControl.ts` を作成する。
   - `mousedown` で `mode = 'charging'`、`chargeStartTick = state.tickCount`、attachedBallIds をリセット
   - 引っ張り中:
     - `mousemove` 入力で `chargeAimX/Y` を更新
     - 弧の半径 (定数 [要調整]) 内のボールを attachedBallIds に追加し、当該ボールの速度を 0 化 + 位置を弧上に補正 (シンプルにバー上中央でも良い)
   - `mouseup` で:
     - 解放タイミング (現在 tick - chargeStartTick) と弦中央 (= 想定ジャストタイミング) との差分から「ジャスト度」を算出 (C-10 で詳細)
     - attached ボールに射出ベクトル (アイム方向 × 基礎速度 × チャージ倍率) を付与
     - `mode = 'normal'`、attachedBallIds をクリア
   - チャージ最大時間 (例: `WorldState.config.slingChargeMaxMs`) を超えたら自動解放
3. ジャスト判定および倍率計算は C-10 で実装。本 Issue では倍率は固定 1.0 で OK (C-10 と密結合する場合は同 PR でも可)。
4. テスト:
   - mousedown で mode 切替
   - 引っ張り中にボールが吸い込まれる
   - mouseup で射出される
   - チャージ最大時間で自動解放される

## 受け入れ条件

- [ ] テストが緑。
- [ ] 実機で「クリック → 方向を決める → 離す」操作で射出感が出る。

## スコープ外

- ジャスト判定および倍率計算 (C-10)
- スリング強化スキル (H-06)

## 依存

- C-02, C-03, F-12

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §2.2 「引っ張り (チャージ) 状態」
