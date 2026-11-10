'use strict';
(function(){
const ROLE={admin:'Руководитель',employee:'Сотрудник',observer:'Наблюдатель'};
const st=document.createElement('style');
st.textContent='.pick{max-height:230px;overflow:auto;border:1px solid var(--line);border-radius:10px;padding:4px 10px;margin:4px 0 8px}.pick label.check{margin:6px 0}.pick small{color:var(--muted)}#editform h3{margin:14px 0 2px}';
document.head.appendChild(st);
const pick=(nm,list,sel,empty)=>list.length?`<div class="pick">${list.map(u=>`<label class="check"><input type="checkbox" name="${nm}" value="${esc(u.id)}" ${sel.includes(u.id)?'checked':''}><span>${esc(u.name)} <small>${esc(u.email||ROLE[u.role]||'')}</small></span></label>`).join('')}</div>`:`<p class="notice">${empty}</p>`;
const checked=nm=>[...document.querySelectorAll('#editform input[name="'+nm+'"]:checked')].map(i=>i.value);
projectForm=function(p){
 const emps=state.users.filter(u=>u.role==='employee'&&u.approved==='true'),obs=state.users.filter(u=>u.role==='observer'&&u.approved==='true'),templates=[...new Set(state.templates.map(t=>t.templateId))];
 showForm(`<h2>${p?'Настройки объекта':'Объект по шаблону'}</h2>${input('Название объекта','p_name',p?.name||'','text','required maxlength="160"')}${!p?`${input('Дата старта','p_start',today(),'date','required')}<label>Шаблон<select id="p_template">${templates.map(s=>`<option>${esc(s)}</option>`).join('')}</select></label><label>Первоначальный исполнитель всех этапов<select id="p_assignee"><option value="">Назначить позже</option>${opts(state.users.filter(u=>u.approved==='true'&&u.role!=='observer'),'')}</select></label>`:''}<h3>Участники объекта</h3><small>Отметьте сотрудников, которые ведут объект: они видят все задачи, могут добавлять, менять, переносить и удалять их. Остальные сотрудники видят только свои задачи.</small>${pick('p_members',emps,arr(p?.members),'Нет одобренных сотрудников. Откройте «Команда» в меню ⚙ и одобрите доступ.')}<h3>Право просмотра хода работы</h3><small>Наблюдатели (например, заказчик) видят все задачи, сроки и ответственных, но ничего не меняют.</small>${pick('p_viewers',obs,arr(p?.viewers),'Пока нет наблюдателей. Человек регистрируется, затем в «Команда» → «Настроить доступ» выберите роль «Наблюдатель» и одобрите доступ.')}${p?`<p><button type="button" class="danger" data-action="projectDelete" data-id="${esc(p.id)}">Удалить объект и его задачи</button></p>`:''}`,async()=>{
  const payload={name:$('p_name').value,viewers:checked('p_viewers'),members:checked('p_members')};
  if(p)Object.assign(payload,{id:p.id,version:p.version});else Object.assign(payload,{start:$('p_start').value,templateId:$('p_template').value,assigneeId:$('p_assignee').value});
  const id=await call(p?'projectUpdate':'projectCreate',payload);
  if(!p)projectId=id;
  $('dialog').close();await reload();
 });
};
function decorate(){
 if(!state||view!=='projects'||!admin())return;
 if(!projectId){
  document.querySelectorAll('#content article.panel').forEach(a=>{
   const b=a.querySelector('[data-action="openProject"]');if(!b)return;
   const p=state.projects.find(x=>x.id===b.dataset.id);if(!p)return;
   const n=document.createElement('p');n.className='notice';n.textContent='Просмотр хода работы: '+(arr(p.viewers).map(name).join(', ')||'никого');
   a.insertBefore(n,b);
   const s=document.createElement('button');s.type='button';s.textContent='Участники и доступ';s.dataset.pset=p.id;b.after(s);
  });
 }else{
  const p=state.projects.find(x=>x.id===projectId),m=document.querySelector('#content .muted');
  if(p&&m)m.textContent+=' • Просмотр: '+(arr(p.viewers).map(name).join(', ')||'никого');
 }
}
const oRender=render;
render=function(){const r=oRender.apply(this,arguments);try{decorate();}catch(e){}return r;};
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('[data-pset]');if(!b)return;
 const p=state.projects.find(x=>x.id===b.dataset.pset);if(p)projectForm(p);
});
if(state)render();
})();
