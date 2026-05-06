import { describe, expect, it } from 'vitest';
import { charA, createCharacter, World } from '@/core';

describe('キャラクター基礎ステータス', () => {
  it('キャラクター生成で初期値が正しく入る', () => {
    const character = createCharacter(charA);
    expect(character.id).toBe('char-a');
    expect(character.level).toBe(1);
    expect(character.exp).toBe(0);
    expect(character.skillLevels).toEqual({});
    expect(character.stats).toEqual(charA.baseStats);
    expect(character.baseStats).toEqual(charA.baseStats);
    expect(character.stats).not.toBe(character.baseStats);
  });

  it('World にキャラステータスが組み込まれている', () => {
    const world = new World({ seed: 11 });
    expect(world.state.entities.character.stats.attack).toBe(charA.baseStats.attack);
    expect(world.state.entities.character.baseStats.maxHp).toBe(charA.baseStats.maxHp);
  });

  it('キャラクター状態はシリアライズ可能', () => {
    const character = createCharacter(charA);
    expect(() => JSON.stringify(character)).not.toThrow();
  });
});
