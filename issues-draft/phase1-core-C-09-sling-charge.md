# [Phase1][C-09] スリングのチャージ操作 (バー湾曲・リリーススイープ)

## 背景

スリングのコアメカニクス「チャージ → リリース → 戻り過程の弧がボールに当たって射出」を実装する ([`docs/game-design.md`](../docs/game-design.md) §2.2)。

## 用語

[`docs/game-design.md`](../docs/game-design.md) §2.2 の「用語定義」を参照。本Issueでは特に以下を扱う:

- **ゼロ位置**: 標準位置 (まっすぐなバー)
- **チャージ中位置**: 押下中の現在位置
- **最大チャージ位置**: チャージ最大時の位置
- **リリース位置**: リリースした瞬間の弧位置
- **ヒット位置**: 戻り途中で弧がボールに当たった瞬間の弧位置

## 仕様の要点

- マウス押下で「チャージモード」(`mode === 'charging'`) に入り、バーが弓のように湾曲する。深さは押下時間に比例 (基準: 0 → 最大まで 200ms **[要調整]**)
- リリース (マウスを離す) で「リリースモード」(`mode === 'releasing'`) に入り、弧は **リリース位置 → ゼロ位置** にかけて時間をかけて戻る (基準: 50〜100ms **[要調整]**)
- リリース戻り中、弧の位置は時間に対して補間される
- **ボールと弧の相互作用**:
  - **`mode === 'charging'` (最大チャージで保持中も含む)**: ボールが弧に接触すると **その場で停止し、リリース待ち** になる。`attachedBallIds` に追加
  - **`mode === 'releasing'`**: ボールが戻り途中の弧に接触したら **停止しない**。その時点で **チャージショットとしてカーソル方向の逆ベクトル (= 引っ張り方向の反対側) に即射出される**
- リリース時点で `attachedBallIds` に入っていたボールは、リリース直後に「リリース位置でヒット」扱いで即射出される (ヒット倍率最低、ただしチャージ倍率は `releaseDepth` に応じて変化)
- 倍率計算は C-10 で実装 (本 Issue では暫定 1.0 で OK)

## ゴール

- バーが押下〜リリース〜戻りの全フェーズを正しく管理する。
- ボールが弧に接触すると停止する。
- リリース戻り中に弧がボールに到達したらチャージショット射出が起こる。
- 各ボールについて、ヒット位置 (戻りフェーズの正規化進捗 0..1) を `BallState` に記録できる (C-10 で参照する)。

## 作業内容

1. `BarState` を以下の構造に拡張する。
   ```ts
   interface BarState {
     /** ゼロ位置 (標準状態の直線バー) */
     zeroPosition: { x: number; y: number; width: number; height: number };
     /** 現在の弧形状。チャージ中/戻り中はゼロ位置から湾曲した状態で表現される */
     arc: {
       /** 湾曲方向 (cursor からの正規化ベクトル) */
       dirX: number;
       dirY: number;
       /** 湾曲の深さ (0 = ゼロ位置, 1 = 最大チャージ位置) */
       depth: number;
     };
     mode: 'normal' | 'charging' | 'releasing';
     /** チャージ開始 tick (mode === 'charging') */
     chargeStartTick?: number;
     /** リリース開始 tick (mode === 'releasing') */
     releaseStartTick?: number;
     /** リリース時の弧深さ (チャージ倍率算出に使う) */
     releaseDepth?: number;
     /** リリース時の弧方向 */
     releaseDirX?: number;
     releaseDirY?: number;
     /** 弧に接触して停止しているボール ID リスト */
     attachedBallIds: string[];
   }
   ```
2. `BallState` を拡張する (リリース中のヒット情報を記録)。
   ```ts
   interface BallState {
     // ... existing fields
     /** 直前のチャージショットヒット時の正規化進捗 (0=リリース位置, 1=ゼロ位置)。射出後リセット */
     lastChargeHitProgress?: number;
   }
   ```
