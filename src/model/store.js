// Minimal project store: holds one normalized project, hands out deep copies,
// and notifies subscribers on every replace. History (undo/redo) is layered on
// separately in history.js.
import { normalizeProject } from './schema.js';
const clone = (value) => JSON.parse(JSON.stringify(value));
/**
 * Creates a store around a project normalized with `normalizeProject`.
 * `getState`/`replace`/`update` return JSON deep copies, so callers cannot mutate internal state.
 * `update(mutator)` passes a draft copy; the mutator may mutate it or return a replacement.
 * `subscribe(fn)` returns an unsubscribe function.
 * @param {object} initial - project (normalized on the way in).
 */
export function createStore(initial) {
  let state = normalizeProject(initial),
    listeners = new Set();
  return {
    getState: () => clone(state),
    replace(next) {
      state = normalizeProject(next);
      for (const fn of listeners) fn(clone(state));
      return clone(state);
    },
    update(mutator) {
      const draft = clone(state);
      const result = mutator(draft) || draft;
      return this.replace(result);
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
