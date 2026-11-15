'use strict';
(function(){
if(typeof document==='undefined'||typeof transport!=='function')return;
const LABEL={state:'Загружаем данные',taskCreate:'Создаём задачу',taskUpdate:'Сохраняем изменения задачи',taskUpdateBatch:'Сохраняем статусы задач',taskDelete:'Удаляем задачу',projectCreate:'Создаём объект',projectUpdate:'Сохраняем настройки объекта',projectDelete:'Удаляем объект',userSave:'Сохраняем доступ пользователя',login:'Входим в систему',requestCode:'Отправляем код на почту',verifyCode:'Проверяем код',register:'Отправляем заявку',setPassword:'Сохраняем пароль',logout:'Выходим',sectionSet:'Переносим задачу в раздел',chatSend:'Отправляем сообщение'};
const QUIET=new Set(['ping','syncPull','tplMap','tplSet','batch']);
const css=document.createElement('style');
css.textContent='#busybar{position:fixed;top:calc(8px + env(safe-area-inset-top));left:8px;right:8px;max-width:420px;margin:0 auto;z-index:2147483000;background:var(--panel);color:var(--ink);border:1px solid var(--line);border-left:5px solid var(--accent);border-radius:12px;padding:8px 12px;box-shadow:0 6px 22px #0004;font-size:13px;display:none;pointer-events:none}#busybar.on{display:block}#busybar b{display:block}#busybar .pb{height:6px;border-radius:99px;background:rgba(127,127,127,.25);overflow:hidden;margin:6px 0 3px}#busybar .pb i{display:block;height:100%;width:35%;background:var(--accent);animation:bbi 1s ease-in-out infinite alternate}#busybar small{display:block;color:var(--muted)}@keyframes bbi{from{margin-left:0}to{margin-left:65%}}';
document.head.appendChild(css);
const box=document.createElement('div');
box.id='busybar';
box.setAttribute('role','status');
document.body.appendChild(box);
let jobs=[],timer=0,seq=0;
function blocked(){try{return typeof working!=='undefined'&&working===true;}catch(e){return false;}}
function paint(){
 const dlg=document.getElementById('dialog');
 const own=dlg&&dlg.open&&dlg.querySelector('.nbp');
 const vis=(blocked()&&!own)?jobs.filter(j=>Date.now()-j.t>350):[];
 if(!vis.length){box.className='';return;}
 const j=vis[vis.length-1],sec=Math.round((Date.now()-j.t)/1000);
 const host=dlg&&dlg.open?dlg:document.body;
 if(box.parentNode!==host)host.appendChild(box);
 box.className='on';
 box.innerHTML='<b>'+j.label+'…</b><div class="pb"><i></i></div><small>'+(sec<1?'Секунду…':'Ждём ответ сервера: '+sec+' с')+(sec>=8?'. Сервер отвечает медленно, это нормально для Google Apps Script. Не закрывайте страницу.':'')+'</small>';
}
const oT=transport;
transport=async function(req){
 const a=req&&req.action;
 if(QUIET.has(a))return oT.apply(this,arguments);
 const j={t:Date.now(),label:LABEL[a]||'Работаем с сервером',id:++seq};
 jobs.push(j);
 if(!timer)timer=setInterval(paint,400);
 try{return await oT.apply(this,arguments);}
 finally{
  jobs=jobs.filter(x=>x!==j);
  if(!jobs.length){clearInterval(timer);timer=0;}
  paint();
 }
};
})();
