# Changelog

## v0.1.1 - 2026-09-18

- Correct documentation for local operation, fonts, export, and SVG imports.
- Warn before actions that discard per-tile edits.
- Recover safely from malformed seed hashes.
- Expose orientation state to assistive technology.
- Align package metadata with the public release.

## v0.1 beta - 2026-09-18

Lightwell's first public beta.

- Deterministic seeded stained-glass panels with 5-70 pieces.
- Portrait and landscape layouts.
- Six lead styles: Ink, Lightning, Straight, Wavy, Branch, and Crackle.
- Seeded chaotic two-color treatments for lead and universal mica.
- Opacity controls for glass, lead, mica, and silhouettes.
- 35 built-in motifs with global and per-tile color, opacity, scale, and position controls.
- Deterministic, editable SVG export.
- Responsive, collapsible controls for desktop and mobile.

### Beta notes

The silhouette library is usable but still uneven. A coherent art-nouveau replacement set is planned for the first follow-up update. The app currently exports SVG only and does not save projects between browser sessions.

## Unreleased - v0.2 foundation

- Make the versioned project model and transactional history the live editor's single source of truth.
- Route geometry, orientation, materials, global motif operations, and per-tile edits through undoable commands; coalesce continuous controls into one undo step.
- Validate every loaded tile override and block unknown fields, unsafe colors, unknown motif IDs, and out-of-range transforms.
- Render composed SVG directly into stable background, glass, mica, motifs, lead, lighting, and frame groups.
- Add optional per-instance SVG ID namespacing without changing deterministic standalone output.
- Add validated project Save/Open. The earlier beta note saying projects could not be saved is no longer current on main.
