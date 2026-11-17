'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined')return;
const g=id=>document.getElementById(id);
function addBtn(){
 const c=g('content');
 if(!c)return;
 c.querySelectorAll('.tplbar').forEach(bar=>{
  if(bar.querySelector('[data-smrk="log"]'))return;
  const bld=bar.querySelector('[data-smrk="bld"]');
  if(!bld)return;
  const b=document.createElement('button');
  b.type='button';
  b.className=bld.className;
  b.dataset.smrk='log';
  b.textContent='СМР Здание из сруба';
  bld.after(b);
 });
}
const oR=render;
render=function(){
 const r=oR.apply(this,arguments);
 setTimeout(()=>{try{addBtn();}catch(e){}},0);
 return r;
};
const isEmpty=()=>!!document.querySelector('[data-smode="empty"].on');
function sync(){
 const own=g('smr_own');
 if(!own)return;
 const e=isEmpty();
 own.classList.toggle('hidden',!e);
 const sum=g('smr_sum');
 if(sum)sum.classList.toggle('hidden',e);
 const st=g('smr_start'),en=g('smr_end');
 if(e&&st&&en&&!en.dataset.touched&&st.value)en.value=plus(st.value,6);
}
function setup(){
 const sum=g('smr_sum');
 if(sum&&!g('smr_own')){
  sum.insertAdjacentHTML('afterend','<div id="smr_own" class="hidden"><label>Название подрядчика или работы<input id="smr_name" type="text" maxlength="120" placeholder="Например: Монтаж лестницы"></label><label>Дата окончания<input id="smr_end" type="date"></label><p class="notice">В «Стройке» появится отдельный блок с этим названием и сроками, внутрь можно добавлять подзадачи. Так можно добавить каждого подрядчика.</p></div>');
 }
 sync();
}
async function srv(action,payload){
 const r=await transport({action:action,payload:payload||{},token:token});
 if(!r||!r.ok){const m=String(r&&r.error||'Сервер не ответил');if(m.indexOf('AUTH:')===0)signoutLocal();throw Error(m);}
 return r.data;
}
async function custom(){
 const name=(g('smr_name').value||'').trim(),s=g('smr_start').value,e=g('smr_end').value;
 if(!name)throw Error('Введите название подрядчика или работы');
 if(!s)throw Error('Укажите дату начала');
 if(!e)throw Error('Укажите дату окончания');
 if(e<s)throw Error('Дата окончания раньше даты начала');
 const id=await srv('taskCreate',{projectId:projectId,parentId:'',section:'build',title:name,start:s,end:e,assigneeId:'',deps:[],lag:0,kind:'stage',calendarEnabled:false});
 try{await srv('sectionSet',{id:id,section:'build'});}catch(x){}
 try{await reload();}catch(x){}
 try{render();}catch(x){}
}
const oSF=showForm;
showForm=function(html,onSave){
 let cb=onSave;
 if(typeof html==='string'&&html.indexOf('smr smrf')>-1&&typeof onSave==='function'){
  cb=async function(){
   if(isEmpty())return custom();
   return onSave.apply(this,arguments);
  };
 }
 const args=[html,cb].concat([].slice.call(arguments,2));
 const r=oSF.apply(this,args);
 try{setup();}catch(e){}
 setTimeout(()=>{try{setup();}catch(e){}},0);
 return r;
};
document.addEventListener('click',e=>{
 if(e.target&&e.target.closest&&e.target.closest('[data-smode]'))setTimeout(sync,0);
});
document.addEventListener('change',e=>{
 if(e.target&&e.target.id==='smr_start')setTimeout(sync,0);
});
document.addEventListener('input',e=>{
 if(e.target&&e.target.id==='smr_end')e.target.dataset.touched='1';
});
if(typeof state!=='undefined'&&state)render();
})();
