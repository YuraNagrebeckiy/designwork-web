'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined')return;
const HU=[262,28,174,330,48,205,350,120];
const A=x=>typeof arr==='function'?arr(x):(Array.isArray(x)?x:[]);
function paint(){
 const root=document.getElementById('ganttRoot');
 if(!root||typeof state==='undefined'||!state||!state.tasks)return;
 const rows=[...root.querySelectorAll('.grow')].filter(r=>!r.classList.contains('ghead')&&r.querySelector('.bar'));
 if(!rows.length)return;
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
function drawLinks(box,bars){
 const old=box.querySelector('svg.mylinks');
 if(old)old.remove();
 const gr=box.getBoundingClientRect();
 if(bars.size<2||!gr.width)return;
 if(getComputedStyle(box).position==='static')box.style.position='relative';
 const by=new Map(state.tasks.map(t=>[t.id,t]));
 const pos=id=>{const r=bars.get(id).getBoundingClientRect();return {l:r.left-gr.left,r:r.right-gr.left,b:r.bottom-gr.top,m:(r.top+r.bottom)/2-gr.top};};
 let solid='',dash='';
 bars.forEach((b,id)=>{
  const t=by.get(id);
  if(!t)return;
  const c=pos(id);
  A(t.deps).forEach(d=>{
   if(!bars.has(d))return;
   const a=pos(d);
   if(a.m===c.m)return;
   if(c.l>=a.r+16){const xm=(a.r+c.l)/2;solid+='M'+a.r+' '+a.m+'H'+xm+'V'+c.m+'H'+(c.l-1);}
   else{const ym=(a.m+c.m)/2;solid+='M'+a.r+' '+a.m+'H'+(a.r+8)+'V'+ym+'H'+(c.l-10)+'V'+c.m+'H'+(c.l-1);}
  });
  if(t.parentId&&bars.has(t.parentId)){
   const p=pos(t.parentId),x=p.l+8;
   dash+='M'+x+' '+p.b+'V'+c.m+'H'+Math.max(x+2,c.l-1);
  }
 });
 if(!solid&&!dash)return;
 box.insertAdjacentHTML('beforeend','<svg class="mylinks" width="'+gr.width+'" height="'+gr.height+'" style="position:absolute;left:0;top:0;pointer-events:none;overflow:visible;z-index:1"><defs><marker id="mlarr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="#5b6dd8"/></marker></defs><path d="'+dash+'" fill="none" stroke="#8f99d9" stroke-width="1.3" stroke-dasharray="4 3"/><path d="'+solid+'" fill="none" stroke="#5b6dd8" stroke-width="1.6" marker-end="url(#mlarr)"/></svg>');
}
function links(){
 const box=document.querySelector('.mygantt .gantt');
 if(!box||typeof state==='undefined'||!state||!state.tasks)return;
 const bars=new Map();
 box.querySelectorAll('.bar[data-id]').forEach(b=>bars.set(b.dataset.id,b));
 drawLinks(box,bars);
}
function anLinks(){
 const g=document.querySelector('.an-g');
 if(!g||typeof state==='undefined'||!state||!state.tasks)return;
 const idx=new Map();
 state.tasks.forEach(t=>idx.set(t.title+'|'+t.start+'|'+t.end,t));
 const bars=new Map();
 g.querySelectorAll('.an-row:not(.proj) .an-b[title]').forEach(b=>{
  const p=String(b.getAttribute('title')).split(' • ');
  if(p.length<2)return;
  const dd=p[1].split(' — ');
  if(dd.length<2)return;
  const t=idx.get(p[0]+'|'+dd[0]+'|'+dd[1]);
  if(t&&!bars.has(t.id))bars.set(t.id,b);
 });
 drawLinks(g,bars);
}
const oR=render;
render=function(){
 const r=oR.apply(this,arguments);
 setTimeout(()=>{try{paint();}catch(e){}try{links();}catch(e){}try{anLinks();}catch(e){}},60);
 return r;
};
const cont=document.getElementById('content');
if(cont){
 let tm=0;
 new MutationObserver(ms=>{
  if(ms.every(m=>[...m.addedNodes,...m.removedNodes].every(n=>n.nodeType===1&&n.classList.contains('mylinks'))))return;
  clearTimeout(tm);
  tm=setTimeout(()=>{try{paint();}catch(e){}try{anLinks();}catch(e){}},200);
 }).observe(cont,{childList:true,subtree:true});
 document.addEventListener('toggle',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('mygantt'))setTimeout(()=>{try{links();}catch(x){}},50);},true);
 window.addEventListener('resize',()=>{try{links();}catch(x){}try{anLinks();}catch(x){}});
}
const NL=String.fromCharCode(10);
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const BL=new Set();
const oT=transport;
transport=async function(req){
 if(!(req&&req.action==='taskCreate'&&req.payload&&document.getElementById('lb_top')))return oT.apply(this,arguments);
 const p=Object.assign({},req.payload),note=String(p.note||''),lines=note.split(NL);
 const items=lines.filter(l=>l.indexOf('☐ ')===0).map(l=>l.slice(2));
 let isB=false,kids=null;
 if(!p.parentId&&p.kind==='task'&&note.indexOf('Размер и сложность учтены')===0){p.kind='stage';isB=true;}
 else if(p.kind==='sub'&&BL.has(p.parentId)){p.kind='task';kids=items;}
 else if(!p.parentId&&p.kind==='task'&&items.length){kids=items;}
 if(kids&&kids.length)p.note=lines.filter(l=>l.indexOf('☐ ')!==0).join(NL);
 const res=await oT.call(this,Object.assign({},req,{payload:p}));
 try{
  const id=res&&res.ok?res.data:'';
  if(id&&isB)BL.add(id);
  if(id&&kids&&kids.length){
   for(const k of kids){
    await oT.call(this,{action:'taskCreate',payload:{projectId:p.projectId,parentId:id,title:cap(k),note:'',start:p.start,end:p.end,assigneeId:p.assigneeId,deps:[],lag:0,kind:'sub',calendarEnabled:false},token:req.token});
   }
  }
 }catch(e){}
 return res;
};
const dlg=document.getElementById('dialog');
if(dlg){
 new MutationObserver(()=>{
  const s=document.getElementById('lb_sum'),t=document.getElementById('lb_target');
  if(!s||!t||t.value)return;
  const re=/задач [0-9]+, подзадач [0-9]+[.]/;
  if(re.test(s.textContent))s.textContent=s.textContent.replace(re,'Группы станут задачами, пункты пояснения — их подзадачами.');
 }).observe(dlg,{childList:true,subtree:true,characterData:true});
}
if(typeof state!=='undefined'&&state)render();
})();
