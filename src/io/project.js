import { migrateProject } from "../model/migrations.js";
import { normalizeProject, serializeProject } from "../model/schema.js";
export const PROJECT_MIME="application/vnd.lightwell.project+json";
export const PROJECT_EXTENSION=".lightwell.json";
const forbidden=new Set(["__proto__","prototype","constructor"]);
function inspect(value,depth=0){if(depth>12)throw new TypeError("Project nesting is too deep");if(value&&typeof value==="object"){for(const key of Object.keys(value)){if(forbidden.has(key))throw new TypeError("Unsafe project key");inspect(value[key],depth+1)}}}
export function parseProject(text,{maxBytes=1_000_000}={}){if(typeof text!=="string")throw new TypeError("Project input must be text");if(new TextEncoder().encode(text).length>maxBytes)throw new RangeError("Project file is too large");let raw;try{raw=JSON.parse(text)}catch{throw new SyntaxError("Project file is not valid JSON")}inspect(raw);const migrated=migrateProject(raw);if(Object.keys(migrated.tiles||{}).length>500)throw new RangeError("Project has too many tile overrides");return normalizeProject(migrated)}
export function projectFile(project){return{mime:PROJECT_MIME,extension:PROJECT_EXTENSION,text:serializeProject(project)}}
