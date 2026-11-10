'use strict';
(function(){
const OFF=new Set(['2025-12-31','2026-01-01','2026-01-02','2026-01-05','2026-01-06','2026-01-07','2026-01-08','2026-01-09','2026-02-23','2026-03-09','2026-05-01','2026-05-11','2026-06-12','2026-11-04','2026-12-31','2027-01-01','2027-01-04','2027-01-05','2027-01-06','2027-01-07','2027-01-08','2027-02-22','2027-02-23','2027-03-08','2027-05-03','2027-05-10','2027-06-14','2027-11-04','2027-11-05','2027-12-31']);
const FIXED=['01-01','01-02','01-03','01-04','01-05','01-06','01-07','01-08','02-23','03-08','05-01','05-09','06-12','11-04'];
function kind(d){
 const y=+d.slice(0,4),hol=(y>=2025&&y<=2027)?OFF.has(d):FIXED.indexOf(d.slice(5))>=0;
 if(hol)return 'h';
 const wd=new Date(d+'T00:00:00Z').getUTCDay();
 return (wd===0||wd===6)?'w':'';
}
window.studioCal={kind:kind};
const ruD=d=>d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4);
const st=document.createElement('style');
st.textContent='.gantt{position:relative}.holl{position:absolute;bottom:0;pointer-events:none;z-index:1}.hl{position:absolute;top:0;bottom:0}.hl.w{background:rgba(120,130,150,.14)}.hl.h{background:rgba(229,72,77,.16)}.day.dw{color:#8a93a6}.day.dh{color:#e5484d;font-weight:700}.vac{position:absolute;top:3px;bottom:3px;pointer-events:none;border:1px dashed #2e9e6b;border-radius:5px;background:repeating-linear-gradient(45deg,rgba(46,158,107,.30) 0 6px,rgba(46,158,107,.12) 6px 12px);font-size:11px;line-height:1.9;padding:0 6px;overflow:hidden;white-space:nowrap;color:var(--ink)}.bar.vacx{outline:2px dashed #e0b000;outline-offset:1px}';
document.head.appendChild(st);
function baseDate(g){
 const m=g.querySelector('.ghead .gmon'),d=g.querySelector('.ghead .day');
 if(!m||!d)return '';
 const y=m.textContent.trim().split(' ').pop(),t=d.textContent.trim();
 return t.length<4?'':y+'-'+t.slice(2,4)+'-'+t.slice(0,2);
}
function gInfo(g){
 const base=baseDate(g),head=g.querySelector('.ghead .track');
 if(!base||!head)return null;
 const n=Math.round(parseFloat(head.style.width)/28);
 return n>0?{base:base,n:n,head:head}:null;
}
function holidays(){
 document.querySelectorAll('#content .gantt').forEach(g=>{
  if(g.querySelector('.holl'))return;
  const gi=gInfo(g);if(!gi)return;
  const lw=g.querySelector('.ghead .glabel').offsetWidth,hh=gi.head.offsetHeight;
  let html='',i=0;
  while(i<gi.n){
   const k=kind(plus(gi.base,i));
   if(!k){i++;continue;}
   let j=i;
   while(j+1<gi.n&&kind(plus(gi.base,j+1))===k)j++;
   html+='<div class="hl '+k+'" style="left:'+(i*28)+'px;width:'+((j-i+1)*28)+'px" title="'+(k==='h'?'Праздничный день':'Выходной')+'"></div>';
   i=j+1;
  }
  const layer=document.createElement('div');layer.className='holl';
  layer.style.cssText='left:'+lw+'px;top:'+hh+'px;width:'+(gi.n*28)+'px';
  layer.innerHTML=html;g.appendChild(layer);
  g.querySelectorAll('.ghead .day').forEach(s=>{const idx=Math.round(parseFloat(s.style.left)/28),k=kind(plus(gi.base,idx));if(k)s.classList.add(k==='h'?'dh':'dw');});
 });
}
function vacations(){
 if(!state||!state.vacations)return;
 document.querySelectorAll('#content .gantt').forEach(g=>{
  const gi=gInfo(g);if(!gi)return;
  const last=plus(gi.base,gi.n-1);
  g.querySelectorAll('.grow:not(.ghead)').forEach(row=>{
   if(row.querySelector('.vac'))return;
   const bar=row.querySelector('.bar[data-id]');if(!bar)return;
   const t=state.tasks.find(x=>x.id===bar.dataset.id);if(!t||!t.assigneeId)return;
   const vs=state.vacations[t.assigneeId];if(!vs)return;
   const tr=row.querySelector('.track');let conflict=false;
   vs.forEach(v=>{
    if(v.to<gi.base||v.from>last)return;
    const a=v.from<gi.base?gi.base:v.from,b=v.to>last?last:v.to;
    const el=document.createElement('div');el.className='vac';
    el.style.left=(days(gi.base,a)*28)+'px';el.style.width=((days(a,b)+1)*28)+'px';
    el.title='Отпуск — '+name(t.assigneeId)+' ('+ruD(v.from)+' – '+ruD(v.to)+')';
    el.textContent='Отпуск — '+name(t.assigneeId);
    tr.insertBefore(el,tr.firstChild);
    if(t.start<=v.to&&t.end>=v.from)conflict=true;
   });
   if(conflict)bar.classList.add('vacx');
  });
 });
}
function teamVac(){
 if(view!=='users'||!state||!state.vacations)return;
 document.querySelectorAll('#content article.panel').forEach(a=>{
  const b=a.querySelector('[data-action="userEdit"]');if(!b||a.querySelector('.vacnote'))return;
  const vs=state.vacations[b.dataset.id];if(!vs)return;
  const p=document.createElement('p');p.className='notice vacnote';
  p.textContent='Отпуск: '+vs.map(v=>ruD(v.from)+' – '+ruD(v.to)).join('; ');
  b.before(p);
 });
}
const oRender=render;
render=function(){const r=oRender.apply(this,arguments);try{holidays();vacations();teamVac();}catch(e){}return r;};
if(state)render();
})();
