import type { CodexLoreEntry } from "@/types/game";
import { getArtAssetPath } from "@/data/artAssets";

export const codexEntries: CodexLoreEntry[] = [
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
