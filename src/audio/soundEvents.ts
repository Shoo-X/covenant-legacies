export const soundEvents = {
  ui: {
    hover: "ui.hover",
    click: "ui.click",
    confirm: "ui.confirm",
    cancel: "ui.cancel",
    disabled: "ui.disabled",
  },
  card: {
    hover: "card.hover",
    draw: "card.draw",
    play: "card.play",
    discard: "card.discard",
    upgrade: "card.upgrade",
    cleanse: "card.cleanse",
  },
  combat: {
    battleStart: "combat.battleStart",
    attack: {
      light: "combat.attack.light",
      heavy: "combat.attack.heavy",
      sling: "combat.attack.sling",
    },
    block: "combat.block",
    damage: "combat.damage",
    heal: "combat.heal",
    blessing: "combat.blessing",
    enemyIntent: "combat.enemyIntent",
    victory: "combat.victory",
    defeat: "combat.defeat",
    defeatAlt: "combat.defeatAlt",
  },
  campaign: {
    mapOpen: "campaign.mapOpen",
    nodeSelect: "campaign.nodeSelect",
    nodeBattle: "campaign.nodeBattle",
    nodeRest: "campaign.nodeRest",
    nodeMystery: "campaign.nodeMystery",
    nodeMysteryAlt: "campaign.nodeMysteryAlt",
    nodeReward: "campaign.nodeReward",
    nodeUpgrade: "campaign.nodeUpgrade",
    nodeCleanse: "campaign.nodeCleanse",
    giantStomp: "campaign.giantStomp",
    giantPresence: "campaign.giantPresence",
    presenceCue: "campaign.presenceCue",
  },
  ambience: {
    valleyWind: "ambience.valleyWind",
    campfire: "ambience.campfire",
    battlefield: "ambience.battlefield",
  },
  music: {
    mainTheme: "music.mainTheme",
    campaignMap: "music.campaignMap",
    combat: "music.combat",
  },
} as const;

export type SoundEventName =
  | "ui.hover"
  | "ui.click"
  | "ui.confirm"
  | "ui.cancel"
  | "ui.disabled"
  | "card.hover"
  | "card.draw"
  | "card.play"
  | "card.discard"
  | "card.upgrade"
  | "card.cleanse"
  | "combat.battleStart"
  | "combat.attack.light"
  | "combat.attack.heavy"
  | "combat.attack.sling"
  | "combat.block"
  | "combat.damage"
  | "combat.heal"
  | "combat.blessing"
  | "combat.enemyIntent"
  | "combat.victory"
  | "combat.defeat"
  | "combat.defeatAlt"
  | "campaign.mapOpen"
  | "campaign.nodeSelect"
  | "campaign.nodeBattle"
  | "campaign.nodeRest"
  | "campaign.nodeMystery"
  | "campaign.nodeMysteryAlt"
  | "campaign.nodeReward"
  | "campaign.nodeUpgrade"
  | "campaign.nodeCleanse"
  | "campaign.giantStomp"
  | "campaign.giantPresence"
  | "campaign.presenceCue"
  | "ambience.valleyWind"
  | "ambience.campfire"
  | "ambience.battlefield"
  | "music.mainTheme"
  | "music.campaignMap"
  | "music.combat";
