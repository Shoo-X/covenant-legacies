"use client";

import { useEffect, useRef } from "react";
import { useAudio } from "@/audio/useAudio";

interface AudioEventBridgeProps {
  children: React.ReactNode;
}

function getAudioButtonTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return undefined;
  }

  return target.closest<HTMLButtonElement>("button");
}

function isCardButton(button: HTMLButtonElement) {
  return button.classList.contains("tcg-card") || Boolean(button.closest(".tcg-card"));
}

export function AudioEventBridge({ children }: AudioEventBridgeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { playSound } = useAudio();

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    function handlePointerOver(event: PointerEvent) {
      const button = getAudioButtonTarget(event.target);

      if (!button || isCardButton(button)) {
        return;
      }

      if (button.disabled || button.getAttribute("aria-disabled") === "true") {
        playSound("ui.disabled");
        return;
      }

      playSound("ui.hover");
    }

    function handleClick(event: MouseEvent) {
      const button = getAudioButtonTarget(event.target);

      if (!button || isCardButton(button)) {
        return;
      }

      if (button.disabled || button.getAttribute("aria-disabled") === "true") {
        playSound("ui.disabled");
        return;
      }

      playSound("ui.click");
    }

    root.addEventListener("pointerover", handlePointerOver);
    root.addEventListener("click", handleClick);

    return () => {
      root.removeEventListener("pointerover", handlePointerOver);
      root.removeEventListener("click", handleClick);
    };
  }, [playSound]);

  return (
    <div className="audio-event-bridge" ref={rootRef}>
      {children}
    </div>
  );
}
