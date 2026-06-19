"use client";

import { useEffect } from "react";
import { useAudio } from "@/audio/useAudio";
import {
  ChoiceCard,
  DecisionScreenFrame,
  RewardFooterActions,
  StatusBadge,
  TheologyNotePanel,
} from "@/components/DecisionPrimitives";
import { ScreenFrame } from "@/components/ScreenFrame";
import type { Memorial } from "@/types/game";

interface MemorialRewardScreenProps {
  memorialRewards: Memorial[];
  onChooseMemorial: (memorialId: string) => void;
  onSkip: () => void;
}

export function MemorialRewardScreen({
  memorialRewards,
  onChooseMemorial,
  onSkip,
}: MemorialRewardScreenProps) {
  const { playSound } = useAudio();

  useEffect(() => {
    playSound("campaign.nodeReward");
  }, [playSound]);

  return (
    <ScreenFrame>
      <DecisionScreenFrame
        copy="Memorials are passive run modifiers: stones, signs, instruments, and battle remembrances that shape every future combat."
        eyebrow="Memorial Reward"
        title="Raise a remembrance for the road ahead."
      >
        <div className="memorial-choice-grid">
          {memorialRewards.map((memorial) => (
            <ChoiceCard
              actionLabel="Raise Memorial"
              key={memorial.id}
              meta={<StatusBadge tone="gold">{memorial.rarity}</StatusBadge>}
              onChoose={() => onChooseMemorial(memorial.id)}
              title={memorial.name}
              tone="memorial"
            >
              <p>{memorial.effectText}</p>
              <TheologyNotePanel>{memorial.theologyNote}</TheologyNotePanel>
            </ChoiceCard>
          ))}
        </div>

        <RewardFooterActions onSecondary={onSkip} secondaryLabel="Skip Memorial">
          Choose a remembrance or keep the run unchanged.
        </RewardFooterActions>
      </DecisionScreenFrame>
    </ScreenFrame>
  );
}
