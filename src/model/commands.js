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
export const changeGeometry = (patch) => (project) => {
  project.geometry = { ...project.geometry, ...patch };
  return project;
};
export const setText = (patch) => (project) => {
  project.text = { ...project.text, ...patch };
  return project;
};
export const setMotion = (patch) => (project) => {
  project.motion = { ...project.motion, ...patch };
  return project;
};
