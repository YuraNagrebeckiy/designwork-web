'use strict';
(function(){
const LABEL={admin:'Админ',manager:'Руководитель',employee:'Сотрудник',foreman:'Прораб',observer:'Наблюдатель (инвестор, клиент)'};
const ORDER=['admin','manager','employee','foreman','observer'];
const real=o=>(o&&(o.roleReal||o.role))||'';
const lab=r=>LABEL[r]||r;
let lastUser=null;

/* Старый код сайта знает три роли. Прораб ведёт себя как наблюдатель, руководитель как админ (для своего экрана)
   и как сотрудник (в списках других людей). Настоящая роль хранится в roleReal. Права всё равно проверяет сервер. */
function alias(o,isMe){
 if(!o||o.roleReal)return;
 o.roleReal=o.role;
 if(o.role==='foreman')o.role='observer';
 else if(o.role==='manager')o.role=isMe?'admin':'employee';
}
function normalize(){
 if(typeof state==='undefined'||!state||!state.me)return;
 alias(state.me,true);
 (state.users||[]).forEach(u=>alias(u,false));
}
function fixForm(){
 const s=document.getElementById('u_role');
 if(s&&lastUser){
  s.innerHTML=ORDER.map(v=>'<option value="'+v+'">'+LABEL[v]+'</option>').join('');
  s.value=real(lastUser)||'employee';
 }
 const p1=document.getElementById('pw1'),p2=document.getElementById('pw2');
 if(p1&&p2){
  p1.minLength=4;p2.minLength=4;
  const n=document.querySelector('#editform .notice');
  if(n)n.textContent='От 4 символов. Дальше вы будете входить по email и паролю.';
 }
 if(typeof state!=='undefined'&&state&&state.me&&real(state.me)==='manager'){
  document.querySelectorAll('#editform [data-action="projectDelete"]').forEach(b=>{const p=b.closest('p');(p||b).remove();});
 }
}
function fix(){
 if(typeof state==='undefined'||!state||!state.me)return;
 const me=real(state.me),idEl=document.getElementById('identity');
 if(idEl)idEl.textContent=state.me.name+' • '+lab(me);
 if(view==='users'){
  document.querySelectorAll('#content .grid .panel').forEach((p,i)=>{
   const b=p.querySelector('.badge'),u=(state.users||[])[i];
   if(b&&u)b.textContent=lab(real(u));
  });
 }
 if(me==='manager'){
  document.querySelectorAll('#nav [data-view="users"]').forEach(b=>b.remove());
 }
 fixForm();
}
const oRender=render;
render=function(){
 try{
  normalize();
  const me=typeof state!=='undefined'&&state&&state.me?real(state.me):'';
  if(me==='foreman'&&view==='tasks')view='projects';
  if(me==='manager'&&view==='users')view='projects';
 }catch(e){}
 const r=oRender.apply(this,arguments);
 try{fix();}catch(e){}
 return r;
};
const oShow=showForm;
showForm=function(){const r=oShow.apply(this,arguments);try{fixForm();}catch(e){}return r;};
const oUF=userForm;
userForm=function(u){lastUser=u;return oUF.apply(this,arguments);};
if(typeof state!=='undefined'&&state)try{render();}catch(e){}
})();
