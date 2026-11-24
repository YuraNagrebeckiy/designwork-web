'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined'||typeof state==='undefined')return;
const VER='2026-11-24';
const NEWS=[
 {v:'2026-11-20',t:'Комплектация',items:['Основная смета и докупки показаны в одной таблице, докупки правятся прямо в строке.','Под каждым этапом есть подитог, внизу общий итог по всем этапам.','PDF сгруппирован по этапам: у каждой позиции и докупки даты оплаты и доставки и суммы.']},
 {v:'2026-11-23',t:'Мои задачи и графики',items:['Незавершённая задача сама переходит на ближайший рабочий день и остаётся в списке «Не выполнено» в дне, пока вы не отметите выполнение.','На неделе и в месяце отмечены выходные и праздники по производственному календарю.','Руководитель может продлить срок задачи, потянув правый край полосы на неделе и в месяце.','Ширину колонки названий в графиках можно менять ползунком на её границе.','В графике объекта есть кнопка «Сегодня» и режим «Год» со связями; этапы и задачи в нём можно двигать мышью.']},
 {v:'2026-11-24',t:'Обучение',items:['Появилась подсказка «Как пользоваться»: меню ⚙ → «Как пользоваться». Раздел «Что нового» там же.']}
];
const role=()=>(state.me&&state.me.role)||'employee';
function steps(){
 const r=role(),s=[];
 s.push({t:'Добро пожаловать',h:'Приложение ведёт задачи, графики и комплектацию объектов студии. Вверху разделы: '+(r==='observer'?'«Объекты»':r==='admin'?'«Мои задачи», «Объекты» и «Аналитика»':'«Мои задачи» и «Объекты»')+'. Эту подсказку можно открыть снова: меню ⚙ → «Как пользоваться».',sel:'#nav'});
 if(r!=='observer'){
  s.push({t:'Мои задачи',h:'Режимы «День», «Неделя», «Месяц». В «Дне» задачи стоят по времени: нажмите на свободное место, чтобы добавить, блоки можно перетаскивать. Задача выполнена, когда вы ставите флажок. Цвет карточки показывает срок: зелёный — запас, жёлтый — 1–2 дня, красный — последний день, огонь — просрочено.'});
  s.push({t:'Не выполнено не пропадает',h:'Если вчера задача не отмечена выполненной, она сама переходит на ближайший рабочий день и остаётся в списке «Не выполнено» в дне, пока вы не нажмёте «Выполнено». Выходные и праздники отмечены на графиках недели и месяца.'});
 }
 s.push({t:'Объекты и графики',h:'Откройте объект: вкладки «Проектирование», «Стройка», «Комплектация». В графике потяните полоску на границе колонки названий, чтобы прочитать длинные названия или освободить место (двойной щелчок сворачивает). Кнопка «Сегодня» сдвигает график к сегодняшнему дню, «Год» показывает этапы и задачи на год со связями.'});
 if(r!=='observer')s.push({t:'Сроки правятся мышью',h:'В графике потяните полосу, чтобы сдвинуть задачу, или её край, чтобы изменить срок; клик открывает карточку. Руководитель в «Мои задачи» на неделе и в месяце продлевает срок ручкой на правом крае полосы, у себя и у сотрудников.'});
 if(r!=='observer')s.push({t:'Комплектация',h:'«+ Позиция» — выберите из списка по этапам или впишите своё. В позиции добавьте компании в тендер, выберите прошедшую отбор, ведите оплату и доставку; докупки добавляются строками таблицы. Под этапом подитог, внизу общий итог. «Сохранить в PDF» выгружает всё с датами и суммами.'});
 if(r==='observer')s.push({t:'Вы наблюдатель',h:'Вы видите задачи, графики и комплектацию объектов, к которым есть доступ. Редактирование недоступно.'});
 s.push({t:'Всё готово',h:'Подсказка всегда в меню ⚙ → «Как пользоваться». При крупных обновлениях здесь же появится окно «Что нового».'});
 return s;
}
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;};
const key=()=>'dwGuide:'+state.me.id;
const rd=()=>{try{return JSON.parse(LS(key())||'{}')||{};}catch(e){return {};}};
const done=()=>{try{LS(key(),JSON.stringify({tour:true,seen:VER}));}catch(e){}};
const st=document.createElement('style');
st.textContent='#gd{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483200;width:min(480px,calc(100vw - 24px));background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:16px;box-shadow:0 14px 44px rgba(0,0,0,.34);padding:16px 18px}#gd h3{margin:2px 0 6px;font-size:17px}#gd p{margin:6px 0;font-size:14px;line-height:1.5}#gd ul{margin:6px 0 6px 18px;padding:0;font-size:14px;line-height:1.5}#gd .gd-top{display:flex;justify-content:space-between;align-items:center;color:var(--muted);font-size:12px}#gd .gd-x{min-height:30px;padding:0 10px;border:0;background:transparent;font-size:20px}#gd .gd-dots{display:flex;gap:5px;margin:8px 0}#gd .gd-dots i{width:7px;height:7px;border-radius:50%;background:var(--line)}#gd .gd-dots i.on{background:var(--accent)}#gd .gd-btns{display:flex;gap:8px;align-items:center;margin-top:8px}#gd .gd-btns .sp{flex:1}#gd .gd-btns button{min-height:36px}#gd h4{margin:10px 0 2px;font-size:13px;color:var(--muted)}.gd-hl{outline:3px solid var(--accent);outline-offset:3px;border-radius:10px}';
document.head.appendChild(st);
let i=0,list=[],on=null;
function close(mark){
 const g=document.getElementById('gd');if(g)g.remove();
 document.querySelectorAll('.gd-hl').forEach(x=>x.classList.remove('gd-hl'));
 if(mark)done();
 on=null;
}
function paint(){
 const s=list[i];
 document.querySelectorAll('.gd-hl').forEach(x=>x.classList.remove('gd-hl'));
 if(s.sel){const el=document.querySelector(s.sel);if(el){el.classList.add('gd-hl');try{el.scrollIntoView({block:'nearest'});}catch(e){}}}
 let g=document.getElementById('gd');
 if(!g){g=document.createElement('div');g.id='gd';g.setAttribute('role','dialog');document.body.appendChild(g);}
 g.innerHTML='<div class="gd-top"><span>Шаг '+(i+1)+' из '+list.length+'</span><button type="button" class="gd-x" data-gd="skip" aria-label="Закрыть">×</button></div><h3>'+esc(s.t)+'</h3><p>'+esc(s.h)+'</p><div class="gd-dots">'+list.map((x,k)=>'<i class="'+(k===i?'on':'')+'"></i>').join('')+'</div><div class="gd-btns"><button type="button" data-gd="skip">Пропустить</button><span class="sp"></span>'+(i>0?'<button type="button" data-gd="back">Назад</button>':'')+'<button type="button" class="primary" data-gd="'+(i===list.length-1?'end':'next')+'">'+(i===list.length-1?'Готово':'Далее')+'</button></div>';
}
function openTour(){
 close(false);
 list=steps();i=0;on='tour';paint();
}
function openNews(items){
 close(false);
 on='news';
 const g=document.createElement('div');
 g.id='gd';g.setAttribute('role','dialog');
 g.innerHTML='<div class="gd-top"><span>Что нового</span><button type="button" class="gd-x" data-gd="end" aria-label="Закрыть">×</button></div>'+items.slice().reverse().map(n=>'<h4>'+esc(n.v.slice(8)+'.'+n.v.slice(5,7)+'.'+n.v.slice(0,4))+' · '+esc(n.t)+'</h4><ul>'+n.items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>').join('')+'<div class="gd-btns"><button type="button" data-gd="tour">Показать обучение</button><span class="sp"></span><button type="button" class="primary" data-gd="end">Понятно</button></div>';
 document.body.appendChild(g);
}
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('[data-gd]');
 if(b){
  const a=b.dataset.gd;
  if(a==='next'){i=Math.min(list.length-1,i+1);paint();}
  else if(a==='back'){i=Math.max(0,i-1);paint();}
  else if(a==='skip'||a==='end')close(true);
  else if(a==='tour')openTour();
  return;
 }
 const h=e.target.closest&&e.target.closest('#gd_help,#gd_new');
 if(h){
  const m=document.getElementById('menu');if(m)m.classList.add('hidden');
  if(h.id==='gd_help')openTour();else openNews(NEWS);
 }
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('gd'))close(true);});
function menu(){
 const m=document.getElementById('menu');
 if(!m||document.getElementById('gd_help'))return;
 const lo=document.getElementById('logout');
 const mk=(id,t)=>{const x=document.createElement('button');x.type='button';x.id=id;x.textContent=t;return x;};
 const a=mk('gd_help','Как пользоваться'),b=mk('gd_new','Что нового');
 if(lo){m.insertBefore(a,lo);m.insertBefore(b,lo);}else{m.appendChild(a);m.appendChild(b);}
}
let shown=false;
function auto(){
 if(shown||!state||!state.me||document.getElementById('gd'))return;
 const dlg=document.getElementById('dialog');
 if(dlg&&dlg.open)return;
 const rec=rd();
 if(!rec.tour){shown=true;openTour();return;}
 if((rec.seen||'')<VER){
  shown=true;
  const items=NEWS.filter(n=>n.v>(rec.seen||''));
  if(items.length)openNews(items);else done();
 }
}
const oR=render;
render=function(){
 const r=oR.apply(this,arguments);
 try{menu();}catch(e){}
 setTimeout(()=>{try{auto();}catch(e){}},900);
 return r;
};
})();
