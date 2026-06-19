# Covenant: Legacies

Covenant: Legacies is a biblical supernatural roguelike deckbuilding card battler. The Valley of the Giant is the current David starter campaign, anchored in 1 Samuel 17.

The tone target is serious, reverent, ancient, mysterious, and premium. This is not Bible trivia, Sunday school clipart, or occult fantasy. The project uses biblical themes as inspiration while remaining original IP.

## Current Scope

This build is a coherent playable demo shell. It includes:

- A full-screen Home entry point for starting or continuing a run
- A dark stone, parchment, bronze, gold, ivory, sacred-blue, and corruption-crimson visual shell
- A collectible-card presentation system and route-style campaign map foundation
- State-based navigation between Home, Hero Select, Campaign Map, Combat, Reward, Mystery Encounter, Memorial Reward, Collection, Gallery, and Codex
- David, Shepherd of Bethlehem as the starter hero, plus starter deck, card rewards, mystery encounters, enemies, and memorials
- The Valley of the Giant as David's beginner tutorial campaign and current starter path
- War of the Watchers preserved as a future speculative saga layer and optional background, not the main label for David's starter campaign
- Collection as the card archive and future deck-building home
- Gallery as the showcase art and concept-art viewer
- Codex as the scripture, lore, theology-note, source-tier, and reference record
- TypeScript domain types for future gameplay systems
- Folder structure for components, data, types, game, and styles

Long-term save persistence, procedural campaign generation, and full game balance are not implemented yet.

## Full-Screen Game Shell

The core app is built as a `100dvh` game viewport rather than a scrolling webpage. `AppShell`, `ScreenFrame`, `GameTopBar`, `GamePanel`, `PrimaryButton`, `SceneBackdrop`, and `OrnamentalDivider` provide the base frame.

Core screens use `overflow-hidden` at the shell level. Long content scrolls inside contained panels only, so combat keeps resources, enemy intent, action buttons, battle log, and the card hand visible within the viewport.

The art direction is premium biblical dark fantasy: ancient Near Eastern stone, bronze, gold, parchment, ivory text, sacred blue covenant light, restrained crimson/violet corruption effects, subtle vignette, dust, embers, and light rays.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal, usually:

```text
http://localhost:3000
```

Create a production build:

```bash
npm run build
```

## Source Discipline

Cards, enemies, and encounters are structured to support:

- `sourceTier`
- `references`
- `theologyNote`
- `gameplayRole`

The supported source tiers are:

- Scripture
- Biblical Inference
- Interpretive Tradition
- Speculative Fiction

These fields are intended to keep future design work clear about what is directly biblical, what is carefully inferred from biblical context, what comes from interpretive history, and what is original speculative fiction.
