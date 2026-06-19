# Covenant: Legacies UI Foundation

This foundation keeps the interface serious, reverent, ancient, strategic, and premium. It should support biblical epic play without drifting into generic fantasy, Sunday-school illustration, or occult visual language.

## Tokens

Use `src/styles/tokens.css` for shared values:

- Color: near-black foundations, charcoal panels, warm bronze/gold accents, parchment text, sacred blue for covenant/divine help, restrained ember/crimson for danger, corruption, fear, and forbidden pressure.
- Radius: prefer `--radius-sm` and `--radius-md` for game UI. Larger radii are reserved for card frames, modals, and art containers.
- Borders: use `--border-subtle`, `--border-gold`, `--border-gold-strong`, `--border-sacred`, and `--border-danger`.
- Depth: use `--shadow-panel`, `--shadow-panel-soft`, `--shadow-panel-strong`, and the glow tokens instead of one-off shadows.
- Typography: use `.ui-kicker`, `.ui-title`, `.ui-body`, and `.ui-body-small` before writing new label/title/body styles.

## Primitives

Common primitives live in `src/components/UiPrimitives.tsx`.

- Layout: `PageLayout`
- Headers: `PageHeader`, `SectionHeader`
- Panels: `ContentPanel`, `InfoPanel`, `DetailPanel`
- Data and state: `StatChip`, `StatusBadge`, `PillTag`
- Frames: `CardFrame`, `ModalFrame`, `ScrollPanel`
- States: `EmptyState`
- Ornament: `Divider`
- Buttons: `PrimaryButton`, `SecondaryButton`, `TertiaryButton`

Existing wrappers such as `AppShell`, `GameTopBar`, `GamePanel`, `PrimaryButton`, `SectionHeader`, and `OrnamentalDivider` now use the shared UI classes.

## Page Patterns

Use `PageLayout` variants to keep screens consistent without redesigning them all at once:

- `home`: title or landing surfaces
- `map`: campaign map with left summary, central route, right details
- `archive`: collection, gallery, codex, and library screens
- `choice`: reward, mystery, rest, upgrade, and selection screens
- `combat`: combat shell and command rail

## Interaction Rules

- Hover should slightly lift or brighten actionable controls.
- Selected/current states should add a stronger gold outline or glow.
- Focus states must use the shared focus ring.
- Disabled states should remain readable but clearly inactive.
- Locked/future steps should be muted, not hidden.

## Guardrails

- Do not use occult symbols, pentagrams, magic circles, or witchcraft seals.
- Prayer and divine intervention should feel reverent and covenantal, not like spellcasting.
- Forbidden/corruption styling should feel cautionary and dangerous, never glamorous.
- Prefer shared primitives over duplicating one-off Tailwind arbitrary values.
