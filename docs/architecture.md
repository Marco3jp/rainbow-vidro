# アーキテクチャ

## 0. 設計原則

1. **決定論性ファースト**: ゲームロジックは外部入力 (時刻・乱数・ユーザー入力) を全て注入で受け取り、同一シード+同一入力で完全再現可能にする。
2. **レンダラ非依存のコア**: ゲームロジックは PixiJS に依存しない。Pixi (および将来のレンダラ候補) との結合点はアダプタ層に閉じる。
3. **テスタブル**: ロジック層は副作用を持たないか、副作用を依存注入で差し替えられる。
4. **コンポジション優先**: クラス継承を深くしない。エンティティはプロパティ + システム関数で振る舞いを表現する。
5. **シリアライズ可能な状態**: ゲーム全体状態 (`World`) は JSON シリアライズ可能。

### 0.1 レンダラ抽象の現実的な位置づけ

「Renderer インタフェースを設けたから、別のレンダラに差し替え可能」という理想形は **目指さない**。Pixi v8 の `DisplayObject` / `Container` / `Graphics` / `Filter` などの API を Render 層内ではそのまま使うし、将来別レンダラに移植するなら Render 層は実質的に書き直しになる。

それでも Renderer 抽象を置く狙いは、「丸ごと移植」よりはマシな状態を保つこと:

- **Core 層は完全に無傷**: ゲームロジックは Pixi を一切知らないので、レンダラ移行で被害を受けない。
- **責務の局所化**: 「`WorldState` を読んで描画オブジェクトに反映する」という意図が `src/render/` に集約される。移行時に「何をどう描けばよいか」を読み解くコストが小さい。
- **テスト容易性**: Render 層をモックに差し替えて、Application 層やループのテストが書ける。

逆にやらないこと:

- 描画プリミティブを抽象型 (`AbstractShape`, `AbstractFilter` 等) で隠蔽する設計はしない。Pixi 寄りに書いて構わない。
- Pixi 固有機能 (Filter, Mask, ParticleContainer 等) を「全レンダラ共通」に押し込めない。必要なら Render 層内で素直に Pixi の API を使う。

## 1. 全体構造

```
┌──────────────────────────────────────────────┐
│                 Entry (main.ts)                 │
└────────────┬─────────────────────────────────┘
             │
   ┌─────────┴──────────┐
   │ Application 層      │  Pixi の初期化・ループ駆動・UI接続
   └─────────┬──────────┘
             │
   ┌─────────┴──────────┐
   │ Render 層           │  Pixi 描画、World 状態 → 描画オブジェクトへの反映
   └─────────┬──────────┘
             │ (一方向参照)
   ┌─────────┴──────────┐
   │ Core 層 (ゲームロジック) │  決定論的シミュレーション。Pixi 非依存
   └─────────┬──────────┘
             │
   ┌─────────┴──────────┐
   │ Platform 層         │  RNG, Clock, Input, Storage, Logger 等の抽象 I/O
   └────────────────────┘
```

依存方向は上から下のみ。**Core から Render を import することは禁止**。

## 2. ディレクトリ構成 (予定)

```
src/
  app/                # アプリケーション層 (起動、シーン遷移、メインループ)
    main.ts
    GameApp.ts
  core/               # ゲームロジック (Pixi 非依存)
    world/
      World.ts        # ゲーム全体状態
      WorldState.ts   # シリアライズ可能な型定義
    entities/
      Ball.ts
      Bar.ts
      Block.ts
      Boss.ts
      Character.ts
    systems/
      collision.ts
      slingCharge.ts
      blockAdvance.ts
      damage.ts
      level.ts
      mana.ts
      skill.ts
    skills/           # スキル定義 (データ)
    rules/            # 勝敗判定など
    constants.ts
    types.ts
    index.ts
  render/             # 描画層 (PixiJS)
    PixiRenderer.ts
    drawables/
      BallView.ts
      BlockView.ts
      ...
    index.ts
  platform/           # I/O 抽象
    rng.ts            # SeededRng (Mulberry32 等)
    clock.ts          # Clock (固定 step / 実時刻)
    input.ts          # InputSource (実マウス / リプレイ / オートプレイ)
    storage.ts        # MatchHistoryStore 等
    logger.ts         # Logger / ErrorReporter
    index.ts
  replay/             # リプレイログ・保存・再生
  ui/                 # HTML/Canvas 上の UI コンポーネント (HUD, タイトル, 結果画面)
  autoplay/           # オートプレイの戦略実装
  index.html
tests/
  unit/
  integration/
  e2e/
public/
docs/
issues-draft/         # 着手時に削除する仮ディレクトリ
```

## 3. ループとタイムステップ

### 採用方針: Fixed Simulation + Variable Render (補間)

- シミュレーション tick: **固定 60Hz (約16.667ms)**
- 描画 tick: `requestAnimationFrame` (モニタHzに従う、120/144Hz など)
- 描画は前 tick と現 tick の状態を補間して滑らかに表示する

