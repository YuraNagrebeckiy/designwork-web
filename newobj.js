'use strict';
(function(){
const T6=[{"id": "s1", "title": "1. Подготовка и договор", "note": "Подготовка: собрать данные по объекту, понять задачи клиента и закрепить договорённости. Пока договор и предоплата не согласованы, к замерам не переходим.", "tasks": [{"id": "1.1", "title": "1.1 Сбор исходных данных (БТИ, техпаспорт, ограничения: несущие стены, мокрые зоны, вентиляция)", "dur": 2, "after": [], "note": "Запросить у клиента планы БТИ и техпаспорт. Уточнить, где несущие стены, мокрые зоны, шахты и ограничения по вентиляции: от этого зависит, что можно перепланировать."}, {"id": "1.2", "title": "1.2 Обсуждение задач и пожеланий заказчика", "dur": 1, "after": ["1.1"], "note": "Обсудить, для кого проект, как живёт семья, какой нужен стиль и бюджет. Попросить референсы и заполненную анкету. Записать пожелания в чат объекта."}, {"id": "1.3", "title": "1.3 Организационные моменты (утверждение сроков, стоимости, порядка правок, рисков и допущений)", "dur": 1, "after": ["1.2"], "note": "Согласовать сроки, стоимость, порядок и число кругов правок, риски и допущения. Зафиксировать письменно, чтобы потом не спорить."}, {"id": "1.4", "title": "1.4 Согласование договора и предоплаты", "dur": 2, "after": ["1.3"], "note": "Отправить договор на изучение, внести правки, получить подпись и предоплату. После этого можно назначать выезд на замеры."}]}, {"id": "s2", "title": "2. Замеры", "note": "Замеры. Если сдвинуть этот этап, все следующие чертежи сдвинутся вместе с ним.", "tasks": [{"id": "2.1", "title": "2.1 Выезд на замеры и фотофиксация объекта (коммуникации, стояки, выводы, окна, двери, вентиляция)", "dur": 1, "after": ["1.4"], "note": "Выезд на объект: обмерить помещения, сфотографировать коммуникации, стояки, выводы, окна, двери и вентиляцию. Отметить кривизну стен и высоты."}, {"id": "2.2", "title": "2.2 Перенос замеров в программу", "dur": 2, "after": ["2.1"], "note": "Перенести замеры в программу и сверить с БТИ. Расхождения записать в описание, показать клиенту до планировки."}]}, {"id": "s3", "title": "3. Планировочное решение", "note": "Планировочное решение. Главная веха проекта: пока планировка не утверждена письменно, дальше не двигаемся.", "tasks": [{"id": "3.1", "title": "3.1 Разработка планировок (1-2 варианта)", "dur": 14, "after": ["2.2"], "note": "Подготовить 1–2 варианта планировки. Показать, как работают зоны, проходы и мокрые зоны, и какие стены и проёмы затрагиваются."}, {"id": "3.2", "title": "3.2 Обсуждение планировочного решения", "dur": 1, "after": ["3.1"], "note": "Клиент смотрит варианты и выбирает основу. Обсудить созвоном, собрать список правок одним сообщением."}, {"id": "3.3", "title": "3.3 Внесение правок (1-й круг)", "dur": 14, "after": ["3.2"], "note": "Внести правки по списку клиента. Следить, сколько кругов правок включено в договор."}, {"id": "3.4", "title": "3.4 Обсуждение правок (2-й круг)", "dur": 1, "after": ["3.3"], "note": "Клиент смотрит обновлённую планировку. Обсудить созвоном, собрать список оставшихся правок одним сообщением."}, {"id": "3.5", "title": "3.5 Внесение правок (2-й круг)", "dur": 7, "after": ["3.4"], "note": "Внести оставшиеся правки. Если нужны дополнительные круги, обсудить условия с клиентом."}, {"id": "3.6", "title": "3.6 Утверждение планировки (письменное согласование)", "dur": 1, "after": ["3.5"], "note": "Письменное согласование планировки. После подписи стены и проёмы двигать нельзя, а мебель и сантехнику можно уточнять на следующих этапах. Без этой задачи этап 4 не двигается."}]}, {"id": "s4", "title": "4. Исполнение работ / Проектирование", "note": "Исполнение работ и проектирование: от концепции до чертежей и ведомости. Подбор материалов идёт параллельно с разработкой.", "tasks": [{"id": "4.1", "title": "4.1 Разработка дизайн-проекта", "dur": 14, "after": ["3.6"], "note": "Разработать дизайн-проект: общее настроение интерьера, формы, цвета, материалы. Определиться со светом, сантехникой и напольными покрытиями по помещениям."}, {"id": "4.2", "title": "4.2 Подбор материалов и мебели", "dur": 7, "after": [], "note": "Идёт параллельно с 4.1 и 4.3. Вести таблицу комплектации: позиции, поставщики, цены. Заранее обсудить с клиентом порядок цен.", "free": true}, {"id": "4.3", "title": "4.3 Визуализация", "dur": 14, "after": ["4.1"], "note": "Визуализации показывают концепцию в объёме. Розетки и выключатели на них нужны только для стиля и цвета, их реальное расположение определяют чертежи."}, {"id": "4.4", "title": "4.4 Разработка технических чертежей", "dur": 14, "after": ["4.3"], "note": "Технические чертежи: расстановка мебели, розетки, свет и сценарии освещения, привязки. Проверить достаточность розеток и удобство выключателей."}, {"id": "4.5", "title": "4.5 Согласование технических чертежей с заказчиком", "dur": 3, "after": ["4.4"], "note": "Клиент проверяет чертежи и присылает правки. Собрать замечания одним списком. После утверждения подписать акт этапа."}, {"id": "4.6", "title": "4.6 Составление ведомости отделочных материалов (спецификация)", "dur": 5, "after": ["4.5"], "note": "Составить ведомость отделочных материалов и спецификацию. Сверить с таблицей комплектации и чертежами."}]}, {"id": "s5", "title": "5. Завершение", "note": "Завершение: сдача проекта клиенту и закрытие договора.", "tasks": [{"id": "5.1", "title": "5.1 Финальная сдача проекта (передача альбома)", "dur": 1, "after": ["4.6"], "note": "Подготовить и передать альбом проекта. Проверить комплектность чертежей и файлов, отправить клиенту."}, {"id": "5.2", "title": "5.2 Подписание договора (акта) о сдаче проекта", "dur": 1, "after": ["5.1"], "note": "Подписать акт о сдаче проекта. Проверить, что все оплаты закрыты. Решить, нужен ли авторский надзор."}]}, {"id": "s6", "title": "6. Авторский надзор", "note": "Авторский надзор не зависит от остальных этапов и при сдвигах чертежей не двигается. Он привязан к фактическому ходу строительных работ.", "free": true, "tasks": [{"id": "6.1", "title": "6.1 Авторский надзор", "dur": 30, "after": [], "note": "Выезды на объект и контроль соответствия проекту. Срок задайте вручную под график стройки; по умолчанию стоит 30 дней.", "free": true}]}];
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
   const r={key:def.id,parent:st.id,title:def.title,note:def.note,kind:'task',start:s,end:plus(s,def.dur-1),deps:deps};
   M.set(def.id,r);rows.push(r);last=def.id;chainEnd=r.end;
  });
  const mainStart=rows.length?rows.map(r=>r.start).reduce((a,b)=>b<a?b:a):'';
  ts.filter(t=>t.free||st.free).forEach(def=>{
   const s=st.free?(ss.get('s4')||start):(mainStart||(chainEnd?nextWork(plus(chainEnd,1)):start));
   const r={key:def.id,parent:st.id,title:def.title,note:def.note,kind:'task',start:s,end:plus(s,def.dur-1),deps:[]};
   M.set(def.id,r);rows.push(r);
  });
  const s0=rows.map(r=>r.start).reduce((a,b)=>b<a?b:a),e0=rows.map(r=>r.end).reduce((a,b)=>b>a?b:a);
  ss.set(st.id,s0);
  ops.push({key:st.id,parent:'',title:st.title,note:st.note,kind:'stage',start:s0,end:e0,deps:(!st.free&&prev)?[prev]:[]});
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
 const desc='<b>Дизайн-проект интерьера</b><ul>'+T6.map(s=>'<li>'+esc(s.title)+' — задач: '+s.tasks.length+'</li>').join('')+'</ul>Этапы идут друг за другом, внутри этапа задачи связаны цепочкой. К каждому этапу и задаче сразу добавлено пояснение. «Подбор материалов» идёт параллельно с разработкой, «Авторский надзор» независимый (бирюзовый).';
 showForm('<div class="nobj"><h2>Новый объект</h2>'+input('Название объекта','n_name','','text','required maxlength="160"')+input('Дата старта','n_start',today(),'date','required')+'<small>Состав объекта</small><div class="seg"><button type="button" data-nmode="tpl">Готовый шаблон</button><button type="button" data-nmode="pick">Выбрать части</button><button type="button" data-nmode="empty">Пустой объект</button></div><div id="n_tpl" class="notice">'+desc+'</div><div id="n_pick" class="hidden">'+tree+'</div><p id="n_sum" class="notice"></p><label>Исполнитель всех задач<select id="n_assignee"><option value="">Назначить позже</option>'+opts(staff,'')+'</select></label><label class="check"><input type="checkbox" id="n_cal" checked>События задач в календаре</label><label>Команда объекта (ведут задачи)<select multiple id="n_members">'+opts(emps,[])+'</select></label><label>Наблюдатели объекта<select multiple id="n_viewers">'+opts(obs,[])+'</select></label></div>',()=>Promise.reject(Error('Модуль создания не загружен. Обновите страницу.')));
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
