import type { Hero, ResourceState, StartingDeckCard } from "@/types/game";
import { getArtAsset } from "@/data/artAssets";

const davidArt = getArtAsset("art-shepherd-david");
const mosesArt = getArtAsset("art-moses-divider-of-seas");
const elijahArt = getArtAsset("art-elijah-fire-from-heaven");
const danielArt = getArtAsset("art-daniel-lions-den");
const samsonArt = getArtAsset("art-samson-pillars");
const maryArt = getArtAsset("art-mary-empty-tomb");

const davidStartingDeck: StartingDeckCard[] = [
  { cardId: "card-sling-stone", quantity: 4 },
  { cardId: "card-shepherds-guard", quantity: 3 },
  { cardId: "card-psalm-of-courage", quantity: 2 },
  { cardId: "card-smooth-stone", quantity: 1 },
  { cardId: "card-watchful-shepherd", quantity: 1 },
  { cardId: "card-stone-of-defiance", quantity: 1 },
];

const davidStats: ResourceState & { maxHealth: number } = {
  maxHealth: 78,
  resolve: 3,
  faith: 1,
  wisdom: 0,
  authority: 0,
  corruption: 0,
};

const previewStats: ResourceState & { maxHealth: number } = {
  maxHealth: 68,
  resolve: 2,
  faith: 2,
  wisdom: 1,
  authority: 1,
  corruption: 0,
};

