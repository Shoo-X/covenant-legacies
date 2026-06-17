import { cards } from "@/data/cards";
import { GamePanel } from "@/components/GamePanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenFrame } from "@/components/ScreenFrame";
import { getCorruptionThreshold } from "@/game/corruption";
import { getRestChoices, type RestChoiceId } from "@/game/rest";
import type { ResourceState, StartingDeckCard } from "@/types/game";

interface RestNodeScreenProps {
  maxHealth: number;
  onChoose: (choiceId: RestChoiceId) => void;
  runDeck: StartingDeckCard[];
  runHealth: number;
  runResources: ResourceState;
  upgradedCardIds: string[];
}

export function RestNodeScreen({
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
      <div className="rest-node-screen">
        <GamePanel className="rest-node-intro">
          <p>Rest / Upgrade</p>
          <h2>Spring Beneath the Shepherd&apos;s Rock</h2>
          <span>
            Take one careful mercy before the road climbs toward the high place.
          </span>

          <div className="rest-node-status">
            <StatusTile label="Health" value={`${runHealth} / ${maxHealth}`} />
            <StatusTile label="Upgrades" value={upgradedCardIds.length} />
            <StatusTile
              label="Corruption"
              value={`${runResources.corruption} - ${corruptionThreshold.name}`}
            />
          </div>
        </GamePanel>

        <div className="rest-choice-grid">
          {choices.map((choice) => (
            <GamePanel className="rest-choice-card" key={choice.id}>
              <div>
                <p>{choice.label}</p>
                <h3>{choice.description}</h3>
                <span>{choice.effectSummary}</span>
              </div>
              <PrimaryButton
                disabled={choice.disabled}
                onClick={() => onChoose(choice.id)}
                tone={choice.id === "cleanse" ? "secondary" : "primary"}
              >
                {choice.label}
              </PrimaryButton>
            </GamePanel>
          ))}
        </div>
      </div>
    </ScreenFrame>
  );
}

function StatusTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}
