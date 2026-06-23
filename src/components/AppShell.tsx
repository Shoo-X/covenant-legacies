"use client";

import { useState } from "react";
import { AudioSettingsPanel } from "@/components/AudioSettingsPanel";
import { GameTopBar } from "@/components/GameTopBar";
import { AudioEventBridge } from "@/components/AudioEventBridge";
import type { GameScreen } from "@/types/game";

interface AppShellProps {
  children: React.ReactNode;
  currentScreen: GameScreen;
  navigationState?: Partial<Record<GameScreen, { disabled?: boolean; reason?: string }>>;
  onNavigate: (screen: GameScreen) => void;
}

export function AppShell({
  children,
  currentScreen,
  navigationState,
  onNavigate,
}: AppShellProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <main className="game-root">
      <AudioEventBridge>
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
          <GameTopBar
            currentScreen={currentScreen}
            navigationState={navigationState}
            onNavigate={onNavigate}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
          <section className="game-screen-region">
            {children}
          </section>
          {isSettingsOpen && (
            <div
              aria-modal="true"
              className="game-settings-overlay"
              role="dialog"
            >
              <div className="game-settings-menu">
                <div className="game-settings-header">
                  <div>
                    <p className="ui-kicker">Game Settings</p>
                    <h2>Options</h2>
                  </div>
                  <button
                    aria-label="Close settings"
                    className="game-settings-close"
                    onClick={() => setIsSettingsOpen(false)}
                    type="button"
                  >
                    Close
                  </button>
                </div>
                <AudioSettingsPanel />
              </div>
            </div>
          )}
        </div>
      </AudioEventBridge>
    </main>
  );
}
