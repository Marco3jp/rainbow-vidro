import type { CharacterDefinition } from '@/core/entities';

export const charA: CharacterDefinition = {
  id: 'char-a',
  baseStats: {
    hp: 100,
    maxHp: 100,
    mana: 50,
    maxMana: 50,
    attack: 10,
    ballSpeed: 1,
    barReflectMultiplier: 1,
    chargeShotMultiplier: 1,
    maxRetainedDamageMultiplier: 1.5,
    hpRegenPerSec: 0,
    manaRegenPerSec: 2,
    cdr: 0,
  },
};
