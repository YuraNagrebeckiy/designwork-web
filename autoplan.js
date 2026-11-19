'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined'||typeof state==='undefined')return;
const NL=String.fromCharCode(10),SM='Слот: ',PX=56,H0=7,Q=0.25,MINH=0.5,CAP1=4;
const WORK=[[9,13],[14,18]];
const tm=v=>{let h=Math.floor(v+1e-9),m=Math.round((v-h)*60);if(m===60){h++;m=0;}return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');};
const clampH=v=>Math.max(6,Math.min(21,Math.round(v/Q)*Q));
const st=document.createElement('style');
st.textContent='.pday .pab{position:absolute;z-index:1;box-sizing:border-box;left:54px;right:8px;border-radius:8px;padding:4px 8px;font-size:12px;line-height:1.25;overflow:hidden;background:hsl(var(--h),70%,92%);border:1px dashed hsl(var(--h),50%,50%);border-left:5px dashed hsl(var(--h),50%,50%);color:#27304d;touch-action:none;cursor:grab;user-select:none}html[data-theme=dark] .pday .pab{background:hsl(var(--h),28%,24%);color:#eef0fa}.pday .pab small{opacity:.7}.pday .pab i{font-style:normal;opacity:.65;font-size:10px;margin-left:4px}.pday .pab .rz{position:absolute;left:0;right:0;height:8px;cursor:ns-resize;z-index:3}.pday .pab .rz.t{top:0}.pday .pab .rz.b{bottom:0}.pday .pab .rz::after{content:"";position:absolute;left:50%;margin-left:-14px;width:28px;height:3px;border-radius:3px;background:rgba(0,0,0,.28);top:2px}.pday .pab.dr{opacity:.85;z-index:5;cursor:grabbing;box-shadow:0 6px 18px #0005}';
document.head.appendChild(st);
const isOff=d=>!!(window.studioCal&&window.studioCal.kind&&window.studioCal.kind(d));
const hrsOf=t=>Number(t.hours)>0?Number(t.hours):0;
const hasSlotOn=(t,day)=>String(t.note||'').split(NL).some(l=>l.indexOf(SM+day+' ')===0);

function freeWindows(occ,from){
 let out=WORK.map(w=>[Math.max(w[0],from),w[1]]).filter(w=>w[1]-w[0]>=Q-1e-9);
 occ.slice().sort((a,b)=>a[0]-b[0]).forEach(o=>{
  const nx=[];
  out.forEach(w=>{
   if(o[1]<=w[0]||o[0]>=w[1]){nx.push(w);return;}
   if(o[0]>w[0])nx.push([w[0],o[0]]);
   if(o[1]<w[1])nx.push([o[1],w[1]]);
  });
  out=nx;
 });
 return out.filter(w=>w[1]-w[0]>=Q-1e-9);
}
function planHours(items,F){
 const cap=t=>t.span>=2?F:Math.min(CAP1,F);
 const list=items.slice().sort((a,b)=>a.end.localeCompare(b.end)||b.span-a.span||a.start.localeCompare(b.start)||String(a.id).localeCompare(String(b.id)));
 const maxN=Math.floor(F/MINH+1e-9),use=list.slice(0,maxN),skipped=list.slice(maxN);
 const res=new Map();
 let left=F,act=use.map(t=>Object.assign({w:t.span>=2?2:1},t));
 for(let it=0;it<12&&act.length;it++){
  const W=act.reduce((s,t)=>s+t.w,0),hit=act.filter(t=>left*t.w/W>cap(t)+1e-9);
  if(!hit.length)break;
  hit.forEach(t=>{res.set(t.id,cap(t));left-=cap(t);});
  act=act.filter(t=>hit.indexOf(t)<0);
 }
 if(act.length){
  const W=act.reduce((s,t)=>s+t.w,0),units=Math.floor(left/Q+1e-9);
  const raw=act.map(t=>units*t.w/W),base=raw.map(Math.floor);
  let rest=units-base.reduce((a,b)=>a+b,0);
  raw.map((r,i)=>[r-Math.floor(r),i]).sort((a,b)=>b[0]-a[0]).forEach(p=>{if(rest>0){base[p[1]]++;rest--;}});
  const minU=Math.round(MINH/Q);
  for(let i=0;i<base.length;i++){
   while(base[i]<minU){
    let j=-1;base.forEach((v,k)=>{if(v>minU&&(j<0||v>base[j]))j=k;});
    if(j<0)break;
    base[j]--;base[i]++;
   }
  }
  act.forEach((t,i)=>res.set(t.id,Math.max(MINH,base[i]*Q)));
 }
 return {order:use,hours:res,skipped:skipped};
}
function layout(order,hours,wins){
 const pieces=[];
 let wi=0,pos=wins.length?wins[0][0]:0;
 order.forEach(t=>{
  let need=hours.get(t.id)||0;
  const total=need;
  while(need>1e-9&&wi<wins.length){
   const w=wins[wi],room=w[1]-pos;
   if(room<=1e-9){wi++;if(wins[wi])pos=wins[wi][0];continue;}
   const take=Math.min(room,need);
   pieces.push({id:t.id,s:pos,e:pos+take,total:total});
   pos+=take;need-=take;
  }
 });
 return pieces;
}
window.studioAuto={freeWindows:freeWindows,planHours:planHours,layout:layout};

function draw(){
 document.querySelectorAll('.pab,#pab_note').forEach(n=>n.remove());
 if(!state||!state.tasks)return;
 document.querySelectorAll('.ppage .pday[data-day]').forEach(box=>{
  if(box.closest('.pcols'))return;
  const day=box.dataset.day;
  if(isOff(day))return;
  const by=new Map(state.tasks.map(t=>[t.id,t]));
  const ids=[...document.querySelectorAll('.ppage .pfree [data-pplan]')].map(b=>b.dataset.pplan);
  const items=[];
  ids.forEach(id=>{
   const t=by.get(id);
   if(!t||t.status==='Готово'||hrsOf(t)||hasSlotOn(t,day))return;
   items.push({id:t.id,title:t.title,start:t.start,end:t.end,span:Math.max(1,days(t.start,t.end)+1)});
  });
  if(!items.length)return;
  const occ=[...box.querySelectorAll('.pb')].map(b=>{
   const top=parseFloat(b.style.top),h=parseFloat(b.style.height);
   return [H0+top/PX,H0+(top+h+2)/PX];
  });
  let from=9;
  if(day===today()){const d=new Date();from=Math.max(9,Math.ceil((d.getHours()+d.getMinutes()/60)/Q)*Q);}
  const wins=freeWindows(occ,from),F=wins.reduce((s,w)=>s+(w[1]-w[0]),0);
  const note=document.createElement('p');
  note.className='notice';note.id='pab_note';
  if(F<MINH-1e-9){note.textContent='Свободного рабочего времени на этот день не осталось. Задачи ниже можно поставить на другой день.';box.after(note);return;}
  const pl=planHours(items,F),pieces=layout(pl.order,pl.hours,wins);
  const idx=new Map(pl.order.map((t,i)=>[t.id,i]));
  pieces.forEach(p=>{
   const t=by.get(p.id),par=t.parentId&&by.get(t.parentId),el=document.createElement('div');
   el.className='pab';
   el.dataset.aid=p.id;el.dataset.s=p.s;el.dataset.e=p.e;el.dataset.total=p.total;
   el.style.cssText='top:'+((p.s-H0)*PX)+'px;height:'+Math.max(26,(p.e-p.s)*PX-2)+'px;--h:'+((idx.get(p.id)*47+20)%360);
   el.innerHTML='<span class="rz t"></span><b>'+tm(p.s)+'–'+tm(p.e)+'</b> '+esc(t.title)+(par?'<small> · '+esc(par.title)+'</small>':'')+'<i>авто</i><span class="rz b"></span>';
   box.appendChild(el);
  });
  note.textContent='Пунктирные блоки — автоматическое распределение свободного времени: задачи на несколько дней получают больше времени, остальные делят день поровну.'+(pl.skipped.length?' Не поместилось задач: '+pl.skipped.length+' (их можно поставить на другой день).':'')+' Перетащите или растяните блок, чтобы закрепить время; остальные задачи подвинутся сами.';
  box.after(note);
 });
}

async function pin(id,day,s,h){
 const tk=state.tasks.find(x=>x.id===id);
 if(!tk)return;
 const ls=String(tk.note||'').split(NL);
 while(ls.length&&!ls[ls.length-1])ls.pop();
 ls.push(SM+day+' '+tm(clampH(s))+' '+Math.max(Q,Math.min(8,h)));
 try{
  await call('taskUpdate',{id:tk.id,version:tk.version,note:ls.join(NL)});
  await reload();
  render();
 }catch(err){toast(err.message||String(err));render();}
}
let dr=null,noClick=0;
window.addEventListener('pointerdown',e=>{
 const b=e.target.closest&&e.target.closest('.pab');
 if(!b)return;
 e.stopPropagation();
 const rz=e.target.closest('.rz');
 dr={b:b,y0:e.clientY,top0:parseFloat(b.style.top),h0:parseFloat(b.style.height),mode:rz?(rz.classList.contains('t')?'rt':'rb'):'mv',moved:false};
 try{b.setPointerCapture(e.pointerId);}catch(x){}
},true);
window.addEventListener('pointermove',e=>{
 if(!dr)return;
 e.stopPropagation();
 const dy=e.clientY-dr.y0;
 if(Math.abs(dy)>5)dr.moved=true;
 if(!dr.moved)return;
 const b=dr.b;
 b.classList.add('dr');
 if(dr.mode==='mv')b.style.top=(dr.top0+dy)+'px';
 else if(dr.mode==='rb')b.style.height=Math.max(18,dr.h0+dy)+'px';
 else{const nh=Math.max(18,dr.h0-dy);b.style.top=(dr.top0+dr.h0-nh)+'px';b.style.height=nh+'px';}
},true);
window.addEventListener('pointerup',e=>{
 if(!dr)return;
 const d=dr;dr=null;
 d.b.classList.remove('dr');
 if(!d.moved)return;
 e.stopPropagation();
 noClick=Date.now()+400;
 const top=parseFloat(d.b.style.top),ht=parseFloat(d.b.style.height),id=d.b.dataset.aid,day=d.b.closest('.pday').dataset.day,total=Number(d.b.dataset.total);
 if(d.mode==='mv')pin(id,day,H0+top/PX,total);
 else{
  const s=H0+top/PX,en=H0+(top+ht+2)/PX,oh=(d.h0+2)/PX;
  pin(id,day,s,Math.max(Q,total+((en-s)-oh)));
 }
},true);
window.addEventListener('pointercancel',()=>{if(dr){dr.b.classList.remove('dr');dr=null;draw();}},true);
window.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('.pab');
 if(!b)return;
 e.stopPropagation();e.preventDefault();
 if(Date.now()<noClick)return;
 const btn=document.querySelector('[data-pplan="'+b.dataset.aid+'"]');
 if(!btn)return;
 const s=Number(b.dataset.s),h=Number(b.dataset.total);
 btn.click();
 setTimeout(()=>{const t=document.getElementById('sl_t'),hh=document.getElementById('sl_h');if(t)t.value=tm(s);if(hh)hh.value=h;},80);
},true);
const oR=render;
render=function(){const r=oR.apply(this,arguments);try{draw();}catch(e){}return r;};
if(state)try{draw();}catch(e){}
})();
