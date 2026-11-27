'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined'||typeof state==='undefined')return;
const LAB={admin:'Админ',manager:'Руководитель',foreman:'Прораб',employee:'Сотрудник',observer:'Наблюдатель'};
const real=u=>(u&&(u.roleReal||u.role))||'';
const meReal=()=>(state&&state.me)?real(state.me):'';
const fm=()=>meReal()==='foreman';
let lastUser=null;
const st=document.createElement('style');
st.textContent='#content .viewonly{margin:6px 0 10px;padding:8px 12px;border-radius:10px;background:var(--line)}html.fm [data-chat],html.fm [data-sec="supply"],html.fm [data-sec="design"]{display:none!important}';
document.head.appendChild(st);
function foremanUi(){
 document.documentElement.classList.toggle('fm',fm());
 if(!fm())return;
 document.querySelectorAll('.sectabs button[data-sec="supply"],.sectabs button[data-sec="design"]').forEach(b=>{const w=b.closest('.sg');if(w)w.style.display='none';});
 document.querySelectorAll('#content button,#dialog button,#nav button').forEach(b=>{
  if(b.closest('.sectabs')||b.matches('.bar,[data-action="taskEdit"]'))return;
  const tx=b.textContent.trim();
  if(tx.length<=24&&/чат|мудборд|файл|комплект|доска|💬|📎/i.test(tx))b.style.display='none';
 });
 if(view==='projects'&&projectId){
  const bb=document.querySelector('.sectabs button[data-sec="build"]');
  if(bb&&!bb.classList.contains('on'))bb.click();
 }
}
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
function addStaff(p){
 if(typeof admin==='function'&&!admin())return;
 const first=document.querySelector('#editform input[name="p_members"]'),box=first&&first.closest('.pick');
 if(!box)return;
 const sel=(p&&p.members&&typeof arr==='function')?arr(p.members):[];
 const staff=(state.users||[]).filter(u=>u.approved==='true'&&!u.excluded&&['admin','manager','foreman'].indexOf(real(u))>=0);
 staff.sort((a,b)=>['admin','manager','foreman'].indexOf(real(b))-['admin','manager','foreman'].indexOf(real(a)));
 staff.forEach(u=>{
  const r=real(u);
  let i=box.querySelector('input[value="'+u.id+'"]');
  if(!i){
   const l=document.createElement('label');
   l.className='check';
   i=document.createElement('input');i.type='checkbox';i.name='p_members';i.value=u.id;i.checked=sel.indexOf(u.id)>=0;
   const sp=document.createElement('span');sp.appendChild(document.createTextNode(u.name+' '));
   const sm=document.createElement('small');sm.textContent=LAB[r]||r;sp.appendChild(sm);
   l.appendChild(i);l.appendChild(sp);
   if(r==='foreman')box.appendChild(l);else box.insertBefore(l,box.firstChild);
  }else{
   const sm=i.closest('label').querySelector('small');
   if(sm)sm.textContent=LAB[r]||r;
  }
 });
}
if(typeof canEdit==='function'){
 const oCE=canEdit;
 canEdit=function(t){return fm()?true:oCE.apply(this,arguments);};
}
if(typeof window.studioOpenChat==='function'){
 const oOC=window.studioOpenChat;
 window.studioOpenChat=function(){if(fm())return;return oOC.apply(this,arguments);};
}
const oR=render;
render=function(){
 const r=oR.apply(this,arguments);
 try{labels();}catch(e){}
 try{foremanUi();}catch(e){}
 return r;
};
const oShow=showForm;
showForm=function(){
 const r=oShow.apply(this,arguments);
 try{fixForm();}catch(e){}
 try{foremanUi();}catch(e){}
 return r;
};
const oUF=userForm;
userForm=function(u){lastUser=u;return oUF.apply(this,arguments);};
if(typeof projectForm==='function'){
 const oPF=projectForm;
 projectForm=function(p){const r=oPF.apply(this,arguments);try{addStaff(p);}catch(e){}return r;};
}
if(state)try{render();}catch(e){}
})();
