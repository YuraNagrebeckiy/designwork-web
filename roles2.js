'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined'||typeof state==='undefined')return;
const LAB={admin:'Админ',manager:'Руководитель',employee:'Сотрудник',observer:'Наблюдатель'};
const real=u=>(u&&(u.roleReal||u.role))||'';
const meReal=()=>(state&&state.me)?real(state.me):'';
let lastUser=null;
const st=document.createElement('style');
st.textContent='#content .viewonly{margin:6px 0 10px;padding:8px 12px;border-radius:10px;background:var(--line)}';
document.head.appendChild(st);
function labels(){
 if(!state||!state.me)return;
 const idEl=document.getElementById('identity');
 if(idEl)idEl.textContent=state.me.name+' • '+(LAB[meReal()]||meReal());
 if(view==='users'){
  document.querySelectorAll('#content .panel [data-action="userEdit"]').forEach(eb=>{
   const p=eb.closest('.panel'),u=(state.users||[]).find(x=>x.id===eb.dataset.id),b=p&&p.querySelector('.badge');
   if(b&&u)b.textContent=LAB[real(u)]||real(u);
  });
  if(meReal()==='manager'){
   document.querySelectorAll('#content .panel [data-action="userEdit"],#content .panel [data-tm]').forEach(b=>b.remove());
   const c=document.getElementById('content');
   if(c&&!c.querySelector('.viewonly'))c.insertAdjacentHTML('afterbegin','<p class="notice viewonly">Режим просмотра: заявки, роли и исключение участников доступны только админу.</p>');
  }
 }
}
function fixForm(){
 const s=document.getElementById('u_role');
 if(s&&lastUser){
  s.innerHTML=Object.keys(LAB).map(v=>'<option value="'+v+'">'+LAB[v]+'</option>').join('');
  s.value=real(lastUser)||'employee';
 }
 if(meReal()==='manager'){
  document.querySelectorAll('#editform [data-action="projectDelete"]').forEach(b=>{const p=b.closest('p');(p||b).remove();});
 }
}
const oR=render;
render=function(){
 const r=oR.apply(this,arguments);
 try{labels();}catch(e){}
 return r;
};
const oShow=showForm;
showForm=function(){
 const r=oShow.apply(this,arguments);
 try{fixForm();}catch(e){}
 return r;
};
const oUF=userForm;
userForm=function(u){lastUser=u;return oUF.apply(this,arguments);};
if(state)try{render();}catch(e){}
})();
