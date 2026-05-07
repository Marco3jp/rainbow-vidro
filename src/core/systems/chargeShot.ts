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
