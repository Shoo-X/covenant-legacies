# David's Legacy Vertical Slice Audit

Date: 2026-06-23

## 1. Current Implemented Player Loop

The playable David loop is coordinated by `src/components/GameApp.tsx` and the screen components under `src/game/screens`.

- Home: `HomeScreen` introduces Covenant: Legacies and David's Legacy: The Valley of the Giant, shows active-run state, shows the latest finalized run, and links to the latest run summary.
- Hero select: `HeroSelectScreen` starts David's starter campaign.
- Campaign map: `MapScreen` renders the fixed six-node route from `src/data/encounters.ts`.
- Combat: `CombatScreen` creates deterministic combat state through `createCombatState` and derived RNG streams.
- Rewards: `RewardScreen` and `MemorialRewardScreen` resolve card and Memorial choices.
- Mystery/rest: `MysteryEncounterScreen` uses `applyMysteryChoice`; `RestNodeScreen` uses `applyRestChoice`.
- End of run: victory, defeat, and abandon finalize through the same pipeline and open `RunSummaryScreen`.
- Rapid replay: `RunSummaryScreen` can replay the finalized seed, begin with a new seed, or return Home.
- Support screens: Collection, Gallery, Codex, and Settings remain reachable when the active run has no unresolved gameplay state.

The route is still linear. `canStartEncounter` in `GameApp` and `canEnterEncounter` in `MapScreen` require earlier playable encounters to be completed before later nodes open.

## 2. Current Run-State and Persistence Architecture

`src/game/runLifecycle.ts` defines the active run, profile save, schema versions, save keys, save sanitization, combat checkpoints, and outcome finalization hooks.

- Active run key: `covenant-legacies:active-run`.
- Profile key: `covenant-legacies:run-profile`.
- Active-run schema: `ActiveRunSave` version 4.
- Profile schema: `RunProfileSave` version 3.
- Run seed: `runSeed` is stored on active runs and finalized summaries.
- Run phase: `ActiveRunSave.currentScreen` stores the resumable run phase, not merely the visible UI screen.
- Combat checkpoint: `combatCheckpoint` stores the encounter-start state needed to restart unresolved combat after reload.
- Run tracking: `runTracking` stores compact, idempotent records for card changes, decisions, Memorials, and encounter completion order.
- Profile history: `runHistory` stores compact `FinalizedRunSummary` records from `src/game/runSummary.ts`.

Browser storage remains guarded by `typeof window`. Reads tolerate malformed JSON, writes catch storage failure, and unsupported or obsolete saved IDs are treated as recoverable. Full mid-turn combat state is intentionally not persisted; unresolved combat reloads from the encounter beginning using the checkpointed starting deck, health, resources, Memorials, upgrades, and seed.

## 3. Navigation and Pending-State Integrity

`src/game/navigationPolicy.ts` is the pure navigation gate for top-level screen changes.

- With no active run, Map and Combat are blocked until a run starts.
- Map phase allows Home and support screens, but Combat is blocked unless a combat checkpoint exists.
- Combat phase allows Combat resume and lets Home be opened only after an explicit warning that the encounter will restart from its beginning. Map, Hero Select, Collection, Gallery, and Codex are blocked until combat is resolved or the run is abandoned.
- Reward, Memorial reward, mystery, and rest phases can resume their matching screen. Leaving to Home requires confirmation, and other gameplay/support routes are blocked until the decision resolves.
- Hero Select during an active run requires an abandon confirmation and routes through the same finalized-summary pipeline.
- Finalized summary phase blocks stale Map/Combat routes.

This policy separates visible navigation from active-run resume phase. Visiting Home after a confirmed combat or decision warning no longer rewrites the saved run phase to Map.

## 4. Finalized-Run Summary Schema

`src/game/runSummary.ts` defines:

- `RunTrackingState` version 1 for active-run event tracking.
- `FinalizedRunSummary` version 1 for immutable profile history.
- `finalizedRunSummaryRetentionLimit = 20`.

Finalized summaries store compact IDs plus display names at finalization time. They do not store artwork paths, audio references, card descriptions, or full registry objects.

Tracked when available:

- run ID, campaign ID, hero, outcome, seed, start timestamp, and end timestamp.
- ordered encounter path and last reached encounter.
- encounters completed, combat victories, boss reached, and boss completed.
- final health and final resources.
- final deck with duplicate counts and upgrade flags.
- cards gained, removed, and upgraded.
- final Memorials.
- compact reward, Memorial, mystery, and rest decision records when recorded.

