import { CURRENT_LIBRARY, motifManifest } from "./motif-manifest.js";
export function motifDefinitionsForLibrary(library=CURRENT_LIBRARY){return Object.freeze(motifManifest.filter(x=>x.libraries[library]).map(x=>Object.freeze({id:x.id,label:x.label,revision:x.libraries[library].revision,tags:x.tags})))}
export const motifDefinitions=motifDefinitionsForLibrary();
export function motifOptions(documentRef=document,library=CURRENT_LIBRARY){return motifDefinitionsForLibrary(library).map(({id,label})=>{const option=documentRef.createElement("option");option.value=id;option.textContent=label;return option})}
