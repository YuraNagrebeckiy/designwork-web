'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined'||typeof state==='undefined')return;
const st=document.createElement('style');
st.textContent='html body input.dchk{-webkit-appearance:none;appearance:none;position:absolute;z-index:6;width:20px!important;height:20px!important;min-width:20px!important;min-height:0!important;padding:0!important;margin:0!important;border-radius:50%;border:2px solid #6b7280;background:rgba(255,255,255,.92);cursor:pointer;opacity:0;transition:opacity .15s,background .15s,border-color .15s;box-shadow:none;transform:translateY(-50%);top:50%}'
+'html body .pb>input.dchk,html body .pab>input.dchk{left:7px}'
+'html body .pb:hover>input.dchk,html body .pab:hover>input.dchk,html body input.dchk:checked,html body .bar:hover+input.dchk,html body input.dchk:hover,html body input.dchk:focus-visible{opacity:1}'
+'html body input.dchk:hover{border-color:#2e9e6b}'
+'html body input.dchk:checked{background:#2e9e6b;border-color:#2e9e6b}'
+'html body input.dchk:checked::after{content:"";position:absolute;left:5px;top:1px;width:5px;height:10px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg)}'
+'html body .pday .dk{padding-left:34px!important}'
+'html body .pday .dk-done{opacity:.6}html body .pday .dk-done .ptx{text-decoration:line-through}'
+'html body .bar.dk-done{opacity:.55}'
+'@media(hover:none){html body input.dchk{opacity:.85}}';
document.head.appendChild(st);
function mk(id,done){
 const c=document.createElement('input');
 c.type='checkbox';c.className='dchk';c.dataset.done=id;c.checked=done;
 c.title=done?'Вернуть в работу':'Отметить выполненной';
 c.setAttribute('aria-label',c.title);
 return c;
}
function paint(){
 if(!state||!state.tasks)return;
 const by=new Map(state.tasks.map(t=>[t.id,t]));
 document.querySelectorAll('#content .pday .pb[data-bid],#content .pday .pab[data-aid]').forEach(b=>{
  if(b.querySelector(':scope>.dchk'))return;
  const id=b.dataset.bid||b.dataset.aid,t=by.get(id);
  if(!t)return;
  const done=t.status==='Готово';
  b.classList.add('dk');
  b.classList.toggle('dk-done',done);
  b.appendChild(mk(id,done));
 });
 document.querySelectorAll('#content .bar[data-id]').forEach(b=>{
  if(b.closest('#ganttRoot'))return;
  const nx=b.nextElementSibling;
  if(nx&&nx.classList.contains('dchk'))return;
  const t=by.get(b.dataset.id);
  if(!t)return;
  const done=t.status==='Готово',c=mk(t.id,done);
  c.style.left=((parseFloat(b.style.left)||0)+5)+'px';
  b.classList.toggle('dk-done',done);
  b.after(c);
 });
}
window.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('.dchk'))e.stopImmediatePropagation();},true);
window.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.dchk'))e.stopImmediatePropagation();},true);
const oR=render;
render=function(){const r=oR.apply(this,arguments);try{paint();}catch(e){}return r;};
try{paint();}catch(e){}
})();
