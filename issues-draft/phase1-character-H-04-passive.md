# [Phase1][H-04] パッシブ (スキル命中バフ)

## 背景

1stバージョンのキャラクターはパッシブとして「スキルショットが命中するとステータスアップバフを得る」を持つ ([`docs/game-design.md`](../docs/game-design.md) §3.2)。

## ゴール

- パッシブ `SkillDef` を実装する。
- スキルショット (H-05) が命中したらバフが付与され、一定時間で消失する。
- バフは攻撃力や速度などのステータスに乗算で反映される。

## 作業内容

1. `src/core/skills/passiveOnHit.ts` に `SkillDef` を定義する。
2. バフ機構:
   - `CharacterState` に `buffs: BuffState[]` を追加
   - `BuffState`: `id`, `expiresAtTick`, `multipliers: Partial<Record<keyof CharacterStats, number>>`
   - `tickSkills` でバフの期限切れを除去
   - `getEffectiveStats(character: CharacterState): CharacterStats` を提供し、ベース + バフを合成
3. `onSkillShotHit` ハンドラでバフ追加。
4. テスト:
   - 命中でバフが付与される
   - 期限が来るとバフが消える
   - 重複時の挙動 (リフレッシュ vs スタック) を仕様化 (初期はリフレッシュ推奨) [要調整]

## 受け入れ条件

- [ ] テストが緑。
- [ ] スキルショット命中時に攻撃力等が一時的に上がる。

## スコープ外

- スキルショット本体 (H-05)
- 他のパッシブ種類 (将来)

## 依存

- H-03, H-05 (相互依存。同 PR or 後続マージで吸収可)

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §3.2
