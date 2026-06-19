import type { CodexLoreEntry } from "@/types/game";
import { getArtAssetPath } from "@/data/artAssets";

export const codexEntries: CodexLoreEntry[] = [
  {
    id: "codex-davids-legacy",
    title: "David's Legacy",
    imagePath: getArtAssetPath("art-david-goliath-portrait"),
    artworkTitle: "David vs Goliath",
    sourceTier: "Scripture",
    references: ["1 Samuel 17", "1 Samuel 16", "Psalms"],
    theologyNote:
      "The starter campaign presents David as the young shepherd whose courage is grounded in trust in the Lord before kingship.",
    gameplayRole: "Beginner Hero",
    representationMode: "Legacy",
    sections: {
      whatTheBibleSays:
        "1 Samuel 17 centers David's trust in the Lord as he faces Goliath. The story emphasizes covenant confidence, courage, and the Lord's deliverance rather than human spectacle.",
      whyItIsMysterious:
        "David is still young and outwardly unimpressive, yet his faith and memory of the Lord's past deliverance shape his courage in the valley.",
      interpretiveTraditions:
        "David and Goliath is often read as a defining courage story, but Covenant: Legacies keeps the focus on faithful trust before royal glory.",
      gameInterpretation:
        "The Valley of the Giant is David's beginner campaign. Watcher and Nephilim material may appear as speculative background, but the starter path teaches David's biblical story and core mechanics first.",
    },
  },
  {
    id: "codex-valley-of-elah",
    title: "Valley of Elah",
    imagePath: getArtAssetPath("art-david-goliath-landscape"),
    artworkTitle: "David and Goliath",
    sourceTier: "Scripture",
    references: ["1 Samuel 17:1-3", "1 Samuel 17:40", "1 Samuel 17:48-50"],
    theologyNote:
      "The starter campaign is anchored in the Valley of Elah as the biblical setting where David's covenant courage is tested before Israel and Philistia.",
    gameplayRole: "Map Node",
    representationMode: "Legacy",
    sections: {
      whatTheBibleSays:
        "1 Samuel 17 places the Philistines at Socoh in Judah, camped between Socoh and Azekah at Ephes-dammim. Israel and the Philistines stand on opposing hills with the valley between them.",
      whyItIsMysterious:
        "The valley is ordinary geography made spiritually weighty by fear, taunts, battle lines, and David's trust in the Lord.",
      whyItMattersInGame:
        "The Valley of the Giant is the player's first road because it naturally teaches enemy intent, fear pressure, guard timing, and courageous response.",
      conversationStarters: [
        "What makes an ordinary valley become a place of covenant testing?",
        "Why does David's courage begin before the stone is thrown?",
        "How should the game show battle lines without reducing the story to spectacle?",
      ],
      interpretiveTraditions:
        "Readers often remember the valley as the stage for courage against impossible odds. Covenant: Legacies keeps that memory tied to trust in the Lord rather than personal bravado.",
      gameInterpretation:
        "The map uses the valley as a beginner campaign path. The visible conflict is Israel versus Philistia, while optional speculative pressure remains secondary and clearly marked.",
    },
  },
  {
    id: "codex-gath",
    title: "Gath",
    imagePath: getArtAssetPath("art-david-goliath-portrait"),
    artworkTitle: "David vs Goliath",
    sourceTier: "Biblical Inference",
    references: ["1 Samuel 17:4", "Joshua 11:21-22", "2 Samuel 21:15-22"],
    theologyNote:
      "Gath is treated as a biblical place tied to Goliath and later giant traditions, while the game avoids claiming more than Scripture states.",
    gameplayRole: "Anti-Giant",
    representationMode: "Legacy",
    sections: {
      whatTheBibleSays:
        "Goliath is introduced as a champion from Gath. Joshua says Anakim remained in Gaza, Gath, and Ashdod, and 2 Samuel later names giant warriors connected with Gath and the descendants of Rapha.",
      whyItIsMysterious:
        "Scripture gives several threads around Gath, giants, and later conflicts, but it does not provide a complete genealogy for Goliath.",
      whyItMattersInGame:
        "Gath gives the campaign its giant-shadow context without making speculative ancestry a doctrine or a required reading of 1 Samuel 17.",
      conversationStarters: [
        "What can be responsibly inferred from Gath's giant associations?",
        "Where should the game stop before speculation sounds like certainty?",
        "How can a place carry memory across multiple biblical stories?",
      ],
      interpretiveTraditions:
        "Interpreters often connect Gath with lingering giant traditions. Covenant: Legacies treats that connection as a careful inference, not a settled claim about Goliath's origin.",
      gameInterpretation:
        "Gath shapes anti-Giant mechanics and atmosphere. The game can imagine a giant legacy around the region while keeping direct Nephilim or Watcher descent in the speculative layer.",
    },
  },
  {
    id: "codex-giants-in-scripture",
    title: "Giants in Scripture",
    imagePath: getArtAssetPath("art-david-goliath-landscape"),
    artworkTitle: "David and Goliath",
    sourceTier: "Biblical Inference",
    references: [
      "Genesis 6:1-4",
      "Joshua 11:21-22",
      "1 Samuel 17",
      "2 Samuel 21:15-22",
    ],
    theologyNote:
      "The game distinguishes the Nephilim, Anakim, Rapha traditions, and Goliath rather than flattening them into one speculative claim.",
    gameplayRole: "Anti-Giant",
    representationMode: "Legacy",
    sections: {
      whatTheBibleSays:
        "Genesis mentions the Nephilim in a mysterious pre-flood context. Joshua names Anakim in the land, including remnants in Gath. 1 Samuel presents Goliath as a Philistine champion from Gath, and 2 Samuel recalls later giant warriors from Gath.",
      whyItIsMysterious:
        "The biblical texts mention several giant-related groups and figures without explaining every relationship between them.",
      whyItMattersInGame:
        "The campaign uses giant pressure as a gameplay problem: fear, intimidation, heavy attacks, and the need for patient covenant courage.",
      conversationStarters: [
        "Why is it important not to merge every giant reference into one theory?",
        "How does fear make a giant feel larger before any blow lands?",
        "What should anti-Giant gameplay teach about David's trust?",
      ],
      interpretiveTraditions:
        "Later readers have proposed many connections among these passages. The codex keeps those possibilities under inference or speculation rather than labeling them as Scripture's direct claim.",
      gameInterpretation:
        "Goliath is not stated to be Nephilim or Watcher-descended. The game may use giant legacy as atmosphere, but David's starter campaign stays rooted in 1 Samuel 17.",
    },
  },
  {
    id: "codex-dagon-philistine-idols",
    title: "Dagon and Philistine Idols",
    sourceTier: "Scripture",
    references: ["1 Samuel 5", "1 Samuel 31:8-10"],
    theologyNote:
      "Philistine idol imagery is used as a warning about false worship, fear, and misplaced victory, not as glamorous occult power.",
    gameplayRole: "Trial",
    representationMode: "ForbiddenWarning",
    sections: {
      whatTheBibleSays:
        "1 Samuel 5 recounts the ark in the house of Dagon and the humiliation of the idol. 1 Samuel 31 describes Philistine victory displays connected with idol temples after Saul's death.",
      whyItIsMysterious:
        "The texts show visible military conflict entangled with worship, shame, and claims about which power rules.",
      whyItMattersInGame:
        "Idol-standard encounters give the campaign a tactical question: strike the enemy, or break the false structure empowering the fight.",
      conversationStarters: [
        "How can the game show idolatry as false confidence rather than exotic power?",
        "Why do public trophies and temples matter after battle?",
        "What makes an idol-standard pressure mechanic theologically cautionary?",
      ],
      interpretiveTraditions:
        "Biblical interpretation often reads these idol scenes as confrontations between the Lord's holiness and human-made claims to power.",
      gameInterpretation:
        "Idol Standards and their keepers are gameplay abstractions for false worship pressure. They are enemy structures to resist or break, not sources of wisdom for the player.",
    },
  },
  {
    id: "codex-davids-courage",
    title: "David's Courage",
    imagePath: getArtAssetPath("art-shepherd-david"),
    artworkTitle: "Shepherd David",
    sourceTier: "Scripture",
    references: ["1 Samuel 17:32-37", "1 Samuel 17:45-47", "Psalms"],
    theologyNote:
      "David's courage is presented as trust in the Lord, remembered deliverance, and covenant confidence before kingship.",
    gameplayRole: "Beginner Hero",
    representationMode: "Legacy",
    sections: {
      whatTheBibleSays:
        "David remembers the Lord's deliverance from lion and bear, rejects fear before Goliath, and declares that the battle belongs to the Lord.",
      whyItIsMysterious:
        "David's confidence is not grounded in size, armor, or status. The shepherd boy sees the confrontation through covenant trust.",
      whyItMattersInGame:
        "David's beginner deck teaches the player to read intent, guard heavy blows, remove Fear, build Courage, and strike at the right moment.",
      conversationStarters: [
        "What is the difference between courage and self-confidence?",
        "Why does remembered deliverance matter in a new crisis?",
        "How should a beginner hero feel humble but not weak?",
      ],
      interpretiveTraditions:
        "David's courage is often celebrated as heroic faith. Covenant: Legacies avoids making him already complete as king in the starter campaign.",
      gameInterpretation:
        "Courage stacks, Fear removal, and anti-Giant attacks express David's early shepherd identity: watchful, prayerful, and decisive under pressure.",
    },
  },
  {
    id: "codex-goliath-of-gath",
    title: "Goliath of Gath",
    imagePath: getArtAssetPath("art-giant-of-high-place"),
    artworkTitle: "Giant of the High Place",
    sourceTier: "Scripture",
    references: ["1 Samuel 17", "Joshua 11:21-22", "2 Samuel 21:15-22"],
    theologyNote:
      "Goliath is presented as the Philistine champion from Gath. Related giant traditions give context, but the game does not claim he is Nephilim or Watcher-descended.",
    gameplayRole: "Boss",
    representationMode: "Enemy",
    sections: {
      whatTheBibleSays:
        "1 Samuel 17 names Goliath as a champion from Gath who defies Israel and is met by David in the valley. Joshua and 2 Samuel provide related Gath and giant-legacy context without explaining Goliath's ancestry in detail.",
      whyItIsMysterious:
        "Goliath's size, armor, public challenge, and connection to Gath make him memorable, but Scripture keeps the focus on the Lord's deliverance rather than satisfying curiosity about origins.",
      whyItMattersInGame:
        "As the first campaign boss, Goliath tests Guard planning, Fear removal, Courage timing, and careful play under heavy pressure.",
      conversationStarters: [
        "Why does the text spend so much time describing Goliath's challenge before David answers?",
        "How can giant-legacy context deepen the scene without becoming a doctrine?",
        "What makes fear part of the battle before the first attack lands?",
      ],
      interpretiveTraditions:
        "Readers often connect Goliath with wider giant traditions around Gath. Covenant: Legacies treats those connections as contextual inference, not as a direct claim of Nephilim descent.",
      gameInterpretation:
        "Goliath of Gath is the climactic enemy of David's starter campaign. The boss should feel enormous and intimidating while remaining rooted in 1 Samuel 17.",
    },
  },
  {
    id: "codex-five-smooth-stones",
    title: "Five Smooth Stones",
    imagePath: getArtAssetPath("art-smooth-stone"),
    artworkTitle: "Smooth Stone",
    sourceTier: "Scripture",
    references: ["1 Samuel 17:40"],
    theologyNote:
      "The stones are prepared obedience before the Lord, not sacred objects, charms, or magical weapons.",
    gameplayRole: "Tactic",
    representationMode: "Legacy",
    sections: {
      whatTheBibleSays:
        "Before facing Goliath, David chooses five smooth stones from the brook and carries them with his sling.",
      whyItIsMysterious:
        "The detail is humble and ordinary, yet the story lingers on it because David prepares without adopting Saul's armor or trusting in spectacle.",
      whyItMattersInGame:
        "Smooth Stone choices teach preparation, upgrades, Faith, Courage, and small decisions that matter before the public battle.",
      conversationStarters: [
        "Why does David prepare with ordinary stones instead of royal armor?",
        "How can preparation be faithful without treating objects as charms?",
        "What makes a small choice matter before a giant challenge?",
      ],
      interpretiveTraditions:
        "The stones are often remembered as symbols of faith and readiness. The game keeps them ordinary, concrete, and tied to obedience.",
      gameInterpretation:
        "Five Smooth Stones is a Scripture encounter and card theme that helps the player prepare without glamorizing the stones as holy artifacts.",
    },
  },
  {
    id: "codex-fear-and-faith",
    title: "Fear and Faith",
    sourceTier: "Biblical Inference",
    references: ["1 Samuel 17:11", "1 Samuel 17:24", "1 Samuel 17:32-37"],
    theologyNote:
      "Fear is treated as real pressure answered by trust, memory, obedience, and worship, not by pretending danger is harmless.",
    gameplayRole: "Trial",
    representationMode: "Prayer",
    sections: {
      whatTheBibleSays:
        "Israel is dismayed and afraid before Goliath, while David remembers the Lord's past deliverance and refuses to let fear define the battle.",
      whyItIsMysterious:
        "The same threat is visible to everyone, yet David interprets it through covenant trust while others are paralyzed.",
      whyItMattersInGame:
        "Fear slows the player down, while Faith and Courage cards help David recover, guard well, and answer the enemy's pressure.",
      conversationStarters: [
        "What is the difference between courage and pretending not to be afraid?",
        "Why does remembered deliverance matter when a new threat appears?",
        "How should a game make fear costly without making faith feel automatic?",
      ],
      interpretiveTraditions:
        "David's courage is often taught as trust under pressure. Covenant: Legacies keeps that courage humble, watchful, and dependent on the Lord.",
      gameInterpretation:
        "Fear and Corruption are harmful states. Faith, Psalms, and covenant remembrance provide clean ways to recover without turning prayer into spellcasting.",
    },
  },
  {
    id: "codex-memorials-remembrance",
    title: "Memorials and Remembrance",
    sourceTier: "Scripture",
    references: ["Joshua 4", "Psalm 77", "1 Samuel 17:34-37"],
    theologyNote:
      "Memorials are reminders of deliverance and testimony, not magical relics or controllable spiritual technology.",
    gameplayRole: "Memorial",
    representationMode: "CovenantMemory",
    sections: {
      whatTheBibleSays:
        "Scripture repeatedly calls God's people to remember the Lord's works. Joshua's stones, psalmic remembrance, and David's memory of lion and bear all form courage for future obedience.",
      whyItIsMysterious:
        "Memory is not merely information; it shapes what a person trusts when fear returns.",
      whyItMattersInGame:
        "Memorial rewards act as passive run modifiers that help the player carry lessons from earlier victories into later trials.",
      conversationStarters: [
        "Why do remembered works of deliverance strengthen later obedience?",
        "How can a memorial be powerful without becoming a magical object?",
        "What should a run relic teach about testimony and dependence?",
      ],
      interpretiveTraditions:
        "Christian and Jewish traditions often treat remembrance as worship, testimony, formation, and warning.",
      gameInterpretation:
        "Memorials are meaningful run remembrances. Their effects should feel like testimony shaping the run, not like occult artifacts.",
    },
  },
  {
    id: "codex-battle-belongs-to-the-lord",
    title: "The Battle Belongs to the Lord",
    imagePath: getArtAssetPath("art-david-goliath-portrait"),
    artworkTitle: "David vs Goliath",
    sourceTier: "Scripture",
    references: ["1 Samuel 17:45-47"],
    theologyNote:
      "David's declaration centers the Lord's deliverance rather than David's fame, technique, or weapon.",
    gameplayRole: "Anti-Giant",
    representationMode: "Legacy",
    sections: {
      whatTheBibleSays:
        "David tells Goliath that he comes in the name of the Lord of hosts and that the battle belongs to the Lord.",
      whyItIsMysterious:
        "The declaration reframes a public military challenge as a testimony to God's deliverance before Israel and the nations.",
      whyItMattersInGame:
        "The final boss should reward clean Courage, Guard, Faith, and Fear-removal timing so victory feels like faithful play rather than brute force.",
      conversationStarters: [
        "What changes when David says the battle belongs to the Lord?",
        "How can victory feel climactic without making David self-exalting?",
        "Why should clean Courage and Psalm play feel rewarded against Goliath?",
      ],
      interpretiveTraditions:
        "The phrase is often remembered as the heart of the David and Goliath story. The game keeps it reverent and avoids turning it into a catchphrase detached from trust.",
      gameInterpretation:
        "Boss-phase text, victory copy, and anti-Giant cards should point back to covenant courage and divine deliverance.",
    },
  },
  {
    id: "codex-guard-and-shepherd-care",
    title: "Guard and Shepherd Care",
    imagePath: getArtAssetPath("art-shepherds-guard"),
    artworkTitle: "Shepherd's Guard",
    sourceTier: "Scripture",
    references: ["Psalm 23", "1 Samuel 17:34-37"],
    theologyNote:
      "Guard effects express shepherd care, vigilance, and protection rather than invulnerability or spellcasting.",
    gameplayRole: "Defense",
    representationMode: "Legacy",
    sections: {
      whatTheBibleSays:
        "David's shepherd background includes protection from lion and bear, and Psalm 23 frames the Lord's care with shepherd imagery.",
      whyItIsMysterious:
        "A shepherd's work is ordinary and hidden, yet it forms courage before the public crisis.",
      whyItMattersInGame:
        "Guard cards teach the player to read enemy intent, preserve health, and build Courage through patient defense.",
      conversationStarters: [
        "Why should courage include protection before confrontation?",
        "How does shepherd care shape David before the valley?",
        "What does good defense teach a new player about trust and timing?",
      ],
      interpretiveTraditions:
        "Shepherd imagery is often connected with care, guidance, and protection. The game keeps that imagery humble and practical.",
      gameInterpretation:
        "Staff and Sling, Guard the Flock, Cover Behind the Stones, and similar cards should feel steady rather than flashy.",
    },
  },
  {
    id: "codex-psalm-and-prayer",
    title: "Psalm and Prayer",
    imagePath: getArtAssetPath("art-psalm-of-courage"),
    artworkTitle: "Psalm of Courage",
    sourceTier: "Scripture",
    references: ["Psalms", "1 Samuel 16:23", "Psalm 27", "Psalm 34"],
    theologyNote:
      "Psalm and Prayer cards are reverent dependence, worship, lament, and remembrance, not generic magic.",
    gameplayRole: "Prayer",
    representationMode: "Prayer",
    sections: {
      whatTheBibleSays:
        "The Psalms give language for fear, trust, lament, deliverance, and worship. David is also associated with music and the harp in 1 Samuel.",
      whyItIsMysterious:
        "Prayer changes how the heart stands in danger without reducing the Lord's help to a controllable technique.",
      whyItMattersInGame:
        "Psalm and Prayer cards remove Fear, provide Guard, heal, draw, and support clean Courage timing.",
      conversationStarters: [
        "How can prayer be powerful without feeling like a spell?",
        "Why do lament and worship both belong in a battle story?",
        "What should Faith do mechanically in a reverent card battler?",
      ],
      interpretiveTraditions:
        "Davidic psalm traditions shape worship and courage across Jewish and Christian reading.",
      gameInterpretation:
        "Prayer at the Brook, The Lord Delivers, and Psalm cards help David prepare and recover while keeping the focus on faithful dependence.",
    },
  },
  {
    id: "codex-clean-hands",
    title: "Clean Hands",
    sourceTier: "Scripture",
    references: ["Psalm 24:3-4", "Psalm 51"],
    theologyNote:
      "Clean Hands language is about integrity, repentance, and covenant faithfulness, not moral perfection as a power trick.",
    gameplayRole: "Support",
    representationMode: "CovenantMemory",
    sections: {
      whatTheBibleSays:
        "Psalm 24 asks who may ascend the hill of the Lord and speaks of clean hands and a pure heart. Psalm 51 gives language for mercy and cleansing.",
      whyItIsMysterious:
        "Purity in Scripture is relational and covenantal, not simply a resource meter.",
      whyItMattersInGame:
        "Clean Covenant play rewards low Corruption with stronger protection, healing, and card flow while forbidden choices remain costly.",
      conversationStarters: [
        "How can a game reward clean play without sounding self-righteous?",
        "Why should cleansing feel like mercy rather than a loophole?",
        "What makes corruption costly even when a card gives short-term power?",
      ],
      interpretiveTraditions:
        "Clean hands and repentance have been read as worship, integrity, and return to God.",
      gameInterpretation:
        "Clean Hands, Mercy Remembered, Stand in the Promise, and related cards support runs that refuse forbidden shortcuts.",
    },
  },
  {
    id: "codex-philistine-pressure",
    title: "Philistine Pressure",
    sourceTier: "Biblical Inference",
    references: ["1 Samuel 17:1-11", "1 Samuel 5", "1 Samuel 31"],
    theologyNote:
      "Philistine pressure is represented through battle lines, taunts, armor, idols, and intimidation, not as exotic or admirable power.",
    gameplayRole: "Trial",
    representationMode: "Enemy",
    sections: {
      whatTheBibleSays:
        "1 Samuel 17 shows Israel and Philistia facing one another across the valley while Goliath issues his public challenge. Other Samuel passages show Philistine idol contexts and victory displays.",
      whyItIsMysterious:
        "Military pressure, public shame, false worship, and fear all work together before David enters the fight.",
      whyItMattersInGame:
        "The campaign uses raiders, idol standards, armor pressure, and Goliath's taunts to teach target priority and courage under intimidation.",
      conversationStarters: [
        "Why does public intimidation matter before battle begins?",
        "How can idol pressure be shown as false confidence rather than power?",
        "What should the player learn before facing Goliath?",
      ],
      interpretiveTraditions:
        "Philistine opposition is often remembered through the battle line and the false confidence of the champion's challenge.",
      gameInterpretation:
        "Philistine enemies and structures pressure the player with Fear, Guard, and tactical targets while keeping the starter act anchored in 1 Samuel 17.",
    },
  },
  {
    id: "codex-testimony-before-battle",
    title: "Testimony Before Battle",
    imagePath: getArtAssetPath("art-shepherd-david"),
    artworkTitle: "Shepherd David",
    sourceTier: "Scripture",
    references: ["1 Samuel 17:32-37", "Psalm 18"],
    theologyNote:
      "Testimony remembers the Lord's deliverance and forms courage without turning David's past into self-exalting legend.",
    gameplayRole: "Support",
    representationMode: "CovenantMemory",
    sections: {
      whatTheBibleSays:
        "David tells Saul how the Lord delivered him from lion and bear, then trusts that the Lord will deliver him from the Philistine.",
      whyItIsMysterious:
        "The remembered private deliverance becomes public courage at the moment of crisis.",
      whyItMattersInGame:
        "Testimony and Memory cards draw, remove Fear, build Courage, and prepare decisive turns.",
      conversationStarters: [
        "Why does David speak about past deliverance before the battle?",
        "How can testimony strengthen courage without becoming pride?",
        "What should memory do in a roguelike run?",
      ],
      interpretiveTraditions:
        "Readers often see David's testimony as faithful remembrance that prepares him for a larger test.",
      gameInterpretation:
        "Remember the Lion, Testimony Before Saul, Memorial rewards, and covenant memory effects turn past deliverance into run identity.",
    },
  },
  {
    id: "codex-speculative-watcher-layer",
    title: "Speculative Watcher Layer",
    sourceTier: "Speculative Fiction",
    references: ["Genesis 6:1-4", "2 Peter 2:4", "Jude 6"],
    theologyNote:
      "Watcher material is clearly marked as speculative background for later saga development, not as the controlling explanation of David's biblical story.",
    gameplayRole: "Corruption",
    representationMode: "SpeculativeEnemy",
    sections: {
      whatTheBibleSays:
        "Genesis 6:1-4 is brief and mysterious. Later New Testament passages warn about rebellious angels, but these texts do not explain Goliath in 1 Samuel 17.",
      whyItIsMysterious:
        "The passages leave many questions unanswered, which makes them easy to overstate if speculation is not clearly labeled.",
      whyItMattersInGame:
        "The speculative layer gives future campaigns a way to explore spiritual pressure, corruption, forbidden knowledge, and giant legacy without rewriting the starter story.",
      conversationStarters: [
        "What should remain mysterious because Scripture leaves it mysterious?",
        "How can speculative fantasy support reflection without becoming doctrine?",
        "Why should forbidden knowledge feel costly rather than attractive?",
      ],
      interpretiveTraditions:
        "Jewish and Christian traditions have explored Watcher themes in many ways. Covenant: Legacies uses them as fictionally framed pressure, always secondary to Scripture-labeled material.",
      gameInterpretation:
        "War of the Watchers remains a future speculative saga layer. In The Valley of the Giant, Watcher pressure may appear as background or codex material, not the main campaign identity.",
    },
  },
  {
    id: "codex-throne-room-vision",
    title: "Throne Room Vision",
    imagePath: getArtAssetPath("art-throne-room-vision"),
    artworkTitle: "Throne Room Vision",
    sourceTier: "Interpretive Tradition",
    references: ["Isaiah 6", "Ezekiel 1", "Revelation 4-5"],
    theologyNote:
      "Throne-room imagery is handled as reverent vision language, not as a controllable character, collectible power object, or direct visual possession of divine glory.",
    gameplayRole: "Support",
    representationMode: "MysteryEncounter",
    sections: {
      whatTheBibleSays:
        "Scripture records throne-room visions with awe, restraint, worship, judgment, and humility. The texts emphasize God's holiness and the limits of human comprehension.",
      whyItIsMysterious:
        "These passages use symbolic visionary language. Covenant: Legacies treats that mystery with distance and reverence rather than trying to fully visualize or explain it.",
      interpretiveTraditions:
        "Jewish and Christian interpretation has approached these visions through worship, prophetic calling, angelic service, and apocalyptic symbolism, while recognizing that the images are not ordinary scenery.",
      gameInterpretation:
        "This concept art belongs in Gallery and Codex contexts as atmosphere and theological reflection. It is not a playable unit or a direct depiction to be wielded by the player.",
    },
  },
  {
    id: "codex-resurrection-witness",
    title: "The Resurrection Witness",
    imagePath: getArtAssetPath("art-resurrection-empty-tomb"),
    artworkTitle: "The Resurrection Witness",
    sourceTier: "Scripture",
    references: ["Matthew 28", "Luke 24", "John 20", "1 Corinthians 15"],
    theologyNote:
      "The resurrection is presented through reverent witness and testimony, not as a collectible unit, attack effect, or controllable spectacle.",
    gameplayRole: "Support",
    representationMode: "Witness",
    sections: {
      whatTheBibleSays:
        "The Gospels present the empty tomb through witnesses, fear, joy, proclamation, and worship. Paul later centers Christian hope on the resurrection as received testimony.",
      whyItIsMysterious:
        "The resurrection is central, holy, and beyond ordinary game abstraction. The project treats it through testimony and hope rather than direct control.",
      interpretiveTraditions:
        "Christian tradition receives the resurrection as the heart of hope, worship, and proclamation. Any artistic use needs restraint and care.",
      gameInterpretation:
        "This concept remains Gallery and Codex material unless reviewed for a witness or intervention card that avoids making Jesus a player-controlled object.",
    },
  },
  {
    id: "codex-melchizedek",
    title: "Melchizedek",
    sourceTier: "Scripture",
    references: ["Genesis 14:18-20", "Psalm 110:4", "Hebrews 5-7"],
    theologyNote:
      "Melchizedek is presented with reverence as a biblical mystery, not as a character to overdefine.",
    gameplayRole: "Support",
    representationMode: "MysteryEncounter",
    sections: {
      whatTheBibleSays:
        "Genesis presents Melchizedek as king of Salem and priest of God Most High, bringing bread and wine and blessing Abram. Psalm 110 speaks of a priest forever according to his order, and Hebrews reflects deeply on that priestly order.",
      whyItIsMysterious:
        "Scripture gives him a striking role but very little biography. His sudden appearance, priestly authority, royal title, and later theological importance make him one of Scripture's most mysterious figures.",
      interpretiveTraditions:
        "Jewish and Christian traditions have treated Melchizedek as a profound figure of priesthood, kingship, blessing, and typology, while differing on how much can be concluded beyond the biblical text.",
      gameInterpretation:
        "In Covenant: Legacies, Melchizedek-related cards are holy mystery cards focused on blessing, covenant authority, provision, and reverent restraint.",
    },
  },
  {
    id: "codex-medium-at-endor",
    title: "The Medium at Endor",
    sourceTier: "Scripture",
    references: ["1 Samuel 28"],
    theologyNote:
      "This entry treats the Endor account as a tragic warning about fear, disobedience, and forbidden counsel.",
    gameplayRole: "Trial",
    representationMode: "ForbiddenWarning",
    sections: {
      whatTheBibleSays:
        "1 Samuel 28 recounts Saul seeking a medium at Endor after he no longer receives an answer from the Lord. The episode is dark, fearful, and bound to Saul's judgment.",
      whyItIsMysterious:
        "The account raises difficult questions about what happened, why it was permitted, and how to understand the appearance and message in the narrative.",
      interpretiveTraditions:
        "Interpreters have debated the nature of the event, but faithful readings consistently recognize the passage as tragic and forbidden rather than exemplary.",
      gameInterpretation:
        "In Covenant: Legacies, Endor-related cards are burdens, warnings, or costly forbidden-knowledge effects. They are never framed as admirable occult power.",
    },
  },
  {
    id: "codex-forbidden-knowledge",
    title: "Forbidden Knowledge",
    sourceTier: "Scripture",
    references: ["Genesis 3", "Genesis 6:1-4", "Deuteronomy 18:9-14", "1 Samuel 28"],
    theologyNote:
      "Forbidden knowledge is represented as corrupting, fear-driven, and spiritually dangerous.",
    gameplayRole: "Corruption",
    representationMode: "ForbiddenWarning",
    sections: {
      whatTheBibleSays:
        "Scripture repeatedly warns against grasping after knowledge or counsel outside faithful obedience to God.",
      whyItIsMysterious:
        "Some biblical passages hint at hidden powers, forbidden practices, and unseen rebellion without satisfying curiosity about them.",
      interpretiveTraditions:
        "Interpretive traditions often connect forbidden knowledge with pride, rebellion, divination, illicit power, and the refusal to trust God's revealed word.",
      gameInterpretation:
        "Forbidden Knowledge cards may draw cards or reveal information, but they add Corruption, Fear, or burdens so the design itself warns the player.",
    },
  },
  {
    id: "codex-discernment",
    title: "Discernment",
    sourceTier: "Scripture",
    references: ["1 Corinthians 12", "Hebrews 5:14"],
    theologyNote:
      "Discernment is framed as faithful wisdom and trained moral perception.",
    gameplayRole: "Support",
    representationMode: "Prayer",
    sections: {
      whatTheBibleSays:
        "1 Corinthians names discernment among spiritual gifts, and Hebrews describes mature believers trained to distinguish good from evil.",
      whyItIsMysterious:
        "Discernment involves wisdom, spiritual perception, maturity, and faithful judgment, but it is not reducible to mere information.",
      interpretiveTraditions:
        "Christian traditions often treat discernment as both a gift and a cultivated habit shaped by Scripture, prayer, holiness, and wise counsel.",
      gameInterpretation:
        "Discernment removes Fear, deception, or hidden traps. It is the faithful alternative to forbidden consultation.",
    },
  },
  {
    id: "codex-mystery-encounters",
    title: "Mystery Encounters",
    sourceTier: "Speculative Fiction",
    references: ["Genesis 14", "Psalm 110", "Hebrews 5-7", "1 Samuel 28"],
    theologyNote:
      "Mystery encounters are designed as conversation starters, with Scripture-labeled material kept distinct from interpretation and fictional gameplay.",
    gameplayRole: "Map Node",
    representationMode: "MysteryEncounter",
    sections: {
      whatTheBibleSays:
        "Some passages introduce mysterious figures or events with theological weight and limited explanation.",
      whyItIsMysterious:
        "These moments invite humility. They are memorable partly because Scripture does not answer every question readers might ask.",
      interpretiveTraditions:
        "Traditions may explore these passages through typology, cautionary reading, moral warning, or theological reflection.",
      gameInterpretation:
        "Covenant: Legacies uses Mystery Encounters to invite reflection, reward reverent choices, and mark forbidden choices with visible spiritual cost.",
    },
  },
];
