'use strict';
(function(){
const HUES=[262,174,28,330,205,48,290,235];
const st=document.createElement('style');
st.textContent=`.gantt .grow[data-bh] .track{background-color:hsla(var(--bh),70%,80%,.28)}
.gantt .grow[data-bh] .glabel{background:hsl(var(--bh),55%,94%);box-shadow:inset 6px 0 0 hsl(var(--bh),50%,72%)}
html[data-theme=dark] .gantt .grow[data-bh] .glabel{background:hsl(var(--bh),22%,21%)}
html[data-theme=dark] .gantt .grow[data-bh] .track{background-color:hsla(var(--bh),35%,40%,.18)}
.gantt .kd{background:hsl(var(--bh),50%,68%)!important}
.gantt .bar.k-br{border-left:6px solid hsl(var(--bh),50%,66%);color:#27304d!important;text-shadow:none!important;filter:none!important}
.gantt .bar.k-br{background:hsl(var(--bh),62%,84%)!important}
.gantt .bar.k-br.k-stage{background:hsl(var(--bh),55%,76%)!important}
.gantt .bar.k-br.k-sub{background:hsl(var(--bh),66%,90%)!important}
.gantt .bar.k-br.dl-g{background:#c9edd8!important}
.gantt .bar.k-br.dl-y{background:#fbe8a8!important}
.gantt .bar.k-br.dl-r{background:#f7bcc0!important}
.gantt .bar.k-br.dl-fire{background:#f0a3aa!important}
.gantt .bar.k-br.pause{background:#f2e0b8!important}
.gantt .bar.k-br.done{background:#cfe9dc!important;opacity:.9}
html[data-theme=dark] .gantt .bar.k-br{color:#eef0fa!important;background:hsl(var(--bh),32%,36%)!important}
html[data-theme=dark] .gantt .bar.k-br.k-stage{background:hsl(var(--bh),34%,42%)!important}
html[data-theme=dark] .gantt .bar.k-br.k-sub{background:hsl(var(--bh),30%,30%)!important}
html[data-theme=dark] .gantt .bar.k-br.dl-g{background:#2f6b4e!important}
html[data-theme=dark] .gantt .bar.k-br.dl-y{background:#7a6a2a!important}
html[data-theme=dark] .gantt .bar.k-br.dl-r{background:#7d3a40!important}
html[data-theme=dark] .gantt .bar.k-br.dl-fire{background:#8a3b43!important}
html[data-theme=dark] .gantt .bar.k-br.pause{background:#6b5a33!important}
html[data-theme=dark] .gantt .bar.k-br.done{background:#36594a!important}`;
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
 root.insertAdjacentHTML('beforeend','<p class="notice hbranch">Цвет фона строки и полоска слева — ветка: этапы, связанные между собой, и все их задачи. Независимый этап — своя отдельная ветка со своим цветом. Зелёный, жёлтый и красный оттенки полосы — близость дедлайна.</p>');
}
const oRender=render;
render=function(){
 const r=oRender.apply(this,arguments);
 try{paint();}catch(e){}
 return r;
};
})();
