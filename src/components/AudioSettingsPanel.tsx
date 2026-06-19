"use client";

import { useEffect, useState } from "react";
import { defaultAudioSettings } from "@/audio/audioManager";
import { useAudio } from "@/audio/useAudio";
import { Divider, PillTag } from "@/components/UiPrimitives";

function toPercent(value: number) {
  return Math.round(value * 100);
}

interface AudioSliderProps {
  label: string;
  onChange: (value: number) => void;
  value: number;
}

function AudioSlider({ label, onChange, value }: AudioSliderProps) {
  return (
    <label className="audio-setting-slider">
      <span>
        {label}
        <b>{toPercent(value)}%</b>
      </span>
      <input
        max="1"
        min="0"
        onChange={(event) => onChange(Number(event.target.value))}
        step="0.01"
        type="range"
        value={value}
      />
    </label>
  );
}

export function AudioSettingsPanel() {
  const [hasMounted, setHasMounted] = useState(false);
  const {
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    settings,
    toggleMute,
  } = useAudio();
  const displaySettings = hasMounted ? settings : defaultAudioSettings;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <section className="audio-settings-panel" aria-label="Audio settings">
      <div className="audio-settings-header">
        <div>
          <p className="ui-kicker">Audio</p>
          <h3>Sound Settings</h3>
        </div>
        <button
          className={`audio-mute-toggle ${displaySettings.muted ? "is-muted" : ""}`}
          onClick={toggleMute}
          type="button"
        >
          {displaySettings.muted ? "Muted" : "Sound On"}
        </button>
      </div>
      <p>
        Settings save on this device. Placeholder cues stay quiet until final
        licensed audio is added.
      </p>
      <Divider />
      <div className="audio-settings-stack">
        <AudioSlider
          label="Master"
          onChange={setMasterVolume}
          value={displaySettings.masterVolume}
        />
        <AudioSlider
          label="SFX"
          onChange={setSfxVolume}
          value={displaySettings.sfxVolume}
        />
        <AudioSlider
          label="Music"
          onChange={setMusicVolume}
          value={displaySettings.musicVolume}
        />
      </div>
      <div className="audio-settings-tags">
        <PillTag tone="gold">UI</PillTag>
        <PillTag tone="sacred">Cards</PillTag>
        <PillTag>Ambience</PillTag>
      </div>
    </section>
  );
}
