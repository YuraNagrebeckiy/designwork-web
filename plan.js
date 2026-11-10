'use strict';
(function(){
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;};
const MON=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
let who=LS('studioWho')||'me';
const st=document.createElement('style');
st.textContent=`.mygantt{margin:8px 0 14px}.mygantt summary{font-weight:700;cursor:pointer;padding:6px 0}.mygantt .gantt-scroll{max-height:46vh;overflow:auto}
.card.dl-g{border-left:6px solid #2e9e6b!important}.card.dl-y{border-left:6px solid #e0b000!important}.card.dl-r{border-left:6px solid #e5484d!important}.card.dl-fire{border-left:6px solid #ff3b00!important}
.bar.dl-g{background:#2e9e6b!important}.bar.dl-y{background:#e0b000!important;color:#222!important}.bar.dl-r{background:#e5484d!important}.bar.dl-fire{background:#991720!important}
.card.burn{position:relative}
.burn{animation:burnglow 1s ease-in-out infinite}
.burn::before{content:'';position:absolute;left:0;right:0;top:0;height:12px;pointer-events:none;transform-origin:50% 100%;background:radial-gradient(ellipse at 50% 100%,#ff3b00 0 45%,transparent 46%) 0 0/20px 12px repeat-x,radial-gradient(ellipse at 50% 100%,#ffb300 0 35%,transparent 36%) 9px 3px/20px 9px repeat-x;animation:flame .45s ease-in-out infinite alternate}
@keyframes flame{0%{transform:scaleY(.7);opacity:.8}100%{transform:scaleY(1.2);opacity:1}}
@keyframes burnglow{0%,100%{box-shadow:0 0 6px 1px #ff7a00,0 0 14px 3px rgba(255,59,0,.65)}50%{box-shadow:0 0 12px 3px #ffb300,0 0 26px 7px rgba(255,59,0,.8)}}
@media(prefers-reduced-motion:reduce){.burn,.burn::before{animation:none}}`;
document.head.appendChild(st);
const isLate=t=>t.status!=='Готово'&&(Number(t.hours)>0?t.start:t.end)<today();
function dlKind(t){
 if(t.status!=='В работе')return '';
 const d=days(today(),Number(t.hours)>0?t.start:t.end);
 return d<0?'dl-fire':d===0?'dl-r':d<=2?'dl-y':'dl-g';
}
function paintDeadlines(){
 if(!state)return;
 const set=(el,k)=>{['dl-g','dl-y','dl-r','dl-fire','burn'].forEach(c=>el.classList.remove(c));if(!k)return;el.classList.add(k);if(k==='dl-fire')el.classList.add('burn');};
 document.querySelectorAll('#content .card[data-drag]').forEach(c=>{const t=state.tasks.find(x=>x.id===c.dataset.drag);if(t)set(c,dlKind(t));});
 document.querySelectorAll('#content .bar[data-id]').forEach(b=>{const t=state.tasks.find(x=>x.id===b.dataset.id);if(t)set(b,dlKind(t));});
}
function pushLocal(p){
 const t=state.tasks.find(x=>x.id===p.id);if(!t||p.end===undefined)return;
 if(days(p.start,p.end)!==days(t.start,t.end))return;
 const delta=days(t.start,p.start);if(!delta)return;
 const seen=new Set([t.id]),q=[t.id],grp=[];
 while(q.length){const c=q.shift();state.tasks.forEach(x=>{if(seen.has(x.id)||x.projectId!==t.projectId||arr(x.deps).indexOf(c)<0)return;seen.add(x.id);q.push(x.id);grp.push(x);});}
 const done=new Set();
 grp.forEach(x=>[x].concat(kids(x.id)).forEach(y=>{if(done.has(y.id)||y.id===t.id)return;done.add(y.id);y.start=plus(y.start,delta);y.end=plus(y.end,delta);}));
}
const oCall=call;
call=function(action,payload){
 if(action==='taskUpdate'&&payload&&payload.start!==undefined){try{pushLocal(payload);}catch(e){}}
 return oCall.apply(this,arguments);
};
function whoNow(){return admin()?who:'me';}
function pick(){
 const w=whoNow();
 let ts=state.tasks.filter(t=>w==='all'?!!t.assigneeId:t.assigneeId===(w==='me'?state.me.id:w));
 if(filterProject)ts=ts.filter(t=>t.projectId===filterProject);
 if(period==='late')ts=ts.filter(isLate);
 else if(period==='open')ts=ts.filter(t=>t.status!=='Готово');
 else if(period!=='all'){const end=period==='today'?today():plus(today(),6);ts=ts.filter(t=>t.start<=end&&(t.end>=today()||t.status!=='Готово'));}
 return ts;
}
renderTasks=function(){
 const w=whoNow(),tasks=pick().sort((a,b)=>a.end.localeCompare(b.end));
 const periods=[['all',w==='me'?'Все мои задачи':'Все задачи'],['open','Не выполненные'],['late','Просроченные'],['today','На сегодня'],['week','Ближайшие 7 дней']];
 const staff=state.users.filter(u=>u.approved==='true'&&u.role!=='observer'&&u.id!==state.me.id);
 const lateN=tasks.filter(isLate).length;
 $('content').innerHTML=`<div class="toolbar">${admin()?`<select id="whoSel" aria-label="Чьи задачи"><option value="me" ${w==='me'?'selected':''}>Мои задачи</option><option value="all" ${w==='all'?'selected':''}>Все сотрудники</option>${staff.map(u=>`<option value="${esc(u.id)}" ${w===u.id?'selected':''}>${esc(u.name)}</option>`).join('')}</select>`:''}<select id="period" aria-label="Период">${periods.map(([v,l])=>`<option value="${v}" ${v===period?'selected':''}>${l}</option>`).join('')}</select><select id="filterProject" aria-label="Объект"><option value="">Все объекты</option>${opts(state.projects,filterProject)}</select>${state.projects.some(p=>manage(p.id))?'<button class="primary" data-action="taskCreate">+ Задача</button>':''}<button data-action="refresh">Обновить</button></div>${lateN?`<p class="notice" style="color:#e5484d">Не выполнено и просрочено: ${lateN}</p>`:''}<div class="board">${statuses.map(s=>`<section class="column" data-drop="${s}"><h2>${s} <small>${tasks.filter(t=>t.status===s).length}</small></h2>${tasks.filter(t=>t.status===s).map(t=>card(t)).join('')||'<p class="notice">Нет задач</p>'}</section>`).join('')}</div><p class="notice">Цвет карточки: зелёный — до срока 3 дня и больше, жёлтый — 1–2 дня, красный — последний день, огонь — срок прошёл, задача не выполнена.</p>`;
};
document.addEventListener('change',e=>{
 if(e.target.id==='whoSel'){who=e.target.value;LS('studioWho',who);render();}
});
function drawMy(){
 if(!state||view!=='tasks')return;
 const c=$('content'),tb=c.querySelector('.toolbar');
 if(!tb||c.querySelector('.mygantt'))return;
 const ts=pick().filter(t=>t.status!=='Готово').sort((a,b)=>a.start.localeCompare(b.start)||a.end.localeCompare(b.end));
 const box=document.createElement('details');box.className='mygantt';box.open=LS('studioMyG')!=='off';
 box.addEventListener('toggle',()=>LS('studioMyG',box.open?'on':'off'));
 if(!ts.length){box.innerHTML='<summary>График задач</summary><p class="notice">Невыполненных задач нет.</p>';tb.after(box);return;}
 const DAY=28,min=plus(ts.reduce((a,t)=>t.start<a?t.start:a,ts[0].start),-1),mx=plus(ts.reduce((a,t)=>t.end>a?t.end:a,ts[0].end),2),n=days(min,mx)+1,w=n*DAY,lw=matchMedia('(max-width:760px)').matches?160:230;
 let ticks='',mon='';
 for(let i=0;i<n;i++){
  const d=plus(min,i);
  ticks+='<span class="day" style="left:'+(i*DAY)+'px">'+d.slice(8)+'<br>'+d.slice(5,7)+'</span>';
  if(i===0||d.slice(8)==='01')mon+='<span class="gmon" style="left:'+(i*DAY)+'px">'+MON[+d.slice(5,7)-1]+' '+d.slice(0,4)+'</span>';
 }
 const body=ts.map(t=>{
  const cls=t.status==='Пауза'?'pause':t.status==='На согласовании'?'review':'';
  return '<div class="grow"><div class="glabel" title="'+esc(t.title)+'">'+esc(t.title)+'<small>'+esc(projectName(t.projectId))+'</small></div><div class="track" style="width:'+w+'px"><button class="bar '+cls+'" style="left:'+(days(min,t.start)*DAY)+'px;width:'+((days(t.start,t.end)+1)*DAY)+'px" data-action="taskEdit" data-id="'+esc(t.id)+'" title="'+esc(t.start+' — '+t.end+' • '+t.title)+'"><span class="bt">'+esc(t.title)+'</span></button></div></div>';
 }).join('');
 const td=today(),tl=td>=min&&td<=mx?'<div class="todayline" style="left:'+(lw+days(min,td)*DAY)+'px"></div>':'';
 box.innerHTML='<summary>График задач ('+ts.length+')</summary><div class="gantt-scroll"><div class="gantt" style="width:'+(w+lw)+'px"><div class="grow ghead"><div class="glabel">Задача / объект</div><div class="track" style="width:'+w+'px">'+ticks+mon+'</div></div>'+body+tl+'</div></div>';
 tb.after(box);
}
const oRender=render;
render=function(){const r=oRender.apply(this,arguments);try{drawMy();paintDeadlines();}catch(e){}return r;};
setInterval(()=>{try{paintDeadlines();}catch(e){}},60000);
if(state)render();
})();
