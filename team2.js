'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined'||typeof state==='undefined')return;
const st=document.createElement('style');
st.textContent='#content .panel.tmex{opacity:.72}#content .panel .tmb{margin:8px 8px 0 0}#content .panel .tmflag{display:inline-block;margin-left:6px;padding:1px 8px;border-radius:999px;background:var(--line);font-size:12px}';
document.head.appendChild(st);
function decorate(){
 if(!state||!state.me||view!=='users'||!state.teamOps||state.me.role!=='admin')return;
 document.querySelectorAll('#content .panel [data-action="userEdit"]').forEach(eb=>{
  const p=eb.closest('.panel'),u=(state.users||[]).find(x=>x.id===eb.dataset.id);
  if(!p||!u||p.dataset.tm)return;
  p.dataset.tm='1';
  const add=(act,txt,cls)=>{
   const b=document.createElement('button');
   b.type='button';b.dataset.tm=act;b.dataset.id=u.id;b.textContent=txt;b.className='tmb'+(cls?' '+cls:'');
   (p.querySelector('.tmb:last-of-type')||eb).after(b);
  };
  if(u.excluded){
   p.classList.add('tmex');
   eb.style.display='none';
   p.querySelectorAll('p').forEach(x=>{if(x.innerHTML.indexOf('Ожидает подтверждения')>=0)x.innerHTML=x.innerHTML.replace('Ожидает подтверждения','<span class="tmflag">Исключён</span>');});
   add('restore','Вернуть');
  }else if(u.id===state.me.id||u.role==='admin'){
   return;
  }else if(u.approved==='true'){
   add('exclude','Исключить','danger');
  }else{
   add('reqdel','Удалить заявку','danger');
  }
 });
}
function exclude(u){
 const cand=state.users.filter(x=>x.approved==='true'&&x.id!==u.id&&(x.role==='admin'||x.role==='manager'));
 const n=(state.tasks||[]).filter(t=>t.assigneeId===u.id).length;
 showForm('<h2>Исключить: '+esc(u.name)+'</h2><p>Человек сразу потеряет вход, его уберут из команд и наблюдателей объектов. Назначенные ему задачи ('+n+') перейдут выбранному человеку. Личные задачи останутся у него.</p><label>Кому передать задачи<select id="tm_to">'+opts(cand,state.me.id)+'</select></label><p class="notice">Вернуть человека можно кнопкой «Вернуть»: доступ откроется, но задачи и объекты вернуть придётся вручную.</p>',async()=>{
  const r=await call('userExclude',{id:u.id,toId:$('tm_to').value});
  $('dialog').close();
  await reload();
  toast('Исключён(а): '+u.name+'. Передано задач: '+((r&&r.moved)||0)+(r&&r.to?' ('+r.to+')':''));
 });
 const ok=document.querySelector('#editform .footer .primary');
 if(ok)ok.textContent='Исключить';
}
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('[data-tm]');
 if(!b||!b.dataset.id)return;
 const u=(state.users||[]).find(x=>x.id===b.dataset.id);
 if(!u)return;
 const a=b.dataset.tm;
 if(a==='exclude')exclude(u);
 else if(a==='reqdel'){
  if(!confirm('Удалить заявку «'+u.name+'» ('+u.email+')? Доступ не откроется. Человек сможет подать заявку заново.'))return;
  guarded(async()=>{await call('requestDelete',{id:u.id});await reload();toast('Заявка удалена');});
 }else if(a==='restore'){
  if(!confirm('Вернуть доступ: '+u.name+'? Задачи и объекты автоматически не вернутся.'))return;
  guarded(async()=>{await call('userRestore',{id:u.id});await reload();toast('Доступ возвращён: '+u.name);});
 }
});
const oR=render;
render=function(){
 const r=oR.apply(this,arguments);
 try{decorate();}catch(e){}
 return r;
};
})();