export const heroes: Hero[] = [
  {
    id: "hero-david-shepherd-of-bethlehem",
    canonicalName: "David, Shepherd of Bethlehem",
    name: "David, Shepherd of Bethlehem",
    shortName: "David",
    roleSubtitle: "The Shepherd Boy",
    legacyTitle: "The Shepherd King",
    difficulty: "Beginner",
    playstyleTags: ["Courage", "Psalm", "Sling", "Giant-Slayer"],
    strengths: [
      "Strong against Giants and Nephilim",
      "Good Fear removal",
      "Balanced attack and Guard",
      "Rewards reading enemy intent",
      "Beginner-friendly sequencing",
    ],
    weaknesses: [
      "Limited area damage",
      "Limited early Authority",
      "Weaker into Idol and Watcher mechanics without Covenant or Psalm drafts",
      "Needs timing Courage for best damage",
    ],
    signatureMechanic:
      "Courage stacks up to 3, grows through faithful defense, and turns David's next Attack into a clear burst window.",
    passiveName: "Heart of Courage",
    passiveText:
      "Start each combat with 1 Courage. The first time each combat an enemy reveals a Heavy Attack or has Giant or Nephilim, gain 1 Faith and 1 Resolve. When you fully block enemy damage, gain 1 Courage.",
    unlockState: "unlocked",
    artAssetId: "art-shepherd-david",
    epithet: "Courage, psalm, kingdom, and covenant",
    calling:
      "Young David stands before giants with psalm, courage, and a shepherd's faithful care before kingship.",
    imagePath: davidArt?.path,
    artworkTitle: davidArt?.title ?? "Shepherd David",
    imageObjectPosition: davidArt?.objectPosition ?? "48% 26%",
    maxHealth: davidStats.maxHealth,
    passive: {
      name: "Heart of Courage",
      text: "Start each combat with 1 Courage. The first time each combat an enemy reveals a Heavy Attack or has Giant or Nephilim, gain 1 Faith and 1 Resolve. When you fully block enemy damage, gain 1 Courage.",
    },
    startingDeck: davidStartingDeck,
    resourceState: {
      resolve: davidStats.resolve,
      faith: davidStats.faith,
      wisdom: davidStats.wisdom,
      authority: davidStats.authority,
      corruption: davidStats.corruption,
    },
    startingStats: davidStats,
    openingHandSize: 5,
    sourceTier: "Scripture",
    references: ["1 Samuel 16", "1 Samuel 17", "Psalms"],
    theologyNote:
      "David is presented as the young shepherd whose courage is grounded in trust in the Lord, before his kingship.",
    gameplayRole: "Beginner Hero",
  },
  createLockedHero({
    id: "hero-moses-wilderness-deliverer",
    canonicalName: "Moses, Wilderness Deliverer",
    shortName: "Moses",
    roleSubtitle: "The Deliverer",
    difficulty: "Intermediate",
    playstyleTags: ["Signs", "Wonders", "Provision", "Judgment"],
    strengths: ["Defensive resets", "Provision pacing", "Judgment against oppression"],
    weaknesses: ["Slower setup", "Requires careful resource planning"],
    signatureMechanic:
      "Deliverance effects open paths through pressure without framing Moses as a wizard.",
    passiveName: "Wilderness Provision",
    passiveText:
      "Preview: future runs will lean on provision, signs, and judgment under God's authority.",
    references: ["Exodus"],
    theologyNote:
      "Moses is framed as a servant and deliverer under God's command, not as a generic spellcaster.",
    artAssetId: "art-moses-divider-of-seas",
    imagePath: mosesArt?.path,
    artworkTitle: mosesArt?.title,
    imageObjectPosition: mosesArt?.objectPosition ?? "50% 30%",
  }),
  createLockedHero({
    id: "hero-deborah-judge-of-israel",
    canonicalName: "Deborah, Judge of Israel",
    shortName: "Deborah",
    roleSubtitle: "The Judge",
    difficulty: "Tactical",
    playstyleTags: ["Leadership", "Prophecy", "Formation", "Courage"],
    strengths: ["Formation planning", "Teamwide courage", "Prophetic timing"],
    weaknesses: ["Needs board setup", "Less direct burst damage"],
    signatureMechanic:
      "Leadership and prophecy reward planning before decisive action.",
    passiveName: "Song of Victory",
    passiveText:
      "Preview: future runs will coordinate formations, courage, and prophetic timing.",
    references: ["Judges 4", "Judges 5"],
    theologyNote:
      "Deborah is presented as judge and prophetess who bears witness to the Lord's deliverance.",
  }),
  createLockedHero({
    id: "hero-elijah-prophet-of-carmel",
    canonicalName: "Elijah, Prophet of Carmel",
    shortName: "Elijah",
    roleSubtitle: "The Fire Prophet",
    difficulty: "Intermediate",
    playstyleTags: ["Altar", "Judgment", "Anti-Idol", "Faith"],
    strengths: ["Anti-Idol pressure", "Altar interactions", "High-impact judgment"],
    weaknesses: ["Resource hungry", "Vulnerable during setup turns"],
    signatureMechanic:
      "Covenant altar and judgment effects confront idolatry without treating power as magic.",
    passiveName: "Repair the Altar",
    passiveText:
      "Preview: future runs will suppress idol structures and answer false worship through judgment.",
    references: ["1 Kings 17", "1 Kings 18", "1 Kings 19"],
    theologyNote:
      "Elijah's signs are treated as prophetic witness to the Lord, not as player-controlled sorcery.",
    artAssetId: "art-elijah-fire-from-heaven",
    imagePath: elijahArt?.path,
    artworkTitle: elijahArt?.title,
    imageObjectPosition: elijahArt?.objectPosition ?? "50% 32%",
  }),
  createLockedHero({
    id: "hero-daniel-exile-seer",
    canonicalName: "Daniel, Exile Seer",
    shortName: "Daniel",
    roleSubtitle: "The Seer in Exile",
    difficulty: "Advanced",
    playstyleTags: ["Wisdom", "Visions", "Interpretation", "Principalities"],
    strengths: ["Intent reading", "Wisdom scaling", "Spiritual-resistance tools"],
    weaknesses: ["Low early pressure", "Requires careful sequencing"],
    signatureMechanic:
      "Interpretation reveals danger and rewards faithful endurance in exile.",
    passiveName: "Understanding in Exile",
    passiveText:
      "Preview: future runs will use wisdom, visions, and interpretation to plan around threats.",
    references: ["Daniel"],
    theologyNote:
      "Daniel is framed through wisdom, prayer, faithfulness, and interpretation under God, not occult divination.",
    artAssetId: "art-daniel-lions-den",
    imagePath: danielArt?.path,
    artworkTitle: danielArt?.title,
    imageObjectPosition: danielArt?.objectPosition ?? "50% 28%",
  }),
  createLockedHero({
    id: "hero-joshua-captain-of-israel",
    canonicalName: "Joshua, Captain of Israel",
    shortName: "Joshua",
    roleSubtitle: "The Commander",
    difficulty: "Tactical",
    playstyleTags: ["Authority", "Formation", "Conquest", "Courage"],
    strengths: ["Authority generation", "Formation bonuses", "Sustained pressure"],
    weaknesses: ["Needs formation support", "Can struggle when disrupted"],
    signatureMechanic:
      "Command and courage reward disciplined formation rather than reckless attacks.",
    passiveName: "Be Strong and Courageous",
    passiveText:
      "Preview: future runs will coordinate authority, formation, and covenant courage.",
    references: ["Joshua"],
    theologyNote:
      "Joshua is framed through obedience, courage, and covenant leadership under the Lord's command.",
  }),
  createLockedHero({
    id: "hero-samson-nazirite-judge",
    canonicalName: "Samson, Nazirite Judge",
    shortName: "Samson",
    roleSubtitle: "The Nazirite",
    difficulty: "High Risk",
    playstyleTags: ["Strength", "Burst", "Burden", "Sacrifice"],
    strengths: ["Explosive burst turns", "High-risk comeback pressure"],
    weaknesses: ["Unstable defenses", "Burden and consequence management"],
    signatureMechanic:
      "Strength creates burst windows, but careless choices carry heavy cost.",
    passiveName: "Burdened Strength",
    passiveText:
      "Preview: future runs will trade stability for dangerous burst and sacrifice decisions.",
    references: ["Judges 13", "Judges 14", "Judges 15", "Judges 16"],
    theologyNote:
      "Samson is presented with sobriety, including calling, failure, consequence, and costly deliverance.",
    artAssetId: "art-samson-pillars",
    imagePath: samsonArt?.path,
    artworkTitle: samsonArt?.title,
    imageObjectPosition: samsonArt?.objectPosition ?? "50% 30%",
  }),
  createLockedHero({
    id: "hero-mary-magdalene-resurrection-witness",
    canonicalName: "Mary Magdalene, Resurrection Witness",
    shortName: "Mary Magdalene",
    roleSubtitle: "The Witness",
    difficulty: "Support",
    playstyleTags: ["Witness", "Hope", "Restoration", "Fear Removal"],
    strengths: ["Hope and restoration", "Fear removal", "Witness-based support"],
    weaknesses: ["Lower direct damage", "Needs protection and timing"],
    signatureMechanic:
      "Witness turns restoration and hope into support, not magical combat.",
    passiveName: "First Witness",
    passiveText:
      "Preview: future runs will emphasize testimony, hope, restoration, and Fear removal.",
    references: ["John 20", "Mark 16"],
    theologyNote:
      "Mary Magdalene is framed as a faithful witness to resurrection hope, not as a magical combat unit.",
    artAssetId: "art-mary-empty-tomb",
    imagePath: maryArt?.path,
    artworkTitle: maryArt?.title,
    imageObjectPosition: maryArt?.objectPosition ?? "50% 28%",
  }),
];

function createLockedHero(
  hero: Omit<
    Hero,
    | "calling"
    | "epithet"
    | "gameplayRole"
    | "maxHealth"
    | "name"
    | "passive"
    | "resourceState"
    | "sourceTier"
    | "startingDeck"
    | "startingStats"
    | "unlockState"
  >,
): Hero {
  return {
    ...hero,
    name: hero.canonicalName ?? hero.shortName ?? hero.id,
    unlockState: "coming-soon",
    epithet: hero.playstyleTags?.join(", ") ?? "Future covenant bearer",
    calling: hero.signatureMechanic ?? "A future Covenant: Legacies hero.",
    maxHealth: previewStats.maxHealth,
    passive: {
      name: hero.passiveName ?? "Preview Passive",
      text: hero.passiveText ?? "Coming soon.",
    },
    startingDeck: [],
    resourceState: {
      resolve: previewStats.resolve,
      faith: previewStats.faith,
      wisdom: previewStats.wisdom,
      authority: previewStats.authority,
      corruption: previewStats.corruption,
    },
    startingStats: previewStats,
    sourceTier: "Scripture",
    gameplayRole: "Hero Preview",
  };
}