Intentionally omitted:

- play time, because inactive browser time would make elapsed duration misleading.
- damage dealt, turns taken across a whole run, and cards played across a whole run, because those are not tracked at run scope.
- scores, grades, ranks, XP, achievements, currencies, or progression rewards.

Older history entries are migrated with `createLegacyRunSummary`. Missing values remain unavailable rather than becoming zero. Unknown card, encounter, or Memorial IDs render through compact fallback names instead of crashing.

## 5. Existing Replayability Mechanisms

- `src/game/random.ts` provides normalized seeds, derived RNG streams, random choice, weighted choice, and shuffle.
- `GameApp` uses derived streams for mystery selection, card rewards, Memorial rewards, and post-Memorial reward offers.
- `CombatScreen` uses derived streams for initial combat setup and in-combat random events.
- `src/game/rewards.ts` weights card offers by current deck and Memorial effects.
- `src/game/rest.ts` can heal, add Lion and Bear, upgrade all copies of a card family, remove Fear, or cleanse Corruption.
- `src/game/mysteryEffects.ts` can add or upgrade cards, alter resources, reveal map nodes, unlock Codex entries, and expand reward pools.

Replayability is still limited by the fixed linear map and compact encounter pool. Seeded runs are reproducible, but route variation remains minimal until branching route choices and encounter-pool variety are added.

## 6. Key Strengths Already Present

- The David campaign has a complete beginning, escalation, boss, and preserved resolution.
- The project keeps content data separate from most engine logic: cards, encounters, enemies, Memorials, and Codex entries live under `src/data`.
- Source-tier, references, theology notes, and gameplay-role metadata are present across major content registries.
- Combat teaches Guard, Courage, Fear, resources, intent, targetable structures, and boss phase pressure.
- Rewards already bias toward deck identity rather than flat random card addition.
- Core shells use `100dvh`, `overflow-hidden`, `min-height: 0`, and intentional internal scrolling.
- Art/audio references are registry-driven enough to fail gracefully when files are missing.

## 7. Addressed P0 Risks

- Active runs persist across reloads.
- Pending card rewards, Memorial rewards, mystery choices, and rest choices remain authoritative after reload.
- Active-run state is separated from profile history.
- Saves have schema versions and sanitization.
- Run-affecting randomness is centralized through seeded RNG.
- Victory, defeat, and abandon finalization is idempotent by run ID.
- Finalized summaries are immutable profile records.
- Replaying a seed creates a new run ID rather than reopening the old summary.
- Old history records remain renderable with incomplete metrics flagged.
- Top-level navigation cannot bypass unresolved combat, reward, Memorial, mystery, or rest state.
- Combat reload uses a deterministic encounter-start checkpoint instead of silently returning to Map or preserving unsafe mid-turn state.
- Collection is view-only for active-run decks; run deck mutations come from reward, rest, and mystery flows.

## 8. Remaining Risks and Gaps

- Full mid-turn combat persistence remains out of scope.
- Runtime WAV files outside `public/audio/incoming` are large, and `audioManager.ts` uses eager audio elements. Compression/streaming policy remains a production follow-up.
- Browser/mobile/audio QA is still blocked in this environment; see section 13.
- Exact-case asset-path validation is not automated in CI yet.
- No full run-history archive exists; only the latest summary is reachable from Home.
- Route choice variety remains minimal because the campaign map is fixed and linear.
- Reward-pool dilution still needs a design pass.
- First-run onboarding and boss telegraphing can be clearer.
- Horizontal Legacy progression is intentionally not implemented.
- No full automated test framework exists; current coverage uses standalone verification scripts.

## 9. Completed Feature Slices

Lifecycle foundation:

- Added schema-versioned active-run persistence and separate profile history in `runLifecycle.ts`.
- Added save sanitization, corrupted-save recovery, active-run abandon confirmation, and idempotent outcome recording.

Deterministic seeded runs:

- Added `src/game/random.ts`.
- Centralized run-affecting randomness through derived streams.
- Added same-seed URL reproduction such as `/?seed=DAVID-7JX2-K93M`.
- Added `scripts/verify-deterministic-rng.mjs` and `npm run verify:rng`.

End-of-run summary and rapid replay:

- Added `src/game/runSummary.ts`.
- Added `src/game/screens/RunSummaryScreen.tsx`.
- Added Home `View Last Run`.
- Added `Replay This Seed`, `Begin With New Seed`, and `Return Home`.
- Added `scripts/verify-run-summary.mjs` and `npm run verify:summary`.

