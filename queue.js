'use strict';
(function(){
if(typeof document==='undefined'||typeof state==='undefined')return;
const KEY='studioQueue:',DELAYS=[2,4,8,15,30];
let Q=new Map(),owner='',flushing=false,timer=0,tick=0,sent=0,total=0,netDown=false,retry=0,nextAt=0,doneUntil=0,loading=false,loadShown=false,loadT=0,loadText='',loadN=-1,authStop=false,useBatch=true;
const css=document.createElement('style');
css.textContent='#syncbar{position:fixed;left:8px;right:8px;bottom:78px;max-width:480px;margin:0 auto;z-index:250;background:var(--panel);color:var(--ink);border:1px solid var(--line);border-left:5px solid var(--accent);border-radius:12px;padding:8px 12px;box-shadow:0 6px 22px #0003;font-size:13px;display:none}#syncbar.on{display:block}#syncbar.err{border-left-color:#e5484d}#syncbar b{display:block}#syncbar .pb{height:6px;border-radius:99px;background:rgba(127,127,127,.25);overflow:hidden;margin:6px 0 3px}#syncbar .pb i{display:block;height:100%;width:0;background:var(--accent);transition:width .3s}#syncbar.err .pb i{background:#e5484d}#syncbar .pb.ind i{width:35%;animation:sbi 1s ease-in-out infinite alternate}#syncbar small{display:block;color:var(--muted)}#syncbar button{margin-top:6px;min-height:30px;padding:2px 12px}@keyframes sbi{from{margin-left:0}to{margin-left:65%}}';
document.head.appendChild(css);
const box=document.createElement('div');box.id='syncbar';box.setAttribute('role','status');document.body.appendChild(box);
function persist(){try{if(owner)localStorage.setItem(KEY+owner,JSON.stringify([...Q.values()]));}catch(e){}}
function restore(id){
 if(!id||owner===id)return;
 owner=id;Q=new Map();
 try{JSON.parse(localStorage.getItem(KEY+id)||'[]').forEach(q=>{if(q&&q.id)Q.set(q.id,q);});}catch(e){}
 total=Q.size;sent=0;
}
function paint(){
 if(!box)return;
 const pend=Q.size,rows=[];let cls='',btn=false;
 if(pend||flushing){
  const pct=total?Math.min(100,Math.round(sent/total*100)):0;
  if(netDown){
   cls='err';btn=true;
   rows.push('<b>Нет связи с сервером. Правки сохранены на этом устройстве</b><div class="pb"><i style="width:'+pct+'%"></i></div><small>Отправлено: '+sent+' из '+total+' · в очереди: '+pend+' · повтор через '+Math.max(0,Math.ceil((nextAt-Date.now())/1000))+' с</small>');
  }else{
   rows.push('<b>'+(flushing?'Отправляем изменения на сервер…':'Изменения ждут отправки')+'</b><div class="pb"><i style="width:'+pct+'%"></i></div><small>Отправлено: '+sent+' из '+total+' · осталось: '+pend+'</small>');
  }
 }else if(doneUntil>Date.now()){
  rows.push('<b>Все изменения сохранены ✓</b><div class="pb"><i style="width:100%"></i></div>');
 }
 if(loading&&loadShown){
  rows.push('<b>'+loadText+'</b>'+(loadN<0?'<div class="pb ind"><i></i></div><small>Ждём ответ сервера. Приложение уже можно использовать.</small>':'<div class="pb"><i style="width:100%"></i></div><small>Загружено задач: '+loadN+' из '+loadN+'</small>'));
 }
 box.className=rows.length?('on '+cls):'';
 box.innerHTML=rows.join('')+(btn?'<button type="button" data-qretry="1">Повторить сейчас</button>':'');
 if(rows.length&&!tick)tick=setInterval(paint,1000);
 if(!rows.length&&tick){clearInterval(tick);tick=0;}
}
function schedule(ms){clearTimeout(timer);timer=setTimeout(flush,ms);paint();}
function enqueue(t,next){
 const old=Q.get(t.id);
 Q.set(t.id,{id:t.id,status:next,version:old?old.version:t.version,retried:false});
 if(!old)total++;
 persist();
}
async function bsend(ops){
 const r=await transport({action:'taskUpdateBatch',payload:{ops:ops},token:token});
 if(!r||!r.ok){const m=String(r&&r.error||'Сервер не ответил');if(m.indexOf('AUTH:')===0)signoutLocal();throw Error(m);}
 return r.data;
}
const CONFLICT=/верси|устар|измен|конфликт|version|stale/i;
async function flush(){
 if(flushing)return;
 if(!Q.size){paint();return;}
 if(typeof $==='function'&&$('dialog')&&$('dialog').open){schedule(1500);return;}
 timer=0;flushing=true;authStop=false;paint();
 try{
  while(Q.size){
   if($('dialog').open)break;
   const batch=[];
   for(const q of Q.values()){
    if(batch.length>=(useBatch?20:1))break;
    const cur=state&&state.tasks.find(x=>x.id===q.id);
    if(!cur){Q.delete(q.id);sent++;persist();continue;}
    batch.push({q:q,cur:cur});
   }
   if(!batch.length)continue;
   try{
    if(batch.length>1){
     const r=await bsend(batch.map(b=>({id:b.q.id,version:b.cur.version,status:b.q.status})));
     const res=(r&&r.results)||[],seen=new Set(res.map(x=>x.id));
     let again=false;
     res.forEach(x=>{
      const q=Q.get(x.id);
      if(!q)return;
      if(x.ok){Q.delete(x.id);sent++;return;}
      const m=String(x.error||'');
      if(CONFLICT.test(m)&&!q.retried){q.retried=true;again=true;return;}
      Q.delete(x.id);sent++;
      toast('Не удалось сохранить статус: '+m);
     });
     persist();netDown=false;retry=0;
     if(batch.some(b=>!seen.has(b.q.id)))useBatch=false;
     if(again){try{await reload();}catch(x){}}
    }else{
     const b=batch[0];
     await call('taskUpdate',{id:b.q.id,version:b.cur.version,status:b.q.status});
     Q.delete(b.q.id);sent++;persist();netDown=false;retry=0;
    }
   }catch(e){
    const m=String(e&&e.message||e);
    if(m.indexOf('AUTH:')===0){authStop=true;break;}
    if(/Нет связи|Сервер недоступен|слишком долго|Не настроен/.test(m)){netDown=true;break;}
    if(batch.length>1){useBatch=false;continue;}
    const q=batch[0].q;
    if(CONFLICT.test(m)&&!q.retried){
     q.retried=true;persist();
     try{await reload();}catch(x){}
     continue;
    }
    Q.delete(q.id);sent++;persist();
    toast('Не удалось сохранить статус: '+m);
   }
   paint();
  }
 }finally{flushing=false;}
 if(authStop){paint();return;}
 if(netDown){
  const d=DELAYS[Math.min(retry,DELAYS.length-1)];retry++;
  nextAt=Date.now()+d*1000;schedule(d*1000);return;
 }
 if(Q.size){schedule(1500);return;}
 try{await reload();}catch(e){}
 doneUntil=Date.now()+2500;total=0;sent=0;paint();
 setTimeout(paint,2600);
}
document.addEventListener('change',e=>{
 const el=e.target,d=el&&el.dataset;
 if(!d||!(d.done||d.status)||typeof state==='undefined'||!state)return;
 const t=state.tasks.find(x=>x.id===(d.done||d.status));
 if(!t)return;
 e.stopImmediatePropagation();
 const next=d.done?(el.checked?'Готово':'В работе'):el.value;
 if(!canEdit(t)||next===t.status){render();return;}
 if(next==='Готово'&&kids(t.id).some(k=>k.status!=='Готово')&&!confirm('Отметить выполненными и все подзадачи?')){render();return;}
 restore(state.me.id);
 t.status=next;
 if(next==='Готово')kids(t.id).forEach(k=>{k.status='Готово';});
 enqueue(t,next);
 render();
 schedule(800);
},true);
document.addEventListener('click',e=>{
 if(e.target&&e.target.closest&&e.target.closest('[data-qretry]')){retry=0;netDown=false;schedule(0);}
},true);
window.addEventListener('online',()=>{if(Q.size){retry=0;netDown=false;schedule(0);}});
const oAS=applyState;
applyState=function(s){
 try{
  if(s&&s.me){
   restore(s.me.id);
   if(Q.size&&s.tasks){const by=new Map(s.tasks.map(t=>[t.id,t]));Q.forEach(q=>{const t=by.get(q.id);if(t)t.status=q.status;});}
  }
 }catch(e){}
 const r=oAS.apply(this,arguments);
 try{if(Q.size&&!flushing&&!timer)schedule(500);}catch(e){}
 return r;
};
const oCall=call;
call=async function(action){
 if(action!=='state')return oCall.apply(this,arguments);
 loading=true;loadShown=false;loadN=-1;loadText='Загружаем данные с сервера…';
 clearTimeout(loadT);
 loadT=setTimeout(()=>{if(loading){loadShown=true;paint();}},600);
 const slow=setTimeout(()=>{if(loading){loadText='Сервер отвечает медленно, ждём…';paint();}},4000);
 try{
  const r=await oCall.apply(this,arguments);
  loadN=r&&r.tasks?r.tasks.length:0;loadText='Обновляем экран…';
  if(loadShown)paint();
  setTimeout(()=>{loading=false;loadShown=false;paint();},loadShown?900:0);
  return r;
 }catch(err){
  loading=false;loadShown=false;paint();throw err;
 }finally{clearTimeout(slow);clearTimeout(loadT);}
};
paint();
})();
