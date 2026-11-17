'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined')return;
const HU=[262,28,174,330,48,205,350,120];
function paint(){
 const root=document.getElementById('ganttRoot');
 if(!root||typeof state==='undefined'||!state||!state.tasks)return;
 const rows=[...root.querySelectorAll('.grow')].filter(r=>!r.classList.contains('ghead')&&r.querySelector('.bar'));
 if(!rows.length)return;
 const A=x=>typeof arr==='function'?arr(x):(Array.isArray(x)?x:[]);
 const by=new Map(state.tasks.map(t=>[t.id,t]));
 const rootOf=t=>{let c=t,n=0;while(c.parentId&&by.has(c.parentId)&&n++<10)c=by.get(c.parentId);return c.id;};
 const uf=new Map();
 const find=x=>{while(uf.get(x)!==x){uf.set(x,uf.get(uf.get(x)));x=uf.get(x);}return x;};
 state.tasks.forEach(t=>{const r=rootOf(t);if(!uf.has(r))uf.set(r,r);});
 state.tasks.forEach(t=>A(t.deps).forEach(d=>{
  const p=by.get(d);
  if(!p||p.projectId!==t.projectId)return;
  const a=find(rootOf(t)),b=find(rootOf(p));
  if(a!==b)uf.set(a,b);
 }));
 const order=new Map();
 let prev=null;
 rows.forEach(r=>{
  const t=by.get(r.querySelector('.bar').dataset.id);
  if(!t)return;
  const k=find(rootOf(t));
  if(!order.has(k))order.set(k,order.size);
  const h=HU[order.get(k)%HU.length];
  r.dataset.bh=h;
  r.style.setProperty('--bh',h);
  r.classList.toggle('bsep',prev!==null&&prev!==k);
  prev=k;
 });
}
const oR=render;
render=function(){
 const r=oR.apply(this,arguments);
 setTimeout(()=>{try{paint();}catch(e){}},30);
 return r;
};
const cont=document.getElementById('content');
if(cont){
 let tm=0;
 new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>{try{paint();}catch(e){}},200);}).observe(cont,{childList:true,subtree:true});
}
if(typeof state!=='undefined'&&state)render();
})();