Navigation integrity and combat checkpointing:

- Added `src/game/navigationPolicy.ts`.
- Extended `ActiveRunSave` to schema version 4 with `combatCheckpoint`.
- Added encounter-start combat checkpoint creation and sanitization.
- Added route notices and confirmation modals for unresolved combat/decision navigation.
- Added `scripts/verify-navigation-integrity.mjs` and `npm run verify:navigation`.

## 10. Same-Seed and New-Seed Replay

Same-seed reproduction works through URL start:

1. Open `/?seed=DAVID-7JX2-K93M`.
2. Start a fresh run.
3. Make the same decisions in the same order.

The summary screen adds a faster in-app path:

- `Replay This Seed` starts a clean David run with the finalized summary seed.
- `Begin With New Seed` starts a clean run from `createRunSeed()`.
- Both paths create a fresh run ID, reset rewards, combat state, map completion, deck tracking, Memorials, and summary metrics, and preserve only profile-level history.
- If an active run exists while viewing a prior summary, replay routes through the active-run protection instead of silently replacing the run.

Because David is currently the only playable starter hero, replay starts directly at the campaign map rather than returning through Hero Select. Future multiple-hero support should pass the seed into hero/loadout selection.

## 11. Presentation and Tone Corrections

- `RewardScreen` no longer duplicates source/rarity metadata under every offered card.
- `MapScreen` no longer displays authoring-only `conversationStarter` text in the main campaign UI.
- `MapScreen` changed the map progress stat label from Renown to Journey.
- `CombatScreen` changed terminal summary wording from Damage Taken to Damage Sustained.
- `RestNodeScreen`, `src/data/heroes.ts`, `src/data/cards.ts`, `src/data/memorials.ts`, and `src/game/combat/structures.ts` now use more direct theology language instead of awkward "framed as/not magic" phrasing.
- `RunSummaryScreen` labels upgrades as card-family upgrades and final-deck upgraded copies accordingly.
- `CollectionScreen` treats the active run deck as read-only.
- `src/app/globals.css` removes extra empty space in the run summary hero panel and adds a compact route notice.

## 12. Video Playtest Addendum

Two desktop recordings were reviewed outside this repository pass:

- 1:35 recording: regular victory, reward, map transition, Idol Standard combat, and next reward.
- 2:33 recording: later Goliath phases, campaign victory, and Run Summary.

Acceptance requirements added from those recordings:

- Primary enemy intent must never hide mechanically relevant information behind ellipses. Use wrapping, expansion, focus/tap inspection, or an accessible details control.
- Source-tier labels such as Scripture, Biblical Inference, Interpretive Tradition, and Speculative Fiction must never be truncated or require hover-only discovery.
- Ordinary enemy-turn resolution timing needs a pacing pass. Recorded sequences took roughly 8-10 seconds and repeated information across several panels.
- Combat presentation should reduce or batch nonessential banners while preserving readable causal feedback.
- Do not display the same event simultaneously in the center banner, target panel, structure panel, command panel, and battle log unless each instance has a distinct purpose.
- Card inspection must support mouse hover, keyboard focus, and touch/click without accidentally playing the card.
- The combat command rail's Return to Map button must be visibly enabled during player turns. `scripts/verify-navigation-integrity.mjs` now covers this state while keeping top-level Map navigation blocked during unresolved combat.
- Summary copy should preserve the current family-wide upgrade behavior: "ALL COPIES UPGRADED." Rest and mystery copy should consistently state that the card family is upgraded.
- Combat, music, SFX, and victory-stinger loudness still need measurement. The supplied captures were approximately -35 to -37 LUFS integrated; determine whether that reflects game output or capture gain before changing source assets.
- Combat-presentation improvements should be the recommended next development slice after P0 hardening. Do not implement a large battlefield redesign as part of the P0 navigation/checkpoint pass.

Local audio note: `ffmpeg` was not available in this environment, so LUFS measurement was not performed here.

## 13. Prioritized Roadmap

### P0 - Stability and Complete Run Flow

- Complete a live browser/playtest quality gate across desktop, short-height, and mobile viewports.
- Add production error boundaries and a visible corrupted-save recovery action.
- Add exact-case asset-path validation for case-sensitive deployments.
- Add automated regression coverage around active combat reload and blocked top-nav routes if a full test framework is introduced.

