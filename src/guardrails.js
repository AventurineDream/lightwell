export function hasTileEdits(styles = {}) {
  return Object.keys(styles).length > 0;
}

export function confirmDestructive(hasEdits, confirmFn = globalThis.confirm) {
  return !hasEdits || confirmFn("This will replace the panel and discard all per-tile edits. Continue?");
}

export function decodeSeedHash(hash, fallback = "different forms, one curious practice") {
  if (!hash || hash === "#") return fallback;
  try {
    return decodeURIComponent(hash.slice(1)) || fallback;
  } catch {
    return fallback;
  }
}
