import { audioManifest, type AudioChannel } from "@/audio/audioManifest";
import type { SoundEventName } from "@/audio/soundEvents";

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  muted: boolean;
  sfxVolume: number;
}

type AudioSettingsListener = (settings: AudioSettings) => void;

const audioSettingsStorageKey = "covenant-legacies:audio-settings";
const musicFadeMs = 900;
const musicFadeStepMs = 50;

export const defaultAudioSettings: AudioSettings = {
  masterVolume: 0.82,
  musicVolume: 0.48,
  muted: false,
  sfxVolume: 0.74,
};

function clampVolume(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
}

function canUseBrowserAudio() {
  return typeof window !== "undefined" && typeof Audio !== "undefined";
}

class CovenantAudioManager {
  private ambience?: HTMLAudioElement;
  private currentAmbienceEvent?: SoundEventName;
  private currentMusicEvent?: SoundEventName;
  private fadeTimers = new Set<number>();
  private listeners = new Set<AudioSettingsListener>();
  private lastPlayedAt = new Map<SoundEventName, number>();
  private music?: HTMLAudioElement;
  private pendingMusicEvent?: SoundEventName;
  private settings: AudioSettings = defaultAudioSettings;

  constructor() {
    this.settings = this.readSettings();
    this.listenForAudioUnlock();
  }

  getSettings() {
    return this.settings;
  }

  subscribe(listener: AudioSettingsListener) {
    this.listeners.add(listener);
    listener(this.settings);

    return () => {
      this.listeners.delete(listener);
    };
  }

  playSound(eventName: SoundEventName) {
    const entry = audioManifest[eventName];

    if (!entry || entry.channel !== "sfx") {
      return;
    }

    this.playOneShot(eventName);
  }

  playMusic(eventName: SoundEventName) {
    const entry = audioManifest[eventName];

    if (!entry || entry.channel !== "music") {
      return;
    }

    if (this.currentMusicEvent === eventName && this.music && !this.music.paused) {
      return;
    }

    const previousMusic = this.music;
    this.music = this.createAudioElement(eventName);
    this.currentMusicEvent = eventName;

    if (!this.music) {
      return;
    }

    this.clearFadeTimers();
    this.fadeOutAndStop(previousMusic);
    this.music.loop = Boolean(entry.loop);
    this.music.volume = 0;
    void this.music
      .play()
      .then(() => {
        if (this.music && this.currentMusicEvent === eventName) {
          this.fadeAudioTo(this.music, eventName, this.getEffectiveVolume(eventName));
        }
      })
      .catch(() => {
        this.pendingMusicEvent = eventName;
        this.fadeOutAndStop(this.music);
        this.music = undefined;
        this.currentMusicEvent = undefined;
      });
  }

  stopMusic() {
    this.fadeOutAndStop(this.music);
    this.music = undefined;
    this.currentMusicEvent = undefined;
  }

  playAmbience(eventName: SoundEventName) {
    const entry = audioManifest[eventName];

    if (!entry || entry.channel !== "ambience") {
      return;
    }

    if (
      this.currentAmbienceEvent === eventName &&
      this.ambience &&
      !this.ambience.paused
    ) {
      return;
    }

    this.stopAmbience();
    this.ambience = this.createAudioElement(eventName);
    this.currentAmbienceEvent = eventName;

    if (!this.ambience) {
      return;
    }

    this.ambience.loop = true;
    this.ambience.volume = this.getEffectiveVolume(eventName);
    void this.ambience.play().catch(() => {
      this.stopAmbience();
    });
  }

  stopAmbience() {
    this.stopLoop("ambience");
  }

  setMasterVolume(value: number) {
    this.updateSettings({ masterVolume: clampVolume(value) });
  }

  setSfxVolume(value: number) {
    this.updateSettings({ sfxVolume: clampVolume(value) });
  }

  setMusicVolume(value: number) {
    this.updateSettings({ musicVolume: clampVolume(value) });
  }

  toggleMute() {
    this.updateSettings({ muted: !this.settings.muted });
  }

  private createAudioElement(eventName: SoundEventName) {
    if (!canUseBrowserAudio()) {
      return undefined;
    }

    const entry = audioManifest[eventName];

    try {
      const audio = new Audio(entry.src);
      audio.preload = "auto";
      audio.addEventListener("error", () => undefined, { once: true });
      return audio;
    } catch {
      return undefined;
    }
  }

  private getEffectiveVolume(eventName: SoundEventName) {
    if (this.settings.muted) {
      return 0;
    }

    const entry = audioManifest[eventName];
    const channelVolume =
      entry.channel === "sfx" ? this.settings.sfxVolume : this.settings.musicVolume;

    return clampVolume(this.settings.masterVolume * channelVolume * (entry.volume ?? 1));
  }

  private playOneShot(eventName: SoundEventName) {
    if (!this.canPlayNow(eventName)) {
      return;
    }

    const audio = this.createAudioElement(eventName);

    if (!audio) {
      return;
    }

    audio.volume = this.getEffectiveVolume(eventName);
    void audio.play().catch(() => undefined);
    this.resumePendingMusic();
  }

