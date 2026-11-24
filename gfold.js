'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined'||typeof state==='undefined')return;
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;};
const key=()=>'dwFold:'+((state&&state.me&&state.me.id)||'');
let fold=null,loadedKey='';
function folded(){
 const k=key();
 if(!fold||loadedKey!==k){
  loadedKey=k;
  try{fold=new Set(JSON.parse(LS(k)||'[]'));}catch(e){fold=new Set();}
 }
 return fold;
}
const save=()=>LS(key(),JSON.stringify([...folded()]));
const st=document.createElement('style');
st.textContent='.gantt .glabel.foldable{cursor:pointer}.gantt .fold{display:inline-block;min-width:16px;margin-right:4px;font-size:11px;line-height:1;color:var(--accent);user-select:none;vertical-align:middle}.gantt .fold small{margin-left:1px;font-size:10px;opacity:.85}.gantt .glabel.foldable:hover .fold{filter:brightness(.8)}';
document.head.appendChild(st);
const ORIG=new WeakMap();
const kindOfT=t=>(typeof window.kindOf==='function')?window.kindOf(t):(t.kind||(t.parentId?'task':'stage'));
function redraw(g,items,hidden){
 const svg=g.querySelector('svg.depsvg');
 if(!svg)return;
 if(!ORIG.has(svg))ORIG.set(svg,svg.innerHTML);
 if(!hidden.size){
  if(svg.dataset.fd==='1'){svg.innerHTML=ORIG.get(svg);svg.dataset.fd='';}
  return;
 }
 const top=parseFloat(getComputedStyle(svg).top)||0,pos=new Map();
 items.filter(x=>!hidden.has(x.id)).forEach(x=>{
  const y=x.r.offsetTop-top;
  pos.set(x.id,{t:x.t,k:kindOfT(x.t),y:y+x.r.offsetHeight/2,yb:y+x.r.offsetHeight-6,l:parseFloat(x.b.style.left)||0,w:parseFloat(x.b.style.width)||x.b.offsetWidth});
 });
 let paths='';
 pos.forEach(c=>{
  const par=c.t.parentId&&pos.get(c.t.parentId);
  if(!par||par.y>=c.y)return;
  const stage=par.k==='stage',x1=par.l+6,x2=Math.max(c.l,x1+10);
  paths+='<path d="M '+x1+' '+par.yb+' V '+c.y+' H '+x2+'" fill="none" stroke="'+(stage?'var(--accent)':'var(--muted)')+'" stroke-width="'+(stage?1.8:1.4)+'" stroke-dasharray="'+(stage?'6 3':'2 3')+'" marker-end="url(#'+(stage?'fa2':'fa')+')"/>';
 });
 pos.forEach(b=>{
  arr(b.t.deps).forEach(did=>{
   const a=pos.get(did);
   if(!a)return;
   const stage=a.k==='stage'&&b.k==='stage',x1=a.l+a.w,x2=b.l,xm=x1+Math.max(0,Math.min(8,(x2-x1)/2));
   paths+='<path d="M '+x1+' '+a.y+' H '+xm+' V '+b.y+' H '+Math.max(x2,xm)+'" fill="none" stroke="'+(stage?'#9b6bd3':'var(--muted)')+'" stroke-width="'+(stage?2.6:1.4)+'" marker-end="url(#'+(stage?'fa3':'fa')+')"/>';
  });
 });
 const mk=(id,c)=>'<marker id="'+id+'" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="'+c+'"/></marker>';
 svg.innerHTML='<defs>'+mk('fa','var(--muted)')+mk('fa2','var(--accent)')+mk('fa3','#9b6bd3')+'</defs>'+paths;
 svg.dataset.fd='1';
}
function apply(){
 const f=folded(),by=new Map(state.tasks.map(t=>[t.id,t]));
 document.querySelectorAll('.gantt').forEach(g=>{
  const items=[];
  g.querySelectorAll('.grow').forEach(r=>{
   if(r.classList.contains('ghead'))return;
   const b=r.querySelector('.bar[data-id]'),t=b&&by.get(b.dataset.id);
   if(t)items.push({r:r,b:b,t:t,id:t.id});
  });
  const ids=new Set(items.map(x=>x.id)),kids=new Map();
  items.forEach(x=>{
   if(x.t.parentId&&ids.has(x.t.parentId)){
    if(!kids.has(x.t.parentId))kids.set(x.t.parentId,[]);
    kids.get(x.t.parentId).push(x);
   }
  });
  const hidden=new Set(),cnt=new Map();
  items.forEach(x=>{
   if(kids.has(x.id)){
    let n=0;const q=[x.id];
    while(q.length){(kids.get(q.shift())||[]).forEach(c=>{n++;q.push(c.id);});}
    cnt.set(x.id,n);
   }
  });
  const hide=id=>(kids.get(id)||[]).forEach(c=>{hidden.add(c.id);hide(c.id);});
  items.forEach(x=>{if(f.has(x.id)&&kids.has(x.id))hide(x.id);});
  items.forEach(x=>{
   x.r.style.display=hidden.has(x.id)?'none':'';
   const lb=x.r.querySelector('.glabel');
   if(!lb)return;
   let el=lb.querySelector('.fold');
   if(kids.has(x.id)){
    if(!el){el=document.createElement('span');el.className='fold';lb.insertBefore(el,lb.firstChild);}
    const c=f.has(x.id);
    el.innerHTML=c?'▸<small>'+cnt.get(x.id)+'</small>':'▾';
    el.title=c?'Показать вложенные строки':'Скрыть вложенные строки';
    lb.classList.add('foldable');
   }else{
    if(el)el.remove();
    lb.classList.remove('foldable');
   }
  });
  redraw(g,items,hidden);
 });
}
document.addEventListener('click',e=>{
 const lb=e.target&&e.target.closest?e.target.closest('.gantt .glabel.foldable'):null;
 if(!lb||e.target.closest('.lwr'))return;
 const row=lb.closest('.grow'),b=row&&row.querySelector('.bar[data-id]');
 if(!b)return;
 e.stopImmediatePropagation();e.preventDefault();
 const f=folded(),id=b.dataset.id;
 if(f.has(id))f.delete(id);else f.add(id);
 save();
 apply();
},true);
const oR=render;
render=function(){
 const r=oR.apply(this,arguments);
 try{apply();}catch(e){}
 return r;
};
})();
