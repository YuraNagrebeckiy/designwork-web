'use strict';
(function(){
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;};
const MON=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
const st=document.createElement('style');
st.textContent='.mygantt{margin:8px 0 14px}.mygantt summary{font-weight:700;cursor:pointer;padding:6px 0}.mygantt .gantt-scroll{max-height:46vh;overflow:auto}';
document.head.appendChild(st);
const oArr=arr;let free='';
arr=function(s){return (free&&s===free)?[]:oArr.apply(this,arguments);};
document.addEventListener('pointerdown',e=>{
 const bar=e.target.closest&&e.target.closest('.bar[data-edit]');if(!bar)return;
 const t=state&&state.tasks.find(x=>x.id===bar.dataset.id);
 free=(t&&!(e.target.dataset&&e.target.dataset.h)&&t.deps&&t.deps!=='[]')?t.deps:'';
},true);
['pointerup','pointercancel'].forEach(n=>document.addEventListener(n,()=>{setTimeout(()=>{free='';},60);}));
function pullLocal(p){
 const t=state.tasks.find(x=>x.id===p.id);if(!t||!oArr(t.deps).length)return;
 const by=new Map(state.tasks.map(x=>[x.id,x])),seen=new Set();
 const need=(task,start,lag)=>oArr(task.deps).forEach(id=>{
  const d=by.get(id);if(!d||seen.has(id))return;
  const latest=plus(start,-(1+lag));
  if(d.end>latest){const sh=days(latest,d.end);seen.add(id);[d].concat(kids(d.id)).forEach(x=>{x.start=plus(x.start,-sh);x.end=plus(x.end,-sh);});need(d,d.start,Number(d.lag||0));}
 });
 need(t,p.start,0);
}
const oCall=call;
call=function(action,payload){
 if(action==='taskUpdate'&&payload&&payload.start!==undefined){try{pullLocal(payload);}catch(e){}}
 return oCall.apply(this,arguments);
};
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('#gpanel button[data-g]');if(!b)return;
 const g=b.dataset.g;if(g[0]!=='s')return;
 const bar=document.querySelector('.bar.sel');if(!bar)return;
 e.stopPropagation();e.stopImmediatePropagation();
 const t=state.tasks.find(x=>x.id===bar.dataset.id);if(!t)return;
 const d=Number(g.slice(1));
 call('taskUpdate',{id:t.id,version:t.version,start:plus(t.start,d),end:plus(t.end,d)}).catch(err=>toast(err.message||String(err)));
},true);
function drawMy(){
 if(!state||view!=='tasks')return;
 const c=$('content'),tb=c.querySelector('.toolbar');
 if(!tb||c.querySelector('.mygantt'))return;
 let ts=state.tasks.filter(t=>t.assigneeId===state.me.id&&t.status!=='Готово');
 if(filterProject)ts=ts.filter(t=>t.projectId===filterProject);
 if(period!=='all'){const end=period==='today'?today():plus(today(),6);ts=ts.filter(t=>t.start<=end&&t.end>=today());}
 ts.sort((a,b)=>a.start.localeCompare(b.start)||a.end.localeCompare(b.end));
 const box=document.createElement('details');box.className='mygantt';box.open=LS('studioMyG')!=='off';
 box.addEventListener('toggle',()=>LS('studioMyG',box.open?'on':'off'));
 if(!ts.length){box.innerHTML='<summary>График моих задач</summary><p class="notice">Невыполненных задач нет.</p>';tb.after(box);return;}
 const DAY=28,min=plus(ts.reduce((a,t)=>t.start<a?t.start:a,ts[0].start),-1),mx=plus(ts.reduce((a,t)=>t.end>a?t.end:a,ts[0].end),2),n=days(min,mx)+1,w=n*DAY,lw=matchMedia('(max-width:760px)').matches?160:230;
 let ticks='',mon='';
 for(let i=0;i<n;i++){
  const d=plus(min,i);
  ticks+='<span class="day" style="left:'+(i*DAY)+'px">'+d.slice(8)+'<br>'+d.slice(5,7)+'</span>';
  if(i===0||d.slice(8)==='01')mon+='<span class="gmon" style="left:'+(i*DAY)+'px">'+MON[+d.slice(5,7)-1]+' '+d.slice(0,4)+'</span>';
 }
 const body=ts.map(t=>{
  const lateT=(Number(t.hours)>0?t.start:t.end)<today(),cls=t.status==='Пауза'?'pause':t.status==='На согласовании'?'review':'';
  return '<div class="grow"><div class="glabel" title="'+esc(t.title)+'">'+esc(t.title)+'<small>'+esc(projectName(t.projectId))+'</small></div><div class="track" style="width:'+w+'px"><button class="bar '+cls+'" style="left:'+(days(min,t.start)*DAY)+'px;width:'+((days(t.start,t.end)+1)*DAY)+'px'+(lateT?';background:#991720':'')+'" data-action="taskEdit" data-id="'+esc(t.id)+'" title="'+esc(t.start+' — '+t.end+' • '+t.title)+'"><span class="bt">'+esc(t.title)+'</span></button></div></div>';
 }).join('');
 const td=today(),tl=td>=min&&td<=mx?'<div class="todayline" style="left:'+(lw+days(min,td)*DAY)+'px"></div>':'';
 box.innerHTML='<summary>График моих задач ('+ts.length+')</summary><div class="gantt-scroll"><div class="gantt" style="width:'+(w+lw)+'px"><div class="grow ghead"><div class="glabel">Задача / объект</div><div class="track" style="width:'+w+'px">'+ticks+mon+'</div></div>'+body+tl+'</div></div>';
 tb.after(box);
}
const oRender=render;
render=function(){const r=oRender.apply(this,arguments);try{drawMy();}catch(e){}return r;};
if(state)render();
})();
