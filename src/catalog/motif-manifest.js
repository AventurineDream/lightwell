// Single source of truth for motifs: ids, labels, tags, and how each library draws them.
// Two libraries exist. LEGACY_LIBRARY draws inline vector paths (generator.js legacyShape)
// and is what migrations assign to version 1/2 projects; CURRENT_LIBRARY draws the PNGs in
// src/assets/motifs and is the default for new projects. Library names and motif ids are
// written into saved projects (`motifLibrary`, tile `silhouette`), so renaming or removing
// one breaks existing files; unknown ids are normalized to 'none' on load (model/schema.js).
export const LEGACY_LIBRARY = 'legacy-vector-v1';
export const CURRENT_LIBRARY = 'charcoal-v1';
// [id, label, inLegacyLibrary = true]. Order here is the order shown in the motif selects;
// rows marked false exist only in CURRENT_LIBRARY.
const rows = [
  ['leaf', 'Laurel leaf'],
  ['moon', 'Crescent moon'],
  ['spark', 'North star'],
  ['sun', 'Radiant sun'],
  ['flower', 'Irises'],
  ['fern', 'Fern frond'],
  ['mushroom', 'Mushroom'],
  ['moth', 'Luna moth'],
  ['bird', 'Bird in flight'],
  ['cat', 'Cat'],
  ['fox', 'Fox face'],
  ['rabbit', 'Rabbit'],
  ['fish', 'Koi'],
  ['snake', 'Serpent'],
  ['shell', 'Spiral shell'],
  ['mountain', 'Mountains'],
  ['wave', 'Ocean wave'],
  ['cloud', 'Cloud'],
  ['rain', 'Rain cloud'],
  ['flame', 'Flame'],
  ['eye', 'Oracle eye'],
  ['hand', 'Open hand'],
  ['heart', 'Anatomical heart'],
  ['key', 'Antique key'],
  ['crown', 'Crown'],
  ['hourglass', 'Hourglass'],
  ['lantern', 'Lantern'],
  ['bottle', 'Potion bottle'],
  ['crystal', 'Crystal cluster'],
  ['planet', 'Ringed planet'],
  ['comet', 'Comet'],
  ['constellation', 'Constellation'],
  ['arch', 'Garden arch'],
  ['tower', 'Tower'],
  ['door', 'Open door'],
  ['muse', 'Art Nouveau Muse', false],
  ['husky', 'Husky', false],
];
/** Deep-frozen manifest: 'none' (no motif, both libraries) followed by one entry per row. */
export const motifManifest = Object.freeze([
  Object.freeze({
    id: 'none',
    label: 'None',
    tags: Object.freeze(['utility']),
    libraries: Object.freeze({
      [LEGACY_LIBRARY]: Object.freeze({ revision: 1, type: 'none' }),
      [CURRENT_LIBRARY]: Object.freeze({ revision: 1, type: 'none' }),
    }),
  }),
  ...rows.map(([id, label, legacy = true]) =>
    Object.freeze({
      id,
      label,
      tags: Object.freeze(['built-in', 'silhouette', 'charcoal']),
      libraries: Object.freeze({
        ...(legacy
          ? { [LEGACY_LIBRARY]: Object.freeze({ revision: 1, type: 'vector' }) }
          : {}),
        [CURRENT_LIBRARY]: Object.freeze({
          revision: 1,
          type: 'png',
          assetUrl: new URL(`../assets/motifs/${id}.png`, import.meta.url).href,
        }),
      }),
    })
  ),
]);
/** Every motif id in manifest order, including 'none' (re-exported as MOTIF_IDS). */
export const motifIds = Object.freeze(motifManifest.map((x) => x.id));
/** Set of motifIds for membership checks (re-exported as MOTIF_ID_SET). */
export const motifIdSet = new Set(motifIds);
/** Manifest entry by id. */
export const motifById = new Map(motifManifest.map((x) => [x.id, x]));
/** True when motif `id` exists and is drawable in `library`. */
export function hasMotif(library, id) {
  return Boolean(motifById.get(id)?.libraries?.[library]);
}
/**
 * Looks up `id` in `library`.
 * @returns a shallow copy of the manifest entry with `library` set to that library's
 *   `{revision, type, assetUrl?}` record, or null when the id or library is missing.
 */
export function motifEntry(library, id) {
  const motif = motifById.get(id);
  return motif && motif.libraries[library]
    ? { ...motif, library: motif.libraries[library] }
    : null;
}
