import Image from "next/image";
import { cards } from "@/data/cards";
import { codexEntries } from "@/data/codexEntries";
import { encounters } from "@/data/encounters";
import { enemies } from "@/data/enemies";
import { memorials } from "@/data/memorials";
import { mysteryEncounters } from "@/data/mysteryEncounters";
import { GamePanel } from "@/components/GamePanel";
import { ScreenFrame } from "@/components/ScreenFrame";
import { formatCardCost } from "@/game/cardText";
import type { Memorial, SourceBackedContent } from "@/types/game";

type CodexEntry = SourceBackedContent & {
  id: string;
  name: string;
  category: string;
  imagePath?: string;
  artworkTitle?: string;
  details: Array<{
    label: string;
    value: string;
  }>;
};

const entries: CodexEntry[] = [
  ...cards.map((card) => ({
    ...card,
    category: "Card",
    details: [
      { label: "Type", value: card.type },
      { label: "Cost", value: formatCardCost(card) },
      { label: "Effect", value: card.text },
      {
        label: "Archetypes",
        value: card.archetypeTags?.length ? card.archetypeTags.join(", ") : "None",
      },
      { label: "Synergy", value: card.synergyNotes ?? "No synergy note yet." },
      {
        label: "Upgrade",
        value: card.upgradedVersion ?? card.upgradeId ?? "No upgrade defined yet.",
      },
    ],
  })),
  ...enemies.map((enemy) => ({
    ...enemy,
    category: "Enemy",
    details: [
      { label: "Traits", value: enemy.traits.join(", ") },
      { label: "Health", value: `${enemy.maxHealth}` },
      { label: "Intent", value: enemy.intent },
      ...(enemy.mechanics
        ? [{ label: "Mechanics", value: enemy.mechanics.join(" ") }]
        : []),
    ],
  })),
  ...encounters.map((encounter) => ({
    ...encounter,
    category: "Encounter",
    details: [
      { label: "Node", value: encounter.nodeType },
      { label: "Region", value: encounter.region },
      { label: "Reward", value: encounter.rewardPreview },
      ...(encounter.description
        ? [{ label: "Encounter Intro", value: encounter.description }]
        : []),
      ...(encounter.conversationStarter
        ? [
            {
              label: "Bible Conversation Starter",
              value: encounter.conversationStarter,
            },
          ]
        : []),
      ...(encounter.codexEntryIds?.length
        ? [
            {
              label: "Codex Links",
              value: encounter.codexEntryIds
                .map((entryId) => {
                  const entry = codexEntries.find(
                    (candidate) => candidate.id === entryId,
                  );

                  return entry?.title ?? entryId;
                })
                .join("; "),
            },
          ]
        : []),
    ],
  })),
  ...mysteryEncounters.map((encounter) => ({
    ...encounter,
    category: "Mystery",
    details: [
      { label: "Type", value: encounter.encounterType },
      { label: "Tone", value: encounter.tone },
      { label: "Scene", value: encounter.scene },
      ...(encounter.cautionNote
        ? [{ label: "Caution", value: encounter.cautionNote }]
        : []),
    ],
  })),
  ...memorials.map((memorial) => ({
    ...memorial,
    category: "Memorial",
    details: [
      { label: "Rarity", value: memorial.rarity },
      { label: "Effect", value: memorial.effectText },
    ],
  })),
  ...codexEntries.map((entry) => ({
    ...entry,
    name: entry.title,
    category: "Codex",
    details: [
      { label: "What Scripture Says", value: entry.sections.whatTheBibleSays },
      {
        label: entry.sections.whyItMattersInGame
          ? "Why It Matters in the Game"
          : "Why It Is Mysterious",
        value:
          entry.sections.whyItMattersInGame ??
          entry.sections.whyItIsMysterious,
      },
      ...(entry.sections.conversationStarters?.length
        ? [
            {
              label: "Conversation Starters",
              value: entry.sections.conversationStarters.join(" "),
            },
          ]
        : []),
      {
        label: "Interpretive Traditions",
        value: entry.sections.interpretiveTraditions,
      },
      { label: "Game Interpretation", value: entry.sections.gameInterpretation },
    ],
  })),
];

interface CodexScreenProps {
  runMemorials?: Memorial[];
  unlockedCodexEntryIds?: string[];
}

export function CodexScreen({
  runMemorials = [],
  unlockedCodexEntryIds = [],
}: CodexScreenProps) {
  const visibleEntries = entries.filter(
    (entry) =>
      entry.category !== "Mystery" ||
      entry.id === "mystery-medium-at-endor" ||
      unlockedCodexEntryIds.includes(entry.id),
  );

  return (
    <ScreenFrame>
      <div className="grid h-full min-h-0 gap-3 xl:grid-cols-[0.34fr_0.66fr]">
        <GamePanel className="flex min-h-0 flex-col justify-between p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">
              Codex
            </p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-[#fff3cf] md:text-5xl">
              Scripture and lore record.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[rgba(241,228,194,0.7)]">
              Source tiers, references, theology notes, and conversation
              starters remain visibly distinct.
            </p>
          </div>

      {runMemorials.length > 0 && (
        <div className="mt-4 rounded-lg border border-[rgba(215,180,93,0.18)] bg-[rgba(255,255,255,0.04)] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-gold)]">
            Raised Memorials
          </p>
          <p className="mt-2 text-sm leading-6 text-[rgba(241,228,194,0.72)]">
            {runMemorials.map((memorial) => memorial.name).join("; ")}
          </p>
        </div>
      )}
        </GamePanel>

        <GamePanel className="flex h-full min-h-0 flex-col p-4">
          <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-gold)]">
              Archive
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-[rgba(241,228,194,0.48)]">
              {visibleEntries.length} Entries
            </p>
          </div>
          <div className="game-scroll min-h-0 flex-1 pr-1">
      <div className="grid gap-4 lg:grid-cols-2">
        {visibleEntries.map((entry) => (
          <article
            className="rounded-lg border border-[rgba(215,180,93,0.18)] bg-[rgba(255,255,255,0.045)] p-5"
            key={`${entry.category}-${entry.id}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-gold)]">
                  {entry.category} / {entry.sourceTier}
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-[#fff3cf]">
                  {entry.name}
                </h3>
              </div>
              <span className="rounded-md border border-[rgba(215,180,93,0.22)] px-3 py-2 text-sm text-[rgba(241,228,194,0.72)]">
                {entry.gameplayRole}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[rgba(241,228,194,0.7)]">
              {entry.theologyNote}
            </p>
            {entry.category === "Codex" && entry.imagePath && (
              <div className="codex-entry-art" aria-label={entry.artworkTitle ?? entry.name}>
                <Image
                  alt={entry.artworkTitle ?? entry.name}
                  className="card-artwork-image"
                  fill
                  sizes="(max-width: 900px) 90vw, 300px"
                  src={entry.imagePath}
                />
                <div className="card-artwork-vignette" aria-hidden="true" />
              </div>
            )}
            <div className="mt-4 grid gap-3">
              {entry.details.map((detail) => (
                <div key={detail.label}>
                  <p className="text-xs uppercase tracking-[0.18em] text-[rgba(241,228,194,0.48)]">
                    {detail.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[rgba(241,228,194,0.7)]">
                    {detail.value}
                  </p>
                </div>
              ))}
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[rgba(241,228,194,0.48)]">
                  References
                </p>
                <p className="mt-1 text-sm text-[rgba(241,228,194,0.7)]">
                  {entry.references.join("; ")}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
          </div>
        </GamePanel>
      </div>
    </ScreenFrame>
  );
}
