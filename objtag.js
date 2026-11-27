'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined'||typeof state==='undefined')return;
const isP=p=>!!p&&String(p.name).indexOf('Личное: ')===0;
function suffixer(){
 const by=new Map(state.tasks.map(t=>[t.id,t])),pj=new Map(state.projects.map(p=>[p.id,p]));
 return id=>{const t=by.get(id),p=t&&pj.get(t.projectId);return p&&!isP(p)?' ('+p.name+')':'';};
}
function addText(el,s){
 if(!el||!s||el.dataset.ot)return;
 el.dataset.ot='1';
 el.appendChild(document.createTextNode(s));
}
function tag(){
 if(!state||!state.tasks||!state.projects)return;
 const root=document.querySelector('#content .ppage');
 if(!root)return;
 const sf=suffixer();
 root.querySelectorAll('.gantt .grow').forEach(r=>{
  if(r.classList.contains('ghead'))return;
  const bar=r.querySelector('.bar[data-id]');
  if(!bar)return;
  const s=sf(bar.dataset.id),lb=r.querySelector('.glabel');
  if(lb&&!lb.dataset.ot){
   lb.dataset.ot='1';
   const sm=lb.querySelector('small');
   if(sm)sm.remove();
   if(s){lb.appendChild(document.createTextNode(s));lb.title=(lb.title||'')+s;}
  }
  if(s&&!bar.dataset.ot){bar.dataset.ot='1';bar.title=(bar.title||'')+s;}
  addText(bar.querySelector('.bt'),s);
 });
 root.querySelectorAll('.pday .pb[data-bid]').forEach(b=>{
  const s=sf(b.dataset.bid),tx=b.querySelector('.ptx');
  if(!tx||tx.dataset.ot||!s)return;
  tx.dataset.ot='1';
  const bold=tx.querySelector('b'),n=bold&&bold.nextSibling;
  if(n&&n.nodeType===3)n.textContent+=s;
  else tx.appendChild(document.createTextNode(s));
 });
 root.querySelectorAll('.pfree .pf [data-action="taskEdit"]').forEach(btn=>{
  const s=sf(btn.dataset.id);
  if(!s||btn.dataset.ot)return;
  btn.dataset.ot='1';
  const n=btn.firstChild;
  if(n&&n.nodeType===3)n.textContent+=s;
 });
}
let tm=0;
const run=()=>{clearTimeout(tm);tm=setTimeout(()=>{try{tag();}catch(e){}},80);};
const oR=render;
render=function(){const r=oR.apply(this,arguments);run();return r;};
const cont=document.getElementById('content');
if(cont)new MutationObserver(run).observe(cont,{childList:true,subtree:true});
if(state)run();
})();
