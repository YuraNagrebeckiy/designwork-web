'use strict';
(function(){
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;};
let soundOn=LS('studioSound')!=='off',ctx=null,unread=0;const baseTitle=document.title;
const st=document.createElement('style');
st.textContent='#alerts{position:fixed;top:10px;right:10px;left:10px;max-width:420px;margin-left:auto;z-index:300;display:flex;flex-direction:column;gap:8px;pointer-events:none}.alert{pointer-events:auto;background:var(--panel);color:var(--ink);border:1px solid var(--accent);border-left:6px solid var(--accent);border-radius:12px;padding:12px 40px 12px 14px;box-shadow:0 8px 28px #0004;cursor:pointer;position:relative;animation:alin .25s}.alert strong{display:block}.alert span{display:block;color:var(--muted);font-size:13px;overflow-wrap:anywhere}.alert .x{position:absolute;top:4px;right:6px;border:0;background:none;min-height:32px;padding:4px 8px}@keyframes alin{from{transform:translateY(-12px);opacity:0}to{transform:none;opacity:1}}';
document.head.appendChild(st);
function unlock(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!ctx)ctx=new AC();if(ctx.state!=='running')ctx.resume();}catch(e){}}
['pointerdown','keydown','touchend'].forEach(ev=>document.addEventListener(ev,unlock,{passive:true}));
function beep(){
 if(!soundOn)return;
 try{if(navigator.vibrate)navigator.vibrate([120,60,120]);}catch(e){}
 unlock();if(!ctx)return;
 try{const t=ctx.currentTime;[[880,0],[1175,0.2],[1568,0.4]].forEach(([f,d])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0.0001,t+d);g.gain.exponentialRampToValueAtTime(0.3,t+d+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+d+0.35);o.connect(g);g.connect(ctx.destination);o.start(t+d);o.stop(t+d+0.4);});}catch(e){}
}
const box=document.createElement('div');box.id='alerts';document.body.appendChild(box);
function openTask(id){if(!id||!state)return;const t=state.tasks.find(x=>x.id===id);if(!t)return;if($('dialog').open)$('dialog').close();view='tasks';render();taskForm(t);}
function banner(title,text,id,pid){
 const d=document.createElement('div');d.className='alert';
 const a=document.createElement('strong'),b=document.createElement('span'),x=document.createElement('button');
 a.textContent=title;b.textContent=text;x.className='x';x.type='button';x.textContent='\u2715';x.setAttribute('aria-label','Закрыть');
 x.onclick=e=>{e.stopPropagation();d.remove();};
 d.onclick=()=>{d.remove();if(pid&&window.studioOpenChat)window.studioOpenChat(pid);else openTask(id);};
 d.append(a,b,x);box.appendChild(d);setTimeout(()=>d.remove(),20000);
}
function sys(title,text,tag){try{if('Notification' in window&&Notification.permission==='granted'&&document.hidden)new Notification(title,{body:text,tag:tag,icon:'apple-touch-icon.png'});}catch(e){}}
function fire(list){
 if(!list.length)return;
 beep();
 list.slice(0,4).forEach(n=>{banner(n.title,n.text,n.id,n.pid);sys(n.title,n.text,n.key);});
 if(list.length>4)banner('Ещё уведомлений: '+(list.length-4),'Откройте «Мои задачи»','','');
 if(document.hidden){unread+=list.length;document.title='('+unread+') '+baseTitle;}
}
function chatKey(pid){return 'studioChatSeen:'+state.me.id+':'+pid;}
function markChatSeen(pid,at){if(state&&at)LS(chatKey(pid),at);}
function chatUnread(pid){const c=state&&state.chat&&state.chat[pid];if(!c||c.by===state.me.id)return false;const seen=LS(chatKey(pid));return seen!==null&&c.at>seen;}
window.studioNotify={fire:fire,markChatSeen:markChatSeen,chatUnread:chatUnread};
function scan(s){
 if(!s||!s.me||!s.tasks)return;
 const k='studioSeen:'+s.me.id,raw=LS(k),first=raw===null;
 let seen;try{seen=new Set(first?[]:JSON.parse(raw||'[]'));}catch(e){seen=new Set();}
 const td=today(),byId=new Map(s.tasks.map(t=>[t.id,t])),out=[];
 s.tasks.forEach(t=>{
  const rk='review:'+t.id;
  if(t.status==='На согласовании'){
   if(manage(t.projectId)&&t.assigneeId!==s.me.id&&!seen.has(rk)){seen.add(rk);if(!first)out.push({key:rk,title:'Нужно согласование',text:t.title+' • '+name(t.assigneeId),id:t.id,pid:''});}
  }else seen.delete(rk);
 });
 s.tasks.filter(t=>t.assigneeId===s.me.id&&t.status!=='Готово').forEach(t=>{
  const deps=arr(t.deps).map(i=>byId.get(i)).filter(Boolean),depsDone=deps.length>0&&deps.every(d=>d.status==='Готово');
  const items=[['new:'+t.id,'Новая задача',t.title+' • '+t.start+' — '+t.end]];
  if(depsDone)items.push(['unlock:'+t.id,'Предыдущий этап завершён','Можно переходить к: '+t.title]);
  if(t.start<=td&&(!deps.length||depsDone))items.push(['start:'+t.id+':'+t.start,'Пора приступать',t.title]);
  if(t.end<td)items.push(['late:'+t.id+':'+t.end,'Срок вышел',t.title+' • до '+t.end]);
  else if(t.end===td)items.push(['due:'+t.id+':'+t.end,'Срок сегодня',t.title]);
  const fresh=!seen.has(items[0][0]);
  items.forEach(([key,title,text],i)=>{
   if(seen.has(key))return;
   seen.add(key);
   if(first)return;
   if(fresh&&i>0)return;
   out.push({key,title,text,id:t.id,pid:''});
  });
 });
 if(s.chat)Object.keys(s.chat).forEach(pid=>{
  const c=s.chat[pid],ck='studioChatSeen:'+s.me.id+':'+pid,cs=LS(ck);
  if(cs===null){LS(ck,c.at);return;}
  const nk='chat:'+pid+':'+c.at;
  if(c.at>cs&&c.by!==s.me.id&&!seen.has(nk)){
   seen.add(nk);
   if(window.studioChatOpen===pid){LS(ck,c.at);return;}
   if(!first)out.push({key:nk,title:'Чат: '+projectName(pid),text:(c.name||'')+': '+c.text,id:'',pid:pid});
  }
 });
 LS(k,JSON.stringify(Array.from(seen).slice(-3000)));
 fire(out);
}
const origApply=applyState;
applyState=function(s){const r=origApply.apply(this,arguments);try{scan(s);}catch(e){}return r;};
const origUser=userForm;
userForm=function(u){
 origUser.apply(this,arguments);
 const foot=$('editform').querySelector('.footer');
 if(!foot||u.calendarId||u.approved!=='true')return;
 const p=document.createElement('p'),b=document.createElement('button');
 p.className='notice';p.textContent='Или создайте календарь автоматически: сотрудник получит приглашение на свой email (нужен Google-аккаунт).';
 b.type='button';b.textContent='Создать календарь для сотрудника';
 b.onclick=()=>guarded(async()=>{await call('calendarCreate',{id:u.id});$('dialog').close();await reload();toast('Календарь создан. Сотрудник получил письмо со ссылкой. Задачи появятся в календаре в течение 5 минут.');});
 foot.parentNode.insertBefore(p,foot);foot.parentNode.insertBefore(b,foot);
};
const menu=$('menu');
const mk=(txt,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=txt;b.onclick=fn;return b;};
const bSys=mk('Системные уведомления',async()=>{menu.classList.add('hidden');if(!('Notification' in window)){toast('Этот браузер не поддерживает системные уведомления');return;}try{const r=await Notification.requestPermission();toast(r==='granted'?'Системные уведомления включены (когда приложение в фоне)':'Уведомления не разрешены в настройках браузера');}catch(e){toast('Не удалось включить уведомления');}});
const bTest=mk('Проверить уведомление',()=>{menu.classList.add('hidden');unlock();fire([{key:'test',title:'Проверка',text:soundOn?'Звук и оповещение работают':'Звук выключен (пункт «Звук» в меню)',id:'',pid:''}]);});
const bSound=mk('',()=>{soundOn=!soundOn;LS('studioSound',soundOn?'on':'off');paint();if(soundOn){unlock();beep();}});
function paint(){bSound.textContent=soundOn?'Звук: включён':'Звук: выключен';}
paint();
menu.insertBefore(bSys,menu.firstChild);menu.insertBefore(bTest,menu.firstChild);menu.insertBefore(bSound,menu.firstChild);
setInterval(()=>{if(document.hidden&&state&&!working&&!$('dialog').open)guarded(reload,true);},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){unread=0;document.title=baseTitle;}});
})();
