export interface DamageInput {
  baseAttack: number;
  multipliers: ReadonlyArray<number>;
  additive?: ReadonlyArray<number>;
  critical?: boolean;
}

function sum(values: ReadonlyArray<number>): number {
  let total = 0;
  for (const value of values) {
    total += value;
  }
  return total;
}

function product(values: ReadonlyArray<number>): number {
  let total = 1;
  for (const value of values) {
    total *= value;
  }
  return total;
}

export function calcDamage(input: DamageInput): number {
  const damage = input.baseAttack * product(input.multipliers) + sum(input.additive ?? []);
  return Math.max(0, Math.round(damage));
}