### P1 - Clarity, Pacing, Onboarding, and Replay Loop

- Improve combat-presentation pacing and readability before adding new systems: enemy intent wrapping/details, reduced duplicate event banners, faster ordinary enemy turns, and card inspection for hover, focus, and touch/click.
- Add branching route choices and encounter-pool variety after the combat-presentation pass and before horizontal progression.
- Improve first-run tutorialization for Guard, Courage, Fear, structures, reward skipping, deterministic replay, and combat checkpoint behavior.
- Improve boss teaching and telegraphing so Goliath tests mechanics learned earlier.
- Add clearer route risk/reward language.
- Add compact run-history viewing only after the latest-summary flow has been playtested.

### P2 - Content Depth, Challenge Options, and Long-Term Progression

- Deepen reward/deck archetypes for Courage, Psalm, Kingdom, Covenant, and cautionary Forbidden choices.
- Add deck-dilution controls such as more removal, upgrade, or skip incentives.
- Add optional challenge conditions with tradeoffs.
- Add horizontal Legacy progression after route variety and reward depth are stronger.
- Expand encounter and enemy archetype coverage without changing the 1 Samuel 17 canonical outcome.

### P3 - Polish, Accessibility, Performance, and Production Readiness

- Compress or stream large runtime WAV files while preserving `public/audio/incoming`.
- Audit audio loudness, looping, fades, mute, and autoplay recovery.
- Expand keyboard/focus accessibility checks for map nodes, cards, modals, and summaries.
- Respect reduced motion consistently across combat and menus.
- Review mobile and short-height layouts at 390x844, 1366x768, 1440x900, 1920x1080, and 1280x720.
- Prepare localization-readiness for constrained buttons, card names, summaries, and data-driven copy.
- Add regression coverage for save migration, corrupted saves, deterministic RNG, rewards, finalization, navigation policy, and replay.

## 14. Browser QA Status

Browser QA has been attempted but remains unverified in this environment.

Previously observed blockers:

- Direct dev command on port 3000 reported the port already in use.
- Direct dev command on port 3001 reported another Next dev server already running for this checkout.
- Browser automation through the local Playwright path reported an `EPERM` filesystem access error under the Codex app data directory.
- The local CDP endpoint at `http://127.0.0.1:9666/json/list` was unavailable.

No live browser, mobile, visual, clipboard, reload, or audio QA is claimed until those checks are completed in a working browser session.

## Manual QA Checklist

- Start a run, enter combat, use Home, confirm the warning, then Continue and verify combat restarts at the encounter beginning with the same run seed.
- Enter combat and verify Map, Collection, Gallery, Codex, and Combat shortcuts do not bypass the unresolved battle.
- During a player turn, confirm the combat command rail's Return to Map button is visibly enabled; during enemy resolution, confirm it is disabled.
- Reach a card reward, reload, and verify the same reward decision remains authoritative.
- Reach a Memorial reward, mystery, and rest node where practical; verify unresolved choices cannot be bypassed through top navigation.
- Finish the boss and confirm `RunSummaryScreen` opens with `Legacy Completed`.
- Lose a combat where practical, choose End Run, and confirm `Run Ended` does not imply an alternate biblical history.
- Abandon a run and confirm `Run Abandoned` opens.
- Use `Replay This Seed` and confirm the active Home seed matches the finalized seed while the new run ID is different.
- Use `Begin With New Seed` and confirm the seed changes.
- Reload after finalization and confirm the profile does not duplicate the run.
- Use Home `View Last Run` and confirm the latest summary opens.
- Confirm old limited records show unavailable metrics instead of zeros.
- Confirm unknown card, encounter, or Memorial IDs render fallback names.
- Confirm no page-level scrolling on Home, Map, Combat, Reward, Mystery, Rest, Run Summary, Gallery, and Codex.
- Test 1440x900, 1366x768, 390x844, 1920x1080, and 1280x720 for clipped controls.
- Check keyboard focus order on Run Summary actions and Copy Seed feedback.
- Inspect cards with mouse hover, keyboard focus, and touch/click; confirm inspection does not accidentally play the card.
- Confirm enemy intent and source-tier labels do not truncate mechanically relevant text or depend on hover alone.
- Time an ordinary enemy turn and note repeated event surfaces across the center banner, target panel, structure panel, command panel, and battle log.
- Measure combat, music, SFX, and victory-stinger loudness from game output and compare against capture-chain loudness.
- Confirm mute/volume/music transitions still behave after summary navigation.
