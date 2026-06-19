import { cards } from "@/data/cards";
import {
  ChoiceCard,
  DecisionScreenFrame,
  OutcomeStatGrid,
  ScriptureReferencePanel,
  StatusBadge,
  TheologyNotePanel,
} from "@/components/DecisionPrimitives";
import { ScreenFrame } from "@/components/ScreenFrame";
import { TutorialHint } from "@/components/TutorialHint";
import { getCorruptionThreshold } from "@/game/corruption";
import { getRestChoices, type RestChoiceId } from "@/game/rest";
import type { ResourceState, StartingDeckCard } from "@/types/game";

interface RestNodeScreenProps {
  hasFear: boolean;
  maxHealth: number;
  onChoose: (choiceId: RestChoiceId) => void;
  runDeck: StartingDeckCard[];
  runHealth: number;
  runResources: ResourceState;
  upgradedCardIds: string[];
}

export function RestNodeScreen({
  hasFear,
  maxHealth,
  onChoose,
  runDeck,
  runHealth,
  runResources,
  upgradedCardIds,
}: RestNodeScreenProps) {
  const cardsById = new Map(cards.map((card) => [card.id, card]));
  const choices = getRestChoices(
    {
      hasFear,
      maxHealth,
      runDeck,
      runHealth,
      runResources,
      upgradedCardIds,
    },
    cardsById,
  );
  const corruptionThreshold = getCorruptionThreshold(runResources.corruption);

  return (
    <ScreenFrame>
      <DecisionScreenFrame
        aside={
          <>
            <OutcomeStatGrid
              stats={[
                { label: "Health", value: `${runHealth} / ${maxHealth}` },
                { label: "Upgrades", value: upgradedCardIds.length },
                {
                  label: "Corruption",
                  value: `${runResources.corruption} - ${corruptionThreshold.name}`,
                },
              ]}
            />
            <div className="decision-note-panel decision-context-panel">
              <p>Before Goliath</p>
              <span>
                Final preparation before the champion's challenge: heal,
                strengthen Courage, remember deliverance, or pray cleanly.
              </span>
            </div>
            <ScriptureReferencePanel>1 Samuel 17:40</ScriptureReferencePanel>
            <TheologyNotePanel>
              The brook is final preparation before the public battle: prayer,
              memory, and chosen stones are framed as obedience, not magic.
            </TheologyNotePanel>
          </>
        }
        copy="Take one careful mercy before Goliath's challenge: rest, choose, remember, or pray."
        eyebrow="Rest / Upgrade / Cleanse"
        meta={<StatusBadge tone="gold">Scripture</StatusBadge>}
        title="The Brook of Stones"
        tone="sacred"
      >
        <TutorialHint tone="sacred" title="Before Goliath">
          This is the final preparation node. Heal if David is worn down, upgrade
          a Courage card for stronger attacks, or cleanse Fear and Corruption
          before the champion's challenge.
        </TutorialHint>
        <div className="rest-choice-grid">
          {choices.map((choice) => (
            <ChoiceCard
              actionLabel={choice.disabled ? "Unavailable" : choice.label}
              disabled={choice.disabled}
              eyebrow={getRestChoiceEyebrow(choice.id)}
              key={choice.id}
              onChoose={() => onChoose(choice.id)}
              title={choice.label}
              tone={choice.id === "cleanse" ? "sacred" : "default"}
            >
              <p>{choice.description}</p>
              <strong>{choice.effectSummary}</strong>
              {choice.disabled && (
                <div className="decision-disabled-note">
                  {getDisabledRestReason(choice.id)}
                </div>
              )}
              {choice.details && (
                <dl className="rest-choice-details">
                  {choice.details.map((detail) => (
                    <div key={detail.label}>
                      <dt>{detail.label}</dt>
                      <dd>{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </ChoiceCard>
          ))}
        </div>
      </DecisionScreenFrame>
    </ScreenFrame>
  );
}

function getRestChoiceEyebrow(choiceId: RestChoiceId) {
  const labels: Record<RestChoiceId, string> = {
    rest: "Mercy",
    upgrade: "Preparation",
    remember: "Memory",
    cleanse: "Prayer",
  };

  return labels[choiceId];
}

function getDisabledRestReason(choiceId: RestChoiceId) {
  if (choiceId === "cleanse") {
    return "Unavailable because there is no Fear or Corruption to cleanse.";
  }

  if (choiceId === "rest") {
    return "Unavailable because health is already full.";
  }

  if (choiceId === "upgrade") {
    return "Unavailable because no upgradeable Courage card remains.";
  }

  return "Unavailable for the current run state.";
}
