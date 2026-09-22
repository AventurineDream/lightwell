import { CURRENT_LIBRARY, LEGACY_LIBRARY, hasMotif } from "../catalog/motif-manifest.js";
export const PROJECT_SCHEMA = "lightwell.project";
export const PROJECT_VERSION = 4;

const defaults = Object.freeze({
  seed: "different forms, one curious practice", orientation: "portrait", pieceCount: 32,
  hue: 282, saturation: 38, value: 84, leadWidth: 9, leadStyle: "ink",
  crackColors: ["#35243a", "#76507a"], crackOpacity: 100,
  micaAmount: 0, micaBrightness: 75, micaDensity: 12,
  micaColors: ["#fffbe8", "#b9e8ff"], micaOpacity: 100, glassOpacity: 100,
  textContent:"",textColor:"#fff6dc",textOpacity:100,textSize:72,textX:50,textY:50,textRotation:0,textFont:"serif",textAlign:"middle",textClip:true,
  motionEnabled:false,motionAmount:6,motionDuration:8
});
const clamp=(value,min,max,fallback)=>Number.isFinite(Number(value))?Math.min(max,Math.max(min,Number(value))):fallback;
const color=(value,fallback)=>/^#[0-9a-f]{6}$/i.test(String(value))?String(value).toLowerCase():fallback;
const clone=value=>JSON.parse(JSON.stringify(value));
const tileKeys=new Set(["color","silhouette","silhouetteColor","opacity","scale","positionX","positionY"]);
export function normalizeTileOverrides(value={},motifLibrary=CURRENT_LIBRARY) {
  if(!value||typeof value!=="object"||Array.isArray(value))return{};
  const result={};
  for(const [rawKey,raw] of Object.entries(value)){
    if(!/^[a-z0-9_-]{1,64}$/i.test(rawKey)||!raw||typeof raw!=="object"||Array.isArray(raw))continue;
    const unknown=Object.keys(raw).filter(key=>!tileKeys.has(key));
    if(unknown.length)throw new TypeError(`Unknown tile override key: ${unknown[0]}`);
    const tile={};
    if("color" in raw)tile.color=color(raw.color,"#9b70b4");
    if("silhouette" in raw)tile.silhouette=hasMotif(motifLibrary,raw.silhouette)?raw.silhouette:"none";
    if("silhouetteColor" in raw)tile.silhouetteColor=color(raw.silhouetteColor,"#171019");
    if("opacity" in raw)tile.opacity=clamp(raw.opacity,0,1,.72);
    if("scale" in raw)tile.scale=clamp(raw.scale,.2,3,1);
    if("positionX" in raw)tile.positionX=clamp(raw.positionX,-100,100,0);
    if("positionY" in raw)tile.positionY=clamp(raw.positionY,-100,100,0);
    if(Object.keys(tile).length)result[rawKey]=tile;
  }
  return result;
}

export function createProject(input={}) {
  const d={...defaults,...input};
  const motifLibrary=[LEGACY_LIBRARY,CURRENT_LIBRARY].includes(d.motifLibrary)?d.motifLibrary:CURRENT_LIBRARY;
  const orientation=d.orientation==="landscape"?"landscape":"portrait";
  return {
    schema:PROJECT_SCHEMA,version:PROJECT_VERSION,motifLibrary,
    geometry:{seed:String(d.seed||defaults.seed).slice(0,256),orientation,pieceCount:clamp(d.pieceCount,5,70,32),generator:"voronoi-v1",generatorVersion:1},
    material:{
      colorFamily:{hue:clamp(d.hue,0,359,282),saturation:clamp(d.saturation,0,100,38),value:clamp(d.value,10,100,84)},
      glass:{opacity:clamp(d.glassOpacity,10,100,100)},
      lead:{style:["ink","lightning","straight","wavy","branch","crackle"].includes(d.leadStyle)?d.leadStyle:"ink",width:clamp(d.leadWidth,3,16,9),opacity:clamp(d.crackOpacity,0,100,100),colors:[color(d.crackColors?.[0],defaults.crackColors[0]),color(d.crackColors?.[1],defaults.crackColors[1])]},
      mica:{amount:clamp(d.micaAmount,0,100,0),brightness:clamp(d.micaBrightness,10,100,75),density:clamp(d.micaDensity,2,60,12),opacity:clamp(d.micaOpacity,0,100,100),colors:[color(d.micaColors?.[0],defaults.micaColors[0]),color(d.micaColors?.[1],defaults.micaColors[1])]}
    },
    defaults:{tile:{motifId:"none",motifColor:"#171019",motifOpacity:.72,scale:1,x:0,y:0}},
    text:{content:String(d.text?.content??d.textContent??"").slice(0,500),color:color(d.text?.color??d.textColor,"#fff6dc"),opacity:clamp(d.text?.opacity??d.textOpacity,0,100,100),size:clamp(d.text?.size??d.textSize,12,240,72),x:clamp(d.text?.x??d.textX,0,100,50),y:clamp(d.text?.y??d.textY,0,100,50),rotation:clamp(d.text?.rotation??d.textRotation,-180,180,0),font:["serif","sans-serif","monospace","cursive"].includes(d.text?.font??d.textFont)?(d.text?.font??d.textFont):"serif",align:["start","middle","end"].includes(d.text?.align??d.textAlign)?(d.text?.align??d.textAlign):"middle",clip:(d.text?.clip??d.textClip)!==false},
    motion:{enabled:Boolean(d.motion?.enabled??d.motionEnabled),amount:clamp(d.motion?.amount??d.motionAmount,0,30,6),duration:clamp(d.motion?.duration??d.motionDuration,2,30,8),mode:"drift-v1"},
    tiles:normalizeTileOverrides(d.tiles,motifLibrary),export:{metadata:true}
  };
}

export function normalizeProject(value={}) {
  if(value.schema!==PROJECT_SCHEMA||value.version!==PROJECT_VERSION) throw new TypeError("Unsupported Lightwell project");
  return createProject({motifLibrary:value.motifLibrary,seed:value.geometry?.seed,orientation:value.geometry?.orientation,pieceCount:value.geometry?.pieceCount,hue:value.material?.colorFamily?.hue,saturation:value.material?.colorFamily?.saturation,value:value.material?.colorFamily?.value,glassOpacity:value.material?.glass?.opacity,leadStyle:value.material?.lead?.style,leadWidth:value.material?.lead?.width,crackOpacity:value.material?.lead?.opacity,crackColors:value.material?.lead?.colors,micaAmount:value.material?.mica?.amount,micaBrightness:value.material?.mica?.brightness,micaDensity:value.material?.mica?.density,micaOpacity:value.material?.mica?.opacity,micaColors:value.material?.mica?.colors,text:value.text,motion:value.motion,tiles:value.tiles});
}

export function panelOptions(project) {
  const p=normalizeProject(project),g=p.geometry,m=p.material;
  return {seed:g.seed,cells:g.pieceCount,width:g.orientation==="portrait"?900:1200,height:g.orientation==="portrait"?1100:760,hue:m.colorFamily.hue,saturation:m.colorFamily.saturation,value:m.colorFamily.value,glassOpacity:m.glass.opacity,lead:m.lead.width,leadStyle:m.lead.style,crackColor1:m.lead.colors[0],crackColor2:m.lead.colors[1],crackOpacity:m.lead.opacity,mica:m.mica.amount,micaBrightness:m.mica.brightness,micaDensity:m.mica.density,micaColor1:m.mica.colors[0],micaColor2:m.mica.colors[1],micaOpacity:m.mica.opacity};
}

export function serializeProject(project){return JSON.stringify(normalizeProject(project));}
