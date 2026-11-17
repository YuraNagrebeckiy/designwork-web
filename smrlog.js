'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined')return;
const g=id=>document.getElementById(id);
const st=document.createElement('style');
st.textContent='.gantt .grow.bsep .glabel{box-shadow:inset 6px 0 0 hsl(var(--bh),50%,72%),inset 0 4px 0 hsl(var(--bh),55%,48%)!important}.gantt .grow.bsep .track{box-shadow:inset 0 4px 0 hsl(var(--bh),55%,48%)}';
document.head.appendChild(st);
const HU=[262,28,174,330,48,205,350,120];
function sepPaint(){
 const root=g('ganttRoot');
 if(!root||typeof state==='undefined'||!state||!state.tasks)return;
 const rows=[...root.querySelectorAll('.grow')].filter(r=>!r.classList.contains('ghead')&&r.querySelector('.bar'));
 if(!rows.length)return;
 const A=x=>Array.isArray(x)?x:[];
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
function addBtn(){
 const c=g('content');
 if(!c)return;
 c.querySelectorAll('.tplbar').forEach(bar=>{
  if(bar.querySelector('[data-smrk="log"]'))return;
  const bld=bar.querySelector('[data-smrk="bld"]');
  if(!bld)return;
  const b=document.createElement('button');
  b.type='button';
  b.className=bld.className;
  b.dataset.smrk='log';
  b.textContent='СМР Здание из сруба';
  bld.after(b);
 });
}
const oR=render;
render=function(){
 const r=oR.apply(this,arguments);
 setTimeout(()=>{try{addBtn();}catch(e){}try{sepPaint();}catch(e){}},0);
 return r;
};
const cont=g('content');
if(cont){
 let tm=0;
 new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>{try{sepPaint();}catch(e){}},120);}).observe(cont,{childList:true,subtree:true});
}
const isEmpty=()=>!!document.querySelector('[data-smode="empty"].on');
function sync(){
 const own=g('smr_own');
 if(!own)return;
 const e=isEmpty();
 own.classList.toggle('hidden',!e);
 const sum=g('smr_sum');
 if(sum)sum.classList.toggle('hidden',e);
 const s=g('smr_start'),en=g('smr_end');
 if(e&&s&&en&&!en.dataset.touched&&s.value)en.value=plus(s.value,6);
}
function setup(){
 const sum=g('smr_sum');
 if(sum&&!g('smr_own')){
  sum.insertAdjacentHTML('afterend','<div id="smr_own" class="hidden"><label>Название подрядчика или работы<input id="smr_name" type="text" maxlength="120" placeholder="Например: Монтаж лестницы"></label><label>Дата окончания<input id="smr_end" type="date"></label><p class="notice">В «Стройке» появится отдельный блок с этим названием и сроками, внутрь можно добавлять подзадачи. Так можно добавить каждого подрядчика.</p></div>');
 }
 sync();
}
async function srv(action,payload){
 const r=await transport({action:action,payload:payload||{},token:token});
 if(!r||!r.ok){const m=String(r&&r.error||'Сервер не ответил');if(m.indexOf('AUTH:')===0)signoutLocal();throw Error(m);}
 return r.data;
}
async function custom(){
 const name=(g('smr_name').value||'').trim(),s=g('smr_start').value,e=g('smr_end').value;
 if(!name)throw Error('Введите название подрядчика или работы');
 if(!s)throw Error('Укажите дату начала');
 if(!e)throw Error('Укажите дату окончания');
 if(e<s)throw Error('Дата окончания раньше даты начала');
 const id=await srv('taskCreate',{projectId:projectId,parentId:'',section:'build',title:name,start:s,end:e,assigneeId:'',deps:[],lag:0,kind:'stage',calendarEnabled:false});
 try{await srv('sectionSet',{id:id,section:'build'});}catch(x){}
 try{await reload();}catch(x){}
 try{render();}catch(x){}
}
const oSF=showForm;
showForm=function(html,onSave){
 let cb=onSave;
 if(typeof html==='string'&&html.indexOf('smr smrf')>-1&&typeof onSave==='function'){
  cb=async function(){
   if(isEmpty())return custom();
   return onSave.apply(this,arguments);
  };
 }
 const args=[html,cb].concat([].slice.call(arguments,2));
 const r=oSF.apply(this,args);
 try{setup();}catch(e){}
 setTimeout(()=>{try{setup();}catch(e){}},0);
 return r;
};
document.addEventListener('click',e=>{
 if(e.target&&e.target.closest&&e.target.closest('[data-smode]'))setTimeout(sync,0);
});
document.addEventListener('change',e=>{
 if(e.target&&e.target.id==='smr_start')setTimeout(sync,0);
});
document.addEventListener('input',e=>{
 if(e.target&&e.target.id==='smr_end')e.target.dataset.touched='1';
});
if(typeof state!=='undefined'&&state)render();
})();
