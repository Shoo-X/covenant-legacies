import type { SoundEventName } from "@/audio/soundEvents";

export type AudioChannel = "sfx" | "music" | "ambience";

export interface AudioManifestEntry {
  channel: AudioChannel;
  cooldownMs?: number;
  loop?: boolean;
  src: string;
  volume?: number;
}

export const audioManifest = {
  "ui.hover": { channel: "sfx", cooldownMs: 80, src: "/audio/ui/hover.wav", volume: 0.26 },
  "ui.click": { channel: "sfx", cooldownMs: 45, src: "/audio/ui/click.wav", volume: 0.38 },
  "ui.confirm": { channel: "sfx", cooldownMs: 80, src: "/audio/ui/confirm.wav", volume: 0.48 },
  "ui.cancel": { channel: "sfx", cooldownMs: 100, src: "/audio/ui/cancel.wav", volume: 0.36 },
  "ui.disabled": { channel: "sfx", cooldownMs: 180, src: "/audio/ui/disabled.wav", volume: 0.28 },

  "card.hover": { channel: "sfx", cooldownMs: 95, src: "/audio/cards/hover.wav", volume: 0.24 },
  "card.draw": { channel: "sfx", cooldownMs: 80, src: "/audio/cards/draw.wav", volume: 0.42 },
  "card.play": { channel: "sfx", cooldownMs: 80, src: "/audio/cards/play.wav", volume: 0.52 },
  "card.discard": { channel: "sfx", cooldownMs: 120, src: "/audio/cards/discard.wav", volume: 0.36 },
  "card.upgrade": { channel: "sfx", cooldownMs: 160, src: "/audio/cards/upgrade.wav", volume: 0.5 },
  "card.cleanse": { channel: "sfx", cooldownMs: 180, src: "/audio/cards/cleanse.wav", volume: 0.48 },

  "combat.battleStart": { channel: "sfx", cooldownMs: 220, src: "/audio/combat/battle-start.wav", volume: 0.55 },
  "combat.attack.light": { channel: "sfx", cooldownMs: 80, src: "/audio/combat/attack-light.wav", volume: 0.46 },
  "combat.attack.heavy": { channel: "sfx", cooldownMs: 140, src: "/audio/combat/attack-heavy.wav", volume: 0.62 },
  "combat.attack.sling": { channel: "sfx", cooldownMs: 110, src: "/audio/combat/attack-sling.wav", volume: 0.58 },
  "combat.block": { channel: "sfx", cooldownMs: 95, src: "/audio/combat/block.wav", volume: 0.5 },
  "combat.damage": { channel: "sfx", cooldownMs: 95, src: "/audio/combat/damage.wav", volume: 0.54 },
  "combat.heal": { channel: "sfx", cooldownMs: 160, src: "/audio/combat/heal.wav", volume: 0.44 },
  "combat.blessing": { channel: "sfx", cooldownMs: 160, src: "/audio/combat/blessing.wav", volume: 0.46 },
  "combat.enemyIntent": { channel: "sfx", cooldownMs: 160, src: "/audio/combat/enemy-intent.wav", volume: 0.42 },
  "combat.victory": { channel: "sfx", cooldownMs: 400, src: "/audio/combat/victory.wav", volume: 0.66 },
  "combat.defeat": { channel: "sfx", cooldownMs: 400, src: "/audio/combat/defeat.wav", volume: 0.58 },

  "campaign.mapOpen": { channel: "sfx", cooldownMs: 250, src: "/audio/campaign/map-open.wav", volume: 0.38 },
  "campaign.nodeSelect": { channel: "sfx", cooldownMs: 120, src: "/audio/campaign/node-select.wav", volume: 0.34 },
  "campaign.nodeBattle": { channel: "sfx", cooldownMs: 180, src: "/audio/campaign/node-battle.wav", volume: 0.5 },
  "campaign.nodeRest": { channel: "sfx", cooldownMs: 180, src: "/audio/campaign/node-rest.wav", volume: 0.4 },
  "campaign.nodeMystery": { channel: "sfx", cooldownMs: 180, src: "/audio/campaign/node-mystery.wav", volume: 0.42 },
  "campaign.nodeReward": { channel: "sfx", cooldownMs: 180, src: "/audio/campaign/node-reward.wav", volume: 0.46 },
  "campaign.nodeUpgrade": { channel: "sfx", cooldownMs: 180, src: "/audio/campaign/node-upgrade.wav", volume: 0.46 },
  "campaign.nodeCleanse": { channel: "sfx", cooldownMs: 180, src: "/audio/campaign/node-cleanse.wav", volume: 0.44 },
  "campaign.giantStomp": { channel: "sfx", cooldownMs: 450, src: "/audio/campaign/giant-stomp.wav", volume: 0.62 },

  "ambience.valleyWind": {
    channel: "ambience",
    cooldownMs: 500,
    loop: true,
    src: "/audio/ambience/valley-wind-placeholder.wav",
    volume: 0.08,
  },
  "ambience.campfire": {
    channel: "ambience",
    cooldownMs: 500,
    loop: true,
    src: "/audio/ambience/campfire-placeholder.wav",
    volume: 0.08,
  },
  "ambience.battlefield": {
    channel: "ambience",
    cooldownMs: 500,
    loop: true,
    src: "/audio/ambience/battlefield-placeholder.wav",
    volume: 0.08,
  },

  "music.mainTheme": {
    channel: "music",
    cooldownMs: 500,
    loop: true,
    src: "/audio/music/main-theme-placeholder.wav",
    volume: 0.05,
  },
  "music.campaignMap": {
    channel: "music",
    cooldownMs: 500,
    loop: true,
    src: "/audio/music/campaign-map-placeholder.wav",
    volume: 0.05,
  },
  "music.combat": {
    channel: "music",
    cooldownMs: 500,
    loop: true,
    src: "/audio/music/combat-placeholder.wav",
    volume: 0.05,
  },
} satisfies Record<SoundEventName, AudioManifestEntry>;
