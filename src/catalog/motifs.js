import { silhouettes } from "../generator.js";
export const motifDefinitions=Object.freeze(silhouettes.map(([id,label])=>Object.freeze({id,label,revision:1,tags:id==="none"?["utility"]:["built-in","silhouette"]})));
export function motifOptions(documentRef=document){return motifDefinitions.map(({id,label})=>{const option=documentRef.createElement("option");option.value=id;option.textContent=label;return option})}