3. `src/core/systems/slingControl.ts` を作成する。
   - **mousedown** (`mode === 'normal'`):
     - `mode = 'charging'`
     - `chargeStartTick = state.tickCount`
     - `attachedBallIds = []`
   - **チャージ中** (`mode === 'charging'`):
     - `mousemove` で `arc.dirX/dirY` を更新 (カーソル位置から算出)
     - 経過時間に応じて `arc.depth` を `[0, 1]` で増加 (最大時間 `slingChargeMaxMs` で 1 にクランプ)
   - **mouseup** (`mode === 'charging'`):
     - `mode = 'releasing'`
     - `releaseStartTick = state.tickCount`
     - `releaseDepth = arc.depth`、`releaseDirX/Y = arc.dirX/Y`
     - **attached ボールは「リリース位置で即ヒット」として射出キューに追加する**。`lastChargeHitProgress = 0` を設定 (= リリース位置)。射出ベクトルは `(-releaseDirX, -releaseDirY) * shotSpeed`。`attachedBallIds` をクリア
   - **リリース戻り中** (`mode === 'releasing'`):
     - 経過時間 `t` を `slingReleaseMs` で正規化した進捗 `progress = t / slingReleaseMs` (0..1)
     - 弧の現在深さ: `arc.depth = releaseDepth * (1 - progress)` (リリース位置 → ゼロ位置 に線形補間 [要調整: イージング検討])
     - `progress >= 1.0` で `mode = 'normal'`、`arc.depth = 0`、`releaseStartTick/releaseDepth/releaseDir*` をクリア
4. ボールと弧の接触判定 `src/core/systems/slingPickup.ts`:
   - 各 tick の終わり、`mode === 'charging' || 'releasing'` のとき、すべてのボールについて以下を判定:
     - 現在の弧 (`arc`) とボールの距離を計算
     - **mode === 'charging'**:
       - 弧に接触している → ボールを停止 (`vx=0, vy=0`) し、`attachedBallIds` に追加
       - 弧から離れたら `attachedBallIds` から外し、停止解除 (元の速度に戻すか別途仕様化、初期は停止解除のみで速度を 0 のままにし、外側から触れ直すことも可能とする [要調整])
     - **mode === 'releasing'**:
       - 弧に接触している → **ボールは停止させない**。射出ベクトルを `(-releaseDirX, -releaseDirY) * shotSpeed` に設定し (キャラの `ballSpeed` 等で更に乗算)、`lastChargeHitProgress = progress` を記録
       - `releasing` 中は `attachedBallIds` を新たに増やさない (チャージ中の遺産のみ存在しうる)
5. システム呼び出し順 (`World.tick()`):
   - movement → wallReflection → slingControl (mode/arc 更新) → slingPickup (接触・ヒット判定) → blockCollision → barReflection (normal時のみ) → 他
6. 設定値 (`WorldState.config`):
   - `slingChargeMaxMs`: 200 (基準) **[要調整]**
   - `slingReleaseMs`: 80 (基準、50〜100の真ん中) **[要調整]**
   - `slingArcMaxDepthPx`: 弧の物理的な引き深さ最大値 (フィールド単位、初期値は実装で決定) **[要調整]**
   - `slingShotBaseSpeed`: チャージショット射出の基礎速度 **[要調整]**
7. テスト:
   - mousedown で `mode === 'charging'`、`arc.depth` が時間で増える、最大でクランプされる
   - mouseup で `mode === 'releasing'` に変わる
   - **チャージ中の弧に接触したボールは停止し `attachedBallIds` に入る**
   - リリース時に `attachedBallIds` のボールは即時射出される (`lastChargeHitProgress === 0`、速度がカーソル方向の逆ベクトル)
   - リリース戻り中、弧の `depth` が線形に減る
   - **リリース戻り中の弧に接触したボールは停止せず、即時射出される** (`lastChargeHitProgress` が `(0, 1]` の範囲で記録される)
   - リリース戻り中の射出方向はカーソル方向 (引っ張り方向の反対) で、`releaseDirX/Y` の符号反転と一致する
   - 戻り完了で `mode === 'normal'` に戻り `arc.depth === 0`
   - 湾の内側 (= 弧と接触していない) のボールは通常進行を続ける (チャージ中・戻り中問わず)

## 受け入れ条件

- [ ] テストが緑。
- [ ] 実機で「クリック → バーが湾曲 → 離す → バーが戻る → 戻り中にボールに当たって飛んでいく」が体感できる。
- [ ] `lastChargeHitProgress` の値が C-10 で利用可能な形で記録される。

## スコープ外

- ヒット倍率・チャージ倍率の計算 (C-10)
- スリング強化スキル (H-06)
- 湾曲バーの描画ディテール (Render 層は本 Issue 内では最低限の表現で OK、後続 Issue で改善可)

## 依存

- C-02, C-03, C-05, F-12

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §2.2 「引っ張り (チャージ) 状態」
