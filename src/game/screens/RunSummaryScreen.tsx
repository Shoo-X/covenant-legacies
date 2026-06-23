"use client";

import { useEffect, useRef, useState } from "react";
import { ScreenFrame } from "@/components/ScreenFrame";
import {
  ContentPanel,
  DetailPanel,
  EmptyState,
  PageHeader,
  PillTag,
  PrimaryButton,
  ScrollPanel,
  SecondaryButton,
  StatChip,
  TertiaryButton,
} from "@/components/UiPrimitives";
import { starterCampaign } from "@/data/campaigns";
import type {
  FinalizedRunOutcome,
  FinalizedRunSummary,
  SummaryCountedEntity,
  SummaryDeckCard,
  SummaryEncounterRef,
} from "@/game/runSummary";

interface RunSummaryScreenProps {
  onBeginNewSeed: () => void;
  onReplaySeed: (seed: string) => void;
  onReturnHome: () => void;
  summary?: FinalizedRunSummary;
}

export function RunSummaryScreen({
  onBeginNewSeed,
  onReplaySeed,
  onReturnHome,
  summary,
}: RunSummaryScreenProps) {
  const headingRef = useRef<HTMLSpanElement>(null);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    headingRef.current?.focus();
  }, [summary?.runId]);

  if (!summary) {
    return (
      <ScreenFrame>
        <div className="run-summary-empty">
          <EmptyState
            action={<PrimaryButton onClick={onReturnHome}>Return Home</PrimaryButton>}
            body="No finalized run summary is available yet."
            title="Run Summary"
          />
        </div>
      </ScreenFrame>
    );
  }

  const copySeed = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      setCopyMessage("Copy is unavailable in this browser.");
      return;
    }

    try {
      await navigator.clipboard.writeText(summary.runSeed);
      setCopyMessage("Seed copied.");
    } catch {
      setCopyMessage("Seed could not be copied.");
    }
  };

  return (
    <ScreenFrame>
      <div className="run-summary-screen">
        <ContentPanel className="run-summary-hero-panel">
          <PageHeader
            actions={
              <>
                <PrimaryButton onClick={() => onReplaySeed(summary.runSeed)}>
                  Replay This Seed
                </PrimaryButton>
                <SecondaryButton onClick={onBeginNewSeed}>
                  Begin With New Seed
                </SecondaryButton>
                <TertiaryButton onClick={onReturnHome}>Return Home</TertiaryButton>
              </>
            }
            copy={getOutcomeCopy(summary.outcome)}
            eyebrow={starterCampaign.campaignLabel}
            title={
              <span ref={headingRef} tabIndex={-1}>
                {getOutcomeTitle(summary.outcome)}
              </span>
            }
          />
          <div className="run-summary-identity">
            <IdentityRow label="Campaign" value={`${starterCampaign.campaignName} / ${starterCampaign.biblicalAnchor}`} />
            <IdentityRow label="Hero" value={summary.hero.name} />
            <IdentityRow label="Outcome" value={getOutcomeTitle(summary.outcome)} />
            <div className="run-summary-seed-row">
              <IdentityRow label="Seed" value={summary.runSeed} />
              <SecondaryButton onClick={copySeed}>Copy Seed</SecondaryButton>
            </div>
            <p aria-live="polite" className="run-summary-copy-status">
              {copyMessage}
            </p>
          </div>
        </ContentPanel>

        <ScrollPanel className="run-summary-body">
          <section className="run-summary-section">
            <SectionTitle eyebrow="Journey" title="Path Through the Valley" />
            <JourneyList
              lastEncounter={summary.lastEncounter}
              path={summary.encounterPath}
            />
          </section>

          <section className="run-summary-section">
            <SectionTitle eyebrow="Run Metrics" title="What Was Known" />
            <div className="run-summary-stat-grid">
              <OptionalStat label="Encounters Completed" value={summary.encountersCompleted} />
              <OptionalStat label="Combat Victories" value={summary.combatVictories} />
              <OptionalStat label="Final Health" value={summary.finalHealth} />
              <OptionalStat label="Final Deck Size" value={summary.finalDeckCardCount} />
              <OptionalStat label="Memorials Held" value={summary.finalMemorials?.length} />
              <OptionalStat label="Boss Reached" value={formatBoolean(summary.bossReached)} />
              <OptionalStat label="Boss Completed" value={formatBoolean(summary.bossCompleted)} />
            </div>
            {summary.finalResources && (
              <div className="run-summary-resource-row">
                <PillTag>Resolve {summary.finalResources.resolve}</PillTag>
                <PillTag>Faith {summary.finalResources.faith}</PillTag>
                <PillTag>Wisdom {summary.finalResources.wisdom}</PillTag>
                <PillTag>Authority {summary.finalResources.authority}</PillTag>
                <PillTag tone="corruption">
                  Corruption {summary.finalResources.corruption}
                </PillTag>
              </div>
            )}
          </section>

          <section className="run-summary-section">
            <SectionTitle eyebrow="Deck Changes" title="Cards Changed During the Run" />
            {summary.dataStatus.deckChanges === "complete" ? (
              <div className="run-summary-change-grid">
                <EntityList emptyText="No gained cards recorded." items={summary.cardsGained} title="Gained" />
                <EntityList emptyText="No removed cards recorded." items={summary.cardsRemoved} title="Removed" />
                <EntityList emptyText="No upgraded card families recorded." items={summary.cardsUpgraded} title="Upgraded Card Families" />
              </div>
            ) : (
              <p className="run-summary-muted">
                Detailed deck changes were not recorded for this earlier run.
              </p>
            )}
          </section>

          <section className="run-summary-section">
            <SectionTitle eyebrow="Final Deck" title="Cards at Run End" />
            <DeckList cards={summary.finalDeck} fallbackCount={summary.finalDeckCardCount} />
          </section>

          <section className="run-summary-section">
            <SectionTitle eyebrow="Memorials" title="Held at Run End" />
            <EntityList emptyText="No Memorials held at run end." items={summary.finalMemorials} />
          </section>

          {summary.dataStatus.migrated && (
            <DetailPanel className="run-summary-legacy-note">
              This record was migrated from an earlier profile shape. Missing
              details are intentionally left unavailable rather than treated as
              zero.
            </DetailPanel>
          )}
        </ScrollPanel>
      </div>
    </ScreenFrame>
  );
}

function IdentityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="run-summary-identity-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="run-summary-section-title">
      <p className="ui-kicker">{eyebrow}</p>
      <h2>{title}</h2>
    </div>
  );
}

function JourneyList({
  lastEncounter,
  path,
}: {
  lastEncounter?: SummaryEncounterRef;
  path?: SummaryEncounterRef[];
}) {
  const journey =
    path && path.length > 0
      ? path
      : lastEncounter
        ? [lastEncounter]
        : [];

  if (journey.length === 0) {
    return <p className="run-summary-muted">The encounter path is unavailable for this record.</p>;
  }

  return (
    <ol className="run-summary-journey-list">
      {journey.map((encounter) => (
        <li key={`${encounter.id}:${encounter.status}`}>
          <span>{encounter.name}</span>
          <PillTag tone={encounter.isBoss ? "gold" : "muted"}>
            {encounter.isBoss ? "Boss" : formatEncounterStatus(encounter.status)}
          </PillTag>
          {encounter.isBoss && (
            <PillTag>{formatEncounterStatus(encounter.status)}</PillTag>
          )}
        </li>
      ))}
    </ol>
  );
}

function OptionalStat({
  label,
  value,
}: {
  label: string;
  value: number | string | undefined;
}) {
  if (value === undefined) {
    return null;
  }

  return <StatChip label={label} value={value} />;
}

function EntityList({
  emptyText,
  items,
  title,
}: {
  emptyText: string;
  items?: SummaryCountedEntity[];
  title?: string;
}) {
  return (
    <div className="run-summary-list-panel">
      {title && <h3>{title}</h3>}
      {items && items.length > 0 ? (
        <ul className="run-summary-entity-list">
          {items.map((item) => (
            <li key={item.id}>
              <span>{item.name}</span>
              <strong>x{item.quantity}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="run-summary-muted">{emptyText}</p>
      )}
    </div>
  );
}

function DeckList({
  cards,
  fallbackCount,
}: {
  cards?: SummaryDeckCard[];
  fallbackCount?: number;
}) {
  if (cards && cards.length > 0) {
    return (
      <ul className="run-summary-deck-list">
        {cards.map((card) => (
          <li key={card.id}>
            <span>{card.name}</span>
            <div>
              {card.upgraded && <PillTag tone="sacred">All copies upgraded</PillTag>}
              <strong>x{card.quantity}</strong>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (fallbackCount !== undefined) {
    return (
      <p className="run-summary-muted">
        Final deck list is unavailable. Recorded deck size: {fallbackCount}.
      </p>
    );
  }

  return <p className="run-summary-muted">Final deck details are unavailable.</p>;
}

function getOutcomeTitle(outcome: FinalizedRunOutcome) {
  if (outcome === "completed") {
    return "Legacy Completed";
  }

  if (outcome === "defeated") {
    return "Run Ended";
  }

  return "Run Abandoned";
}

function getOutcomeCopy(outcome: FinalizedRunOutcome) {
  if (outcome === "completed") {
    return "David's Legacy reaches the valley's conclusion. The campaign record is preserved for replay and review.";
  }

  if (outcome === "defeated") {
    return "This playthrough ended before the valley's conclusion. Review the path, then begin again with the same seed or a new one.";
  }

  return "This run was closed deliberately. Its record is preserved without changing the profile beyond history.";
}

function formatEncounterStatus(status: SummaryEncounterRef["status"]) {
  if (status === "completed") {
    return "Completed";
  }

  if (status === "unresolved") {
    return "Unresolved";
  }

  return "Reached";
}

function formatBoolean(value: boolean | undefined) {
  if (value === undefined) {
    return undefined;
  }

  return value ? "Yes" : "No";
}
