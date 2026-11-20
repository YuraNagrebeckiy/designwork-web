'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined'||typeof state==='undefined')return;
const NL=String.fromCharCode(10);
const kind=d=>(window.studioCal&&window.studioCal.kind)?window.studioCal.kind(d):'';
const nextWork=d=>{for(let i=0;i<20&&kind(d);i++)d=plus(d,1);return d;};
const fd=d=>d.slice(8)+'.'+d.slice(5,7);
const hrs=t=>Number(t.hours)>0?Number(t.hours):0;
const open=t=>t.status!=='Готово'&&t.status!=='Пауза';
const late=t=>open(t)&&t.end<today();
const st=document.createElement('style');
st.textContent='.carry{margin:10px 0;border:1px solid #e5484d;border-left:6px solid #e5484d;border-radius:12px;padding:8px 12px;background:color-mix(in srgb,#e5484d 7%,transparent)}.carry h3{margin:0 0 6px;font-size:15px;color:#e5484d}.carry .cr{display:flex;align-items:center;gap:8px;padding:3px 0;border-top:1px solid var(--line)}.carry .cr:first-of-type{border-top:0}.carry .cr .ct{flex:1;text-align:left;border:0;background:transparent;box-shadow:none;padding:4px 6px;min-height:32px}.carry .cr .ct small{display:block;color:var(--muted)}.carry .cr .cw{color:#b5584f;font-size:12px}.carry .cr button.primary{min-height:32px;flex:none}.cal-leg,.cal-off{font-size:13px}.cal-off{border-left:4px solid #e5484d;padding-left:8px}';
document.head.appendChild(st);

