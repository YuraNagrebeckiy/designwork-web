'use strict';
(function(){
const D=window.DIO;
const COLORS=['#1f2937','#e11d48','#f59e0b','#16a34a','#2563eb','#7c3aed','#ffffff','#facc15'];
const NOTE_BG=['#fde68a','#bbf7d0','#bfdbfe','#fbcfe8','#ddd6fe','#fed7aa'];
const EDIT_TOOLS=['pen','eraser','note','text','rect','ell','arrow'];
const st=document.createElement('style');
st.textContent=`#board{position:fixed;inset:0;z-index:2000;background:#f8fafc;display:flex;flex-direction:column}
#board.hidden{display:none!important}
#message{z-index:3000}
#bd_bar{display:flex;gap:6px;align-items:center;padding:6px 8px;background:var(--panel);border-bottom:1px solid var(--line);overflow-x:auto;white-space:nowrap;flex:none;touch-action:pan-x}
#bd_bar button{flex:none}
#bd_bar button.on{background:var(--accent);color:#fff;border-color:var(--accent)}
html[data-theme=dark] #bd_bar button.on{color:#15171d}
.bd_sw{flex:none;width:22px;height:22px;border-radius:50%;border:2px solid var(--line);cursor:pointer}
.bd_sw.on{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent)}
#bd_wrap{position:relative;flex:1;min-height:0;overflow:hidden}
#bd_cv{position:absolute;left:0;top:0;width:100%;height:100%;touch-action:none;display:block}
#bd_st{font-size:12px;color:var(--muted);flex:none;padding:0 6px}
.bd_ta{position:absolute;z-index:5;border:2px solid var(--accent);border-radius:6px;padding:6px;resize:none;color:#111;outline:0;overflow:auto;font-family:inherit;box-sizing:border-box}`;
document.head.appendChild(st);

let pid='',tid='',ov=null,cv=null,ctx=null,wrap=null;
let items={},rev=0,canEdit=false,shared=false;
let vp={x:0,y:0,k:1},tool='select',color=COLORS[0],width=3,noteN=0,sel='';
const dirty=new Set(),undo=[],redo=[],ptrs=new Map(),imgs={};
let need=false,saving=false,saveTimer=0,pollTimer=0,mode='',drag=null,spaceDown=false,editing=null,lastTap={t:0,id:''};

const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36);
const now=()=>Date.now();
const r1=v=>Math.round(v*10)/10;
const live=()=>Object.keys(items).map(k=>items[k]).filter(i=>!i.d).sort((a,b)=>(a.z||0)-(b.z||0));
const clone=o=>JSON.parse(JSON.stringify(o,(k,v)=>(k.charAt(0)==='_'?undefined:v)));
const snap=ids=>ids.map(id=>items[id]?clone(items[id]):null);
function setStat(t){const e=document.getElementById('bd_st');if(e)e.textContent=t;}
function inv(){need=true;}
function later(){setStat('Есть несохранённые изменения');clearTimeout(saveTimer);saveTimer=setTimeout(save,1200);}
function touch(i){if(!i)return;i.u=now();dirty.add(i.id);later();}
function push(ids,before){undo.push({ids:ids,b:before,a:snap(ids)});if(undo.length>200)undo.shift();redo.length=0;}
function apply(ids,snaps){
 ids.forEach((id,n)=>{
  const s=snaps[n];
  if(s){items[id]=s;}
  else if(items[id]){items[id].d=1;}
  if(items[id]){items[id].u=now();dirty.add(id);}
 });
 inv();later();
}
function doUndo(){if(!canEdit)return;const a=undo.pop();if(!a)return;redo.push(a);apply(a.ids,a.b);}
function doRedo(){if(!canEdit)return;const a=redo.pop();if(!a)return;undo.push(a);apply(a.ids,a.a);}
function delSel(){
 if(!canEdit||!sel||!items[sel])return;
 const b=snap([sel]);
 items[sel].d=1;touch(items[sel]);push([sel],b);
 sel='';inv();
}

const toW=(sx,sy)=>({x:(sx-vp.x)/vp.k,y:(sy-vp.y)/vp.k});
function pt(e){const r=cv.getBoundingClientRect();return {sx:e.clientX-r.left,sy:e.clientY-r.top};}
function resizable(i){return i.t==='rect'||i.t==='ell'||i.t==='note'||i.t==='img'||i.t==='text';}
function bb(i){
 if(i.t==='pen'||i.t==='arrow'){
  const p=i.p;let x1=1e9,y1=1e9,x2=-1e9,y2=-1e9;
  for(let k=0;k<p.length;k+=2){x1=Math.min(x1,p[k]);x2=Math.max(x2,p[k]);y1=Math.min(y1,p[k+1]);y2=Math.max(y2,p[k+1]);}
  const m=(i.s||3)/2+2;
  return {x:x1-m,y:y1-m,w:x2-x1+2*m,h:y2-y1+2*m};
 }
 if(i.t==='text')return {x:i.x,y:i.y,w:i._w||100,h:i._h||(i.s||24)*1.3};
 return {x:i.x,y:i.y,w:i.w,h:i.h};
}
function distSeg(px,py,x1,y1,x2,y2){
 const dx=x2-x1,dy=y2-y1,l=dx*dx+dy*dy;
 let t=l?((px-x1)*dx+(py-y1)*dy)/l:0;
 t=Math.max(0,Math.min(1,t));
 return Math.hypot(px-(x1+t*dx),py-(y1+t*dy));
}
function hitItem(i,x,y,tol){
 if(i.t==='pen'||i.t==='arrow'){
  const p=i.p,r=(i.s||3)/2+tol;
  if(p.length<4)return Math.hypot(x-p[0],y-p[1])<=r;
  for(let k=0;k<p.length-2;k+=2)if(distSeg(x,y,p[k],p[k+1],p[k+2],p[k+3])<=r)return true;
  return false;
 }
 const b=bb(i);
 return x>=b.x-tol&&x<=b.x+b.w+tol&&y>=b.y-tol&&y<=b.y+b.h+tol;
}
function pick(x,y){const tol=6/vp.k,l=live();for(let n=l.length-1;n>=0;n--)if(hitItem(l[n],x,y,tol))return l[n];return null;}

function getImg(fid){
 if(!D.okId(fid))return null;
 let im=imgs[fid];
 if(!im){im=new Image();im.onload=inv;im.onerror=()=>{im._bad=1;inv();};im.src=D.thumb(fid,1600);imgs[fid]=im;}
 return im;
}
function wrapText(t,maxW,f){
 ctx.font=f+'px sans-serif';
 const out=[];
 String(t||'').split('\n').forEach(par=>{
  let line='';
  par.split(' ').forEach(w=>{
   const test=line?line+' '+w:w;
   if(ctx.measureText(test).width>maxW&&line){out.push(line);line=w;}else line=test;
  });
  out.push(line);
 });
 return out;
}
function drawItem(i){
 ctx.save();
 if(i.t==='pen'){
  ctx.strokeStyle=i.c;ctx.lineWidth=i.s;ctx.lineCap='round';ctx.lineJoin='round';
  const p=i.p;
  ctx.beginPath();ctx.moveTo(p[0],p[1]);
  if(p.length<=2)ctx.lineTo(p[0]+0.1,p[1]);
  for(let k=2;k<p.length-2;k+=2)ctx.quadraticCurveTo(p[k],p[k+1],(p[k]+p[k+2])/2,(p[k+1]+p[k+3])/2);
  if(p.length>=4)ctx.lineTo(p[p.length-2],p[p.length-1]);
  ctx.stroke();
 }else if(i.t==='rect'){
  ctx.strokeStyle=i.c;ctx.lineWidth=i.s;ctx.strokeRect(i.x,i.y,i.w,i.h);
 }else if(i.t==='ell'){
  ctx.strokeStyle=i.c;ctx.lineWidth=i.s;ctx.beginPath();
  ctx.ellipse(i.x+i.w/2,i.y+i.h/2,Math.abs(i.w/2),Math.abs(i.h/2),0,0,Math.PI*2);ctx.stroke();
 }else if(i.t==='arrow'){
  const p=i.p;
  ctx.strokeStyle=i.c;ctx.fillStyle=i.c;ctx.lineWidth=i.s;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p[2],p[3]);ctx.stroke();
  const a=Math.atan2(p[3]-p[1],p[2]-p[0]),h=10+i.s*2;
  ctx.beginPath();ctx.moveTo(p[2],p[3]);
  ctx.lineTo(p[2]-h*Math.cos(a-0.4),p[3]-h*Math.sin(a-0.4));
  ctx.lineTo(p[2]-h*Math.cos(a+0.4),p[3]-h*Math.sin(a+0.4));
  ctx.closePath();ctx.fill();
 }else if(i.t==='note'){
  ctx.shadowColor='rgba(0,0,0,.18)';ctx.shadowBlur=8;ctx.shadowOffsetY=3;
  ctx.fillStyle=i.c;ctx.fillRect(i.x,i.y,i.w,i.h);
  ctx.shadowColor='transparent';
  const f=i.s||18,ls=wrapText(i.txt,i.w-16,f);
  ctx.fillStyle='#1f2937';ctx.font=f+'px sans-serif';ctx.textBaseline='top';
  ls.forEach((l,n)=>ctx.fillText(l,i.x+8,i.y+8+n*f*1.3));
 }else if(i.t==='text'){
  const f=i.s||24,ls=String(i.txt||'').split('\n');
  ctx.fillStyle=i.c;ctx.font=f+'px sans-serif';ctx.textBaseline='top';
  let mw=0;
  ls.forEach((l,n)=>{ctx.fillText(l,i.x,i.y+n*f*1.3);mw=Math.max(mw,ctx.measureText(l).width);});
  i._w=Math.max(mw,20);i._h=ls.length*f*1.3;
 }else if(i.t==='img'){
  const im=getImg(i.fid);
  if(im&&im.complete&&im.naturalWidth)ctx.drawImage(im,i.x,i.y,i.w,i.h);
  else{ctx.fillStyle='#e2e8f0';ctx.fillRect(i.x,i.y,i.w,i.h);ctx.fillStyle='#64748b';ctx.font='14px sans-serif';ctx.textBaseline='top';ctx.fillText(im&&im._bad?'Нет доступа к фото':'Загрузка…',i.x+10,i.y+10);}
 }
 ctx.restore();
}
function drawSel(i){
 const b=bb(i);
 ctx.save();
 ctx.strokeStyle='#2563eb';ctx.lineWidth=1.5/vp.k;ctx.setLineDash([6/vp.k,4/vp.k]);
 ctx.strokeRect(b.x,b.y,b.w,b.h);ctx.setLineDash([]);
 if(canEdit&&resizable(i)){const s=10/vp.k;ctx.fillStyle='#fff';ctx.fillRect(b.x+b.w-s/2,b.y+b.h-s/2,s,s);ctx.strokeRect(b.x+b.w-s/2,b.y+b.h-s/2,s,s);}
 ctx.restore();
}
function draw(){
 if(!cv)return;
 const dpr=window.devicePixelRatio||1,W=cv.width/dpr,H=cv.height/dpr;
 ctx.setTransform(dpr,0,0,dpr,0,0);
 ctx.fillStyle='#f8fafc';ctx.fillRect(0,0,W,H);
 const g=40*vp.k;
 if(g>12){
  ctx.fillStyle='#cbd5e1';
  const ox=((vp.x%g)+g)%g,oy=((vp.y%g)+g)%g;
  for(let x=ox;x<W;x+=g)for(let y=oy;y<H;y+=g)ctx.fillRect(x,y,1.5,1.5);
 }
 ctx.setTransform(dpr*vp.k,0,0,dpr*vp.k,dpr*vp.x,dpr*vp.y);
 live().forEach(drawItem);
 if(sel&&items[sel]&&!items[sel].d)drawSel(items[sel]);
}
function loop(){
 if(!ov||ov.classList.contains('hidden'))return;
 if(need){need=false;try{draw();}catch(e){}}
 requestAnimationFrame(loop);
}
function resize(){
 if(!cv||!wrap)return;
 const dpr=window.devicePixelRatio||1,r=wrap.getBoundingClientRect();
 cv.width=Math.max(1,Math.round(r.width*dpr));cv.height=Math.max(1,Math.round(r.height*dpr));
 inv();
}
function zoomAt(sx,sy,f){
 const nk=Math.max(0.05,Math.min(8,vp.k*f)),w=toW(sx,sy);
 vp.k=nk;vp.x=sx-w.x*nk;vp.y=sy-w.y*nk;inv();
}
function fit(){
 if(!cv)return;
 const l=live(),W=cv.clientWidth,H=cv.clientHeight;
 if(!l.length){vp={x:W/2,y:H/2,k:1};inv();return;}
 let x1=1e9,y1=1e9,x2=-1e9,y2=-1e9;
 l.forEach(i=>{const b=bb(i);x1=Math.min(x1,b.x);y1=Math.min(y1,b.y);x2=Math.max(x2,b.x+b.w);y2=Math.max(y2,b.y+b.h);});
 const m=40,k=Math.max(0.05,Math.min(2,Math.min((W-2*m)/Math.max(1,x2-x1),(H-2*m)/Math.max(1,y2-y1))));
 vp.k=k;vp.x=(W-(x2-x1)*k)/2-x1*k;vp.y=(H-(y2-y1)*k)/2-y1*k;inv();
}

