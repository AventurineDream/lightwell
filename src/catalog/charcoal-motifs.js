import { CURRENT_LIBRARY, motifEntry } from "./motif-manifest.js";
const cache=new Map();
const bytesToDataUrl=bytes=>{if(typeof Buffer!=="undefined")return`data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;let binary="";for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));return`data:image/png;base64,${btoa(binary)}`};
export async function loadCharcoalDataUrl(id,{fetcher=fetch}={}){if(cache.has(id))return cache.get(id);const entry=motifEntry(CURRENT_LIBRARY,id);if(!entry||entry.library.type!=="png")return null;const promise=fetcher(entry.library.assetUrl).then(async response=>{if(!response.ok)throw new Error(`Unable to load motif asset: ${id}`);return bytesToDataUrl(new Uint8Array(await response.arrayBuffer()))});cache.set(id,promise);try{return await promise}catch(error){cache.delete(id);throw error}}
export async function loadCharcoalAssets(ids,options){return Object.fromEntries(await Promise.all([...new Set(ids)].map(async id=>[id,await loadCharcoalDataUrl(id,options)])))}
export function clearCharcoalCache(){cache.clear()}
