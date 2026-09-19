import test from"node:test";import assert from"node:assert/strict";import{hashSeed,rng,makePanel,panelToSVG,hsvToHex,colorFamily,silhouettes,leadStyles}from"../src/generator.js";test("same seed is reproducible",()=>assert.equal(panelToSVG(makePanel({seed:"amaranth"})),panelToSVG(makePanel({seed:"amaranth"}))));test("different seeds differ",()=>assert.notEqual(hashSeed("amaranth"),hashSeed("aventurine")));test("rng normalized",()=>{const r=rng("glass");for(let i=0;i<100;i++){const n=r();assert.ok(n>=0&&n<1)}});test("polygons stay inside frame",()=>{const p=makePanel({seed:"bounds",width:320,height:480,cells:50});for(const c of p.polygons)for(const q of c.points){assert.ok(q.x>=0&&q.x<=320);assert.ok(q.y>=0&&q.y<=480)}});test("HSV conversion is exact",()=>{assert.equal(hsvToHex(0,100,100),"#ff0000");assert.equal(hsvToHex(120,100,100),"#00ff00");assert.equal(hsvToHex(240,100,100),"#0000ff")});test("color family generates valid panel",()=>{assert.equal(colorFamily(282,38,84).length,7);assert.match(panelToSVG(makePanel({hue:282,saturation:38,value:84})),/<polygon/)});test("accessible label escapes seed",()=>assert.match(panelToSVG(makePanel({seed:"<violet & gold>"})),/&lt;violet &amp; gold&gt;/));
test("per-tile styles export independently",()=>{const p=makePanel({seed:"tiles",cells:12});const svg=panelToSVG(p,{0:{color:"#ff0000",silhouette:"leaf",silhouetteColor:"#00ff00",opacity:.5,scale:1.5,positionX:25,positionY:-20},1:{color:"#0000ff"}});assert.match(svg,/data-tile="0"/);assert.match(svg,/#ff0000/);assert.match(svg,/#00ff00/);assert.match(svg,/opacity="0.5"/);assert.match(svg,/#0000ff/);assert.match(svg,/transform="translate\(/);assert.match(svg,/data-scale="1.5"/);assert.match(svg,/data-x="25"/);assert.match(svg,/data-y="-20"/);assert.match(svg,/translate\(-450 -550\)/);});

test("silhouette library has a few dozen exportable motifs",()=>{assert.ok(silhouettes.length>=30);const p=makePanel({seed:"library",cells:12});for(const [kind] of silhouettes.filter(([k])=>k!=="none")){const svg=panelToSVG(p,{0:{silhouette:kind}});assert.ok(svg.includes(`data-tile="0"`)&&svg.includes(`data-scale="1"`),kind)}});
test("portrait and landscape dimensions are deterministic",()=>{const a=makePanel({seed:"orientation",width:900,height:1100}),b=makePanel({seed:"orientation",width:1200,height:760});assert.equal(a.width,900);assert.equal(a.height,1100);assert.equal(b.width,1200);assert.equal(b.height,760);assert.equal(panelToSVG(a),panelToSVG(makePanel({seed:"orientation",width:900,height:1100}))) });

test("mica shimmer is deterministic",()=>{const p=makePanel({seed:"mica",cells:12,mica:70,micaBrightness:88,micaDensity:30});const a=panelToSVG(p),b=panelToSVG(p);assert.equal(a,b);assert.equal((a.match(/class="mica"/g)||[]).length,p.polygons.length);assert.match(a,/data-mica="70"/);assert.match(a,/data-brightness="88"/);assert.match(a,/data-density="30"/)});

test("all six lead styles are deterministic and distinct",()=>{assert.equal(leadStyles.length,6);const outputs=leadStyles.map(([leadStyle])=>panelToSVG(makePanel({seed:"lead",leadStyle})));assert.equal(new Set(outputs).size,6);for(let i=0;i<outputs.length;i++)assert.equal(outputs[i],panelToSVG(makePanel({seed:"lead",leadStyle:leadStyles[i][0]})))});
test("crack and mica gradients preserve both selected colors",()=>{const svg=panelToSVG(makePanel({seed:"gradients",crackColor1:"#123456",crackColor2:"#abcdef",mica:90,micaColor1:"#fedcba",micaColor2:"#654321"}));for(const color of ["#123456","#abcdef","#fedcba","#654321"])assert.match(svg,new RegExp(color));assert.match(svg,/id="crackChaos"/);assert.match(svg,/id="micaChaos"/);assert.match(svg,/fill="url\(#micaChaos\)"/)})

test("five-piece panels and material opacity export",()=>{const p=makePanel({seed:"five",cells:5,glassOpacity:42,crackOpacity:37,mica:80,micaOpacity:31});assert.equal(p.polygons.length,5);const svg=panelToSVG(p,{0:{silhouette:"moth",opacity:.28}});assert.match(svg,/stroke-opacity="0.37"/);assert.match(svg,/opacity="0.3[0-9]"/);assert.match(svg,/class="motif"/);assert.match(svg,/opacity="0.28"/)})

import { confirmDestructive, decodeSeedHash, hasTileEdits } from "../src/guardrails.js";

test("destructive actions require confirmation only when tile edits exist", () => {
  assert.equal(hasTileEdits({}), false);
  assert.equal(hasTileEdits({ 2: { color: "#ff0000" } }), true);
  let prompts = 0;
  assert.equal(confirmDestructive(false, () => { prompts++; return false; }), true);
  assert.equal(prompts, 0);
  assert.equal(confirmDestructive(true, () => { prompts++; return false; }), false);
  assert.equal(prompts, 1);
});

test("malformed seed hashes fall back instead of throwing", () => {
  assert.equal(decodeSeedHash("#violet%20glass"), "violet glass");
  assert.equal(decodeSeedHash("#%"), "different forms, one curious practice");
  assert.equal(decodeSeedHash("#", "fallback"), "fallback");
});
