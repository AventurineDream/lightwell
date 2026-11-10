// Per-library views of the motif manifest for UI and tests: plain definitions and <option> elements.
import { CURRENT_LIBRARY, motifManifest } from './motif-manifest.js';
/**
 * Motifs drawable in `library`, in manifest order (including 'none').
 * @returns {ReadonlyArray<{id: string, label: string, revision: number, tags: readonly string[]}>} frozen array of frozen entries.
 */
export function motifDefinitionsForLibrary(library = CURRENT_LIBRARY) {
  return Object.freeze(
    motifManifest
      .filter((x) => x.libraries[library])
      .map((x) =>
        Object.freeze({
          id: x.id,
          label: x.label,
          revision: x.libraries[library].revision,
          tags: x.tags,
        })
      )
  );
}
/** motifDefinitionsForLibrary(CURRENT_LIBRARY), computed once at import. */
export const motifDefinitions = motifDefinitionsForLibrary();
/**
 * One `<option value=id>label</option>` per motif in `library`, created with `documentRef`
 * (pass a document explicitly outside the browser; the default reads the global `document`).
 */
export function motifOptions(
  documentRef = document,
  library = CURRENT_LIBRARY
) {
  return motifDefinitionsForLibrary(library).map(({ id, label }) => {
    const option = documentRef.createElement('option');
    option.value = id;
    option.textContent = label;
    return option;
  });
}