function edit(i,isNew){
 commitEdit();
 const ta=document.createElement('textarea');
 ta.className='bd_ta';
 const b=bb(i),k=vp.k,fs=(i.s||(i.t==='note'?18:24))*k;
 ta.style.left=(b.x*k+vp.x)+'px';ta.style.top=(b.y*k+vp.y)+'px';
 ta.style.width=(i.t==='note'?Math.max(i.w*k,120):Math.max(180,b.w*k+40))+'px';
 ta.style.height=(i.t==='note'?Math.max(i.h*k,fs*2.4):Math.max(fs*2.6,b.h*k+20))+'px';
 ta.style.fontSize=fs+'px';
 ta.style.background=i.t==='note'?i.c:'#fffbe6';
 ta.value=i.txt||'';
 wrap.appendChild(ta);
 ta.focus();
 editing={ta:ta,id:i.id,isNew:!!isNew,b:snap([i.id])};
 ta.onblur=commitEdit;
 ta.onkeydown=e=>{if(e.key==='Escape')ta.blur();};
}
function commitEdit(){
 if(!editing)return;
 const E=editing;editing=null;
 const it=items[E.id],v=E.ta.value;
 E.ta.remove();
 if(!it)return;
 if(E.isNew){
  if(!v.trim()){delete items[E.id];sel='';inv();return;}
  it.txt=v;touch(it);push([it.id],[null]);
 }else if(v!==(it.txt||'')){
  it.txt=v;touch(it);push([it.id],E.b);
 }
 inv();
}

