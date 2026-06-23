import {
  artRegistry,
  type ArtCurrentStatus,
  type ArtPriority,
  type ArtRegistryItem,
} from "@/data/artRegistry";

const priorityRank: Record<ArtPriority, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
  P4: 4,
};

const statusRank: Record<ArtCurrentStatus, number> = {
  missing: 0,
  placeholder: 1,
  final: 2,
};

export type ArtPromptQueueItem = ArtRegistryItem;

export const artPromptQueue: ArtPromptQueueItem[] = [
  ...artRegistry.filter((item) => item.currentStatus !== "final"),
].sort((first, second) => {
  const priorityDifference =
    priorityRank[first.priority] - priorityRank[second.priority];

  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  const statusDifference =
    statusRank[first.currentStatus] - statusRank[second.currentStatus];

  if (statusDifference !== 0) {
    return statusDifference;
  }

  return first.displayName.localeCompare(second.displayName);
});

export const highPriorityArtPromptQueue = artPromptQueue.filter(
  (item) => item.priority === "P0" || item.priority === "P1",
);
