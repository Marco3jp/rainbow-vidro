# [Phase1][C-03] バーの移動 (マウス追従)

## 背景

スリングの基礎となるバーを実装する。本 Issue では「マウス追従で位置が変わる」までを対象とし、引っ張り操作 (C-09) と反射 (C-05) は別 Issue で扱う。

## ゴール

- バーエンティティを `WorldState` に登録できる。
- `mousemove` 入力に応じてフィールド内でバーの位置が更新される。
- フィールド外にバーが出ない (端でクランプ)。

## 作業内容

1. `src/core/entities/Bar.ts` を作成する。
   ```ts
   export interface BarState {
     x: number;
     y: number;
     width: number;
     height: number;
     mode: 'normal' | 'charging';
   }
   export function createBar(opts: {...}): BarState;
   ```
2. `src/core/systems/barControl.ts` を作成する。
   - `updateBar(state: WorldState, inputs: ReadonlyArray<InputEvent>): void`
   - `mousemove` イベントの x,y を読み取り `BarState.x` (将来的に y も) を更新
   - フィールド境界でクランプ
3. `World.tick()` から `updateBar` を呼ぶ。
4. テスト:
   - `mousemove` 入力でバー位置が更新される
   - 端を超える入力でクランプされる
   - 入力がないと位置が変わらない

## 受け入れ条件

- [ ] テストが緑。
- [ ] ブラウザで動かしたときにバーがマウスに追従する (実機確認)。

## スコープ外

- 引っ張り (チャージ) 操作 (C-09)
- 反射 (C-05)
- 描画スタイル

## 依存

- C-01, F-12

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §2.2