async function save(){
 if(!canEdit||!dirty.size)return;
 if(saving){later();return;}
 saving=true;
 const ids=Array.from(dirty);dirty.clear();
 const list=ids.map(id=>items[id]).filter(Boolean).map(clone);
 try{
  setStat('Сохранение…');
  const r=await D.fcall('boardSave',{projectId:pid,baseRev:rev,items:list},180000);
  rev=r.rev;
  if(r.items)mergeRemote(r.items);
  setStat(dirty.size?'Есть несохранённые изменения':'Сохранено');
 }catch(e){
  ids.forEach(id=>dirty.add(id));
  setStat('Не сохранено: '+(e.message||e));
  clearTimeout(saveTimer);saveTimer=setTimeout(save,5000);
 }finally{saving=false;}
}
function mergeRemote(remote){
 Object.keys(remote).forEach(id=>{
  const r=remote[id],l=items[id];
  if(dirty.has(id)||(drag&&drag.id===id))return;
  if(!l||Number(r.u)>Number(l.u))items[id]=r;
 });
 inv();
}
async function poll(){
 if(!ov||ov.classList.contains('hidden')||document.hidden||saving||dirty.size||mode)return;
 try{
  const r=await D.fcall('boardGet',{projectId:pid,rev:rev},40000);
  shared=!!r.shared;
  if(!r.same){rev=r.rev;mergeRemote(r.items||{});}
 }catch(e){}
}

