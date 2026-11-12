'use strict';
(function(){
const T6=[
{id:'s1',title:'1. Подготовка и договор',tasks:[
{id:'1.1',title:'1.1 Сбор исходных данных (БТИ, техпаспорт, ограничения: несущие стены, мокрые зоны, вентиляция)',dur:2,after:[]},
{id:'1.2',title:'1.2 Обсуждение задач и пожеланий заказчика',dur:1,after:['1.1']},
{id:'1.3',title:'1.3 Организационные моменты (утверждение сроков, стоимости, порядка правок, рисков и допущений)',dur:1,after:['1.2']},
{id:'1.4',title:'1.4 Согласование договора и предоплаты',dur:2,after:['1.3']}]},
{id:'s2',title:'2. Замеры',tasks:[
{id:'2.1',title:'2.1 Выезд на замеры и фотофиксация объекта (коммуникации, стояки, выводы, окна, двери, вентиляция)',dur:1,after:['1.4']},
{id:'2.2',title:'2.2 Перенос замеров в программу',dur:2,after:['2.1']}]},
{id:'s3',title:'3. Планировочное решение',tasks:[
{id:'3.1',title:'3.1 Разработка планировок (1-2 варианта)',dur:14,after:['2.2']},
{id:'3.2',title:'3.2 Обсуждение планировочного решения',dur:1,after:['3.1']},
{id:'3.3',title:'3.3 Внесение правок',dur:14,after:['3.2']},
{id:'3.4',title:'3.4 Утверждение планировки (письменное согласование)',dur:1,after:['3.3']}]},
{id:'s4',title:'4. Исполнение работ / Проектирование',tasks:[
{id:'4.1',title:'4.1 Разработка дизайн-проекта',dur:14,after:['3.4']},
{id:'4.2',title:'4.2 Подбор материалов и мебели',dur:7,after:[],free:true},
{id:'4.3',title:'4.3 Визуализация',dur:14,after:['4.1']},
{id:'4.4',title:'4.4 Разработка технических чертежей',dur:14,after:['4.3']},
{id:'4.5',title:'4.5 Согласование технических чертежей с заказчиком',dur:3,after:['4.4']},
{id:'4.6',title:'4.6 Составление ведомости отделочных материалов (спецификация)',dur:5,after:['4.5']}]},
{id:'s5',title:'5. Завершение',tasks:[
{id:'5.1',title:'5.1 Финальная сдача проекта (передача альбома)',dur:1,after:['4.6']},
{id:'5.2',title:'5.2 Подписание договора (акта) о сдаче проекта',dur:1,after:['5.1']}]},
{id:'s6',title:'6. Авторский надзор',free:true,tasks:[
{id:'6.1',title:'6.1 Авторский надзор',dur:30,after:[],free:true}]}
];
const ALL=[].concat(...T6.map(s=>s.tasks.map(t=>t.id)));
const off=d=>{if(window.studioCal&&window.studioCal.kind)return !!window.studioCal.kind(d);const w=new Date(d+'T00:00:00Z').getUTCDay();return w===0||w===6;};
const nextWork=d=>{for(let i=0;i<60&&off(d);i++)d=plus(d,1);return d;};
const fd=d=>d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4);
function plan(sel,start0){
 const start=nextWork(start0);
 const M=new Map(),ops=[],ss=new Map();
 let prev='',chainEnd='',last='';
 T6.forEach(st=>{
  const ts=st.tasks.filter(t=>sel.has(t.id));
  if(!ts.length)return;
  const rows=[];
  ts.filter(t=>!t.free&&!st.free).forEach(def=>{
   let deps=def.after.filter(a=>M.has(a));
   if(!deps.length&&def.after.length&&last)deps=[last];
   const s=deps.length?nextWork(plus(deps.map(k=>M.get(k).end).reduce((a,b)=>b>a?b:a),1)):start;
   const r={key:def.id,parent:st.id,title:def.title,kind:'task',start:s,end:plus(s,def.dur-1),deps:deps};
   M.set(def.id,r);rows.push(r);last=def.id;chainEnd=r.end;
  });
  const mainStart=rows.length?rows.map(r=>r.start).reduce((a,b)=>b<a?b:a):'';
  ts.filter(t=>t.free||st.free).forEach(def=>{
   const s=st.free?(ss.get('s4')||start):(mainStart||(chainEnd?nextWork(plus(chainEnd,1)):start));
   const r={key:def.id,parent:st.id,title:def.title,kind:'task',start:s,end:plus(s,def.dur-1),deps:[]};
   M.set(def.id,r);rows.push(r);
  });
  const s0=rows.map(r=>r.start).reduce((a,b)=>b<a?b:a),e0=rows.map(r=>r.end).reduce((a,b)=>b>a?b:a);
  ss.set(st.id,s0);
  ops.push({key:st.id,parent:'',title:st.title,kind:'stage',start:s0,end:e0,deps:(!st.free&&prev)?[prev]:[]});
  if(!st.free)prev=st.id;
  rows.forEach(r=>ops.push(r));
 });
 return ops;
}
window.studioPlanTpl=plan;
if(typeof document==='undefined'||typeof projectForm==='undefined')return;
const st=document.createElement('style');
st.textContent='.nobj .seg{display:flex;gap:6px;margin:4px 0 10px}.nobj .seg button{flex:1;border-radius:999px;padding:6px 8px;font-size:14px}.nobj .seg button.on{background:var(--accent);color:#fff;border-color:var(--accent)}.nobj .npstage{margin:0 0 8px}.nobj .nptasks{margin-left:22px}.nobj .nptasks small{opacity:.7}.nobj ul{margin:4px 0 8px 18px;padding:0}#content .nodel{margin-left:8px}';
document.head.appendChild(st);
let mode='tpl';
const picked=()=>mode==='tpl'?new Set(ALL):mode==='empty'?new Set():new Set([...document.querySelectorAll('#n_pick [data-nt]:checked')].map(i=>i.dataset.nt));
function refresh(){
 if(!$('n_sum'))return;
 document.querySelectorAll('[data-nmode]').forEach(b=>b.classList.toggle('on',b.dataset.nmode===mode));
 $('n_pick').classList.toggle('hidden',mode!=='pick');
 $('n_tpl').classList.toggle('hidden',mode!=='tpl');
 const s=$('n_start').value||today(),ops=plan(picked(),s),n=ops.filter(o=>o.kind==='task').length;
 $('n_sum').textContent=mode==='empty'?'Объект будет создан без задач. Этапы и задачи можно добавить позже.':n?'Задач: '+n+', этапов: '+ops.filter(o=>o.kind==='stage').length+'. Ориентировочно до '+fd(ops.map(o=>o.end).reduce((a,b)=>b>a?b:a))+'.':'Ничего не выбрано.';
}
function newForm(){
 mode='tpl';
 const staff=state.users.filter(u=>u.approved==='true'&&u.role!=='observer'),emps=state.users.filter(u=>u.role==='employee'&&u.approved==='true'),obs=state.users.filter(u=>u.role==='observer'&&u.approved==='true');
 const tree=T6.map(s=>'<div class="npstage"><label class="check"><input type="checkbox" data-nst="'+s.id+'" checked><b>'+esc(s.title)+'</b></label><div class="nptasks">'+s.tasks.map(t=>'<label class="check"><input type="checkbox" data-nt="'+t.id+'" data-st="'+s.id+'" checked>'+esc(t.title)+' <small>'+t.dur+' дн.</small></label>').join('')+'</div></div>').join('');
 const desc='<b>Дизайн-проект интерьера</b><ul>'+T6.map(s=>'<li>'+esc(s.title)+' — задач: '+s.tasks.length+'</li>').join('')+'</ul>Этапы идут друг за другом, внутри этапа задачи связаны цепочкой. «Подбор материалов» идёт параллельно с разработкой, «Авторский надзор» независимый (бирюзовый).';
 showForm('<div class="nobj"><h2>Новый объект</h2>'+input('Название объекта','n_name','','text','required maxlength="160"')+input('Дата старта','n_start',today(),'date','required')+'<small>Состав объекта</small><div class="seg"><button type="button" data-nmode="tpl">Готовый шаблон</button><button type="button" data-nmode="pick">Выбрать части</button><button type="button" data-nmode="empty">Пустой объект</button></div><div id="n_tpl" class="notice">'+desc+'</div><div id="n_pick" class="hidden">'+tree+'</div><p id="n_sum" class="notice"></p><label>Исполнитель всех задач<select id="n_assignee"><option value="">Назначить позже</option>'+opts(staff,'')+'</select></label><label class="check"><input type="checkbox" id="n_cal" checked>События задач в календаре</label><label>Команда объекта (ведут задачи)<select multiple id="n_members">'+opts(emps,[])+'</select></label><label>Наблюдатели объекта<select multiple id="n_viewers">'+opts(obs,[])+'</select></label></div>',async()=>{
  const name=$('n_name').value.trim(),start=$('n_start').value,sel=picked(),ops=plan(sel,start);
  if(!name)throw Error('Введите название объекта');
  if(mode==='pick'&&!ops.length)throw Error('Выберите хотя бы один этап или задачу');
  const assignee=$('n_assignee').value,cal=$('n_cal').checked;
  let id;
  try{id=await call('projectCreate',{name:name,viewers:selected('n_viewers'),members:selected('n_members'),start:start,templateId:'',assigneeId:assignee});}
  catch(e){if(/Шаблон не найден/.test(e.message||''))throw Error('Сервер ещё не обновлён: в Code.gs замените if(!rs.length)throw Error(\'Шаблон не найден\'); на if(p.templateId&&!rs.length)throw Error(\'Шаблон не найден\');');throw e;}
  projectId=id;view='projects';$('dialog').close();await reload();
  const ids=new Map();let n=0;
  for(const o of ops){
   ids.set(o.key,await call('taskCreate',{projectId:id,parentId:o.parent?ids.get(o.parent):'',title:o.title,start:o.start,end:o.end,assigneeId:assignee,deps:o.deps.map(k=>ids.get(k)).filter(Boolean),lag:0,kind:o.kind,calendarEnabled:o.kind==='task'&&cal}));
   toast('Создаём план: '+(++n)+' из '+ops.length);
  }
  if(ops.length)toast('Объект создан: задач '+ops.filter(o=>o.kind==='task').length+'. Идёт сохранение…');
 });
 refresh();
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-nmode]');if(b){mode=b.dataset.nmode;refresh();}});
document.addEventListener('change',e=>{
 const el=e.target,d=el.dataset||{};
 if(d.nst){document.querySelectorAll('#n_pick [data-st="'+d.nst+'"]').forEach(i=>{i.checked=el.checked;});refresh();}
 else if(d.nt){const s=document.querySelector('#n_pick [data-nst="'+d.st+'"]');if(s)s.checked=!!document.querySelector('#n_pick [data-st="'+d.st+'"]:checked');refresh();}
 else if(el.id==='n_start')refresh();
});
const oPF=projectForm;
projectForm=function(p){if(p||!admin())return oPF.apply(this,arguments);newForm();};
function dels(){
 if(!state||!admin()||view!=='projects')return;
 const c=$('content');if(!c)return;
 const mk=id=>{const b=document.createElement('button');b.type='button';b.className='danger nodel';b.dataset.action='projectDelete';b.dataset.id=id;b.textContent='Удалить объект';return b;};
 if(projectId){const tb=c.querySelector('.toolbar');if(tb&&!tb.querySelector('.nodel'))tb.appendChild(mk(projectId));}
 else c.querySelectorAll('.grid article.panel').forEach(a=>{const o=a.querySelector('[data-action=openProject]');if(o&&!a.querySelector('.nodel'))o.after(mk(o.dataset.id));});
}
const oR=render;
render=function(){const r=oR.apply(this,arguments);try{dels();}catch(e){}return r;};
if(state)render();
})();
