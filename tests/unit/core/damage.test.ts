import { describe, expect, it } from 'vitest';
import { calcDamage } from '@/core/systems/damage';

describe('calcDamage', () => {
  it('倍率なしなら基礎攻撃力を返す', () => {
    expect(calcDamage({ baseAttack: 12, multipliers: [] })).toBe(12);
  });

  it('複数倍率の積を反映する', () => {
    expect(calcDamage({ baseAttack: 10, multipliers: [1.5, 2] })).toBe(30);
  });

  it('0倍率を含むと0になる', () => {
    expect(calcDamage({ baseAttack: 10, multipliers: [2, 0], additive: [] })).toBe(0);
  });

  it('整数化は四捨五入で処理する', () => {
    expect(calcDamage({ baseAttack: 5, multipliers: [1.1] })).toBe(6);
    expect(calcDamage({ baseAttack: 5, multipliers: [1.09] })).toBe(5);
  });
});