async function addPhotos(fs){
 if(!canEdit)return;
 const arr=Array.from(fs).filter(f=>f.type.indexOf('image/')===0);
 let n=0;
 for(const f of arr){
  n++;
  try{
   setStat('Загрузка фото '+n+' из '+arr.length+'…');
   const id=await D.upload(tid,f,p=>setStat('Фото '+n+' из '+arr.length+' — '+p+'%'));
   await placeImage(id,f,n);
  }catch(e){setStat('Ошибка: '+(e.message||e));toast(e.message||String(e));}
 }
 if(arr.length)setStat('Готово');
}
async function placeImage(fid,file,n){
 const url=URL.createObjectURL(file);
 const dim=await new Promise(res=>{const im=new Image();im.onload=()=>res({w:im.naturalWidth,h:im.naturalHeight});im.onerror=()=>res({w:400,h:300});im.src=url;});
 URL.revokeObjectURL(url);
 const w=Math.min(360,dim.w||360),h=w*(dim.h||300)/(dim.w||400);
 const c=toW(cv.clientWidth/2,cv.clientHeight/2);
 const it={id:uid(),t:'img',x:c.x-w/2+n*24,y:c.y-h/2+n*24,w:w,h:h,fid:fid,z:now(),u:now()};
 items[it.id]=it;touch(it);push([it.id],[null]);
 sel=it.id;inv();
}

