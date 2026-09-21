import { motifOptions } from "../catalog/motifs.js";
export function populateMotifSelects(selects,documentRef=document,library){for(const select of selects){const value=select.value;select.replaceChildren(...motifOptions(documentRef,library));if([...select.options].some(x=>x.value===value))select.value=value}}
export function moveTileSelection(current,key,count){if(!count)return 0;if(key==="ArrowRight"||key==="ArrowDown")return(current+1)%count;if(key==="ArrowLeft"||key==="ArrowUp")return(current-1+count)%count;return current}
