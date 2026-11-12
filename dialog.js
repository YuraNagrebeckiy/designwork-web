'use strict';
(function(){
const st=document.createElement('style');
st.textContent=`#dialog{padding:14px 16px!important;max-width:540px}
#editform h2{margin:0 0 6px;font-size:17px}
#editform h3{margin:6px 0 2px;font-size:14px}
#editform label{margin:7px 0 2px;font-size:12px}
#editform input,#editform select,#editform textarea{min-height:34px;padding:5px 9px}
#editform select[multiple]{min-height:0;height:78px}
#editform textarea{min-height:56px;height:56px}
#editform .kseg{margin:0 0 6px}
#editform .kseg .seg button{min-height:34px;padding:4px 8px;font-size:13px}
#editform .formgrid{gap:8px;grid-template-columns:1fr 1fr}
#editform .pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:0 8px;max-height:96px;overflow:auto;border:1px solid var(--line);border-radius:8px;padding:4px 8px}
#editform .pick label.check{margin:2px 0}
#editform small,#editform .notice{font-size:11px;margin:2px 0}
#editform .footer{margin-top:10px;position:sticky;bottom:0;background:var(--panel);padding-top:8px}
.qrow{display:flex;gap:6px;margin:0 0 8px;flex-wrap:wrap}
.qrow button{flex:1 1 150px;min-height:34px;padding:4px 10px;font-size:13px;border-radius:999px}
@media(min-width:761px){#editform input,#editform select,#editform textarea{font-size:14px}}`;
document.head.appendChild(st);
const short=s=>{s=String(s||'');return s.length>24?s.slice(0,24)+'…':s;};
function quick(t){
 const dlg=$('dialog');
 if(!t||!dlg.open||!state||!$('f_title')||dlg.querySelector('.qrow'))return;
 if(!manage(t.projectId))return;
 const by=new Map(state.tasks.map(x=>[x.id,x]));
 const par=t.parentId?by.get(t.parentId):null;
 const canSub=depthOf(t)<2;
 const row=document.createElement('div');
 row.className='qrow';
 row.innerHTML=(canSub?'<button type="button" class="primary" data-q="sub">+ Подзадача к «'+esc(short(t.title))+'»</button>':'')+'<button type="button" data-q="new">+ Новая задача'+(par?' рядом':'')+'</button>';
 const anchor=dlg.querySelector('.kseg');
 if(anchor)anchor.after(row);
 else $('f_title').closest('label').before(row);
 row.addEventListener('click',e=>{
  const b=e.target.closest('button[data-q]');
  if(!b)return;
  const dirty=$('f_title').value!==t.title||($('f_start')&&$('f_start').value!==t.start)||($('f_end')&&$('f_end').value!==t.end);
  if(dirty&&!confirm('Несохранённые изменения будут потеряны. Продолжить?'))return;
  dlg.close();
  if(b.dataset.q==='sub')taskForm(null,t);
  else taskForm(null,par||null,t.projectId);
 });
}
const oTF=taskForm;
taskForm=function(t,parent,pre){
 oTF.apply(this,arguments);
 try{quick(t);}catch(e){}
};
})();