function pinchInit(){
 const a=Array.from(ptrs.values()),mx=(a[0].sx+a[1].sx)/2,my=(a[0].sy+a[1].sy)/2;
 const d=Math.hypot(a[0].sx-a[1].sx,a[0].sy-a[1].sy)||1,w=toW(mx,my);
 return {k0:vp.k,d0:d,wx:w.x,wy:w.y};
}
function panInit(p){return {sx:p.sx,sy:p.sy,vx:vp.x,vy:vp.y};}
function eraseAt(w){
 const tol=8/vp.k;
 live().forEach(i=>{
  if(hitItem(i,w.x,w.y,tol)&&drag.ids.indexOf(i.id)<0){drag.b.push(clone(i));drag.ids.push(i.id);i.d=1;}
 });
 inv();
}
function setTool(t){
 commitEdit();tool=t;applyTools();
 if(cv)cv.style.cursor=t==='hand'?'grab':(t==='select'?'default':'crosshair');
}
function onDown(e){
 if(e.button===2)return;
 try{cv.setPointerCapture(e.pointerId);}catch(x){}
 commitEdit();
 const p=pt(e);
 ptrs.set(e.pointerId,p);
 if(ptrs.size===2){
  if(mode==='draw'&&drag&&items[drag.id])delete items[drag.id];
  mode='pinch';drag=pinchInit();return;
 }
 if(ptrs.size>2)return;
 const w=toW(p.sx,p.sy);
 if(e.button===1||tool==='hand'||spaceDown||(!canEdit&&tool!=='select')){mode='pan';drag=panInit(p);return;}
 if(tool==='select'){
  const c=sel&&items[sel]&&!items[sel].d?items[sel]:null;
  if(c&&canEdit&&resizable(c)){
   const b=bb(c),hs=16/vp.k;
   if(Math.abs(w.x-(b.x+b.w))<hs&&Math.abs(w.y-(b.y+b.h))<hs){mode='resize';drag={id:c.id,o:clone(c),b:snap([c.id]),w0:b.w};return;}
  }
  const it=pick(w.x,w.y);
  if(it){
   sel=it.id;inv();
   if(canEdit&&(it.t==='note'||it.t==='text')&&lastTap.id===it.id&&now()-lastTap.t<400){lastTap={t:0,id:''};mode='';drag=null;edit(it,false);return;}
   lastTap={t:now(),id:it.id};
   if(canEdit){mode='move';drag={id:it.id,x0:w.x,y0:w.y,o:clone(it),b:snap([it.id]),moved:false};}
   else{mode='pan';drag=panInit(p);}
  }else{sel='';inv();mode='pan';drag=panInit(p);}
  return;
 }
 if(tool==='pen'){
  const id=uid();
  items[id]={id:id,t:'pen',p:[r1(w.x),r1(w.y)],c:color,s:width,z:now(),u:now()};
  mode='draw';drag={id:id};inv();return;
 }
 if(tool==='eraser'){mode='erase';drag={ids:[],b:[]};eraseAt(w);return;}
 if(tool==='rect'||tool==='ell'){
  const id=uid();
  items[id]={id:id,t:tool,x:w.x,y:w.y,w:0,h:0,c:color,s:width,z:now(),u:now()};
  mode='shape';drag={id:id,x0:w.x,y0:w.y};inv();return;
 }
 if(tool==='arrow'){
  const id=uid();
  items[id]={id:id,t:'arrow',p:[w.x,w.y,w.x,w.y],c:color,s:width,z:now(),u:now()};
  mode='shape';drag={id:id,x0:w.x,y0:w.y};inv();return;
 }
 if(tool==='note'||tool==='text'){mode='place';drag={w:w,sx:p.sx,sy:p.sy,ok:true};}
}
function onMove(e){
 const p=pt(e);
 if(ptrs.has(e.pointerId))ptrs.set(e.pointerId,p);
 if(mode==='pinch'&&ptrs.size>=2){
  const a=Array.from(ptrs.values()),mx=(a[0].sx+a[1].sx)/2,my=(a[0].sy+a[1].sy)/2;
  const d=Math.hypot(a[0].sx-a[1].sx,a[0].sy-a[1].sy)||1;
  const nk=Math.max(0.05,Math.min(8,drag.k0*d/drag.d0));
  vp.k=nk;vp.x=mx-drag.wx*nk;vp.y=my-drag.wy*nk;inv();return;
 }
 if(!mode||!drag)return;
 const w=toW(p.sx,p.sy);
 if(mode==='pan'){vp.x=drag.vx+(p.sx-drag.sx);vp.y=drag.vy+(p.sy-drag.sy);inv();return;}
 if(mode==='place'){if(Math.hypot(p.sx-drag.sx,p.sy-drag.sy)>8)drag.ok=false;return;}
 if(mode==='erase'){eraseAt(w);return;}
 const it=drag.id?items[drag.id]:null;
 if(!it)return;
 if(mode==='draw'){
  const L=it.p,lx=L[L.length-2],ly=L[L.length-1];
  if(Math.hypot(w.x-lx,w.y-ly)>1.2/vp.k){L.push(r1(w.x),r1(w.y));inv();}
 }else if(mode==='shape'){
  if(it.t==='arrow'){it.p[2]=w.x;it.p[3]=w.y;}
  else{it.x=Math.min(drag.x0,w.x);it.y=Math.min(drag.y0,w.y);it.w=Math.abs(w.x-drag.x0);it.h=Math.abs(w.y-drag.y0);}
  inv();
 }else if(mode==='move'){
  const dx=w.x-drag.x0,dy=w.y-drag.y0,o=drag.o;
  if(Math.abs(dx)+Math.abs(dy)>0.5)drag.moved=true;
  if(o.p)it.p=o.p.map((v,n)=>v+(n%2?dy:dx));
  else{it.x=o.x+dx;it.y=o.y+dy;}
  inv();
 }else if(mode==='resize'){
  const o=drag.o;
  if(it.t==='text')it.s=Math.max(8,Math.round(o.s*(w.x-o.x)/Math.max(20,drag.w0)));
  else{
   it.w=Math.max(20,w.x-it.x);
   it.h=it.t==='img'?it.w*o.h/o.w:Math.max(20,w.y-it.y);
  }
  inv();
 }
}
function onUp(e){
 const had=ptrs.has(e.pointerId);
 ptrs.delete(e.pointerId);
 if(mode==='pinch'){if(ptrs.size<2){mode='';drag=null;}return;}
 if(!had)return;
 const it=drag&&drag.id?items[drag.id]:null;
 if(mode==='draw'&&it){touch(it);push([it.id],[null]);}
 else if(mode==='shape'&&it){
  const tiny=it.t==='arrow'?Math.hypot(it.p[2]-it.p[0],it.p[3]-it.p[1])<4/vp.k:(it.w<4/vp.k||it.h<4/vp.k);
  if(tiny)delete items[it.id];
  else{touch(it);push([it.id],[null]);}
 }else if(mode==='move'&&it&&drag.moved){touch(it);push([it.id],drag.b);}
 else if(mode==='resize'&&it){touch(it);push([it.id],drag.b);}
 else if(mode==='erase'){
  drag.ids.forEach(id=>touch(items[id]));
  if(drag.ids.length)push(drag.ids,drag.b);
 }else if(mode==='place'&&drag.ok){
  const w=drag.w,id=uid();
  const n=tool==='note'
   ?{id:id,t:'note',x:w.x-80,y:w.y-60,w:160,h:120,c:NOTE_BG[noteN++%NOTE_BG.length],s:18,txt:'',z:now(),u:now()}
   :{id:id,t:'text',x:w.x,y:w.y,s:24,c:color,txt:'',z:now(),u:now()};
  items[id]=n;sel=id;
  setTool('select');
  edit(n,true);
 }
 if(mode!=='place'||!drag||!drag.ok){mode='';drag=null;}else{mode='';drag=null;}
 inv();
}