  private canPlayNow(eventName: SoundEventName) {
    const entry = audioManifest[eventName];
    const now = performance.now();
    const lastPlayed = this.lastPlayedAt.get(eventName) ?? 0;

    if (now - lastPlayed < (entry.cooldownMs ?? 0)) {
      return false;
    }

    this.lastPlayedAt.set(eventName, now);
    return true;
  }

  private stopLoop(channel: Extract<AudioChannel, "music" | "ambience">) {
    const audio = channel === "music" ? this.music : this.ambience;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    if (channel === "music") {
      this.music = undefined;
      this.currentMusicEvent = undefined;
      return;
    }

    this.ambience = undefined;
    this.currentAmbienceEvent = undefined;
  }

  private updateSettings(nextSettings: Partial<AudioSettings>) {
    this.settings = {
      ...this.settings,
      ...nextSettings,
    };

    this.persistSettings();
    this.syncLoopVolumes();
    this.listeners.forEach((listener) => listener(this.settings));
  }

  private syncLoopVolumes() {
    if (this.music && this.currentMusicEvent) {
      this.fadeAudioTo(
        this.music,
        this.currentMusicEvent,
        this.getEffectiveVolume(this.currentMusicEvent),
        180,
      );
    }

    if (this.ambience && this.currentAmbienceEvent) {
      this.ambience.volume = this.getEffectiveVolume(this.currentAmbienceEvent);
    }
  }

  private readSettings() {
    if (typeof window === "undefined") {
      return defaultAudioSettings;
    }

    try {
      const storedSettings = window.localStorage.getItem(audioSettingsStorageKey);

      if (!storedSettings) {
        return defaultAudioSettings;
      }

      const parsed = JSON.parse(storedSettings) as Partial<AudioSettings>;

      return {
        masterVolume: clampVolume(
          parsed.masterVolume ?? defaultAudioSettings.masterVolume,
        ),
        musicVolume: clampVolume(parsed.musicVolume ?? defaultAudioSettings.musicVolume),
        muted: Boolean(parsed.muted),
        sfxVolume: clampVolume(parsed.sfxVolume ?? defaultAudioSettings.sfxVolume),
      };
    } catch {
      return defaultAudioSettings;
    }
  }

  private persistSettings() {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(
        audioSettingsStorageKey,
        JSON.stringify(this.settings),
      );
    } catch {
      // Audio settings are optional; storage failures should never block play.
    }
  }

  private fadeAudioTo(
    audio: HTMLAudioElement,
    eventName: SoundEventName,
    targetVolume: number,
    durationMs = musicFadeMs,
  ) {
    const startVolume = audio.volume;
    const startedAt = performance.now();

    const fadeStep = () => {
      if (!audio || audio.paused) {
        return;
      }

      const elapsed = performance.now() - startedAt;
      const progress = Math.min(1, elapsed / durationMs);
      audio.volume = clampVolume(
        startVolume + (this.getEffectiveVolume(eventName) - startVolume) * progress,
      );

      if (progress < 1) {
        this.fadeTimers.add(window.setTimeout(fadeStep, musicFadeStepMs));
        return;
      }

      audio.volume = targetVolume;
    };

    fadeStep();
  }

  private fadeOutAndStop(audio?: HTMLAudioElement) {
    if (!audio) {
      return;
    }

    const startVolume = audio.volume;
    const startedAt = performance.now();

    const fadeStep = () => {
      const elapsed = performance.now() - startedAt;
      const progress = Math.min(1, elapsed / musicFadeMs);
      audio.volume = clampVolume(startVolume * (1 - progress));

      if (progress < 1) {
        this.fadeTimers.add(window.setTimeout(fadeStep, musicFadeStepMs));
        return;
      }

      audio.pause();
      audio.currentTime = 0;
    };

    fadeStep();
  }

  private clearFadeTimers() {
    this.fadeTimers.forEach((timer) => window.clearTimeout(timer));
    this.fadeTimers.clear();
  }

  private listenForAudioUnlock() {
    if (typeof window === "undefined") {
      return;
    }

    const resume = () => this.resumePendingMusic();

    window.addEventListener("pointerdown", resume, { passive: true });
    window.addEventListener("keydown", resume);
  }

  private resumePendingMusic() {
    const eventName = this.pendingMusicEvent;

    if (!eventName) {
      return;
    }

    this.pendingMusicEvent = undefined;
    this.playMusic(eventName);
  }
}

export const audioManager = new CovenantAudioManager();

export const playSound = (eventName: SoundEventName) =>
  audioManager.playSound(eventName);
export const playMusic = (eventName: SoundEventName) =>
  audioManager.playMusic(eventName);
export const stopMusic = () => audioManager.stopMusic();
export const playAmbience = (eventName: SoundEventName) =>
  audioManager.playAmbience(eventName);
export const stopAmbience = () => audioManager.stopAmbience();
export const setMasterVolume = (value: number) =>
  audioManager.setMasterVolume(value);
export const setSfxVolume = (value: number) => audioManager.setSfxVolume(value);
export const setMusicVolume = (value: number) =>
  audioManager.setMusicVolume(value);
export const toggleMute = () => audioManager.toggleMute();
