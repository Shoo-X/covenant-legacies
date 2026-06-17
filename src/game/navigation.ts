import type { GameScreen } from "@/types/game";

export const screens: Array<{
  id: GameScreen;
  label: string;
}> = [
  { id: "home", label: "Home" },
  { id: "hero-select", label: "Hero Select" },
  { id: "map", label: "Campaign Map" },
  { id: "combat", label: "Combat" },
  { id: "collection", label: "Collection" },
  { id: "gallery", label: "Gallery" },
  { id: "codex", label: "Codex" },
];
