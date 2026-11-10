// Browser entry point: wires the DOM controls to a history-backed project and renders
// the SVG preview. State lives in `history` (undo/redo); `baseline` is the serialized
// project at last load/save, used to detect unsaved changes; `selected` is the focused tile.
// Slider drags are grouped into one undo step with begin()/end() (see continuous()).
// The element ids in index.html are this module's contract with the page (looked up once at
// load) and with scripts/browser-integration.mjs, which drives the controls by id. The initial
// seed comes from the URL hash; syncControls() writes the current seed back to it.
import { makePanel, panelToSVG } from './generator.js';
import { loadCharcoalAssets } from './catalog/charcoal-motifs.js';
import { CURRENT_LIBRARY } from './catalog/motif-manifest.js';
import { decodeSeedHash } from './guardrails.js';
import { populateMotifSelects, moveTileSelection } from './ui/catalog.js';
import {
  createProject,
  panelOptions,
  serializeProject,
} from './model/schema.js';
import { createHistory } from './model/history.js';
import {
  changeGeometry,
  resetTile,
  setMaterial,
  setTileOverride,
  setText,
  setMotion,
} from './model/commands.js';
import { parseProject, projectFile } from './io/project.js';
import { renderProjectSVG } from './render/project-svg.js';
const $ = (s) => document.querySelector(s),
  stage = $('#stage'),
  elements = Object.fromEntries(
    [...document.querySelectorAll('[id]')].map((e) => [e.id, e])
  ),
  {
    seed,
    count,
    lead,
    leadStyle,
    hue,
    sat,
    val,
    color,
    tileColor,
    tileSilhouette,
    silhouetteColor,
    silhouetteOpacity,
    globalSilhouette,
    silhouetteScale,
    positionX,
    positionY,
    globalScale,
    globalX,
    globalY,
    mica,
    micaBrightness,
    micaDensity,
    crackColor1,
    crackColor2,
    micaColor1,
    micaColor2,
    crackOpacity,
    micaOpacity,
    glassOpacity,
    globalOpacity,
    textContent,
    textColor,
    textOpacity,
    textSize,
    textX,
    textY,
    textRotation,
    textFont,
    textAlign,
    textClip,
    motionEnabled,
    motionAmount,
    motionDuration,
  } = elements;
populateMotifSelects(
  [globalSilhouette, tileSilhouette],
  document,
  CURRENT_LIBRARY
);
// Starter overrides so a fresh page shows motifs; tile 8 is the initially selected tile.
const demoTiles = {
  0: {
    color: '#bb7eaa',
    silhouette: 'leaf',
    silhouetteColor: '#183a30',
    opacity: 1,
  },
  8: {
    color: '#e8bd72',
    silhouette: 'moon',
    silhouetteColor: '#4e2755',
    opacity: 1,
  },
};
let loadedMotifAssets = {},
  history = createHistory(
    createProject({ seed: decodeSeedHash(location.hash), tiles: demoTiles })
  ),
  selected = 8,
  baseline = serializeProject(history.getState().project),
  transaction = false;
/** File-name slug of a seed: lowercase [a-z0-9] runs joined by '-', at most 50 chars, 'panel' if empty. */
const safe = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) || 'panel';
/** Downloads `blob` as `name` through a temporary object URL, revoked after 500 ms. */
function save(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 500);
}
/** Current project; history.getState() returns a copy, so edits must go through history. */
function state() {
  return history.getState().project;
}
/** Regenerates tile geometry from the current project (recomputed on every call). */
function panel() {
  return makePanel(panelOptions(state()));
}
/** Clamps `selected` into `p`'s tile range (a new geometry can have fewer tiles) and returns `p`. */
function validSelection(p = panel()) {
  selected = Math.max(0, Math.min(selected, p.polygons.length - 1));
  return p;
}
/** True when the project differs from `baseline` (last open/save); drives the beforeunload prompt. */
function isDirty() {
  return serializeProject(state()) !== baseline;
}
let controlsLibrary = CURRENT_LIBRARY;
/**
 * Writes the project into every control and value label, refills the motif selects when the
 * project's motif library differs from the one they were filled for (`controlsLibrary`),
 * updates undo/redo enabled state, and mirrors the seed into the URL hash (replaceState
 * errors are ignored).
 */
