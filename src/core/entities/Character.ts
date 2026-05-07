export interface CharacterStats {
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  attack: number;
  ballSpeed: number;
  barReflectMultiplier: number;
  chargeShotMultiplier: number;
  /**
   * 1ボールが保持できるダメージ倍率の上限。
   * チャージショット等で倍率を乗算した結果がこの値を超える場合は、ここで丸める。
   */
  maxRetainedDamageMultiplier: number;
  hpRegenPerSec: number;
  manaRegenPerSec: number;
  cdr: number;
}

export interface CharacterState {
  id: string;
  stats: CharacterStats;
  baseStats: CharacterStats;
  level: number;
  exp: number;
  skillPoints: number;
  skillLevels: Record<string, number>;
}

export interface CharacterDefinition {
  id: string;
  baseStats: CharacterStats;
}

export function createCharacter(definition: CharacterDefinition): CharacterState {
  return {
    id: definition.id,
    stats: { ...definition.baseStats },
    baseStats: { ...definition.baseStats },
    level: 1,
    exp: 0,
    skillPoints: 0,
    skillLevels: {},
  };
}
