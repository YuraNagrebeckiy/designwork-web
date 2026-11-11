'use strict';
(function(){
const st=document.createElement('style');
st.textContent=`#content .grid article.panel [data-action=openProject]{display:none!important}
#content .secgrid{grid-template-columns:1fr!important;gap:8px}
#content .secgrid .sg{min-width:0}
#content .secgrid button{width:100%;white-space:normal;line-height:1.15;min-height:38px;height:auto;padding:7px 12px;font-size:14px;border-radius:999px}
#content .secgrid .sg-top{margin-bottom:3px}
#content .sectabs{gap:8px}
#content .sectabs .sg{min-width:0}
#content .sectabs button{white-space:normal;overflow-wrap:anywhere;line-height:1.15;min-height:36px;height:auto;padding:5px 3px;font-size:12px;min-width:0}
.sg-top b{min-width:34px;font-size:12px}
body[data-web='0'] #cobweb{display:none!important}
.card .actions .tnote{flex:1 1 220px;min-width:160px;margin:0;align-self:center;-webkit-line-clamp:3!important}
.card .actions .tnote.empty{background:none;border-left:0;padding:0;color:var(--muted);font-style:italic;cursor:pointer;display:block!important}
.card .actions .tnote.empty::before{content:''}`;
document.head.appendChild(st);
function fix(){
 document.querySelectorAll('#content .card[data-drag]').forEach(c=>{
  const a=c.querySelector('.actions');
  if(!a)return;
  const n=c.querySelector('.tnote');
  if(n){if(n.parentNode!==a)a.appendChild(n);return;}
  const e=c.querySelector('[data-action=taskEdit]');
  if(!e)return;
  const p=document.createElement('p');
  p.className='tnote empty';
  p.textContent='+ Добавить пояснение';
  p.onclick=()=>e.click();
  a.appendChild(p);
 });
}
function webGate(){
 let ok=false;
 if(state){
  if(view==='tasks')ok=true;
  else if(view==='projects'&&projectId){
   const b=document.querySelector('#content .sectabs button.on');
   ok=!b||b.dataset.sec==='design';
  }
 }
 document.body.dataset.web=ok?'1':'0';
}
const oRender=render;
render=function(){const r=oRender.apply(this,arguments);try{fix();webGate();}catch(e){}return r;};
})();
