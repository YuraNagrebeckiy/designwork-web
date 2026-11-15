'use strict';
(function(){
if(typeof document==='undefined'||typeof showForm==='undefined')return;
const st=document.createElement('style');
st.textContent='.tplpick{display:grid;gap:10px;margin:12px 0}.tplpick button{width:100%;text-align:left}';
document.head.appendChild(st);
document.addEventListener('click',e=>{
 const t=e.target;
 if(!t||!t.closest)return;
 if(t.closest('[data-tpltoggle]')){
  e.stopImmediatePropagation();
  e.preventDefault();
  showForm('<div class="tplf"><h2>Выбрать шаблон</h2><div class="tplpick"><button type="button" class="primary" data-tpladd="int">Дизайн интерьера</button><button type="button" class="primary" data-tpladd="hse">Проектирование дома</button><button type="button" class="primary" data-tpladd="lnd">Благоустройство территории</button></div><p class="notice">После выбора откроется состав шаблона: готовый, выбрать части или пустой.</p></div>',async()=>{});
  const sv=document.querySelector('#editform .footer .primary');
  if(sv)sv.classList.add('hidden');
  return;
 }
 if(t.closest('[data-tpladd]')&&t.closest('#dialog')){
  try{document.getElementById('dialog').close();}catch(x){}
 }
},true);
})();
