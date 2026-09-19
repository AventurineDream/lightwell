import { motifOptions } from "../catalog/motifs.js";
export function populateMotifSelects(selects,documentRef=document){for(const select of selects){select.replaceChildren(...motifOptions(documentRef))}}
export function moveTileSelection(current,key,count){if(!count)return 0;if(key==="ArrowRight"||key==="ArrowDown")return(current+1)%count;if(key==="ArrowLeft"||key==="ArrowUp")return(current-1+count)%count;return current}
