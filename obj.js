'use strict';
(function(){
const PAL=['#5265df','#e5484d','#2e9e6b','#c9822b','#9b6bd3','#2b9fc9','#b8527a','#6b7a2e'];
const st=document.createElement('style');
st.textContent='.objtag{display:inline-block;max-width:100%;margin:0 0 4px;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:700;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:top}';
document.head.appendChild(st);
function tag(){
 if(!state||view!=='tasks')return;
 document.querySelectorAll('#content .card[data-drag]').forEach(c=>{
  if(c.querySelector('.objtag'))return;
  const t=state.tasks.find(x=>x.id===c.dataset.drag);if(!t)return;
  const i=Math.max(0,state.projects.findIndex(p=>p.id===t.projectId));
  const b=document.createElement('div');b.className='objtag';b.style.background=PAL[i%PAL.length];
  b.textContent='Объект: '+projectName(t.projectId);b.title=projectName(t.projectId);
  c.insertBefore(b,c.firstChild);
 });
}
const oRender=render;
render=function(){const r=oRender.apply(this,arguments);try{tag();}catch(e){}return r;};
if(state)render();
})();
