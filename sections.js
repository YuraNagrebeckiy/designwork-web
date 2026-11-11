'use strict';
(function(){
const st=document.createElement('style');
st.textContent=`.sectabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px}
#content .sectabs button{border-radius:999px;padding:6px 16px}
#content .sectabs button.on{background:var(--accent);color:#fff;border-color:var(--accent)}
html[data-theme=dark] #content .sectabs button.on{color:#15171d}
.supplybox{border:1px dashed var(--line);border-radius:12px;padding:22px;color:var(--muted)}
#content .grid article.panel{cursor:pointer;transition:border-color .15s,box-shadow .15s}
#content .grid article.panel:hover{border-color:var(--accent);box-shadow:0 2px 10px rgba(16,24,40,.08)}
#content button.ico{min-width:34px;padding:6px;display:inline-flex;align-items:center;justify-content:center}
#content button.ico svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}`;
document.head.appendChild(st);

let sec='design',lastPid='';
const SEC=[['design','Проектирование'],['build','Стройка'],['supply','Комплектация']];
const ICON=`<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/></svg>`;
const secOf=t=>((state.sections||{})[t.id]==='build')?'build':'design';
window.secFilter=ts=>{
 if(!state||view!=='projects'||!projectId)return ts;
 return sec==='supply'?[]:ts.filter(t=>secOf(t)===sec);
};

function decorate(){
 if(!state||view!=='projects'||!projectId)return;
 const c=document.getElementById('content'),tb=c&&c.querySelector('.toolbar');
 if(!c||!tb)return;
 if(!c.querySelector('.sectabs')){
  tb.insertAdjacentHTML('afterend',`<div class='sectabs'>${SEC.map(s=>`<button type='button' data-sec='${s[0]}' class='${s[0]===sec?'on':''}'>${s[1]}</button>`).join('')}</div>`);
 }
 const pe=c.querySelector('[data-action=projectEdit]');
 if(pe&&!pe.classList.contains('ico')){
  pe.classList.add('ico');
  pe.title='Участники и доступ';
  pe.setAttribute('aria-label','Участники и доступ');
  pe.innerHTML=ICON;
 }
 if(sec==='supply'){
  const g=document.getElementById('ganttRoot');
  if(g)g.innerHTML=`<div class='supplybox'><h3>Комплектация</h3><p>Здесь будет учёт закупок и смет: позиции, компании в тендере, сметы, суммы и итоги. Раздел в разработке.</p></div>`;
  const tr=c.querySelector('.tree');
  if(tr)tr.innerHTML='';
 }
}

const oRender=render;
render=function(){
 if(projectId!==lastPid){lastPid=projectId;sec='design';}
 const full=state?state.tasks:null,on=!!(state&&view==='projects'&&projectId);
 let r;
 if(on)state.tasks=window.secFilter(full);
 try{r=oRender.apply(this,arguments);}
 finally{if(on)state.tasks=full;}
 try{decorate();}catch(e){}
 return r;
};

const oCall=call;
call=async function(action,payload){
 const r=await oCall.apply(this,arguments);
 if(action==='taskCreate'&&sec==='build'&&payload&&!payload.parentId&&typeof r==='string'){
  try{await oCall('sectionSet',{id:r,section:'build'});}
  catch(e){toast('Не удалось отнести задачу к стройке: '+(e.message||e));}
 }
 return r;
};

document.addEventListener('click',e=>{
 const b=e.target.closest('[data-sec]');
 if(b){sec=b.dataset.sec;render();return;}
 const a=e.target.closest('#content .grid article.panel');
 if(a&&!e.target.closest('button,a,input,select,textarea')){
  const o=a.querySelector('[data-action=openProject]');
  if(o)o.click();
 }
});

if(state)render();
})();
