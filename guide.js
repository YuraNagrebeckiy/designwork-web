'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined'||typeof state==='undefined')return;
const VER='2026-11-24';
const NEWS=[
 {v:'2026-11-20',t:'Комплектация',items:['Основная смета и докупки показаны в одной таблице, докупки правятся прямо в строке.','Под каждым этапом есть подитог, внизу общий итог по всем этапам.','PDF сгруппирован по этапам: у каждой позиции и докупки даты оплаты и доставки и суммы.']},
 {v:'2026-11-23',t:'Мои задачи и графики',items:['Незавершённая задача сама переходит на ближайший рабочий день и остаётся в списке «Не выполнено» в дне, пока вы не отметите выполнение.','На неделе и в месяце отмечены выходные и праздники по производственному календарю.','Руководитель может продлить срок задачи, потянув правый край полосы на неделе и в месяце.','Ширину колонки названий в графиках можно менять ползунком на её границе.','В графике объекта есть кнопка «Сегодня» и режим «Год» со связями; этапы и задачи в нём можно двигать мышью.']},
 {v:'2026-11-24',t:'Обучение',items:['Появилась подсказка «Как пользоваться»: меню ⚙ → «Как пользоваться». Раздел «Что нового» там же.','Подсказка выделяет на экране то, о чём идёт речь.']}
];
const role=()=>(state.me&&state.me.role)||'employee';
const btn=t=>[].find.call(document.querySelectorAll('button'),b=>b.textContent.trim()===t&&b.offsetParent!==null)||null;
function group(list){
 const bs=list.map(btn).filter(Boolean);
 if(!bs.length)return null;
 if(bs.length===1)return bs[0];
 let p=bs[0].parentElement;
 while(p&&!bs.every(b=>p.contains(b)))p=p.parentElement;
 return p&&p!==document.body?p:bs[0];
}
function textBlock(s){
 const all=document.querySelectorAll('#content *');
 for(let k=0;k<all.length;k++){
  const el=all[k];
  if(el.children.length===0&&el.textContent.trim().indexOf(s)===0&&el.offsetParent!==null){
   return el;
  }
 }
 return null;
}
function steps(){
 const r=role(),s=[],obs=r==='observer';
 s.push({t:'Добро пожаловать',lead:'Приложение студии: задачи, графики и комплектация объектов.',pts:['Вверху разделы: '+(obs?'**Объекты**':r==='admin'?'**Мои задачи**, **Объекты**, **Аналитика**':'**Мои задачи**, **Объекты**'),'Эту подсказку можно открыть снова: меню **⚙ → Как пользоваться**'],at:()=>document.getElementById('nav')});
 if(!obs){
  s.push({t:'Режимы просмотра',lead:'Меняйте масштаб своих задач.',pts:['**День** — задачи по времени; нажмите на свободное место, чтобы добавить','**Неделя** и **Месяц** — обзор; выходные и праздники отмечены'].concat(r==='admin'?['Над списком выберите **сотрудника**, чтобы смотреть его задачи']:[]),at:()=>group(['День','Неделя','Месяц'])});
  s.push({t:'Добавление задач',lead:'Три способа поставить задачу.',pts:['**+ Задача** — по объекту и этапу','**+ Личная задача** — видна только вам','**+ Блок из библиотеки** — готовый набор задач'],at:()=>group(['+ Задача','+ Личная задача','+ Блок из библиотеки'])});
  s.push({t:'Не выполнено не пропадает',lead:'Закрывайте задачу кнопкой «Выполнено».',pts:['Незакрытая задача **сама переходит** на ближайший рабочий день','Она остаётся в этом списке, пока вы не нажмёте **Выполнено**','Цвет срока: зелёный — запас, жёлтый — 1–2 дня, красный — последний день, огонь — просрочено'],at:()=>textBlock('Не выполнено')});
 }
 s.push({t:'Объекты и графики',lead:'Здесь все объекты студии.',pts:['Вкладки: **Проектирование**, **Стройка**, **Комплектация**','**Сегодня** — к сегодняшнему дню, **Год** — этапы и задачи на год со связями','Границу колонки названий можно **потянуть**; двойной щелчок сворачивает её'],at:()=>btn('Объекты')});
 if(!obs)s.push({t:'Сроки правятся мышью',lead:'Работает в графике объекта.',pts:['**Потяните полосу** — сдвинуть задачу или этап','**Потяните край** — изменить срок','**Клик** — открыть карточку'].concat(r==='admin'?['В «Мои задачи» на неделе и в месяце срок продлевается ручкой на **правом краю** полосы']:[]),at:null});
 if(!obs)s.push({t:'Комплектация',lead:'Закупки по этапам и сроки поставки.',pts:['**+ Позиция** — из списка по этапам или своя','В позиции: компании в **тендер**, выбор победителя, оплата и доставка','Докупки — строками таблицы; под этапом **подитог**, внизу общий','**Сохранить в PDF** — с датами и суммами'],at:null});
 if(obs)s.push({t:'Вы наблюдатель',lead:'Просмотр без редактирования.',pts:['Вы видите задачи, графики и комплектацию доступных объектов'],at:null});
 s.push({t:'Всё готово',lead:'Подсказка всегда под рукой.',pts:['Откройте **⚙ → Как пользоваться**, чтобы пройти обучение снова','Там же **Что нового**: о крупных обновлениях мы сообщим сами'],at:()=>document.getElementById('menubtn')});
 return s;
}
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;};
const key=()=>'dwGuide:'+state.me.id;
const rd=()=>{try{return JSON.parse(LS(key())||'{}')||{};}catch(e){return {};}};
const done=()=>{try{LS(key(),JSON.stringify({tour:true,seen:VER}));}catch(e){}};
const fmt=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
const st=document.createElement('style');
st.textContent='#gdbk{position:fixed;inset:0;z-index:2147483180;background:transparent}#gdsp{position:fixed;z-index:2147483190;border-radius:14px;pointer-events:none;box-shadow:0 0 0 9999px rgba(10,6,8,.62);outline:3px solid #ff5a64;outline-offset:2px;transition:top .38s cubic-bezier(.4,0,.2,1),left .38s cubic-bezier(.4,0,.2,1),width .38s cubic-bezier(.4,0,.2,1),height .38s cubic-bezier(.4,0,.2,1),outline-color .3s}#gdsp.none{outline-color:transparent}#gd{position:fixed;z-index:2147483200;width:min(440px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;background:var(--gdbg,#fff);color:var(--gdfg,#231f20);border-radius:18px;box-shadow:0 18px 56px rgba(0,0,0,.45);padding:18px 20px 16px;font-size:16px;line-height:1.5;transition:top .38s cubic-bezier(.4,0,.2,1),left .38s cubic-bezier(.4,0,.2,1)}#gd .gd-in{animation:gdIn .34s ease both}@keyframes gdIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}#gd .gd-top{display:flex;justify-content:space-between;align-items:center;font-size:13px;opacity:.7}#gd .gd-bar{height:4px;border-radius:2px;background:rgba(127,127,127,.25);margin:8px 0 12px;overflow:hidden}#gd .gd-bar i{display:block;height:100%;background:#b5202c;border-radius:2px;transition:width .38s ease}#gd h3{margin:0 0 4px;font-size:20px;line-height:1.25}#gd .gd-lead{margin:0 0 8px;font-size:16px;opacity:.85}#gd ul{margin:0;padding:0;list-style:none}#gd li{position:relative;padding:6px 0 6px 20px;font-size:16px;line-height:1.45}#gd li:before{content:"";position:absolute;left:3px;top:14px;width:8px;height:8px;border-radius:50%;background:#b5202c}#gd b{font-weight:700;color:var(--gdhl,#a3121f)}#gd h4{margin:12px 0 2px;font-size:14px;opacity:.7}#gd .gd-btns{display:flex;gap:8px;align-items:center;margin-top:12px}#gd .gd-btns .sp{flex:1}#gd .gd-btns button{min-height:46px;padding:0 18px;font-size:16px;border-radius:12px;border:1px solid rgba(127,127,127,.35);background:transparent;color:inherit;cursor:pointer}#gd .gd-btns button.primary{background:#9c1420;border-color:#9c1420;color:#fff;font-weight:600}#gd .gd-x{min-height:36px;width:36px;padding:0;border:0;background:transparent;color:inherit;font-size:24px;cursor:pointer}@media (prefers-reduced-motion:reduce){#gd,#gdsp,#gd .gd-in,#gd .gd-bar i{transition:none!important;animation:none!important}}';
document.head.appendChild(st);
let i=0,list=[],cur=null,raf=0;
function theme(g){
 const c=getComputedStyle(document.body).color.match(/\d+/g)||[30,30,30];
 const lum=(0.299*c[0]+0.587*c[1]+0.114*c[2]);
 const dark=lum>140;
 g.style.setProperty('--gdbg',dark?'#2a2224':'#ffffff');
 g.style.setProperty('--gdfg',dark?'#f6efee':'#231f20');
 g.style.setProperty('--gdhl',dark?'#ff8a92':'#a3121f');
}
function ensure(){
 let bk=document.getElementById('gdbk');
 if(!bk){bk=document.createElement('div');bk.id='gdbk';document.body.appendChild(bk);}
 let sp=document.getElementById('gdsp');
 if(!sp){sp=document.createElement('div');sp.id='gdsp';sp.className='none';sp.style.cssText='top:50%;left:50%;width:0;height:0';document.body.appendChild(sp);}
 let g=document.getElementById('gd');
 if(!g){g=document.createElement('div');g.id='gd';g.setAttribute('role','dialog');g.setAttribute('aria-modal','true');g.style.cssText='top:50%;left:50%;opacity:0';document.body.appendChild(g);}
 theme(g);
 return {sp:sp,g:g};
}
function place(){
 const sp=document.getElementById('gdsp'),g=document.getElementById('gd');
 if(!sp||!g)return;
 const vw=innerWidth,vh=innerHeight,w=g.offsetWidth,h=g.offsetHeight;
 let top,left;
 if(cur&&cur.isConnected){
  const r=cur.getBoundingClientRect(),pad=6;
  sp.className='';
  sp.style.top=(r.top-pad)+'px';sp.style.left=(r.left-pad)+'px';sp.style.width=(r.width+pad*2)+'px';sp.style.height=(r.height+pad*2)+'px';
  const below=vh-r.bottom-pad-14,above=r.top-pad-14;
  if(below>=h)top=r.bottom+pad+14;
  else if(above>=h)top=r.top-pad-14-h;
  else top=vh-h-12;
  left=r.left+r.width/2-w/2;
 }else{
  sp.className='none';
  sp.style.top=(vh/2)+'px';sp.style.left=(vw/2)+'px';sp.style.width='0px';sp.style.height='0px';
  top=(vh-h)/2;left=(vw-w)/2;
 }
 g.style.top=Math.max(12,Math.min(top,vh-h-12))+'px';
 g.style.left=Math.max(12,Math.min(left,vw-w-12))+'px';
 g.style.opacity='1';
}
function again(){cancelAnimationFrame(raf);raf=requestAnimationFrame(place);}
addEventListener('resize',again);
addEventListener('scroll',()=>{const sp=document.getElementById('gdsp');if(sp&&cur){sp.style.transition='none';}again();},true);
function inView(el){const r=el.getBoundingClientRect();return r.top>=70&&r.bottom<=innerHeight-20;}
function clearUi(){
 ['gdbk','gdsp','gd'].forEach(id=>{const x=document.getElementById(id);if(x)x.remove();});
 cur=null;
}
function close(mark){clearUi();if(mark)done();}
function paint(){
 const s=list[i],o=ensure();
 let el=null;
 try{el=s.at?s.at():null;}catch(e){}
 cur=el&&el.offsetParent!==null?el:null;
 o.sp.style.transition='';
 if(cur&&!inView(cur)){try{cur.scrollIntoView({block:'center',behavior:'smooth'});}catch(e){}}
 o.g.innerHTML='<div class="gd-in"><div class="gd-top"><span>Шаг '+(i+1)+' из '+list.length+'</span><button type="button" class="gd-x" data-gd="skip" aria-label="Закрыть">×</button></div><div class="gd-bar"><i style="width:'+Math.round((i+1)/list.length*100)+'%"></i></div><h3>'+esc(s.t)+'</h3><p class="gd-lead">'+fmt(s.lead)+'</p><ul>'+s.pts.map(x=>'<li>'+fmt(x)+'</li>').join('')+'</ul><div class="gd-btns">'+(i===0?'<button type="button" data-gd="skip">Пропустить</button>':'<button type="button" data-gd="back">Назад</button>')+'<span class="sp"></span><button type="button" class="primary" data-gd="'+(i===list.length-1?'end':'next')+'">'+(i===list.length-1?'Готово':'Далее')+'</button></div></div>';
 place();
 setTimeout(place,380);
}
function openTour(){
 clearUi();
 list=steps();i=0;
 paint();
}
function openNews(items){
 clearUi();
 const o=ensure();
 cur=null;
 o.g.innerHTML='<div class="gd-in"><div class="gd-top"><span>Что нового</span><button type="button" class="gd-x" data-gd="end" aria-label="Закрыть">×</button></div>'+items.slice().reverse().map(n=>'<h4>'+esc(n.v.slice(8)+'.'+n.v.slice(5,7)+'.'+n.v.slice(0,4))+' · '+esc(n.t)+'</h4><ul>'+n.items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>').join('')+'<div class="gd-btns"><button type="button" data-gd="tour">Показать обучение</button><span class="sp"></span><button type="button" class="primary" data-gd="end">Понятно</button></div></div>';
 place();
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
document.addEventListener('keydown',e=>{
 if(!document.getElementById('gd'))return;
 if(e.key==='Escape')close(true);
 else if(e.key==='ArrowRight'&&list.length&&i<list.length-1){i++;paint();}
 else if(e.key==='ArrowLeft'&&list.length&&i>0){i--;paint();}
});
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
 if(document.getElementById('gd')){again();}
 else setTimeout(()=>{try{auto();}catch(e){}},900);
 return r;
};
})();
