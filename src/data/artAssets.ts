export type ArtAssetUsageStatus =
  | "prototype-concept"
  | "approved-for-demo"
  | "needs-review-before-commercial-release"
  | "final-licensed-art";

export type ArtAssetSourceType = "ai-generated-openai";

export type TheologicalSensitivity = "low" | "moderate" | "high";

export interface ArtAsset {
  id: string;
  title: string;
  path: string;
  additionalPaths?: string[];
  objectFit?: "contain" | "cover";
  objectPosition?: string;
  sourceType: ArtAssetSourceType;
  generationTool: string;
  generatedForProject: boolean;
  usageStatus: ArtAssetUsageStatus;
  saga: "David's Legacy" | "War of the Watchers";
  relatedCards: string[];
  relatedScreens: string[];
  tags: string[];
  notes: string;
  theologicalSensitivity: TheologicalSensitivity;
}

const openAiConceptDefaults = {
  sourceType: "ai-generated-openai",
  generationTool: "ChatGPT / OpenAI image generation",
  generatedForProject: true,
  usageStatus: "prototype-concept",
  saga: "David's Legacy",
} satisfies Pick<
  ArtAsset,
  | "sourceType"
  | "generationTool"
  | "generatedForProject"
  | "usageStatus"
  | "saga"
>;

interface CardArtAssetInput {
  id: string;
  title: string;
  fileName: string;
  incomingFileName?: string;
  objectPosition?: string;
  relatedCards: string[];
  tags: string[];
  notes: string;
  theologicalSensitivity?: TheologicalSensitivity;
}

function createCardArtAsset({
  fileName,
  id,
  incomingFileName,
  notes,
  objectPosition = "50% 38%",
  relatedCards,
  tags,
  theologicalSensitivity = "low",
  title,
}: CardArtAssetInput): ArtAsset {
  return {
    ...openAiConceptDefaults,
    id,
    title,
    path: `/art/cards/${fileName}`,
    additionalPaths: [`/art/incoming/${incomingFileName ?? fileName}`],
    objectPosition,
    relatedCards,
    relatedScreens: ["Gallery", "Collection", "Card Inspect", "Combat"],
    tags,
    notes,
    theologicalSensitivity,
  };
}

