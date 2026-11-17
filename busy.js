'use strict';
(function(){
if(typeof document==='undefined'||typeof transport!=='function')return;
const LABEL={state:'Загружаем объекты и задачи',taskCreate:'Создаём задачу',taskUpdate:'Сохраняем изменения задачи',taskUpdateBatch:'Сохраняем статусы задач',taskDelete:'Удаляем задачу',projectCreate:'Создаём объект',projectUpdate:'Сохраняем настройки объекта',projectDelete:'Удаляем объект',userSave:'Сохраняем доступ пользователя',login:'Входим в систему',requestCode:'Отправляем код на почту',verifyCode:'Проверяем код',register:'Отправляем заявку',setPassword:'Сохраняем пароль',logout:'Выходим',sectionSet:'Переносим задачу в раздел',chatSend:'Отправляем сообщение'};
const FL={personalEnsure:'Открываем ваше личное пространство',supplyGet:'Загружаем комплектацию',supplyDo:'Сохраняем изменения в комплектации',supplySave:'Сохраняем комплектацию',supplyCat:'Загружаем справочник закупок'};
const QUIET=new Set(['ping','syncPull','tplMap','tplSet','batch']);
const FACTS=[
'Золотое сечение (≈1,618) дизайнеры используют для пропорций с античных времён.',
'Правило 60-30-10: 60% основной цвет, 30% дополнительный, 10% акцент.',
'Высота рабочей столешницы на кухне обычно 85–90 см, но лучше подбирать её под рост хозяйки или хозяина.',
'Проход между мебелью комфортнее при ширине от 90 см, минимум около 60 см.',
'Тёплый свет 2700–3000 К подходит для спален и гостиных, нейтральный 4000 К — для кухни и кабинета.',
'Индекс цветопередачи CRI от 90 помогает точнее видеть цвета отделки и тканей.',
'Светлые оттенки визуально расширяют комнату, тёмные делают её камернее.',
'Шторы от потолка до пола визуально повышают потолок.',
'Зеркало напротив окна добавляет в комнату дневной свет.',
'Высота стула около 45 см, стола около 75 см: разница 25–30 см даёт удобную посадку.',
'Чтобы стул свободно отодвигался, от края стола до стены нужно не менее 90 см.',
'Раковину обычно монтируют на высоте 80–85 см от пола.',
'Кухонный треугольник «плита — мойка — холодильник» удобен, когда сумма его сторон 4–8 м.',
'Двери в жилые комнаты обычно 80–90 см шириной, в санузел — 60–70 см.',
'По своду правил минимальная высота жилой комнаты в России — 2,5 м.',
'Ступень лестницы обычно 25–30 см в глубину и 15–18 см в высоту.',
'Формула Блонделя для удобной лестницы: удвоенная высота подъёма плюс глубина ступени — около 60–64 см.',
'Центр экрана телевизора лучше держать примерно на уровне глаз сидящего человека.',
'«Цвет года» Pantone выбирают с 2000 года.',
'Цвет на экране (RGB) и в печати (CMYK) отличается, поэтому выкрасы смотрите вживую.',
'Выкрас смотрите при дневном и вечернем свете: оттенок заметно меняется.',
'Метамерия: два образца могут совпадать при одном освещении и различаться при другом.',
'Глянцевая краска подчёркивает любые неровности основания, поэтому стены под неё шпаклюют особенно тщательно.',
'Комфортная влажность воздуха для паркета и деревянной мебели — около 40–60%.',
'У обоев с крупным раппортом расход выше: рисунок нужно совмещать на стыках.',
'Узкий угол светильника (около 24°) даёт акцент, широкий (около 60°) — рассеянный свет.',
'Розетки обычно ставят на высоте около 30 см от пола, выключатели — около 90 см.',
'Коридор уже 90 см сложен для проноса крупной мебели.',
'Окна на север дают ровный холодный свет, на юг — яркий свет с бликами.',
'Ручки дверей обычно ставят на высоте 90–110 см от пола.',
'Бетон набирает около 70% прочности за 7 суток и проектную — за 28.',
'В первые дни бетон нужно увлажнять: слишком быстрое высыхание даёт трещины.',
'Защитный слой бетона над арматурой обычно 25–50 мм: он защищает сталь от коррозии.',
'Для несущих стен малоэтажных домов чаще берут газобетон плотностью D400–D600.',
'Первый ряд газобетона кладут на цементный раствор, дальше — на клей.',
'Стык разных материалов часто даёт трещину, поэтому его защищают деформационным швом или армирующей сеткой.',
'Точка росы внутри стены намочит утеплитель: пароизоляцию ставят с тёплой стороны.',
'Зазор для вентиляции кровельного пирога обычно не менее 40–50 мм.',
'Уклон плоской кровли и пола в душевой делают для стока воды: 1–2%.',
'Нормативная глубина промерзания грунта в Москве около 1,4 м.',
'Цементная стяжка набирает проектную прочность примерно за 28 суток.',
'Перед укладкой паркета влажность цементной стяжки обычно должна быть ниже 4%.',
'Газобетон перед штукатуркой грунтуют составом глубокого проникновения.',
'Ровность стены проверяют двухметровым правилом: допустимый зазор под отделку обычно 2–3 мм.',
'Равные диагонали комнаты — простой способ проверить, что углы прямые.',
'Треугольник со сторонами 3-4-5 даёт прямой угол без инструментов.',
'Высота потолка в одной комнате может отличаться на несколько сантиметров: измеряйте в нескольких точках.',
'Основная усадка сруба идёт 6–12 месяцев после сборки.',
'Клееный брус и брус камерной сушки садятся заметно меньше, чем бревно естественной влажности.',
'Окна в срубе ставят в окосячку с зазором на усадку.',
'Повторную конопатку сруба обычно делают через 1–2 года.',
'В деревянном доме проводку прокладывают в металлорукаве или негорючем гофрорукаве.',
'УЗО защищает человека от поражения током, а автомат — проводку от перегрузки.',
'Для розеток обычно берут медный кабель 2,5 мм², для освещения — 1,5 мм².',
'Греющий кабель тёплого пола не кладут под стационарную мебель без ножек.',
'Радиатор под окном перехватывает холодный поток воздуха от стекла.',
'На одного человека в жилой комнате нужно около 30 м³ свежего воздуха в час.',
'Тонкая лёгкая перегородка хуже защищает от шума, чем массивная.',
'Воздушный зазор и минвата в каркасной перегородке заметно улучшают звукоизоляцию.',
'Гидроизоляцию в санузле заводят на стены минимум на 15–20 см, в зоне душа выше.',
'Плитку большого формата клеят двойным методом: клей наносят и на основание, и на плитку.',
'Расшивать швы плитки лучше не раньше чем через сутки после укладки.',
'Краску наносят в два слоя по грунту; пауза между слоями обычно 2–4 часа, точнее в инструкции.',
'Метод критического пути показывает цепочку задач, которая определяет срок всего проекта.',
'Задержка задачи на критическом пути сдвигает сдачу, а на некритической — только после исчерпания запаса.',
'Диаграмма Ганта появилась в 1910-х годах и до сих пор основа планирования.',
'Закон Хофштадтера: любая работа занимает больше времени, даже если вы учли закон Хофштадтера.',
'Закладывайте в график 10–20% времени на согласования и правки.',
'Фиксируйте решения заказчика письменно: это экономит споры позже.',
'Правило Парето: около 20% решений определяют 80% результата.',
'Авторский надзор помогает сохранить замысел проекта на стройке.',
'Акты скрытых работ подписывают до закрытия конструкций: потом проверка потребует вскрытия.',
'Фото с рулеткой в кадре — лучшее подтверждение размеров скрытых работ.',
'BIM хранит в модели не только геометрию, но и данные о материалах, сроках и стоимости.',
'Формат IFC — открытый способ обмена BIM-моделями между разными программами.',
'Масштаб 1:50 означает, что 1 см на чертеже — это 50 см на объекте.',
'Лист А1 — 594×841 мм, А3 — 297×420 мм; каждый следующий формат вдвое меньше по площади.',
'Толщина линий передаёт иерархию: несущие стены на плане рисуют толще перегородок.',
'Размерные цепочки на чертеже лучше не пересекать: так их проще читать.',
'1 дюйм равен 25,4 мм — пригодится при выборе сантехники и труб.',
'Труба «1/2 дюйма» имеет внутренний диаметр примерно 15 мм.',
'Одинарный кирпич — 250×120×65 мм.',
'На 1 м² кладки в полкирпича уходит около 51 кирпича.',
'Лист ГКЛ стандартно 1200×2500 мм.',
'Стандартный лист фанеры — 1525×1525 мм.',
'Европоддон — 1200×800 мм: от него удобно считать место под склад закупок.',
'Лазерный дальномер точнее рулетки на больших расстояниях, но его луч плохо виден на ярком свету.',
'Зелёный луч лазерного уровня глаз видит лучше красного.',
'Стеклопакет с двумя камерами теплее однокамерного, но тяжелее: проверьте несущую способность створки.',
'Тёплый пол под плиткой прогревает стяжку несколько часов: включайте его заранее.',
'Светлый пол и потолок отражают больше света и делают комнату ярче.',
'Дерево лучше красить и пропитывать со всех сторон, включая торцы.',
'Торцы древесины впитывают влагу сильнее всего: их обрабатывают особенно тщательно.',
'Антисептик защищает древесину от грибка и плесени, а антипирен замедляет горение.',
'Паропроницаемая краска позволяет стенам «дышать» и не копить влагу.',
'Кондиционер лучше ставить так, чтобы поток не дул на рабочее и спальное место.',
'Перед заказом окон замеряйте проём в нескольких местах: стены редко бывают идеально ровными.',
'Образцы материалов храните вместе с датой и поставщиком: через год вы точно найдёте тот же оттенок.',
'Хороший чертёж отвечает на вопрос «что, где и как делать» без устных пояснений.',
'Лучшая проверка проекта — пройтись по нему глазами подрядчика: всё ли понятно без вас?'
];
const css=document.createElement('style');
css.textContent='#bar{display:none!important}.brand{perspective:700px}.brand.loading .logo{animation:lgspin 1.6s linear infinite}@keyframes lgspin{to{transform:rotateY(360deg)}}#busybar{position:fixed;top:calc(8px + env(safe-area-inset-top));left:8px;right:8px;max-width:400px;margin:0 auto;z-index:2147483000;background:var(--panel);color:var(--ink);border:1px solid var(--line);border-left:5px solid var(--accent);border-radius:14px;padding:10px 14px;box-shadow:0 8px 26px #0005;font-size:13px;display:none;pointer-events:none}#busybar.on{display:block}#busybar .bh{display:flex;align-items:center;gap:12px}#busybar .sp{perspective:300px;flex:none;width:44px;height:40px}#busybar .sp svg{width:44px;height:40px;animation:lgspin 1.4s linear infinite}#busybar .bh b{font-size:14px}#busybar ul{list-style:none;margin:8px 0 0;padding:0}#busybar li{display:flex;align-items:center;gap:8px;padding:2px 0}#busybar li i{width:16px;text-align:center;font-style:normal;flex:none}#busybar li.ok i{color:#2a9d4a;font-weight:700}#busybar li.err i{color:#e5484d;font-weight:700}#busybar li.ok span{color:var(--muted)}#busybar li u{display:inline-block;width:11px;height:11px;border:2px solid rgba(127,127,127,.35);border-top-color:var(--accent);border-radius:50%;animation:bbr .8s linear infinite}#busybar .slow{display:block;color:var(--muted);margin-top:4px}#busybar .fact{margin-top:8px;padding-top:7px;border-top:1px solid var(--line);color:var(--muted);font-size:12px;line-height:1.35}#busybar .fact b{color:var(--ink)}@keyframes bbr{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.brand.loading .logo,#busybar .sp svg{animation:none}}';
document.head.appendChild(css);
const box=document.createElement('div');
box.id='busybar';
box.setAttribute('role','status');
document.body.appendChild(box);
let rows=[],timer=0,seq=0,inF=0,netN=0,netT=0,shown=false,shownAt=0,factAt=0,lingerUntil=0,sig='',factI=Math.floor(Math.random()*FACTS.length),built=false,elT,elU,elS,elF;
function blocked(){try{return typeof working!=='undefined'&&working===true;}catch(e){return false;}}
function logo(on){document.querySelectorAll('.brand').forEach(b=>b.classList.toggle('loading',on));}
function build(){
 box.innerHTML='<div class="bh"><div class="sp"><svg viewBox="340 95 330 370" aria-hidden="true"><use href="#cubes" stroke="#7b7b7b" stroke-width="4"/><use href="#redcube"/></svg></div><b></b></div><ul></ul><small class="slow"></small><div class="fact" style="display:none"></div>';
 elT=box.querySelector('.bh b');elU=box.querySelector('ul');elS=box.querySelector('.slow');elF=box.querySelector('.fact');
 built=true;sig='';
}
function paint(){
 const now=Date.now(),dlg=document.getElementById('dialog'),own=dlg&&dlg.open&&dlg.querySelector('.nbp');
 const waiting=rows.filter(r=>r.st==='wait');
 const virt=(netN>0&&!waiting.length&&now-netT>1500)?[{id:'net',t:netT,st:'wait',hard:true,label:'Ждём ответ сервера'}]:[];
 const allW=waiting.concat(virt);
 const hard=allW.some(r=>r.hard&&now-r.t>350);
 const blk=(blocked()||hard)&&!own&&allW.some(r=>now-r.t>350);
 logo(!blk&&allW.some(r=>now-r.t>250));
 const vis=blk||(shown&&now<lingerUntil);
 if(!vis){
  shown=false;built=false;
  if(!allW.length&&!netN){rows=[];if(timer){clearInterval(timer);timer=0;}}
  box.className='';
  return;
 }
 if(!shown){shown=true;shownAt=now;factAt=now;}
 const host=dlg&&dlg.open?dlg:document.body;
 if(box.parentNode!==host){host.appendChild(box);built=false;}
 if(!built)build();
 box.className='on';
 const list=rows.slice(-6).concat(virt),s=list.map(r=>r.id+r.st).join(',');
 if(s!==sig){
  sig=s;
  elU.innerHTML=list.map(r=>'<li class="'+r.st+'"><i>'+(r.st==='ok'?'✓':r.st==='err'?'✕':'<u></u>')+'</i><span>'+r.label+'</span></li>').join('');
 }
 elT.textContent=allW.length?'Загружаем данные…':'Готово';
 const sec=Math.round((now-shownAt)/1000);
 elS.textContent=sec>=8?'Сервер отвечает медленно, это нормально для Google Apps Script. Не закрывайте страницу.':'';
 if(now-shownAt>2500){
  if(now-factAt>8000){factI=(factI+1)%FACTS.length;factAt=now;}
  const t='<b>Знаете ли вы?</b> '+FACTS[factI];
  if(elF.dataset.i!==String(factI)){elF.innerHTML=t;elF.dataset.i=String(factI);}
  elF.style.display='block';
 }
}
function fin(j,stt){
 j.st=stt;
 if(shown)lingerUntil=Date.now()+900;
 paint();
}
const oT=transport;
transport=async function(req){
 const a=req&&req.action;
 if(QUIET.has(a)||inF>0)return oT.apply(this,arguments);
 const j={id:++seq,t:Date.now(),label:LABEL[a]||'Работаем с сервером',st:'wait'};
 rows.push(j);
 if(!timer)timer=setInterval(paint,300);
 try{
  const r=await oT.apply(this,arguments);
  j.st='ok';
  return r;
 }catch(e){
  j.st='err';
  throw e;
 }finally{
  if(j.st==='ok'&&a==='state')rows.push({id:++seq,t:Date.now(),label:'Обновляем экран',st:'ok'});
  fin(j,j.st);
 }
};
const D=window.DIO;
if(D&&typeof D.fcall==='function'){
 const of=D.fcall;
 D.fcall=function(name){
  const j={id:++seq,t:Date.now(),label:FL[name]||LABEL[name]||'Работаем с сервером',st:'wait',hard:true};
  rows.push(j);
  inF++;
  if(!timer)timer=setInterval(paint,300);
  const end=s=>{inF=Math.max(0,inF-1);fin(j,s);};
  let p;
  try{p=Promise.resolve(of.apply(this,arguments));}catch(e){end('err');throw e;}
  return p.then(r=>{end('ok');return r;},e=>{end('err');throw e;});
 };
}
if(typeof window.fetch==='function'&&window.STUDIO_API){
 const of2=window.fetch,pre=String(window.STUDIO_API).slice(0,40);
 window.fetch=function(u){
  const url=String((u&&u.url)||u||'');
  if(url.indexOf(pre)!==0)return of2.apply(this,arguments);
  if(!netN)netT=Date.now();
  netN++;
  if(!timer)timer=setInterval(paint,300);
  const dn=()=>{netN=Math.max(0,netN-1);};
  return of2.apply(this,arguments).then(r=>{dn();return r;},e=>{dn();throw e;});
 };
}
const sb=document.getElementById('syncbar');
if(sb){
 const re=/^(Загружаем данные|Сервер отвечает|Обновляем экран)/;
 new MutationObserver(()=>{
  let hit=false;
  [...sb.children].forEach(el=>{
   if(el.tagName==='B'&&re.test(el.textContent)){
    hit=true;
    const rm=[el];
    let n=el.nextElementSibling;
    while(n&&n.tagName!=='B'&&n.tagName!=='BUTTON'){rm.push(n);n=n.nextElementSibling;}
    rm.forEach(x=>x.remove());
   }
  });
  if(hit&&!sb.children.length)sb.className='';
 }).observe(sb,{childList:true});
}
})();