function applyTools(){
 if(!ov)return;
 ov.querySelectorAll('[data-tool]').forEach(b=>{
  const t=b.dataset.tool;
  b.classList.toggle('on',t===tool);
  b.style.display=(!canEdit&&EDIT_TOOLS.indexOf(t)>=0)?'none':'';
 });
 ov.querySelectorAll('.bd_sw').forEach(s=>{s.classList.toggle('on',s.dataset.c===color);s.style.display=canEdit?'':'none';});
 ov.querySelectorAll('[data-w]').forEach(b=>{b.classList.toggle('on',Number(b.dataset.w)===width);b.style.display=canEdit?'':'none';});
 ['photo','undo','redo','del'].forEach(k=>{const b=ov.querySelector('[data-bt='+k+']');if(b)b.style.display=canEdit?'':'none';});
}
function onBar(e){
 const b=e.target.closest('[data-tool],[data-bt],[data-c],[data-w]');
 if(!b)return;
 if(b.dataset.tool){setTool(b.dataset.tool);return;}
 if(b.dataset.c){
  color=b.dataset.c;
  const it=sel&&items[sel];
  if(it&&canEdit&&it.t!=='note'&&it.t!=='img'){const bf=snap([sel]);it.c=color;touch(it);push([sel],bf);}
  applyTools();inv();return;
 }
 if(b.dataset.w){
  width=Number(b.dataset.w);
  const it=sel&&items[sel];
  if(it&&canEdit&&(it.t==='pen'||it.t==='rect'||it.t==='ell'||it.t==='arrow')){const bf=snap([sel]);it.s=width;touch(it);push([sel],bf);}
  applyTools();inv();return;
 }
 const W=cv.clientWidth/2,H=cv.clientHeight/2;
 switch(b.dataset.bt){
  case 'close':closeBoard();break;
  case 'photo':document.getElementById('bd_file').click();break;
  case 'undo':doUndo();break;
  case 'redo':doRedo();break;
  case 'del':delSel();break;
  case 'zin':zoomAt(W,H,1.25);break;
  case 'zout':zoomAt(W,H,0.8);break;
  case 'fit':fit();break;
 }
}

