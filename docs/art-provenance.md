# Covenant: Legacies Art Provenance

Covenant: Legacies currently uses AI-generated concept artwork created with ChatGPT / OpenAI image generation for this project. Treat these assets as prototype concept art for Covenant: Legacies, not as unknown stock art and not as user-supplied third-party art.

The current registry for project artwork lives in `src/data/artAssets.ts`. Each registered asset records its source type, generation tool, project-specific provenance, usage status, related cards, related screens, and notes for future review.

## Current Status

- Current artwork is AI-generated concept art created for Covenant: Legacies.
- Current artwork is suitable for internal prototype and demo iteration.
- Current artwork uses `sourceType: "ai-generated-openai"`.
- Current artwork uses `generationTool: "ChatGPT / OpenAI image generation"`.
- Current artwork uses `generatedForProject: true`.
- Current artwork uses `usageStatus: "prototype-concept"`.

## Release Review

Before any commercial release or public production use, each asset should be reviewed for:

- Consistency with the Covenant: Legacies visual direction.
- Theological sensitivity and representational restraint.
- Image quality, composition, readability, and artifacts.
- Final licensing and public-use readiness.
- Whether the piece should remain prototype art or be replaced by commissioned final artwork.

Do not claim the current artwork is human-painted, hand-illustrated, or commissioned final art. Future art may be replaced by human-commissioned final artwork, final licensed artwork, or approved production assets.

## Usage Status Values

- `prototype-concept`: Concept art for prototype and demo iteration.
- `approved-for-demo`: Reviewed and approved for demo presentation.
- `needs-review-before-commercial-release`: Not approved for commercial release until reviewed.
- `final-licensed-art`: Final approved art with appropriate licensing or commissioning records.

## Registry Practice

When adding new art, create or update a registry entry in `src/data/artAssets.ts` before wiring it into screens. Include related cards, related screens, notes, and theological sensitivity where relevant. If duplicate or staging copies remain in `public/art`, record those paths as additional tracked paths on the same asset rather than treating them as unrelated art.
