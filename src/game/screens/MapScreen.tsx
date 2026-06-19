"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useAudio } from "@/audio/useAudio";
import { getArtAsset } from "@/data/artAssets";
import { starterCampaign } from "@/data/campaigns";
import { codexEntries } from "@/data/codexEntries";
import { encounters } from "@/data/encounters";
import { heroes } from "@/data/heroes";
import { ScreenFrame } from "@/components/ScreenFrame";
import { TutorialHint } from "@/components/TutorialHint";
import {
  ContentPanel,
  DetailPanel,
  InfoPanel,
  PillTag,
  PrimaryButton,
  ScrollPanel,
  StatChip,
} from "@/components/UiPrimitives";
import { getCorruptionThreshold } from "@/game/corruption";
import type {
  Encounter,
  Memorial,
  ResourceState,
  StartingDeckCard,
} from "@/types/game";

interface MapScreenProps {
  completedEncounterIds: string[];
  heroDisplayName: string;
  maxRunHealth: number;
  onStartEncounter: (encounter: Encounter) => void;
  revealedMapNodeCount: number;
  runDeck: StartingDeckCard[];
  runHealth: number;
  runMemorials: Memorial[];
  runResources: ResourceState;
  upgradedCardIds: string[];
}

const routePoints = [
  { x: 11, y: 68 },
  { x: 27, y: 50 },
  { x: 43, y: 66 },
  { x: 59, y: 40 },
  { x: 74, y: 58 },
  { x: 89, y: 29 },
];

const valleyArt = getArtAsset("art-valley-of-the-giant");
const giantArt = getArtAsset("art-giant-of-high-place");

