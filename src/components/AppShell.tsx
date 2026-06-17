import { GameTopBar } from "@/components/GameTopBar";
import type { GameScreen } from "@/types/game";

interface AppShellProps {
  children: React.ReactNode;
  currentScreen: GameScreen;
  onNavigate: (screen: GameScreen) => void;
}

export function AppShell({ children, currentScreen, onNavigate }: AppShellProps) {
  return (
    <main className="relative flex h-[100dvh] w-screen overflow-hidden bg-[var(--color-void)] text-[var(--color-ink)]">
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        <GameTopBar currentScreen={currentScreen} onNavigate={onNavigate} />
        <section className="game-screen-region">
          {children}
        </section>
      </div>
    </main>
  );
}
