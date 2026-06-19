import { screens } from "@/game/navigation";
import { starterCampaign } from "@/data/campaigns";
import type { GameScreen } from "@/types/game";

interface GameTopBarProps {
  currentScreen: GameScreen;
  onNavigate: (screen: GameScreen) => void;
}

export function GameTopBar({ currentScreen, onNavigate }: GameTopBarProps) {
  return (
    <header className="game-topbar top-nav">
      <button className="top-nav-brand" onClick={() => onNavigate("home")} type="button">
        <p className="ui-kicker">COVENANT: LEGACIES</p>
        <h1>
          {starterCampaign.campaignName}
        </h1>
      </button>

      <nav className="top-nav-tabs" aria-label="Game screens">
        {screens.map((screen) => {
          const isActive = screen.id === currentScreen;

          return (
            <button
              className={`top-nav-tab ${isActive ? "is-active" : ""}`}
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

export function TopNav(props: GameTopBarProps) {
  return <GameTopBar {...props} />;
}
