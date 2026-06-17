import type { Card, Enemy, Hero } from "@/types/game";

type SymbolicSubject = Card | Enemy | Hero;
type SymbolicKind = "card" | "enemy" | "hero";

interface SymbolicArtProps {
  className?: string;
  kind: SymbolicKind;
  label?: string;
  showLabel?: boolean;
  subject: SymbolicSubject;
  variant?: "card" | "portrait" | "wide";
}

export function SymbolicArt({
  className = "",
  kind,
  label,
  showLabel = true,
  subject,
  variant = "card",
}: SymbolicArtProps) {
  const motif = getMotif(subject, kind);
  const title = label ?? subject.name;

  return (
    <div
      aria-label={`${title} symbolic artwork`}
      className={`symbolic-art symbolic-art-${variant} symbolic-art-${kind} symbolic-art-${motif} ${className}`}
      role="img"
    >
      <div className="symbolic-sky" />
      <div className="symbolic-horizon" />
      <div className="symbolic-aura" />
      <div className="symbolic-motif" aria-hidden="true">
        <span className="motif motif-one" />
        <span className="motif motif-two" />
        <span className="motif motif-three" />
        <span className="motif motif-four" />
      </div>
      {showLabel && <span className="symbolic-label">{title}</span>}
    </div>
  );
}

function getMotif(subject: SymbolicSubject, kind: SymbolicKind) {
  const name = subject.name.toLowerCase();
  const type = "type" in subject ? subject.type.toLowerCase() : "";
  const title = "title" in subject ? subject.title.toLowerCase() : "";
  const id = "id" in subject ? subject.id.toLowerCase() : "";
  const source = `${id} ${name} ${title} ${type}`;

  if (kind === "hero") {
    return "shepherd-king";
  }

  if (kind === "enemy") {
    if (source.includes("idol")) {
      return "idol-shadow";
    }

    if (source.includes("smith") || source.includes("forge")) {
      return "forbidden-forge";
    }

    if (source.includes("giant") || source.includes("nephilim")) {
      return "giant-ridge";
    }

    return "raider-mark";
  }

  if (source.includes("forbidden") || source.includes("watcher diagram")) {
    return "fractured-tablet";
  }

  if (source.includes("dread")) {
    return "dread-parchment";
  }

  if (source.includes("altar")) {
    return "altar-light";
  }

  if (
    source.includes("blessing") ||
    source.includes("bread") ||
    source.includes("wine")
  ) {
    return "table-blessing";
  }

  if (source.includes("discernment")) {
    return "parted-veil";
  }

  if (
    source.includes("psalm") ||
    source.includes("harp") ||
    source.includes("song") ||
    source.includes("lament")
  ) {
    return "harp-light";
  }

  if (
    source.includes("shepherd") ||
    source.includes("guard") ||
    source.includes("shield")
  ) {
    return "staff-shield";
  }

  if (
    source.includes("stone") ||
    source.includes("sling") ||
    source.includes("giant toppler") ||
    source.includes("defiance")
  ) {
    return source.includes("defiance") || source.includes("toppler")
      ? "defiant-stone"
      : "sling-stone";
  }

  if (source.includes("seal") || source.includes("oath") || source.includes("promise")) {
    return "covenant-seal";
  }

  return "scroll-light";
}
