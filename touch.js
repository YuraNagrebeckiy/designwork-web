'use strict';
(function(){
const HOLD=380,MOVE=8;
const st=document.createElement('style');
st.textContent='.gantt .bar{touch-action:pan-x pan-y!important;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}.gantt .bar.armed{outline:3px solid var(--accent);box-shadow:0 0 0 6px rgba(82,101,223,.25);transition:box-shadow .15s}';
document.head.appendChild(st);
let timer=0,armed=false,start=null;
function clear(){clearTimeout(timer);timer=0;}
document.addEventListener('pointerdown',e=>{
 if(e.studioArmed||e.pointerType==='mouse')return;
 const bar=e.target.closest&&e.target.closest('.bar[data-edit]');
 if(!bar)return;
 e.stopPropagation();
 clear();armed=false;
 const x=e.clientX,y=e.clientY,id=e.pointerId,target=e.target,type=e.pointerType;
 start={x:x,y:y};
 timer=setTimeout(()=>{
  timer=0;armed=true;bar.classList.add('armed');
  try{if(navigator.vibrate)navigator.vibrate(25);}catch(_){}
  const ev=new PointerEvent('pointerdown',{bubbles:true,cancelable:true,clientX:x,clientY:y,pointerId:id,pointerType:type,button:0,isPrimary:true});
  ev.studioArmed=true;
  target.dispatchEvent(ev);
 },HOLD);
},true);
document.addEventListener('pointermove',e=>{
 if(timer&&start&&(Math.abs(e.clientX-start.x)>MOVE||Math.abs(e.clientY-start.y)>MOVE))clear();
},true);
function done(){
 clear();
 if(armed){armed=false;document.querySelectorAll('.bar.armed').forEach(b=>b.classList.remove('armed'));}
}
['pointerup','pointercancel'].forEach(t=>document.addEventListener(t,done,true));
document.addEventListener('touchmove',e=>{if(armed&&e.cancelable)e.preventDefault();},{passive:false});
document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('.gantt .bar'))e.preventDefault();});
})();
