# [Phase1][F-13] リプレイ基盤 (記録・保存・再生)

## 背景

シード + 入力イベント列で完全再現可能な設計とする ([`docs/architecture.md`](../docs/architecture.md) §8)。バグ報告再現と Fuzz テストの土台になる。

## ゴール

- 入力イベントを tick 番号付きで記録する `ReplayRecorder` を提供する。
- 記録した内容を JSON シリアライズ・デシリアライズできる。
- `ReplayInputSource` で記録を再生できる。

## 作業内容

1. `src/replay/types.ts` を作成する。
   ```ts
   export interface RecordedInputEvent {
     tick: number;
     event: InputEvent;
   }
   export interface ReplayFile {
     version: 1;
     seed: number;
     character: string;
     events: RecordedInputEvent[];
     metadata?: { recordedAt: string; appVersion: string; };
   }
   ```
2. `src/replay/Recorder.ts` を作成する。
   - 引数: `InputSource` (ラップする入力源)
   - tick 番号と入力イベントを記録するアダプタとして動作
   - `getReplay(): ReplayFile` でシリアライズ可能なオブジェクトを返す
3. `src/replay/ReplayInputSource.ts` を作成する。
   - 引数: `ReplayFile`
   - `poll()` で現在の tick に対応するイベントを返す
4. JSON シリアライズ/デシリアライズ用ユーティリティ (`saveReplay`, `loadReplay`) を提供する。localStorage 保存と JSON ファイルダウンロードを両方サポートする。
5. テスト:
   - 記録と再生の往復で同じ World 状態に至る (固定シード + 固定入力 + N tick で `World.snapshot()` が一致)
   - JSON シリアライズで情報が失われない

## 受け入れ条件

- [ ] テストが緑。
- [ ] 記録 → 保存 → 読み込み → 再生の動線が機能する。
- [ ] World と組み合わせた決定論性のテストがある (C-01 完了後でないと最終確認は難しいため、F-13 完了時点ではモック World で OK。C-01 完了後の補強 Issue は別途立てる)。

## スコープ外

- リプレイ再生UI (U-05)
- 状態スナップショット機能 (1stバージョンでは保留)

## 依存

- F-09, F-12

## 参照

- [`docs/architecture.md`](../docs/architecture.md) §8
