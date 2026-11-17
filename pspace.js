'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined')return;
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;};
const MON=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
const WD=['вс','пн','вт','ср','чт','пт','сб'];
const NL=String.fromCharCode(10);
const isP=p=>!!p&&String(p.name).indexOf('Личное: ')===0;
const owner=p=>{const m=arr(p.members);return m[0]||'';};
const dow=d=>new Date(d+'T00:00:00Z').getUTCDay();
const fd=d=>d.slice(8)+'.'+d.slice(5,7);
const hrs=t=>Number(t.hours)>0?Number(t.hours):0;
const pday=t=>(t.status!=='Готово'&&t.start<today())?today():t.start;
const tm=v=>{const h=Math.floor(v+1e-9),m=Math.round((v-h)*60);return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');};
const MARK='Начало: ';
function stOf(t){
 const l=String(t.note||'').split(NL).find(x=>x.indexOf(MARK)===0);
 if(!l)return null;
 const m=l.slice(MARK.length).split(':'),h=Number(m[0]),mi=Number(m[1]);
 return isNaN(h)||isNaN(mi)?null:h+mi/60;
}
function setStart(note,v){
 const ls=String(note||'').split(NL).filter(x=>x.indexOf(MARK)!==0);
 while(ls.length&&!ls[ls.length-1])ls.pop();
 if(v!==null&&v!==undefined)ls.push(MARK+tm(v));
 return ls.join(NL);
}
let anchor=today();
const st=document.createElement('style');
st.textContent='.pdiv{grid-column:1/-1;margin:18px 0 4px;padding-top:12px;border-top:4px solid var(--accent);font-weight:700;font-size:15px}.pcard .pbtn{width:100%;margin-top:10px}.pscale{display:flex;gap:6px;margin:8px 0}.pscale button{flex:1;border-radius:999px;padding:6px 8px;font-size:14px}.pscale button.on{background:var(--accent);color:#fff;border-color:var(--accent)}.pnav{display:flex;align-items:center;gap:8px;margin:6px 0}.pnav b{flex:1;text-align:center}.pday{position:relative;margin:8px 0;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--panel)}.pday .hr{position:absolute;left:0;right:0;border-top:1px solid var(--line);font-size:11px;color:var(--muted);padding:1px 0 0 6px;z-index:0}.pday .lunch{position:absolute;left:46px;right:0;background:rgba(127,127,127,.14);color:var(--muted);font-size:11px;padding:2px 8px;z-index:0}.pday .pb{position:absolute;left:54px;right:8px;z-index:1;border-radius:8px;padding:4px 8px;font-size:12px;line-height:1.25;overflow:hidden;background:hsl(var(--h),70%,88%);border-left:5px solid hsl(var(--h),50%,55%);color:#27304d;box-sizing:border-box}html[data-theme=dark] .pday .pb{background:hsl(var(--h),30%,28%);color:#eef0fa}.pday .pb small{opacity:.7}.pday .pb .ptx{display:block;padding-right:128px;cursor:pointer}.pday .pb .psh{position:absolute;right:4px;top:3px;display:flex;gap:3px}.pday .pb .psh button{padding:0 6px;min-height:22px;font-size:11px;border-radius:6px}.pday .pb.fx{box-shadow:inset 0 0 0 2px hsl(var(--h),50%,55%)}.pfree{display:grid;gap:6px;margin:6px 0 12px}.pfree button{text-align:left}.plist .card{margin-bottom:8px}.ppage h3{margin:14px 0 6px}#f_tbox{margin:6px 0}';
document.head.appendChild(st);
function objects(){
 if(!state||view!=='projects'||projectId)return;
 const c=document.getElementById('content'),grid=c&&c.querySelector('.grid');
 if(!grid)return;
 const arts=[...grid.querySelectorAll('article.panel')];
 const adm=typeof admin==='function'&&admin();
 const per=[];
 arts.forEach(a=>{
  const o=a.querySelector('[data-action=openProject]');
  if(!o)return;
  const p=state.projects.find(x=>x.id===o.dataset.id);
  if(!isP(p))return;
  if(!adm&&owner(p)!==state.me.id){a.remove();return;}
  per.push({a:a,p:p,id:o.dataset.id});
 });
 if(!per.length)return;
 per.forEach(x=>{
  const a=x.a;
  if(a.dataset.pdone)return;
  a.dataset.pdone='1';
  a.classList.add('pcard');
  ['.icorow','.secgrid','.prog'].forEach(s=>a.querySelectorAll(s).forEach(n=>n.remove()));
  a.querySelectorAll('.muted,p,small').forEach(n=>n.remove());
  a.querySelectorAll('button').forEach(b=>{if(/Удалить/.test(b.textContent))b.remove();});
  const b=document.createElement('button');
  b.type='button';b.className='primary pbtn';b.dataset.action='openProject';b.dataset.id=x.id;
  b.textContent='Открыть: график и задачи';
  a.appendChild(b);
 });
 per.sort((u,v)=>(owner(v.p)===state.me.id)-(owner(u.p)===state.me.id)||String(u.p.name).localeCompare(String(v.p.name)));
 const per2=new Set(per.map(x=>x.a));
 const reg=arts.filter(a=>a.isConnected&&!per2.has(a));
 const dv=document.createElement('div');
 dv.className='pdiv';
 dv.textContent='Личные задачи сотрудников';
 grid.append(...reg,dv,...per.map(x=>x.a));
}
function tree(ts){
 const by=new Map(ts.map(t=>[t.id,t])),kids=new Map();
 ts.forEach(t=>{const k=t.parentId&&by.has(t.parentId)?t.parentId:'';if(!kids.has(k))kids.set(k,[]);kids.get(k).push(t);});
 const out=[];
 const walk=(k,d)=>{(kids.get(k)||[]).sort((a,b)=>a.start.localeCompare(b.start)||a.end.localeCompare(b.end)).forEach(t=>{out.push([t,d]);walk(t.id,d+1);});};
 walk('',0);
 return out;
}
function slotMap(){
 const groups=new Map(),out=new Map();
 state.tasks.forEach(t=>{
  const h=hrs(t);
  if(!h||!t.assigneeId)return;
  const k=t.assigneeId+'|'+pday(t);
  if(!groups.has(k))groups.set(k,[]);
  groups.get(k).push(t);
 });
 groups.forEach(list=>{
  const fixed=list.filter(t=>stOf(t)!==null).map(t=>({t:t,s:stOf(t),e:stOf(t)+hrs(t)}));
  fixed.forEach(f=>out.set(f.t.id,{day:pday(f.t),s:f.s,e:f.e,fx:true}));
  let cur=9;
  list.filter(t=>stOf(t)===null).forEach(t=>{
   const h=hrs(t);
   for(let i=0;i<60;i++){
    if(cur>=13&&cur<14)cur=14;
    let e=cur+h;
    if(cur<13&&e>13)e+=1;
    const hit=fixed.find(f=>cur<f.e&&e>f.s);
    if(hit){cur=hit.e;continue;}
    out.set(t.id,{day:pday(t),s:cur,e:e,fx:false});
    cur=e;
    break;
   }
  });
 });
 return out;
}
function dayHtml(ts,day){
 const by=new Map(state.tasks.map(t=>[t.id,t])),sl=slotMap(),PX=56,H0=7,H1=20;
 let g='';
 for(let h=H0;h<=H1;h++)g+='<div class="hr" style="top:'+((h-H0)*PX)+'px">'+String(h).padStart(2,'0')+':00</div>';
 g+='<div class="lunch" style="top:'+((13-H0)*PX)+'px;height:'+PX+'px">Обед</div>';
 let n=0,cnt=0;
 ts.forEach(t=>{
  const s=sl.get(t.id);
  if(!s||s.day!==day)return;
  cnt++;
  const top=(s.s-H0)*PX,bh=Math.max(26,(Math.min(s.e,H1)-s.s)*PX-2),par=t.parentId&&by.get(t.parentId),id=esc(t.id);
  g+='<div class="pb'+(s.fx?' fx':'')+'" style="top:'+top+'px;height:'+bh+'px;--h:'+((n++*47)%360)+'"><span class="ptx" data-action="taskEdit" data-id="'+id+'"><b>'+tm(s.s)+'–'+tm(s.e)+'</b> '+esc(t.title)+(par?'<small> · '+esc(par.title)+'</small>':'')+'</span><span class="psh"><button type="button" data-pshift="-0.5" data-id="'+id+'">−30м</button><button type="button" data-pshift="0.5" data-id="'+id+'">+30м</button>'+(s.fx?'<button type="button" data-pshift="x" data-id="'+id+'" title="Сбросить время">⟲</button>':'')+'</span></div>';
 });
 const free=ts.filter(t=>t.status!=='Готово'&&!hrs(t)&&t.start<=day&&t.end>=day);
 return '<div class="pday" style="height:'+((H1-H0)*PX)+'px">'+g+'</div>'+(cnt?'':'<p class="notice">На этот день нет задач с часами. Добавьте подзадачу, укажите часы работы и, при желании, время начала.</p>')+(free.length?'<h3>Без времени на этот день</h3><div class="pfree">'+free.map(t=>{const par=t.parentId&&by.get(t.parentId);return '<button type="button" data-action="taskEdit" data-id="'+esc(t.id)+'">'+esc(t.title)+(par?' · '+esc(par.title):'')+' <small>'+fd(t.start)+'–'+fd(t.end)+'</small></button>';}).join('')+'</div>':'');
}
function ganttHtml(ts,min,max,DAY){
 const n=days(min,max)+1,w=n*DAY,lw=matchMedia('(max-width:760px)').matches?160:230,td=today();
 const rows=tree(ts.filter(t=>t.end>=min&&t.start<=max));
 if(!rows.length)return '<p class="notice">В этом периоде задач нет.</p>';
 let ticks='',mon='';
 for(let i=0;i<n;i++){
  const d=plus(min,i);
  ticks+='<span class="day" style="left:'+(i*DAY)+'px">'+d.slice(8)+'<br>'+(DAY>=40?WD[dow(d)]:d.slice(5,7))+'</span>';
  if(i===0||d.slice(8)==='01')mon+='<span class="gmon" style="left:'+(i*DAY)+'px">'+MON[+d.slice(5,7)-1]+' '+d.slice(0,4)+'</span>';
 }
 const body=rows.map(r=>{
  const t=r[0],a=t.start<min?min:t.start,b=t.end>max?max:t.end,cls=t.status==='Пауза'?'pause':t.status==='На согласовании'?'review':t.status==='Готово'?'done':'';
  return '<div class="grow"><div class="glabel" style="padding-left:'+(8+Math.min(r[1],3)*14)+'px" title="'+esc(t.title)+'">'+esc(t.title)+'</div><div class="track" style="width:'+w+'px"><button class="bar '+cls+'" style="left:'+(days(min,a)*DAY)+'px;width:'+((days(a,b)+1)*DAY)+'px" data-action="taskEdit" data-id="'+esc(t.id)+'" title="'+esc(t.start+' — '+t.end+' • '+t.title)+'"><span class="bt">'+esc(t.title)+'</span></button></div></div>';
 }).join('');
 const tl=td>=min&&td<=max?'<div class="todayline" style="left:'+(lw+days(min,td)*DAY)+'px"></div>':'';
 return '<div class="mygantt"><div class="gantt-scroll"><div class="gantt" style="width:'+(w+lw)+'px"><div class="grow ghead"><div class="glabel">Задача</div><div class="track" style="width:'+w+'px">'+ticks+mon+'</div></div>'+body+tl+'</div></div></div>';
}
function first(d){return d.slice(0,8)+'01';}
function section(ts,allMode){
 const sc=LS('dwPScale')||'week';
 let body,label,a0,b0;
 if(sc==='day'){
  a0=anchor;b0=anchor;
  label=fd(anchor)+'.'+anchor.slice(0,4)+', '+WD[dow(anchor)];
  body=allMode?'<p class="notice">Для режима «День» выберите одного сотрудника в списке «Чьи задачи».</p>':dayHtml(ts,anchor);
 }else if(sc==='month'){
  a0=first(anchor);b0=plus(plus(a0,32).slice(0,8)+'01',-1);
  label=MON[+a0.slice(5,7)-1]+' '+a0.slice(0,4);
  body=ganttHtml(ts,a0,b0,28);
 }else{
  a0=plus(anchor,-((dow(anchor)+6)%7));b0=plus(a0,6);
  label=fd(a0)+' – '+fd(b0)+'.'+b0.slice(0,4);
  body=ganttHtml(ts,a0,b0,64);
 }
 const list=tree(ts.filter(t=>t.end>=a0&&t.start<=b0));
 return '<div class="pscale">'+[['day','День'],['week','Неделя'],['month','Месяц']].map(x=>'<button type="button" data-pscale="'+x[0]+'" class="'+(x[0]===sc?'on':'')+'">'+x[1]+'</button>').join('')+'</div><div class="pnav"><button type="button" data-pnav="-1">◀</button><b>'+label+'</b><button type="button" data-pnav="0">Сегодня</button><button type="button" data-pnav="1">▶</button></div>'+body+'<h3>Задачи</h3><div class="plist">'+(list.map(r=>'<div style="margin-left:'+(Math.min(r[1],3)*18)+'px">'+card(r[0])+'</div>').join('')||'<p class="notice">В этом периоде задач нет.</p>')+'</div>';
}
function dl(t){
 if(t.status!=='В работе')return '';
 const d=days(today(),hrs(t)?t.start:t.end);
 return d<0?'dl-fire':d===0?'dl-r':d<=2?'dl-y':'dl-g';
}
function paintCards(root){
 const by=new Map(state.tasks.map(t=>[t.id,t]));
 root.querySelectorAll('.card[data-drag]').forEach(cd=>{
  const t=by.get(cd.dataset.drag);
  if(!t)return;
  const k=dl(t);
  if(k){cd.classList.add(k);if(k==='dl-fire')cd.classList.add('burn');}
 });
}
function page(){
 if(!state||view!=='projects'||!projectId)return;
 const p=state.projects.find(x=>x.id===projectId);
 if(!isP(p))return;
 const c=document.getElementById('content');
 if(!c)return;
 const own=owner(p),mine=own===state.me.id;
 const ts=state.tasks.filter(t=>t.projectId===projectId);
 c.innerHTML='<div class="ppage"><h2>'+esc(p.name)+'</h2><p class="muted">'+(mine?'Ваше личное пространство: видите только вы и руководитель.':'Личное пространство сотрудника: '+esc(name(own))+'. Задача, созданная здесь, назначается ему.')+'</p><div class="toolbar"><button class="primary" data-pnew="1">+ Задача</button><button data-action="refresh">Обновить</button></div>'+section(ts,false)+'</div>';
 paintCards(c);
}
function mineTasks(){
 if(!state||view!=='tasks')return;
 const c=document.getElementById('content'),tb=c&&c.querySelector('.toolbar');
 if(!tb||c.querySelector('.ppage'))return;
 const ws=document.getElementById('whoSel'),w=ws?ws.value:'me',fp=document.getElementById('filterProject'),pf=fp?fp.value:'';
 const per=document.getElementById('period');
 if(per)per.remove();
 let n=tb.nextElementSibling;
 while(n){const x=n.nextElementSibling;n.remove();n=x;}
 const ts=state.tasks.filter(t=>(w==='all'?!!t.assigneeId:t.assigneeId===(w==='me'?state.me.id:w))&&(!pf||t.projectId===pf));
 const d=document.createElement('div');
 d.className='ppage';
 d.innerHTML=section(ts,w==='all');
 tb.after(d);
 paintCards(d);
}
async function shift(id,d){
 const tk=state.tasks.find(x=>x.id===id),sl=slotMap().get(id);
 if(!tk||!sl)return;
 const ns=d==='x'?null:Math.max(7,Math.min(20,Math.round((sl.s+Number(d))*4)/4));
 try{
  await call('taskUpdate',{id:id,version:tk.version,note:setStart(tk.note,ns)});
  await reload();
  render();
 }catch(err){toast(err.message||String(err));}
}
function decForm(t){
 const dlg=document.getElementById('dialog');
 if(!dlg||!dlg.open||!document.getElementById('f_start')||document.getElementById('f_time')||document.getElementById('f_tbox'))return;
 const nt=document.getElementById('f_note'),cur=t?stOf(t):null;
 if(nt&&cur!==null)nt.value=setStart(nt.value,null);
 const tv=cur===null?'':tm(cur);
 const timeLabel='<label>Начать в (необязательно)<input id="f_time" type="time" step="900" value="'+tv+'"></label><p class="notice">Если время не указано, задача встаёт по порядку с 9:00. В режиме «День» блок можно смещать кнопками.</p>';
 const hb=document.getElementById('f_hours');
 if(hb){
  hb.closest('label').insertAdjacentHTML('afterend','<div id="f_tbox">'+timeLabel+'</div>');
  return;
 }
 const fg=document.getElementById('f_start').closest('.formgrid')||document.getElementById('f_start').closest('label');
 const box=document.createElement('div');
 box.id='f_tbox';
 box.innerHTML='<label class="check"><input type="checkbox" id="f_usehrs">Работа по часам (время внутри дня)</label><div id="f_hw"></div>';
 fg.insertAdjacentElement('afterend',box);
 document.getElementById('f_usehrs').addEventListener('change',e=>{
  const w=document.getElementById('f_hw');
  if(e.target.checked)w.innerHTML='<label>Часов работы (до 8 в день)<input id="f_hours" type="number" min="0.5" max="8" step="0.5" value="2" required></label>'+timeLabel;
  else w.innerHTML='';
 });
}
const oTF=taskForm;
taskForm=function(t,parent,pre){
 oTF.apply(this,arguments);
 try{decForm(t);}catch(e){}
};
const oCall=call;
call=function(action,payload){
 const ft=document.getElementById('f_time');
 if((action==='taskCreate'||action==='taskUpdate')&&payload&&ft&&document.getElementById('dialog').open&&Object.prototype.hasOwnProperty.call(payload,'note')){
  let ns=null;
  if(ft.value){const m=ft.value.split(':');ns=Number(m[0])+Number(m[1])/60;}
  payload=Object.assign({},payload,{note:setStart(payload.note,ns)});
 }
 return oCall.call(this,action,payload);
};
document.addEventListener('click',e=>{
 const t=e.target;
 if(!t||!t.closest)return;
 const sh=t.closest('[data-pshift]');
 if(sh){shift(sh.dataset.id,sh.dataset.pshift);return;}
 const s=t.closest('[data-pscale]');
 if(s){LS('dwPScale',s.dataset.pscale);render();return;}
 const nv=t.closest('[data-pnav]');
 if(nv){
  const k=Number(nv.dataset.pnav),sc=LS('dwPScale')||'week';
  if(!k)anchor=today();
  else if(sc==='day')anchor=plus(anchor,k);
  else if(sc==='week')anchor=plus(anchor,7*k);
  else anchor=k>0?plus(first(anchor),32).slice(0,8)+'01':first(plus(first(anchor),-1));
  render();
  return;
 }
 if(t.closest('[data-pnew]')){
  const p=state.projects.find(x=>x.id===projectId);
  if(!p)return;
  taskForm(null,null,projectId);
  setTimeout(()=>{const a=document.getElementById('f_assignee'),o=owner(p);if(a&&o)a.value=o;},60);
 }
});
document.addEventListener('change',e=>{
 const el=e.target;
 if(el&&(el.id==='whoSel'||el.id==='filterProject')&&view==='tasks')setTimeout(()=>{try{render();}catch(x){}},0);
});
const oR=render;
render=function(){
 const r=oR.apply(this,arguments);
 try{objects();}catch(e){}
 try{page();}catch(e){}
 try{mineTasks();}catch(e){}
 return r;
};
if(typeof state!=='undefined'&&state)render();
})();