function desc(id){return kids(id);}
function succBlock(t,ne,me,seen){
 for(const x of state.tasks){
  if(x.id===t.id||seen.has(x.id)||arr(x.deps).indexOf(t.id)<0)continue;
  const need=plus(ne,1+Number(x.lag||0));
  if(x.start>=need)continue;
  seen.add(x.id);
  if(x.assigneeId&&x.assigneeId!==me)return 'следующая задача «'+x.title+'» у '+name(x.assigneeId);
  const sh=days(x.start,need),d=desc(x.id).find(k=>k.assigneeId&&k.assigneeId!==me);
  if(d)return 'подзадача «'+d.title+'» у '+name(d.assigneeId);
  const r=succBlock(x,plus(x.end,sh),me,seen);
  if(r)return r;
 }
 return '';
}
function blocker(t,ne){
 const me=state.me.id,by=new Map(state.tasks.map(x=>[x.id,x]));
 if(!fullEdit(t))return 'нет права менять срок';
 let p=t.parentId&&by.get(t.parentId),n=0;
 while(p&&n++<10){
  if(p.end<ne){
   if(p.assigneeId&&p.assigneeId!==me)return 'родитель «'+p.title+'» ведёт '+name(p.assigneeId);
   if(!fullEdit(p))return 'нет права менять срок родителя «'+p.title+'»';
  }
  p=p.parentId&&by.get(p.parentId);
 }
 return succBlock(t,ne,me,new Set([t.id]));
}
function moveSlots(note,ne){
 return String(note||'').split(NL).map(l=>l.indexOf('Слот: ')===0&&l.slice(6,16)<ne?'Слот: '+ne+l.slice(16):l).join(NL);
}
let running=false;
const tried=new Set();
async function ensureAnc(id,ne){
 for(let g=0;g<6;g++){
  const t=state.tasks.find(x=>x.id===id);
  if(!t)return;
  const by=new Map(state.tasks.map(x=>[x.id,x]));
  let p=t.parentId&&by.get(t.parentId),n=0,hit=null;
  while(p&&n++<10){if(p.end<ne){hit=p;break;}p=p.parentId&&by.get(p.parentId);}
  if(!hit)return;
  await call('taskUpdate',{id:hit.id,version:hit.version,end:ne});
  await reload();
 }
}
async function roll(){
 if(running||!state||!state.me||state.me.role==='observer'||!state.tasks)return;
 const ne=nextWork(today()),me=state.me.id;
 const cand=()=>state.tasks.filter(t=>t.assigneeId===me&&t.status==='В работе'&&t.end<today()&&String(t.id).indexOf('tmp-')!==0&&!tried.has(t.id+'|'+ne));
 if(!cand().length)return;
 running=true;
 let moved=0;const fail=[];
 try{
  for(let g=0;g<40;g++){
   const t=cand().find(x=>!blocker(x,ne));
   if(!t)break;
   tried.add(t.id+'|'+ne);
   const p={id:t.id,version:t.version,end:ne};
   if(hrs(t)){p.start=ne;const nn=moveSlots(t.note,ne);if(nn!==String(t.note||''))p.note=nn;}
   try{await call('taskUpdate',p);await reload();await ensureAnc(t.id,ne);moved++;}
   catch(e){fail.push(t.title);try{await reload();}catch(x){}}
  }
 }finally{running=false;}
 if(moved)toast('Перенесено на '+fd(ne)+' незавершённых задач: '+moved+'. Они остаются в списке дня, пока вы не отметите выполнение.');
 if(fail.length)toast('Не удалось перенести: '+fail.join(', '));
}
function prioritize(){
 if(!state||!state.tasks)return;
 const w=t=>late(t)?0:1;
 state.tasks.sort((a,b)=>w(a)-w(b));
}
function uidSet(){
 const ws=document.getElementById('whoSel');
 if(ws){const v=ws.value;if(v==='all')return null;return new Set([v==='me'?state.me.id:v]);}
 if(view==='projects'&&projectId){const p=state.projects.find(x=>x.id===projectId),m=p?arr(p.members):[];return new Set([m[0]||state.me.id]);}
 return new Set([state.me.id]);
}
function carryHtml(){
 const us=uidSet(),ne=nextWork(today());
 const list=state.tasks.filter(t=>late(t)&&t.assigneeId&&(!us||us.has(t.assigneeId))).sort((a,b)=>a.end.localeCompare(b.end)||String(a.title).localeCompare(String(b.title),'ru'));
 if(!list.length)return '';
 const rows=list.map(t=>{
  const pr=state.projects.find(x=>x.id===t.projectId),mine=t.assigneeId===state.me.id;
  let why='';
  if(mine&&t.status==='В работе'){const b=blocker(t,ne);if(b)why='<span class="cw">срок не продлён автоматически: '+esc(b)+'</span>';}
  else if(!mine)why='<span class="cw">график сотрудника не менялся</span>';
  const od=days(t.end,today());
  return '<div class="cr"><button type="button" class="primary" data-carry="'+esc(t.id)+'"'+(canEdit(t)?'':' disabled')+'>Выполнено</button><button type="button" class="ct" data-action="taskEdit" data-id="'+esc(t.id)+'">'+esc(t.title)+'<small>'+(pr&&String(pr.name).indexOf('Личное: ')!==0?esc(pr.name)+' · ':'')+esc(name(t.assigneeId))+' · срок был '+fd(t.end)+' ('+od+' дн. назад) · '+esc(t.status)+(why?' · ':'')+why+'</small></button></div>';
 }).join('');
 return '<div class="carry" id="carry_box"><h3>Не выполнено: '+list.length+' — остаётся в списке дня, пока не подтвердите</h3>'+rows+'</div>';
}
function decorate(){
 document.querySelectorAll('#carry_box,.cal-off,.cal-leg').forEach(n=>n.remove());
 const pp=document.querySelector('.ppage');
 if(!pp||!state||!state.tasks)return;
 const day=pp.querySelector('.pday[data-day]');
 if(day&&day.dataset.day===today()){
  const h=carryHtml(),nav=pp.querySelector('.pnav');
  if(h&&nav)nav.insertAdjacentHTML('afterend',h);
 }
 if(day){
  const k=kind(day.dataset.day),host=day.closest('.pcols')||day;
  if(k)host.insertAdjacentHTML('beforebegin','<p class="notice cal-off">'+(k==='h'?'Праздничный (нерабочий) день по производственному календарю':'Выходной день')+'</p>');
 }
 pp.querySelectorAll('.mygantt .gantt[data-min]').forEach(g=>{
  const min=g.dataset.min,DAY=Number(g.dataset.day),head=g.querySelector('.ghead .track'),lab=g.querySelector('.ghead .glabel');
  if(!head||!lab||!DAY)return;
  g.querySelectorAll('.holl').forEach(x=>x.remove());
  const n=Math.round(parseFloat(head.style.width)/DAY);
  let html='',i=0;
  while(i<n){
   const k=kind(plus(min,i));
   if(!k){i++;continue;}
   let j=i;
   while(j+1<n&&kind(plus(min,j+1))===k)j++;
   html+='<div class="hl '+k+'" style="left:'+(i*DAY)+'px;width:'+((j-i+1)*DAY)+'px" title="'+(k==='h'?'Праздничный день':'Выходной')+'"></div>';
   i=j+1;
  }
  const layer=document.createElement('div');
  layer.className='holl';
  layer.style.cssText='left:'+lab.offsetWidth+'px;top:'+head.offsetHeight+'px;width:'+(n*DAY)+'px';
  layer.innerHTML=html;
  g.appendChild(layer);
  g.querySelectorAll('.ghead .day').forEach(s=>{
   const k=kind(plus(min,Math.round(parseFloat(s.style.left)/DAY)));
   s.classList.toggle('dh',k==='h');s.classList.toggle('dw',k==='w');
  });
 });
 const mg=pp.querySelector('.mygantt');
 if(mg)mg.insertAdjacentHTML('afterend','<p class="notice cal-leg">Серым отмечены выходные, красным — праздничные дни по производственному календарю РФ.</p>');
}
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('[data-carry]');
 if(!b)return;
 e.stopPropagation();
 const t=state.tasks.find(x=>x.id===b.dataset.carry);
 if(!t||!canEdit(t))return;
 if(kids(t.id).some(k=>k.status!=='Готово')&&!confirm('Отметить выполненными и все подзадачи?'))return;
 guarded(()=>changeStatus(t,'Готово'));
},true);
const oR=render;
render=function(){
 try{prioritize();}catch(e){}
 const r=oR.apply(this,arguments);
 try{decorate();}catch(e){}
 setTimeout(()=>{try{roll();}catch(e){}},0);
 return r;
};
window.studioCarry={nextWork:nextWork,blocker:blocker};
})();
