import { CollectibleCard } from "@/components/CollectibleCard";
import { GamePanel } from "@/components/GamePanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenFrame } from "@/components/ScreenFrame";
import { heroes } from "@/data/heroes";
import type { Card } from "@/types/game";

interface RewardScreenProps {
  rewardCards: Card[];
  onChooseCard: (cardId: string) => void;
  onSkip: () => void;
}

export function RewardScreen({
  onChooseCard,
  onSkip,
  rewardCards,
}: RewardScreenProps) {
  const heroName = heroes[0].shortName ?? heroes[0].name;

  return (
    <ScreenFrame>
      <GamePanel className="reward-screen-panel">
        <div className="reward-screen-heading">
          <p>Victory Reward</p>
          <h2>Choose one card for the road ahead.</h2>
          <span>
            Add a card to {heroName}&apos;s run deck, or skip to keep the deck
            lean. After choosing, the road returns to The Valley of the Giant
            with the next node available.
          </span>
        </div>

        <div className="reward-card-stage">
          {rewardCards.slice(0, 3).map((card) => (
            <div className="reward-card-choice" key={card.id}>
              <CollectibleCard
                card={card}
                onClick={() => onChooseCard(card.id)}
                size="reward"
              />
              <p>
                {card.rarity} / {card.sourceTier}
              </p>
            </div>
          ))}
        </div>

        <div className="reward-skip-row">
          <span>Choose one card or skip. Either choice returns to the campaign map.</span>
          <PrimaryButton onClick={onSkip} tone="secondary">
            Skip Reward
          </PrimaryButton>
        </div>
      </GamePanel>
    </ScreenFrame>
  );
}
