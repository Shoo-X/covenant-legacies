import { SymbolicArt } from "@/components/SymbolicArt";
import type { Hero } from "@/types/game";

interface PlaceholderArtProps {
  label: string;
  subject?: Hero;
  tone?: "gold" | "ember" | "indigo";
}

const toneClass = {
  gold: "from-[rgba(215,180,93,0.28)] to-[rgba(79,44,20,0.34)]",
  ember: "from-[rgba(159,61,40,0.3)] to-[rgba(35,27,19,0.38)]",
  indigo: "from-[rgba(56,67,93,0.36)] to-[rgba(20,19,24,0.56)]",
};

export function PlaceholderArt({
  label,
  subject,
  tone = "gold",
}: PlaceholderArtProps) {
  if (subject) {
    return (
      <SymbolicArt
        className="min-h-40"
        kind="hero"
        label={label}
        subject={subject}
        variant="portrait"
      />
    );
  }

  return (
    <div
      className={`flex aspect-[4/3] min-h-40 items-center justify-center rounded-md border border-[rgba(215,180,93,0.18)] bg-gradient-to-br ${toneClass[tone]} p-5 text-center`}
    >
      <span className="max-w-44 text-xs uppercase tracking-[0.24em] text-[rgba(255,243,207,0.62)]">
        {label}
      </span>
    </div>
  );
}
