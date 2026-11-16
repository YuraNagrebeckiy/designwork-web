'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined')return;
function addBtn(){
 const c=document.getElementById('content');
 if(!c)return;
 c.querySelectorAll('.tplbar').forEach(bar=>{
  if(bar.querySelector('[data-smrk="log"]'))return;
  const bld=bar.querySelector('[data-smrk="bld"]');
  if(!bld)return;
  const b=document.createElement('button');
  b.type='button';
  b.className=bld.className;
  b.dataset.smrk='log';
  b.textContent='СМР Здание из сруба';
  bld.after(b);
 });
}
const oR=render;
render=function(){
 const r=oR.apply(this,arguments);
 setTimeout(()=>{try{addBtn();}catch(e){}},0);
 return r;
};
if(typeof state!=='undefined'&&state)render();
})();
