'use strict';
(function(){
const DAY=28,RH=34,BC=17,BB=28,N=window.studioNotify||{};
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;};
if(statuses.indexOf('На согласовании')<0)statuses.splice(1,0,'На согласовании');
let drag=null,suppress=false,gmin='',showAll=LS('studioShowAll')!=='off';
let chatPid='',chatMsgs=[],chatTimer=null,chatFirst=true;
const Q=[],idMap={};let busy=false;
const st=document.createElement('style');
st.textContent='#syncbadge{position:fixed;left:12px;bottom:12px;z-index:150;background:var(--ink);color:var(--panel);padding:6px 12px;border-radius:999px;font-size:13px;opacity:.92}.chk2{display:inline-flex;align-items:center;gap:8px;margin:0;color:var(--ink);font-size:14px}.chk2 input{width:22px;height:22px;min-height:0;margin:0}.gantt .bar.review{background:#9b6bd3}@media(min-width:761px){.board{grid-template-columns:repeat(4,minmax(200px,1fr))}}#chatbtn{position:fixed;right:16px;bottom:16px;z-index:140;width:54px;height:54px;border-radius:50%;font-size:24px;background:var(--accent);color:#fff;border:0;box-shadow:0 4px 18px #0005;padding:0}#chatbtn.dot::after{content:"";position:absolute;top:6px;right:6px;width:13px;height:13px;border-radius:50%;background:#e5484d;border:2px solid var(--panel)}#chatbox{position:fixed;right:16px;bottom:82px;z-index:141;width:min(390px,calc(100vw - 24px));height:min(540px,calc(100dvh - 120px));display:flex;flex-direction:column;background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:14px;box-shadow:0 10px 36px #0006}#chatbox.hidden{display:none}.ch-head{display:flex;justify-content:space-between;align-items:center;padding:8px 8px 8px 14px;border-bottom:1px solid var(--line)}.ch-head button{border:0;background:none;min-height:36px;padding:4px 10px}#chList{flex:1;overflow:auto;padding:10px 12px;display:flex;flex-direction:column;gap:8px}.ch-m{max-width:85%;background:var(--bg);border-radius:12px;padding:6px 10px;align-self:flex-start;overflow-wrap:anywhere;white-space:pre-wrap}.ch-m.me{align-self:flex-end;background:var(--soft)}.ch-m small{display:block;color:var(--muted);font-size:11px}.ch-e{align-self:center;text-align:center;font-size:12px;color:var(--muted);white-space:pre-wrap;max-width:95%;overflow-wrap:anywhere}#chForm{display:flex;gap:8px;padding:10px;border-top:1px solid var(--line)}#chForm input{flex:1}#chForm button{min-width:48px}.gantt .grow{height:'+RH+'px!important;min-height:'+RH+'px!important}.gantt .grow.ghead{height:36px!important;min-height:36px!important}.gantt .glabel{display:flex!important;align-items:center;gap:6px;height:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13px!important;line-height:1.1}.gantt .glabel small{display:inline!important;font-size:11px!important;opacity:.65;overflow:hidden;text-overflow:ellipsis}.gantt .track{height:'+RH+'px!important}.gantt .ghead .track{height:36px!important}.gantt .bar{height:22px!important;top:6px!important;line-height:20px!important;font-size:12px!important;min-height:0!important;padding-top:0!important;padding-bottom:0!important}.gantt .day{font-size:10px!important;line-height:1.1!important}.gantt .depsvg{top:36px!important}.tnote{margin:2px 0 4px;font-size:12px;color:var(--muted);white-space:pre-wrap;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;cursor:pointer;overflow-wrap:anywhere}.tnote.open{display:block}#f_note{min-height:72px;font-size:16px;width:100%}';
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
 if(p.approval!==undefined)t.approval=String(!!p.approval);
 if(p.note!==undefined)t.note=String(p.note);
 if(p.deps!==undefined)t.deps=JSON.stringify(p.deps);
 if(p.projectId!==undefined&&p.projectId!==t.projectId){kids(t.id).concat([t]).forEach(x=>{x.projectId=p.projectId;});t.parentId='';}
 if(p.parentId!==undefined)t.parentId=String(p.parentId||'');
 if(p.status!==undefined&&p.status!==t.status){t.status=p.status;if(p.status==='Готово'){kids(t.id).forEach(k=>{k.status='Готово';});if(t.end<today())t.end=today();}}
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
 const t={id:'tmp-'+Math.random().toString(36).slice(2,10),projectId:p.projectId,parentId:p.parentId||'',title:p.title||'',assigneeId:mgr?(p.assigneeId||''):state.me.id,start:p.start,end:p.end,status:'В работе',deps:JSON.stringify(mgr?(p.deps||[]):[]),lag:String(mgr?(p.lag||0):0),calendarEnabled:String(!!p.calendarEnabled),approval:String(mgr&&!!p.approval),note:String(p.note||''),dirty:'true',syncError:'',version:'1',updatedAt:'',deleted:'false'};
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
 if(action!=='taskDelete'&&$('dialog').open){
  const ap=$('f_approval'),nt=$('f_note'),ex={};
  if(ap)ex.approval=ap.checked;
  if(nt)ex.note=nt.value;
  payload=Object.assign({},payload,ex);
 }
 if(action==='taskUpdate'&&payload.status==='Готово'){const cur=T(payload.id);if(cur&&cur.approval==='true'&&cur.status!=='Готово'&&!manage(cur.projectId)){payload=Object.assign({},payload,{status:'На согласовании'});toast('Отправлено на согласование руководителю');}}
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
const oTaskForm=taskForm;
taskForm=function(t,parent,pre){
 oTaskForm.apply(this,arguments);
 if(!$('dialog').open||!($('f_title')||$('f_status'))||$('f_note'))return;
 const foot=$('editform').querySelector('.footer');if(!foot)return;
 const ref=$('editform').querySelector('[data-action="taskDelete"]')||foot;
 const n=document.createElement('label');
 n.innerHTML='Описание<textarea id="f_note" maxlength="2000" rows="3" placeholder="Что нужно сделать, ссылки, размеры…"></textarea>';
 n.lastChild.value=(t&&t.note)||'';
 ref.parentNode.insertBefore(n,ref);
 if($('f_assignee')&&!$('f_approval')){
  const l=document.createElement('label');l.className='check';
  l.innerHTML='<input type="checkbox" id="f_approval"> Требует согласования: исполнитель ставит «На согласовании», «Готово» ставит руководитель';
  l.firstChild.checked=!!t&&t.approval==='true';
  ref.parentNode.insertBefore(l,ref);
 }
};
const menu=$('menu');
const teamBtn=document.createElement('button');teamBtn.type='button';teamBtn.textContent='Команда';teamBtn.classList.add('hidden');
teamBtn.onclick=()=>{menu.classList.add('hidden');view='users';render();};
menu.insertBefore(teamBtn,menu.firstChild);
const chatBtn=document.createElement('button');chatBtn.id='chatbtn';chatBtn.type='button';chatBtn.textContent='\u{1F4AC}';chatBtn.setAttribute('aria-label','Чат объекта');chatBtn.classList.add('hidden');
const chatBox=document.createElement('div');chatBox.id='chatbox';chatBox.classList.add('hidden');
chatBox.innerHTML='<div class="ch-head"><strong id="chTitle"></strong><button type="button" id="chClose" aria-label="Закрыть">\u2715</button></div><div id="chList"></div><form id="chForm"><input id="chText" maxlength="1000" placeholder="Сообщение…" autocomplete="off"><button class="primary" type="submit" aria-label="Отправить">\u27A4</button></form>';
document.body.append(chatBtn,chatBox);
function chatFmt(at){const d=new Date(at);if(isNaN(d))return '';const p=n=>String(n).padStart(2,'0');return p(d.getHours())+':'+p(d.getMinutes())+' '+p(d.getDate())+'.'+p(d.getMonth()+1);}
function chatRender(){
 const list=$('chList'),near=list.scrollHeight-list.scrollTop-list.clientHeight<80;
 list.innerHTML=chatMsgs.map(m=>m.kind==='event'?`<div class="ch-e">\u{1F4CC} ${esc(m.name)}: ${esc(m.text)}<br><small>${chatFmt(m.at)}</small></div>`:`<div class="ch-m${m.userId===state.me.id?' me':''}"><small>${esc(m.name)} • ${chatFmt(m.at)}</small>${esc(m.text)}</div>`).join('')||'<p class="notice">Пока пусто. Здесь будут сообщения команды и изменения по объекту.</p>';
 if(near||chatFirst)list.scrollTop=list.scrollHeight;
}
function paintChat(){
 chatBtn.classList.toggle('hidden',!(state&&view==='projects'&&projectId));
 chatBtn.classList.toggle('dot',!!(N.chatUnread&&state&&projectId&&!chatPid&&N.chatUnread(projectId)));
}
async function chatLoad(){
 if(!chatPid)return;
 const pid=chatPid;
 try{const r=await origCall('chatList',{projectId:pid});if(chatPid!==pid)return;chatMsgs=r;chatRender();const last=r.length?r[r.length-1].at:'';if(last&&N.markChatSeen)N.markChatSeen(pid,last);}catch(e){}
}
function chatClose(){chatBox.classList.add('hidden');chatPid='';window.studioChatOpen='';clearInterval(chatTimer);paintChat();}
function chatOpen(pid){
 chatPid=pid;window.studioChatOpen=pid;
 $('chTitle').textContent='Чат: '+projectName(pid);
 $('chText').style.display=state.me.role==='observer'?'none':'';
 chatBox.classList.remove('hidden');chatMsgs=[];chatFirst=true;chatRender();
 chatLoad().then(()=>{chatFirst=false;paintChat();});
 clearInterval(chatTimer);chatTimer=setInterval(()=>{if(!document.hidden&&chatPid)chatLoad();},8000);
 paintChat();
}
window.studioOpenChat=pid=>{view='projects';projectId=pid;render();chatOpen(pid);};
chatBtn.onclick=()=>{if(chatPid)chatClose();else chatOpen(projectId);};
$('chClose').onclick=chatClose;
$('chForm').onsubmit=e=>{
 e.preventDefault();
 const inp=$('chText'),text=inp.value.trim();if(!text||!chatPid)return;
 inp.value='';
 chatMsgs.push({id:'tmp'+Date.now(),userId:state.me.id,name:state.me.name,kind:'msg',text:text,at:new Date().toISOString()});
 chatRender();
 call('chatSend',{projectId:chatPid,text:text}).then(()=>chatLoad()).catch(err=>{toast(err.message||String(err));chatLoad();});
};
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
  if(t.note){const m=c.querySelector('.meta'),np=document.createElement('p');np.className='tnote';np.textContent=t.note;np.onclick=()=>np.classList.toggle('open');if(m)m.after(np);}
  const wait=t.assigneeId===state.me.id&&t.status!=='Готово'?arr(t.deps).map(i=>state.tasks.find(x=>x.id===i)).filter(x=>x&&x.status!=='Готово'):[];
  if(wait.length){const p=document.createElement('p'),a=c.querySelector('.actions');p.className='notice';p.textContent='Ожидает: '+wait.map(x=>x.title+(x.status==='На согласовании'?' (на согласовании)':'')).join(', ');if(a)c.insertBefore(p,a);}
 });
 if(chatPid&&chatPid!==projectId)chatClose();
 paintChat();
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
  arr(t.deps).forEach(did=>{const j=shown.findIndex(x=>x.id===did);if(j<0)return;const x1=(days(min,shown[j].end)+1)*DAY,x2=days(min,t.start)*DAY,y1=j*RH+BC,y2=i*RH+BC,gap=days(shown[j].end,t.start)-1;paths+=`<path d="M ${x1} ${y1} H ${x1+8} V ${y2} H ${x2}" fill="none" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#arrow)"/>`;if(gap>0)paths+=`<text x="${x1+10}" y="${y2-4}" font-size="10" fill="var(--muted)">+${gap} д</text>`;});
  if(t.parentId){const j=shown.findIndex(x=>x.id===t.parentId);if(j>=0&&j<i){const px=days(min,shown[j].start)*DAY+6,cx=days(min,t.start)*DAY,y1=j*RH+BB,y2=i*RH+BC;paths+=`<path d="M ${px} ${y1} V ${y2} H ${Math.max(cx,px+10)}" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#arrow2)"/>`;}}
 });
 const labelWidth=matchMedia('(max-width:760px)').matches?160:230;
 const body=shown.map((t,i)=>{const ed=fullEdit(t),dim=isDim(t),cls=t.status==='Готово'?'done':t.status==='Пауза'?'pause':t.status==='На согласовании'?'review':'';
  return `<div class="grow${dim?' dim':''}"><div class="glabel" style="padding-left:${12+rows[i].d*14}px" title="${esc(t.title)}">${rows[i].d?'↳ ':''}${esc(t.title)}<small>${esc(name(t.assigneeId))}</small></div><div class="track" style="width:${w}px"><button class="bar ${cls}${dim?' dim':''}" ${ed?'data-edit="1"':''} style="left:${days(min,t.start)*DAY}px;width:${(days(t.start,t.end)+1)*DAY}px" data-action="taskEdit" data-id="${esc(t.id)}" title="${esc(t.start+' — '+t.end+' • '+t.title+' • '+t.status+(t.note?' • '+String(t.note).slice(0,200):''))}">${ed?'<i class="hd l" data-h="l"></i>':''}<span class="bt">${esc(t.title)}</span>${ed?'<i class="hd r" data-h="r"></i>':''}</button></div></div>`;}).join('');
 $('ganttRoot').innerHTML=`<div class="gantt-scroll"><div class="gantt" style="width:${w+labelWidth}px"><div class="grow ghead"><div class="glabel">Этап / исполнитель</div><div class="track" style="width:${w}px">${ticks}</div></div>${body}<svg class="depsvg" width="${w}" height="${shown.length*RH}" aria-hidden="true"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/></marker><marker id="arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/></marker></defs>${paths}</svg>${today()>=min&&today()<=max?`<div class="todayline" style="left:${labelWidth+days(min,today())*DAY}px"></div>`:''}</div></div><p class="notice">${esc(min)} — ${esc(max)}. Прокрутка по горизонтали. Сплошная стрелка — зависимость (окончание → старт), пунктирная — подзадача родительской задачи. Фиолетовая полоса — на согласовании. Перетащите полосу — перенос, края — длительность. ${ts.length>500?'Отображены первые 500 строк.':''}</p>`;
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
