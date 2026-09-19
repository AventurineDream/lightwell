import { normalizeProject } from "./schema.js";
const clone=value=>JSON.parse(JSON.stringify(value));
export function createStore(initial){let state=normalizeProject(initial),listeners=new Set();return{getState:()=>clone(state),replace(next){state=normalizeProject(next);for(const fn of listeners)fn(clone(state));return clone(state)},update(mutator){const draft=clone(state);const result=mutator(draft)||draft;return this.replace(result)},subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}}}