export function MapScreen({
  completedEncounterIds,
  heroDisplayName,
  maxRunHealth,
  onStartEncounter,
  revealedMapNodeCount,
  runDeck,
  runHealth,
  runMemorials,
  runResources,
  upgradedCardIds,
}: MapScreenProps) {
  const { playSound } = useAudio();
  const playableHero = heroes[0];
  const corruptionThreshold = getCorruptionThreshold(runResources.corruption);
  const deckSize = runDeck.reduce((total, entry) => total + entry.quantity, 0);
  const completedCount = completedEncounterIds.length;
  const nextEnterableEncounter = useMemo(
    () => getNextEnterableEncounter(completedEncounterIds),
    [completedEncounterIds],
  );
  const fallbackSelectedEncounter =
    nextEnterableEncounter ?? encounters[encounters.length - 1] ?? encounters[0];
  const [selectedEncounterId, setSelectedEncounterId] = useState(
    fallbackSelectedEncounter.id,
  );
  const selectedEncounter = useMemo(
    () =>
      encounters.find((encounter) => encounter.id === selectedEncounterId) ??
      encounters[0],
    [selectedEncounterId],
  );
  const selectedCanEnter = canEnterEncounter(
    selectedEncounter,
    completedEncounterIds,
  );
  const selectedCompleted = completedEncounterIds.includes(selectedEncounter.id);
  const campaignComplete = completedEncounterIds.includes("encounter-valley-boss");
  const selectedCodexLinks = getCodexLinkLabels(selectedEncounter.codexEntryIds);

  useEffect(() => {
    playSound("campaign.mapOpen");
  }, [playSound]);

  function selectEncounter(encounterId: string, shouldPlaySound = false) {
    setSelectedEncounterId(encounterId);

    if (shouldPlaySound) {
      playSound("campaign.nodeSelect");
    }
  }

  return (
    <ScreenFrame>
      <div className="campaign-map-screen">
        <header className="campaign-map-header">
          <div>
            <p>Covenant: Legacies</p>
            <h2>{starterCampaign.campaignName}</h2>
            <span>
              {starterCampaign.campaignLabel} / Biblical Anchor:{" "}
              {starterCampaign.biblicalAnchor}
            </span>
          </div>
          <div className="campaign-header-stats" aria-label="Current run state">
            <RunStat label="HP" value={`${runHealth}/${maxRunHealth}`} />
            <RunStat
              label="Corruption"
              value={`${runResources.corruption} ${corruptionThreshold.name}`}
            />
            <RunStat label="Renown" value={`${completedCount}/${encounters.length}`} />
          </div>
        </header>

        <InfoPanel className="campaign-summary-panel">
          <div className="campaign-david-card">
            <div className="campaign-david-portrait">
              {playableHero.imagePath && (
                <Image
                  alt={playableHero.artworkTitle ?? playableHero.name}
                  className="campaign-david-image"
                  fill
                  sizes="220px"
                  src={playableHero.imagePath}
                  style={{ objectPosition: playableHero.imageObjectPosition }}
                />
              )}
            </div>
            <div>
              <p>Current Hero</p>
              <h3>{playableHero.name}</h3>
              <span>{playableHero.roleSubtitle ?? heroDisplayName}</span>
            </div>
          </div>

          <div className="campaign-run-stats">
            <RunStat label="Health" value={`${runHealth} / ${maxRunHealth}`} />
            <RunStat label="Deck" value={`${deckSize} cards`} />
            <RunStat label="Faith" value={runResources.faith} />
            <RunStat label="Upgrades" value={upgradedCardIds.length} />
          </div>

          <div className="campaign-mechanic-card">
            <PillTag tone="sacred">Courage Mechanic</PillTag>
            <span>
              Guard cleanly, read enemy intent, then spend Courage through
              David&apos;s attacks for a decisive sling turn.
            </span>
          </div>

          <p className={`campaign-corruption-note corruption-note-${corruptionThreshold.tone}`}>
            {corruptionThreshold.name}: {corruptionThreshold.summary}
          </p>

          {revealedMapNodeCount > 0 && (
            <p className="campaign-warning">
              Forbidden counsel revealed the next {revealedMapNodeCount} map nodes.
            </p>
          )}

          <div className="campaign-memorials">
            <p>Legacy Marks</p>
            {runMemorials.length === 0 ? (
              <span>No Memorials raised yet.</span>
            ) : (
              runMemorials.map((memorial) => (
                <span key={memorial.id}>{memorial.name}</span>
              ))
            )}
          </div>
        </InfoPanel>

        <ContentPanel className="campaign-route-panel" variant="sacred">
          {valleyArt?.path && (
            <Image
              alt={valleyArt.title}
              className="campaign-route-image"
              fill
              priority
              sizes="(max-width: 1200px) 60vw, 900px"
              src={valleyArt.path}
              style={{ objectPosition: valleyArt.objectPosition }}
            />
          )}
          {giantArt?.path && (
            <Image
              alt="Distant giant silhouette"
              className="campaign-route-giant"
              height={260}
              src={giantArt.path}
              width={190}
            />
          )}
          <div className="campaign-route-art" aria-hidden="true" />
          <div className="campaign-valley-ridge campaign-valley-ridge-left" aria-hidden="true" />
          <div className="campaign-valley-ridge campaign-valley-ridge-right" aria-hidden="true" />
          <div className="campaign-battle-line campaign-battle-line-israel" aria-hidden="true" />
          <div className="campaign-battle-line campaign-battle-line-philistia" aria-hidden="true" />
          <div className="campaign-brook" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <svg
            aria-hidden="true"
            className="campaign-route-path"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <path
              className="campaign-route-path-carve"
              d="M 11 68 C 17 62, 22 54, 27 50 S 37 58, 43 66 S 54 48, 59 40 S 69 51, 74 58 S 84 38, 89 29"
            />
            <path
              className="campaign-route-path-glow"
              d="M 11 68 C 17 62, 22 54, 27 50 S 37 58, 43 66 S 54 48, 59 40 S 69 51, 74 58 S 84 38, 89 29"
            />
            <path
              className="campaign-route-path-light"
              d="M 11 68 C 17 62, 22 54, 27 50 S 37 58, 43 66 S 54 48, 59 40 S 69 51, 74 58 S 84 38, 89 29"
            />
          </svg>
          <div className="campaign-node-layer">
            {encounters.map((encounter, index) => {
              const point = routePoints[index] ?? routePoints[routePoints.length - 1];
              const isCompleted = completedEncounterIds.includes(encounter.id);
              const isSelected = selectedEncounter.id === encounter.id;
              const canEnter = canEnterEncounter(encounter, completedEncounterIds);
              const isCurrent = nextEnterableEncounter?.id === encounter.id;
              const state = isCompleted
                ? "completed"
                : canEnter
                  ? "available"
                  : "locked";
              const visual = getNodeVisual(encounter);

              return (
                <button
                  aria-label={`${encounter.name}, ${encounter.nodeType}, ${stateLabel(state, isCurrent)}`}
                  className={`campaign-route-node campaign-route-node-${state} campaign-node-${visual.kind} ${
                    isSelected ? "is-selected" : ""
                  } ${isCurrent ? "is-current" : ""}`}
                  key={encounter.id}
                  onClick={() => selectEncounter(encounter.id, true)}
                  onFocus={() => selectEncounter(encounter.id)}
                  onMouseEnter={() => selectEncounter(encounter.id)}
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                  }}
                  title={getNodeStatusText(state, isCurrent)}
                  type="button"
                >
                  <span className="campaign-route-node-number">{index + 1}</span>
                  <i className="campaign-route-node-icon" aria-hidden="true" />
                  <strong>{encounter.name}</strong>
                  <em>{stateLabel(state, isCurrent)}</em>
                </button>
              );
            })}
          </div>
        </ContentPanel>

        <DetailPanel className="campaign-detail-panel">
          <p className="campaign-detail-kicker">Selected Node</p>
          <h3>{selectedEncounter.name}</h3>
          <p className="campaign-detail-meta">
            {selectedEncounter.nodeType} / {selectedEncounter.difficulty}
          </p>

          <div className="campaign-detail-state">
            <PillTag tone="gold">{selectedEncounter.nodeType}</PillTag>
            <PillTag tone={selectedCanEnter ? "sacred" : "muted"}>
              {selectedCompleted
                ? "Completed"
                : selectedCanEnter
                  ? "Current step"
                  : "Future step"}
            </PillTag>
          </div>

          <ScrollPanel className="campaign-detail-scroll">
            <TutorialHint
              title={campaignComplete ? "Campaign Complete" : "First Run Guide"}
              tone={selectedEncounter.nodeType === "Boss" ? "danger" : "default"}
            >
              {getMapTutorialHint(selectedEncounter, selectedCanEnter, selectedCompleted)}
            </TutorialHint>
            {selectedEncounter.description && (
              <div className="campaign-detail-note campaign-detail-note-primary">
                <p>Valley Chronicle</p>
                <span>{selectedEncounter.description}</span>
              </div>
            )}
            <div className="campaign-detail-note">
              <p>Scripture</p>
              <span>{selectedEncounter.references.join("; ")}</span>
            </div>
            <div className="campaign-detail-note">
              <p>Tactical Purpose</p>
              <span>{getNodePurpose(selectedEncounter)}</span>
            </div>
            {!selectedCompleted && !selectedCanEnter && (
              <div className="campaign-detail-note campaign-detail-note-locked">
                <p>Locked</p>
                <span>Locked until the previous node is complete.</span>
              </div>
            )}
            {selectedEncounter.conversationStarter && (
              <div className="campaign-detail-note">
                <p>Conversation Starter</p>
                <span>{selectedEncounter.conversationStarter}</span>
              </div>
            )}
            <div className="campaign-detail-note">
              <p>Reward</p>
              <span>{selectedEncounter.rewardPreview}</span>
            </div>
            {selectedCodexLinks.length > 0 && (
              <div className="campaign-detail-note">
                <p>Codex Links</p>
                <span>{selectedCodexLinks.join("; ")}</span>
              </div>
            )}
            <div className="campaign-detail-note">
              <p>Theology Note</p>
              <span>{selectedEncounter.theologyNote}</span>
            </div>
          </ScrollPanel>

          <PrimaryButton
            disabled={!selectedCanEnter}
            onClick={() => onStartEncounter(selectedEncounter)}
            tone={selectedEncounter.nodeType === "Boss" ? "danger" : "primary"}
          >
            {getNodeActionLabel(selectedEncounter, selectedCanEnter, selectedCompleted)}
          </PrimaryButton>
        </DetailPanel>
      </div>
    </ScreenFrame>
  );
}

