"use client";

import { useEffect } from "react";
import { useAudio } from "@/audio/useAudio";
import { cards } from "@/data/cards";
import {
  ChoiceCard,
  DecisionScreenFrame,
  getSourceTierTone,
  OutcomeStatGrid,
  ScriptureReferencePanel,
  StatusBadge,
  TheologyNotePanel,
} from "@/components/DecisionPrimitives";
import { ScreenFrame } from "@/components/ScreenFrame";
import { TutorialHint } from "@/components/TutorialHint";
import { formatCardCost } from "@/game/cardText";
import type { MysteryEncounter, MysteryEncounterChoice, ResourceState } from "@/types/game";

interface MysteryEncounterScreenProps {
  encounter: MysteryEncounter;
  runResources: ResourceState;
  onChoose: (choice: MysteryEncounterChoice) => void;
}

export function MysteryEncounterScreen({
  encounter,
  onChoose,
  runResources,
}: MysteryEncounterScreenProps) {
  const { playSound } = useAudio();
  const encounterLabel = getMysteryEncounterLabel(encounter.encounterType);
  const isForbiddenEncounter = encounter.encounterType === "ForbiddenMysteryEncounter";

  useEffect(() => {
    playSound("campaign.nodeMystery");
  }, [playSound]);

  return (
    <ScreenFrame>
      <DecisionScreenFrame
        aside={
          <>
            <OutcomeStatGrid
              stats={[
                { label: "Resolve", value: runResources.resolve },
                { label: "Faith", value: runResources.faith },
                { label: "Wisdom", value: runResources.wisdom },
                { label: "Authority", value: runResources.authority },
                { label: "Corruption", value: runResources.corruption },
              ]}
            />
            <div className="decision-note-panel decision-context-panel">
              <p>Preparation</p>
              <span>{getMysteryContext(encounter.id)}</span>
            </div>
            <ScriptureReferencePanel>
              {encounter.references.join("; ")}
            </ScriptureReferencePanel>
            <TheologyNotePanel>{encounter.theologyNote}</TheologyNotePanel>
          </>
        }
        copy={encounter.tone}
        eyebrow={
          <>
            {encounterLabel} / {encounter.sourceTier}
          </>
        }
        meta={
          <StatusBadge tone={getSourceTierTone(encounter.sourceTier)}>
            {encounter.sourceTier}
          </StatusBadge>
        }
        title={encounter.name}
        tone={isForbiddenEncounter ? "danger" : "sacred"}
      >
        <div className="mystery-scene-panel">
          <p>{encounter.scene}</p>
          {encounter.cautionNote && (
            <div className="decision-warning-note">{encounter.cautionNote}</div>
          )}
        </div>

        <TutorialHint tone={isForbiddenEncounter ? "danger" : "sacred"}>
          {encounter.id === "mystery-five-smooth-stones"
            ? "This is preparation, not a magic object. Choose an upgrade, prayerful cleansing, or Resolve for the next battle."
            : "Mystery choices can change resources, cards, or map pressure. Weigh the cost before taking the road."}
        </TutorialHint>

        <div className="mystery-choice-grid">
          {encounter.choices.map((choice) => {
            const card = choice.addCardId
              ? cards.find((candidate) => candidate.id === choice.addCardId)
              : undefined;

            return (
              <ChoiceCard
                actionLabel="Choose"
                eyebrow="Choice"
                key={choice.id}
                onChoose={() => onChoose(choice)}
                title={choice.label}
                tone={isForbiddenEncounter ? "danger" : "sacred"}
              >
                <p>{choice.description}</p>
                <strong>{choice.effectSummary}</strong>
                {card && (
                  <div className="choice-card-preview">
                    <div>
                      <p>{card.name}</p>
                      <span>{formatCardCost(card)}</span>
                    </div>
                    <small>{card.text}</small>
                  </div>
                )}
              </ChoiceCard>
            );
          })}
        </div>
      </DecisionScreenFrame>
    </ScreenFrame>
  );
}

function getMysteryEncounterLabel(encounterType: MysteryEncounter["encounterType"]) {
  const labels: Record<MysteryEncounter["encounterType"], string> = {
    ForbiddenMysteryEncounter: "Forbidden Mystery Encounter",
    MysteryEncounter: "Mystery Encounter",
  };

  return labels[encounterType];
}

function getMysteryContext(encounterId: string) {
  if (encounterId === "mystery-five-smooth-stones") {
    return "Preparation before the battle line: choose carefully, pray, or hurry toward the field.";
  }

  return "A crossroad in the valley where the next step should be weighed before the run continues.";
}
