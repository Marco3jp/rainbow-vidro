import type { CharacterState } from '@/core/entities';
import type { WorldConfig } from '@/core/world';

function clamp01(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

export function calcChargeFactor(
  releaseDepth: number,
  config: { chargeFactorMin: number; chargeFactorMax: number },
): number {
  const t = clamp01(releaseDepth);
  return config.chargeFactorMin + (config.chargeFactorMax - config.chargeFactorMin) * t;
}

export function calcHitFactor(
  hitProgress: number,
  config: { hitFactorMin: number; hitFactorMax: number },
): number {
  const t = clamp01(hitProgress);
  return config.hitFactorMin + (config.hitFactorMax - config.hitFactorMin) * t;
}

export function calcChargeShotMultiplier(
  releaseDepth: number,
  hitProgress: number,
  character: CharacterState,
  config: WorldConfig,
): number {
  const chargeFactor = calcChargeFactor(releaseDepth, config);
  const hitFactor = calcHitFactor(hitProgress, config);
  return chargeFactor * hitFactor * character.stats.chargeShotMultiplier;
}

/**
 * ボールが「次の反射に持ち越せるダメージ倍率」の上限 (キャラの `maxRetainedDamageMultiplier`) で
 * 値を丸める純粋関数。チャージショット計算の入力 (= 持ち越し倍率) に対して用いる。
 *
 * - 計算式: `(持ち越し倍率) × (chargeFactor) × (hitFactor) × (キャラ chargeShotMultiplier)`
 * - 持ち越し倍率はこのキャップで丸めるが、**ショット計算結果はキャップを超えうる**
 * - 計算結果は壁反射などで減衰し、次のショット時に再びこのキャップで丸められる
 */
export function clampDamageMultiplier(value: number, character: CharacterState): number {
  const cap = character.stats.maxRetainedDamageMultiplier;
  return value < cap ? value : cap;
}