function getNextEnterableEncounter(completedEncounterIds: string[]) {
  return encounters.find((encounter) =>
    canEnterEncounter(encounter, completedEncounterIds),
  );
}

function canEnterEncounter(
  encounter: Encounter,
  completedEncounterIds: string[],
) {
  if (completedEncounterIds.includes(encounter.id) || !hasEncounterAction(encounter)) {
    return false;
  }

  const encounterIndex = encounters.findIndex(
    (candidate) => candidate.id === encounter.id,
  );
  const previousPlayableEncounters = encounters
    .slice(0, Math.max(0, encounterIndex))
    .filter(hasEncounterAction);

  return previousPlayableEncounters.every((previousEncounter) =>
    completedEncounterIds.includes(previousEncounter.id),
  );
}

function hasEncounterAction(encounter: Encounter) {
  return (
    encounter.nodeType === "Rest / Upgrade" ||
    encounter.enemyIds.length > 0 ||
    Boolean(encounter.mysteryEncounterIds?.length)
  );
}

function getCodexLinkLabels(codexEntryIds?: string[]) {
  if (!codexEntryIds?.length) {
    return [];
  }

  return codexEntryIds.map((entryId) => {
    const entry = codexEntries.find((candidate) => candidate.id === entryId);

    return entry?.title ?? entryId;
  });
}