function build(){
 if(ov)return;
 ov=document.createElement('div');ov.id='board';ov.className='hidden';
 ov.innerHTML=`<div id='bd_bar'><button type='button' data-bt='close'>← Закрыть</button><button type='button' data-tool='select' class='on'>Выбор</button><button type='button' data-tool='hand'>Рука</button><button type='button' data-tool='pen'>Кисть</button><button type='button' data-tool='eraser'>Ластик</button><button type='button' data-tool='note'>Заметка</button><button type='button' data-tool='text'>Текст</button><button type='button' data-tool='rect'>Рамка</button><button type='button' data-tool='ell'>Овал</button><button type='button' data-tool='arrow'>Стрелка</button><button type='button' data-bt='photo'>Фото</button>${COLORS.map(c=>`<span class='bd_sw' data-c='${c}' style='background:${c}'></span>`).join('')}<button type='button' data-w='2'>Тонко</button><button type='button' data-w='5'>Средне</button><button type='button' data-w='10'>Толсто</button><button type='button' data-bt='undo'>Отмена</button><button type='button' data-bt='redo'>Повтор</button><button type='button' data-bt='del'>Удалить</button><button type='button' data-bt='zout'>−</button><button type='button' data-bt='zin'>+</button><button type='button' data-bt='fit'>Вписать</button><span id='bd_st'></span><input id='bd_file' type='file' accept='image/*' multiple class='hidden'></div><div id='bd_wrap'><canvas id='bd_cv'></canvas></div>`;
 document.body.appendChild(ov);
 cv=document.getElementById('bd_cv');ctx=cv.getContext('2d');wrap=document.getElementById('bd_wrap');
 document.getElementById('bd_bar').addEventListener('click',onBar);
 document.getElementById('bd_file').addEventListener('change',e=>{const f=Array.from(e.target.files||[]);e.target.value='';addPhotos(f);});
 cv.addEventListener('pointerdown',onDown);
 cv.addEventListener('pointermove',onMove);
 cv.addEventListener('pointerup',onUp);
 cv.addEventListener('pointercancel',onUp);
 cv.addEventListener('contextmenu',e=>e.preventDefault());
 cv.addEventListener('wheel',e=>{e.preventDefault();const p=pt(e);zoomAt(p.sx,p.sy,Math.exp(-e.deltaY*0.0015));},{passive:false});
 ov.addEventListener('dragover',e=>e.preventDefault());
 ov.addEventListener('drop',e=>{e.preventDefault();addPhotos(e.dataTransfer.files||[]);});
}

