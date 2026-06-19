# Covenant: Legacies Audio Placeholders

This folder contains temporary, project-generated placeholder WAV files for the Covenant: Legacies audio system.

These files are intentionally small and simple:

- `ui/` uses very short soft click placeholders.
- `cards/` uses short paper-like tick placeholders.
- `combat/` uses low, soft hit and cue placeholders.
- `campaign/` uses restrained map and node cue placeholders.
- `ambience/` and `music/` use short silent placeholder WAV files so looped channels can be tested safely.

Do not treat these files as final game audio. Replace them with original or properly licensed production assets before release.

When adding final assets:

1. Put the new file in the appropriate `public/audio/...` folder.
2. Update `src/audio/audioManifest.ts` to point the matching sound event at the new file.
3. Keep music and ambience volume conservative in the manifest.
4. Do not add copyrighted audio unless the project has the required license.
