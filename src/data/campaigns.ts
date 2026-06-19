import type { SourceTier } from "@/types/game";

export const campaignSourceTierCategories: SourceTier[] = [
  "Scripture",
  "Biblical Inference",
  "Interpretive Tradition",
  "Speculative Fiction",
];

export const starterCampaign = {
  productTitle: "Covenant: Legacies",
  heroLegacy: "David",
  playableHero: "David, Shepherd of Bethlehem",
  campaignName: "The Valley of the Giant",
  campaignLabel: "David's Legacy",
  campaignSubtitle: "A David Starter Campaign",
  biblicalAnchor: "1 Samuel 17",
  purpose: "Starter / Tutorial Campaign",
  difficulty: "Beginner",
  primarySources: [
    "1 Samuel 17",
    "Joshua 11:21-22",
    "2 Samuel 21:15-22",
    "Genesis 6:1-4",
    "1 Samuel 5",
    "1 Samuel 31",
  ],
  description:
    "The Valley of the Giant is a Scripture-rooted, speculative-fantasy campaign inspired by David's confrontation with Goliath in the Valley of Elah. The visible conflict is Israel versus Philistia; the deeper game layer explores fear, covenant courage, giant legacy, idols, and spiritual pressure.",
  speculativeBoundary:
    "Goliath is not presented as Nephilim or Watcher-descended as fact. Giant legacy and Watcher pressure remain clearly marked as biblical inference or speculative game interpretation.",
  summary:
    "Learn David's courage, prayer, Guard timing, Fear removal, and anti-Giant attacks on the road toward the valley.",
};

export const futureWatcherSaga = {
  title: "War of the Watchers",
  note:
    "Future speculative saga layer. Watcher material remains available for codex, background, and later campaign development.",
};
