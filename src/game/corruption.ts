export type CorruptionThresholdName =
  | "Clean Hands"
  | "Compromised"
  | "Tainted"
  | "Oppressed"
  | "Marked";

export interface CorruptionThreshold {
  name: CorruptionThresholdName;
  rangeLabel: string;
  rank: number;
  summary: string;
  tone: "clean" | "compromised" | "tainted" | "oppressed" | "marked";
}

const thresholds: CorruptionThreshold[] = [
  {
    name: "Clean Hands",
    rangeLabel: "0",
    rank: 0,
    summary: "Covenant guard effects receive a small bonus.",
    tone: "clean",
  },
  {
    name: "Compromised",
    rangeLabel: "1-3",
    rank: 1,
    summary: "No added penalty yet, but the road is no longer clean.",
    tone: "compromised",
  },
  {
    name: "Tainted",
    rangeLabel: "4-6",
    rank: 2,
    summary: "Prayer and Psalm cards cost +1 Faith.",
    tone: "tainted",
  },
  {
    name: "Oppressed",
    rangeLabel: "7-9",
    rank: 3,
    summary: "Watcher, Giant, Nephilim, and Demon enemies begin with +1 Might.",
    tone: "oppressed",
  },
  {
    name: "Marked",
    rangeLabel: "10+",
    rank: 4,
    summary: "Bosses gain Shadow of the Watchers pressure.",
    tone: "marked",
  },
];

export function getCorruptionThreshold(corruption: number): CorruptionThreshold {
  if (corruption <= 0) {
    return thresholds[0];
  }

  if (corruption <= 3) {
    return thresholds[1];
  }

  if (corruption <= 6) {
    return thresholds[2];
  }

  if (corruption <= 9) {
    return thresholds[3];
  }

  return thresholds[4];
}

export function isCorruptionAtLeast(
  corruption: number,
  thresholdName: CorruptionThresholdName,
) {
  const current = getCorruptionThreshold(corruption);
  const target = thresholds.find((threshold) => threshold.name === thresholdName);

  return target ? current.rank >= target.rank : false;
}
