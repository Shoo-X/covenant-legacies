"use client";

import { useEffect } from "react";
import { useAudio } from "@/audio/useAudio";
import { CollectibleCard } from "@/components/CollectibleCard";
import {
  DecisionScreenFrame,
  RewardCardShell,
  RewardFooterActions,
} from "@/components/DecisionPrimitives";
import { ScreenFrame } from "@/components/ScreenFrame";
import { TutorialHint } from "@/components/TutorialHint";
import { starterCampaign } from "@/data/campaigns";
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
  const { playSound } = useAudio();
  const heroName = heroes[0].shortName ?? heroes[0].name;

  useEffect(() => {
    playSound("campaign.nodeReward");
  }, [playSound]);

  return (
    <ScreenFrame>
      <DecisionScreenFrame
        copy={
          <>
            Add a card to {heroName}&apos;s run deck, or skip to keep the deck
            lean. After choosing, the road returns to{" "}
            {starterCampaign.campaignName} with the next node available.
          </>
        }
        eyebrow="Victory Reward"
        title="Choose one card for the road ahead."
      >
        <TutorialHint>
          Rewards grow the deck, but every added card changes future draws.
          Choose a card that supports Guard, Courage, or Faith timing; skip if the
          deck is already doing its job.
        </TutorialHint>
        <div className="reward-card-stage">
          {rewardCards.slice(0, 3).map((card) => (
            <RewardCardShell
              key={card.id}
              tone={card.type.includes("Forbidden") ? "danger" : "default"}
            >
              <CollectibleCard
                card={card}
                onClick={() => onChooseCard(card.id)}
                size="reward"
              />
            </RewardCardShell>
          ))}
        </div>

        <RewardFooterActions onSecondary={onSkip} secondaryLabel="Skip Reward">
          Choose one card or skip. Either choice returns to the campaign map.
        </RewardFooterActions>
      </DecisionScreenFrame>
    </ScreenFrame>
  );
}
