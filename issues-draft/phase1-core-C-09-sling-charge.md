# [Phase1][C-09] スリングのチャージ操作 (バー湾曲・吸い込み状態)

## 背景

スリングのコアメカニクスである「バーの湾曲 → ボール捕捉 → 解放」を実装する ([`docs/game-design.md`](../docs/game-design.md) §2.2)。

## 仕様の要点

- バーは通常時は **直線 (= 元の弧 `baseArc`)**。
- マウス押下で「引っ張りモード」に入り、バーがカーソル方向に **弓のように湾曲** (`pulledArc`) する。引っ張り深さと方向はカーソル位置で決まる。
- マウスを離すと `pulledArc` は短時間 (戻り時間、基準 100ms 程度 [要調整]) かけて `baseArc` に戻る。
- ボールの挙動:
  - `pulledArc` (湾曲したバー本体) に接触したらその場で停止する
  - `baseArc` と `pulledArc` の間 (湾の内側) は通常進行
- 「吸い込み状態」のボール:
  - (a) 湾の内側にいる、または (b) `pulledArc` に接触して停止している
- マウスを離した瞬間、吸い込み状態のボールは **チャージショット** として射出される。射出方向は `pulledArc` の中央からカーソル方向の反対側 (= 引っ張った方向に飛んでいく直感的なベクトル) [要確認・実装で詰める]。
- 吸い込み状態でないボールは通常進行を続け、チャージショット対象にならない。
- 戻り中 (`pulledArc → baseArc` への補間中) のバーがボールに当たったときの挙動は `pulledArc` と同じ (= 接触で停止) [要調整]。

## ゴール

- バーが押下〜解放まで湾曲・復帰する。
- ボールが湾曲バーに接触すると停止する。
- マウスを離した瞬間に吸い込み状態のボールが射出される (倍率は C-10 で実装、本 Issue では一律 1.0 で OK)。

## 作業内容

1. `BarState` を以下の構造に拡張する。
   ```ts
   interface BarState {
     /** 元の弧 (通常時の直線バー) */
     baseArc: { x: number; y: number; width: number; height: number };
     /** 引っ張られた弧 (チャージ中およびリターン中に使用される実体) */
     pulledArc: {
       /** 湾曲の中心 X (カーソル方向の引っ張りオフセット) */
       offsetX: number;
       /** 湾曲の中心 Y (カーソル方向の引っ張りオフセット、深さ) */
       offsetY: number;
       /** 湾曲の強さ (0 = 直線、最大 = カーソル位置で決まる) */
       depth: number;
     };
     mode: 'normal' | 'charging' | 'releasing';
     chargeStartTick?: number;
     /** リリース開始 tick (mode === 'releasing' のとき) */
     releaseStartTick?: number;
     /** 吸い込み中のボール ID リスト */
     attachedBallIds: string[];
   }
   ```
2. `src/core/systems/slingControl.ts` を作成する。
   - `mousedown`:
     - `mode = 'charging'`
     - `chargeStartTick = state.tickCount`
     - `attachedBallIds = []`
   - 引っ張り中 (`mode === 'charging'`):
     - `mousemove` 入力で `pulledArc.offsetX/Y/depth` を更新 (カーソル位置からの計算)
     - 押下時間が `slingChargeMaxMs` (基準 200ms [要調整]) に達したら `pulledArc` のパラメータをクランプ (= これ以上引けない)
   - `mouseup`:
     - `mode = 'releasing'`
     - `releaseStartTick = state.tickCount`
     - 現在 `attachedBallIds` に含まれるボールを射出する (射出方向は `pulledArc` の引っ張り方向の逆ベクトル、速度は基礎速度 × 倍率 [C-10 で算出、本 Issue では 1.0])
     - 射出されたボールは `attachedBallIds` から外す
   - リリース中 (`mode === 'releasing'`):
     - 現在 tick - `releaseStartTick` から補間で `pulledArc` のパラメータを `baseArc` に近づける
     - 戻り時間 `slingReleaseMs` (基準 100ms [要調整]) を経過したら `mode = 'normal'`、`pulledArc` をリセット
3. ボールと湾曲バーの相互作用 (`src/core/systems/slingPickup.ts`):
   - 各 tick の終わりに、すべてのボールについて以下を判定:
     - `pulledArc` (湾曲バー本体) に接触しているか → 接触していれば停止 (`vx=0, vy=0`) し `attachedBallIds` に追加
     - `baseArc` と `pulledArc` の間 (湾の内側) にいるか → 吸い込み状態として `attachedBallIds` に追加 (速度はそのまま)
     - 上記いずれでもなくなったら `attachedBallIds` から外す
   - `mode === 'normal'` のときは何もしない
4. システム呼び出し順 (`World.tick()`):
   - movement → wallReflection → slingControl (mode 更新) → blockCollision → barReflection (normal時のみ) → slingPickup (吸い込み判定) → 他
5. テスト:
   - mousedown で `mode === 'charging'`
   - 押下時間で `pulledArc.depth` が増える
   - 最大時間でクランプされる
   - `pulledArc` にボールが接触すると停止して `attachedBallIds` に入る
   - 湾の内側のボールは速度を維持して `attachedBallIds` に入る
   - mouseup で `mode === 'releasing'` に変わり、attached ボールが射出され、`attachedBallIds` がクリアされる
   - リリース時間経過で `mode === 'normal'` に戻る

## 受け入れ条件

- [ ] テストが緑。
- [ ] 実機でクリック → バーが湾曲する → ボールが捕まる → 離すと飛んでいく の動線が体感できる。
- [ ] バーが直線状態に戻る挙動が見える。

## スコープ外

- ジャストタイミングと倍率計算 (C-10)
- スリング強化スキル (H-06)
- 湾曲バーの描画ディテール (Render 層は本 Issue 内で最低限の表現で OK、後続 Issue で改善可)

## 依存

- C-02, C-03, C-05, F-12

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §2.2 「引っ張り (チャージ) 状態」
