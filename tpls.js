'use strict';
(function(){
if(typeof document==='undefined'||typeof state==='undefined')return;
const TYPES={int:['Дизайн интерьера','design'],hse:['Проектирование дома','design'],lnd:['Благоустройство территории','design'],smf:['СМР Интерьер','build'],smb:['СМР Здание','build']};
const PAL=['#2f7fd1','#e07b39','#2a9d8f','#b14fd3','#c9a21c','#d14f6a'];
const IDS=(()=>{const a=[];for(let s=1;s<=9;s++)for(let t=1;t<=12;t++)a.push(s+'.'+t);return new Set(a);})();
const HOUSE=[
{id:'h1',title:'1. Предпроектная подготовка и сбор исходных данных',deps:[],note:'Чек-лист ГАПа: проверить посадку по СП 53.13330.2019 / СП 42.13330. Отступ от красной линии улиц — не менее 5 м, от проездов — 3 м. Отступ от границы соседнего участка — минимум 3 м. Учесть противопожарные разрывы между строениями (от 6 до 15 м в зависимости от степени огнестойкости материалов). Проверить ориентацию по сторонам света (инсоляцию жилых комнат) и розу ветров.',tasks:[
{id:'1.1',title:'1.1 Запрос и получение топосъёмки, геологии, ГПЗУ (градостроительного плана)',dur:7,deps:[],note:'Запросить у заказчика топосъёмку, данные геологии и ГПЗУ. Пока их нет, посадку не выполнять.'},
{id:'1.2',title:'1.2 Анализ документации и посадка дома на участок',dur:5,deps:['1.1'],note:'Идёт после 1.1. Проверка по чек-листу этапа.'}]},
{id:'h2',title:'2. Эскизный проект (ЭП): творчество и концепция',deps:['h1'],note:'Идёт после утверждения посадки (1.2). Чек-лист ГАПа: творческий этап требует времени на «переваривание» заказчиком. Задача 2.4 с плавающей длительностью (по умолчанию 5–7 дней, поставлено 6). Зафиксировать несущие оси, мокрые зоны и габариты лестницы. После подписания ЭП правки в планировку не принимаются.',tasks:[
{id:'2.1',title:'2.1 Поиск вдохновения, подбор референсов (Moodboard), формирование идеи',dur:3,deps:['1.2'],note:''},
{id:'2.2',title:'2.2 Разработка 1–2 вариантов планировочного решения',dur:7,deps:['2.1'],note:'Идёт после 2.1.'},
{id:'2.3',title:'2.3 Объёмно-пространственное решение (черновая 3D-модель) и концепция фасадов',dur:7,deps:['2.1'],align:'2.2',note:'Идёт параллельно с 2.2.'},
{id:'2.4',title:'2.4 [Буферная пауза] Обсуждение и согласование ЭП с заказчиком',dur:6,deps:['2.2','2.3'],note:'Буферная пауза: срок плавающий (5–7 дней), его можно растягивать. Если заказчик вернул концепцию на доработку, сдвиньте даты задач 2.1–2.3 в Ганте: следующие этапы сдвинутся вместе с ними.'}]},
{id:'h3',title:'3. Архитектурные решения (АР)',deps:['h2'],note:'Идёт строго после подписания ЭП (2.4). Чек-лист ГАПа: проверить соответствие 3D-модели и 2D-чертежей. Обязательный контроль высот: чистый пол (отметка 0.000), высота прохождения лестницы (не менее 2.1 м над ступенями), габариты котельной (объём не менее 15 м³, наличие окна, дверь открывается наружу — по СНиП 42-01-2002).',tasks:[
{id:'3.1',title:'3.1 Детализация 3D-модели (материалы фасада, декор, окна, кровля)',dur:10,deps:['2.4'],note:''},
{id:'3.2',title:'3.2 Вычерчивание планов этажей, кладочных планов, плана кровли',dur:10,deps:['2.4'],align:'3.1',note:'Идёт параллельно с 3.1.'},
{id:'3.3',title:'3.3 Построение разрезов, фасадов, узлов пирогов (пол, стены, кровля)',dur:7,deps:['3.2'],note:'Идёт после 3.2.'},
{id:'3.4',title:'3.4 Формирование спецификаций (окна, двери, ведомости материалов фасада)',dur:4,deps:['3.3','3.1'],note:'Идёт после 3.3.'}]},
{id:'h4',title:'4. Конструктивные решения (КР)',deps:[],note:'Может начинаться параллельно с планами АР (3.2), когда ясны несущие оси, но финализируется после 3.4. Чек-лист ГАПа: фундамент должен опираться на данные геологии с учётом глубины промерзания грунта. Проверить отсутствие «мостиков холода» в узлах опирания перекрытий и балконов. Убедиться, что конструктор учёл все инженерные шахты и стояки из раздела АР, чтобы потом не резать монолит.',tasks:[
{id:'4.1',title:'4.1 Расчёт и конструирование фундаментов (КЖ)',dur:7,deps:['3.2'],note:''},
{id:'4.2',title:'4.2 Конструирование несущих стен, колонн, перемычек',dur:7,deps:['4.1'],note:''},
{id:'4.3',title:'4.3 Расчёт и чертежи перекрытий (монолит / плиты / дерево)',dur:7,deps:['4.2'],note:''},
{id:'4.4',title:'4.4 Конструирование стропильной системы крыши (КД/КМ)',dur:7,deps:['4.3','3.4'],note:'Финализируется после 3.4.'}]},
{id:'h5',title:'5. Инженерные сети (ОВ, ВК, ЭОМ), опционально',deps:[],note:'Опционально: снимите этап в режиме «Выбрать части», если инженерные сети не входят в договор. Идёт после фиксации планов АР (3.2) и согласования КР. Чек-лист ГАПа: согласовать трассы коммуникаций с разделом КР. Вентиляционные шахты вывести выше конька кровли (зона ветрового подпора). Трубы ВК не должны попадать в наружные стены, чтобы исключить промерзание.',tasks:[
{id:'5.1',title:'5.1 Проектирование отопления и вентиляции (ОВ)',dur:7,deps:['3.2','4.4'],note:''},
{id:'5.2',title:'5.2 Проектирование водоснабжения и канализации (ВК)',dur:7,deps:['3.2','4.4'],align:'5.1',note:''},
{id:'5.3',title:'5.3 Проектирование электрики (ЭОМ)',dur:7,deps:['3.2','4.4'],align:'5.1',note:''}]},
{id:'h6',title:'6. Финализация, аудит и выпуск проекта',deps:['h3','h4','h5'],note:'Чек-лист ГАПа: удостовериться, что в штампах указаны верные стадии (П или РД), стоят все подписи. Выдать заказчику не только PDF, но и исходники (DWG/BIMx), если это предусмотрено договором.',tasks:[
{id:'6.1',title:'6.1 Сводная проверка всех разделов (BIM-координация или ручной аудит на коллизии)',dur:3,deps:['3.4','4.4','5.1','5.2','5.3'],note:'Идёт после завершения АР, КР и инженерии.'},
{id:'6.2',title:'6.2 Оформление альбома, печать и передача заказчику',dur:3,deps:['6.1'],note:'Идёт после 6.1.'}]}
];
const off=d=>{if(window.studioCal&&window.studioCal.kind)return !!window.studioCal.kind(d);const w=new Date(d+'T00:00:00Z').getUTCDay();return w===0||w===6;};
const nextWork=d=>{for(let i=0;i<60&&off(d);i++)d=plus(d,1);return d;};
const fd=d=>d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4);
const mx=a=>a.reduce((x,y)=>y>x?y:x);
const mn=a=>a.reduce((x,y)=>y<x?y:x);
const nDays=(a,b)=>Math.round((Date.parse(b)-Date.parse(a))/864e5)+1;
function planData(DATA,sel,start0){
 const start=nextWork(start0),M=new Map(),ops=[];
 let lastEnd='';
 DATA.forEach(st=>{
  const ts=st.tasks.filter(t=>!sel||sel.has(t.id));
  if(!ts.length)return;
  const rows=ts.map(t=>{
   const deps=t.deps.filter(k=>M.has(k));
   let s;
   if(t.align&&M.has(t.align))s=M.get(t.align).start;
   else if(deps.length)s=nextWork(plus(mx(deps.map(k=>M.get(k).end)),1));
   else if(t.deps.length&&lastEnd)s=nextWork(plus(lastEnd,1));
   else s=start;
   const r={key:t.id,parent:st.id,title:t.title,note:t.note||'',kind:'task',start:s,end:plus(s,t.dur-1),deps:deps,lag:0};
   M.set(t.id,r);
   if(!lastEnd||r.end>lastEnd)lastEnd=r.end;
   return r;
  });
  const so={key:st.id,parent:'',title:st.title,note:st.note||'',kind:'stage',start:mn(rows.map(r=>r.start)),end:mx(rows.map(r=>r.end)),deps:(st.deps||[]).filter(k=>M.has(k)),lag:0};
  M.set(st.id,so);
  ops.push(so);
  rows.forEach(r=>ops.push(r));
 });
 return ops;
}
window.studioPlanHouse=(sel,s)=>planData(HOUSE,sel,s);
let ORIG=null,newType='int',amode='tpl';
const getOrig=()=>ORIG||window.studioPlanTpl;
function planFor(type,sel,s){
 if(type==='int'){const f=getOrig();return f?f(sel||IDS,s):[];}
 if(type==='hse')return planData(HOUSE,sel,s);
 return [];
}
const WRAP=(sel,s)=>planFor(newType,sel,s);
function ensureWrap(){if(window.studioPlanTpl!==WRAP){ORIG=window.studioPlanTpl;window.studioPlanTpl=WRAP;}}
function groups(ops){
 const g=[],by=new Map();
 ops.forEach(o=>{
  if(o.kind==='stage'){const x={id:o.key,title:o.title,tasks:[]};g.push(x);by.set(o.key,x);}
  else if(by.has(o.parent))by.get(o.parent).tasks.push({id:o.key,title:o.title,dur:nDays(o.start,o.end)});
 });
 return g;
}
function treeHtml(G,a,b,c){
 return G.map(s=>'<div class="npstage"><label class="check"><input type="checkbox" data-'+a+'="'+s.id+'" checked><b>'+esc(s.title)+'</b></label><div class="nptasks">'+s.tasks.map(t=>'<label class="check"><input type="checkbox" data-'+b+'="'+t.id+'" data-'+c+'="'+s.id+'" checked>'+esc(t.title)+' <small>'+t.dur+' дн.</small></label>').join('')+'</div></div>').join('');
}
const secOf=t=>((state.sections||{})[t.id]==='build')?'build':'design';
const isMgr=pid=>{try{return typeof manage==='function'&&!!manage(pid);}catch(e){return false;}};
function sectionEnd(pid,sec){let m='';state.tasks.forEach(t=>{if(t.projectId===pid&&secOf(t)===sec&&t.end>m)m=t.end;});return m;}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function srv(action,payload){
 const r=await transport({action:action,payload:payload||{},token:token});
 if(!r||!r.ok){const m=String(r&&r.error||'Сервер не ответил');if(m.indexOf('AUTH:')===0)signoutLocal();throw Error(m);}
 return r.data;
}
const st=document.createElement('style');
st.textContent='.tplbar{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0}.tplbar .tplsub{display:flex;flex-wrap:wrap;gap:8px;width:100%}.tplf .seg{display:flex;gap:6px;margin:4px 0 10px}.tplf .seg button,#tp_types .seg button{flex:1;border-radius:999px;padding:6px 8px;font-size:14px}.tplf .seg button.on{background:var(--accent);color:#fff;border-color:var(--accent)}.tplf .npstage{margin:0 0 8px}.tplf .nptasks{margin-left:22px}.tplf .nptasks small{opacity:.7}.tplf ul{margin:4px 0 8px 18px;padding:0}#tp_types{margin:0 0 10px}.tpllegend{display:flex;flex-wrap:wrap;gap:6px 14px;margin:0 0 10px;font-size:13px}.tpllegend i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:6px;vertical-align:-1px}.gantt .bar.tplc:not(.done):not(.pause){background:var(--tplc)!important}';
document.head.appendChild(st);

function openAdd(type){
 const pid=projectId,T=TYPES[type];
 if(type==='lnd'){
  showForm('<div class="tplf"><h2>'+esc(T[0])+'</h2><p class="notice">Этот шаблон пока не проработан. Данные будут добавлены позже.</p></div>',async()=>{throw Error('Шаблон «'+T[0]+'» пока не проработан.');});
  return;
 }
 amode='tpl';
 const G=groups(planFor(type,null,today())),hasTasks=!!sectionEnd(pid,'design');
 const nt=G.reduce((a,s)=>a+s.tasks.length,0);
 showForm('<div class="tplf" data-tptype="'+type+'"><h2>'+esc(T[0])+'</h2><label>Дата старта<input id="tp_start" type="date" value="'+today()+'" required></label>'+(hasTasks?'<label>Размещение<select id="tp_place"><option value="after">После предыдущих задач раздела</option><option value="par">Параллельно, с указанной даты</option></select></label>':'')+'<small>Состав</small><div class="seg"><button type="button" data-tmode="tpl">Готовый шаблон</button><button type="button" data-tmode="pick">Выбрать части</button><button type="button" data-tmode="empty">Пустой</button></div><div id="tp_tpl" class="notice"><b>Шаблон «'+esc(T[0])+'»</b><ul>'+G.map(g=>'<li>'+esc(g.title)+' — задач: '+g.tasks.length+'</li>').join('')+'</ul>Всего этапов: '+G.length+', задач: '+nt+'. К каждому этапу добавлено пояснение с чек-листом.</div><div id="tp_pick" class="hidden">'+treeHtml(G,'ts','tp','tsp')+'</div><p id="tp_sum" class="notice"></p></div>',async()=>{
  const s=startVal();let ops;
  if(amode==='empty')ops=[{key:'e',parent:'',title:T[0],note:'Пустой шаблон: добавьте этапы и задачи вручную.',kind:'stage',start:s,end:s,deps:[],lag:0}];
  else{
   const sel=amode==='pick'?picked():null;
   if(amode==='pick'&&!sel.size)throw Error('Выберите хотя бы один этап или задачу');
   ops=planFor(type,sel,s);
  }
  if(!ops.length)throw Error('Нечего создавать');
  await runOps(pid,ops,type);
 });
 refreshAdd();
}
const picked=()=>new Set([...document.querySelectorAll('#tp_pick [data-tp]:checked')].map(i=>i.dataset.tp));
function startVal(){
 const inp=$('tp_start'),pl=$('tp_place');
 let s=(inp&&inp.value)||today();
 if(pl&&pl.value==='after'){const e=sectionEnd(projectId,'design');if(e)s=plus(e,1);}
 return s;
}
function refreshAdd(){
 const box=document.querySelector('.tplf[data-tptype]');
 if(!box||!$('tp_sum'))return;
 const type=box.dataset.tptype,inp=$('tp_start'),pl=$('tp_place');
 document.querySelectorAll('[data-tmode]').forEach(b=>b.classList.toggle('on',b.dataset.tmode===amode));
 $('tp_pick').classList.toggle('hidden',amode!=='pick');
 $('tp_tpl').classList.toggle('hidden',amode!=='tpl');
 if(inp&&pl){
  const e=sectionEnd(projectId,'design');
  if(pl.value==='after'&&e){inp.value=plus(e,1);inp.disabled=true;}else inp.disabled=false;
 }
 if(amode==='empty'){$('tp_sum').textContent='Будет добавлен один пустой этап «'+TYPES[type][0]+'». Задачи добавите вручную.';return;}
 const ops=planFor(type,amode==='pick'?picked():null,startVal()),n=ops.filter(o=>o.kind==='task').length;
 $('tp_sum').textContent=n?'Задач: '+n+', этапов: '+ops.filter(o=>o.kind==='stage').length+'. Ориентировочно до '+fd(mx(ops.map(o=>o.end)))+'.':'Ничего не выбрано.';
}
async function runOps(pid,ops,type){
 const total=ops.length;
 $('editform').innerHTML='<div class="nbp"><div class="top" id="tp_top"></div><div class="bar"><i id="tp_bar"></i></div><small id="tp_msg">Не закрывайте страницу.</small><div class="footer"><button type="button" id="tp_done" data-action="close" class="primary hidden">Готово</button></div></div>';
 const dlg=$('dialog'),block=e=>e.preventDefault();
 dlg.addEventListener('cancel',block);
 let done=0;
 const ids=new Map(),stageIds=[];
 const upd=()=>{$('tp_top').textContent='Создано '+done+' из '+total;$('tp_bar').style.width=Math.round(done/total*100)+'%';};
 upd();
 try{
  for(const x of ops){
   for(let tries=0;;tries++){
    try{
     if(tries){
      const s=await srv('state',{}),used=new Set([...ids.values()]),t=s.tasks.find(q=>q.projectId===pid&&q.title===x.title&&!used.has(q.id));
      if(t){ids.set(x.key,t.id);if(x.kind==='stage')stageIds.push(t.id);break;}
     }
     const id=await srv('taskCreate',{projectId:pid,parentId:x.parent?ids.get(x.parent):'',title:x.title,note:x.note||'',start:x.start,end:x.end,assigneeId:'',deps:x.deps.map(k=>ids.get(k)).filter(Boolean),lag:x.lag||0,kind:x.kind,calendarEnabled:x.kind==='task'});
     ids.set(x.key,id);
     if(x.kind==='stage')stageIds.push(id);
     break;
    }catch(e){
     const m=String(e&&e.message||e);
     if(m.indexOf('AUTH:')===0)throw e;
     if(tries>=2){if(!confirm('Не удалось создать «'+x.title+'»: '+m+'\nПовторить?')){const q=Error('stop');q.stop=true;throw q;}}
     else await pause(1200*(tries+1));
    }
   }
   done++;upd();
  }
  if(stageIds.length){try{await srv('tplSet',{ids:stageIds,tag:type+Date.now().toString(36)});await loadTpls(true);}catch(e){}}
  $('tp_top').textContent='Готово: создано '+done+' из '+total;
  $('tp_bar').style.width='100%';
  $('tp_msg').textContent='';
 }catch(e){
  if(e&&e.stop){$('tp_top').textContent='Создание прервано. Создано '+done+' из '+total+'.';}
  else{$('tp_top').textContent='Создание прервано: '+(e&&e.message||e);}
  if(stageIds.length){try{await srv('tplSet',{ids:stageIds,tag:type+Date.now().toString(36)});}catch(x){}}
 }finally{
  dlg.removeEventListener('cancel',block);
  try{await reload();}catch(x){}
  try{render();}catch(x){}
  const d=$('tp_done');if(d)d.classList.remove('hidden');
 }
}

function setNewType(t){
 newType=t;
 document.querySelectorAll('[data-ntype]').forEach(b=>b.classList.toggle('on',b.dataset.ntype===t));
 if(!$('n_pick')||!$('n_tpl'))return;
 const G=groups(planFor(t,null,today()));
 $('n_pick').innerHTML=t==='lnd'?'':treeHtml(G,'nst','nt','st');
 $('n_tpl').innerHTML=t==='lnd'?'Шаблон «Благоустройство территории» пока не проработан. Объект будет создан без задач, этапы можно добавить позже.':'<b>Шаблон «'+esc(TYPES[t][0])+'»</b><ul>'+G.map(g=>'<li>'+esc(g.title)+' — задач: '+g.tasks.length+'</li>').join('')+'</ul>Этапы идут друг за другом, внутри этапа задачи связаны. К каждому этапу и задаче добавлено пояснение.';
 fixNew();
}
function fixNew(){
 if(!$('n_sum')||!$('n_pick'))return;
 const b=document.querySelector('[data-nmode].on'),mode=b?b.dataset.nmode:'tpl';
 if(mode==='empty')return;
 const all=[...document.querySelectorAll('#n_pick [data-nt]')];
 const sel=new Set((mode==='tpl'?all:all.filter(i=>i.checked)).map(i=>i.dataset.nt));
 const ops=planFor(newType,sel,($('n_start')&&$('n_start').value)||today()),n=ops.filter(o=>o.kind==='task').length;
 $('n_sum').textContent=n?'Задач: '+n+', этапов: '+ops.filter(o=>o.kind==='stage').length+'. Ориентировочно до '+fd(mx(ops.map(o=>o.end)))+'.':(newType==='lnd'?'Шаблон пока не проработан: объект будет создан пустым.':'Ничего не выбрано.');
}
function enhanceNew(){
 if(!$('n_name')||!$('n_pick')||$('tp_types'))return;
 ensureWrap();
 newType='int';
 const seg=document.querySelector('.nobj .seg');
 if(!seg)return;
 const box=document.createElement('div');
 box.id='tp_types';
 box.innerHTML='<small>Что за объект</small><div class="seg"><button type="button" data-ntype="int" class="on">Дизайн интерьера</button><button type="button" data-ntype="hse">Проектирование дома</button><button type="button" data-ntype="lnd">Ландшафт, благоустройство</button></div>';
 seg.parentNode.insertBefore(box,seg.previousElementSibling||seg);
 const tb=document.querySelector('[data-nmode=tpl]');
 if(tb)tb.textContent='Готовый шаблон';
}
function enhanceSmr(){
 const h=document.querySelector('.smrf h2');
 if(!h)return;
 if(h.textContent==='СМР Квартира')h.textContent='СМР Интерьер';
 const inp=$('smr_start');
 if(!inp)return;
 const e=sectionEnd(projectId,'build');
 if(e){
  inp.value=nextWork(plus(e,1));
  inp.insertAdjacentHTML('afterend','<small>Дата поставлена после последних работ стройки. Для параллельного ведения поставьте более раннюю дату.</small>');
 }
}
const oSF=showForm;
showForm=function(){
 const r=oSF.apply(this,arguments);
 try{enhanceNew();}catch(e){}
 try{enhanceSmr();}catch(e){}
 return r;
};

let loading=false,lastLoad=0,running=false;
window.__tm=window.__tm||{};
async function loadTpls(force){
 if(loading||!state||!state.me)return;
 if(!force&&Date.now()-lastLoad<20000)return;
 loading=true;
 try{
  const r=await srv('tplMap',{});
  window.__tm=(r&&r.map)||{};
  window.__tmLoaded=true;
  lastLoad=Date.now();
  try{paintColors();}catch(e){}
 }catch(e){lastLoad=Date.now();}
 finally{loading=false;}
}
let TT=null;
function titleSets(){
 if(TT)return TT;
 TT={int:new Set(),hse:new Set(HOUSE.map(s=>s.title)),smf:new Set(),smb:new Set()};
 const add=(k,f,a)=>{try{if(f)f.apply(null,a).filter(o=>o.kind==='stage').forEach(o=>TT[k].add(o.title));}catch(e){}};
 add('int',getOrig(),[IDS,'2030-01-01']);
 add('smf',window.studioPlanSMR,['2030-01-01',null]);
 add('smb',window.studioPlanSMRBuilding,['2030-01-01',null]);
 return TT;
}
const tried=new Set();
function busyUI(){
 const d=$('dialog'),t=$('nb_top')||$('tp_top');
 return !!(d&&d.open&&t&&!/^(Готово|Создание прервано)/.test(t.textContent||''));
}
async function autoTag(){
 if(running||!state||!state.me||!state.tasks||state.me.role==='observer'||!window.__tmLoaded||busyUI())return;
 running=true;
 try{
  const map=window.__tm||{},TS=titleSets(),gr={};
  state.tasks.forEach(t=>{
   if(t.parentId||map[t.id]||String(t.id).indexOf('tmp-')===0)return;
   for(const ty of Object.keys(TS)){
    if(TS[ty].has(t.title)&&secOf(t)===TYPES[ty][1]){const k=t.projectId+'|'+ty;(gr[k]=gr[k]||[]).push(t.id);break;}
   }
  });
  let any=false;
  for(const k of Object.keys(gr)){
   const p=k.split('|'),ids=gr[k],sig=k+':'+ids.length;
   if(tried.has(sig)||!isMgr(p[0]))continue;
   tried.add(sig);
   try{await srv('tplSet',{ids:ids.slice(0,60),tag:p[1]+Date.now().toString(36)});any=true;}catch(e){}
  }
  if(any)await loadTpls(true);
 }finally{running=false;}
}
function curSec(){const b=document.querySelector('#content .sectabs button.on');return b?b.dataset.sec:'design';}
function paintColors(){
 const c=$('content');
 if(!c||!state||view!=='projects'||!projectId)return;
 const map=window.__tm||{},by=new Map(state.tasks.map(t=>[t.id,t])),sec=curSec();
 const tagOf=t=>{let x=t,n=0;while(x&&n++<10){if(map[x.id])return map[x.id];x=x.parentId?by.get(x.parentId):null;}return '';};
 const first={};
 state.tasks.forEach(t=>{
  if(t.projectId!==projectId||t.parentId)return;
  const g=map[t.id];
  if(g&&TYPES[g.slice(0,3)]&&TYPES[g.slice(0,3)][1]===sec&&(!(g in first)||t.start<first[g]))first[g]=t.start;
 });
 const order=Object.keys(first).sort((a,b)=>first[a]<first[b]?-1:first[a]>first[b]?1:a<b?-1:1),col={};
 if(order.length>=2)order.forEach((g,i)=>{col[g]=PAL[i%PAL.length];});
 c.querySelectorAll('.tpllegend').forEach(x=>x.remove());
 const tb=c.querySelector('.sectabs');
 if(order.length>=2&&tb)tb.insertAdjacentHTML('afterend','<div class="tpllegend">'+order.map(g=>'<span><i style="background:'+col[g]+'"></i>'+esc(TYPES[g.slice(0,3)][0])+'</span>').join('')+'</div>');
 c.querySelectorAll('.bar[data-id]').forEach(b=>{
  const t=by.get(b.dataset.id),g=t?tagOf(t):'',row=b.closest('.grow'),lb=row&&row.querySelector('.glabel');
  if(g&&col[g]){b.style.setProperty('--tplc',col[g]);b.classList.add('tplc');if(lb)lb.style.boxShadow='inset 4px 0 0 '+col[g];}
  else{b.classList.remove('tplc');b.style.removeProperty('--tplc');if(lb)lb.style.boxShadow='';}
 });
}
function decorate(){
 const c=$('content');
 if(!c||!state||view!=='projects'||!projectId||!c.querySelector('.sectabs'))return;
 c.querySelectorAll('.buildtpl').forEach(x=>x.remove());
 const sec=curSec();
 let bar=c.querySelector('.tplbar');
 if(bar&&bar.dataset.sec!==sec){bar.remove();bar=null;}
 if(!bar&&isMgr(projectId)&&(sec==='design'||sec==='build')){
  bar=document.createElement('div');
  bar.className='tplbar';
  bar.dataset.sec=sec;
  bar.innerHTML=sec==='design'
   ?'<button type="button" class="primary" data-tpltoggle="1">Выбрать шаблон</button><div class="tplsub hidden" id="tpl_sub"><button type="button" data-tpladd="int">Дизайн интерьера</button><button type="button" data-tpladd="hse">Проектирование дома</button><button type="button" data-tpladd="lnd">Благоустройство территории</button></div>'
   :'<button type="button" class="primary" data-smrk="flat">СМР Интерьер</button><button type="button" class="primary" data-smrk="bld">СМР Здание</button>';
  c.appendChild(bar);
 }
 if(sec==='supply'&&bar){bar.remove();}
 paintColors();
}
const oR=render;
render=function(){
 const r=oR.apply(this,arguments);
 setTimeout(()=>{try{decorate();}catch(e){}},0);
 return r;
};
if(typeof applyState==='function'){
 const oAS=applyState;
 applyState=function(){
  const r=oAS.apply(this,arguments);
  setTimeout(()=>{loadTpls(false).then(()=>autoTag()).catch(()=>{});},400);
  return r;
 };
}
document.addEventListener('click',e=>{
 const t=e.target;
 if(!t||!t.closest)return;
 if(t.closest('[data-tpltoggle]')){const sub=$('tpl_sub');if(sub)sub.classList.toggle('hidden');return;}
 const ad=t.closest('[data-tpladd]');
 if(ad){openAdd(ad.dataset.tpladd);return;}
 const m=t.closest('[data-tmode]');
 if(m){amode=m.dataset.tmode;refreshAdd();return;}
 const nt=t.closest('[data-ntype]');
 if(nt){setNewType(nt.dataset.ntype);return;}
 if(t.closest('[data-nmode]'))setTimeout(fixNew,0);
 if(t.closest('[data-action=close]'))setTimeout(()=>{autoTag().catch(()=>{});},1500);
});
document.addEventListener('change',e=>{
 const el=e.target,d=(el&&el.dataset)||{};
 if(d.ts){document.querySelectorAll('#tp_pick [data-tsp="'+d.ts+'"]').forEach(i=>{i.checked=el.checked;});refreshAdd();}
 else if(d.tp){const s=document.querySelector('#tp_pick [data-ts="'+d.tsp+'"]');if(s)s.checked=!!document.querySelector('#tp_pick [data-tsp="'+d.tsp+'"]:checked');refreshAdd();}
 else if(el&&(el.id==='tp_start'||el.id==='tp_place'))refreshAdd();
 else if(d.nst||d.nt||(el&&el.id==='n_start'))setTimeout(fixNew,0);
});
if(state)render();
})();
