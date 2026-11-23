'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined'||typeof state==='undefined')return;
const fd=d=>d.slice(8)+'.'+d.slice(5,7);
const st=document.createElement('style');
st.textContent='#ganttRoot .bar[data-y]{cursor:grab;touch-action:none}#ganttRoot .bar .yh{position:absolute;top:0;bottom:0;width:5px;cursor:ew-resize;background:rgba(0,0,0,.22)}#ganttRoot .bar .yh.l{left:0}#ganttRoot .bar .yh.r{right:0}#ytip{position:fixed;z-index:2147483000;background:var(--ink);color:var(--panel);padding:3px 8px;border-radius:6px;font-size:12px;pointer-events:none}';
document.head.appendChild(st);
function yg(){
 const g=document.querySelector('#ganttRoot .gantt');
 if(!g)return null;
 const h=g.querySelector('.ghead .glabel');
 if(!h||h.textContent.indexOf('Этапы и задачи')!==0)return null;
 const yb=document.querySelector('#ganttRoot .gtb b'),m=yb&&/(\d{4})/.exec(yb.textContent);
 if(!m)return null;
 const min=m[1]+'-01-01',n=days(min,m[1]+'-12-31')+1,tr=g.querySelector('.ghead .track'),w=tr?parseFloat(tr.style.width):0;
 if(!w)return null;
 return {g:g,min:min,n:n,DAY:w/n};
}
function decorate(){
 const y=yg();
 if(!y)return;
 y.g.querySelectorAll('.bar[data-id]').forEach(b=>{
  if(b.querySelector('.yh'))return;
  const t=state.tasks.find(x=>x.id===b.dataset.id);
  if(!t||!fullEdit(t))return;
  b.dataset.y='1';
  if(parseFloat(b.style.width)>14){
   ['l','r'].forEach(s=>{const h=document.createElement('span');h.className='yh '+s;b.appendChild(h);});
  }
  b.title=(b.title||'')+' — потяните, чтобы сдвинуть; края — изменить срок; клик — открыть';
 });
}
let d=null,noClick=0;
function tip(x,y,s){
 let t=document.getElementById('ytip');
 if(!t){t=document.createElement('div');t.id='ytip';document.body.appendChild(t);}
 t.textContent=s;t.style.left=(x+12)+'px';t.style.top=(y-30)+'px';
}
function untip(){const t=document.getElementById('ytip');if(t)t.remove();}
document.addEventListener('pointerdown',e=>{
 const b=e.target&&e.target.closest?e.target.closest('.bar[data-y]'):null;
 if(!b)return;
 const y=yg(),t=state.tasks.find(x=>x.id===b.dataset.id);
 if(!y||!t)return;
 const h=e.target.closest('.yh');
 d={b:b,t:t,y:y,mode:h?(h.classList.contains('l')?'l':'r'):'m',x:e.clientX,l0:parseFloat(b.style.left),w0:parseFloat(b.style.width),moved:false,ns:t.start,ne:t.end};
 try{b.setPointerCapture(e.pointerId);}catch(x){}
},true);
document.addEventListener('pointermove',e=>{
 if(!d)return;
 const dx=e.clientX-d.x;
 if(Math.abs(dx)>4)d.moved=true;
 if(!d.moved)return;
 const dd=Math.round(dx/d.y.DAY),t=d.t;
 let ns=t.start,ne=t.end;
 if(d.mode==='m'){ns=plus(t.start,dd);ne=plus(t.end,dd);}
 else if(d.mode==='l'){ns=plus(t.start,dd);if(ns>t.end)ns=t.end;}
 else{ne=plus(t.end,dd);if(ne<t.start)ne=t.start;}
 d.ns=ns;d.ne=ne;
 const k=days(t.start,ns),m=days(t.end,ne);
 d.b.style.left=(d.l0+k*d.y.DAY)+'px';
 d.b.style.width=Math.max(4,d.w0+(m-k)*d.y.DAY)+'px';
 tip(e.clientX,e.clientY,fd(ns)+' — '+fd(ne));
},true);
document.addEventListener('pointerup',()=>{
 if(!d)return;
 const x=d;d=null;untip();
 if(!x.moved)return;
 noClick=Date.now()+400;
 if(x.ns===x.t.start&&x.ne===x.t.end){render();return;}
 guarded(async()=>{try{await call('taskUpdate',{id:x.t.id,version:x.t.version,start:x.ns,end:x.ne});await reload();}finally{render();}});
},true);
document.addEventListener('pointercancel',()=>{if(d){d=null;untip();render();}},true);
document.addEventListener('click',e=>{
 if(Date.now()<noClick&&e.target&&e.target.closest&&e.target.closest('.bar[data-y]')){e.stopImmediatePropagation();e.preventDefault();}
},true);
const oR=render;
render=function(){
 const r=oR.apply(this,arguments);
 try{decorate();}catch(e){}
 return r;
};
})();