#### 擬似コード

```ts
let acc = 0;
const STEP = 1000 / 60;
let prevState: WorldSnapshot;
let currState: WorldSnapshot = world.snapshot();

function frame(nowMs: number) {
  const delta = nowMs - lastNowMs;
  acc += delta;
  while (acc >= STEP) {
    prevState = currState;
    world.tick(STEP, frameInputs.consume());
    currState = world.snapshot();
    acc -= STEP;
  }
  const alpha = acc / STEP;
  renderer.render(prevState, currState, alpha);
  requestAnimationFrame(frame);
}
```

#### 入力タイミング

入力イベントはフレーム単位で集約し、**シミュレーション tick の境界でのみ消費** する。これにより同じ入力ログ + 同じシードで完全再現が可能。

## 4. 状態管理

### `World`

ゲーム全体の状態を集約するクラス。

```ts
class World {
  readonly seed: number;
  readonly rng: SeededRng;
  readonly clock: SimClock;
  state: WorldState; // シリアライズ可能なプレーンオブジェクト
  tick(stepMs: number, inputs: ReadonlyArray<InputEvent>): void;
  snapshot(): WorldSnapshot; // structuredClone or 専用シリアライザ
}
```

- `WorldState` は **プレーンなオブジェクトの木**。クラスインスタンスを直接保持しない (シリアライズのため)。
- 振る舞い (`tick` 内で呼ばれるロジック) は **system 関数** に外出しする (`damageSystem(state, dt)` 等)。
- エンティティはプレーンなレコード (`Ball`, `Block`, `Bar` など) で、相互参照は ID で行う。

### 採用しない選択肢

- **Redux**: イミュータブル更新の負荷が高く、tick 内で大量の state 変更がある本作には不向き。
- **ECS フレームワーク (bitECS など)**: 学習コストと型表現の制約が現状の規模で見合わない。将来パフォーマンス課題が出たら検討。

## 5. ランダム性と時刻

- **RNG**: Mulberry32 を採用予定 (seed 32bit、十分高速)。`Math.random` は `src/core/` で禁止 (Lint で禁止できれば理想)。
- **時刻**: 実時刻に依存しない。`Clock` インタフェースを差し込み、シミュレーションは内部 tick カウントのみを参照。

## 6. 入力レイヤ

```ts
interface InputSource {
  poll(): InputEvent[]; // フレーム間に発生したイベントを返す
}
```

実装:

- `MouseInputSource` — DOM イベントから生成
- `ReplayInputSource` — リプレイログから再生
- `AutoplayInputSource` — オートプレイ戦略から生成

`InputEvent` は **シミュレーション座標系 + tick 番号** で正規化する。

## 7. 描画 (Render 層)

- PixiJS v8 を利用
- `WorldSnapshot` (前/現) を受け取り、Pixi の DisplayObject に反映する
- 描画オブジェクトは ID で `WorldState` のエンティティと対応付ける
- 1stバージョンは `PIXI.Graphics` ベースの軽量ベクター描画。テクスチャ化は後で検討

## 8. リプレイとログ

詳細は [`testing.md`](testing.md) も参照。

- リプレイは「シード + フレームごとの入力イベント列」で再現
- リプレイファイルフォーマット (案):
  ```json
  {
    "version": 1,
    "seed": 123456,
    "character": "char-A",
    "events": [{"tick": 0, "type": "mousemove", "x": 100, "y": 0}, ...]
  }
  ```
- 状態スナップショットは1stバージョンでは保留 (リプレイ再現性に問題があれば追加)

## 9. オートプレイ

- `AutoplayInputSource` がフレームごとに入力を生成する戦略パターン
- 戦略は最初は単純 (例: ボールを目で追ってバーを下に置く)
- ヘッドレス実行: Node.js で `core/` のみを動かして大量試行する Fuzz テストを将来作る (`tests/fuzz/`)

## 10. エラーモニタ

- ブラウザ実行時は `window.onerror` / `unhandledrejection` をフック
- ログは
  - コンソール出力
  - localStorage に蓄積 (上限あり、ローテート)
  - ダウンロードボタンで JSON エクスポート可能
- ヘッドレス実行時は標準エラー出力 + ファイル出力

## 11. パフォーマンス指針

- 1tick の処理を **< 4ms** に収める (60Hz 16.6ms のうち十分余裕を持たせる)
- 衝突判定は AABB / Circle-AABB を自前実装。空間分割は最初は不要 (ブロック数 < 数百)。必要なら uniform grid を後追加
- GC を抑えるためフレーム内で配列・オブジェクトを使い回す

## 12. 拡張性指針

- 将来 PixiJS から別レンダラに移したくなった場合に備え、`Renderer` インタフェースを `render/` 公開APIにする
- メインモード (Phase 4) の追加に備え、`Match` (1試合) と `Run` (フロア進行) を分離可能な構造を維持
