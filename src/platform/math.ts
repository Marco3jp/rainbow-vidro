export const PI = Math.PI;

export function abs(value: number): number {
  return Math.abs(value);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function cos(value: number): number {
  return Math.cos(value);
}

export function hypot(x: number, y: number): number {
  return Math.hypot(x, y);
}

export function max(a: number, b: number): number {
  return Math.max(a, b);
}

export function sin(value: number): number {
  return Math.sin(value);
}
