"use client";

import { useEffect, useMemo, useState } from "react";
import {
  audioManager,
  defaultAudioSettings,
  playAmbience,
  playMusic,
  playSound,
  setMasterVolume,
  setMusicVolume,
  setSfxVolume,
  stopAmbience,
  stopMusic,
  toggleMute,
  type AudioSettings,
} from "@/audio/audioManager";

export function useAudio() {
  const [settings, setSettings] = useState<AudioSettings>(
    defaultAudioSettings,
  );

  useEffect(() => audioManager.subscribe(setSettings), []);

  return useMemo(
    () => ({
      playAmbience,
      playMusic,
      playSound,
      setMasterVolume,
      setMusicVolume,
      setSfxVolume,
      settings,
      stopAmbience,
      stopMusic,
      toggleMute,
    }),
    [settings],
  );
}
