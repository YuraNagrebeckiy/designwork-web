'use strict';
(function(){
if(typeof showForm==='undefined'||typeof document==='undefined')return;
const S=[
{id:'s1',title:'1. Подготовительный период',deps:[],tasks:[
{id:'1.1',title:'1.1 Демонтаж лестницы',dur:2,deps:[]},
{id:'1.2',title:'1.2 Демонтаж перегородок',dur:3,deps:[]},
{id:'1.3',title:'1.3 Демонтаж потолка',dur:2,deps:[]},
{id:'1.4',title:'1.4 Сбор и спуск лома от демонтажа',dur:2,deps:['1.1','1.2','1.3']},
{id:'1.5',title:'1.5 Вывоз и утилизация лома',dur:1,deps:['1.4']},
{id:'1.6',title:'1.6 Подготовка поверхностей (очистка стен, потолков, обеспыливание)',dur:2,deps:['1.5']}]},
{id:'s2',title:'2. Устройство перекрытия',deps:['s1'],tasks:[
{id:'2.1',title:'2.1 Изготовление и монтаж рамы перекрытия',dur:3,deps:['1.6']},
{id:'2.2',title:'2.2 Армирование перекрытия',dur:2,deps:['2.1']},
{id:'2.3',title:'2.3 Устройство монолитного перекрытия',dur:2,deps:['2.2']}]},
{id:'s3',title:'3. Возведение и черновая отделка стен',deps:['s2'],tasks:[
{id:'3.1',title:'3.1 Кладка колонн и перегородок из газоблока (100/200 мм)',dur:5,deps:['2.3']},
{id:'3.2',title:'3.2 Устройство перегородок и прижимных стенок из ГКЛ (2 слоя)',dur:4,deps:['3.1']},
{id:'3.3',title:'3.3 Оштукатуривание стен и колонн',dur:5,deps:['3.2']},
{id:'3.4',title:'3.4 Выравнивающая шпатлевка стен',dur:4,deps:['3.3'],lag:14}]},
{id:'s4',title:'4. Устройство полов',deps:[],tasks:[
{id:'4.1',title:'4.1 Стяжка 100 мм и гидроизоляция пола',dur:3,deps:[],align:'3.4'},
{id:'4.2',title:'4.2 Устройство наливных полов (самовыравнивающаяся стяжка)',dur:2,deps:['4.1']},
{id:'4.3',title:'4.3 Укладка и шлифовка фанеры (под паркет)',dur:3,deps:['4.2'],lag:20}]},
{id:'s5',title:'5. Потолки и откосы',deps:[],tasks:[
{id:'5.1',title:'5.1 Устройство потолков из ГКЛ и оштукатуривание откосов',dur:5,deps:['3.2']},
{id:'5.2',title:'5.2 Выравнивающая шпатлевка потолков и откосов',dur:3,deps:['5.1']}]},
{id:'s6',title:'6. Предчистовая и чистовая отделка',deps:['s3','s4','s5'],tasks:[
{id:'6.1',title:'6.1 Оклейка стен, потолков и откосов малярным стеклохолстом',dur:4,deps:['3.4','4.3','5.2']},
{id:'6.2',title:'6.2 Финишная шпатлевка (стены, потолки, откосы) за 2 раза',dur:5,deps:['6.1']},
{id:'6.3',title:'6.3 Облицовка полов и стен керамогранитом/плиткой',dur:7,deps:['3.4','4.3','5.2']},
{id:'6.4',title:'6.4 Окраска стен, потолков и откосов за 2 раза',dur:5,deps:['6.2']},
{id:'6.5',title:'6.5 Декоративная штукатурка и оклейка обоями',dur:5,deps:['6.4']},
{id:'6.6',title:'6.6 Укладка инженерной доски и монтаж плинтусов',dur:4,deps:['6.4']}]},
{id:'s7',title:'7. Завершение стройки',deps:['s6'],tasks:[
{id:'7.1',title:'7.1 Финальная уборка помещений',dur:1,deps:['6.5','6.6']}]}
];
const off=d=>{if(window.studioCal&&window.studioCal.kind)return !!window.studioCal.kind(d);const w=new Date(d+'T00:00:00Z').getUTCDay();return w===0||w===6;};
const nextWork=d=>{for(let i=0;i<60&&off(d);i++)d=plus(d,1);return d;};
const fd=d=>d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4);
function plan(start0){
 const start=nextWork(start0),M=new Map(),ops=[];
 S.forEach(st=>{
  const rows=st.tasks.map(t=>{
   let s;
   if(t.align&&M.has(t.align))s=M.get(t.align).start;
   else if(t.deps.length){const e=t.deps.map(k=>M.get(k).end).reduce((a,b)=>b>a?b:a);s=nextWork(plus(e,1+(t.lag||0)));}
   else s=start;
   const r={key:t.id,parent:st.id,title:t.title,kind:'task',start:s,end:plus(s,t.dur-1),deps:t.deps.slice(),lag:t.lag||0};
   M.set(t.id,r);return r;
  });
  const s0=rows.map(r=>r.start).reduce((a,b)=>b<a?b:a),e0=rows.map(r=>r.end).reduce((a,b)=>b>a?b:a);
  ops.push({key:st.id,parent:'',title:st.title,kind:'stage',start:s0,end:e0,deps:st.deps.slice(),lag:0});
  M.set(st.id,ops[ops.length-1]);
  rows.forEach(r=>ops.push(r));
 });
 return ops;
}
window.studioPlanSMR=plan;
if(typeof document.createElement!=='function')return;
let busy=false;
const mm=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
async function srv(action,payload){
 const r=await transport({action:action,payload:payload||{},token:token});
 if(!r||!r.ok){const m=String(r&&r.error||'Сервер не ответил');if(m.indexOf('AUTH:')===0)signoutLocal();throw Error(m);}
 return r.data;
}
function draw(rows){
 $('editform').innerHTML='<div class="nbp"><div class="top" id="nb_top"></div><div class="bar"><i id="nb_all"></i></div><small id="nb_time"></small><div class="rows">'+rows.map((r,i)=>'<div class="r '+r.k+' wait" id="nb_r'+i+'"><span class="t">'+esc(r.t)+'</span><span class="s" id="nb_s'+i+'">ждёт</span><div class="b"><i></i></div></div>').join('')+'</div><p class="msg hidden" id="nb_msg"></p><div class="footer"><button type="button" id="nb_retry" class="primary hidden">Повторить</button><button type="button" id="nb_stop" class="hidden">Прервать</button><button type="button" id="nb_done" data-action="close" class="primary hidden">Открыть стройку</button></div></div>';
}
function setRow(i,state,msg){
 const r=$('nb_r'+i),s=$('nb_s'+i);if(!r)return;
 r.className='r '+r.dataset.k+' '+state;
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
async function build(pid,ops){
 const total=ops.length,rows=ops.map(x=>({t:x.title,k:x.kind==='stage'?'stage':'task'}));
 draw(rows);rows.forEach((r,i)=>{const e=$('nb_r'+i);if(e)e.dataset.k=r.k;});
 busy=true;
 const t0=Date.now();let done=0;const ids=new Map();
 const upd=()=>{const el=Math.round((Date.now()-t0)/1000),eta=done?Math.round(el/done*(total-done)):0;
  $('nb_top').textContent='Сохранено '+done+' из '+total;$('nb_all').style.width=Math.round(done/total*100)+'%';
  $('nb_time').textContent='Прошло '+mm(el)+(done&&done<total?' · осталось примерно '+mm(eta):'')+'. Не закрывайте страницу.';};
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
  for(let i=0;i<ops.length;i++){
   const x=ops[i];
   await step(i,async tries=>{
    if(tries){
     const s=await srv('state',{}),used=new Set([...ids.values()]),t=s.tasks.find(q=>q.projectId===pid&&q.title===x.title&&!used.has(q.id));
     if(t){ids.set(x.key,t.id);return;}
    }
    const id=await srv('taskCreate',{projectId:pid,parentId:x.parent?ids.get(x.parent):'',title:x.title,start:x.start,end:x.end,assigneeId:'',deps:x.deps.map(k=>ids.get(k)).filter(Boolean),lag:x.lag||0,kind:x.kind,calendarEnabled:false});
    ids.set(x.key,id);
    if(x.kind==='stage')await srv('sectionSet',{id:id,section:'build'});
   });
  }
  clearInterval(timer);upd();
  $('nb_top').textContent='Готово: сохранено '+total+' из '+total;
  $('nb_time').textContent='Заняло '+mm(Math.round((Date.now()-t0)/1000))+'.';
  try{await reload();}catch(e){}
  try{
   const sm=state.sections||{},miss=[...ids.values()].filter(id=>sm[id]!=='build');
   for(const id of miss){try{await srv('sectionSet',{id:id,section:'build'});}catch(e){}}
   if(miss.length){try{await reload();}catch(e){}}
  }catch(e){}
  render();
  const d=$('nb_done');if(d)d.classList.remove('hidden');
 }catch(e){
  clearInterval(timer);
  if(e&&e.stop){
   try{await reload();render();}catch(x){}
   const d=$('nb_done');if(d){d.textContent='Закрыть';d.classList.remove('hidden');}
   $('nb_top').textContent='Создание прервано. Сохранено '+done+' из '+total+'.';
   return;
  }
  throw e;
 }finally{busy=false;dialog.removeEventListener('cancel',block);}
}
function openForm(){
 const pid=projectId;
 showForm('<div class="smr"><h2>Строительно-монтажные работы (СМР)</h2><p class="notice">Будут добавлены 7 этапов и 25 задач в раздел «Стройка» с зависимостями, параллельными работами и технологическими паузами. Сроки каждой задачи потом можно менять. Исполнители не назначаются.</p><label>Дата начала СМР (после подписания договора)<input id="smr_start" type="date" value="'+today()+'" required></label><p id="smr_sum" class="notice"></p></div>',async()=>{
  const s=$('smr_start').value;if(!s)throw Error('Укажите дату начала');
  await build(pid,plan(s));
 });
 sum();
}
function sum(){
 const e=$('smr_sum'),i=$('smr_start');if(!e||!i)return;
 const ops=plan(i.value||today());
 e.textContent='Ориентировочное окончание стройки: '+fd(ops.map(o=>o.end).reduce((a,b)=>b>a?b:a))+'.';
}
document.addEventListener('change',e=>{if(e.target&&e.target.id==='smr_start')sum();});
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('[data-buildtpl]');
 if(!b)return;
 e.stopImmediatePropagation();e.preventDefault();
 if(typeof admin==='function'&&admin())openForm();
},true);
const oR=render;
render=function(){
 const r=oR.apply(this,arguments);
 try{document.querySelectorAll('[data-buildtpl]').forEach(b=>{b.textContent='Добавить шаблон СМР';});}catch(e){}
 return r;
};
if(state)render();
})();
