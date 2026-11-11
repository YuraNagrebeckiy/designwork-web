'use strict';
(function(){
const KN={stage:'Этап работ',task:'Задача',sub:'Подзадача'},CHILD={stage:'task',task:'sub'},PK={task:'stage',sub:'task'},RH=34;
const NEWT={stage:'Новый этап работ',task:'Новая задача',sub:'Новая подзадача'};
const st=document.createElement('style');
st.textContent=`.gantt .bar.k-stage{height:26px!important;top:4px!important;line-height:24px!important;font-weight:700;filter:brightness(.78)}
.gantt .bar.k-sub{height:14px!important;top:10px!important;line-height:12px!important;font-size:10px!important;opacity:.9}
.kd{display:inline-block;flex:none;width:9px;height:9px;border-radius:3px}
.kd.k-stage{background:#9b6bd3}.kd.k-task{background:var(--accent)}.kd.k-sub{background:var(--muted);border-radius:50%}
.lg{display:inline-block;width:28px;height:0;vertical-align:middle;margin:0 4px 0 10px}
.lg.c1{border-top:3px solid #9b6bd3}.lg.c2{border-top:2px dashed var(--accent)}.lg.c3{border-top:2px dotted var(--muted)}.lg.c4{border-top:2px solid var(--muted)}
.kseg{margin:0 0 10px}.kseg .seg{display:flex;gap:6px;margin-top:4px}.kseg .seg button{flex:1;border-radius:999px;padding:6px 8px;font-size:14px}.kseg .seg button.on{background:var(--accent);color:#fff;border-color:var(--accent)}`;
document.head.appendChild(st);

const byId=()=>new Map(state.tasks.map(t=>[t.id,t]));
function kindOf(t,by){
 by=by||byId();
 const k=t.kind;
 if(k==='stage'||k==='task'||k==='sub')return k;
 let d=0,c=t;
 while(c&&c.parentId&&d<10){c=by.get(c.parentId);d++;}
 return d===0?'stage':d===1?'task':'sub';
}
window.kindOf=kindOf;

const calOff=d=>!!(window.studioCal&&window.studioCal.kind(d));
function workStart(d,uid){
 const vs=(state.vacations&&state.vacations[uid])||[];
 for(let i=0;i<400;i++){
  if(!calOff(d)&&!vs.some(v=>d>=v.from&&d<=v.to))return d;
  d=plus(d,1);
 }
 return d;
}

function ctx(ts,touched){
 const by=new Map(ts.map(t=>[t.id,t])),ch=new Map();
 ts.forEach(t=>{if(t.parentId&&by.has(t.parentId)){if(!ch.has(t.parentId))ch.set(t.parentId,[]);ch.get(t.parentId).push(t);}});
 const desc=id=>{const o=[],q=[id];while(q.length){const c=q.shift();(ch.get(c)||[]).forEach(x=>{o.push(x);q.push(x.id);});}return o;};
 const shift=(t,d)=>{if(!d)return;[t].concat(desc(t.id)).forEach(x=>{x.start=plus(x.start,d);x.end=plus(x.end,d);touched.add(x.id);});};
 return {by:by,ch:ch,shift:shift};
}
function settle(ts,touched,c,all){
 for(let it=0;it<200;it++){
  let chg=false;
  ts.forEach(x=>arr(x.deps).forEach(did=>{const y=c.by.get(did);if(!y)return;const s=plus(y.end,1+Number(x.lag||0));if(s>x.start){c.shift(x,days(x.start,s));chg=true;}}));
  ts.forEach(x=>{const p=x.parentId?c.by.get(x.parentId):null;if(!p)return;if(x.start<p.start){p.start=x.start;touched.add(p.id);chg=true;}if(x.end>p.end){p.end=x.end;touched.add(p.id);chg=true;}});
  const sg=ts.filter(x=>!x.parentId&&kindOf(x,all)==='stage').sort((a,b)=>a.start.localeCompare(b.start)||a.end.localeCompare(b.end));
  for(let i=1;i<sg.length;i++){
   const a=sg[i-1],b=sg[i];
   if(b.start<=a.end&&(touched.has(a.id)||touched.has(b.id))){c.shift(b,days(b.start,workStart(plus(a.end,1),b.assigneeId)));chg=true;}
  }
  if(!chg)break;
 }
}
function localEdit(id,ns,ne){
 const t=state.tasks.find(x=>x.id===id);
 if(!t||String(id).indexOf('tmp-')===0)return;
 const ts=state.tasks.filter(x=>x.projectId===t.projectId),touched=new Set(),c=ctx(ts,touched),all=byId();
 const d=days(t.start,ns),same=days(ns,ne)===days(t.start,t.end);
 if(same)c.shift(t,d);
 else{
  t.start=ns;t.end=ne;touched.add(t.id);
  const q=[t];
  while(q.length){
   const p=q.shift();
   (c.ch.get(p.id)||[]).forEach(k=>{
    if(days(k.start,k.end)>days(p.start,p.end)){k.start=p.start;k.end=p.end;touched.add(k.id);}
    else if(k.start<p.start)c.shift(k,days(k.start,p.start));
    else if(k.end>p.end)c.shift(k,-days(p.end,k.end));
    q.push(k);
   });
  }
 }
 settle(ts,touched,c,all);
}
function localAfterCreate(id){
 const t=state.tasks.find(x=>x.id===id);
 if(!t)return;
 const ts=state.tasks.filter(x=>x.projectId===t.projectId),touched=new Set([id]),c=ctx(ts,touched);
 settle(ts,touched,c,byId());
}

const prevCall=call;
call=function(action,payload){
 payload=payload||{};
 if(state&&(action==='taskCreate'||action==='taskUpdate')){
  if($('dialog').open&&$('f_kind'))payload=Object.assign({},payload,{kind:$('f_kind').value});
  if(action==='taskCreate'&&!payload.kind){
   const par=payload.parentId&&state.tasks.find(x=>x.id===payload.parentId);
   payload=Object.assign({},payload,{kind:par?(CHILD[kindOf(par)]||'sub'):'task'});
  }
  if(action==='taskUpdate'){
   const t=state.tasks.find(x=>x.id===payload.id);
   if(t){
    if(payload.kind)t.kind=payload.kind;
    const ns=payload.start!==undefined?payload.start:t.start,ne=payload.end!==undefined?payload.end:t.end;
    if((ns!==t.start||ne!==t.end)&&ns<=ne){try{localEdit(t.id,ns,ne);}catch(e){}}
   }
  }
 }
 const r=prevCall.call(this,action,payload);
 if(action==='taskCreate'&&payload.kind&&state){
  Promise.resolve(r).then(id=>{
   const t=state&&state.tasks.find(x=>x.id===id);
   if(t){t.kind=payload.kind;try{localAfterCreate(id);}catch(e){}try{render();}catch(e){}}
  }).catch(()=>{});
 }
 return r;
};

const oTaskForm=taskForm;
taskForm=function(t,parent,pre){
 oTaskForm.apply(this,arguments);
 try{enhance(t,parent,pre);}catch(e){}
};
function enhance(t,parent,pre){
 const dlg=$('dialog');
 if(!dlg.open||!$('f_parent')||!$('f_title')||$('f_kind'))return;
 const by=byId(),create=!t;
 const kind=t?kindOf(t,by):(parent?(CHILD[kindOf(parent,by)]||'sub'):'task');
 let chosen=t?t.parentId:(parent?parent.id:''),depSel=arr(t&&t.deps);
 const pid=()=>$('f_project').value;
 const tl=$('f_title').closest('label'),kl=document.createElement('div');
 kl.className='kseg';
 kl.innerHTML='<small>Что создаём / уровень</small><div class="seg">'+Object.keys(KN).map(k=>'<button type="button" data-kseg="'+k+'">'+KN[k]+'</button>').join('')+'</div><select id="f_kind" style="display:none">'+Object.keys(KN).map(k=>'<option value="'+k+'">'+KN[k]+'</option>').join('')+'</select>';
 tl.parentNode.insertBefore(kl,tl);
 $('f_kind').value=kind;
 const paintSeg=()=>kl.querySelectorAll('[data-kseg]').forEach(b=>b.classList.toggle('on',b.dataset.kseg===$('f_kind').value));
 paintSeg();
 const pl=$('f_parent').closest('label'),dl=$('f_deps').closest('label'),ll=$('f_lag')?$('f_lag').closest('label'):null,h=dlg.querySelector('h2');
 const ban=new Set(t?[t.id].concat(kids(t.id).map(x=>x.id)):[]);
 const setText=(l,s)=>{if(l&&l.firstChild&&l.firstChild.nodeType===3)l.firstChild.textContent=s;};
 const curDeps=()=>[...$('f_deps').selectedOptions].map(o=>o.value);
 function refresh(){
  const k=$('f_kind').value,list=state.tasks.filter(x=>x.projectId===pid()&&!ban.has(x.id)),pk=PK[k];
  paintSeg();
  if(h)h.textContent=create?NEWT[k]:KN[k];
  if(!pk){pl.style.display='none';$('f_parent').innerHTML='<option value=""></option>';}
  else{
   pl.style.display='';
   setText(pl,k==='task'?'Этап работ':'Задача');
   $('f_parent').innerHTML='<option value="">— не привязана (отдельная ветка) —</option>'+list.filter(x=>kindOf(x,by)===pk).map(x=>'<option value="'+esc(x.id)+'">'+esc(x.title)+'</option>').join('');
   $('f_parent').value=chosen;
   chosen=$('f_parent').value;
  }
  setText(dl,k==='stage'?'Идёт после этапа работ':'Идёт после (необязательно)');
  $('f_deps').innerHTML=list.filter(x=>kindOf(x,by)===k).map(x=>'<option value="'+esc(x.id)+'">'+esc(x.title)+'</option>').join('');
  [...$('f_deps').options].forEach(o=>{o.selected=depSel.indexOf(o.value)>=0;});
  setText(ll,'Пауза после предыдущего, дней');
 }
 const snap=()=>{
  const par=by.get(chosen);
  if(!par||!$('f_start')||!$('f_end'))return;
  let s=$('f_start').value,e=$('f_end').value;
  if(!s)return;
  if(s<par.start)s=par.start;
  if(s>par.end)s=par.end;
  if(!e||e<s)e=s;
  if(e>par.end)e=par.end;
  $('f_start').value=s;
  $('f_end').value=e;
 };
 kl.addEventListener('click',e=>{
  const b=e.target.closest('[data-kseg]');
  if(!b)return;
  depSel=curDeps();
  if($('f_parent').value)chosen=$('f_parent').value;
  $('f_kind').value=b.dataset.kseg;
  refresh();
 });
 $('f_parent').onchange=()=>{chosen=$('f_parent').value;snap();};
 $('f_deps').onchange=()=>{depSel=curDeps();};
 $('f_project').addEventListener('change',()=>{chosen='';depSel=[];refresh();});
 refresh();
}

function gantt(){
 const root=document.getElementById('ganttRoot');
 if(!root||!state||!projectId)return;
 const svg=root.querySelector('svg.depsvg');
 if(!svg||root.querySelector('.hlegend'))return;
 const by=byId(),rows=[...root.querySelectorAll('.grow')].filter(r=>!r.classList.contains('ghead')),pos=new Map();
 rows.forEach((r,i)=>{
  const b=r.querySelector('.bar');if(!b)return;
  const t=by.get(b.dataset.id);if(!t)return;
  const k=kindOf(t,by);
  b.classList.add('k-'+k);
  const lb=r.querySelector('.glabel');
  if(lb&&!lb.querySelector('.kd'))lb.insertAdjacentHTML('afterbegin','<i class="kd k-'+k+'" title="'+KN[k]+'"></i>');
  pos.set(t.id,{i:i,l:parseFloat(b.style.left)||0,w:parseFloat(b.style.width)||0,k:k,t:t});
 });
 svg.querySelectorAll('path[stroke-dasharray]').forEach(p=>p.remove());
 const defs=svg.querySelector('defs');
 if(defs)defs.insertAdjacentHTML('beforeend','<marker id="arrow3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#9b6bd3"/></marker>');
 let paths='';
 pos.forEach(c=>{
  const par=c.t.parentId&&pos.get(c.t.parentId);
  if(!par||par.i>=c.i)return;
  const x1=par.l+6,y1=par.i*RH+(par.k==='stage'?30:28),y2=c.i*RH+17,x2=Math.max(c.l,x1+10);
  const stage=par.k==='stage';
  paths+='<path d="M '+x1+' '+y1+' V '+y2+' H '+x2+'" fill="none" stroke="'+(stage?'var(--accent)':'var(--muted)')+'" stroke-width="'+(stage?1.8:1.4)+'" stroke-dasharray="'+(stage?'6 3':'2 3')+'" marker-end="url(#'+(stage?'arrow2':'arrow')+')"/>';
 });
 const sg=[...pos.values()].filter(x=>x.k==='stage'&&!x.t.parentId).sort((a,b)=>a.t.start.localeCompare(b.t.start));
 for(let i=1;i<sg.length;i++){
  const a=sg[i-1],b=sg[i],x1=a.l+a.w,x2=b.l,y1=a.i*RH+17,y2=b.i*RH+17,xm=x1+Math.max(0,Math.min(8,(x2-x1)/2));
  paths+='<path d="M '+x1+' '+y1+' H '+xm+' V '+y2+' H '+Math.max(x2,xm)+'" fill="none" stroke="#9b6bd3" stroke-width="2.6" marker-end="url(#arrow3)"/>';
 }
 svg.insertAdjacentHTML('beforeend',paths);
 root.insertAdjacentHTML('beforeend','<p class="notice hlegend"><span class="lg c1"></span>этап → следующий этап<span class="lg c2"></span>этап → задача<span class="lg c3"></span>задача → подзадача<span class="lg c4"></span>зависимость</p>');
}

const oRender=render;
render=function(){
 const r=oRender.apply(this,arguments);
 try{gantt();}catch(e){}
 return r;
};
if(state)render();
})();