function syncControls() {
  const p = state();
  if (controlsLibrary !== p.motifLibrary) {
    populateMotifSelects(
      [globalSilhouette, tileSilhouette],
      document,
      p.motifLibrary
    );
    controlsLibrary = p.motifLibrary;
  }
  const g = p.geometry,
    m = p.material,
    t = p.tiles[selected] || {},
    pn = validSelection();
  for (const [e, v] of [
    [seed, g.seed],
    [count, g.pieceCount],
    [hue, m.colorFamily.hue],
    [sat, m.colorFamily.saturation],
    [val, m.colorFamily.value],
    [lead, m.lead.width],
    [leadStyle, m.lead.style],
    [crackColor1, m.lead.colors[0]],
    [crackColor2, m.lead.colors[1]],
    [crackOpacity, m.lead.opacity],
    [mica, m.mica.amount],
    [micaBrightness, m.mica.brightness],
    [micaDensity, m.mica.density],
    [micaColor1, m.mica.colors[0]],
    [micaColor2, m.mica.colors[1]],
    [micaOpacity, m.mica.opacity],
    [glassOpacity, m.glass.opacity],
    [tileColor, t.color || pn.polygons[selected]?.fill || '#9b70b4'],
    [tileSilhouette, t.silhouette || 'none'],
    [silhouetteColor, t.silhouetteColor || '#171019'],
    [silhouetteOpacity, Math.round((t.opacity ?? 0.72) * 100)],
    [silhouetteScale, Math.round((t.scale ?? 1) * 100)],
    [positionX, t.positionX ?? 0],
    [positionY, t.positionY ?? 0],
    [textContent, p.text.content],
    [textColor, p.text.color],
    [textOpacity, p.text.opacity],
    [textSize, p.text.size],
    [textX, p.text.x],
    [textY, p.text.y],
    [textRotation, p.text.rotation],
    [textFont, p.text.font],
    [textAlign, p.text.align],
    [motionAmount, p.motion.amount],
    [motionDuration, p.motion.duration],
  ])
    e.value = v;
  textClip.checked = p.text.clip;
  motionEnabled.checked = p.motion.enabled;
  for (const [id, v] of [
    ['countLabel', g.pieceCount],
    ['leadLabel', m.lead.width],
    ['hueLabel', m.colorFamily.hue],
    ['satLabel', m.colorFamily.saturation],
    ['valLabel', m.colorFamily.value],
    ['micaLabel', m.mica.amount],
    ['micaBrightnessLabel', m.mica.brightness],
    ['micaDensityLabel', m.mica.density],
    ['crackOpacityLabel', m.lead.opacity],
    ['micaOpacityLabel', m.mica.opacity],
    ['glassOpacityLabel', m.glass.opacity],
    ['opacityLabel', silhouetteOpacity.value],
    ['scaleLabel', silhouetteScale.value],
    ['positionXLabel', positionX.value],
    ['positionYLabel', positionY.value],
    ['globalOpacityLabel', globalOpacity.value],
    ['globalScaleLabel', globalScale.value],
    ['globalXLabel', globalX.value],
    ['globalYLabel', globalY.value],
    ['textOpacityLabel', p.text.opacity],
    ['textSizeLabel', p.text.size],
    ['textXLabel', p.text.x],
    ['textYLabel', p.text.y],
    ['textRotationLabel', p.text.rotation],
    ['motionAmountLabel', p.motion.amount],
    ['motionDurationLabel', p.motion.duration],
  ])
    elements[id].textContent = v;
  for (const [id, active] of [
    ['portrait', g.orientation === 'portrait'],
    ['landscape', g.orientation === 'landscape'],
  ]) {
    elements[id].classList.toggle('selected', active);
    elements[id].setAttribute('aria-pressed', String(active));
  }
  elements.undo.disabled = !history.getState().canUndo;
  elements.redo.disabled = !history.getState().canRedo;
  elements.tileLabel.textContent = `Tile ${selected + 1}`;
  elements.seedLabel.textContent = g.seed;
  try {
    window.history.replaceState(null, '', `#${encodeURIComponent(g.seed)}`);
  } catch {}
}
let renderSequence = 0;
/**
 * Re-renders the preview. A sequence counter (`renderSequence`) is taken first so that, when
 * motif assets load asynchronously, only the most recent call is allowed to apply its result.
 */
