// DOM helpers for the motif <select> controls and tile keyboard navigation.
import { motifOptions } from '../catalog/motifs.js';
/** Refills each select with the library's motif options, keeping the current value when it still exists. */
export function populateMotifSelects(selects, documentRef = document, library) {
  for (const select of selects) {
    const value = select.value;
    select.replaceChildren(...motifOptions(documentRef, library));
    if ([...select.options].some((x) => x.value === value))
      select.value = value;
  }
}
/**
 * Next tile index for an arrow key, wrapping at both ends.
 * @param {number} current - current index.
 * @param {string} key - `KeyboardEvent.key`; Right/Down move forward, Left/Up back, others keep `current`.
 * @param {number} count - number of tiles; 0 returns 0.
 */
export function moveTileSelection(current, key, count) {
  if (!count) return 0;
  if (key === 'ArrowRight' || key === 'ArrowDown') return (current + 1) % count;
  if (key === 'ArrowLeft' || key === 'ArrowUp')
    return (current - 1 + count) % count;
  return current;
}
