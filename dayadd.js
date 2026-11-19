'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined'||typeof state==='undefined')return;
const PX=56,H0=7,Q=0.25;
const byId=id=>document.getElementById(id);
const tm=v=>{let h=Math.floor(v+1e-9),m=Math.round((v-h)*60);if(m===60){h++;m=0;}return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');};
const st=document.createElement('style');
st.textContent='html body .pday{cursor:cell}'
+'html body .pday .pb .ptx{padding-right:0!important;white-space:normal;overflow-wrap:anywhere}'
+'html body .pday .pb .psh{position:static;display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}'
+'html body .pday .pb .psh button{min-height:24px;padding:0 8px;font-size:11px}'
+'html body .pday .pb.sm{overflow:visible}'
+'html body .pday .pb.sm .ptx{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'
+'html body .pday .pb.xs .ptx{-webkit-line-clamp:1}'
+'html body .pday .pb.sm .psh{position:absolute;left:0;top:100%;margin:2px 0 0;padding:4px;display:none;background:var(--float);border:1px solid var(--line);border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,.18);z-index:8;width:max-content;max-width:min(320px,90vw)}'
+'html body .pday .pb.sm:hover,html body .pday .pb.sm:focus-within{z-index:7}'
+'html body .pday .pb.sm:hover .psh,html body .pday .pb.sm:focus-within .psh{display:flex}'
+'html body .pday .pab b{font-weight:600}'
+'#pmenu{position:fixed;z-index:2147483100;width:260px;max-height:60vh;overflow:auto;background:var(--float);color:var(--ink);border:1px solid var(--glass-bd,var(--line));border-radius:14px;box-shadow:0 12px 36px rgba(0,0,0,.28);padding:6px;-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px)}'
+'#pmenu .mh{padding:6px 10px 8px;font-size:12px;color:var(--muted)}#pmenu .mh b{color:var(--ink);font-size:14px}'
+'#pmenu button{display:block;width:100%;text-align:left;border:0;background:transparent;box-shadow:none;border-radius:10px;padding:9px 10px;min-height:40px;font-size:14px}'
+'#pmenu button:hover{background:var(--soft)}#pmenu .sep{margin:6px 10px 2px;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}'
+'#pmenu button.sl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13px}';
document.head.appendChild(st);

function mark(){
 document.querySelectorAll('.pday .pb').forEach(b=>{
  const h=parseFloat(b.style.height)||0;
  b.classList.toggle('sm',h<64);
  b.classList.toggle('xs',h<34);
  if(h<64&&!b.hasAttribute('tabindex'))b.setAttribute('tabindex','0');
 });
}
function hint(){
 document.querySelectorAll('.ppage .pday[data-day]').forEach(box=>{
  if(box.closest('.pcols')||box.previousElementSibling&&box.previousElementSibling.id==='pday_hint')return;
  const p=document.createElement('p');
  p.className='notice';p.id='pday_hint';
  p.textContent='Нажмите на пустое место графика, чтобы добавить задачу на это время.';
  box.before(p);
 });
}
function viewUid(){
 const ws=byId('whoSel');
 if(ws){const v=ws.value;return(v==='me'||v==='all')?state.me.id:v;}
 if(typeof view!=='undefined'&&view==='projects'&&typeof projectId!=='undefined'&&projectId){
  const p=state.projects.find(x=>x.id===projectId),m=p?arr(p.members):[];
  return m[0]||state.me.id;
 }
 return state.me.id;
}
function wait(test,fn){
 let n=0;
 const iv=setInterval(()=>{
  n++;
  if(test()){clearInterval(iv);fn();}
  else if(n>60)clearInterval(iv);
 },50);
}
function fill(day,s,setWho){
 const f=byId('f_start'),e=byId('f_end');
 if(f)f.value=day;
 if(e)e.value=day;
 [f,e].forEach(x=>{if(x)x.dispatchEvent(new Event('change',{bubbles:true}));});
 const cb=byId('f_usehrs');
 if(cb&&!cb.checked){cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}));}
 const h=byId('f_hours');if(h)h.value=1;
 const t=byId('f_time');if(t)t.value=tm(s);
 const a=byId('f_assignee'),uid=viewUid();
 if(setWho&&a&&uid){
  if(a.tagName!=='SELECT'||[...a.options].some(o=>o.value===uid))a.value=uid;
 }
}
function closeMenu(){const m=byId('pmenu');if(m)m.remove();}
function openMenu(day,s,x,y){
 closeMenu();
 const per=document.querySelector('[data-personal]'),tsk=document.querySelector('#content [data-action=taskCreate],#content [data-pnew]'),lib=document.querySelector('[data-libopen]');
 const frees=[...document.querySelectorAll('.ppage .pfree .pf')].slice(0,6).map(pf=>{
  const b=pf.querySelector('[data-pplan]'),t=pf.querySelector('[data-action=taskEdit]');
  return b?{id:b.dataset.pplan,label:(t?t.textContent:'').replace(/\s+/g,' ').trim()}:null;
 }).filter(Boolean);
 const mine=viewUid()===state.me.id;
 const m=document.createElement('div');
 m.id='pmenu';
 m.innerHTML='<div class="mh"><b>Добавить на '+tm(s)+'</b><br>'+day.slice(8)+'.'+day.slice(5,7)+'.'+day.slice(0,4)+'</div>'
  +(tsk?'<button type="button" data-pm="task">Задача</button>':'')
  +(per?'<button type="button" data-pm="personal">Личная задача'+(mine?'':' (моя)')+'</button>':'')
  +(lib?'<button type="button" data-pm="lib">Блок из библиотеки</button>':'')
  +(frees.length?'<div class="sep">Поставить из задач дня</div>'+frees.map(f=>'<button type="button" class="sl" data-pm="slot" data-id="'+esc(f.id)+'" title="'+esc(f.label)+'">'+esc(f.label)+'</button>').join(''):'');
 document.body.appendChild(m);
 const w=m.offsetWidth,h=m.offsetHeight;
 m.style.left=Math.max(8,Math.min(x,window.innerWidth-w-8))+'px';
 m.style.top=Math.max(8,Math.min(y,window.innerHeight-h-8))+'px';
 m.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-pm]');
  if(!b)return;
  const a=b.dataset.pm;
  closeMenu();
  if(a==='slot'){
   const btn=document.querySelector('[data-pplan="'+b.dataset.id+'"]');
   if(!btn)return;
   btn.click();
   wait(()=>byId('sl_t'),()=>{byId('sl_t').value=tm(s);const hh=byId('sl_h');if(hh)hh.value=1;const d=byId('sl_d');if(d)d.value=day;});
   return;
  }
  const src=a==='personal'?document.querySelector('[data-personal]'):a==='lib'?document.querySelector('[data-libopen]'):document.querySelector('#content [data-action=taskCreate],#content [data-pnew]');
  if(!src)return;
  src.click();
  if(a==='lib')wait(()=>byId('lb_start'),()=>{const l=byId('lb_start');l.value=day;l.dispatchEvent(new Event('change',{bubbles:true}));});
  else wait(()=>byId('f_start'),()=>fill(day,s,a==='task'));
 });
}
window.studioDayAdd={fill:fill,openMenu:openMenu};
document.addEventListener('click',e=>{
 const m=byId('pmenu');
 if(m&&!e.target.closest('#pmenu'))closeMenu();
 const box=e.target.closest&&e.target.closest('.ppage .pday[data-day]');
 if(!box||box.closest('.pcols'))return;
 if(e.target.closest('.pb,.pab,button,a,.now,input,select,#pmenu'))return;
 const r=box.getBoundingClientRect();
 let s=Math.round((H0+(e.clientY-r.top)/PX)/Q)*Q;
 s=Math.max(7,Math.min(20,s));
 openMenu(box.dataset.day,s,e.clientX,e.clientY);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
window.addEventListener('scroll',closeMenu,true);
const oR=render;
render=function(){const r=oR.apply(this,arguments);try{mark();hint();}catch(e){}return r;};
try{mark();hint();}catch(e){}
})();
