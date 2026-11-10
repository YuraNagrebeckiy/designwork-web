'use strict';
(function(){
const DAY=28;
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;};
let drag=null,suppress=false,gmin='',showAll=LS('studioShowAll')!=='off';
const Q=[],idMap={};let busy=false;
const st=document.createElement('style');
st.textContent='#syncbadge{position:fixed;left:12px;bottom:12px;z-index:150;background:var(--ink);color:var(--panel);padding:6px 12px;border-radius:999px;font-size:13px;opacity:.92}.chk2{display:inline-flex;align-items:center;gap:8px;margin:0;color:var(--ink);font-size:14px}.chk2 input{width:22px;height:22px;min-height:0;margin:0}';
document.head.appendChild(st);
const badge=document.createElement('div');badge.id='syncbadge';badge.textContent='Сохранение…';badge.style.display='none';document.body.appendChild(badge);
function setBadge(on){badge.style.display=on?'block':'none';}
const origCall=call,origReload=reload,origApply=applyState;
const T=id=>state.tasks.find(x=>x.id===id);
function cascadeLocal(){
 const by=new Map(state.tasks.map(t=>[t.id,t]));
 for(let pass=0;pass<=state.tasks.length;pass++){
  let ch=false;
  state.tasks.forEach(t=>arr(t.deps).forEach(d=>{const x=by.get(d);if(!x)return;const s=plus(x.end,1+Number(t.lag||0));if(s>t.start){const dur=days(t.start,t.end);t.start=s;t.end=plus(s,dur);ch=true;}}));
  if(!ch)break;
 }
}
function patchUpdate(p){
 const t=T(p.id);if(!t)return;
 ['title','start','end','assigneeId','lag'].forEach(k=>{if(p[k]!==undefined)t[k]=String(p[k]);});
 if(p.calendarEnabled!==undefined)t.calendarEnabled=String(!!p.calendarEnabled);
 if(p.deps!==undefined)t.deps=JSON.stringify(p.deps);
 if(p.projectId!==undefined&&p.projectId!==t.projectId){kids(t.id).concat([t]).forEach(x=>{x.projectId=p.projectId;});t.parentId='';}
 if(p.parentId!==undefined)t.parentId=String(p.parentId||'');
 if(p.status!==undefined&&p.status!==t.status){t.status=p.status;if(p.status==='Готово')kids(t.id).forEach(k=>{k.status='Готово';});}
 t.dirty='true';
 cascadeLocal();
}
function patchDelete(p){
 const t=T(p.id);if(!t)return;
 const ids=new Set([t.id].concat(kids(t.id).map(k=>k.id)));
 state.tasks=state.tasks.filter(x=>!ids.has(x.id));
 state.tasks.forEach(x=>{const d=arr(x.deps);if(d.some(i=>ids.has(i)))x.deps=JSON.stringify(d.filter(i=>!ids.has(i)));});
}
function patchCreate(p){
 const mgr=manage(p.projectId);
 const t={id:'tmp-'+Math.random().toString(36).slice(2,10),projectId:p.projectId,parentId:p.parentId||'',title:p.title||'',assigneeId:mgr?(p.assigneeId||''):state.me.id,start:p.start,end:p.end,status:'В работе',deps:JSON.stringify(mgr?(p.deps||[]):[]),lag:String(mgr?(p.lag||0):0),calendarEnabled:String(!!p.calendarEnabled),dirty:'true',syncError:'',version:'1',updatedAt:'',deleted:'false'};
 state.tasks.push(t);cascadeLocal();return t.id;
}
function remap(p){let s=JSON.stringify(p);Object.keys(idMap).forEach(k=>{s=s.split(k).join(idMap[k]);});return JSON.parse(s);}
async function pump(){
 if(busy)return;
 busy=true;setBadge(true);
 try{
  while(Q.length){
   const job=Q.shift();
   try{const r=await origCall(job.action,remap(job.payload));if(job.action==='taskCreate'&&job.tmp)idMap[job.tmp]=r;}
   catch(e){Q.length=0;toast('Не сохранено: '+(e.message||e));break;}
  }
 }finally{busy=false;setBadge(false);}
 try{await origReload();}catch(e){}
}
call=function(action,payload){
 if(!state||['taskCreate','taskUpdate','taskDelete'].indexOf(action)<0)return origCall.apply(this,arguments);
 payload=payload||{};
 if(action!=='taskDelete'){const cur=action==='taskUpdate'?T(payload.id):null,s=payload.start!==undefined?payload.start:(cur&&cur.start),e=payload.end!==undefined?payload.end:(cur&&cur.end);if(s&&e&&e<s)return Promise.reject(Error('Дедлайн раньше старта'));}
 let tmp='';
 try{if(action==='taskUpdate')patchUpdate(payload);else if(action==='taskDelete')patchDelete(payload);else tmp=patchCreate(payload);}catch(e){}
 Q.push({action:action,payload:Object.assign({},payload,{force:true}),tmp:tmp});
 render();LS('studioCache',JSON.stringify(state));pump();
 return Promise.resolve(tmp||true);
};
reload=async function(){if(busy||Q.length)return;return origReload.apply(this,arguments);};
applyState=function(s){if((busy||Q.length)&&state)return;return origApply.apply(this,arguments);};
window.addEventListener('beforeunload',e=>{if(busy||Q.length){e.preventDefault();e.returnValue='';}});
const menu=$('menu'),bell=$('bell');
let soundBtn=null;
function paint(){if(soundBtn&&bell)soundBtn.textContent=bell.textContent.indexOf('\u{1F515}')>=0?'Звук: выключен':'Звук: включён';}
if(bell){bell.remove();soundBtn=document.createElement('button');soundBtn.type='button';soundBtn.onclick=()=>{bell.click();paint();};menu.insertBefore(soundBtn,menu.firstChild);paint();}
const teamBtn=document.createElement('button');teamBtn.type='button';teamBtn.textContent='Команда';teamBtn.classList.add('hidden');
teamBtn.onclick=()=>{menu.classList.add('hidden');view='users';render();};
menu.insertBefore(teamBtn,menu.firstChild);
function isDim(t){return state.me.role==='employee'&&!manage(t.projectId)&&t.assigneeId!==state.me.id;}
function minStart(t){const ds=arr(t.deps).map(i=>state.tasks.find(x=>x.id===i)).filter(Boolean);return ds.length?plus(ds.reduce((a,d)=>d.end>a?d.end:a,ds[0].end),1):'';}
function post(){
 if(!state)return;
 teamBtn.classList.toggle('hidden',!admin());
 document.querySelectorAll('#nav [data-view="users"]').forEach(b=>b.remove());
 document.querySelectorAll('#content .notice').forEach(n=>{if(n.textContent.indexOf('Показаны только ваши задачи')>=0)n.textContent='Ваши задачи выделены цветом, остальные этапы проекта показаны серым.';});
 if(state.me.role==='employee'&&view==='projects'&&projectId&&!manage(projectId)){
  const tb=document.querySelector('#content .toolbar');
  if(tb){const l=document.createElement('label');l.className='chk2';l.innerHTML='<input type="checkbox" id="showAll"> Показать весь проект';const i=l.firstChild;i.checked=showAll;i.onchange=()=>{showAll=i.checked;LS('studioShowAll',showAll?'on':'off');render();};tb.appendChild(l);}
 }
 document.querySelectorAll('#content .card[data-drag]').forEach(c=>{
  const t=state.tasks.find(x=>x.id===c.dataset.drag);if(!t)return;
  if(isDim(t))c.classList.add('dim');
  const wait=t.assigneeId===state.me.id&&t.status!=='Готово'?arr(t.deps).map(i=>state.tasks.find(x=>x.id===i)).filter(x=>x&&x.status!=='Готово'):[];
  if(wait.length){const p=document.createElement('p'),a=c.querySelector('.actions');p.className='notice';p.textContent='Ожидает: '+wait.map(x=>x.title).join(', ');if(a)c.insertBefore(p,a);}
 });
}
const oRender=render;
render=function(){
 const full=state?state.tasks:null;
 if(state&&state.me.role==='employee'&&view==='projects'&&projectId&&!manage(projectId)&&!showAll){
  const by=new Map(full.map(t=>[t.id,t])),keep=new Set();
  full.forEach(t=>{if(t.assigneeId===state.me.id){let c=t,n=0;while(c&&n++<10){keep.add(c.id);c=by.get(c.parentId);}}});
  state.tasks=full.filter(t=>keep.has(t.id));
 }
 try{oRender.apply(this,arguments);}finally{if(full)state.tasks=full;}
 post();
};
renderGantt=function(id){
 const rows=tree(state.tasks.filter(t=>t.projectId===id)),ts=rows.map(r=>r.t);
 if(!ts.length){$('ganttRoot').innerHTML='<p class="empty">Нет задач</p>';return;}
 let min=ts.reduce((a,t)=>t.start<a?t.start:a,ts[0].start),max=ts.reduce((a,t)=>t.end>a?t.end:a,ts[0].end);
 min=plus(min,-1);max=plus(max,2);gmin=min;
 const n=days(min,max)+1,w=n*DAY,shown=ts.slice(0,500);
 let ticks='';for(let i=0;i<n;i++){if(n>1500&&i%7)continue;const d=plus(min,i);ticks+=`<span class="day" style="left:${i*DAY}px">${d.slice(8)}<br>${d.slice(5,7)}</span>`;}
 let paths='';
 shown.forEach((t,i)=>{
  arr(t.deps).forEach(did=>{const j=shown.findIndex(x=>x.id===did);if(j<0)return;const x1=(days(min,shown[j].end)+1)*DAY,x2=days(min,t.start)*DAY,y1=j*58+29,y2=i*58+29,gap=days(shown[j].end,t.start)-1;paths+=`<path d="M ${x1} ${y1} H ${x1+8} V ${y2} H ${x2}" fill="none" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#arrow)"/>`;if(gap>0)paths+=`<text x="${x1+10}" y="${y2-4}" font-size="10" fill="var(--muted)">+${gap} д</text>`;});
  if(t.parentId){const j=shown.findIndex(x=>x.id===t.parentId);if(j>=0&&j<i){const px=days(min,shown[j].start)*DAY+6,cx=days(min,t.start)*DAY,y1=j*58+43,y2=i*58+29;paths+=`<path d="M ${px} ${y1} V ${y2} H ${Math.max(cx,px+10)}" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#arrow2)"/>`;}}
 });
 const labelWidth=matchMedia('(max-width:760px)').matches?160:230;
 const body=shown.map((t,i)=>{const ed=fullEdit(t),dim=isDim(t),cls=t.status==='Готово'?'done':t.status==='Пауза'?'pause':'';
  return `<div class="grow${dim?' dim':''}"><div class="glabel" style="padding-left:${12+rows[i].d*14}px" title="${esc(t.title)}">${rows[i].d?'↳ ':''}${esc(t.title)}<small>${esc(name(t.assigneeId))}</small></div><div class="track" style="width:${w}px"><button class="bar ${cls}${dim?' dim':''}" ${ed?'data-edit="1"':''} style="left:${days(min,t.start)*DAY}px;width:${(days(t.start,t.end)+1)*DAY}px" data-action="taskEdit" data-id="${esc(t.id)}" title="${esc(t.start+' — '+t.end+' • '+t.title)}">${ed?'<i class="hd l" data-h="l"></i>':''}<span class="bt">${esc(t.title)}</span>${ed?'<i class="hd r" data-h="r"></i>':''}</button></div></div>`;}).join('');
 $('ganttRoot').innerHTML=`<div class="gantt-scroll"><div class="gantt" style="width:${w+labelWidth}px"><div class="grow ghead"><div class="glabel">Этап / исполнитель</div><div class="track" style="width:${w}px">${ticks}</div></div>${body}<svg class="depsvg" width="${w}" height="${shown.length*58}" aria-hidden="true"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/></marker><marker id="arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/></marker></defs>${paths}</svg>${today()>=min&&today()<=max?`<div class="todayline" style="left:${labelWidth+days(min,today())*DAY}px"></div>`:''}</div></div><p class="notice">${esc(min)} — ${esc(max)}. Прокрутка по горизонтали. Сплошная стрелка — зависимость (окончание → старт), пунктирная — подзадача родительской задачи. Перетащите полосу — перенос, края — длительность. ${ts.length>500?'Отображены первые 500 строк.':''}</p>`;
};
document.addEventListener('pointerdown',e=>{
 const bar=e.target.closest&&e.target.closest('.bar[data-edit]');if(!bar||e.button>0)return;
 const t=state.tasks.find(x=>x.id===bar.dataset.id);if(!t)return;
 drag={t,bar,mode:(e.target.dataset&&e.target.dataset.h)||'move',x0:e.clientX,s0:t.start,e0:t.end,ns:t.start,ne:t.end,moved:false};
 try{bar.setPointerCapture(e.pointerId);}catch(x){}
});
document.addEventListener('pointermove',e=>{
 if(!drag)return;
 if(!drag.moved&&Math.abs(e.clientX-drag.x0)<5)return;
 drag.moved=true;
 const dd=Math.round((e.clientX-drag.x0)/DAY);
 let s=drag.s0,en=drag.e0;
 if(drag.mode==='move'){s=plus(s,dd);en=plus(en,dd);}
 else if(drag.mode==='l'){s=plus(s,dd);if(s>en)s=en;}
 else{en=plus(en,dd);if(en<s)en=s;}
 const mn=minStart(drag.t);
 if(mn&&s<mn){if(drag.mode==='move')en=plus(en,days(s,mn));s=mn;if(en<s)en=s;}
 drag.ns=s;drag.ne=en;
 drag.bar.style.left=days(gmin,s)*DAY+'px';
 drag.bar.style.width=(days(s,en)+1)*DAY+'px';
 const bt=drag.bar.querySelector('.bt');if(bt)bt.textContent=s.slice(5)+' → '+en.slice(5)+' • '+(days(s,en)+1)+' дн.';
});
document.addEventListener('pointerup',()=>{
 const d=drag;drag=null;if(!d||!d.moved)return;
 suppress=true;setTimeout(()=>{suppress=false;},400);
 if(d.ns===d.s0&&d.ne===d.e0){render();return;}
 const t=d.t,mn=minStart(t),payload={id:t.id,version:t.version,start:d.ns,end:d.ne};
 if(mn)payload.lag=Math.max(0,days(mn,d.ns));
 call('taskUpdate',payload).catch(err=>{toast(err.message||String(err));render();});
});
document.addEventListener('pointercancel',()=>{if(drag){drag=null;render();}});
document.addEventListener('click',e=>{if(suppress&&e.target.closest&&e.target.closest('.bar')){e.stopPropagation();e.preventDefault();}},true);
if(state)render();
})();
