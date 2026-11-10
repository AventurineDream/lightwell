// Project mutators for history.execute(): each factory returns a function that edits
// the draft project it is given and returns it. The history layer re-normalizes the
// result, so out-of-range values are clamped rather than rejected.
/** Sets `project.material` at `path` (an array of keys, e.g. ['lead', 'width']) to `value`. */
export const setMaterial = (path, value) => (project) => {
  let target = project.material;
  for (const key of path.slice(0, -1)) target = target[key];
  target[path.at(-1)] = value;
  return project;
};
/** Merges `patch` into the override for `tileKey`, creating it if absent. */
export const setTileOverride = (tileKey, patch) => (project) => {
  project.tiles[tileKey] = { ...(project.tiles[tileKey] || {}), ...patch };
  return project;
};
/** Removes the override for `tileKey`. */
export const resetTile = (tileKey) => (project) => {
  delete project.tiles[tileKey];
  return project;
};
/**
 * Builds an undoable geometry edit without regenerating or mutating the input patch.
 * @param {object} patch - geometry fields to merge, such as seed, orientation, or pieceCount.
 * @returns {function(object): object} mutator that replaces the draft's geometry and returns
 * the same project; history normalizes it (including the 5-70 piece-count range).
 */
export const changeGeometry = (patch) => (project) => {
  project.geometry = { ...project.geometry, ...patch };
  return project;
};
/**
 * Builds an undoable panel-text edit; the returned mutator changes only the supplied draft.
 * @param {object} patch - text fields to merge; positions/opacity are percentages, size uses
 * SVG user units, and rotation is in degrees. History normalizes ranges and enum values.
 * @returns {function(object): object} mutator returning the same project after replacing text.
 */
export const setText = (patch) => (project) => {
  project.text = { ...project.text, ...patch };
  return project;
};
/**
 * Builds an undoable deterministic-motion edit; no animation clock is started here.
 * @param {object} patch - motion fields to merge, including enabled, amount in SVG user units,
 * and duration in seconds. History normalizes amount to 0-30 and duration to 2-30 seconds.
 * @returns {function(object): object} mutator returning the same project after replacing motion.
 */
export const setMotion = (patch) => (project) => {
  project.motion = { ...project.motion, ...patch };
  return project;
};
