'use strict';
(function(){
const st=document.createElement('style');
st.textContent=`.gantt .grow:not(.ghead) .track{cursor:cell}.ghint{margin:6px 0 0;font-size:12px;color:var(--muted)}`;
document.head.appendChild(st);

function minDate(){
 const all=state.tasks.filter(t=>t.projectId===projectId),ts=window.secFilter?window.secFilter(all):all;
 if(!ts.length)return '';
 return plus(ts.reduce((a,t)=>t.start<a?t.start:a,ts[0].start),-1);
}

document.addEventListener('click',e=>{
 const tr=e.target.closest('.gantt .grow:not(.ghead) .track');
 if(!tr||e.target.closest('.bar')||e.target.closest('button'))return;
 if(!state||view!=='projects'||!projectId||!manage(projectId)||$('dialog').open)return;
 const min=minDate();
 if(!min)return;
 const d0=document.querySelector('.gantt .ghead .day');
 if(d0&&d0.textContent.trim()!==min.slice(8)+min.slice(5,7)){toast('Не удалось определить дату клетки');return;}
 const x=e.clientX-tr.getBoundingClientRect().left,idx=Math.floor(x/28);
 if(idx<0)return;
 const date=plus(min,idx);
 taskForm(null,null,projectId);
 if($('f_start'))$('f_start').value=date;
 if($('f_end'))$('f_end').value=date;
 if($('f_title'))$('f_title').focus();
});

function decorate(){
 if(!state||view!=='projects'||!projectId||!manage(projectId))return;
 const sc=document.querySelector('#content .gantt-scroll');
 if(!sc||document.querySelector('#content .ghint'))return;
 sc.insertAdjacentHTML('afterend',`<p class='ghint'>Нажмите на свободную клетку графика, чтобы добавить задачу на эту дату.</p>`);
}

const oRender=render;
render=function(){const r=oRender.apply(this,arguments);try{decorate();}catch(e){}return r;};
if(state)render();
})();
