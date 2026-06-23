export type RunSeed = string & { readonly __runSeed: unique symbol };

const seedPrefix = "DAVID";
const seedPartLength = 4;
const fallbackSeed = "DAVID-0000-0000" as RunSeed;
const seedAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export interface DeterministicRng {
  readonly seed: string;
  randomFloat: () => number;
  randomInt: (minInclusive: number, maxExclusive: number) => number;
  randomChoice: <T>(items: readonly T[]) => T | undefined;
  weightedChoice: <T>(
    items: readonly T[],
    getWeight: (item: T) => number,
  ) => T | undefined;
  shuffle: <T>(items: readonly T[]) => T[];
}

export function createRunSeed(sourceRandom: () => number = Math.random): RunSeed {
  const part = () =>
    Array.from({ length: seedPartLength }, () =>
      seedAlphabet[Math.floor(sourceRandom() * seedAlphabet.length)] ?? "0",
    ).join("");

  return normalizeSeed(`${seedPrefix}-${part()}-${part()}`);
}

export function normalizeSeed(value: unknown): RunSeed {
  if (typeof value !== "string") {
    return fallbackSeed;
  }

  const cleaned = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const withoutPrefix = cleaned.startsWith(seedPrefix)
    ? cleaned.slice(seedPrefix.length)
    : cleaned;
  const normalizedBody = withoutPrefix
    .replace(/[O]/g, "0")
    .replace(/[I]/g, "1")
    .slice(0, seedPartLength * 2)
    .padEnd(seedPartLength * 2, "0");

  return `${seedPrefix}-${normalizedBody.slice(0, seedPartLength)}-${normalizedBody.slice(
    seedPartLength,
    seedPartLength * 2,
  )}` as RunSeed;
}

export function deriveSeed(parentSeed: string, stableKey: string): RunSeed {
  const hash = hashSeedToNumber(`${normalizeSeed(parentSeed)}:${stableKey}`);
  let value = hash;
  let body = "";

  for (let index = 0; index < seedPartLength * 2; index += 1) {
    value = (value * 1664525 + 1013904223) >>> 0;
    body += seedAlphabet[value % seedAlphabet.length] ?? "0";
  }

  return normalizeSeed(`${seedPrefix}-${body}`);
}

export function hashSeedToNumber(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createRng(seed: string): DeterministicRng {
  let state = hashSeedToNumber(normalizeSeed(seed));

  const randomFloat = () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  const randomInt = (minInclusive: number, maxExclusive: number) => {
    const min = Math.ceil(minInclusive);
    const max = Math.floor(maxExclusive);

    if (max <= min) {
      return min;
    }

    return Math.floor(randomFloat() * (max - min)) + min;
  };

  const randomChoice = <T>(items: readonly T[]) => {
    if (items.length === 0) {
      return undefined;
    }

    return items[randomInt(0, items.length)];
  };

  const weightedChoice = <T>(
    items: readonly T[],
    getWeight: (item: T) => number,
  ) => {
    const weightedItems = items
      .map((item) => ({ item, weight: Math.max(0, getWeight(item)) }))
      .filter((entry) => entry.weight > 0);
    const totalWeight = weightedItems.reduce(
      (total, entry) => total + entry.weight,
      0,
    );

    if (totalWeight <= 0) {
      return undefined;
    }

    let roll = randomFloat() * totalWeight;

    for (const entry of weightedItems) {
      roll -= entry.weight;

      if (roll <= 0) {
        return entry.item;
      }
    }

    return weightedItems.at(-1)?.item;
  };

  const shuffle = <T>(items: readonly T[]) => {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = randomInt(0, index + 1);
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }

    return shuffled;
  };

  return {
    seed: normalizeSeed(seed),
    randomFloat,
    randomInt,
    randomChoice,
    weightedChoice,
    shuffle,
  };
}
