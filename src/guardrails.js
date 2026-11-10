// Small UI guard helpers: tile-edit detection, the discard-confirmation prompt,
// and safe decoding of the seed stored in the URL hash. No DOM access; the
// confirm function is injected so tests can drive it.
/** Returns true when at least one per-tile override exists in `styles`. */
export function hasTileEdits(styles = {}) {
  return Object.keys(styles).length > 0;
}

/**
 * Asks before an action that discards per-tile edits.
 * @param {boolean} hasEdits - whether any per-tile edits exist.
 * @param {(message: string) => boolean} [confirmFn] - confirm prompt; defaults to `globalThis.confirm`.
 * @returns {boolean} true when there are no edits to lose or the user confirmed.
 */
export function confirmDestructive(hasEdits, confirmFn = globalThis.confirm) {
  return (
    !hasEdits ||
    confirmFn(
      'This will replace the panel and discard all per-tile edits. Continue?'
    )
  );
}

/**
 * Decodes a URL hash (`#seed`) into a seed string.
 * @param {string} hash - `location.hash`, including the leading `#`.
 * @param {string} [fallback] - returned for an empty/`#` hash, an empty decoded seed, or malformed percent-encoding.
 * @returns {string} the decoded seed, or `fallback`; never throws.
 */
export function decodeSeedHash(
  hash,
  fallback = 'different forms, one curious practice'
) {
  if (!hash || hash === '#') return fallback;
  try {
    return decodeURIComponent(hash.slice(1)) || fallback;
  } catch {
    return fallback;
  }
}
