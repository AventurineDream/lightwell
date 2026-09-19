export function hsvToHex(h,s,v){h=((Number(h)%360)+360)%360;s=Math.max(0,Math.min(100,Number(s)))/100;v=Math.max(0,Math.min(100,Number(v)))/100;const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let a=[0,0,0];if(h<60)a=[c,x,0];else if(h<120)a=[x,c,0];else if(h<180)a=[0,c,x];else if(h<240)a=[0,x,c];else if(h<300)a=[x,0,c];else a=[c,0,x];return"#"+a.map(n=>Math.round((n+m)*255).toString(16).padStart(2,"0")).join("")}
export function colorFamily(hue,saturation,value,count=7){const offsets=[0,28,-32,58,-66,110,180];return Array.from({length:count},(_,i)=>hsvToHex(hue+offsets[i%offsets.length],Math.max(12,saturation-(i%3)*10),Math.min(100,value+(i%2)*7)))}
export function hashSeed(seed){let h=2166136261;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
export function rng(seed){let a=hashSeed(seed);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function clip(poly,a,b,c){const out=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],dp=a*p.x+b*p.y-c,dq=a*q.x+b*q.y-c,inside=dp<=1e-7,next=dq<=1e-7;if(inside)out.push(p);if(inside!==next){const t=dp/(dp-dq);out.push({x:p.x+t*(q.x-p.x),y:p.y+t*(q.y-p.y)})}}return out}
function cell(p,others,x0,x1,y0,y1){let poly=[{x:x0,y:y0},{x:x1,y:y0},{x:x1,y:y1},{x:x0,y:y1}];for(const q of others){poly=clip(poly,2*(q.x-p.x),2*(q.y-p.y),q.x*q.x+q.y*q.y-p.x*p.x-p.y*p.y);if(!poly.length)break}return poly}
export function makePanel({seed="aventurine",width=900,height=1100,cells=32,hue=282,saturation=38,value=84,lead=9}={}){const r=rng(seed),colors=colorFamily(hue,saturation,value),m=Math.min(width,height)*.06,pts=[];for(let i=0;i<cells;i++)pts.push({x:m+r()*(width-2*m),y:m+r()*(height-2*m),c:colors[Math.floor(r()*colors.length)]});pts.push({x:m,y:m,c:colors[0]},{x:width-m,y:m,c:colors[1]},{x:width-m,y:height-m,c:colors[2]},{x:m,y:height-m,c:colors[3]});return{seed,width,height,hue,saturation,value,lead,polygons:pts.map((p,i)=>({id:i,fill:p.c,points:cell(p,pts.filter((_,j)=>j!==i),m,width-m,m,height-m)})).filter(x=>x.points.length>2)}}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pts=x=>x.points.map(q=>`${q.x.toFixed(2)},${q.y.toFixed(2)}`).join(" ");
export const silhouettes=[
 ["none","None"],["leaf","Laurel leaf"],["moon","Crescent moon"],["spark","North star"],["sun","Radiant sun"],["flower","Wildflower"],["fern","Fern frond"],["mushroom","Mushroom"],["moth","Luna moth"],["bird","Bird in flight"],["cat","Cat"],["fox","Fox face"],["rabbit","Rabbit"],["fish","Koi"],["snake","Serpent"],["shell","Spiral shell"],["mountain","Mountains"],["wave","Ocean wave"],["cloud","Cloud"],["rain","Rain cloud"],["flame","Flame"],["eye","Oracle eye"],["hand","Open hand"],["heart","Anatomical heart"],["key","Antique key"],["crown","Crown"],["hourglass","Hourglass"],["lantern","Lantern"],["bottle","Potion bottle"],["crystal","Crystal cluster"],["planet","Ringed planet"],["comet","Comet"],["constellation","Constellation"],["arch","Garden arch"],["tower","Tower"],["door","Open door"]
];
function shape(kind,c,o){const f=`fill="${c}" opacity="${o}"`,st=`fill="none" stroke="${c}" stroke-width="55" stroke-linecap="round" stroke-linejoin="round" opacity="${o}"`;const d={
leaf:`<path ${f} d="M446 945C160 770 170 300 545 125c175 305 60 640-99 820z"/><path ${st} d="M445 875L520 220M458 690L290 555M478 510L625 405"/>`,
moon:`<path ${f} d="M680 145c-330 105-335 655 10 810C160 985 30 300 390 80c108-66 215-69 290-45-9 38-9 74 0 110z"/>`,
spark:`<path ${f} d="M450 55l105 365 325 130-325 130-105 365-105-365L20 550l325-130z"/>`,
sun:`<circle ${f} cx="450" cy="550" r="230"/><g ${st}>${[0,45,90,135,180,225,270,315].map(a=>`<path d="M450 95v110" transform="rotate(${a} 450 550)"/>`).join("")}</g>`,
flower:`<g ${f}>${[0,60,120,180,240,300].map(a=>`<ellipse cx="450" cy="315" rx="115" ry="225" transform="rotate(${a} 450 550)"/>`).join("")}<circle cx="450" cy="550" r="105"/></g>`,
fern:`<path ${st} d="M330 980Q500 680 490 130M440 820l-205-95M455 735l235-120M468 635l-210-110M477 535l205-120M484 430l-170-90M488 335l150-100"/>`,
mushroom:`<path ${f} d="M175 520Q210 160 450 130T725 520H175zm190 15h170l80 420H285z"/>`,
moth:`<path ${f} d="M435 390C230 90 45 250 175 585c70 180 200 145 260 35v290h30V620c60 110 190 145 260-35C855 250 670 90 465 390z"/><circle ${f} cx="450" cy="350" r="55"/>`,
bird:`<path ${f} d="M70 635q215-300 380-75 165-225 380 75-240-105-380 160Q310 530 70 635z"/>`,
cat:`<path ${f} d="M220 410l35-260 190 150 200-150 35 260q75 145 5 350T450 975Q285 960 215 760t5-350z"/><path d="M340 570l55 25M560 595l55-25" ${st}/>` ,
fox:`<path ${f} d="M105 205l285 130 60 625 60-625 285-130-85 560-260 220-260-220z"/><path fill="#fff" opacity=".45" d="M260 510l190 450 190-450-190 150z"/>`,
rabbit:`<path ${f} d="M300 415Q165 30 335 35q110 115 115 335Q460 35 570 35q170-5 35 380 165 100 110 350T450 1010 185 765q-55-250 115-350z"/>`,
fish:`<path ${f} d="M120 555q230-310 540 0-310 310-540 0zm530 0 200-210v420z"/><circle cx="305" cy="505" r="25" fill="#fff"/>`,
snake:`<path ${st} d="M630 135C155 120 740 420 300 555s275 300-40 455"/><path ${f} d="M590 90l180 55-145 120z"/>`,
shell:`<path ${st} d="M450 900C80 770 120 200 500 175c360-20 430 475 95 600-255 95-395-225-175-355 155-90 275 115 140 210-75 50-155-25-105-85"/>`,
mountain:`<path ${f} d="M20 950l285-570 120 210 150-430 305 790z"/><path fill="#fff" opacity=".45" d="M455 505l120-345 105 290-105-80z"/>`,
wave:`<path ${f} d="M35 770q170-500 515-370-170 25-185 190 315-205 500 95-145-105-270 45 135 25 235 180H35z"/>`,
cloud:`<path ${f} d="M150 770q-135-210 95-290 35-260 280-160 195-40 230 170 185 95 20 280z"/>`,
rain:`<path ${f} d="M145 590q-120-190 90-260 35-230 255-140 180-35 215 150 165 80 20 250z"/><g ${st}><path d="M260 700l-55 160M450 700l-55 160M640 700l-55 160"/></g>`,
flame:`<path ${f} d="M450 1010C95 815 265 565 390 430q110-120 65-355 345 260 260 575-65 265-265 360zm0-125q145-80 85-230-30-75-40-170-145 155-45 400z"/>`,
eye:`<path ${f} d="M45 550q405-450 810 0-405 450-810 0z"/><ellipse fill="#fff" opacity=".55" cx="450" cy="550" rx="145" ry="200"/><circle ${f} cx="450" cy="550" r="85"/>`,
hand:`<path ${f} d="M280 965l-35-420q-8-90 60-95 50 0 65 70V210q0-75 65-75t65 75v240-300q0-70 62-70t62 70v340-230q0-65 58-65t58 65v370q0 280-215 365z"/>`,
heart:`<path ${f} d="M450 1010C90 750 85 385 300 270q105-55 170 60 70-115 180-45 235 150 60 430z"/>`,
key:`<circle ${st} cx="300" cy="330" r="185"/><path ${st} d="M430 460l355 400M650 710l80-85M720 785l80-80"/>`,
crown:`<path ${f} d="M110 875L55 260l235 230 160-330 160 330 235-230-55 615z"/>`,
hourglass:`<path ${st} d="M235 120h430M235 980h430M290 145q0 250 160 405-160 155-160 405M610 145q0 250-160 405 160 155 160 405"/>`,
lantern:`<path ${f} d="M245 315h410l80 610H165z"/><path ${st} d="M330 305q0-210 120-210t120 210M265 520h370M300 850h300"/>`,
bottle:`<path ${f} d="M355 85h190v235q150 110 155 365 0 260-250 260S200 945 200 685q5-255 155-365z"/><path fill="#fff" opacity=".4" d="M245 650h410v235H245z"/>`,
crystal:`<path ${f} d="M70 930l110-480 160-185 110 170 135-330 190 330 70 495z"/>`,
planet:`<circle ${f} cx="450" cy="550" r="245"/><ellipse ${st} cx="450" cy="550" rx="410" ry="135" transform="rotate(-18 450 550)"/>`,
comet:`<path ${f} d="M610 185a180 180 0 11-1 360 180 180 0 011-360zM55 925l390-500 70 70zM150 980l405-430 45 85z"/>`,
constellation:`<g ${st}><path d="M150 820l155-420 190 175 235-390M305 400l-55-220M495 575l155 300"/></g><g ${f}>${[[150,820],[305,400],[495,575],[730,185],[250,180],[650,875]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="42"/>`).join("")}</g>`,
arch:`<path ${st} d="M175 970V500q0-390 275-390t275 390v470M300 970V520q0-215 150-215t150 215v450"/>`,
tower:`<path ${f} d="M245 985l45-690h75V125h80v170h90V125h80v170h75l45 690z"/><path fill="#fff" opacity=".45" d="M410 720h80v265h-80z"/>`,
door:`<path ${f} d="M210 985V280q0-190 240-190t240 190v705z"/><path fill="#fff" opacity=".45" d="M325 985V330q0-85 125-85t125 85v655z"/><circle ${f} cx="530" cy="650" r="28"/>`
};return d[kind]||""}
function motif(kind,color,opacity,polygon,scale=1,positionX=0,positionY=0){const xs=polygon.points.map(p=>p.x),ys=polygon.points.map(p=>p.y),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y,cx=x+w/2,cy=y+h/2,s=Math.max(.2,Math.min(3,scale)),dx=positionX*w/100,dy=positionY*h/100,transform=`translate(${cx+dx} ${cy+dy}) scale(${w/900*s} ${h/1100*s}) translate(-450 -550)`;const mark=shape(kind,color,opacity);return mark?`<g data-scale="${s}" data-x="${positionX}" data-y="${positionY}" transform="${transform}">${mark}</g>`:""}
export function panelToSVG(p,tileStyles={}){const clips=p.polygons.map(x=>`<clipPath id="tile-${x.id}"><polygon points="${pts(x)}"/></clipPath>`).join("");const tiles=p.polygons.map((x,i)=>{const style=tileStyles[x.id]||{},fill=style.color||x.fill,mark=motif(style.silhouette,style.silhouetteColor||"#171019",style.opacity??.72,x,style.scale??1,style.positionX??0,style.positionY??0);return`<g class="tile" data-tile="${x.id}" tabindex="0" aria-label="Glass tile ${i+1}"><polygon points="${pts(x)}" fill="${fill}" opacity="${(.82+(i%4)*.04).toFixed(2)}"/>${mark?`<g clip-path="url(#tile-${x.id})">${mark}</g>`:""}</g>`}).join("");return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${p.width} ${p.height}" role="img" aria-label="Seeded stained-glass panel ${esc(p.seed)}"><defs>${clips}<filter id="g"><feGaussianBlur stdDeviation="18"/></filter><linearGradient id="w" y2="1"><stop stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="100%" height="100%" rx="18" fill="#2b202d"/><ellipse cx="48%" cy="36%" rx="36%" ry="32%" fill="#fff4df" opacity=".25" filter="url(#g)"/><g stroke="#35243a" stroke-width="${p.lead}" stroke-linejoin="round">${tiles}</g><rect x="${p.lead/2}" y="${p.lead/2}" width="${p.width-p.lead}" height="${p.height-p.lead}" rx="14" fill="url(#w)" pointer-events="none" stroke="#35243a" stroke-width="${p.lead}"/></svg>`}