async function openBoard(id){
 if(!state||!window.DIO)return;
 build();
 pid=id;tid='mood:'+id;
 items={};rev=0;undo.length=0;redo.length=0;dirty.clear();sel='';mode='';drag=null;
 ov.classList.remove('hidden');
 resize();
 vp={x:cv.clientWidth/2,y:cv.clientHeight/2,k:1};
 canEdit=false;applyTools();
 setStat('Загрузка доски…');
 inv();loop();
 try{
  const r=await D.fcall('boardGet',{projectId:id,rev:0},90000);
  items=r.items||{};rev=r.rev||0;canEdit=!!r.canEdit;shared=!!r.shared;
  applyTools();fit();
  setStat(canEdit?'Готово':'Только просмотр');
 }catch(e){
  setStat('Ошибка: '+(e.message||e));
 }
 clearInterval(pollTimer);pollTimer=setInterval(poll,4000);
}
async function closeBoard(){
 commitEdit();
 clearTimeout(saveTimer);
 if(dirty.size)await save();
 if(dirty.size&&!confirm('Не все изменения сохранены. Закрыть доску всё равно?'))return;
 clearInterval(pollTimer);
 if(ov)ov.classList.add('hidden');
}

window.addEventListener('resize',()=>{if(ov&&!ov.classList.contains('hidden'))resize();});
document.addEventListener('keydown',e=>{
 if(!ov||ov.classList.contains('hidden'))return;
 const tag=(e.target&&e.target.tagName)||'';
 if(tag==='TEXTAREA'||tag==='INPUT')return;
 if(e.code==='Space'){spaceDown=true;e.preventDefault();return;}
 if(e.key==='Delete'||e.key==='Backspace'){delSel();e.preventDefault();return;}
 const k=String(e.key).toLowerCase();
 if((e.ctrlKey||e.metaKey)&&k==='z'){if(e.shiftKey)doRedo();else doUndo();e.preventDefault();return;}
 if((e.ctrlKey||e.metaKey)&&k==='y'){doRedo();e.preventDefault();return;}
 if(e.key==='Escape'){commitEdit();sel='';inv();}
});
document.addEventListener('keyup',e=>{if(e.code==='Space')spaceDown=false;});
document.addEventListener('paste',e=>{
 if(!ov||ov.classList.contains('hidden')||!canEdit)return;
 const tag=(e.target&&e.target.tagName)||'';
 if(tag==='TEXTAREA'||tag==='INPUT')return;
 const fs=[];
 const list=(e.clipboardData&&e.clipboardData.items)?e.clipboardData.items:[];
 for(let n=0;n<list.length;n++){
  const it=list[n];
  if(it.kind==='file'&&String(it.type).indexOf('image/')===0){
   const f=it.getAsFile();
   if(f)fs.push(new File([f],'paste-'+Date.now()+'-'+n+'.png',{type:f.type}));
  }
 }
 if(fs.length){e.preventDefault();addPhotos(fs);}
});
window.addEventListener('beforeunload',e=>{if(dirty.size&&ov&&!ov.classList.contains('hidden')){e.preventDefault();e.returnValue='';}});

window.openBoard=openBoard;
})();
