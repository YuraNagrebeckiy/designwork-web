'use strict';
(function(){
const N=window.studioNotify||{};
const ROLE={admin:'Руководитель',employee:'Сотрудник',observer:'Наблюдатель'};
const TYPES=[
 ['house','Архитектура дома','Генплан → планы этажей, чердака, кровли → фасады → разрезы → визуализации экстерьера.'],
 ['flat','Дизайн квартиры','Сводные планы этажа (вся инженерия), затем цикл по каждой комнате: развёртка → изометрия → 3D → спецификация мебели. В конце экспликация материалов.'],
 ['public','Дизайн общественных пространств','Сводные планы на весь объём, инженерия, единый массив разверток и изометрий, узлы ГКЛ и чертежи нестандартной мебели.']
];
const ROOMS=['Прихожая','Коридор','Гостиная','Кухня','Кухня-гостиная','Спальня','Детская','Кабинет','Гардеробная','Ванная','Санузел','Балкон / лоджия'];
const DEF_ROOMS=['Прихожая','Гостиная','Кухня','Спальня','Ванная','Санузел'];
const st=document.createElement('style');
st.textContent=`.pick{max-height:230px;overflow:auto;border:1px solid var(--line);border-radius:10px;padding:4px 10px;margin:4px 0 8px}.pick label.check{margin:6px 0}.pick small{color:var(--muted)}#editform h3{margin:14px 0 2px}
.card{padding:8px 10px!important;margin:6px 0!important;border-radius:10px!important}.card .row{gap:8px!important;align-items:center}.card h3{font-size:15px!important;margin:0!important;line-height:1.25}.card .meta{font-size:12px!important;line-height:1.35!important;margin:2px 0 4px!important}.card .actions{display:flex!important;flex-wrap:wrap;gap:6px!important;margin-top:4px!important}.card .actions select{font-size:16px;min-height:34px!important;padding:2px 8px!important;width:auto!important}.card .actions button{min-height:34px!important;padding:3px 10px!important;font-size:14px!important}.card p.notice,.card p.error{margin:2px 0!important;font-size:12px!important}.card input[type=checkbox]{width:20px;height:20px}
.prog{height:6px;border-radius:4px;background:var(--line);overflow:hidden;margin:4px 0 8px}.prog i{display:block;height:100%;background:var(--accent)}.rd{color:#e5484d;font-size:12px;font-weight:700}`;
document.head.appendChild(st);
const pick=(nm,list,sel,empty)=>list.length?`<div class="pick">${list.map(u=>`<label class="check"><input type="checkbox" name="${nm}" value="${esc(u.id)}" ${sel.includes(u.id)?'checked':''}><span>${esc(u.name)} <small>${esc(u.email||ROLE[u.role]||'')}</small></span></label>`).join('')}</div>`:`<p class="notice">${empty}</p>`;
const checked=nm=>[...document.querySelectorAll('#editform input[name="'+nm+'"]:checked')].map(i=>i.value);
function types(){const a=TYPES.slice();if(state.templates&&state.templates.some(t=>t.templateId==='design'))a.push(['design','Общий: 6 этапов студии','Обмер и ТЗ → Планировка → Концепция → Рабочка → Комплектация → Надзор.']);return a;}
projectForm=function(p){
 const emps=state.users.filter(u=>u.role==='employee'&&u.approved==='true'),obs=state.users.filter(u=>u.role==='observer'&&u.approved==='true'),tp=types();
 const roomList=ROOMS.map(r=>({id:r,name:r,email:''}));
 showForm(`<h2>${p?'Настройки объекта':'Новый объект'}</h2>${input('Название объекта','p_name',p?.name||'','text','required maxlength="160"')}${!p?`${input('Дата старта','p_start',today(),'date','required')}<label>Тип проекта<select id="p_type">${tp.map(t=>`<option value="${t[0]}">${esc(t[1])}</option>`).join('')}</select></label><p class="notice" id="p_hint"></p><div id="p_roomsbox"><h3>Помещения квартиры</h3><small>Для каждого помещения будет свой блок задач.</small>${pick('p_rooms',roomList,DEF_ROOMS,'')}<label>Другие помещения (через запятую)<input id="p_rooms_more" maxlength="300"></label></div><label>Первоначальный исполнитель всех этапов<select id="p_assignee"><option value="">Назначить позже</option>${opts(state.users.filter(u=>u.approved==='true'&&u.role!=='observer'),'')}</select></label>`:''}<h3>Участники объекта</h3><small>Отметьте сотрудников, которые ведут объект: они видят все задачи, могут добавлять, менять, переносить и удалять их. Остальные сотрудники видят только свои задачи.</small>${pick('p_members',emps,arr(p?.members),'Нет одобренных сотрудников. Откройте «Команда» в меню ⚙ и одобрите доступ.')}<h3>Право просмотра хода работы</h3><small>Наблюдатели (например, заказчик) видят все задачи, сроки и ответственных, но ничего не меняют.</small>${pick('p_viewers',obs,arr(p?.viewers),'Пока нет наблюдателей. Человек регистрируется, затем в «Команда» → «Настроить доступ» выберите роль «Наблюдатель» и одобрите доступ.')}${p?`<p><button type="button" class="danger" data-action="projectDelete" data-id="${esc(p.id)}">Удалить объект и его задачи</button></p>`:''}`,async()=>{
  const payload={name:$('p_name').value,viewers:checked('p_viewers'),members:checked('p_members')};
  if(p)Object.assign(payload,{id:p.id,version:p.version});
  else{
   const type=$('p_type').value;
   Object.assign(payload,{start:$('p_start').value,templateId:type,assigneeId:$('p_assignee').value,rooms:type==='flat'?checked('p_rooms').concat($('p_rooms_more').value.split(',').map(s=>s.trim()).filter(Boolean)):[]});
  }
  const id=await call(p?'projectUpdate':'projectCreate',payload);
  if(!p)projectId=id;
  $('dialog').close();await reload();
 });
 if(!p){
  const sync=()=>{const t=tp.find(x=>x[0]===$('p_type').value);$('p_hint').textContent=t?t[2]:'';$('p_roomsbox').style.display=$('p_type').value==='flat'?'':'none';};
  $('p_type').onchange=sync;sync();
 }
};
function pct(pid){
 if(state.progress&&state.progress[pid]!==undefined)return state.progress[pid];
 const ts=state.tasks.filter(t=>t.projectId===pid),par=new Set(ts.map(t=>t.parentId).filter(Boolean));
 let tot=0,d=0;ts.forEach(t=>{if(par.has(t.id))return;const w=Math.max(1,days(t.start,t.end)+1);tot+=w;if(t.status==='Готово')d+=w;});
 return tot?Math.round(d*100/tot):0;
}
const bar=n=>{const d=document.createElement('div');d.className='prog';d.innerHTML='<i style="width:'+n+'%"></i>';return d;};
const unread=pid=>!!(N.chatUnread&&N.chatUnread(pid));
function decorate(){
 if(!state)return;
 document.querySelectorAll('#content .card').forEach(c=>{
  const m=c.querySelector('.meta');
  if(m&&!m.dataset.c){m.dataset.c='1';m.innerHTML=m.innerHTML.replace(/(\d{4})-(\d{2})-(\d{2})/g,'$3.$2').replace(/<br\s*\/?>/,' • ').replace(/ — /g,'–').replace('подзадачи ','↳ ');}
  const er=c.querySelector('p.error');
  if(er){if(m){const w=document.createElement('span');w.textContent=' ⚠';w.title=er.textContent;m.appendChild(w);}er.remove();}
  c.querySelectorAll('p.notice').forEach(n=>{if(n.textContent.indexOf('Календарь: ожидает')===0)n.remove();});
  const t=state.tasks.find(x=>x.id===c.dataset.drag),a=c.querySelector('.actions');
  if(t&&a&&!a.querySelector('[data-chat]')){const b=document.createElement('button');b.type='button';b.dataset.chat=t.projectId;b.title='Чат объекта';b.innerHTML='💬'+(unread(t.projectId)?'<b class="rd">●</b>':'');a.appendChild(b);}
 });
 const nav=document.querySelector('#nav [data-view="projects"]');
 if(nav&&state.projects.some(p=>unread(p.id))&&!nav.querySelector('.rd'))nav.insertAdjacentHTML('beforeend',' <b class="rd">●</b>');
 if(view!=='projects')return;
 if(!projectId){
  document.querySelectorAll('#content article.panel').forEach(a=>{
   const b=a.querySelector('[data-action="openProject"]');if(!b)return;
   const p=state.projects.find(x=>x.id===b.dataset.id);if(!p)return;
   const n=pct(p.id),mu=a.querySelector('.muted');
   if(mu){mu.textContent='Готовность: '+n+'%';mu.after(bar(n));}
   const h=a.querySelector('h2');if(h&&unread(p.id))h.insertAdjacentHTML('beforeend',' <b class="rd">●</b>');
   if(admin()){
    const v=document.createElement('p');v.className='notice';v.textContent='Просмотр хода работы: '+(arr(p.viewers).map(name).join(', ')||'никого');a.insertBefore(v,b);
    const s=document.createElement('button');s.type='button';s.textContent='Участники и доступ';s.dataset.pset=p.id;b.after(s);
   }
   const c=document.createElement('button');c.type='button';c.dataset.chat=p.id;c.textContent='💬 Чат';b.after(c);
  });
 }else{
  const p=state.projects.find(x=>x.id===projectId),mu=document.querySelector('#content .muted');
  if(p&&mu){const n=pct(p.id);mu.textContent+=' • Готовность: '+n+'%'+(admin()?' • Просмотр: '+(arr(p.viewers).map(name).join(', ')||'никого'):'');mu.after(bar(n));}
 }
}
const oRender=render;
render=function(){const r=oRender.apply(this,arguments);try{decorate();}catch(e){}return r;};
document.addEventListener('click',e=>{
 const ch=e.target.closest&&e.target.closest('[data-chat]');
 if(ch){const v=view;window.studioOpenChat(ch.dataset.chat);if(v==='tasks'){view='tasks';render();}return;}
 const b=e.target.closest&&e.target.closest('[data-pset]');if(!b)return;
 const p=state.projects.find(x=>x.id===b.dataset.pset);if(p)projectForm(p);
});
if(state)render();
})();
