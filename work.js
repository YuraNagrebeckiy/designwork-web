'use strict';
(function(){
const HOURS=8,MON=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
const st=document.createElement('style');
st.textContent='#redglow{position:fixed;inset:0;pointer-events:none;z-index:2147483000;transition:box-shadow .8s}.gantt .grow.ghead{height:54px!important;min-height:54px!important}.gantt .ghead .track{height:54px!important}.gantt .ghead .day{top:18px!important}.gantt .depsvg{top:54px!important}.gmon{position:absolute;top:0;height:18px;border-left:1px solid var(--line);padding:1px 0 0 4px;font-size:12px;font-weight:700;color:var(--ink);white-space:nowrap;z-index:1}.tnote{display:-webkit-box!important;-webkit-line-clamp:6!important;color:var(--ink)!important;background:var(--bg);border-left:3px solid var(--accent);padding:3px 8px;border-radius:6px}.tnote.open{display:block!important}.tnote::before{content:"Пояснение: ";font-weight:700}.slot{margin:2px 0;font-size:12px;color:var(--muted)}';
document.head.appendChild(st);
const fmt=d=>d?d.slice(8)+'.'+d.slice(5,7):'';
const hrsOf=t=>Number(t.hours)>0?Number(t.hours):0;
const planDay=t=>(t.status!=='Готово'&&t.start<today())?today():t.start;
const late=t=>{if(t.status==='Готово')return 0;const d=days(hrsOf(t)?t.start:t.end,today());return d>0?d:0;};
const clock=(x,s)=>{const v=s?(x<4?9+x:10+x):(x<=4?9+x:10+x);return String(Math.floor(v)).padStart(2,'0')+':'+String(Math.round((v%1)*60)).padStart(2,'0');};
function loadOf(who,day,except){let s=0;state.tasks.forEach(x=>{if(x.id!==except&&x.assigneeId===who&&hrsOf(x)&&planDay(x)===day)s+=hrsOf(x);});return s;}
function slots(){const used=new Map(),out=new Map();state.tasks.forEach(t=>{const h=hrsOf(t);if(!h||!t.assigneeId)return;const d=planDay(t),k=t.assigneeId+'|'+d,u=used.get(k)||0;used.set(k,u+h);out.set(t.id,{day:d,text:clock(u,true)+'–'+clock(u+h,false),over:u+h>HOURS});});return out;}
manage=function(pid){return !!state&&admin()&&state.projects.some(p=>p.id===pid);};
const glow=document.createElement('div');glow.id='redglow';document.body.appendChild(glow);
function paintGlow(){
 let m=0;
 if(state)state.tasks.forEach(t=>{if(t.assigneeId===state.me.id){const d=late(t);if(d>m)m=d;}});
 if(!m){glow.style.boxShadow='none';return;}
 const lv=Math.min(m,6),a=Math.min(.15+.12*(lv-1),.75);
 glow.style.boxShadow='inset 0 0 '+(6+2.5*lv)+'vmin '+(1+.7*lv)+'vmin rgba(153,23,32,'+a+')';
}
function decorate(){
 if(!state)return;
 document.querySelectorAll('#content .card [data-chat]').forEach(b=>b.remove());
 const sl=slots();
 document.querySelectorAll('#content .card[data-drag]').forEach(c=>{
  const t=state.tasks.find(x=>x.id===c.dataset.drag);if(!t)return;
  if(hrsOf(t)&&late(t)>0)c.classList.add('overdue');
  const s=sl.get(t.id);
  if(s&&!c.querySelector('.slot')){
   const p=document.createElement('p');p.className='slot';
   p.textContent='Время: '+(s.day!==t.start?'перенос с '+fmt(t.start)+' на ':'')+fmt(s.day)+' • '+s.text+' • '+t.hours+' ч'+(s.over?' (за пределами 9:00–18:00)':'');
   const m=c.querySelector('.meta');if(m)m.after(p);else c.appendChild(p);
  }
 });
}
function decorateForm(t,parent){
 if(!$('dialog').open||(!$('f_start')&&!$('f_status'))||$('f_hours')||$('f_asg_box'))return;
 const nt=$('f_note');
 if(nt){
  if(!admin()&&t&&!t.parentId){nt.closest('label').remove();}
  else{const l=nt.parentNode;if(l.firstChild&&l.firstChild.nodeType===3)l.firstChild.nodeValue='Пояснение к задаче';nt.placeholder='Что нужно сделать именно в этой задаче: ссылки, размеры, требования…';}
 }
 const s=$('f_start'),e=$('f_end');
 const hourMode=!!(s&&e)&&((!t&&!!parent)||(!!t&&hrsOf(t)>0));
 if(hourMode){
  s.closest('label').firstChild.nodeValue='День работы';
  e.closest('label').style.display='none';
  const sync=()=>{e.value=s.value;};sync();
  s.closest('.formgrid').insertAdjacentHTML('afterend','<label>Часов работы (рабочее время 9:00–18:00, до '+HOURS+' ч в день)<input id="f_hours" type="number" min="0.5" max="'+HOURS+'" step="0.5" value="'+(t&&hrsOf(t)?hrsOf(t):2)+'" required></label><p class="notice" id="f_load"></p><p class="notice">Если подзадача не выполнена в этот день, она автоматически переносится на следующий.</p>');
  const upd=()=>{
   const who=$('f_assignee')?$('f_assignee').value:(t?t.assigneeId:state.me.id),day=s.value,h=Number($('f_hours').value)||0;
   if(!who||!day){$('f_load').textContent='';return;}
   const used=loadOf(who,day,t&&t.id),free=HOURS-used;
   $('f_load').textContent='Уже запланировано на '+fmt(day)+': '+used+' ч из '+HOURS+'. '+(h>free?'Не помещается, свободно '+Math.max(0,free)+' ч. Выберите другой день или сократите время.':'Свободно '+free+' ч. Время: '+clock(used,true)+'–'+clock(used+h,false)+'.');
  };
  s.addEventListener('input',()=>{sync();upd();});s.addEventListener('change',()=>{sync();upd();});
  $('f_hours').addEventListener('input',upd);
  if($('f_assignee'))$('f_assignee').addEventListener('change',upd);
  upd();
 }else if($('f_assignee')&&$('f_assignee').tagName==='SELECT'){
  const depth=t?depthOf(t):(parent?depthOf(parent)+1:0);
  if(depth>1)return;
  const sel=$('f_assignee'),cur=sel.value,chosen=new Set();
  if(cur)chosen.add(cur);
  if(t)state.tasks.forEach(k=>{if(k.parentId===t.id&&k.assigneeId&&k.title===t.title+' — '+name(k.assigneeId))chosen.add(k.assigneeId);});
  const staff=state.users.filter(u=>u.approved==='true'&&u.role!=='observer');
  const box=document.createElement('div');box.id='f_asg_box';
  box.innerHTML='<h3>Исполнители</h3><small>Отметьте одного или нескольких. Если исполнителей несколько, каждый получает свою часть задачи, сам добавляет подзадачи и планирует часы. Сама задача остаётся общей.</small><div class="pick">'+staff.map(u=>'<label class="check"><input type="checkbox" name="f_asg" value="'+esc(u.id)+'" '+(chosen.has(u.id)?'checked':'')+'><span>'+esc(u.name)+'</span></label>').join('')+'</div><input type="hidden" id="f_assignee" value="'+esc(cur)+'">';
  sel.closest('label').replaceWith(box);
  const hid=$('f_assignee'),sync=()=>{const ids=[...box.querySelectorAll('input[name="f_asg"]:checked')].map(i=>i.value);hid.value=ids.length===1?ids[0]:'';};
  box.addEventListener('change',sync);sync();
 }
}
const oTF=taskForm;
taskForm=function(t,parent,pre){oTF.apply(this,arguments);try{decorateForm(t,parent);}catch(e){}};
const oCall=call;
call=function(action,payload){
 if((action==='taskCreate'||action==='taskUpdate')&&$('dialog').open){
  const ex={},hb=$('f_hours');
  if(hb){
   const h=Number(hb.value);
   if(!(h>=0.5&&h<=HOURS&&Math.round(h*2)===h*2))return Promise.reject(Error('Часов: от 0,5 до 8, шаг 0,5'));
   ex.hours=h;if(payload&&payload.start!==undefined)ex.end=payload.start;
  }
  if($('f_asg_box'))ex.assignees=[...document.querySelectorAll('#editform input[name="f_asg"]:checked')].map(i=>i.value);
  payload=Object.assign({},payload,ex);
 }
 return oCall.call(this,action,payload);
};
const oRG=renderGantt;
renderGantt=function(id){
 oRG.apply(this,arguments);
 try{
  const root=$('ganttRoot'),tr=root&&root.querySelector('.ghead .track');
  if(!tr||tr.querySelector('.gmon'))return;
  const ts=state.tasks.filter(t=>t.projectId===id);if(!ts.length)return;
  const min=plus(ts.reduce((a,t)=>t.start<a?t.start:a,ts[0].start),-1),mx=plus(ts.reduce((a,t)=>t.end>a?t.end:a,ts[0].end),2),n=days(min,mx)+1;
  let h='';
  for(let i=0;i<n;i++){const d=plus(min,i);if(i===0||d.slice(8)==='01')h+='<span class="gmon" style="left:'+(i*28)+'px">'+MON[+d.slice(5,7)-1]+' '+d.slice(0,4)+'</span>';}
  tr.insertAdjacentHTML('beforeend',h);
 }catch(e){}
};
const oAS=applyState;
applyState=function(s){
 try{if(s&&s.chat&&s.me)Object.keys(s.chat).forEach(k=>{if(s.chat[k]&&s.chat[k].kind==='event')s.chat[k]={at:'',by:s.me.id,name:'',kind:'msg',text:''};});}catch(e){}
 return oAS.apply(this,arguments);
};
const oRender=render;
render=function(){const r=oRender.apply(this,arguments);try{decorate();paintGlow();}catch(e){}return r;};
setInterval(()=>{try{paintGlow();}catch(e){}},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)try{paintGlow();}catch(e){}});
if(state)render();
})();