function getNodeVisual(encounter: Encounter) {
  if (encounter.nodeType === "Boss") {
    return { kind: "boss" };
  }

  if (encounter.nodeType === "Elite") {
    return { kind: "elite" };
  }

  if (encounter.nodeType === "Rest / Upgrade") {
    return { kind: "rest" };
  }

  if (encounter.nodeType === "Mystery Encounter") {
    return { kind: "mystery" };
  }

  if (encounter.id.includes("idol")) {
    return { kind: "structure" };
  }

  return { kind: "battle" };
}

function getNodePurpose(encounter: Encounter) {
  const purposes: Record<string, string> = {
    "encounter-valley-battle-1":
      "Teach Guard, Courage, and physical pressure at the valley mouth.",
    "encounter-valley-battle-2":
      "Teach targetable structure pressure through the Idol Standard.",
    "encounter-valley-mystery":
      "Prepare David through upgrade, Faith, Fear removal, and Resolve.",
    "encounter-valley-elite":
      "Test the run before Goliath with armor, Guard, and elite danger.",
    "encounter-valley-rest":
      "Offer final healing, Courage preparation, remembrance, or cleansing.",
    "encounter-valley-boss":
      "Final test of Courage, Fear removal, Guard planning, and clean play.",
  };

  return purposes[encounter.id] ?? encounter.gameplayRole;
}

function getMapTutorialHint(
  encounter: Encounter,
  canEnter: boolean,
  completed: boolean,
) {
  if (completed) {
    return "This step is complete. Select the next current node to continue David's path through the valley.";
  }

  if (!canEnter) {
    return "Future steps stay locked until the previous node is complete.";
  }

  if (encounter.nodeType === "Boss") {
    return "Goliath is the final test: bring Guard timing, Fear removal, and Courage attacks to the high place.";
  }

  if (encounter.nodeType === "Rest / Upgrade") {
    return "The Brook of Stones is final preparation before Goliath. Heal, strengthen a Courage card, remember deliverance, or cleanse harmful pressure.";
  }

  if (encounter.nodeType === "Mystery Encounter") {
    return "Mystery choices shape the run. Choose preparation, prayer, or speed based on what David needs next.";
  }

  if (encounter.nodeType === "Elite") {
    return "Elite battles test whether the deck can handle armor, pressure, and timing before Goliath.";
  }

  return "Begin here to learn the battle rhythm: read enemy intent, spend Resolve, Guard when needed, and build Courage.";
}

function getNodeActionLabel(
  encounter: Encounter,
  canEnter: boolean,
  completed: boolean,
) {
  if (completed) {
    return "Completed";
  }

  if (!canEnter) {
    return hasEncounterAction(encounter) ? "Locked" : "Coming Soon";
  }

  if (encounter.nodeType === "Boss") {
    return "Face Goliath";
  }

  if (encounter.nodeType === "Mystery Encounter") {
    return "Enter Scripture Encounter";
  }

  if (encounter.nodeType === "Rest / Upgrade") {
    return "Rest by the Brook";
  }

  return "Begin Encounter";
}

function stateLabel(
  state: "available" | "completed" | "locked",
  isCurrent: boolean,
) {
  if (state === "completed") {
    return "Completed";
  }

  if (isCurrent) {
    return "Current";
  }

  return state === "available" ? "Open" : "Future step";
}

function getNodeStatusText(
  state: "available" | "completed" | "locked",
  isCurrent: boolean,
) {
  if (state === "completed") {
    return "Completed";
  }

  if (isCurrent) {
    return "Current node. Begin this encounter to continue.";
  }

  return "Locked until previous node is complete.";
}

interface RunStatProps {
  label: string;
  value: number | string;
}

function RunStat({ label, value }: RunStatProps) {
  return <StatChip className="campaign-run-stat" label={label} value={value} />;
}
