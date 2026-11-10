'use strict';
(function(){
const HOLD=380,MOVE=8;
let timer=0,armed=false,start=null,sel='',block=false;
const st=document.createElement('style');
st.textContent=`.gantt .bar{touch-action:pan-x pan-y!important;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}.gantt .bar.armed,.gantt .bar.sel{outline:3px solid var(--accent);box-shadow:0 0 0 6px rgba(82,101,223,.25);transition:box-shadow .15s}
#gpanel{position:fixed;left:8px;right:8px;bottom:10px;max-width:520px;margin:0 auto;z-index:160;background:var(--panel);color:var(--ink);border:1px solid var(--accent);border-radius:14px;box-shadow:0 10px 36px #0006;padding:10px 12px}#gpanel .gp-t{display:flex;align-items:center;gap:8px;margin-bottom:8px}#gpanel .gp-t b{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#gpanel .gp-t span{color:var(--muted);font-size:13px;white-space:nowrap}#gpanel .gp-r{display:flex;align-items:center;gap:10px;margin:6px 0}#gpanel .gp-r>span{flex:1;font-size:14px}#gpanel .gp-r b{min-width:56px;text-align:center}#gpanel button{min-height:44px;min-width:56px;font-size:20px;padding:4px 14px}#gpanel .gp-t button{min-height:36px;min-width:36px;font-size:16px;border:0;background:none}#gpanel .gp-r button.wide{flex:1;font-size:15px}`;
document.head.appendChild(st);
const panel=document.createElement('div');
panel.id='gpanel';panel.className='hidden';
panel.innerHTML='<div class="gp-t"><b id="gpTitle"></b><span id="gpInfo"></span><button type="button" data-g="x" aria-label="Закрыть">\u2715</button></div><div class="gp-r"><span>Сдвиг</span><button type="button" data-g="s-1" aria-label="На день раньше">\u25C0</button><button type="button" data-g="s+1" aria-label="На день позже">\u25B6</button></div><div class="gp-r" data-row="d"><span>Длительность</span><button type="button" data-g="d-1" aria-label="На день короче">\u25C0</button><b id="gpDur"></b><button type="button" data-g="d+1" aria-label="На день дольше">\u25B6</button></div><div class="gp-r"><button type="button" class="wide" data-g="edit">Настройки задачи</button></div>';
document.body.appendChild(panel);
function minStart(t){const ds=arr(t.deps).map(i=>state.tasks.find(x=>x.id===i)).filter(Boolean);return ds.length?plus(ds.reduce((a,d)=>d.end>a?d.end:a,ds[0].end),1):'';}
function closeSel(){sel='';document.querySelectorAll('.bar.sel').forEach(b=>b.classList.remove('sel'));panel.classList.add('hidden');}
function paint(){
 if(!sel){panel.classList.add('hidden');return;}
 const t=state&&state.tasks.find(x=>x.id===sel);
 if(!t||view!=='projects'||$('dialog').open){closeSel();return;}
 document.querySelectorAll('.bar.sel').forEach(b=>b.classList.remove('sel'));
 const b=document.querySelector('.bar[data-id="'+sel+'"]');if(b)b.classList.add('sel');
 const n=days(t.start,t.end)+1;
 $('gpTitle').textContent=t.title;
 $('gpInfo').textContent=t.start.slice(8)+'.'+t.start.slice(5,7)+' \u2013 '+t.end.slice(8)+'.'+t.end.slice(5,7);
 $('gpDur').textContent=n+' дн.';
 panel.querySelector('[data-row="d"]').style.display=kids(t.id).length?'none':'';
 panel.classList.remove('hidden');
}
function apply(kind,d){
 const t=state.tasks.find(x=>x.id===sel);if(!t)return;
 let ns=t.start,ne=t.end;
 if(kind==='s'){ns=plus(ns,d);ne=plus(ne,d);}
 else{ne=plus(ne,d);if(ne<ns){toast('Минимум 1 день');return;}}
 const mn=minStart(t);
 if(mn&&ns<mn){toast('Раньше нельзя: предшественник заканчивается '+plus(mn,-1).slice(8)+'.'+plus(mn,-1).slice(5,7));return;}
 const payload={id:t.id,version:t.version,start:ns,end:ne};
 if(mn)payload.lag=Math.max(0,days(mn,ns));
 call('taskUpdate',payload).catch(err=>toast(err.message||String(err)));
}
panel.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 const g=b.dataset.g;
 if(g==='x'){closeSel();return;}
 if(g==='edit'){const t=state.tasks.find(x=>x.id===sel);closeSel();if(t)taskForm(t);return;}
 apply(g[0],Number(g.slice(1)));
});
const oRender=render;
render=function(){const r=oRender.apply(this,arguments);try{paint();}catch(e){}return r;};
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
  sel=bar.dataset.id;paint();
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
 if(armed){
  armed=false;block=true;setTimeout(()=>{block=false;},600);
  document.querySelectorAll('.bar.armed').forEach(b=>b.classList.remove('armed'));
 }
}
['pointerup','pointercancel'].forEach(t=>document.addEventListener(t,done,true));
document.addEventListener('touchmove',e=>{if(armed&&e.cancelable)e.preventDefault();},{passive:false});
document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('.gantt .bar'))e.preventDefault();});
document.addEventListener('click',e=>{
 const bar=e.target.closest&&e.target.closest('.bar');
 if(!bar)return;
 if(block){e.stopPropagation();e.preventDefault();return;}
 closeSel();
},true);
})();
