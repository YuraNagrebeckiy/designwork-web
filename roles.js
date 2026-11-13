'use strict';
(function(){
const LABEL={admin:'Админ',manager:'Руководитель',employee:'Сотрудник',foreman:'Прораб',observer:'Наблюдатель (инвестор, клиент)'};
const lab=r=>LABEL[r]||r;
function fixForm(){
 const s=document.getElementById('u_role');
 if(!s)return;
 [...s.options].forEach(o=>{if(LABEL[o.value])o.textContent=LABEL[o.value];});
}
function fix(){
 if(typeof state==='undefined'||!state||!state.me)return;
 const id=document.getElementById('identity');
 if(id)id.textContent=state.me.name+' • '+lab(state.me.role);
 document.querySelectorAll('#content .badge').forEach(b=>{const t=b.textContent.trim();if(LABEL[t])b.textContent=LABEL[t];});
 fixForm();
}
const oRender=render;
render=function(){const r=oRender.apply(this,arguments);try{fix();}catch(e){}return r;};
const oShow=showForm;
showForm=function(){const r=oShow.apply(this,arguments);try{fixForm();}catch(e){}return r;};
if(typeof state!=='undefined'&&state)try{fix();}catch(e){}
})();
