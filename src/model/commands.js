export const setMaterial=(path,value)=>project=>{let target=project.material;for(const key of path.slice(0,-1))target=target[key];target[path.at(-1)]=value;return project};
export const setTileOverride=(tileKey,patch)=>project=>{project.tiles[tileKey]={...(project.tiles[tileKey]||{}),...patch};return project};
export const resetTile=tileKey=>project=>{delete project.tiles[tileKey];return project};
export const changeGeometry=patch=>project=>{project.geometry={...project.geometry,...patch};return project};
export const setText=patch=>project=>{project.text={...project.text,...patch};return project};
export const setMotion=patch=>project=>{project.motion={...project.motion,...patch};return project};
