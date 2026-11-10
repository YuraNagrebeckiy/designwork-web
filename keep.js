'use strict';
(function(){
const pos={};
let win=[0,0],winKey='';
const key=()=>String(view)+'|'+String(projectId);
const st=document.createElement('style');
st.textContent='.gantt-scroll{scroll-behavior:auto!important;overflow-anchor:none}html,body{scroll-behavior:auto!important}';
document.head.appendChild(st);
document.addEventListener('scroll',e=>{
 const el=e.target;
 if(el&&el.classList&&el.classList.contains('gantt-scroll')){
  const i=[...document.querySelectorAll('.gantt-scroll')].indexOf(el);
  if(i>=0){const k=key();(pos[k]=pos[k]||[])[i]=[el.scrollLeft,el.scrollTop];}
 }else if(el===document||el===document.documentElement){win=[window.scrollX,window.scrollY];winKey=key();}
},true);
function restore(){
 const p=pos[key()];
 if(p)document.querySelectorAll('.gantt-scroll').forEach((e,i)=>{const v=p[i];if(v&&(e.scrollLeft!==v[0]||e.scrollTop!==v[1])){e.scrollLeft=v[0];e.scrollTop=v[1];}});
 if(winKey===key()&&(Math.abs(window.scrollY-win[1])>2||Math.abs(window.scrollX-win[0])>2))window.scrollTo(win[0],win[1]);
}
const has=n=>n.nodeType===1&&((n.classList&&n.classList.contains('gantt-scroll'))||(n.querySelector&&n.querySelector('.gantt-scroll')));
const root=document.getElementById('content');
if(root)new MutationObserver(list=>{
 if(!list.some(m=>[...m.addedNodes].some(has)))return;
 restore();
 requestAnimationFrame(restore);
 setTimeout(restore,80);
}).observe(root,{childList:true,subtree:true});
})();
