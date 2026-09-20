import { CURRENT_LIBRARY, motifManifest } from "./motif-manifest.js";
export const motifDefinitions=Object.freeze(motifManifest.filter(x=>x.libraries[CURRENT_LIBRARY]).map(x=>Object.freeze({id:x.id,label:x.label,revision:x.libraries[CURRENT_LIBRARY].revision,tags:x.tags})));
export function motifOptions(documentRef=document){return motifDefinitions.map(({id,label})=>{const option=documentRef.createElement("option");option.value=id;option.textContent=label;return option})}
