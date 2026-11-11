'use strict';
(function(){
function fix(){
 if(!state)return;
 const m=document.querySelector('#content [data-mood]'),b=document.querySelector('#content [data-board]');
 if(m&&m.textContent.indexOf('Мудборд')===0)m.textContent=m.textContent.replace('Мудборд','Файлы мудборда');
 if(b){
  if(b.textContent!=='Мудборд')b.textContent='Мудборд';
  if(!b.classList.contains('primary'))b.classList.add('primary');
 }
 if(m&&b&&b.parentNode===m.parentNode&&(m.compareDocumentPosition(b)&4))m.parentNode.insertBefore(b,m);
 document.querySelectorAll('#content .grid article.panel').forEach(a=>{
  if(a.querySelector('[data-board]'))return;
  const o=a.querySelector('[data-action=openProject]');
  if(!o)return;
  const x=document.createElement('button');
  x.type='button';x.className='primary';x.dataset.board=o.dataset.id;x.textContent='Мудборд';
  o.after(x);
 });
}
let busy=false;
const root=document.getElementById('content');
if(root){
 new MutationObserver(()=>{
  if(busy)return;
  busy=true;
  try{fix();}catch(e){}
  busy=false;
 }).observe(root,{childList:true,subtree:true,characterData:true});
}
try{fix();}catch(e){}
})();
