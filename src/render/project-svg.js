import { makePanel, panelToSVG } from "../generator.js";
import { normalizeProject, panelOptions, serializeProject } from "../model/schema.js";

function hash(text){let h=2166136261;for(const c of text){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
function escapeText(value){return String(value).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))}
function namespaceIds(svg,prefix){const ids=[...svg.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);for(const id of ids){const next=`${prefix}-${id}`;svg=svg.replaceAll(`id="${id}"`,`id="${next}"`).replaceAll(`url(#${id})`,`url(#${next})`)}return svg}

export function projectHash(project){return hash(serializeProject(project))}
export function renderProjectSVG(input){
  const project=normalizeProject(input),canonical=serializeProject(project),prefix=`lw-${hash(canonical)}`;
  const panel=makePanel(panelOptions(project));
  let svg=panelToSVG(panel,project.tiles);
  svg=namespaceIds(svg,prefix);
  svg=svg.replace(" role=\"img\"",` data-lightwell-project="${prefix}" role="img"`);
  svg=svg.replace(">\u003cdefs",`><title>${escapeText(project.geometry.seed)} - Lightwell stained glass</title><desc>Deterministic Lightwell project, schema version ${project.version}</desc><metadata>${escapeText(canonical)}</metadata><defs`);
  svg=svg.replace(/(<rect width="100%"[^>]*>)/,`<g id="${prefix}-background" data-lightwell-layer="background">$1</g>`);
  svg=svg.replace(/(<ellipse cx="48%"[^>]*>)/,`<g id="${prefix}-lighting" data-lightwell-layer="lighting">$1</g>`);
  svg=svg.replace(/(<rect x="[^>]+pointer-events="none"[^>]*>)(<\/svg>)$/,`<g id="${prefix}-frame" data-lightwell-layer="frame">$1</g>$2`);
  return svg;
}
