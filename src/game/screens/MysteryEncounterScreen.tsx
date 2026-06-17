import { cards } from "@/data/cards";
import { GamePanel } from "@/components/GamePanel";
import { ScreenFrame } from "@/components/ScreenFrame";
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
  return (
    <ScreenFrame>
      <div className="grid h-full min-h-0 gap-3 xl:grid-cols-[0.48fr_0.52fr]">
        <GamePanel className="flex min-h-0 flex-col p-4">
          <div className="shrink-0">
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[var(--color-gold)]">
              {encounter.encounterType} / {encounter.sourceTier}
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-[#fff3cf] md:text-4xl">
              {encounter.name}
            </h2>
            <p className="mt-3 text-sm uppercase tracking-[0.18em] text-[rgba(241,228,194,0.54)]">
              {encounter.tone}
            </p>
          </div>

        <div className="game-scroll mt-4 min-h-0 flex-1 rounded-md border border-[rgba(215,180,93,0.18)] bg-[rgba(255,255,255,0.04)] p-4">
          <p className="text-lg leading-8 text-[rgba(255,243,207,0.86)]">
            {encounter.scene}
          </p>
          {encounter.cautionNote && (
            <p className="mt-4 rounded-md border border-[rgba(159,61,40,0.42)] bg-[rgba(159,61,40,0.12)] p-4 text-sm leading-6 text-[#ffd7c9]">
              {encounter.cautionNote}
            </p>
          )}
        </div>

        <div className="mt-4 grid shrink-0 grid-cols-5 gap-2">
          <ResourceStat label="Resolve" value={runResources.resolve} />
          <ResourceStat label="Faith" value={runResources.faith} />
          <ResourceStat label="Wisdom" value={runResources.wisdom} />
          <ResourceStat label="Authority" value={runResources.authority} />
          <ResourceStat label="Corruption" value={runResources.corruption} />
        </div>

        <div className="mt-4 grid shrink-0 gap-3 rounded-md border border-[rgba(215,180,93,0.16)] bg-[rgba(255,255,255,0.035)] p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[rgba(241,228,194,0.48)]">
              References
            </p>
            <p className="mt-1 text-sm text-[rgba(241,228,194,0.74)]">
              {encounter.references.join("; ")}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[rgba(241,228,194,0.48)]">
              Theology Note
            </p>
            <p className="mt-1 text-sm leading-6 text-[rgba(241,228,194,0.74)]">
              {encounter.theologyNote}
            </p>
          </div>
        </div>
        </GamePanel>

        <GamePanel className="flex h-full min-h-0 flex-col p-4">
          <p className="shrink-0 text-xs uppercase tracking-[0.22em] text-[var(--color-gold)]">
            Choices
          </p>
        <div className="game-scroll mt-3 grid min-h-0 flex-1 gap-4 pr-1 lg:grid-cols-3 xl:grid-cols-1">
          {encounter.choices.map((choice) => {
            const card = choice.addCardId
              ? cards.find((candidate) => candidate.id === choice.addCardId)
              : undefined;

            return (
              <button
                className="rounded-lg border border-[rgba(215,180,93,0.24)] bg-[rgba(8,7,5,0.38)] p-4 text-left transition hover:translate-y-[-2px] hover:border-[rgba(255,226,150,0.5)]"
                key={choice.id}
                onClick={() => onChoose(choice)}
                type="button"
              >
                <p className="text-lg font-semibold text-[#fff3cf]">{choice.label}</p>
                <p className="mt-3 text-sm leading-6 text-[rgba(241,228,194,0.7)]">
                  {choice.description}
                </p>
                <p className="mt-4 text-sm leading-6 text-[var(--color-gold)]">
                  {choice.effectSummary}
                </p>
                {card && (
                  <div className="mt-4 rounded-md border border-[rgba(215,180,93,0.16)] bg-[rgba(255,255,255,0.04)] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-[#fff3cf]">{card.name}</p>
                      <span className="text-sm text-[var(--color-gold)]">
                        {formatCardCost(card)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[rgba(241,228,194,0.66)]">
                      {card.text}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        </GamePanel>
      </div>
    </ScreenFrame>
  );
}

interface ResourceStatProps {
  label: string;
  value: number;
}

function ResourceStat({ label, value }: ResourceStatProps) {
  return (
    <div className="rounded-md border border-[rgba(215,180,93,0.16)] bg-[rgba(255,255,255,0.04)] p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-[rgba(241,228,194,0.5)]">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-[#fff3cf]">{value}</p>
    </div>
  );
}
