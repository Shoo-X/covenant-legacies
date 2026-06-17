"use client";

import { useMemo, useState } from "react";
import { encounters } from "@/data/encounters";
import { GamePanel } from "@/components/GamePanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenFrame } from "@/components/ScreenFrame";
import type { Encounter, Memorial, ResourceState } from "@/types/game";

interface MapScreenProps {
  completedEncounterIds: string[];
  onStartEncounter: (encounter: Encounter) => void;
  revealedMapNodeCount: number;
  runMemorials: Memorial[];
  runResources: ResourceState;
  upgradedCardIds: string[];
}

export function MapScreen({
  completedEncounterIds,
  onStartEncounter,
  revealedMapNodeCount,
  runMemorials,
  runResources,
  upgradedCardIds,
}: MapScreenProps) {
  const [selectedEncounterId, setSelectedEncounterId] = useState(encounters[0].id);
  const selectedEncounter = useMemo(
    () =>
      encounters.find((encounter) => encounter.id === selectedEncounterId) ??
      encounters[0],
    [selectedEncounterId],
  );
  const selectedCanEnter = canEnterEncounter(selectedEncounter);
  const selectedCompleted = completedEncounterIds.includes(selectedEncounter.id);

  return (
    <ScreenFrame>
      <div className="campaign-map-screen">
        <GamePanel className="campaign-summary-panel">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">
              First Saga: War of the Watchers
            </p>
            <h2 className="mt-2 text-4xl font-black leading-tight text-[#fff3cf]">
              The Valley of the Giant
            </h2>
            <p className="mt-3 text-sm leading-6 text-[rgba(241,228,194,0.68)]">
              A fixed road of battles, mystery, elite trial, rest, and the high
              place.
            </p>
          </div>

          <div className="campaign-run-stats">
            <RunStat label="Faith" value={runResources.faith} />
            <RunStat label="Authority" value={runResources.authority} />
            <RunStat label="Corruption" value={runResources.corruption} />
            <RunStat label="Upgrades" value={upgradedCardIds.length} />
          </div>

          {revealedMapNodeCount > 0 && (
            <p className="campaign-warning">
              Forbidden counsel revealed the next {revealedMapNodeCount} map nodes.
            </p>
          )}

          <div className="campaign-memorials">
            <p>Memorials</p>
            {runMemorials.length === 0 ? (
              <span>No Memorials raised yet.</span>
            ) : (
              runMemorials.map((memorial) => (
                <span key={memorial.id}>{memorial.name}</span>
              ))
            )}
          </div>
        </GamePanel>

        <GamePanel className="campaign-route-panel">
          <div className="campaign-route-art" aria-hidden="true" />
          <div className="campaign-route-line" aria-hidden="true" />
          <div className="campaign-node-layer">
            {encounters.map((encounter, index) => {
              const isCompleted = completedEncounterIds.includes(encounter.id);
              const isSelected = selectedEncounter.id === encounter.id;
              const canEnter = canEnterEncounter(encounter);
              const state = isCompleted ? "completed" : canEnter ? "available" : "locked";

              return (
                <button
                  className={`campaign-route-node campaign-route-node-${state} ${
                    isSelected ? "is-selected" : ""
                  }`}
                  key={encounter.id}
                  onClick={() => setSelectedEncounterId(encounter.id)}
                  style={{
                    left: `${8 + index * 16.5}%`,
                    top: `${index % 2 === 0 ? 34 : 58}%`,
                  }}
                  type="button"
                >
                  <span>{index + 1}</span>
                  <strong>{encounter.nodeType}</strong>
                </button>
              );
            })}
          </div>
        </GamePanel>

        <GamePanel className="campaign-detail-panel">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-gold)]">
            Selected Node
          </p>
          <h3 className="mt-2 text-2xl font-black leading-tight text-[#fff3cf]">
            {selectedEncounter.name}
          </h3>
          <p className="mt-2 text-sm text-[rgba(241,228,194,0.64)]">
            {selectedEncounter.region} / {selectedEncounter.difficulty}
          </p>

          <div className="campaign-detail-state">
            <span>{selectedEncounter.nodeType}</span>
            <span>
              {selectedCompleted
                ? "Completed"
                : selectedCanEnter
                  ? "Available"
                  : "Locked"}
            </span>
          </div>

          <p className="campaign-detail-reward">
            Reward: {selectedEncounter.rewardPreview}
          </p>

          <PrimaryButton
            disabled={!selectedCanEnter}
            onClick={() => onStartEncounter(selectedEncounter)}
            tone={selectedEncounter.nodeType === "Boss" ? "danger" : "primary"}
          >
            {selectedCompleted
              ? "Replay"
              : selectedCanEnter
                ? selectedEncounter.mysteryEncounterIds?.length
                  ? "Enter Mystery"
                  : "Enter Trial"
                : "Coming Soon"}
          </PrimaryButton>
        </GamePanel>
      </div>
    </ScreenFrame>
  );
}

function canEnterEncounter(encounter: Encounter) {
  return (
    encounter.enemyIds.length > 0 ||
    Boolean(encounter.mysteryEncounterIds?.length)
  );
}

interface RunStatProps {
  label: string;
  value: number;
}

function RunStat({ label, value }: RunStatProps) {
  return (
    <div className="campaign-run-stat">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}
