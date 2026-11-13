'use strict';
(function(){
if(typeof showForm==='undefined'||typeof document==='undefined')return;
const st=document.createElement('style');
st.textContent='.nbp{display:grid;gap:8px}.nbp .top{font-weight:700}.nbp .bar,.nbp .r .b{height:8px;border-radius:99px;background:rgba(127,127,127,.25);overflow:hidden}.nbp .bar i{display:block;height:100%;width:0;background:var(--accent);transition:width .3s}.nbp .rows{max-height:52vh;overflow:auto;display:grid;gap:6px}.nbp .r{display:grid;grid-template-columns:1fr auto;gap:2px 8px;font-size:13px}.nbp .r .t{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.nbp .r.stage .t,.nbp .r.proj .t{font-weight:700}.nbp .r .s{color:var(--muted)}.nbp .r .b{grid-column:1/3;height:4px}.nbp .r .b i{display:block;height:100%;width:0;background:#2e9e6b}.nbp .r.run .b i{width:40%;animation:nbp 1s ease-in-out infinite alternate}.nbp .r.ok .b i{width:100%}.nbp .r.err .b i{width:100%;background:#e5484d}.nbp .r.err .s{color:#e5484d}.nbp .msg{color:#e5484d;white-space:pre-wrap;overflow-wrap:anywhere}@keyframes nbp{from{margin-left:0}to{margin-left:60%}}';
document.head.appendChild(st);
let busy=false;
const mm=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
async function srv(action,payload){
 const r=await transport({action:action,payload:payload||{},token:token});
 if(!r||!r.ok){const m=String(r&&r.error||'Сервер не ответил');if(m.indexOf('AUTH:')===0)signoutLocal();throw Error(m);}
 return r.data;
}
function draw(rows){
 $('editform').innerHTML='<div class="nbp"><div class="top" id="nb_top"></div><div class="bar"><i id="nb_all"></i></div><small id="nb_time"></small><div class="rows">'+rows.map((r,i)=>'<div class="r '+r.k+' wait" id="nb_r'+i+'"><span class="t">'+esc(r.t)+'</span><span class="s" id="nb_s'+i+'">ждёт</span><div class="b"><i></i></div></div>').join('')+'</div><p class="msg hidden" id="nb_msg"></p><div class="footer"><button type="button" id="nb_retry" class="primary hidden">Повторить</button><button type="button" id="nb_stop" class="hidden">Прервать</button><button type="button" id="nb_done" data-action="close" class="primary hidden">Открыть объект</button></div></div>';
}
function setRow(i,state,msg){
 const r=$('nb_r'+i),s=$('nb_s'+i);if(!r)return;
 const k=r.dataset.k;
 r.className='r '+k+' '+state;
 if(s)s.textContent=state==='run'?'сохраняется…':state==='ok'?'готово ✓':state==='err'?'ошибка':'ждёт';
 const m=$('nb_msg');if(m){m.textContent=state==='err'?msg:'';m.classList.toggle('hidden',state!=='err');}
}
function askUI(){
 return new Promise(res=>{
  const rt=$('nb_retry'),sp=$('nb_stop');
  rt.classList.remove('hidden');sp.classList.remove('hidden');
  rt.onclick=()=>{rt.classList.add('hidden');sp.classList.add('hidden');res(true);};
  sp.onclick=()=>{rt.classList.add('hidden');sp.classList.add('hidden');res(false);};
 });
}
async function build(o){
 const total=o.ops.length+1,rows=[{t:'Создаю объект «'+o.name+'»',k:'proj'}].concat(o.ops.map(x=>({t:x.title,k:x.kind==='stage'?'stage':'task'})));
 draw(rows);
 rows.forEach((r,i)=>{const e=$('nb_r'+i);if(e)e.dataset.k=r.k;});
 busy=true;
 const t0=Date.now();let done=0,pid='',cleaned=false,usedTpl='';
 const known=new Set(state.projects.map(p=>p.id)),ids=new Map(),upd=()=>{
  const el=Math.round((Date.now()-t0)/1000),eta=done?Math.round(el/done*(total-done)):0;
  $('nb_top').textContent='Сохранено '+done+' из '+total;
  $('nb_all').style.width=Math.round(done/total*100)+'%';
  $('nb_time').textContent='Прошло '+mm(el)+(done&&done<total?' · осталось примерно '+mm(eta):'')+'. Не закрывайте страницу.';
 };
 const timer=setInterval(upd,1000);upd();
 const ask=window.__nbAsk||askUI;
 async function step(i,fn){
  for(let tries=0;;tries++){
   setRow(i,'run');
   try{await fn(tries);setRow(i,'ok');done++;upd();return;}
   catch(e){
    setRow(i,'err',(e.message||String(e))+'\nНажмите «Повторить». Если пропала связь, подождите и повторите.');
    if(!(await ask(e))){const x=Error('stop');x.stop=true;throw x;}
   }
  }
 }
 const dialog=$('dialog'),block=e=>{if(busy)e.preventDefault();};
 dialog.addEventListener('cancel',block);
 try{
  await step(0,async tries=>{
   if(!pid&&tries){
    const s=await srv('state',{}),p=s.projects.find(x=>x.name===o.name&&!known.has(x.id));
    if(p)pid=p.id;
   }
   if(!pid){
    const base={name:o.name,viewers:o.viewers,members:o.members,start:o.start,assigneeId:''};
    try{pid=await srv('projectCreate',Object.assign({templateId:''},base));}
    catch(e){
     if(!/Шаблон не найден/.test(e.message||''))throw e;
     usedTpl=[...new Set((state.templates||[]).map(t=>t.templateId))][0];
     if(!usedTpl)throw Error('На сервере нет шаблонов. Обновите Code.gs или добавьте шаблон.');
     pid=await srv('projectCreate',Object.assign({templateId:usedTpl},base));
    }
   }
   if(usedTpl&&!cleaned){
    const s=await srv('state',{}),ts=s.tasks.filter(t=>t.projectId===pid).sort((a,b)=>b.start.localeCompare(a.start));
    for(const t of ts)await srv('taskDelete',{id:t.id,version:t.version});
    cleaned=true;
   }
  });
  for(let i=0;i<o.ops.length;i++){
   const x=o.ops[i];
   await step(i+1,async tries=>{
    if(tries){
     const s=await srv('state',{}),used=new Set([...ids.values()]),t=s.tasks.find(q=>q.projectId===pid&&q.title===x.title&&!used.has(q.id));
     if(t){ids.set(x.key,t.id);return;}
    }
    ids.set(x.key,await srv('taskCreate',{projectId:pid,parentId:x.parent?ids.get(x.parent):'',title:x.title,note:x.note||'',start:x.start,end:x.end,assigneeId:o.assignee,deps:x.deps.map(k=>ids.get(k)).filter(Boolean),lag:0,kind:x.kind,calendarEnabled:x.kind==='task'&&o.cal}));
   });
  }
  clearInterval(timer);upd();
  $('nb_top').textContent='Готово: сохранено '+total+' из '+total;
  $('nb_time').textContent='Заняло '+mm(Math.round((Date.now()-t0)/1000))+'.';
  projectId=pid;view='projects';
  try{await reload();}catch(e){}
  render();
  try{
   const miss=o.ops.filter(x=>x.note&&state.tasks.some(q=>q.projectId===pid&&q.title===x.title&&!String(q.note||'').trim())).length;
   if(miss)$('nb_time').textContent+=' Внимание: пояснения не сохранились у задач: '+miss+'. Сервер не принял поле «Пояснение» при создании.';
  }catch(e){}
  const d=$('nb_done');if(d)d.classList.remove('hidden');
 }catch(e){
  clearInterval(timer);
  if(e&&e.stop){
   try{if(pid){projectId=pid;view='projects';}await reload();render();}catch(x){}
   const d=$('nb_done');if(d){d.textContent='Закрыть';d.classList.remove('hidden');}
   $('nb_top').textContent='Создание прервано. Сохранено '+done+' из '+total+'.';
   return;
  }
  throw e;
 }finally{busy=false;dialog.removeEventListener('cancel',block);}
}
async function submitNew(){
 const b=document.querySelector('[data-nmode].on'),mode=b?b.dataset.nmode:'tpl';
 const all=[...document.querySelectorAll('#n_pick [data-nt]')];
 const sel=new Set((mode==='empty'?[]:mode==='tpl'?all:all.filter(i=>i.checked)).map(i=>i.dataset.nt));
 const name=$('n_name').value.trim(),start=$('n_start').value;
 if(!name)throw Error('Введите название объекта');
 if(!start)throw Error('Укажите дату старта');
 if(mode==='pick'&&!sel.size)throw Error('Выберите хотя бы один этап или задачу');
 await build({name:name,start:start,ops:window.studioPlanTpl(sel,start),assignee:$('n_assignee').value,cal:$('n_cal').checked,members:selected('n_members'),viewers:selected('n_viewers')});
}
const oSF=showForm;
showForm=function(body,submit){
 oSF.apply(this,arguments);
 if($('n_name')&&$('n_pick'))modalSubmit=submitNew;
};
})();
