'use strict';
(function(){
const st=document.createElement('style');
st.textContent='#vac_box{margin:10px 0}#vac_box .vrow{align-items:end;margin:4px 0}';
document.head.appendChild(st);
function insBtns(){
 if(!state||!admin()||view!=='projects'||!projectId)return;
 document.querySelectorAll('#content .tree .card[data-drag]').forEach(c=>{
  const t=state.tasks.find(x=>x.id===c.dataset.drag),a=c.querySelector('.actions');
  if(!t||t.parentId||!a||a.querySelector('[data-ins]'))return;
  const b=document.createElement('button');b.type='button';b.dataset.ins=t.id;b.textContent='Вставить после';a.appendChild(b);
 });
}
const oRender=render;
render=function(){const r=oRender.apply(this,arguments);try{insBtns();}catch(e){}return r;};
function insertUi(t,parent){
 if(t||parent||!$('dialog').open||!$('f_project')||!$('f_title')||$('f_ins'))return;
 const lab=document.createElement('label');
 lab.innerHTML='Вставить после задачи (связи сохранятся)<select id="f_ins"></select>';
 const fill=()=>{
  const pid=$('f_project').value,tops=state.tasks.filter(x=>x.projectId===pid&&!x.parentId).sort((a,b)=>a.end.localeCompare(b.end));
  $('f_ins').innerHTML='<option value="">— не вставлять —</option>'+tops.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.title)+' ('+x.start.slice(8)+'.'+x.start.slice(5,7)+'–'+x.end.slice(8)+'.'+x.end.slice(5,7)+')</option>').join('');
 };
 fill();
 const anchor=$('f_parent')?$('f_parent').closest('label'):null;
 if(anchor)anchor.before(lab);else $('f_title').closest('label').after(lab);
 $('f_project').addEventListener('change',fill);
 $('f_ins').addEventListener('change',()=>{
  const a=state.tasks.find(x=>x.id===$('f_ins').value);if(!a)return;
  const s=$('f_start'),e=$('f_end'),dur=Math.max(0,days(s.value||a.end,e.value||a.end)),ns=plus(a.end,1);
  s.value=ns;e.value=plus(ns,dur);
  if($('f_parent'))$('f_parent').value='';
  if($('f_deps'))[...$('f_deps').options].forEach(o=>{o.selected=(o.value===a.id);});
  if($('f_lag'))$('f_lag').value=0;
 });
}
const oTF=taskForm;
taskForm=function(t,parent,pre){oTF.apply(this,arguments);try{insertUi(t,parent);}catch(e){}};
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('[data-ins]');if(!b)return;
 const a=state.tasks.find(x=>x.id===b.dataset.ins);if(!a)return;
 taskForm(null,null,a.projectId);
 const s=$('f_ins');if(s){s.value=a.id;s.dispatchEvent(new Event('change'));}
});
const oUF=userForm;
userForm=function(u){
 oUF.apply(this,arguments);
 try{
  if(!$('dialog').open||$('vac_box'))return;
  const foot=$('editform').querySelector('.footer');if(!foot)return;
  const vs=(state.vacations&&state.vacations[u.id])||arr(u.vacations);
  const row=v=>'<div class="vrow formgrid"><label>С<input class="vf" type="date" value="'+esc(v.from||'')+'"></label><label>По<input class="vt" type="date" value="'+esc(v.to||'')+'"></label><button type="button" data-vdel="1">Убрать</button></div>';
  const box=document.createElement('div');box.id='vac_box';
  box.innerHTML='<h3>Отпуск</h3><small>Периоды показываются на графиках: «Отпуск — Имя».</small><div id="vac_rows">'+vs.map(row).join('')+'</div><button type="button" id="vac_add">+ Добавить период</button>';
  foot.before(box);
  box.addEventListener('click',e=>{
   if(e.target.id==='vac_add')$('vac_rows').insertAdjacentHTML('beforeend',row({}));
   else if(e.target.dataset&&e.target.dataset.vdel)e.target.closest('.vrow').remove();
  });
 }catch(e){}
};
const oCall=call;
call=function(action,payload){
 if(action==='taskCreate'&&$('dialog').open&&$('f_ins')&&$('f_ins').value)payload=Object.assign({},payload,{insertAfter:$('f_ins').value});
 if(action==='userSave'&&$('vac_box')){
  const vacs=[...document.querySelectorAll('#vac_box .vrow')].map(r=>({from:r.querySelector('.vf').value,to:r.querySelector('.vt').value})).filter(v=>v.from&&v.to);
  const me=this;
  return oCall.call(me,'vacationSave',{id:payload.id,vacations:vacs}).then(()=>oCall.call(me,action,payload));
 }
 return oCall.apply(this,arguments);
};
if(state)render();
})();
