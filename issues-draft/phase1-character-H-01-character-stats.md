# [Phase1][H-01] キャラクター基礎ステータス管理

## 背景

キャラクターは HP / マナ / 攻撃力 / ボール速度 / スリングパワー / HP・マナ自動回復 / クールダウン減少 (CDR) を持つ ([`docs/game-design.md`](../docs/game-design.md) §3.1)。

## ゴール

- `CharacterState` 型と基礎ステータスを定義する。
- 1stバージョン用キャラクター1体のステータスデータを用意する。

## 作業内容

1. `src/core/entities/Character.ts` を作成する。
   ```ts
   export interface CharacterStats {
     hp: number;
     maxHp: number;
     mana: number;
     maxMana: number;
     attack: number;
     ballSpeed: number;
     barReflectMultiplier: number;
     chargeShotMultiplier: number;
     hpRegenPerSec: number;
     manaRegenPerSec: number;
     cdr: number;
   }
   export interface CharacterState {
     id: string;
     stats: CharacterStats;
     baseStats: CharacterStats; // 成長計算で使う初期値
     level: number;
     exp: number;
     skillPoints: number;
     skillLevels: Record<string, number>;
   }
   ```
2. `src/core/data/characters/charA.ts` を作成し、1stバージョン用のキャラクター定義 (基礎値 [要調整]) を置く。
3. World 初期化時に Character を構築する関数を提供。
4. テスト:
   - キャラクター生成で初期値が正しく入る
   - シリアライズ可能

## 受け入れ条件

- [ ] テストが緑。
- [ ] World に組み込んだ際にキャラステータスが参照できる。

## スコープ外

- スキル定義 (H-03 以降)
- 経験値・レベル (H-08)

## 依存

- C-01

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §3.1
