import Image from "next/image";
import { cards } from "@/data/cards";
import { codexEntries } from "@/data/codexEntries";
import { encounters } from "@/data/encounters";
import { enemies } from "@/data/enemies";
import { memorials } from "@/data/memorials";
import { mysteryEncounters } from "@/data/mysteryEncounters";
import { ScreenFrame } from "@/components/ScreenFrame";
import {
  ContentPanel,
  DetailPanel,
  EmptyState,
  PageHeader,
  PageLayout,
  PillTag,
  ScrollPanel,
  StatusBadge,
} from "@/components/UiPrimitives";
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
      <PageLayout className="codex-screen" variant="archive">
        <DetailPanel className="codex-summary-panel">
          <div>
            <PageHeader
              copy="Source tiers, references, theology notes, and conversation starters remain visibly distinct."
              eyebrow="Codex"
              title="Scripture and lore record."
            />
            <div className="codex-tier-list">
              {["Scripture", "Biblical Inference", "Interpretive Tradition", "Speculative Fiction"].map(
                (tier) => (
                  <StatusBadge key={tier} tone={getSourceTierTone(tier)}>
                    {tier}
                  </StatusBadge>
                ),
              )}
            </div>
          </div>

          <div className="codex-memorial-panel">
            <PillTag tone="gold">Raised Memorials</PillTag>
            <p>
              {runMemorials.length > 0
                ? runMemorials.map((memorial) => memorial.name).join("; ")
                : "No Memorials raised in this run yet."}
            </p>
          </div>
        </DetailPanel>

        <ContentPanel className="codex-archive-panel">
          <div className="codex-archive-header">
            <PillTag tone="gold">Archive</PillTag>
            <PillTag>{visibleEntries.length} Entries</PillTag>
          </div>

          <ScrollPanel className="codex-entry-scroll">
            {visibleEntries.length === 0 ? (
              <EmptyState
                body="No codex entries are visible for this run state."
                title="No Entries"
              />
            ) : (
              <div className="codex-entry-grid">
                {visibleEntries.map((entry) => (
                  <article
                    className="codex-entry-card"
                    key={`${entry.category}-${entry.id}`}
                  >
                    <div className="codex-entry-heading">
                      <div>
                        <div className="codex-entry-tags">
                          <PillTag tone="gold">{entry.category}</PillTag>
                          <StatusBadge tone={getSourceTierTone(entry.sourceTier)}>
                            {entry.sourceTier}
                          </StatusBadge>
                        </div>
                        <h3>{entry.name}</h3>
                      </div>
                      <PillTag>{entry.gameplayRole}</PillTag>
                    </div>
                    <p className="codex-theology-note">{entry.theologyNote}</p>
                    {entry.category === "Codex" && entry.imagePath && (
                      <div
                        className="codex-entry-art"
                        aria-label={entry.artworkTitle ?? entry.name}
                      >
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
                    <div className="codex-detail-list">
                      {entry.details.map((detail) => (
                        <div key={detail.label}>
                          <p>{detail.label}</p>
                          <span>{detail.value}</span>
                        </div>
                      ))}
                      <div>
                        <p>References</p>
                        <span>{entry.references.join("; ")}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </ScrollPanel>
        </ContentPanel>
      </PageLayout>
    </ScreenFrame>
  );
}

function getSourceTierTone(
  sourceTier: string,
): "gold" | "sacred" | "danger" | "muted" {
  if (sourceTier === "Scripture") {
    return "gold";
  }

  if (sourceTier === "Biblical Inference") {
    return "sacred";
  }

  if (sourceTier === "Speculative Fiction") {
    return "danger";
  }

  return "muted";
}