async function render() {
  const sequence = ++renderSequence,
    p = validSelection(),
    project = state(),
    used = Object.values(project.tiles)
      .map((x) => x.silhouette)
      .filter(Boolean);
  try {
    if (project.motifLibrary === CURRENT_LIBRARY)
      loadedMotifAssets = {
        ...loadedMotifAssets,
        ...(await loadCharcoalAssets(used)),
      };
  } catch (error) {
    if (sequence === renderSequence)
      elements.status.textContent = `Motif asset failed to load: ${error.message}`;
  }
  if (sequence !== renderSequence) return;
  stage.innerHTML = panelToSVG(p, project.tiles, {
    motifLibrary: project.motifLibrary,
    motifAssets: loadedMotifAssets,
    text: project.text,
    motion: project.motion,
  });
  stage.querySelectorAll('.tile').forEach((t) => {
    const active = +t.dataset.tile === selected;
    t.classList.toggle('selected', active);
    t.setAttribute('role', 'option');
    t.setAttribute('aria-selected', String(active));
    t.tabIndex = active ? 0 : -1;
    t.onclick = () => select(+t.dataset.tile);
    t.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select(+t.dataset.tile);
      } else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        select(moveTileSelection(selected, e.key, p.polygons.length));
        stage.querySelector(`[data-tile="${selected}"]`)?.focus();
      }
    };
  });
  syncControls();
}
/** Selects tile `id`, re-renders, and announces it through the aria-live #status element. */
function select(id) {
  selected = id;
  render();
  elements.status.textContent = `Selected tile ${selected + 1} of ${panel().polygons.length}`;
}
/** Applies `command` as one undo step and re-renders. */
function execute(label, command) {
  history.execute(label, command);
  render();
}
// begin()/end() open and close the drag transaction used by continuous(). The `transaction`
// flag makes both idempotent, because history.begin() throws when a transaction is already open.
function begin(label) {
  if (!transaction) {
    history.begin(label);
    transaction = true;
  }
}
function end() {
  if (transaction) {
    history.end();
    transaction = false;
    render();
  }
}
/**
 * Binds a slider/input so one drag is a single undo step: pointerdown/first input opens a history
 * transaction, each input applies `command(project, element.value)`, change/blur closes it.
 */
function continuous(element, label, command) {
  element.onpointerdown = () => begin(label);
  element.oninput = () => {
    begin(label);
    history.execute(label, (p) => command(p, element.value));
    render();
  };
  element.onchange = end;
  element.onblur = end;
}
// Adapters from a control's string value to a command: material(path) sets one material
// field; tile(key) overrides one key on whichever tile is selected when the input fires.
const material =
    (path, convert = Number) =>
    (p, value) =>
      setMaterial(path, convert(value))(p),
  tile =
    (key, convert = (x) => x) =>
    (p, value) =>
      setTileOverride(String(selected), { [key]: convert(value) })(p);
continuous(tileColor, 'Tile color', tile('color'));
continuous(silhouetteColor, 'Motif color', tile('silhouetteColor'));
continuous(
  silhouetteOpacity,
  'Motif opacity',
  tile('opacity', (v) => +v / 100)
);
continuous(
  silhouetteScale,
  'Motif scale',
  tile('scale', (v) => +v / 100)
);
continuous(positionX, 'Motif position', tile('positionX', Number));
continuous(positionY, 'Motif position', tile('positionY', Number));
tileSilhouette.onchange = () =>
  execute(
    'Tile motif',
    setTileOverride(String(selected), { silhouette: tileSilhouette.value })
  );
for (const [e, label, path, convert] of [
  [lead, 'Lead width', ['lead', 'width'], Number],
  [hue, 'Hue', ['colorFamily', 'hue'], Number],
  [sat, 'Saturation', ['colorFamily', 'saturation'], Number],
  [val, 'Value', ['colorFamily', 'value'], Number],
  [mica, 'Mica amount', ['mica', 'amount'], Number],
  [micaBrightness, 'Mica brightness', ['mica', 'brightness'], Number],
  [micaDensity, 'Mica density', ['mica', 'density'], Number],
  [
    crackColor1,
    'Lead color',
    ['lead', 'colors'],
    (v) => [v, state().material.lead.colors[1]],
  ],
  [
    crackColor2,
    'Lead color',
    ['lead', 'colors'],
    (v) => [state().material.lead.colors[0], v],
  ],
  [
    micaColor1,
    'Mica color',
    ['mica', 'colors'],
    (v) => [v, state().material.mica.colors[1]],
  ],
  [
    micaColor2,
    'Mica color',
    ['mica', 'colors'],
    (v) => [state().material.mica.colors[0], v],
  ],
  [crackOpacity, 'Lead opacity', ['lead', 'opacity'], Number],
  [micaOpacity, 'Mica opacity', ['mica', 'opacity'], Number],
  [glassOpacity, 'Glass opacity', ['glass', 'opacity'], Number],
])
  continuous(e, label, material(path, convert));
leadStyle.onchange = () =>
  execute('Lead style', setMaterial(['lead', 'style'], leadStyle.value));
/** Applies `patch` to every tile of the current geometry as one undo step; other override keys are kept. */
function globalEdit(label, patch) {
  history.execute(label, (p) => {
    const pn = makePanel(panelOptions(p));
    for (const x of pn.polygons) setTileOverride(String(x.id), patch)(p);
    return p;
  });
  render();
}
globalSilhouette.onchange = () =>
  globalEdit('All tile motifs', { silhouette: globalSilhouette.value });
for (const [e, label, key, convert] of [
  [globalOpacity, 'All motif opacity', 'opacity', (v) => +v / 100],
  [globalScale, 'All motif scale', 'scale', (v) => +v / 100],
  [globalX, 'All motif position', 'positionX', Number],
  [globalY, 'All motif position', 'positionY', Number],
])
  continuous(e, label, (p, v) => {
    const pn = makePanel(panelOptions(p));
    for (const x of pn.polygons)
      setTileOverride(String(x.id), { [key]: convert(v) })(p);
    return p;
  });
