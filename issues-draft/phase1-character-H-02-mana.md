# [Phase1][H-02] マナ管理 (時間回復・消費)

## 背景

マナは時間経過で回復し、スキル使用時に消費する ([`docs/game-design.md`](../docs/game-design.md) §3.1)。

## ゴール

- マナの自動回復と消費 API を提供する。
- 上限・下限が正しくクランプされる。

## 作業内容

1. `src/core/systems/mana.ts` を作成する。
   - `regenerateMana(state: WorldState, dt: number)`: `manaRegenPerSec * dt/1000` を加算、`maxMana` でクランプ
   - `consumeMana(character: CharacterState, amount: number): boolean`: 足りれば消費して true、足りなければ false
2. テスト:
   - 1秒経過で想定量のマナが回復する
   - 上限を超えない
   - 不足時は消費に失敗する

## 受け入れ条件

- [ ] テストが緑。
- [ ] World ループで毎 tick 自動回復する。

## スコープ外

- スキル発動側 (H-03)
- HP 自動回復 (本 Issue では実装しない、別 Issue or 同時実装でも可。スコープ簡略化のため別実装にしている)

## 依存

- H-01

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §3.1
