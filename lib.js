'use strict';
(function(){
if(typeof document==='undefined'||typeof state==='undefined'||typeof showForm==='undefined')return;
const L=s=>s.split(';').map(x=>x.trim()).filter(Boolean);
const G=(t,time,items)=>({t:t,time:time,items:L(items||'')});
const KT=(t,items)=>({t:t,time:'4ч',items:L(items),kt:true});
const ROOMS=[
{id:'bath',name:'Проектирование ванной комнаты',res:'Разработанное помещение с планами, развёртками и техническими решениями.',g:[
G('А. Анализ и планировка','45-90м','изучить исходные размеры;проверить стояки и коммуникации;продумать расположение сантехники;проверить проходы и расстояния;продумать открывание дверей;проверить эргономику'),
G('Б. Творческая проработка и поиск решений','1-3ч','найти референсы;разработать цветовую концепцию;подобрать сочетания материалов;проработать атмосферу;рассмотреть альтернативные варианты'),
G('В. Сантехника','1-2ч','ванна или душевое решение;раковина;смесители;унитаз и инсталляция;душевая система;полотенцесушитель;габариты оборудования;привязки ХВС, ГВС и канализации'),
G('Г. Плитка и отделка','1-2ч','подбор плитки;формат;раскладка;начало укладки;проверка подрезок;затирка;отделка пола;отделка стен;площадь отделки'),
G('Д. Мебель и хранение','45-90м','тумба под раковину;зеркало и шкафчики;системы хранения;полки и ниши;открывание фасадов'),
G('Е. Свет и электрика','45-90м','основное освещение;подсветка зеркала;декоративная подсветка;розетки;выключатели;степень защиты оборудования'),
G('Ж. Чертежи','1-2ч','план сантехники;план электрики;план освещения;развёртки стен;раскладка плитки;привязки оборудования;ревизионные люки;узлы душевой и трапа;проверка размеров и высот')]},
{id:'kit',name:'Проектирование кухни',res:'Разработанная кухня с планами, развёртками и чертежами гарнитура.',g:[
G('А. Планировка','1-2ч','проверить размеры;разместить гарнитур;рабочий треугольник;проходы;открывание фасадов;обеденная зона'),
G('Б. Творческая проработка и поиск решений','1-3ч','референсы;стилистика;фасады и столешница;решение фартука;образ кухни'),
G('В. Кухонная мебель','1-2ч','конфигурация гарнитура;верхние и нижние шкафы;пеналы;доборные элементы;габариты секций;тип открывания;ручки и механизмы'),
G('Г. Бытовая техника','45-90м','холодильник;духовой шкаф;варочная поверхность;вытяжка;посудомоечная машина;микроволновая печь;мойка и смеситель;габариты и подключение'),
G('Д. Материалы','45-90м','фасады;столешница;фартук;стеновые панели;материалы пола;ручки и фурнитура'),
G('Е. Свет и электрика','45-90м','рабочее освещение;подсветка рабочей зоны;декоративное освещение;розетки;выводы под технику;сценарии освещения'),
G('Ж. Чертежи','1-2ч','план кухни;развёртки;габариты секций;привязки техники;чертежи гарнитура;площадь фартука;вырезы под мойку и варочную;ведомость материалов')]},
{id:'bed',name:'Проектирование спальни',res:'Спальня с мебелью, освещением, отделкой и чертежами.',g:[G('Анализ планировки','30-60м'),G('Творческая проработка и референсы','1-3ч'),G('Расстановка кровати и мебели','30-60м'),G('Прикроватные зоны','30-45м'),G('Гардероб','45-90м'),G('Подбор отделки','30-60м'),G('Освещение и сценарии','30-60м'),G('Электрика','30-45м'),G('Развёртки и чертежи','1-2ч')]},
{id:'liv',name:'Проектирование гостиной',res:'Гостиная с мебелью, ТВ-зоной, освещением и отделкой.',g:[G('Анализ помещения','30-45м'),G('Творческая проработка','1-3ч'),G('Расстановка мебели','45-60м'),G('ТВ-зона','30-60м'),G('Заказная мебель','45-90м'),G('Подбор материалов','30-60м'),G('Световые сценарии','45-60м'),G('Электрика и оборудование','30-45м'),G('Развёртки','1-2ч')]},
{id:'hal',name:'Проектирование прихожей',res:'Проработанная входная зона.',g:[G('Анализ планировки','20-30м'),G('Творческая проработка','30-90м'),G('Шкафы и системы хранения','30-60м'),G('Зеркала и декоративные элементы','20-30м'),G('Отделка стен и пола','30-45м'),G('Свет и электрика','30-45м'),G('Развёртки','30-60м')]},
{id:'war',name:'Проектирование гардеробной',res:'Готовая система хранения с чертежами.',g:[G('Планировка','30-45м'),G('Творческая проработка','45-90м'),G('Секции хранения','45-90м'),G('Ящики, полки и рейлы','30-60м'),G('Проверка глубин и габаритов','30м'),G('Освещение','30-45м'),G('Чертежи заказной мебели','45-90м')]},
{id:'kid',name:'Проектирование детской',res:'Функциональная детская с учётом возраста и потребностей ребёнка.',g:[G('Анализ планировки','30м'),G('Творческая проработка','1-3ч'),G('Зонирование','30-45м'),G('Расстановка мебели','30-60м'),G('Рабочая зона','30-45м'),G('Системы хранения','30-60м'),G('Освещение','30-45м'),G('Электрика','30м'),G('Отделка и чертежи','1-2ч')]},
{id:'bal',name:'Проектирование балкона',res:'Разработанное пространство балкона или лоджии.',g:[G('Анализ геометрии','20-30м'),G('Творческая проработка','30-90м'),G('Мебель и зонирование','30-45м'),G('Отделка','30-45м'),G('Освещение и электрика','30-45м'),G('Проверка конструктивных особенностей','30м')]},
{id:'lau',name:'Проектирование постирочной',res:'Технически проработанное помещение.',g:[G('Планировка','20-30м'),G('Творческая проработка','30-60м'),G('Стиральная и сушильная машины','30-45м'),G('Системы хранения','30-45м'),G('Коммуникации и подключения','30-45м'),G('Вентиляция','20-30м'),G('Электрика и освещение','30м'),G('Отделка и чертежи','30-45м')]},
{id:'off',name:'Проектирование кабинета',res:'Полноценная рабочая зона.',g:[G('Анализ планировки','30м'),G('Творческая проработка','1-2ч'),G('Рабочий стол и кресло','30-45м'),G('Системы хранения и библиотека','30-60м'),G('Освещение рабочего места','30-45м'),G('Электрика и слаботочные подключения','30м'),G('Отделка и развёртки','45-60м')]}
];
const VIZ=[{id:'viz',name:'Визуализация комнаты',res:'Завершённая задача «Визуализация комнаты»: финальные изображения переданы дизайнеру.',apr:true,g:[
G('Задача 01. Получение и анализ исходного DWG','30-60м','получить DWG от дизайнера;изучить планировку;проверить размеры и пропорции;проверить стены и перегородки;проверить проёмы;уточнить недостающие данные'),
G('Задача 02. Черновая 3D-модель','2-3ч','импортировать DWG в 3ds Max;выстроить линии по чертежу;поднять стены;создать перегородки;создать проёмы;сформировать основные элементы;проверить геометрию и размеры'),
G('Задача 03. Референсы и концепция','2-4ч','изучить дизайн-проект;найти референсы;определить стилистику;подобрать цветовую гамму;продумать атмосферу;рассмотреть альтернативы;сформировать Moodboard;подготовить концепцию. Жёсткого норматива нет'),
KT('Согласование 01. Концепции','передать референсы дизайнеру;получить комментарии;внести изменения;получить подтверждение'),
G('Задача 04. Поиск и подбор 3D-моделей','2-3ч','диван;кресла;стулья;кровать (если нужна);столы и корпусная мебель;светильники;декор;проверить качество моделей;проверить габариты и пропорции;подготовить модели к сцене'),
G('Задача 05. Расстановка мебели и декора','1-2ч','разместить основную мебель;проверить соответствие проекту;проверить проходы;разместить декор;проверить композицию'),
KT('Согласование 02. Мебели','передать подборку дизайнеру;получить замечания;заменить неподходящие модели;утвердить комплектацию'),
G('Задача 06. Освещение Corona','1-2ч','естественное освещение;солнечный свет;HDRI при необходимости;искусственные источники;декоративная подсветка;цветовая температура;световые тесты'),
G('Задача 07. Текстуры и материалы','1-2ч','материалы стен;материал пола;материалы мебели;дерево, камень, металл, стекло;текстуры тканей;отражения и шероховатость;масштаб текстур;UVW-развёртки;сопоставить с референсами'),
KT('Согласование 03. Материалов и освещения','подготовить предварительные изображения;передать дизайнеру;получить комментарии;внести корректировки;утвердить визуальное решение'),
G('Задача 08. Камеры и композиция','30-60м','определить ракурсы;разместить камеры;настроить фокусное расстояние;проверить перспективу;настроить композицию;проверить читаемость интерьера'),
G('Задача 09. Тестовые рендеры','30-60м','тестовые рендеры Corona;проверить освещение;проверить материалы;проверить геометрию;проверить камеры;выявить недочёты;подготовить изображения для согласования. Время расчёта учитывается отдельно'),
KT('Согласование 04. Предварительных рендеров','передать изображения дизайнеру;получить список замечаний;зафиксировать изменения;согласовать объём корректировок'),
G('Задача 10. Корректировки','1-2ч','проанализировать замечания;изменить геометрию при необходимости;скорректировать мебель;материалы;освещение;камеры;выполнить повторные тестовые рендеры;передать обновлённые изображения. Число циклов не ограничивать'),
G('Задача 11. Финальные рендеры Corona','1-2ч','проверить готовность сцены;настройки Corona;финальное разрешение;запустить рендер;проверить качество;проверить артефакты;постобработка. Время расчёта учитывается отдельно'),
G('Задача 12. Финальная проверка и сдача','30м','проверить все изображения;соответствие утверждённому проекту;названия и форматы файлов;сохранить итоговые изображения;передать дизайнеру;закрыть задачу после подтверждения')]}];
const C=(id,name,time,items)=>({id:id,name:name,chk:true,time:time,items:L(items)});
const CHK=[
C('c1','Проверка ванной комнаты','45-90м','размеры помещения;габариты сантехники;расположение ванны и душевой;привязки ХВС и ГВС;канализация;уклоны и душевой трап;ревизионные люки;коллекторные узлы;гидроизоляция;раскладка плитки;нет тонких подрезок;маркер начала укладки;площади экранов ванны и душевой;развёртки стен;розетки и выключатели;защита электрооборудования;освещение;высоты и размеры'),
C('c2','Проверка кухни','45-90м','планировка;габариты гарнитура;секции мебели;открывание фасадов;доборные элементы;бытовая техника;привязки техники;мойка и смеситель;выводы коммуникаций;площадь фартука;материалы столешницы и фасадов;вырезы под мойку и варочную;электрика;подсветка рабочей зоны;развёртки;чертежи гарнитура'),
C('c3','Проверка спальни','30-60м','размеры кровати;проходы;габариты мебели;открывание шкафов;прикроватные зоны;розетки;выключатели;сценарии освещения;высоты и привязки;развёртки'),
C('c4','Проверка гостиной','30-60м','расстановка мебели;проходы;ТВ-зона;габариты оборудования;системы хранения;заказные элементы;розетки и выводы;сценарии освещения;материалы;развёртки'),
C('c5','Проверка прихожей','20-40м','габариты шкафов;проходы;открывание фасадов;системы хранения;зеркала;розетки и выключатели;освещение;отделка;развёртки'),
C('c6','Проверка гардеробной','20-40м','глубины шкафов;размеры секций;ящики;полки и рейлы;открывание дверей;освещение;материалы;чертежи заказной мебели'),
C('c7','Проверка детской','30-60м','зонирование;размеры мебели;рабочая зона;системы хранения;проходы;розетки;выключатели;освещение;материалы;развёртки'),
C('c8','Проверка балкона','20-35м','размеры;примыкания;конструктивные особенности;расстановка мебели;отделка;электрика;освещение'),
C('c9','Проверка постирочной','20-40м','габариты техники;подключения;канализация и водоснабжение;открывание машин;системы хранения;вентиляция;электрика;отделка и развёртки'),
C('c10','Проверка кабинета','20-40м','габариты рабочего стола;расположение кресла;проходы;системы хранения;рабочее освещение;розетки и слаботочные подключения;развёртки')];
const GEN=[
C('g1','Проверка обмерного плана','30-60м','общие размеры;размеры помещений;толщины стен;дверные и оконные проёмы;высоты;привязки;сопоставить с исходными замерами'),
C('g2','Проверка демонтажа и монтажа','30-60м','демонтируемые конструкции;новые перегородки;толщины стен;новые проёмы;соответствие планировке;технические ограничения'),
C('g3','Проверка расстановки мебели','30-60м','габариты мебели;проходы;открывание дверей и фасадов;эргономика;соответствие планировке;привязки мебели'),
C('g4','Проверка сантехники','30-45м','расположение приборов;габариты;ХВС и ГВС;канализация;доступность обслуживания;привязки на планах и развёртках'),
C('g5','Проверка электрики','30-60м','розетки;выключатели;высоты установки;выводы под технику;назначение розеток;мастер-выключатели;электрощиты;слаботочные выводы;соответствие планов и развёрток'),
C('g6','Проверка освещения','30-60м','расположение светильников;трековые системы;бра и подвесные светильники;LED-подсветка;сценарии освещения;соответствие выключателей световым группам;высоты подвесов;привязки'),
C('g7','Проверка потолков','30-45м','высоты потолков;опуски;закарнизные ниши;карнизы;треки и световые линии;вентиляционные элементы;сечения потолков;отметки'),
C('g8','Проверка напольных покрытий','20-40м','типы покрытий;переходы между материалами;направление укладки;стыки;уровни полов;площади покрытий'),
C('g9','Проверка отделки стен','30-45м','материалы;площади отделки;декоративные элементы;молдинги и рейки;примыкания;соответствие референсам и концепции'),
C('g10','Проверка вентиляции и кондиционирования','30-45м','вентиляционные решётки;диффузоры;вентиляторы;трассы;привязки;высоты опусков;доступность обслуживания'),
C('g11','Проверка дверей и проёмов','20-30м','габариты проёмов;высоты и ширины полотен;направление открывания;расположение дверей;соответствие планов и ведомостей;конфликты с мебелью'),
C('g12','Проверка заказной мебели','30-60м','габариты изделий;состав секций;открывание фасадов;доборные панели;высота цоколя;материалы;цвета RAL или NCS;визуализации изделий;соответствие чертежей и визуализаций'),
C('g13','Проверка ведомостей','30-60м','ведомость дверей;ведомость мебели;ведомость сантехники;ведомость светильников;габариты;наименования;примечания;соответствие ведомостей чертежам'),
C('g14','Финальная проверка документации','45-90м','комплектность листов;нумерация;масштабы;условные обозначения;маркеры развёрток;размеры;примечания;ошибки и опечатки;согласованность всех чертежей;актуальность документации')];
const A=(id,name,items)=>({id:id,name:name,steps:L(items)});
const APR=[
A('a1','Согласование планировочного решения','передача вариантов заказчику;получение комментариев;формирование списка изменений;внесение первого круга правок;повторная отправка;финальное утверждение'),
A('a2','Согласование концепции и коллажей','передача коллажей;просмотр материалов;получение замечаний;корректировка цветовых решений;повторное согласование;утверждение концепции'),
A('a3','Согласование визуализаций','передача предварительных изображений;получение замечаний;корректировка мебели и отделки;корректировка освещения;повторная отправка;утверждение визуализаций'),
A('a4','Согласование чертежей','передача документации;просмотр чертежей;получение замечаний;внесение корректировок;повторная проверка;утверждение документации')];
const LIBS=[['room','Проектирование комнат',ROOMS],['viz','Визуализация комнаты',VIZ],['chk','Проверка помещений',CHK],['gen','Общие проверки',GEN],['apr','Согласования',APR]];
const SIZE=[['0.7','Маленькая'],['1','Средняя'],['1.5','Большая']];
const CX=[['0.8','Простая'],['1','Средняя'],['1.4','Сложная'],['1','Индивидуальная (срок поправлю сам)']];
const off=d=>{if(window.studioCal&&window.studioCal.kind)return !!window.studioCal.kind(d);const w=new Date(d+'T00:00:00Z').getUTCDay();return w===0||w===6;};
const nextWork=d=>{for(let i=0;i<60&&off(d);i++)d=plus(d,1);return d;};
const dayN=(s,k)=>{let d=nextWork(s);for(let i=0;i<k;i++)d=nextWork(plus(d,1));return d;};
function pt(s){const m=String(s).match(/^(\d+)(?:-(\d+))?(м|ч)$/);if(!m)return [0,0];const k=m[3]==='ч'?60:1;return [+m[1]*k,(m[2]?+m[2]:+m[1])*k];}
const r5=x=>Math.max(5,Math.round(x/5)*5);
function fm(a,b){
 const f=m=>m<90?m+' мин':(Math.round(m/30)/2)+' ч';
 return a===b?f(a):f(a)+' – '+f(b);
}
function scaled(time,mult){const p=pt(time);return [r5(p[0]*mult),r5(p[1]*mult)];}
function notes(g,mult,res){
 const t=scaled(g.time,mult),out=[];
 if(!g.kt)out.push('Плановое время: '+fm(t[0],t[1])+' (ориентир, можно менять).');
 g.items.forEach(i=>out.push('☐ '+i));
 if(res)out.push('Результат: '+res);
 return out.join('\n');
}
function buildOps(c){
 const b=c.blk,mult=c.mult,start=nextWork(c.start),ops=[];
 const label=c.room?' — '+c.room:'';
 const pref=c.target&&c.target.kind==='task'?b.name+' · ':'';
 const top=c.target&&c.target.kind==='task'?'@T':'';
 let end=start;
 const sub=(parent,title,g,s,e)=>ops.push({key:'s'+ops.length,parent:parent,title:title,note:notes(g,mult,''),kind:'sub',start:s,end:e});
 if(b.g){
  let cum=0,maxE=0;const rows=[];
  b.g.forEach(g=>{
   const h=g.kt?4:(scaled(g.time,mult).reduce((x,y)=>x+y,0)/2)/60;
   const si=Math.floor(cum/8+1e-9),ei=Math.max(si,Math.ceil((cum+h)/8-1e-9)-1);
   rows.push([g,si,ei]);cum+=h;maxE=Math.max(maxE,ei);
  });
  end=dayN(start,maxE);
  if(!pref)ops.push({key:'B',parent:top||'@T0',title:b.name+label,note:'Размер и сложность учтены в сроках. '+(b.res?'Результат: '+b.res:''),kind:'task',start:start,end:end});
  rows.forEach(r=>sub(pref?top:'B',pref+r[0].t+(pref&&c.room?' — '+c.room:''),r[0],dayN(start,r[1]),dayN(start,r[2])));
 }else if(b.chk){
  const t=scaled(b.time,mult),h=(t[0]+t[1])/2/60,e=dayN(start,Math.max(0,Math.ceil(h/8-1e-9)-1));
  end=e;
  const g={t:b.name,time:b.time,items:b.items};
  if(pref)sub(top,b.name+(c.room?' — '+c.room:''),g,start,e);
  else{
   ops.push({key:'B',parent:top||'@T0',title:b.name+label,note:notes(g,mult,''),kind:'task',start:start,end:e});
  }
 }else{
  end=dayN(start,b.steps.length-1);
  if(!pref)ops.push({key:'B',parent:top||'@T0',title:b.name+label,note:'Время ожидания ответа учитывается отдельно от трудозатрат.',kind:'task',start:start,end:end});
  b.steps.forEach((s,i)=>ops.push({key:'s'+ops.length,parent:pref?top:'B',title:pref+s,note:'',kind:'sub',start:dayN(start,i),end:dayN(start,i)}));
 }
 if(c.apr&&b.apr){
  [APR[1],APR[2]].forEach((a,j)=>{
   const s0=dayN(end,1+j*2),e0=dayN(s0,1);
   if(pref)ops.push({key:'p'+j,parent:top,title:a.name+(c.room?' — '+c.room:''),note:a.steps.map(x=>'☐ '+x).join('\n'),kind:'sub',start:s0,end:e0});
   else{
    ops.push({key:'P'+j,parent:top||'@T0',title:a.name+label,note:'Небольшой блок согласования к контрольным точкам. Время ожидания учитывается отдельно.',kind:'task',start:s0,end:e0});
    a.steps.forEach((x,i)=>ops.push({key:'q'+j+i,parent:'P'+j,title:x,note:'',kind:'sub',start:s0,end:e0}));
   }
  });
 }
 return ops;
}
window.studioLibOps=buildOps;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function srv(action,payload){
 const r=await transport({action:action,payload:payload||{},token:token});
 if(!r||!r.ok){const m=String(r&&r.error||'Сервер не ответил');if(m.indexOf('AUTH:')===0)signoutLocal();throw Error(m);}
 return r.data;
}
const st=document.createElement('style');
st.textContent='.libf .seg{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 8px}.libf .seg button{flex:1 1 120px;border-radius:999px;padding:6px 8px;font-size:13px}.libf .seg button.on{background:var(--accent);color:#fff;border-color:var(--accent)}.libf pre{white-space:pre-wrap;font:12px/1.4 system-ui;margin:4px 0;color:var(--muted);max-height:180px;overflow:auto}';
document.head.appendChild(st);
let lib='room';
const by=()=>new Map(state.tasks.map(t=>[t.id,t]));
function kindOf2(t,m){return window.kindOf?window.kindOf(t,m):(t.parentId?'task':'stage');}
function targets(){
 const m=by(),me=state.me.id,out=[];
 state.tasks.forEach(t=>{
  const k=kindOf2(t,m);
  if(k==='sub')return;
  if(t.assigneeId===me||(k==='stage'&&manage(t.projectId)))out.push({id:t.id,kind:k,label:projectName(t.projectId)+' · '+(k==='stage'?'этап: ':'задача: ')+t.title});
 });
 return out;
}
function curBlocks(){return LIBS.find(x=>x[0]===lib)[2];}
function open(pre){
 if(!state||state.me.role==='observer')return;
 const tg=targets();
 showForm('<div class="libf"><h2>Блок из библиотеки</h2><small>Каталог</small><div class="seg">'+LIBS.map(l=>'<button type="button" data-liblib="'+l[0]+'" class="'+(l[0]===lib?'on':'')+'">'+esc(l[1])+'</button>').join('')+'</div><label>Блок<select id="lb_block"></select></label><label>Название комнаты или пометка (необязательно)<input id="lb_room" maxlength="60" placeholder="например, Мастер-спальня"></label><div class="formgrid"><label>Размер комнаты<select id="lb_size">'+SIZE.map(s=>'<option value="'+s[0]+'"'+(s[0]==='1'?' selected':'')+'>'+s[1]+'</option>').join('')+'</select></label><label>Сложность<select id="lb_cx">'+CX.map((s,i)=>'<option value="'+s[0]+'"'+(i===1?' selected':'')+'>'+s[1]+'</option>').join('')+'</select></label></div><label>Куда добавить<select id="lb_target"><option value="">Самостоятельно (в моё «Личное»)</option>'+tg.map(t=>'<option value="'+esc(t.id)+'"'+(t.id===pre?' selected':'')+'>'+esc(t.label)+'</option>').join('')+'</select></label><label>Дата начала<input id="lb_start" type="date" value="'+today()+'" required></label><label class="check" id="lb_aprbox"><input type="checkbox" id="lb_apr" checked>Добавить небольшие блоки согласования</label><p id="lb_sum" class="notice"></p><pre id="lb_pre"></pre></div>',async()=>{
  const c=cfg();
  if(!c.blk)throw Error('Выберите блок');
  await run(c);
 });
 fillBlocks();
}
function fillBlocks(){
 const sel=document.getElementById('lb_block');
 if(!sel)return;
 const prev=sel.value;
 sel.innerHTML=curBlocks().map(b=>'<option value="'+b.id+'">'+esc(b.name)+'</option>').join('');
 if(prev&&[...sel.options].some(o=>o.value===prev))sel.value=prev;
 document.querySelectorAll('[data-liblib]').forEach(x=>x.classList.toggle('on',x.dataset.liblib===lib));
 refresh();
}
function cfg(){
 const sel=document.getElementById('lb_block'),blk=curBlocks().find(b=>b.id===(sel&&sel.value)),tid=document.getElementById('lb_target').value,m=by(),t=tid?m.get(tid):null;
 return {blk:blk,mult:Number(document.getElementById('lb_size').value)*Number(document.getElementById('lb_cx').value),room:document.getElementById('lb_room').value.trim(),start:document.getElementById('lb_start').value||today(),target:t?{id:t.id,kind:kindOf2(t,m),projectId:t.projectId}:null,apr:document.getElementById('lb_apr').checked};
}
function refresh(){
 if(!document.getElementById('lb_sum'))return;
 const c=cfg();
 document.getElementById('lb_aprbox').style.display=(c.blk&&c.blk.apr)?'':'none';
 if(!c.blk){document.getElementById('lb_sum').textContent='';return;}
 const ops=buildOps(c),tasks=ops.filter(o=>o.kind==='task').length,subs=ops.filter(o=>o.kind==='sub').length,end=ops.reduce((x,o)=>o.end>x?o.end:x,'');
 document.getElementById('lb_sum').textContent='Будет создано: задач '+tasks+', подзадач '+subs+'. Ориентировочно до '+end.slice(8)+'.'+end.slice(5,7)+'.'+end.slice(0,4)+'. '+(c.target&&c.target.kind==='task'?'Группы станут подзадачами выбранной задачи.':c.target?'Блок станет задачей этого этапа.':'Блок появится в вашем личном объекте.');
 document.getElementById('lb_pre').textContent=(c.blk.g?c.blk.g.map(g=>g.t+' ('+fm.apply(null,scaled(g.time,c.mult))+')').join('\n'):c.blk.chk?c.blk.items.map(i=>'☐ '+i).join('\n'):c.blk.steps.map(i=>'• '+i).join('\n'));
}
async function run(c){
 const ops=buildOps(c),total=ops.length,me=state.me.id;
 const ed=document.getElementById('editform');
 ed.innerHTML='<div class="nbp"><div class="top" id="lb_top"></div><div class="bar"><i id="lb_bar"></i></div><small>Не закрывайте страницу.</small><div class="footer"><button type="button" id="lb_done" data-action="close" class="primary hidden">Готово</button></div></div>';
 const dlg=document.getElementById('dialog'),block=e=>e.preventDefault();
 dlg.addEventListener('cancel',block);
 let done=0,pid='';const ids=new Map();
 const upd=()=>{document.getElementById('lb_top').textContent='Создано '+done+' из '+total;document.getElementById('lb_bar').style.width=Math.round(done/total*100)+'%';};
 upd();
 try{
  if(c.target){ids.set('@T',c.target.id);pid=c.target.projectId;}
  else{
   const f=window.DIO&&window.DIO.fcall;
   pid=f?await f('personalEnsure',{},60000):await srv('personalEnsure',{});
  }
  for(const x of ops){
   const parent=x.parent==='@T0'?(c.target?ids.get('@T'):''):(x.parent?ids.get(x.parent):'');
   for(let tries=0;;tries++){
    try{
     const id=await srv('taskCreate',{projectId:pid,parentId:parent||'',title:x.title,note:x.note||'',start:x.start,end:x.end,assigneeId:me,deps:[],lag:0,kind:x.kind,calendarEnabled:false});
     ids.set(x.key,id);
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
  document.getElementById('lb_top').textContent='Готово: создано '+done+' из '+total;
  document.getElementById('lb_bar').style.width='100%';
 }catch(e){
  document.getElementById('lb_top').textContent=(e&&e.stop?'Создание прервано. ':'Создание прервано: '+(e&&e.message||e)+'. ')+'Создано '+done+' из '+total+'.';
 }finally{
  dlg.removeEventListener('cancel',block);
  try{await reload();}catch(x){}
  try{render();}catch(x){}
  const d=document.getElementById('lb_done');if(d)d.classList.remove('hidden');
 }
}
function decorate(){
 if(!state||!state.me||state.me.role==='observer')return;
 const tb=document.querySelector('#content .toolbar');
 if(tb&&view==='tasks'&&!tb.querySelector('[data-libopen]')){
  const b=document.createElement('button');
  b.type='button';b.dataset.libopen='1';b.textContent='+ Блок из библиотеки';
  tb.appendChild(b);
 }
 const m=by();
 document.querySelectorAll('#content .card[data-drag]').forEach(card=>{
  const a=card.querySelector('.actions');
  if(!a||a.querySelector('[data-libtask]'))return;
  const t=m.get(card.dataset.drag);
  if(!t||!canEdit(t)||kindOf2(t,m)==='sub')return;
  const b=document.createElement('button');
  b.type='button';b.dataset.libtask=t.id;b.textContent='+ Блок';
  a.appendChild(b);
 });
}
document.addEventListener('click',e=>{
 const t=e.target;
 if(!t||!t.closest)return;
 const o=t.closest('[data-libopen]');
 if(o){open('');return;}
 const k=t.closest('[data-libtask]');
 if(k){open(k.dataset.libtask);return;}
 const l=t.closest('[data-liblib]');
 if(l){lib=l.dataset.liblib;fillBlocks();}
});
document.addEventListener('change',e=>{
 const el=e.target;
 if(el&&el.id&&el.id.indexOf('lb_')===0)refresh();
});
const oR=render;
render=function(){const r=oR.apply(this,arguments);setTimeout(()=>{try{decorate();}catch(e){}},0);return r;};
if(state)render();
})();
