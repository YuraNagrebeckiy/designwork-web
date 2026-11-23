'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined'||typeof state==='undefined')return;
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;};
const DEF=()=>matchMedia('(max-width:760px)').matches?160:230;
const MINW=44,fd=d=>d.slice(8)+'.'+d.slice(5,7);
let lw=Number(LS('dwLabW'))||0;
const maxW=()=>Math.max(MINW,Math.floor(window.innerWidth*0.8));
const cur=()=>Math.max(MINW,Math.min(lw>=MINW?lw:DEF(),maxW()));
const st=document.createElement('style');
st.textContent='html body .gantt .glabel{flex:0 0 var(--dwlw,230px)!important;width:var(--dwlw,230px)!important;min-width:0}html body .gantt .depsvg{left:var(--dwlw,230px)!important}.lwr{position:absolute;top:0;bottom:0;right:0;width:14px;cursor:col-resize;touch-action:none;z-index:6}.lwr::after{content:"";position:absolute;top:50%;right:4px;width:4px;height:28px;margin-top:-14px;border-radius:3px;background:var(--accent);opacity:.4}.lwr:hover::after,.lwr.on::after{opacity:1}.mygantt .bar .hd.r{position:absolute;top:0;bottom:0;right:0;width:14px;cursor:ew-resize;touch-action:none}.mygantt .bar .hd.r::after{content:"";position:absolute;right:3px;top:6px;bottom:6px;width:3px;border-radius:2px;background:rgba(0,0,0,.4)}#hdtip{position:fixed;z-index:2147483000;background:var(--ink);color:var(--panel);padding:3px 8px;border-radius:6px;font-size:12px;pointer-events:none}';
document.head.appendChild(st);
function apply(){
 const w=cur();
 document.documentElement.style.setProperty('--dwlw',w+'px');
 document.querySelectorAll('.gantt').forEach(g=>{
  const head=g.querySelector('.ghead .track');
  if(head){if(!g.dataset.tw)g.dataset.tw=String(parseFloat(head.style.width)||head.offsetWidth);g.style.width=(Number(g.dataset.tw)+w)+'px';}
  g.querySelectorAll('.todayline').forEach(t=>{
   if(t.dataset.l0===undefined){t.dataset.l0=String(parseFloat(t.style.left)||0);t.dataset.lw0=String(DEF());}
   t.style.left=(Number(t.dataset.l0)-Number(t.dataset.lw0)+w)+'px';
  });
  g.querySelectorAll('.holl').forEach(h=>{h.style.left=w+'px';});
 });
}
function handles(){
 document.querySelectorAll('.gantt .glabel').forEach(l=>{
  if(l.querySelector('.lwr'))return;
  const h=document.createElement('span');
  h.className='lwr';
  h.title='Потяните, чтобы изменить ширину колонки. Двойной щелчок — свернуть или вернуть.';
  l.appendChild(h);
 });
}
function barHandles(){
 if(typeof admin!=='function'||!admin())return;
 document.querySelectorAll('.ppage .mygantt .gantt[data-min]').forEach(g=>{
  const min=g.dataset.min,DAY=Number(g.dataset.day),head=g.querySelector('.ghead .track');
  if(!head||!DAY)return;
  const last=plus(min,Math.round((Number(g.dataset.tw)||parseFloat(head.style.width))/DAY)-1);
  g.querySelectorAll('.bar[data-id]').forEach(b=>{
   if(b.querySelector('.hd'))return;
   const t=state.tasks.find(x=>x.id===b.dataset.id);
   if(!t||t.end>last||t.status==='Готово')return;
   const h=document.createElement('span');
   h.className='hd r';
   h.title='Потяните вправо или влево, чтобы изменить срок окончания';
   b.appendChild(h);
  });
 });
}
let drag=null,bd=null,noClick=0;
function tip(x,y,s){
 let t=document.getElementById('hdtip');
 if(!t){t=document.createElement('div');t.id='hdtip';document.body.appendChild(t);}
 t.textContent=s;t.style.left=(x+12)+'px';t.style.top=(y-30)+'px';
}
function untip(){const t=document.getElementById('hdtip');if(t)t.remove();}
document.addEventListener('pointerdown',e=>{
 const tg=e.target&&e.target.closest?e.target:null;
 if(!tg)return;
 const h=tg.closest('.lwr');
 if(h){
  e.preventDefault();e.stopPropagation();
  drag={x:e.clientX,w:cur()};
  h.classList.add('on');
  try{h.setPointerCapture(e.pointerId);}catch(x){}
  return;
 }
 const bh=tg.closest('.mygantt .bar .hd.r');
 if(bh){
  const b=bh.closest('.bar'),g=b.closest('.gantt'),t=state.tasks.find(x=>x.id===b.dataset.id);
  if(!t)return;
  e.preventDefault();e.stopPropagation();
  bd={b:b,t:t,DAY:Number(g.dataset.day),a:t.start<g.dataset.min?g.dataset.min:t.start,x:e.clientX,w:parseFloat(b.style.width),moved:false,end:t.end};
  try{bh.setPointerCapture(e.pointerId);}catch(x){}
 }
},true);
document.addEventListener('pointermove',e=>{
 if(drag){lw=Math.round(Math.max(MINW,Math.min(drag.w+e.clientX-drag.x,maxW())));apply();return;}
 if(bd){
  const dx=e.clientX-bd.x;
  if(Math.abs(dx)>4)bd.moved=true;
  if(!bd.moved)return;
  const nd=Math.max(1,Math.round((bd.w+dx)/bd.DAY));
  bd.b.style.width=(nd*bd.DAY)+'px';
  bd.end=plus(bd.a,nd-1);
  tip(e.clientX,e.clientY,'срок до '+fd(bd.end));
 }
},true);
document.addEventListener('pointerup',()=>{
 if(drag){drag=null;LS('dwLabW',String(lw));document.querySelectorAll('.lwr.on').forEach(x=>x.classList.remove('on'));return;}
 if(bd){
  const d=bd;bd=null;untip();
  if(!d.moved)return;
  noClick=Date.now()+400;
  if(d.end===d.t.end){render();return;}
  guarded(async()=>{try{await call('taskUpdate',{id:d.t.id,version:d.t.version,end:d.end});await reload();}finally{render();}});
 }
},true);
document.addEventListener('pointercancel',()=>{if(bd){bd=null;untip();render();}if(drag)drag=null;},true);
document.addEventListener('dblclick',e=>{
 const h=e.target&&e.target.closest&&e.target.closest('.lwr');
 if(!h)return;
 lw=cur()>MINW+6?MINW:DEF();
 LS('dwLabW',String(lw));
 apply();
},true);
document.addEventListener('click',e=>{
 if(Date.now()<noClick||(e.target&&e.target.closest&&e.target.closest('.lwr'))){e.stopImmediatePropagation();e.preventDefault();}
},true);
window.addEventListener('resize',()=>{try{apply();}catch(e){}});
const oR=render;
render=function(){
 const r=oR.apply(this,arguments);
 try{handles();barHandles();apply();}catch(e){}
 return r;
};
})();
