'use strict';
(function(){
if(typeof showForm==='undefined'||typeof document==='undefined')return;
const S_FLAT=[
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
const PAUSE='Технологическая пауза: срок фиксированный, при сдвигах графика не сокращать. ';
const S_BLD=[
{id:'b1',title:'1. Нулевой цикл и фундамент',deps:[],tasks:[
{id:'1.1',title:'1.1 Подготовительные, земляные работы и прокладка закладных под коммуникации',dur:5,deps:[]},
{id:'1.2',title:'1.2 Устройство песчано-щебёночной подушки и подбетонки',dur:3,deps:['1.1']},
{id:'1.3',title:'1.3 Монтаж опалубки и вязка арматурного каркаса',dur:6,deps:['1.2']},
{id:'1.4',title:'1.4 [Авторский надзор] Приёмка осей и армирования (блокирующая веха)',dur:1,deps:['1.3'],note:'Чек-лист для ГАПа: проверка диагоналей и геодезической привязки к границам участка. Сверка высотной отметки чистового пола (±0.000). Проверка защитного слоя арматуры и расположения гильз под ввод воды и электричества. Без приёмки заливку не начинать.'},
{id:'1.5',title:'1.5 Бетонирование фундамента',dur:1,deps:['1.4']},
{id:'1.6',title:'1.6 Технологическая пауза (набор прочности бетона)',dur:14,deps:['1.5'],fixed:true,note:PAUSE+'Минимум 7–14 дней до снятия опалубки, до 28 дней до полной нагрузки. По умолчанию стоит 14 дней.'},
{id:'1.7',title:'1.7 Гидроизоляция и утепление цоколя',dur:5,deps:['1.6']}]},
{id:'b2',title:'2. Возведение коробки',deps:['b1'],tasks:[
{id:'2.1',title:'2.1 Кладка наружных и внутренних несущих стен (1-й этаж)',dur:20,deps:['1.7']},
{id:'2.2',title:'2.2 [Авторский надзор] Приёмка геометрии 1-го этажа (блокирующая веха)',dur:1,deps:['2.1'],note:'Чек-лист для ГАПа: проверка высот подоконных зон и габаритов дверных и оконных проёмов с учётом будущего пирога пола. Контроль вертикальности стен.'},
{id:'2.3',title:'2.3 Устройство перемычек и монолитного армопояса',dur:7,deps:['2.2']},
{id:'2.4',title:'2.4 Бетонирование армопояса и технологическая пауза',dur:8,deps:['2.3'],fixed:true,note:PAUSE+'1 день бетонирования и 7 дней набора прочности.'}]},
{id:'b3',title:'3. Межэтажные перекрытия',deps:['b2'],tasks:[
{id:'3.1',title:'3.1 Монтаж опалубки, вязка арматуры перекрытия (или укладка готовых плит)',dur:10,deps:['2.4']},
{id:'3.2',title:'3.2 [Авторский надзор] Приёмка армирования перекрытия',dur:1,deps:['3.1'],note:'Чек-лист для ГАПа: наличие отверстий (шахт) под инженерные коммуникации (вентиляция, фановые трубы, дымоходы). Усиление зон вокруг проёмов для лестниц.'},
{id:'3.3',title:'3.3 Бетонирование перекрытия и технологическая пауза',dur:15,deps:['3.2'],fixed:true,note:PAUSE+'1 день бетонирования и 14 дней набора прочности.'},
{id:'3.4',title:'3.4 Кладка стен 2-го этажа / мансарды (повторение цикла 2.1–2.4)',dur:20,deps:['3.3']}]},
{id:'b4',title:'4. Кровля',deps:['b3'],tasks:[
{id:'4.1',title:'4.1 Монтаж мауэрлата и стропильной системы',dur:10,deps:['3.4']},
{id:'4.2',title:'4.2 [Авторский надзор] Приёмка формы кровли (блокирующая веха)',dur:1,deps:['4.1'],note:'Чек-лист для ГАПа: визуальный контроль пропорций, углов уклона, выносов карнизных и фронтонных свесов. Проверка узлов опирания на мауэрлат и геометрии кукушек и мансардных окон.'},
{id:'4.3',title:'4.3 Монтаж гидро- и пароизоляции, утепление кровли',dur:7,deps:['4.2']},
{id:'4.4',title:'4.4 Укладка финишного кровельного покрытия и монтаж водосточной системы',dur:7,deps:['4.3']}]},
{id:'b5',title:'5. Тепловой контур и фасад',deps:[],tasks:[
{id:'5.1',title:'5.1 Монтаж оконных блоков и наружных дверей',dur:5,deps:['4.1']},
{id:'5.2',title:'5.2 [Авторский надзор] Контроль окон и фасадных выкрасов',dur:1,deps:[],align:'5.1',note:'Идёт параллельно с 5.1. Чек-лист для ГАПа: проверка глубины посадки оконных блоков в зоне утеплителя (исключение мостиков холода). Утверждение выкрасов фасада на объекте при естественном освещении (теневая и солнечная сторона). Контроль раскладки шпросов и цвета профиля.'},
{id:'5.3',title:'5.3 Утепление фасада',dur:10,deps:['5.1']},
{id:'5.4',title:'5.4 Нанесение базового армирующего слоя и декоративной штукатурки (или монтаж вентфасада / планкена)',dur:14,deps:['5.3']},
{id:'5.5',title:'5.5 [Авторский надзор] Финальная приёмка фасада',dur:1,deps:['5.4'],note:'Чек-лист для ГАПа: контроль стыков разных материалов фасада (дерево, камень, штукатурка), ровность примыканий к оконным отливам и карнизным свесам, скрытый монтаж водосточных труб (если применимо).'}]}
];
const TPL={
 flat:{name:'СМР Квартира',S:S_FLAT,extra:''},
 bld:{name:'СМР Здание',S:S_BLD,extra:' Технологические паузы бетона (1.6, 2.4, 3.3) помечены как фиксированные, в задачах «Авторский надзор» есть чек-листы.'}
};
const off=d=>{if(window.studioCal&&window.studioCal.kind)return !!window.studioCal.kind(d);const w=new Date(d+'T00:00:00Z').getUTCDay();return w===0||w===6;};
const nextWork=d=>{for(let i=0;i<60&&off(d);i++)d=plus(d,1);return d;};
const fd=d=>d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4);
function plan(start0,sel,tpl){
 const S=(tpl||TPL.flat).S;
 const start=nextWork(start0),M=new Map(),ops=[];
 S.forEach(st=>{
  const ts=st.tasks.filter(t=>!sel||sel.has(t.id));
  if(!ts.length)return;
  const rows=ts.map(t=>{
   const deps=t.deps.filter(k=>M.has(k));
   let s;
   if(t.align&&M.has(t.align))s=M.get(t.align).start;
   else if(deps.length){const e=deps.map(k=>M.get(k).end).reduce((a,b)=>b>a?b:a);s=nextWork(plus(e,1+(t.lag||0)));}
   else s=start;
   const r={key:t.id,parent:st.id,title:t.title,kind:'task',start:s,end:plus(s,t.dur-1),deps:deps,lag:deps.length?(t.lag||0):0,note:t.note||'',fixed:!!t.fixed};
   M.set(t.id,r);return r;
  });
  const s0=rows.map(r=>r.start).reduce((a,b)=>b<a?b:a),e0=rows.map(r=>r.end).reduce((a,b)=>b>a?b:a);
  ops.push({key:st.id,parent:'',title:st.title,kind:'stage',start:s0,end:e0,deps:st.deps.filter(k=>M.has(k)),lag:0,note:'',fixed:false});
  M.set(st.id,ops[ops.length-1]);
  rows.forEach(r=>ops.push(r));
 });
 return ops;
}
window.studioPlanSMR=(a,b)=>plan(a,b,TPL.flat);
window.studioPlanSMRBuilding=(a,b)=>plan(a,b,TPL.bld);
if(typeof document.createElement!=='function')return;
const css=document.createElement('style');
css.textContent='.smrf .seg{display:flex;gap:6px;margin:4px 0 10px}.smrf .seg button{flex:1;border-radius:999px;padding:6px 8px;font-size:14px}.smrf .seg button.on{background:var(--accent);color:#fff;border-color:var(--accent)}.smrf .npstage{margin:0 0 8px}.smrf .nptasks{margin-left:22px}.smrf .nptasks small{opacity:.7}.smrf ul{margin:4px 0 8px 18px;padding:0}';
document.head.appendChild(css);
let busy=false,mode='tpl',cur=TPL.flat;
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
     if(t){
      if(x.kind==='stage')await srv('sectionSet',{id:t.id,section:'build'});
      ids.set(x.key,t.id);return;
     }
    }
    const pl={projectId:pid,parentId:x.parent?ids.get(x.parent):'',section:'build',title:x.title,start:x.start,end:x.end,assigneeId:'',deps:x.deps.map(k=>ids.get(k)).filter(Boolean),lag:x.lag||0,kind:x.kind,calendarEnabled:false};
    if(x.note)pl.note=x.note;
    if(x.fixed)pl.isFixedDuration=true;
    const id=await srv('taskCreate',pl);
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
const picked=()=>mode==='tpl'?null:mode==='empty'?new Set():new Set([...document.querySelectorAll('#smr_pick [data-sgt]:checked')].map(i=>i.dataset.sgt));
function refresh(){
 if(!$('smr_sum'))return;
 document.querySelectorAll('[data-smode]').forEach(b=>b.classList.toggle('on',b.dataset.smode===mode));
 $('smr_pick').classList.toggle('hidden',mode!=='pick');
 $('smr_tpl').classList.toggle('hidden',mode!=='tpl');
 if(mode==='empty'){$('smr_sum').textContent='Стройка останется без задач. Этапы и задачи можно добавить позже.';return;}
 const ops=plan($('smr_start').value||today(),picked(),cur),n=ops.filter(o=>o.kind==='task').length;
 $('smr_sum').textContent=n?'Задач: '+n+', этапов: '+ops.filter(o=>o.kind==='stage').length+'. Ориентировочное окончание стройки: '+fd(ops.map(o=>o.end).reduce((a,b)=>b>a?b:a))+'.':'Ничего не выбрано.';
}
function openForm(kind){
 const pid=projectId;
 mode='tpl';cur=TPL[kind]||TPL.flat;
 const S=cur.S,nt=S.reduce((a,s)=>a+s.tasks.length,0);
 const tree=S.map(s=>'<div class="npstage"><label class="check"><input type="checkbox" data-sgs="'+s.id+'" checked><b>'+esc(s.title)+'</b></label><div class="nptasks">'+s.tasks.map(t=>'<label class="check"><input type="checkbox" data-sgt="'+t.id+'" data-sgp="'+s.id+'" checked>'+esc(t.title)+' <small>'+t.dur+' дн.</small></label>').join('')+'</div></div>').join('');
 showForm('<div class="smr smrf"><h2>'+esc(cur.name)+'</h2><label>Дата начала работ<input id="smr_start" type="date" value="'+today()+'" required></label><small>Состав стройки</small><div class="seg"><button type="button" data-smode="tpl">Готовый</button><button type="button" data-smode="pick">Выбрать части</button><button type="button" data-smode="empty">Пустой</button></div><p id="smr_tpl" class="notice">Будут добавлены этапов: '+S.length+', задач: '+nt+' в раздел «Стройка» с зависимостями и технологическими паузами. Сроки каждой задачи потом можно менять. Исполнители не назначаются.'+esc(cur.extra)+'</p><div id="smr_pick" class="hidden">'+tree+'</div><p id="smr_sum" class="notice"></p></div>',async()=>{
  if(mode==='empty')return;
  const s=$('smr_start').value;if(!s)throw Error('Укажите дату начала');
  const sel=picked();
  if(mode==='pick'&&!sel.size)throw Error('Выберите хотя бы один этап или задачу');
  await build(pid,plan(s,sel,cur));
 });
 refresh();
}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-smode]');if(b){mode=b.dataset.smode;refresh();}});
document.addEventListener('change',e=>{
 const el=e.target,d=(el&&el.dataset)||{};
 if(d.sgs){document.querySelectorAll('#smr_pick [data-sgp="'+d.sgs+'"]').forEach(i=>{i.checked=el.checked;});refresh();}
 else if(d.sgt){const s=document.querySelector('#smr_pick [data-sgs="'+d.sgp+'"]');if(s)s.checked=!!document.querySelector('#smr_pick [data-sgp="'+d.sgp+'"]:checked');refresh();}
 else if(el&&el.id==='smr_start')refresh();
});
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('[data-smrk]');
 if(!b)return;
 e.stopImmediatePropagation();e.preventDefault();
 if(typeof admin==='function'&&admin())openForm(b.dataset.smrk);
},true);
const oR=render;
render=function(){
 const r=oR.apply(this,arguments);
 try{document.querySelectorAll('[data-buildtpl]').forEach(b=>{
  b.textContent='СМР Квартира';b.dataset.smrk='flat';
  if(b.parentNode&&!b.parentNode.querySelector('[data-smrk="bld"]')){
   const x=document.createElement('button');x.type='button';x.className=b.className;x.dataset.smrk='bld';x.textContent='СМР Здание';b.after(x);
  }
 });}catch(e){}
 return r;
};
if(state)render();
})();
