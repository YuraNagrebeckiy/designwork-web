'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined')return;
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;};
const MON=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
const WD=['вс','пн','вт','ср','чт','пт','сб'];
const NL=String.fromCharCode(10);
const D=window.DIO;
const isP=p=>!!p&&String(p.name).indexOf('Личное: ')===0;
const owner=p=>{const m=arr(p.members);return m[0]||'';};
const dow=d=>new Date(d+'T00:00:00Z').getUTCDay();
const fd=d=>d.slice(8)+'.'+d.slice(5,7);
const hrs=t=>Number(t.hours)>0?Number(t.hours):0;
const pday=t=>(t.status!=='Готово'&&t.start<today())?today():t.start;
const tm=v=>{let h=Math.floor(v+1e-9),m=Math.round((v-h)*60);if(m===60){h++;m=0;}return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');};
const MARK='Начало: ';
const SM='Слот: ';
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
function slotsOf(t){
 return String(t.note||'').split(NL).filter(l=>l.indexOf(SM)===0).map(l=>{
  const p=l.slice(SM.length).trim().split(' '),tt=(p[1]||'').split(':'),h=Number(p[2]),s=Number(tt[0])+Number(tt[1]||0)/60;
  return (p[0]&&!isNaN(s)&&h>0)?{d:p[0],s:s,h:h}:null;
 }).filter(Boolean);
}
function withSlots(note,slots){
 const ls=String(note||'').split(NL).filter(l=>l.indexOf(SM)!==0);
 while(ls.length&&!ls[ls.length-1])ls.pop();
 slots.sort((a,b)=>(a.d+tm(a.s)).localeCompare(b.d+tm(b.s)));
 slots.forEach(x=>ls.push(SM+x.d+' '+tm(x.s)+' '+x.h));
 return ls.join(NL);
}
let anchor=today();
const PX=56,H0=7,H1=20;
const snap=v=>Math.round(v*4)/4;
const st=document.createElement('style');
st.textContent='.pdiv{grid-column:1/-1;margin:18px 0 4px;padding-top:12px;border-top:4px solid var(--accent);font-weight:700;font-size:15px}.pcard .pbtn{width:100%;margin-top:10px}.pscale{display:flex;gap:6px;margin:8px 0}.pscale button{flex:1;border-radius:999px;padding:6px 8px;font-size:14px}.pscale button.on{background:var(--accent);color:#fff;border-color:var(--accent)}.pnav{display:flex;align-items:center;gap:8px;margin:6px 0}.pnav b{flex:1;text-align:center}.pday{position:relative;margin:8px 0;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--panel)}.pday .hr{position:absolute;left:0;right:0;border-top:1px solid var(--line);font-size:11px;color:var(--muted);padding:1px 0 0 6px;z-index:0}.pday .lunch{position:absolute;left:46px;right:0;background:rgba(127,127,127,.14);color:var(--muted);font-size:11px;padding:2px 8px;z-index:0}.pday .pb{position:absolute;z-index:1;border-radius:8px;padding:4px 8px;font-size:12px;line-height:1.25;overflow:hidden;background:hsl(var(--h),70%,88%);border-left:5px solid hsl(var(--h),50%,55%);color:#27304d;box-sizing:border-box;touch-action:none;cursor:grab;user-select:none}html[data-theme=dark] .pday .pb{background:hsl(var(--h),30%,28%);color:#eef0fa}.pday .pb small{opacity:.7}.pday .pb .ptx{display:block;cursor:pointer}.pday .pb .psh{position:absolute;right:4px;top:3px;display:flex;gap:3px}.pday .pb .psh button{padding:0 6px;min-height:22px;font-size:11px;border-radius:6px}.pday .pb .rz{position:absolute;left:0;right:0;height:8px;cursor:ns-resize;z-index:3}.pday .pb .rz.t{top:0}.pday .pb .rz.b{bottom:0}.pday .pb .rz::after{content:"";position:absolute;left:50%;margin-left:-14px;width:28px;height:3px;border-radius:3px;background:rgba(0,0,0,.28);top:2px}.pday .pb.fx{box-shadow:inset 0 0 0 2px hsl(var(--h),50%,55%)}.pday .pb.sl{border-left-style:dashed}.pday .pb.dr{opacity:.85;z-index:5;cursor:grabbing;box-shadow:0 6px 18px #0005}.pday .now{position:absolute;left:0;right:0;height:0;border-top:2px solid #e5484d;z-index:4;pointer-events:none}.pday .now i{position:absolute;left:2px;top:-9px;background:#e5484d;color:#fff;font-size:10px;padding:0 4px;border-radius:4px;font-style:normal}.pcols{display:flex;gap:10px;overflow-x:auto;margin:6px 0}.pcol{min-width:280px;flex:1}.pcol h4{margin:4px 0}.pfree{display:grid;gap:6px;margin:6px 0 12px}.pfree .pf{display:flex;gap:6px}.pfree .pf button:first-child{flex:1;text-align:left}.plist .card{margin-bottom:8px}.ppage h3{margin:14px 0 6px}#f_tbox{margin:6px 0}.ppage .gantt .grow.padd .glabel{color:var(--muted);font-style:italic}.ppage .gantt .grow:not(.ghead) .track{cursor:cell}.pcard .pstat{margin:8px 0 0;font-size:13px}';
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
  const own=owner(x.p),open=state.tasks.filter(t=>t.assigneeId===own&&t.status!=='Готово'),late=open.filter(t=>t.end<today()).length;
  const s=document.createElement('p');
  s.className='pstat';
  s.textContent='В работе: '+open.length+' · просрочено: '+late;
  if(late)s.style.color='#e5484d';
  a.appendChild(s);
  const b=document.createElement('button');
  b.type='button';b.className='primary pbtn';b.dataset.action='openProject';b.dataset.id=x.id;
  b.textContent='Открыть: все задачи и график';
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
function dayBlocks(ts,day){
 const sl=slotMap(),out=[];
 ts.forEach(t=>{
  const s=sl.get(t.id);
  if(s&&s.day===day)out.push({t:t,kind:'hrs',s:s.s,e:s.e,fx:s.fx});
  slotsOf(t).forEach((x,i)=>{if(x.d===day)out.push({t:t,kind:'slot',idx:i,s:x.s,e:x.s+x.h});});
 });
 out.sort((a,b)=>a.s-b.s);
 return out;
}
function dayHtml(ts,day,compact){
 const by=new Map(state.tasks.map(t=>[t.id,t])),bl=dayBlocks(ts,day);
 let g='';
 for(let h=H0;h<=H1;h++)g+='<div class="hr" style="top:'+((h-H0)*PX)+'px">'+String(h).padStart(2,'0')+':00</div>';
 g+='<div class="lunch" style="top:'+((13-H0)*PX)+'px;height:'+PX+'px">Обед</div>';
 const colEnd=[];
 bl.forEach(b=>{let c=0;while(colEnd[c]!==undefined&&colEnd[c]>b.s+1e-6)c++;colEnd[c]=b.e;b.c=c;});
 const nc=Math.max(1,colEnd.length);
 let n=0;
 bl.forEach(b=>{
  const t=b.t,top=(b.s-H0)*PX,bh=Math.max(26,(Math.min(b.e,H1)-b.s)*PX-2),par=t.parentId&&by.get(t.parentId),id=esc(t.id),k=b.kind,ix=b.idx===undefined?'':b.idx;
  const left='calc(54px + (100% - 62px) * '+(b.c/nc)+')',wd='calc((100% - 62px) * '+(1/nc)+' - 4px)';
  const act=k==='slot'?'data-pslot="1"':'data-padj="1"';
  g+='<div class="pb'+(b.fx?' fx':'')+(k==='slot'?' sl':'')+'" data-bid="'+id+'" data-kind="'+k+'" data-idx="'+ix+'" style="top:'+top+'px;height:'+bh+'px;left:'+left+';width:'+wd+';--h:'+((n++*47)%360)+'"><span class="rz t"></span><span class="ptx" '+act+' data-id="'+id+'" data-idx="'+ix+'" style="padding-right:'+(nc>1||compact?0:132)+'px"><b>'+tm(b.s)+'–'+tm(b.e)+'</b> '+esc(t.title)+(par?'<small> · '+esc(par.title)+'</small>':'')+'</span>'+(compact?'':'<span class="psh"><button type="button" data-pshift="-0.25" data-id="'+id+'" data-kind="'+k+'" data-idx="'+ix+'">−15м</button><button type="button" data-pshift="0.25" data-id="'+id+'" data-kind="'+k+'" data-idx="'+ix+'">+15м</button>'+(k==='slot'?'<button type="button" data-pshift="del" data-id="'+id+'" data-kind="slot" data-idx="'+ix+'" title="Удалить слот">✕</button>':(b.fx?'<button type="button" data-pshift="x" data-id="'+id+'" data-kind="hrs" data-idx="" title="Сбросить время">⟲</button>':''))+'</span>')+'<span class="rz b"></span></div>';
 });
 const box='<div class="pday" style="height:'+((H1-H0)*PX)+'px" data-day="'+day+'">'+g+'</div>';
 if(compact)return box;
 const free=ts.filter(t=>t.status!=='Готово'&&!hrs(t)&&t.start<=day&&t.end>=day);
 return box+(bl.length?'<p class="notice">Блок можно перетащить за середину, а за верхний или нижний край — растянуть по времени. Клик — настроить время.</p>':'<p class="notice">На этот день ничего не запланировано. Выберите задачу ниже и нажмите «В график дня».</p>')+(free.length?'<h3>Задачи этого дня: распределите время</h3><div class="pfree">'+free.map(t=>{const par=t.parentId&&by.get(t.parentId),ns=slotsOf(t).length;return '<div class="pf"><button type="button" data-action="taskEdit" data-id="'+esc(t.id)+'">'+esc(t.title)+(par?' · '+esc(par.title):'')+' <small>'+fd(t.start)+'–'+fd(t.end)+(ns?' · слотов: '+ns:'')+'</small></button><button type="button" class="primary" data-pplan="'+esc(t.id)+'">В график дня</button></div>';}).join('')+'</div>':'');
}
function dayAll(ts,day){
 const us=state.users.filter(u=>u.approved==='true'&&u.role!=='observer').sort((a,b)=>String(a.name).localeCompare(String(b.name),'ru'));
 return '<div class="pcols">'+us.map(u=>{const mine=ts.filter(t=>t.assigneeId===u.id);return '<div class="pcol"><h4>'+esc(u.name)+' <small>· блоков: '+dayBlocks(mine,day).length+'</small></h4>'+dayHtml(mine,day,true)+'</div>';}).join('')+'</div><p class="notice">Для планирования дня конкретного сотрудника выберите его в списке «Чьи задачи». Блоки здесь тоже можно перетаскивать.</p>';
}
function ganttHtml(ts,min,max,DAY){
 const n=days(min,max)+1,w=n*DAY,lw=matchMedia('(max-width:760px)').matches?160:230,td=today();
 const rows=tree(ts.filter(t=>t.end>=min&&t.start<=max));
 let ticks='',mon='';
 for(let i=0;i<n;i++){
  const d=plus(min,i);
  ticks+='<span class="day" style="left:'+(i*DAY)+'px">'+d.slice(8)+'<br>'+(DAY>=40?WD[dow(d)]:d.slice(5,7))+'</span>';
  if(i===0||d.slice(8)==='01')mon+='<span class="gmon" style="left:'+(i*DAY)+'px">'+MON[+d.slice(5,7)-1]+' '+d.slice(0,4)+'</span>';
 }
 const body=rows.map(r=>{
  const t=r[0],a=t.start<min?min:t.start,b=t.end>max?max:t.end,cls=t.status==='Пауза'?'pause':t.status==='На согласовании'?'review':t.status==='Готово'?'done':'',pr=state.projects.find(x=>x.id===t.projectId);
  return '<div class="grow"><div class="glabel" style="padding-left:'+(8+Math.min(r[1],3)*14)+'px" title="'+esc(t.title)+'">'+esc(t.title)+(pr&&!isP(pr)?'<small>'+esc(pr.name)+'</small>':'')+'</div><div class="track" style="width:'+w+'px"><button class="bar '+cls+'" style="left:'+(days(min,a)*DAY)+'px;width:'+((days(a,b)+1)*DAY)+'px" data-action="taskEdit" data-id="'+esc(t.id)+'" title="'+esc(t.start+' — '+t.end+' • '+t.title)+'"><span class="bt">'+esc(t.title)+'</span></button></div></div>';
 }).join('');
 const add='<div class="grow padd"><div class="glabel">+ Нажмите на график, чтобы добавить задачу</div><div class="track" style="width:'+w+'px"></div></div>';
 const tl=td>=min&&td<=max?'<div class="todayline" style="left:'+(lw+days(min,td)*DAY)+'px"></div>':'';
 return '<div class="mygantt"><div class="gantt-scroll"><div class="gantt" data-min="'+min+'" data-day="'+DAY+'" style="width:'+(w+lw)+'px"><div class="grow ghead"><div class="glabel">Задача</div><div class="track" style="width:'+w+'px">'+ticks+mon+'</div></div>'+body+add+tl+'</div></div></div>'+(rows.length?'':'<p class="notice">В этом периоде задач нет.</p>');
}
function first(d){return d.slice(0,8)+'01';}
function section(ts,allMode){
 const sc=LS('dwPScale')||'week';
 let body,label,a0,b0;
 if(sc==='day'){
  a0=anchor;b0=anchor;
  label=fd(anchor)+'.'+anchor.slice(0,4)+', '+WD[dow(anchor)];
  body=allMode?dayAll(ts,anchor):dayHtml(ts,anchor);
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
function nowMark(){
 const d=new Date(),h=d.getHours()+d.getMinutes()/60;
 document.querySelectorAll('.pday[data-day]').forEach(p=>{
  let n=p.querySelector('.now');
  if(p.dataset.day!==today()||h<H0||h>H1){if(n)n.remove();return;}
  if(!n){n=document.createElement('div');n.className='now';n.innerHTML='<i></i>';p.appendChild(n);}
  n.style.top=((h-H0)*PX)+'px';
  n.firstChild.textContent='сейчас '+tm(h);
 });
}
function page(){
 if(!state||view!=='projects'||!projectId)return;
 const p=state.projects.find(x=>x.id===projectId);
 if(!isP(p))return;
 const c=document.getElementById('content');
 if(!c)return;
 const own=owner(p),mine=own===state.me.id;
 const ts=state.tasks.filter(t=>t.projectId===projectId||(own&&t.assigneeId===own));
 c.innerHTML='<div class="ppage"><h2>'+esc(p.name)+'</h2><p class="muted">'+(mine?'Ваше личное пространство: все ваши задачи, личные и из объектов. Видите только вы и руководитель.':'Все задачи сотрудника '+esc(name(own))+': личные и из объектов. Задача, созданная здесь, назначается ему, вы видите ход выполнения.')+'</p><div class="toolbar"><button class="primary" data-pnew="1">+ Задача</button><button data-action="refresh">Обновить</button></div>'+section(ts,false)+'</div>';
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
async function updP(id,payload){
 const tk=state.tasks.find(x=>x.id===id);
 if(!tk)return;
 try{
  await call('taskUpdate',Object.assign({id:id,version:tk.version},payload));
  await reload();
  render();
 }catch(err){toast(err.message||String(err));}
}
function upd(id,note){return updP(id,{note:note});}
function clampH(v){return Math.max(6,Math.min(21,Math.round(v*4)/4));}
async function moveTo(id,kind,idx,ns){
 const tk=state.tasks.find(x=>x.id===id);
 if(!tk)return;
 if(kind==='slot'){
  const a=slotsOf(tk);
  if(!a[idx])return;
  a[idx].s=clampH(ns);
  await upd(id,withSlots(tk.note,a));
 }else await upd(id,setStart(tk.note,clampH(ns)));
}
async function resizeTo(id,kind,idx,s,h){
 const tk=state.tasks.find(x=>x.id===id);
 if(!tk)return;
 if(kind==='slot'){
  const a=slotsOf(tk);
  if(!a[idx])return;
  a[idx].s=clampH(s);
  a[idx].h=Math.max(0.25,Math.min(8,h));
  await upd(id,withSlots(tk.note,a));
 }else{
  const hh=Math.max(0.5,Math.min(8,Math.round(h*2)/2));
  await updP(id,{note:setStart(tk.note,clampH(s)),hours:hh});
 }
}
async function shift(id,d,kind,idx){
 const tk=state.tasks.find(x=>x.id===id);
 if(!tk)return;
 if(kind==='slot'){
  const a=slotsOf(tk),i=Number(idx);
  if(!a[i])return;
  if(d==='del'){a.splice(i,1);await upd(id,withSlots(tk.note,a));return;}
  a[i].s=clampH(a[i].s+Number(d));
  await upd(id,withSlots(tk.note,a));
  return;
 }
 const sl=slotMap().get(id);
 if(!sl)return;
 await upd(id,setStart(tk.note,d==='x'?null:clampH(sl.s+Number(d))));
}
function freeStart(ts,day){
 let cur=9;
 dayBlocks(ts,day).forEach(b=>{if(b.s<cur+1e-6&&b.e>cur)cur=b.e;});
 if(cur>=13&&cur<14)cur=14;
 return cur;
}
function slotForm(t,idx,day,ts){
 const a=slotsOf(t),sl=idx>=0?a[idx]:null;
 const d=sl?sl.d:day,s=sl?sl.s:freeStart(ts,day),h=sl?sl.h:1;
 showForm('<div class="slf"><h2>'+(sl?'Изменить слот':'Запланировать в график дня')+'</h2><p class="notice">'+esc(t.title)+' ('+fd(t.start)+'–'+fd(t.end)+')</p><label>День<input id="sl_d" type="date" value="'+d+'" required></label><label>Начать в<input id="sl_t" type="time" step="900" value="'+tm(s)+'" required></label><label>Часов<input id="sl_h" type="number" min="0.25" max="8" step="0.25" value="'+h+'" required></label>'+(sl?'<label class="check"><input type="checkbox" id="sl_del">Удалить этот слот</label>':'')+'<p class="notice">Одну задачу можно разделить на несколько слотов в разные дни или в один день: делайте её понемногу.</p></div>',async()=>{
  const cur=state.tasks.find(x=>x.id===t.id)||t,arr2=slotsOf(cur);
  if(sl&&document.getElementById('sl_del').checked){arr2.splice(idx,1);}
  else{
   const dd=document.getElementById('sl_d').value,tv=document.getElementById('sl_t').value.split(':'),hh=Number(document.getElementById('sl_h').value);
   if(!dd)throw Error('Укажите день');
   if(!(hh>0&&hh<=8))throw Error('Часов: от 0,25 до 8');
   const ss=Number(tv[0])+Number(tv[1]||0)/60;
   const item={d:dd,s:ss,h:hh};
   if(sl)arr2[idx]=item;else arr2.push(item);
  }
  await call('taskUpdate',{id:cur.id,version:cur.version,note:withSlots(cur.note,arr2)});
  await reload();
  render();
 });
}
function adjForm(t,s,h){
 showForm('<div class="slf"><h2>Настроить время</h2><p class="notice">'+esc(t.title)+'</p><label>Начать в<input id="aj_t" type="time" step="900" value="'+tm(s)+'" required></label><label>Часов (шаг 0,5)<input id="aj_h" type="number" min="0.5" max="8" step="0.5" value="'+h+'" required></label><label class="check"><input type="checkbox" id="aj_r">Вернуть автоматическое время (по порядку с 9:00)</label><p class="notice">Другие параметры задачи меняются в её карточке в списке ниже.</p></div>',async()=>{
  const cur=state.tasks.find(x=>x.id===t.id)||t,hh=Number(document.getElementById('aj_h').value);
  if(!(hh>=0.5&&hh<=8&&Math.round(hh*2)===hh*2))throw Error('Часов: от 0,5 до 8, шаг 0,5');
  let note;
  if(document.getElementById('aj_r').checked)note=setStart(cur.note,null);
  else{const v=document.getElementById('aj_t').value.split(':');note=setStart(cur.note,Number(v[0])+Number(v[1]||0)/60);}
  await call('taskUpdate',{id:cur.id,version:cur.version,note:note,hours:hh});
  await reload();
  render();
 });
}
function decForm(t){
 const dlg=document.getElementById('dialog');
 if(!dlg||!dlg.open||!document.getElementById('f_start')||document.getElementById('f_time')||document.getElementById('f_tbox'))return;
 const nt=document.getElementById('f_note'),cur=t?stOf(t):null;
 if(nt&&cur!==null)nt.value=setStart(nt.value,null);
 const tv=cur===null?'':tm(cur);
 const timeLabel='<label>Начать в (необязательно)<input id="f_time" type="time" step="900" value="'+tv+'"></label><p class="notice">Если время не указано, задача встаёт по порядку с 9:00. В режиме «День» блок можно перетаскивать.</p>';
 const hb=document.getElementById('f_hours');
 if(hb){
  hb.closest('label').insertAdjacentHTML('afterend','<div id="f_tbox">'+timeLabel+'</div>');
  return;
 }
 const fg=document.getElementById('f_start').closest('.formgrid')||document.getElementById('f_start').closest('label');
 const box=document.createElement('div');
 box.id='f_tbox';
 box.innerHTML='<label class="check"><input type="checkbox" id="f_usehrs">Работа по часам в один день</label><div id="f_hw"></div><p class="notice">Для задачи на несколько дней сохраните её, затем в режиме «День» нажмите «В график дня»: можно делить на слоты.</p>';
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
async function addAt(date){
 let pid='',assignee='';
 if(view==='projects'&&projectId){const p=state.projects.find(x=>x.id===projectId);if(isP(p)){pid=p.id;assignee=owner(p);}}
 else if(view==='tasks'){
  const ws=document.getElementById('whoSel'),w=ws?ws.value:'me',uid=(w==='me'||w==='all')?state.me.id:w;
  const p=state.projects.find(x=>isP(x)&&owner(x)===uid);
  if(p)pid=p.id;
  else if(uid===state.me.id&&D&&D.fcall){
   try{pid=await D.fcall('personalEnsure',{},60000);if(!state.projects.some(x=>x.id===pid))await reload();}catch(e){toast(e.message||String(e));return;}
  }
  assignee=uid;
 }
 if(!pid)return;
 taskForm(null,null,pid);
 setTimeout(()=>{const s=document.getElementById('f_start'),e=document.getElementById('f_end'),a=document.getElementById('f_assignee');if(s)s.value=date;if(e)e.value=date;if(a&&assignee)a.value=assignee;},60);
}
let drag=null,noClick=0;
document.addEventListener('pointerdown',e=>{
 const b=e.target.closest&&e.target.closest('.pday .pb');
 if(!b||e.target.closest('.psh'))return;
 const rz=e.target.closest('.rz');
 drag={b:b,y0:e.clientY,top0:parseFloat(b.style.top),h0:parseFloat(b.style.height),mode:rz?(rz.classList.contains('t')?'rt':'rb'):'mv',moved:false};
 try{b.setPointerCapture(e.pointerId);}catch(x){}
});
document.addEventListener('pointermove',e=>{
 if(!drag)return;
 const dy=e.clientY-drag.y0;
 if(Math.abs(dy)>5)drag.moved=true;
 if(!drag.moved)return;
 const b=drag.b;
 b.classList.add('dr');
 if(drag.mode==='mv')b.style.top=(drag.top0+dy)+'px';
 else if(drag.mode==='rb')b.style.height=Math.max(18,drag.h0+dy)+'px';
 else{const nh=Math.max(18,drag.h0-dy);b.style.top=(drag.top0+drag.h0-nh)+'px';b.style.height=nh+'px';}
});
function endDrag(e){
 if(!drag)return;
 const d=drag;
 drag=null;
 d.b.classList.remove('dr');
 if(!d.moved)return;
 noClick=Date.now()+400;
 const top=parseFloat(d.b.style.top),ht=parseFloat(d.b.style.height),id=d.b.dataset.bid,kind=d.b.dataset.kind,idx=Number(d.b.dataset.idx);
 if(d.mode==='mv')moveTo(id,kind,idx,H0+top/PX);
 else{
  const s=snap(H0+top/PX),en=snap(H0+(top+ht+2)/PX);
  resizeTo(id,kind,idx,s,Math.max(0.25,en-s));
 }
}
document.addEventListener('pointerup',endDrag);
document.addEventListener('pointercancel',()=>{if(drag){drag.b.classList.remove('dr');drag=null;render();}});
document.addEventListener('click',e=>{
 if(Date.now()<noClick){e.stopImmediatePropagation();e.preventDefault();return;}
 const t=e.target;
 if(!t||!t.closest)return;
 const sh=t.closest('[data-pshift]');
 if(sh){shift(sh.dataset.id,sh.dataset.pshift,sh.dataset.kind,sh.dataset.idx);return;}
 const ps=t.closest('[data-pslot]');
 if(ps){
  e.stopImmediatePropagation();
  const tk=state.tasks.find(x=>x.id===ps.dataset.id),day=document.querySelector('.pday');
  if(tk&&day)slotForm(tk,Number(ps.dataset.idx),day.dataset.day,state.tasks);
  return;
 }
 const pa=t.closest('[data-padj]');
 if(pa){
  e.stopImmediatePropagation();
  const tk=state.tasks.find(x=>x.id===pa.dataset.id),sl=tk&&slotMap().get(tk.id);
  if(tk&&sl)adjForm(tk,sl.s,hrs(tk));
  return;
 }
 const pp=t.closest('[data-pplan]');
 if(pp){
  const tk=state.tasks.find(x=>x.id===pp.dataset.pplan),day=document.querySelector('.pday');
  if(tk&&day){
   const ids=new Set([...document.querySelectorAll('.ppage .pday .pb')].map(x=>x.dataset.bid));
   slotForm(tk,-1,day.dataset.day,state.tasks.filter(x=>ids.has(x.id)||x.id===tk.id));
  }
  return;
 }
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
 const tr=t.closest('.ppage .gantt .grow:not(.ghead) .track');
 if(tr&&!t.closest('.bar')){
  const g=tr.closest('.gantt'),DAY=Number(g.dataset.day);
  if(g.dataset.min&&DAY>0){
   const r=tr.getBoundingClientRect(),i=Math.max(0,Math.floor((e.clientX-r.left)/DAY));
   addAt(plus(g.dataset.min,i));
  }
  return;
 }
 if(t.closest('[data-pnew]')){
  const p=state.projects.find(x=>x.id===projectId);
  if(!p)return;
  taskForm(null,null,projectId);
  setTimeout(()=>{const a=document.getElementById('f_assignee'),o=owner(p);if(a&&o)a.value=o;},60);
 }
},true);
document.addEventListener('change',e=>{
 const el=e.target;
 if(el&&(el.id==='whoSel'||el.id==='filterProject')&&view==='tasks')setTimeout(()=>{try{render();}catch(x){}},0);
});
setInterval(()=>{try{nowMark();}catch(e){}},30000);
const oR=render;
render=function(){
 const r=oR.apply(this,arguments);
 try{objects();}catch(e){}
 try{page();}catch(e){}
 try{mineTasks();}catch(e){}
 try{nowMark();}catch(e){}
 return r;
};
if(typeof state!=='undefined'&&state)render();
})();
