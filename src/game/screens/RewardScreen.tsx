import { CollectibleCard } from "@/components/CollectibleCard";
import { GamePanel } from "@/components/GamePanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenFrame } from "@/components/ScreenFrame";
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
  return (
    <ScreenFrame>
      <GamePanel className="reward-screen-panel">
        <div className="reward-screen-heading">
          <p>Victory Reward</p>
          <h2>Choose one card for the road ahead.</h2>
          <span>
            Add a card to the Shepherd King&apos;s run deck, or skip to keep the
            deck lean.
          </span>
        </div>

        <div className="reward-card-stage">
          {rewardCards.slice(0, 3).map((card) => (
            <CollectibleCard
              card={card}
              key={card.id}
              onClick={() => onChooseCard(card.id)}
              size="reward"
            />
          ))}
        </div>

        <div className="reward-skip-row">
          <PrimaryButton onClick={onSkip} tone="secondary">
            Skip Reward
          </PrimaryButton>
        </div>
      </GamePanel>
    </ScreenFrame>
  );
}
