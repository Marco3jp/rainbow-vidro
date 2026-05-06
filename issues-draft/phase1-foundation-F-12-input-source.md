# [Phase1][F-12] 入力抽象 (InputSource, MouseInputSource)

## 背景

リプレイ・オートプレイ・実プレイで入力源を差し替えられるよう、`InputSource` インタフェース経由で入力を受け取る ([`docs/architecture.md`](../docs/architecture.md) §6)。

## ゴール

- `InputSource` インタフェースを定義する。
- DOM のマウスイベントから生成する `MouseInputSource` を実装する。
- フレーム単位で入力をキューイングし、シミュレーション tick 境界で消費される設計にする。

## 作業内容

1. `src/platform/input.ts` を作成する。
   ```ts
   export type InputEvent =
     | { type: 'mousemove'; x: number; y: number }
     | { type: 'mousedown'; x: number; y: number }
     | { type: 'mouseup'; x: number; y: number };
   export interface InputSource {
     poll(): InputEvent[];
     dispose(): void;
   }
   ```
2. `MouseInputSource` を実装する。
   - 引数: 対象 DOM 要素 (Pixi のキャンバス想定)、座標変換関数 (DOM 座標 → ゲーム座標)
   - `mousemove` / `mousedown` / `mouseup` を listen
   - 内部キューに append
   - `poll()` でキューを空にして返す
3. `ReplayInputSource` (F-13 と整合) のスタブを作っておく (本 Issue では実装はスケルトンで OK、本実装は F-13)。
4. テスト (jsdom):
   - DOM 要素にイベントを発火させ、`poll()` で正しく取得できる
   - 座標変換が機能する

## 受け入れ条件

- [ ] テストが緑。
- [ ] `InputSource` が `GameLoop` (F-08) から利用される (型整合)。
- [ ] `MouseInputSource` がブラウザで動作する (実機確認可)。

## スコープ外

- リプレイ入力 (F-13)
- オートプレイ入力 (Q-01)
- バーやスリングの操作実装 (C-03, C-09 等)

## 依存

- F-08

## 参照

- [`docs/architecture.md`](../docs/architecture.md) §6