textContent.onchange = () =>
  execute('Text content', setText({ content: textContent.value }));
textColor.onchange = () =>
  execute('Text color', setText({ color: textColor.value }));
textFont.onchange = () =>
  execute('Text font', setText({ font: textFont.value }));
textAlign.onchange = () =>
  execute('Text alignment', setText({ align: textAlign.value }));
textClip.onchange = () =>
  execute('Text clipping', setText({ clip: textClip.checked }));
motionEnabled.onchange = () =>
  execute('Glass motion', setMotion({ enabled: motionEnabled.checked }));
for (const [e, label, key] of [
  [textOpacity, 'Text opacity', 'opacity'],
  [textSize, 'Text size', 'size'],
  [textX, 'Text position', 'x'],
  [textY, 'Text position', 'y'],
  [textRotation, 'Text rotation', 'rotation'],
])
  continuous(e, label, (p, v) => setText({ [key]: Number(v) })(p));
for (const [e, label, key] of [
  [motionAmount, 'Motion amount', 'amount'],
  [motionDuration, 'Motion duration', 'duration'],
])
  continuous(e, label, (p, v) => setMotion({ [key]: Number(v) })(p));
elements.clearTile.onclick = () =>
  execute('Reset tile', resetTile(String(selected)));
count.onchange = () =>
  execute('Piece count', changeGeometry({ pieceCount: +count.value }));
elements.portrait.onclick = () =>
  execute('Portrait orientation', changeGeometry({ orientation: 'portrait' }));
elements.landscape.onclick = () =>
  execute(
    'Landscape orientation',
    changeGeometry({ orientation: 'landscape' })
  );
seed.onkeydown = (e) => {
  if (e.key === 'Enter')
    execute('Seed', changeGeometry({ seed: seed.value || 'aventurine' }));
};
elements.generate.onclick = () =>
  execute(
    'Generate',
    changeGeometry({
      seed: seed.value || state().geometry.seed,
      pieceCount: +count.value,
    })
  );
// Surprise is the one non-deterministic control: it picks a random seed and hue; generation
// from the resulting seed is still deterministic.
elements.surprise.onclick = () =>
  execute('Surprise', (p) => {
    changeGeometry({ seed: crypto.randomUUID().slice(0, 8) })(p);
    setMaterial(['colorFamily', 'hue'], Math.floor(Math.random() * 360))(p);
    return p;
  });
// Only the hue of the picked color is used (RGB to HSV hue); saturation and value are left as set.
color.onchange = () => {
  const x = color.value,
    r = parseInt(x.slice(1, 3), 16) / 255,
    g = parseInt(x.slice(3, 5), 16) / 255,
    b = parseInt(x.slice(5, 7), 16) / 255,
    max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min;
  let h = 0;
  if (d)
    h =
      max === r
        ? 60 * (((g - b) / d) % 6)
        : max === g
          ? 60 * ((b - r) / d + 2)
          : 60 * ((r - g) / d + 4);
  execute(
    'Color family',
    setMaterial(['colorFamily', 'hue'], Math.round((h + 360) % 360))
  );
};
elements.undo.onclick = () => {
  history.undo();
  render();
};
elements.redo.onclick = () => {
  history.redo();
  render();
};
elements.svg.onclick = async () => {
  try {
    save(
      new Blob([await renderProjectSVG(state())], { type: 'image/svg+xml' }),
      `lightwell-${safe(state().geometry.seed)}.svg`
    );
  } catch (error) {
    elements.status.textContent = `SVG export failed: ${error.message}`;
  }
};
elements.saveProject.onclick = () => {
  const file = projectFile(state());
  save(
    new Blob([file.text], { type: file.mime }),
    `lightwell-${safe(state().geometry.seed)}${file.extension}`
  );
  baseline = serializeProject(state());
  elements.status.textContent = 'Project saved';
};
elements.openProject.onclick = () => elements.projectFile.click();
elements.projectFile.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const p = parseProject(await file.text());
    history.replace(p, 'Open project');
    baseline = serializeProject(p);
    render();
    elements.status.textContent = 'Project opened';
  } catch (error) {
    elements.status.textContent = error.message;
  } finally {
    e.target.value = '';
  }
};
// Ctrl/Cmd+Z undoes, with Shift redoes. Clicking the buttons means a disabled one does nothing.
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    (e.shiftKey ? elements.redo : elements.undo).click();
  }
});
window.addEventListener('beforeunload', (e) => {
  if (isDirty()) {
    e.preventDefault();
    e.returnValue = '';
  }
});
render();
