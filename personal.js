'use strict';
(function(){
const D=window.DIO;
let ensuring=false;

const om=manage;
manage=function(pid){
 if(om(pid))return true;
 const p=state&&state.projects.find(x=>x.id===pid);
 if(!p||String(p.name).indexOf('Личное: ')!==0)return false;
 const m=arr(p.members);
 return m.length===1&&m[0]===state.me.id;
};

function decorate(){
 if(!state||view!=='tasks'||!state.me||state.me.role==='observer')return;
 const tb=document.querySelector('#content .toolbar');
 if(!tb||tb.querySelector('[data-personal]'))return;
 const b=document.createElement('button');
 b.type='button';b.dataset.personal='1';b.className='primary';b.textContent='+ Личная задача';
 tb.appendChild(b);
}

document.addEventListener('click',e=>{
 const b=e.target.closest('[data-personal]');
 if(!b||ensuring)return;
 ensuring=true;
 (async()=>{
  try{
   const id=await D.fcall('personalEnsure',{},60000);
   if(!state.projects.some(p=>p.id===id))await reload();
   taskForm(null,null,id);
  }catch(err){toast(err.message||String(err));}
  finally{ensuring=false;}
 })();
});

const oRender=render;
render=function(){const r=oRender.apply(this,arguments);try{decorate();}catch(e){}return r;};
if(state)render();
})();
