'use strict';
(function(){
const HUES=[262,174,28,330,205,48,290,235];
const st=document.createElement('style');
st.textContent=`.gantt .grow[data-bh] .track{background-color:hsla(var(--bh),70%,55%,.12)}
.gantt .grow[data-bh] .glabel{background:hsl(var(--bh),60%,95%);box-shadow:inset 6px 0 0 hsl(var(--bh),60%,50%)}
html[data-theme=dark] .gantt .grow[data-bh] .glabel{background:hsl(var(--bh),30%,22%)}
.gantt .bar.k-br{border-left:6px solid hsl(var(--bh),60%,42%)}
.gantt .kd{background:hsl(var(--bh),60%,50%)!important}`;
document.head.appendChild(st);

function paint(){
 const root=document.getElementById('ganttRoot');
 if(!root||!state||!projectId)return;
 const rows=[...root.querySelectorAll('.grow')].filter(r=>!r.classList.contains('ghead'));
 if(!rows.length||root.querySelector('.hbranch'))return;
 const by=new Map(state.tasks.map(t=>[t.id,t]));
 const rootOf=t=>{let c=t,n=0;while(c.parentId&&by.has(c.parentId)&&n++<10)c=by.get(c.parentId);return c.id;};
 const uf=new Map();
 const find=x=>{while(uf.get(x)!==x){uf.set(x,uf.get(uf.get(x)));x=uf.get(x);}return x;};
 state.tasks.forEach(t=>{const r=rootOf(t);if(!uf.has(r))uf.set(r,r);});
 state.tasks.forEach(t=>arr(t.deps).forEach(d=>{
  const p=by.get(d);
  if(!p||p.projectId!==t.projectId)return;
  const a=find(rootOf(t)),b=find(rootOf(p));
  if(a!==b)uf.set(a,b);
 }));
 const key=new Map();
 uf.forEach((_,id)=>{const r=find(id);if(!key.has(r)||id<key.get(r))key.set(r,id);});
 const hue=t=>{
  const k=String(key.get(find(rootOf(t))));
  let h=0;
  for(let i=0;i<k.length;i++)h=(h*31+k.charCodeAt(i))>>>0;
  return HUES[h%HUES.length];
 };
 rows.forEach(r=>{
  const b=r.querySelector('.bar');
  if(!b)return;
  const t=by.get(b.dataset.id);
  if(!t)return;
  const h=hue(t);
  r.dataset.bh=h;
  r.style.setProperty('--bh',h);
  b.classList.add('k-br');
  b.classList.remove('k-free');
 });
 const c5=root.querySelector('.hlegend .c5');
 if(c5){if(c5.nextSibling)c5.nextSibling.remove();c5.remove();}
 root.insertAdjacentHTML('beforeend','<p class="notice hbranch">Цвет фона строки и полоска слева — ветка: этапы, связанные между собой, и все их задачи. Независимый этап — своя отдельная ветка со своим цветом.</p>');
}
const oRender=render;
render=function(){
 const r=oRender.apply(this,arguments);
 try{paint();}catch(e){}
 return r;
};
})();
