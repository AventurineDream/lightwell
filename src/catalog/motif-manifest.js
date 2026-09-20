export const LEGACY_LIBRARY="legacy-vector-v1";
export const CURRENT_LIBRARY="charcoal-v1";
const rows=[
["leaf","Laurel leaf"],["moon","Crescent moon"],["spark","North star"],["sun","Radiant sun"],["flower","Irises"],["fern","Fern frond"],["mushroom","Mushroom"],["moth","Luna moth"],["bird","Bird in flight"],["cat","Cat"],["fox","Fox face"],["rabbit","Rabbit"],["fish","Koi"],["snake","Serpent"],["shell","Spiral shell"],["mountain","Mountains"],["wave","Ocean wave"],["cloud","Cloud"],["rain","Rain cloud"],["flame","Flame"],["eye","Oracle eye"],["hand","Open hand"],["heart","Anatomical heart"],["key","Antique key"],["crown","Crown"],["hourglass","Hourglass"],["lantern","Lantern"],["bottle","Potion bottle"],["crystal","Crystal cluster"],["planet","Ringed planet"],["comet","Comet"],["constellation","Constellation"],["arch","Garden arch"],["tower","Tower"],["door","Open door"],["muse","Art Nouveau Muse",false],["husky","Husky",false]
];
export const motifManifest=Object.freeze([
 Object.freeze({id:"none",label:"None",tags:Object.freeze(["utility"]),libraries:Object.freeze({[LEGACY_LIBRARY]:Object.freeze({revision:1,type:"none"}),[CURRENT_LIBRARY]:Object.freeze({revision:1,type:"none"})})}),
 ...rows.map(([id,label,legacy=true])=>Object.freeze({id,label,tags:Object.freeze(["built-in","silhouette","charcoal"]),libraries:Object.freeze({...legacy?{[LEGACY_LIBRARY]:Object.freeze({revision:1,type:"vector"})}:{},[CURRENT_LIBRARY]:Object.freeze({revision:1,type:"png",assetUrl:new URL(`../assets/motifs/${id}.png`,import.meta.url).href})})}))
]);
export const motifIds=Object.freeze(motifManifest.map(x=>x.id));
export const motifIdSet=new Set(motifIds);
export const motifById=new Map(motifManifest.map(x=>[x.id,x]));
export function hasMotif(library,id){return Boolean(motifById.get(id)?.libraries?.[library])}
export function motifEntry(library,id){const motif=motifById.get(id);return motif&&motif.libraries[library]?{...motif,library:motif.libraries[library]}:null}
