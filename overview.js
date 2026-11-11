'use strict';
(function(){
const IC={
 people:`<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/></svg>`,
 chat:`<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z'/></svg>`,
 mood:`<svg viewBox='0 0 24 24' aria-hidden='true'><rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='8.5' cy='8.5' r='1.5'/><path d='M21 15l-5-5L5 21'/></svg>`
};
const NAMES=[['design','Проектирование'],['build','Стройка'],['supply','Комплектация']];
const st=document.createElement('style');
st.textContent=`.icorow{display:flex;gap:6px;margin:8px 0}
.secgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:8px 0}
#content .secgrid button{width:100%;border-radius:999px;padding:6px 8px;font-size:13px}`;
document.head.appendChild(st);

function stats(pid){
 const sm=state.sections||{},ts=state.tasks.filter(t=>t.projectId===pid),par=new Set(ts.map(t=>t.parentId).filter(Boolean));
 const acc={design:[0,0],build:[0,0]};
 ts.forEach(t=>{
  if(par.has(t.id))return;
  const s=sm[t.id]==='build'?'build':'design',w=Math.max(1,days(t.start,t.end)+1);
  acc[s][0]+=w;
  if(t.status==='Готово')acc[s][1]+=w;
 });
 const pc=a=>a[0]?Math.round(a[1]*100/a[0]):0,sp=(state.supply||{})[pid]||[0,0];
 const d=pc(acc.design),b=pc(acc.build),s=pc(sp);
 return {design:d,build:b,supply:s,all:Math.round((d+b+s)/3)};
}
window.secStats=stats;

function pctText(el,n){
 const t=el.textContent,k='Готовность: ',i=t.indexOf(k);
 if(i<0)return;
 let j=i+k.length;
 while(j<t.length&&t.charCodeAt(j)>=48&&t.charCodeAt(j)<=57)j++;
 const nt=t.slice(0,i)+k+n+t.slice(j);
 if(nt!==t)el.textContent=nt;
}
function setBar(mu,n){
 if(!mu)return null;
 pctText(mu,n);
 const b=mu.nextElementSibling;
 if(b&&b.classList.contains('prog')){if(b.firstElementChild)b.firstElementChild.style.width=n+'%';return b;}
 return null;
}
function icon(b,key,title){
 b.classList.add('ico');
 b.classList.remove('primary');
 b.title=title;
 b.setAttribute('aria-label',title);
 b.innerHTML=IC[key];
}

function decorate(){
 if(!state||view!=='projects')return;
 const c=document.getElementById('content');
 if(!c)return;
 if(!projectId){
  c.querySelectorAll('.grid article.panel').forEach(a=>{
   if(a.querySelector('.icorow'))return;
   const o=a.querySelector('[data-action=openProject]');
   if(!o)return;
   const pid=o.dataset.id,s=stats(pid),mu=a.querySelector('.muted'),pr=setBar(mu,s.all);
   const row=document.createElement('div');
   row.className='icorow';
   let bd=a.querySelector('[data-board]');
   if(!bd){bd=document.createElement('button');bd.type='button';bd.dataset.board=pid;}
   [[a.querySelector('[data-pset]'),'people','Участники и доступ'],[a.querySelector('[data-chat]'),'chat','Чат объекта'],[bd,'mood','Мудборд']].forEach(x=>{
    if(!x[0])return;
    icon(x[0],x[1],x[2]);
    row.appendChild(x[0]);
   });
   const grid=document.createElement('div');
   grid.className='secgrid';
   grid.innerHTML=NAMES.map(x=>`<div class='sg'><div class='sg-top'><b>${s[x[0]]}%</b><div class='prog'><i style='width:${s[x[0]]}%'></i></div></div><button type='button' data-secgo='${x[0]}' data-pid='${esc(pid)}'>${x[1]}</button></div>`).join('');
   const after=pr||mu||a.querySelector('h2');
   if(after){after.after(row);row.after(grid);}
  });
  return;
 }
 const s=stats(projectId);
 setBar(c.querySelector('.muted'),s.all);
 const tb=c.querySelector('.toolbar');
 if(!tb)return;
 const bd=tb.querySelector('[data-board]');
 if(bd&&!bd.classList.contains('ico'))icon(bd,'mood','Мудборд');
 if(!tb.querySelector('[data-chat]')){
  const ch=document.createElement('button');
  ch.type='button';ch.dataset.chat=projectId;
  icon(ch,'chat','Чат объекта');
  tb.appendChild(ch);
 }
}

document.addEventListener('click',e=>{
 const b=e.target.closest('[data-secgo]');
 if(!b)return;
 if(window.secGo)window.secGo(b.dataset.pid,b.dataset.secgo);
});

const oRender=render;
render=function(){const r=oRender.apply(this,arguments);try{decorate();}catch(e){}return r;};
if(state)render();
})();
