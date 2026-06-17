import { screens } from "@/game/navigation";
import type { GameScreen } from "@/types/game";

interface GameTopBarProps {
  currentScreen: GameScreen;
  onNavigate: (screen: GameScreen) => void;
}

export function GameTopBar({ currentScreen, onNavigate }: GameTopBarProps) {
  return (
    <header className="game-topbar relative z-20 flex h-[var(--topbar-height)] shrink-0 items-center justify-between overflow-hidden border-b border-[rgba(215,180,93,0.22)] bg-[linear-gradient(90deg,rgba(8,7,5,0.88),rgba(25,19,15,0.82),rgba(8,7,5,0.88))] px-4 shadow-[0_18px_45px_rgba(0,0,0,0.32)] md:px-6">
      <button className="text-left" onClick={() => onNavigate("home")} type="button">
        <p className="text-[0.62rem] uppercase tracking-[0.32em] text-[var(--color-gold)]">
          COVENANT: LEGACIES
        </p>
        <h1 className="text-base font-semibold leading-none text-[#fff3cf] md:text-lg">
          War of the Watchers
        </h1>
      </button>

      <nav className="flex max-w-[70vw] gap-1 overflow-x-auto">
        {screens.map((screen) => {
          const isActive = screen.id === currentScreen;

          return (
            <button
              className={`h-9 shrink-0 border px-2 text-[0.68rem] uppercase tracking-[0.12em] transition lg:px-3 lg:text-xs ${
                isActive
                  ? "border-[rgba(215,180,93,0.72)] bg-[rgba(215,180,93,0.16)] text-[#fff3cf]"
                  : "border-[rgba(203,185,143,0.14)] bg-[rgba(255,255,255,0.035)] text-[rgba(241,228,194,0.66)] hover:border-[rgba(215,180,93,0.45)] hover:text-[#fff3cf]"
              }`}
              key={screen.id}
              onClick={() => onNavigate(screen.id)}
              aria-current={isActive ? "page" : undefined}
              type="button"
            >
              {screen.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
