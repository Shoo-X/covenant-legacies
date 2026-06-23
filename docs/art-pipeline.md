# Covenant: Legacies Art Pipeline

This project tracks art needs in code so cards, enemies, campaign nodes, icons, and UI panels can move from rough concept to final licensed art without losing provenance.

## Files

- `src/data/artAssets.ts` is the provenance registry for art files already in the app.
- `src/data/artRegistry.ts` derives the complete art-needs registry from current cards, enemies, campaign encounters, resource icons, and key UI panels.
- `src/data/artPromptQueue.ts` exports the sorted queue for every item that is not final.
- `public/art/incoming` keeps source imports and review files.
- Runtime-ready copies live under `public/art/cards`, `public/art/enemies`, `public/art/showcase`, `public/art/campaign`, or `public/art/ui`.

## Status

- `missing`: no usable visual asset is wired yet.
- `placeholder`: prototype concept art, symbolic CSS art, or temporary UI/icon treatment exists, but it is not final licensed art.
- `final`: final licensed production art is wired and `artAssets.ts` marks it as `final-licensed-art`.

## Prompt Style

Use the established visual language:

Animated biblical fantasy, Prince of Egypt / DreamWorks inspired, painterly TCG art, warm divine lighting, ancient Near Eastern authenticity, family-friendly, readable at small card size.

Keep the theology guardrails intact:

- Do not present speculation as doctrine.
- Do not imply Goliath is Nephilim or Watcher-descended as fact.
- Forbidden or Watcher material should feel cautionary and spiritually dangerous, not glamorous.
- Prayer, faith, covenant, divine intervention, and angels should feel reverent, not like spellcasting.
- Do not use occult symbols, pentagrams, magic circles, witchcraft seals, or witchcraft framing.

## Adding New Art

1. Add the source file to `public/art/incoming`.
2. Copy the app-ready file to the proper runtime folder.
3. Add or update the matching `ArtAsset` in `src/data/artAssets.ts`.
4. Wire the asset through data, not a component-level hardcoded path.
5. If the art is final licensed production art, set `usageStatus` to `final-licensed-art`.
6. Run `npm run build`.

The Gallery Art Needs section reads from `artRegistry.ts`, so it should update automatically after data is wired.
