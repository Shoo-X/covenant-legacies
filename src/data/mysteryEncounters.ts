import type { MysteryEncounter } from "@/types/game";

export const mysteryEncounters: MysteryEncounter[] = [
  {
    id: "mystery-five-smooth-stones",
    name: "The Five Smooth Stones",
    encounterType: "MysteryEncounter",
    tone: "Quiet, Scripture-rooted, preparatory",
    scene:
      "David comes to the brook before the battle line and chooses five smooth stones for his shepherd's pouch. The valley is loud with threats, but the preparation is small, deliberate, and faithful.",
    sourceTier: "Scripture",
    references: ["1 Samuel 17:40"],
    theologyNote:
      "The stones are presented as prepared obedience before the Lord, not sacred objects or magical weapons.",
    gameplayRole: "Support",
    representationMode: "MysteryEncounter",
    choices: [
      {
        id: "choose-carefully",
        label: "Choose Carefully",
        description:
          "Take time at the brook, weighing the stone before the valley demands it.",
        effectSummary:
          "Upgrade Sling Stone if possible. Otherwise add Smooth Stone+ to the run deck.",
        upgradeCardId: "card-sling-stone",
        fallbackAddCardId: "card-smooth-stone",
        fallbackUpgradeCardId: "card-smooth-stone",
      },
      {
        id: "pray-before-the-brook",
        label: "Pray Before the Brook",
        description:
          "Let the noise of the champion fall behind a quieter act of trust.",
        effectSummary: "Gain 1 Faith and remove Fear.",
        removeFear: true,
        resourceChanges: {
          faith: 1,
        },
      },
      {
        id: "hurry-to-the-battle",
        label: "Hurry to the Battle",
        description:
          "Rise from the brook and run toward the battle line before fear settles in.",
        effectSummary: "Gain 2 Resolve for the next combat.",
        resourceChanges: {
          resolve: 2,
        },
      },
    ],
  },
  {
    id: "mystery-king-priest-of-salem",
    name: "The King-Priest of Salem",
    encounterType: "MysteryEncounter",
    tone: "Reverent, mysterious, holy",
    scene:
      "After battle, a king-priest comes from Salem with bread and wine, blessing the Champion in the name of God Most High.",
    sourceTier: "Scripture",
    references: ["Genesis 14", "Psalm 110", "Hebrews 5-7"],
    theologyNote:
      "This encounter invites reflection on a mysterious biblical figure without overexplaining the text.",
    gameplayRole: "Support",
    representationMode: "MysteryEncounter",
    choices: [
      {
        id: "receive-the-blessing",
        label: "Receive the Blessing",
        description:
          "Bow beneath the blessing spoken in the name of God Most High.",
        effectSummary:
          "Gain 2 Faith, remove 1 Corruption, and add Blessing of the Most High.",
        addCardId: "card-blessing-of-the-most-high",
        resourceChanges: {
          faith: 2,
          corruption: -1,
        },
      },
      {
        id: "offer-the-tenth",
        label: "Offer the Tenth",
        description:
          "Give from what was won, refusing to let victory become possession.",
        effectSummary:
          "Lose 1 Authority as the current offering resource and upgrade two Covenant cards.",
        resourceChanges: {
          authority: -1,
        },
        upgradeCovenantCards: 2,
      },
      {
        id: "ask-of-his-order",
        label: "Ask of His Order",
        description:
          "Ask what may be asked, and leave room for mystery where Scripture leaves mystery.",
        effectSummary:
          "Unlock the codex entry and add Order of the King-Priest to future rewards.",
        addRewardPoolCardId: "card-order-of-the-king-priest",
        unlockCodexEntryId: "mystery-king-priest-of-salem",
      },
    ],
  },
  {
    id: "mystery-medium-at-endor",
    name: "The Medium at Endor",
    encounterType: "ForbiddenMysteryEncounter",
    tone: "Haunting, forbidden, tragic, cautionary",
    scene:
      "In the dark before battle, a hidden voice offers forbidden knowledge to a fearful heart.",
    cautionNote:
      "This encounter is a warning about fear, disobedience, and forbidden counsel. It is not an endorsement of occult practice.",
    sourceTier: "Scripture",
    references: ["1 Samuel 28"],
    theologyNote:
      "The scene is treated as tragic and cautionary, emphasizing refusal, repentance, and the danger of seeking forbidden counsel.",
    gameplayRole: "Trial",
    representationMode: "ForbiddenWarning",
    choices: [
      {
        id: "refuse-forbidden-counsel",
        label: "Refuse the Forbidden Counsel",
        description:
          "Reject the voice and stand under lawful authority rather than fear.",
        effectSummary: "Gain 1 Authority, remove Fear, and add Discernment.",
        addCardId: "card-discernment",
        removeFear: true,
        resourceChanges: {
          authority: 1,
        },
      },
      {
        id: "seek-an-answer",
        label: "Seek an Answer",
        description:
          "A fearful heart reaches past the boundary and receives dread, not peace.",
        effectSummary:
          "Reveal the next 3 map nodes, gain 3 Corruption, and add Dread Pronouncement.",
        addCardId: "card-dread-pronouncement",
        revealMapNodes: 3,
        resourceChanges: {
          corruption: 3,
        },
      },
      {
        id: "repent-and-depart",
        label: "Repent and Depart",
        description:
          "Turn away before the counsel takes root, accepting weakness over rebellion.",
        effectSummary:
          "Lose 1 temporary Resolve and remove 2 Corruption.",
        resourceChanges: {
          resolve: -1,
          corruption: -2,
        },
      },
    ],
  },
];
