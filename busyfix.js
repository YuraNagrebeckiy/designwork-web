'use strict';
(function(){
if(typeof document==='undefined')return;
const POP=!!HTMLElement.prototype.showPopover;
const bb=document.getElementById('busybar');
let FACTS=['Золотое сечение (≈1,618) дизайнеры используют для пропорций с античных времён.','Правило 60-30-10: 60% основной цвет, 30% дополнительный, 10% акцент.','Проход между мебелью комфортнее при ширине от 90 см, минимум около 60 см.','Тёплый свет 2700–3000 К подходит для спален и гостиных, нейтральный 4000 К — для кухни и кабинета.','Выкрас смотрите при дневном и вечернем свете: оттенок заметно меняется.','Метод критического пути показывает цепочку задач, которая определяет срок всего проекта.','Закладывайте в график 10–20% времени на согласования и правки.','Фиксируйте решения заказчика письменно: это экономит споры позже.','Масштаб 1:50 означает, что 1 см на чертеже — это 50 см на объекте.','Лист ГКЛ стандартно 1200×2500 мм.','Бетон набирает около 70% прочности за 7 суток и проектную — за 28.','Акты скрытых работ подписывают до закрытия конструкций: потом проверка потребует вскрытия.'];
try{
 fetch('busy.js?v='+Math.floor(Date.now()/300000)).then(r=>r.text()).then(t=>{
  const m=t.match(/const FACTS=\[([\s\S]*?)\n\];/);
  if(m){const a=(new Function('return ['+m[1]+']'))();if(Array.isArray(a)&&a.length>10)FACTS=a;}
 }).catch(()=>{});
}catch(e){}
const st=document.createElement('style');
st.textContent='#busybar[popover],#factbar{position:fixed;inset:auto;bottom:auto;height:auto;width:auto;overflow:visible;margin:0 auto;left:8px;right:8px;top:calc(8px + env(safe-area-inset-top));max-width:400px}#busybar[data-c="1"] .fact,#factbar[data-c="1"] .fact{display:none!important}#factbar{z-index:2147483000;background:var(--panel);color:var(--ink);border:1px solid var(--line);border-left:5px solid var(--accent);border-radius:14px;padding:10px 14px;box-shadow:0 8px 26px #0005;font-size:13px;display:none;pointer-events:none}#factbar.on{display:block}#factbar .bh{display:flex;align-items:center;gap:12px}#factbar .sp{perspective:300px;flex:none;width:44px;height:40px}#factbar .sp svg{width:44px;height:40px;animation:lgspin 1.4s linear infinite}#factbar .bh b{font-size:14px}#factbar .fact{margin-top:8px;padding-top:7px;border-top:1px solid var(--line);color:var(--muted);font-size:12px;line-height:1.35}#factbar .fact b{color:var(--ink)}@media (prefers-reduced-motion:reduce){#factbar .sp svg{animation:none}}';
document.head.appendChild(st);
if(bb&&POP)bb.setAttribute('popover','manual');
const fb=document.createElement('div');
fb.id='factbar';if(POP)fb.setAttribute('popover','manual');fb.setAttribute('role','status');
fb.innerHTML='<div class="bh"><div class="sp"><svg viewBox="340 95 330 370" aria-hidden="true"><use href="#cubes" stroke="#7b7b7b" stroke-width="4"/><use href="#redcube"/></svg></div><b></b></div><div class="fact"></div>';
document.body.appendChild(fb);
const fT=fb.querySelector('b'),fF=fb.querySelector('.fact');
let pend=[],lastEnd=0,factI=Math.floor(Math.random()*FACTS.length),factAt=0;
const WR=/(Create|Update|Delete|Save|Set|Send|Do|Exclude|Restore|Ensure|Move|Import)$/;
const SKIP=['chatSend','taskUpdateBatch'];
const LAB={taskCreate:'Создаём задачу',taskUpdate:'Сохраняем изменения задачи',taskDelete:'Удаляем задачу',projectCreate:'Создаём объект',projectUpdate:'Сохраняем настройки объекта',tplSet:'Сохраняем шаблон',userSave:'Сохраняем доступ пользователя',batch:'Создаём задачи'};
const wr=a=>!!a&&WR.test(a)&&SKIP.indexOf(a)<0;
function isWrite(req){
 const a=req&&req.action;
 if(a==='batch')return (((req.payload||{}).items)||[]).some(i=>i&&wr(i.action));
 return wr(a);
}
const oT=transport;
transport=async function(req){
 let j=null;
 try{if(isWrite(req)){j={t:Date.now(),label:LAB[req.action]||'Сохраняем изменения'};pend.push(j);}}catch(e){}
 try{return await oT.apply(this,arguments);}
 finally{if(j){pend=pend.filter(x=>x!==j);lastEnd=Date.now();}}
};
const dlg=()=>document.getElementById('dialog');
function place(el){
 el.dataset.c='';el.style.top='';el.style.left='';el.style.right='';el.style.margin='';el.style.width='';
 const d=dlg();
 if(d&&d.open){
  const r=d.getBoundingClientRect();
  let h=el.offsetHeight;
  if(!h||r.top>=h+16)return;
  el.dataset.c='1';h=el.offsetHeight;
  if(r.top>=h+16)return;
  if(innerHeight-r.bottom>=h+16)el.style.top=(r.bottom+8)+'px';
  return;
 }
 if(innerWidth<900)return;
 const br=document.querySelector('header .brand'),nv=document.getElementById('nav'),tl=document.querySelector('header .tools'),hd=document.querySelector('header');
 if(!br)return;
 const b=br.getBoundingClientRect();
 let x=b.right;
 if(nv){const r=nv.getBoundingClientRect();if(r.width>0&&r.height>0&&r.top<b.bottom)x=Math.max(x,r.right);}
 const lim=tl?tl.getBoundingClientRect().left:innerWidth,w=Math.min(400,lim-x-32);
 if(w<260)return;
 el.style.left=(x+16)+'px';el.style.right='auto';el.style.margin='0';el.style.width=w+'px';
 if(hd&&el.offsetHeight>hd.getBoundingClientRect().bottom-10)el.dataset.c='1';
}
function sync(el,on){
 if(!POP)return;
 const open=el.matches(':popover-open');
 if(on&&!open){try{el.showPopover();}catch(e){}}
 else if(!on&&open){try{el.hidePopover();}catch(e){}}
}
function tick(){
 const now=Date.now(),d=dlg();
 if(bb){
  const on=bb.classList.contains('on');
  sync(bb,on);
  if(on)place(bb);
 }
 const own=!!(d&&d.open&&d.querySelector('.nbp'));
 const busyOn=!!(bb&&bb.classList.contains('on'));
 const late=pend.some(j=>now-j.t>350),lin=now-lastEnd<900&&lastEnd>0&&fb.classList.contains('on');
 const want=!busyOn&&(own||late||lin)&&(POP||!(d&&d.open));
 if(want){
  if(!fb.classList.contains('on')){fb.classList.add('on');factAt=0;}
  fT.textContent=pend.length?pend[0].label+'…':own?'Идёт сохранение…':'Готово';
  if(now-factAt>8000){if(factAt)factI=(factI+1)%FACTS.length;factAt=now;fF.innerHTML='<b>Знаете ли вы?</b> '+FACTS[factI].replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
  sync(fb,true);
  place(fb);
 }else{
  fb.classList.remove('on');
  sync(fb,false);
 }
}
setInterval(()=>{try{tick();}catch(e){}},100);
})();
