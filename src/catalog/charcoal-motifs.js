// Loads the PNG motif assets of the current ("charcoal") library as data URLs
// so exported SVGs can be self-contained. Successful and in-flight loads are
// cached by motif id; failed loads are evicted so a retry can succeed.
import { CURRENT_LIBRARY, motifEntry } from './motif-manifest.js';
const cache = new Map();
const bytesToDataUrl = (bytes) => {
  if (typeof Buffer !== 'undefined')
    return `data:image/png;base64,${Buffer.from(bytes).toString('base64')}`;
  let binary = '';
  for (let i = 0; i < bytes.length; i += 32768)
    binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return `data:image/png;base64,${btoa(binary)}`;
};
/**
 * Loads one motif PNG as a `data:image/png;base64,...` URL.
 * @param {string} id - motif id in the current library.
 * @param {{fetcher?: typeof fetch}} [options] - injectable fetch (tests).
 * @returns {Promise<string|null>} null when the id is unknown or not a PNG motif.
 * @throws {Error} `Unable to load motif asset: <id>` on a non-OK response (the cache entry is dropped).
 */
export async function loadCharcoalDataUrl(id, { fetcher = fetch } = {}) {
  if (cache.has(id)) return cache.get(id);
  const entry = motifEntry(CURRENT_LIBRARY, id);
  if (!entry || entry.library.type !== 'png') return null;
  const promise = fetcher(entry.library.assetUrl).then(async (response) => {
    if (!response.ok) throw new Error(`Unable to load motif asset: ${id}`);
    return bytesToDataUrl(new Uint8Array(await response.arrayBuffer()));
  });
  cache.set(id, promise);
  try {
    return await promise;
  } catch (error) {
    cache.delete(id);
    throw error;
  }
}
/** Loads each distinct id in `ids`; resolves to an object mapping id to data URL (or null). */
export async function loadCharcoalAssets(ids, options) {
  return Object.fromEntries(
    await Promise.all(
      [...new Set(ids)].map(async (id) => [
        id,
        await loadCharcoalDataUrl(id, options),
      ])
    )
  );
}
/** Empties the asset cache (used by tests). */
export function clearCharcoalCache() {
  cache.clear();
}
