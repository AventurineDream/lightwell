import { makePanel, panelToSVG } from "../generator.js";
import { normalizeProject, panelOptions, serializeProject } from "../model/schema.js";
function hash(text){let h=2166136261;for(const c of text){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
function escapeText(value){return String(value).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))}
export function projectHash(project){return hash(serializeProject(project))}
export function renderProjectSVG(input,{instanceNamespace}={}){
 const project=normalizeProject(input),canonical=serializeProject(project),projectPrefix=`lw-${hash(canonical)}`;
 const suffix=instanceNamespace===undefined?"":`-${hash(String(instanceNamespace))}`,prefix=`${projectPrefix}${suffix}`;
 const head=`<title>${escapeText(project.geometry.seed)} - Lightwell stained glass</title><desc>Deterministic Lightwell project, schema version ${project.version}</desc>${project.export.metadata?`<metadata>${escapeText(canonical)}</metadata>`:""}`;
 return panelToSVG(makePanel(panelOptions(project)),project.tiles,{idPrefix:prefix,head,rootAttributes:`data-lightwell-project="${projectPrefix}" data-lightwell-instance="${prefix}"`});
}
