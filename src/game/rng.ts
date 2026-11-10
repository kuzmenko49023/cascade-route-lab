/**
 * Deterministic local RNG. The global Math.random is never used for run
 * content, so any rig can be rebuilt from its seed alone.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One seed per attempt, reproducible from the level index. */
export function seedFor(levelIndex: number, attempt: number): number {
  return ((levelIndex * 7919) ^ (attempt * 104729)) >>> 0;
}

export function randInt(rand: () => number, minInclusive: number, maxInclusive: number): number {
  if (maxInclusive <= minInclusive) {
    return minInclusive;
  }
  return minInclusive + Math.floor(rand() * (maxInclusive - minInclusive + 1));
}

export function pick<T>(rand: () => number, list: readonly T[]): T {
  return list[Math.floor(rand() * list.length) % list.length];
}

export function shuffle<T>(rand: () => number, list: T[]): T[] {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