export const artAssets: ArtAsset[] = [
  {
    ...openAiConceptDefaults,
    id: "art-throne-room-vision",
    title: "Throne Room Vision",
    path: "/art/showcase/throne-room-vision.png",
    additionalPaths: ["/art/incoming/throne-room-vision.png"],
    objectPosition: "50% 42%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: [
      "vision",
      "reverence",
      "heavenly court",
      "divine glory",
      "mystery",
      "throne-room-vision",
    ],
    notes:
      "High-sensitivity throne-room atmosphere concept for reverent gallery or codex use only after review.",
    theologicalSensitivity: "high",
  },
  {
    ...openAiConceptDefaults,
    id: "art-moses-divider-of-seas",
    title: "Moses, Divider of Seas",
    path: "/art/showcase/moses-divider-of-seas.png",
    additionalPaths: [
      "/art/cards/moses-divider-of-seas.png",
      "/art/incoming/moses-divider-of-seas.png",
    ],
    objectPosition: "46% 36%",
    relatedCards: ["card-moses-divider-of-seas", "card-psalm-of-deliverance"],
    relatedScreens: ["Home", "Gallery", "Collection", "Card Inspect", "Combat"],
    tags: ["moses", "red sea", "deliverance", "prophet", "covenant"],
    notes:
      "Prototype concept for the Red Sea deliverance theme; present as divine rescue through obedience, not human magic.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-archangel-michael",
    title: "Archangel Michael",
    path: "/art/showcase/archangel-michael.png",
    additionalPaths: [
      "/art/cards/archangel-michael.png",
      "/art/incoming/archangel-michael.png",
    ],
    objectPosition: "52% 36%",
    relatedCards: ["card-archangel-michael"],
    relatedScreens: ["Home", "Gallery", "Collection", "Card Inspect", "Combat"],
    tags: ["archangel", "heavenly host", "judgment", "radiance", "mystery"],
    notes:
      "High-sensitivity angelic concept; frame Michael as a servant under God's authority and avoid angelic worship.",
    theologicalSensitivity: "high",
  },
  {
    ...openAiConceptDefaults,
    id: "art-david-goliath-portrait",
    title: "David vs Goliath",
    path: "/art/showcase/david-goliath-portrait.png",
    additionalPaths: [
      "/art/cards/david-vs-goliath.png",
      "/art/incoming/david-goliath-portrait.png",
    ],
    objectPosition: "44% 32%",
    relatedCards: [
      "card-david-vs-goliath",
      "card-giant-toppler",
      "card-defy-the-giant",
      "card-strike-the-boaster",
      "card-giants-opening",
    ],
    relatedScreens: ["Home", "Gallery", "Collection", "Card Inspect", "Combat"],
    tags: ["david", "goliath", "giant", "courage", "valley", "covenant"],
    notes:
      "Combat-scale concept for covenant courage against a giant threat; emphasize trust and deliverance over spectacle.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-mary-empty-tomb",
    title: "Mary Magdalene at the Empty Tomb",
    path: "/art/showcase/mary-empty-tomb.png",
    additionalPaths: [
      "/art/cards/mary-magdalene-empty-tomb.png",
      "/art/incoming/mary-empty-tomb.png",
    ],
    objectPosition: "42% 30%",
    relatedCards: ["card-mary-witness-to-glory"],
    relatedScreens: ["Home", "Gallery", "Collection", "Card Inspect", "Codex", "Combat"],
    tags: ["mary magdalene", "empty tomb", "witness", "hope", "resurrection"],
    notes:
      "High-sensitivity resurrection witness concept; use reverently as testimony, not as a player-controlled power object.",
    theologicalSensitivity: "high",
  },
  {
    ...openAiConceptDefaults,
    id: "art-resurrection-empty-tomb",
    title: "The Resurrection Witness",
    path: "/art/showcase/resurrection-empty-tomb.png",
    additionalPaths: ["/art/incoming/resurrection-empty-tomb.png"],
    objectPosition: "50% 42%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["empty tomb", "resurrection", "witness", "hope", "mystery"],
    notes:
      "High-sensitivity resurrection concept for gallery or codex reflection after review; avoid reducing divine glory to a collectible effect.",
    theologicalSensitivity: "high",
  },
  {
    ...openAiConceptDefaults,
    id: "art-abraham-stars",
    title: "Abraham",
    path: "/art/gallery/abraham-stars.png",
    additionalPaths: ["/art/incoming/abraham-stars.png"],
    objectPosition: "50% 34%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["abraham", "stars", "promise", "covenant", "witness"],
    notes:
      "Covenant promise concept for future gallery, codex, or witness-card exploration.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-elijah-fire-from-heaven",
    title: "Elijah",
    path: "/art/gallery/elijah-fire-from-heaven.png",
    additionalPaths: ["/art/incoming/elijah-fire-from-heaven.png"],
    objectPosition: "50% 38%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["elijah", "prophet", "fire", "judgment", "covenant"],
    notes:
      "Prophetic judgment concept; use with care so divine intervention remains reverent, not spellcasting.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-noah-ark-covenant",
    title: "Noah",
    path: "/art/gallery/noah-ark-covenant.png",
    additionalPaths: ["/art/incoming/noah-ark-covenant.png"],
    objectPosition: "50% 36%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["noah", "ark", "covenant", "judgment", "deliverance", "mercy"],
    notes:
      "Covenant preservation concept for future gallery or codex use.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-samuel-temple",
    title: "Samuel",
    path: "/art/gallery/samuel-temple.png",
    additionalPaths: ["/art/incoming/samuel-temple.png"],
    objectPosition: "50% 34%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["samuel", "temple", "calling", "prophet", "witness"],
    notes:
      "Calling and obedience concept for future gallery or codex use.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-peter-witness",
    title: "Peter",
    path: "/art/gallery/peter-witness.png",
    additionalPaths: ["/art/incoming/peter-witness.png"],
    objectPosition: "48% 34%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["peter", "witness", "apostle", "restoration", "covenant"],
    notes:
      "Apostolic witness concept; handle as testimony and restoration rather than spectacle.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-samson-pillars",
    title: "Samson",
    path: "/art/heroes/samson-pillars.png",
    additionalPaths: ["/art/incoming/samson-pillars.png"],
    objectPosition: "50% 36%",
    relatedCards: [],
    relatedScreens: ["Gallery"],
    tags: ["samson", "pillars", "strength", "judgment", "deliverance"],
    notes:
      "Heroic judgment concept for gallery review; future gameplay use should avoid glamorizing vengeance.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-ruth-fields",
    title: "Ruth",
    path: "/art/heroes/ruth-fields.png",
    additionalPaths: ["/art/incoming/ruth-fields.png"],
    objectPosition: "48% 35%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["ruth", "fields", "loyalty", "provision", "witness"],
    notes:
      "Loyalty and provision concept for future gallery, codex, or support-card exploration.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-shepherd-david",
    title: "Shepherd David",
    path: "/art/heroes/shepherd-david.png",
    additionalPaths: ["/art/incoming/shepard-david.png"],
    objectPosition: "48% 26%",
    relatedCards: [
      "card-sling-stone",
      "card-shepherds-guard",
      "card-lion-and-bear",
      "card-watchful-shepherd",
      "card-guard-the-flock",
      "card-remember-the-lion",
      "card-testimony-before-saul",
    ],
    relatedScreens: ["Gallery", "Hero Select"],
    tags: ["david", "shepherd", "harp", "sling", "courage", "covenant", "giant"],
    notes:
      "Shepherd-era David concept; useful for hero presentation and covenant courage references.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-sling-stone",
    title: "Sling Stone",
    path: "/art/cards/sling-stone.png",
    additionalPaths: ["/art/incoming/sling-stone.png"],
    objectPosition: "52% 42%",
    relatedCards: [
      "card-sling-stone",
      "card-valley-sling",
      "card-valley-aim",
      "card-shepherds-precision",
    ],
    relatedScreens: ["Gallery", "Collection", "Card Inspect", "Combat"],
    tags: ["david", "sling", "stone", "courage", "valley"],
    notes:
      "Action-focused concept for the shepherd's stone; use as covenant courage imagery rather than spectacle.",
    theologicalSensitivity: "low",
  },
  {
    ...openAiConceptDefaults,
    id: "art-smooth-stone",
    title: "Smooth Stone",
    path: "/art/cards/smooth-stone.png",
    additionalPaths: ["/art/incoming/smooth-stone.png"],
    objectPosition: "54% 48%",
    relatedCards: [
      "card-smooth-stone",
      "card-stone-of-defiance",
      "card-five-smooth-stones",
      "card-cover-behind-the-stones",
      "card-prayer-at-the-brook",
    ],
    relatedScreens: ["Gallery", "Collection", "Card Inspect", "Combat"],
    tags: ["david", "stones", "preparedness", "courage", "valley"],
    notes:
      "Prepared-stone concept for tactical courage cards tied to the David and Goliath theme.",
    theologicalSensitivity: "low",
  },
  {
    ...openAiConceptDefaults,
    id: "art-shepherds-guard",
    title: "Shepherd's Guard",
    path: "/art/cards/shepherds-guard.png",
    additionalPaths: ["/art/incoming/shepherds-guard.png"],
    objectPosition: "50% 43%",
    relatedCards: [
      "card-shepherds-guard",
      "card-shepherds-courage",
      "card-staff-and-sling",
    ],
    relatedScreens: ["Gallery", "Collection", "Card Inspect", "Combat"],
    tags: ["shepherd", "staff", "flock", "guard", "psalm"],
    notes:
      "Protective shepherd motif for guard effects; keeps the tone pastoral and reverent.",
    theologicalSensitivity: "low",
  },
  {
    ...openAiConceptDefaults,
    id: "art-psalm-of-courage",
    title: "Psalm of Courage",
    path: "/art/cards/psalm-of-courage.png",
    additionalPaths: ["/art/incoming/pslam-of-courage.png"],
    objectPosition: "48% 48%",
    relatedCards: [
      "card-psalm-of-courage",
      "card-worship-before-war",
      "card-the-lord-delivers",
    ],
    relatedScreens: ["Gallery", "Collection", "Card Inspect", "Combat"],
    tags: ["psalm", "harp", "scroll", "worship", "courage"],
    notes:
      "Worship-and-scroll concept for courage formed through prayerful remembrance.",
    theologicalSensitivity: "low",
  },
  {
    ...openAiConceptDefaults,
    id: "art-harp-of-watchfulness",
    title: "Harp of Watchfulness",
    path: "/art/cards/harp-of-watchfulness.png",
    additionalPaths: ["/art/incoming/harp-of-watchfulness.png"],
    objectPosition: "45% 48%",
    relatedCards: [
      "card-harp-of-watchfulness",
      "card-harp-before-battle",
      "card-strings-of-courage",
    ],
    relatedScreens: ["Gallery", "Collection", "Card Inspect", "Combat"],
    tags: ["harp", "watchfulness", "psalm", "night", "prayer"],
    notes:
      "Quiet night-watch psalm concept for prayer, vigilance, and faithful endurance.",
    theologicalSensitivity: "low",
  },
  {
    ...openAiConceptDefaults,
    id: "art-fearless-charge",
    title: "Fearless Charge",
    path: "/art/cards/fearless-charge.png",
    additionalPaths: ["/art/incoming/fearless-charge.png"],
    objectPosition: "50% 36%",
    relatedCards: ["card-fearless-charge"],
    relatedScreens: ["Gallery", "Collection", "Card Inspect", "Combat"],
    tags: ["david", "courage", "charge", "valley", "fear"],
    notes:
      "Courage action concept for David's starter reward pool; present as faithful resolve rather than reckless bravado.",
    theologicalSensitivity: "low",
  },
  {
    ...openAiConceptDefaults,
    id: "art-courage-before-battle",
    title: "Courage Before Battle",
    path: "/art/cards/courage-before-battle.png",
    additionalPaths: ["/art/incoming/courage-before-battle.png"],
    objectPosition: "50% 35%",
    relatedCards: ["card-courage-before-the-host"],
    relatedScreens: ["Gallery", "Collection", "Card Inspect", "Combat"],
    tags: ["courage", "prayer", "battle line", "david", "valley"],
    notes:
      "Pre-battle courage concept for prayer and Guard support; present as steadiness under trust, not spellcasting.",
    theologicalSensitivity: "low",
  },
  {
    ...openAiConceptDefaults,
    id: "art-captains-formation",
    title: "Captain's Formation",
    path: "/art/cards/captains-formation.png",
    additionalPaths: ["/art/incoming/captains-formation.png"],
    objectPosition: "50% 38%",
    relatedCards: ["card-captains-formation"],
    relatedScreens: ["Gallery", "Collection", "Card Inspect", "Combat"],
    tags: ["formation", "kingdom", "guard", "battle line", "leadership"],
    notes:
      "Kingdom formation concept for disciplined protection and leadership support.",
    theologicalSensitivity: "low",
  },
  {
    ...openAiConceptDefaults,
    id: "art-clean-hands",
    title: "Clean Hands",
    path: "/art/cards/clean-hands.png",
    additionalPaths: ["/art/incoming/clean-hands.png"],
    objectPosition: "50% 38%",
    relatedCards: ["card-clean-hands"],
    relatedScreens: ["Gallery", "Collection", "Card Inspect", "Combat", "Codex"],
    tags: ["clean hands", "covenant", "repentance", "prayer", "integrity"],
    notes:
      "Covenant integrity concept for cleansing and low-corruption play; frame as repentance and mercy rather than ritual control.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-remember-promise",
    title: "Remember the Promise",
    path: "/art/cards/remember-promise.png",
    additionalPaths: ["/art/incoming/remember-promise.png"],
    objectPosition: "50% 36%",
    relatedCards: ["card-remember-the-promise"],
    relatedScreens: ["Gallery", "Collection", "Card Inspect", "Combat"],
    tags: ["promise", "covenant", "memory", "prayer", "faith"],
    notes:
      "Covenant memory concept for promise and remembrance cards; use as faithful return rather than talismanic power.",
    theologicalSensitivity: "low",
  },
  createCardArtAsset({
    id: "art-altar-of-mercy",
    title: "Altar of Mercy",
    fileName: "altar-of-mercy.png",
    incomingFileName: "alter-of-mercy.png",
    relatedCards: ["card-altar-of-mercy"],
    tags: ["altar", "mercy", "covenant", "cleansing", "restoration"],
    notes:
      "Mercy and covenant restoration concept; frame as repentance and mercy rather than transactional ritual.",
    theologicalSensitivity: "moderate",
  }),
  createCardArtAsset({
    id: "art-angelic-message",
    title: "Angelic Message",
    fileName: "angelic-message.png",
    relatedCards: ["card-angelic-message"],
    tags: ["angel", "message", "intervention", "wisdom", "authority"],
    notes:
      "High-sensitivity angelic messenger concept; present angels as servants under God's authority, not controllable summons.",
    theologicalSensitivity: "high",
  }),
  createCardArtAsset({
    id: "art-banner-of-the-king",
    title: "Banner of the King",
    fileName: "banner-of-the-king.png",
    relatedCards: ["card-banner-of-the-king"],
    tags: ["banner", "kingdom", "formation", "allegiance", "guard"],
    notes:
      "Kingdom banner concept for allegiance and ordered courage, not self-exaltation.",
  }),
  createCardArtAsset({
    id: "art-blessing-of-the-most-high",
    title: "Blessing of the Most High",
    fileName: "blessing-of-the-most-high.png",
    relatedCards: ["card-blessing-of-the-most-high"],
    tags: ["blessing", "most high", "covenant", "guard", "hope"],
    notes:
      "Blessing concept tied to God Most High; handle reverently as received mercy, not a controllable power object.",
    theologicalSensitivity: "moderate",
  }),
  createCardArtAsset({
    id: "art-bread-and-wine",
    title: "Bread and Wine",
    fileName: "bread-and-wine.png",
    relatedCards: ["card-bread-and-wine"],
    tags: ["bread", "wine", "provision", "covenant", "blessing"],
    notes:
      "Provision and blessing concept inspired by Melchizedek; avoid treating sacred imagery as a consumable power trick.",
    theologicalSensitivity: "moderate",
  }),
  createCardArtAsset({
    id: "art-captain-of-thousands",
    title: "Captain of Thousands",
    fileName: "captain-of-thousands.png",
    relatedCards: ["card-captain-of-thousands"],
    tags: ["captain", "kingdom", "command", "guard", "leadership"],
    notes:
      "Leadership concept for disciplined protection and ordered courage.",
  }),
  createCardArtAsset({
    id: "art-delayed-answer",
    title: "Delayed Answer",
    fileName: "delayed-answer.png",
    relatedCards: ["card-delayed-answer"],
    tags: ["prayer", "waiting", "lament", "wisdom", "faith"],
    notes:
      "Prayerful waiting concept for lament and patience without implying abandonment.",
  }),
  createCardArtAsset({
    id: "art-discernment",
    title: "Discernment",
    fileName: "discernment.png",
    relatedCards: ["card-discernment"],
    tags: ["discernment", "wisdom", "clarity", "prayer", "intent"],
    notes:
      "Discernment concept for faithful judgment and moral clarity, not forbidden insight.",
    theologicalSensitivity: "moderate",
  }),
  createCardArtAsset({
    id: "art-dread-pronouncement",
    title: "Dread Pronouncement",
    fileName: "dread-pronouncement.png",
    relatedCards: ["card-dread-pronouncement"],
    tags: ["dread", "burden", "warning", "judgment", "forbidden"],
    notes:
      "Forbidden-warning burden concept; should feel tragic, heavy, and spiritually dangerous rather than attractive.",
    theologicalSensitivity: "high",
  }),
  createCardArtAsset({
    id: "art-forbidden-consultation",
    title: "Forbidden Consultation",
    fileName: "forbidden-consultation.png",
    relatedCards: ["card-forbidden-consultation"],
    tags: ["forbidden", "consultation", "warning", "fear", "corruption"],
    notes:
      "Forbidden-counsel concept for cautionary use; never frame as wise or admirable spiritual practice.",
    theologicalSensitivity: "high",
  }),
  createCardArtAsset({
    id: "art-forbidden-watchers-knowledge",
    title: "Forbidden Watcher Knowledge",
    fileName: "forbidden-watchers-knowledge.png",
    relatedCards: ["card-forbidden-watcher-diagram", "card-dread-knowledge"],
    tags: ["forbidden", "watcher", "knowledge", "corruption", "warning"],
    notes:
      "Speculative Watcher knowledge concept; keep clearly marked as fiction and spiritually dangerous, not doctrine or valid wisdom.",
    theologicalSensitivity: "high",
  }),
  createCardArtAsset({
    id: "art-giant-forged-edge",
    title: "Giant-Forged Edge",
    fileName: "giant-forged-edge.png",
    relatedCards: ["card-giant-forged-edge"],
    tags: ["giant", "forged", "weapon", "forbidden", "corruption"],
    notes:
      "Forbidden weapon concept; use as a cautionary temptation with visible corruption cost.",
    theologicalSensitivity: "moderate",
  }),
  createCardArtAsset({
    id: "art-lament-into-praise",
    title: "Lament Into Praise",
    fileName: "lament-into-praise.png",
    relatedCards: ["card-lament-into-praise"],
    tags: ["lament", "praise", "psalm", "prayer", "restoration"],
    notes:
      "Psalm concept honoring lament as faithful speech before God.",
  }),
  createCardArtAsset({
    id: "art-mercy-at-the-threshing-floor",
    title: "Mercy at the Threshing Floor",
    fileName: "mercy-at-threshing-floor.png",
    relatedCards: ["card-mercy-at-the-threshing-floor"],
    tags: ["mercy", "threshing floor", "repentance", "covenant", "cleansing"],
    notes:
      "Mercy and repentance concept; avoid presenting the threshing-floor motif as purchasable ritual control.",
    theologicalSensitivity: "moderate",
  }),
  createCardArtAsset({
    id: "art-order-of-the-king-priest",
    title: "Order of the King-Priest",
    fileName: "order-of-the-king-priest.png",
    relatedCards: ["card-order-of-the-king-priest"],
    tags: ["king-priest", "melchizedek", "covenant", "authority", "mystery"],
    notes:
      "High-mystery king-priest concept; keep reverent and restrained rather than overdefining Melchizedek.",
    theologicalSensitivity: "high",
  }),
  createCardArtAsset({
    id: "art-renewed-oath",
    title: "Renewed Oath",
    fileName: "renewed-oath.png",
    relatedCards: ["card-renewed-oath"],
    tags: ["oath", "renewal", "covenant", "faith", "authority"],
    notes:
      "Covenant renewal concept for return to faithfulness.",
  }),
  createCardArtAsset({
    id: "art-royal-decree",
    title: "Royal Decree",
    fileName: "royal-decree.png",
    relatedCards: ["card-royal-decree"],
    tags: ["decree", "kingdom", "authority", "wisdom", "command"],
    notes:
      "Kingdom command concept for submitted authority and wise leadership.",
  }),
  createCardArtAsset({
    id: "art-seal-of-faith",
    title: "Seal of Faith",
    fileName: "seal-of-faith.png",
    relatedCards: ["card-seal-of-faith"],
    tags: ["faith", "seal", "covenant", "guard", "steadfastness"],
    notes:
      "Covenant steadfastness concept; avoid talismanic framing.",
  }),
  createCardArtAsset({
    id: "art-shepherds-stand",
    title: "Shepherd's Stand",
    fileName: "shepherds-stand.png",
    relatedCards: ["card-shepherds-stand"],
    tags: ["shepherd", "stand", "guard", "courage", "david"],
    notes:
      "Protective shepherd courage concept for defensive David reward cards.",
  }),
  createCardArtAsset({
    id: "art-shield-bearer",
    title: "Shield-Bearer",
    fileName: "shield-bearer.png",
    relatedCards: ["card-shield-bearer"],
    tags: ["shield", "ally", "kingdom", "guard", "formation"],
    notes:
      "Ally defense concept for ordered mutual protection.",
  }),
  createCardArtAsset({
    id: "art-song-in-the-night",
    title: "Song in the Night",
    fileName: "song-in-the-night.png",
    relatedCards: ["card-song-in-the-night"],
    tags: ["song", "night", "psalm", "prayer", "healing"],
    notes:
      "Psalm endurance concept for song in distress and faithful hope.",
  }),
  createCardArtAsset({
    id: "art-stand-against-the-giant",
    title: "Stand Against the Giant",
    fileName: "stand-against-the-giant.png",
    relatedCards: [
      "card-defy-the-giant",
      "card-strike-the-boaster",
      "card-david-vs-goliath",
    ],
    tags: ["david", "giant", "valley", "courage", "sling"],
    notes:
      "David-facing-giant concept for anti-Giant courage cards rooted in 1 Samuel 17.",
    theologicalSensitivity: "moderate",
  }),
  createCardArtAsset({
    id: "art-stone-of-defiance",
    title: "Stone of Defiance",
    fileName: "stone-of-defiance.png",
    relatedCards: ["card-stone-of-defiance"],
    tags: ["stone", "defiance", "courage", "fear", "valley"],
    notes:
      "Prepared-stone concept for Fear removal and Courage setup.",
  }),
  createCardArtAsset({
    id: "art-vanguard-spearmen",
    title: "Vanguard Spearmen",
    fileName: "vanguard-spearmen.png",
    relatedCards: ["card-vanguard-spearmen"],
    tags: ["spearmen", "vanguard", "kingdom", "formation", "guard"],
    notes:
      "Ally formation concept for courage and disciplined protection.",
  }),
  createCardArtAsset({
    id: "art-waters-of-rest",
    title: "Waters of Rest",
    fileName: "waters-of-rest.png",
    relatedCards: ["card-waters-of-rest"],
    tags: ["waters", "rest", "psalm", "provision", "shepherd"],
    notes:
      "Psalm 23 restoration concept for healing and Fear removal.",
  }),
  {
    ...openAiConceptDefaults,
    id: "art-daniel-lions-den",
    title: "Daniel in the Lions' Den",
    path: "/art/heroes/daniel-lions-den.png",
    additionalPaths: ["/art/incoming/daniel-lions-den.png"],
    objectPosition: "50% 36%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["daniel", "lions", "faithfulness", "deliverance", "witness"],
    notes:
      "Faithfulness under pressure concept for gallery and codex review.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-giant-of-high-place",
    title: "Giant of the High Place",
    path: "/art/enemies/giant-of-high-place.png",
    additionalPaths: ["/art/incoming/giant-of-high-place.png"],
    objectPosition: "52% 28%",
    relatedCards: ["card-giant-toppler", "card-david-vs-goliath"],
    relatedScreens: ["Gallery", "Combat", "Codex"],
    tags: ["giant", "high place", "boss", "judgment", "valley"],
    notes:
      "Boss-scale giant/champion concept for Goliath and high-place pressure; present as Philistine champion and giant-legacy atmosphere rather than glamorized tyranny.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-idol-priest",
    title: "Keeper of the Idol Standard",
    path: "/art/enemies/idol-priest.png",
    additionalPaths: ["/art/incoming/idol-priest.png"],
    objectPosition: "50% 34%",
    relatedCards: ["card-idols-bargain", "card-idols-whisper"],
    relatedScreens: ["Gallery", "Combat", "Codex"],
    tags: ["philistine", "idol", "standard", "false worship", "enemy"],
    notes:
      "Enemy concept for Philistine idol-standard pressure; present idolatry as false confidence and warning, never as admirable power.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-philistine-raider",
    title: "Philistine Raider",
    path: "/art/enemies/philistine-raider.png",
    additionalPaths: ["/art/incoming/philistine-raider.png"],
    objectPosition: "50% 34%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Combat", "Codex"],
    tags: ["philistine", "raider", "valley", "battle line", "enemy"],
    notes:
      "Enemy concept for the Valley Mouth skirmish; represents inferred Philistine pressure rather than a named biblical figure.",
    theologicalSensitivity: "low",
  },
  {
    ...openAiConceptDefaults,
    id: "art-giants-shield-bearer",
    title: "Giant's Shield-Bearer",
    path: "/art/enemies/giants-shield-bearer.png",
    additionalPaths: ["/art/incoming/giants-shield-bearer.png"],
    objectPosition: "50% 34%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Combat", "Codex"],
    tags: ["shield-bearer", "philistine", "gath", "guard", "enemy"],
    notes:
      "Enemy concept for the shield-bearer before the champion; keep as battlefield support, not a disposable fantasy creature.",
    theologicalSensitivity: "low",
  },
  {
    ...openAiConceptDefaults,
    id: "art-idol-standard",
    title: "Idol Standard",
    path: "/art/enemies/idol-standard.png",
    additionalPaths: ["/art/incoming/idol-standard.png"],
    objectPosition: "50% 45%",
    relatedCards: ["card-idols-bargain", "card-idols-whisper"],
    relatedScreens: ["Gallery", "Combat", "Codex"],
    tags: ["idol", "standard", "philistine", "false worship", "structure"],
    notes:
      "Structure concept for false-worship pressure; should read as warning and battlefield intimidation, not admirable power.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-watcher-touched-raider",
    title: "Watcher-Touched Raider",
    path: "/art/enemies/watcher-touched-raider.png",
    additionalPaths: ["/art/incoming/watcher-touched-raider.png"],
    objectPosition: "50% 34%",
    saga: "War of the Watchers",
    relatedCards: [
      "card-forbidden-watcher-diagram",
      "card-dread-knowledge",
      "card-watcher-touched-relic",
    ],
    relatedScreens: ["Gallery", "Combat", "Codex"],
    tags: ["watcher", "forbidden", "corruption", "raider", "speculative"],
    notes:
      "Speculative forbidden-pressure enemy concept; keep as cautionary fiction and do not present as doctrine or Goliath's source.",
    theologicalSensitivity: "high",
  },
  {
    ...openAiConceptDefaults,
    id: "art-high-place-giant",
    title: "High Place Giant",
    path: "/art/gallery/high-place-giant.png",
    additionalPaths: ["/art/incoming/high-place-giant.png"],
    objectPosition: "50% 42%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Campaign Map", "Codex"],
    tags: ["high place", "giant", "valley", "boss", "mystery"],
    notes:
      "Atmospheric high-place concept for the campaign's final ascent and gallery context.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-valley-of-the-giant",
    title: "The Valley of the Giant",
    path: "/art/showcase/valley-of-the-giant.png",
    additionalPaths: ["/art/incoming/valley-of-the-giant.png"],
    objectPosition: "50% 44%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Campaign Map", "Home"],
    tags: ["valley", "campaign map", "giant", "wilderness", "david"],
    notes:
      "Campaign vista concept for The Valley of the Giant, David's starter campaign anchored in 1 Samuel 17.",
    theologicalSensitivity: "low",
  },
  {
    ...openAiConceptDefaults,
    id: "art-valley-of-the-giant-landscape",
    title: "The Valley of the Giant Landscape",
    path: "/art/showcase/valley-of-the-giant-landscape.png",
    additionalPaths: ["/art/incoming/valley-of-the-giant-landscape.png"],
    objectPosition: "50% 50%",
    relatedCards: [],
    relatedScreens: ["Campaign Map", "Gallery", "Codex"],
    tags: ["valley", "campaign map", "battle lines", "brook", "david"],
    notes:
      "Wide campaign-location concept for The Valley of the Giant route map, anchored in 1 Samuel 17.",
    theologicalSensitivity: "low",
  },
];

export function getArtAsset(assetId: string) {
  return artAssets.find((asset) => asset.id === assetId);
}

export function getArtAssetPath(assetId: string) {
  return getArtAsset(assetId)?.path;
}

export function getArtAssetByPath(path?: string) {
  if (!path) {
    return undefined;
  }

  return artAssets.find(
    (asset) => asset.path === path || asset.additionalPaths?.includes(path),
  );
}

export function getAllTrackedArtPaths() {
  return artAssets.flatMap((asset) => [
    asset.path,
    ...(asset.additionalPaths ?? []),
  ]);
}
