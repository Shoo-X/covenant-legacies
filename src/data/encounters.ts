import type { Encounter } from "@/types/game";

export const encounters: Encounter[] = [
  {
    id: "encounter-valley-battle-1",
    name: "Raiders at the Valley Mouth",
    nodeType: "Battle",
    region: "The Valley of the Giant",
    description:
      "The armies have taken their places on opposite slopes, and Philistine raiders test the valley mouth before the champion's voice dominates the field.",
    conversationStarter:
      "Why does 1 Samuel 17 begin by showing the armies facing one another before David appears?",
    codexEntryIds: [
      "codex-valley-of-elah",
      "codex-davids-courage",
      "codex-fear-and-faith",
    ],
    enemyIds: ["enemy-corrupted-raider"],
    rewardPreview: "Choose 1 of 3 cards after learning Guard, Courage, and pressure.",
    difficulty: "Low",
    sourceTier: "Biblical Inference",
    references: ["1 Samuel 17:1-3"],
    theologyNote:
      "An inferred Philistine skirmish at the edge of the valley, used to teach the battle line before David faces the champion without inventing a named biblical figure.",
    gameplayRole: "Map Node",
  },
  {
    id: "encounter-valley-battle-2",
    name: "The Idol Standard",
    nodeType: "Battle",
    region: "The Valley of the Giant",
    description:
      "A Philistine standard is raised under the shadow of false worship, forcing David to choose between striking the keeper and breaking the structure feeding the line.",
    conversationStarter:
      "What do the idol scenes around Philistia reveal about false confidence before battle?",
    codexEntryIds: ["codex-dagon-philistine-idols", "codex-valley-of-elah"],
    enemyIds: ["enemy-idol-priest"],
    rewardPreview: "Choose 1 of 3 cards after learning targetable structure pressure.",
    difficulty: "Medium",
    sourceTier: "Biblical Inference",
    references: ["1 Samuel 5", "1 Samuel 31"],
    theologyNote:
      "A Scripture-informed game encounter using Philistine idol contexts to frame false worship as battlefield pressure, not endorsed power.",
    gameplayRole: "Map Node",
  },
  {
    id: "encounter-valley-mystery",
    name: "The Five Smooth Stones",
    nodeType: "Mystery Encounter",
    region: "The Valley of the Giant",
    description:
      "At the brook, David chooses what he will carry into the valley: not Saul's armor, but prepared obedience, prayer, and haste toward the battle.",
    conversationStarter:
      "Why does the text linger on David choosing five smooth stones from the brook?",
    codexEntryIds: [
      "codex-valley-of-elah",
      "codex-five-smooth-stones",
      "codex-davids-courage",
    ],
    enemyIds: [],
    mysteryEncounterIds: ["mystery-five-smooth-stones"],
    rewardPreview: "Prepare with an upgrade, Faith, Fear removal, or Resolve.",
    difficulty: "Low",
    sourceTier: "Scripture",
    references: ["1 Samuel 17:40"],
    theologyNote:
      "This Scripture encounter treats the stones as prepared obedience before the Lord, not as charms or magical objects.",
    gameplayRole: "Support",
  },
  {
    id: "encounter-valley-elite",
    name: "Forge Beneath the Ridge",
    nodeType: "Elite",
    region: "The Valley of the Giant",
    description:
      "Beneath the ridge, the enemy's iron and forbidden ambition press in before the final ascent, testing whether David's deck can endure armor, Guard, and scaling threat.",
    conversationStarter:
      "How should a game distinguish biblical giant traditions from speculative background pressure?",
    codexEntryIds: [
      "codex-gath",
      "codex-giants-in-scripture",
      "codex-speculative-watcher-layer",
    ],
    enemyIds: ["enemy-watcher-taught-smith"],
    rewardPreview: "Elite reward: choose 1 of 3 cards and seek a Memorial.",
    difficulty: "High",
    sourceTier: "Speculative Fiction",
    references: [
      "1 Samuel 17",
      "2 Samuel 21:15-22",
      "Genesis 6:1-4 as speculative background",
    ],
    theologyNote:
      "Because the current enemy is Watcher-Taught Smith, this node is marked Speculative Fiction. It treats forbidden teaching as corruption and does not make a direct claim about Goliath's ancestry.",
    gameplayRole: "Trial",
  },
  {
    id: "encounter-valley-rest",
    name: "The Brook of Stones",
    nodeType: "Rest / Upgrade",
    region: "The Valley of the Giant",
    description:
      "The brook becomes the last quiet place before Goliath: rest, choose carefully, remember former deliverance, or pray against fear and corruption.",
    conversationStarter:
      "What does David's memory of the lion and bear teach before the public battle?",
    codexEntryIds: [
      "codex-valley-of-elah",
      "codex-five-smooth-stones",
      "codex-memorials-remembrance",
      "codex-davids-courage",
    ],
    enemyIds: [],
    rewardPreview:
      "Rest, upgrade a Courage card, add Lion and Bear, remove Fear, or cleanse Corruption.",
    difficulty: "Low",
    sourceTier: "Scripture",
    references: ["1 Samuel 17:40", "1 Samuel 17:34-37"],
    theologyNote:
      "The rest node is anchored in David's brook preparation and remembered deliverance, presenting preparation and prayer as faithful dependence.",
    gameplayRole: "Support",
  },
  {
    id: "encounter-valley-boss",
    name: "Goliath of Gath",
    nodeType: "Boss",
    region: "The Valley of the Giant",
    description:
      "The Philistine champion steps forward with terror, armor, and a public challenge. Victory demands Courage, Fear removal, Guard planning, structure pressure, and clean play.",
    conversationStarter:
      "What does David mean when he says the battle belongs to the Lord?",
    codexEntryIds: [
      "codex-goliath-of-gath",
      "codex-gath",
      "codex-giants-in-scripture",
      "codex-davids-courage",
      "codex-battle-belongs-to-the-lord",
    ],
    enemyIds: ["enemy-giant-of-the-high-place"],
    rewardPreview: "Campaign victory for David's Legacy.",
    difficulty: "Boss",
    sourceTier: "Scripture",
    references: ["1 Samuel 17", "Joshua 11:22", "2 Samuel 21:15-22"],
    theologyNote:
      "The boss is Goliath of Gath as the Philistine champion in 1 Samuel 17. Gath and giant-legacy context is related, but speculative Nephilim or Watcher ancestry is not presented as fact.",
    gameplayRole: "Boss",
  },
];
