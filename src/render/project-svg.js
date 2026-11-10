// Renders a saved project to a self-contained SVG: normalizes it, loads any PNG
// motif assets, derives stable element ids from a hash of the canonical project JSON,
// and embeds the project as <metadata> when `export.metadata` is true.
import { makePanel, panelToSVG } from '../generator.js';
import {
  normalizeProject,
  panelOptions,
  serializeProject,
} from '../model/schema.js';
import { loadCharcoalAssets } from '../catalog/charcoal-motifs.js';
import { CURRENT_LIBRARY } from '../catalog/motif-manifest.js';
function hash(text) {
  let h = 2166136261;
  for (const c of text) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}
function escapeText(value) {
  return String(value).replace(
    /[&<>]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]
  );
}
/** Short base-36 FNV-1a hash of the canonical project JSON; identical projects always hash equal. */
export function projectHash(project) {
  return hash(serializeProject(project));
}
/**
 * Renders a project (any shape accepted by normalizeProject) to SVG text.
 * @param {{instanceNamespace?: *, fetcher?: typeof fetch}} [options] - `instanceNamespace` is
 *   hashed into the element-id prefix so the same project can appear more than once on a page;
 *   `fetcher` replaces `fetch` for loading motif assets (tests).
 * @throws {Error} when a motif asset cannot be fetched.
 */
export async function renderProjectSVG(
  input,
  { instanceNamespace, fetcher } = {}
) {
  const project = normalizeProject(input),
    canonical = serializeProject(project),
    projectPrefix = `lw-${hash(canonical)}`;
  const suffix =
      instanceNamespace === undefined
        ? ''
        : `-${hash(String(instanceNamespace))}`,
    prefix = `${projectPrefix}${suffix}`;
  const used = [
    ...new Set(
      Object.values(project.tiles)
        .map((x) => x.silhouette)
        .filter((x) => x && x !== 'none')
    ),
  ];
  const motifAssets =
    project.motifLibrary === CURRENT_LIBRARY
      ? await loadCharcoalAssets(used, { fetcher })
      : {};
  const head = `<title>${escapeText(project.geometry.seed)} - Lightwell stained glass</title><desc>Deterministic Lightwell project, schema version ${project.version}</desc>${project.export.metadata ? `<metadata>${escapeText(canonical)}</metadata>` : ''}`;
  return panelToSVG(makePanel(panelOptions(project)), project.tiles, {
    motifLibrary: project.motifLibrary,
    motifAssets,
    idPrefix: prefix,
    head,
    text: project.text,
    motion: project.motion,
    rootAttributes: `data-lightwell-project="${projectPrefix}" data-lightwell-instance="${prefix}"`,
  });
}
