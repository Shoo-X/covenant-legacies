import { screens } from "@/game/navigation";
import { starterCampaign } from "@/data/campaigns";
import type { GameScreen } from "@/types/game";

interface GameTopBarProps {
  currentScreen: GameScreen;
  navigationState?: Partial<Record<GameScreen, { disabled?: boolean; reason?: string }>>;
  onNavigate: (screen: GameScreen) => void;
  onOpenSettings?: () => void;
}

export function GameTopBar({
  currentScreen,
  navigationState,
  onNavigate,
  onOpenSettings,
}: GameTopBarProps) {
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
          const state = navigationState?.[screen.id];

          return (
            <button
              className={`top-nav-tab ${isActive ? "is-active" : ""}`}
              disabled={state?.disabled}
              key={screen.id}
              onClick={() => onNavigate(screen.id)}
              aria-current={isActive ? "page" : undefined}
              title={state?.reason}
              type="button"
            >
              {screen.label}
            </button>
          );
        })}
      </nav>

      {onOpenSettings && (
        <button
          aria-label="Open game settings"
          className="top-nav-settings-button"
          onClick={onOpenSettings}
          type="button"
        >
          Settings
        </button>
      )}
    </header>
  );
}

export function TopNav(props: GameTopBarProps) {
  return <GameTopBar {...props} />;
}
