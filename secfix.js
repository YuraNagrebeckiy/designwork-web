'use strict';
(function(){
const curSec=()=>{const b=document.querySelector('#content .sectabs button.on');return b?b.dataset.sec:'design';};
const secOf=id=>((state.sections||{})[id]==='build')?'build':'design';

const oCall=call;
call=function(action,payload){
 if(action==='taskCreate'&&payload&&!payload.parentId&&!payload.section&&state&&view==='projects'&&curSec()==='build'){
  payload=Object.assign({},payload,{section:'build'});
 }
 return oCall.call(this,action,payload);
};

let ctx='';
function clean(){
 const dlg=$('dialog');
 if(!dlg.open||!ctx||!state)return;
 ['f_parent','f_deps'].forEach(id=>{
  const s=$(id);
  if(!s)return;
  [...s.options].forEach(o=>{if(o.value&&secOf(o.value)!==ctx)o.remove();});
 });
}
const oTF=taskForm;
taskForm=function(t,parent,pre){
 oTF.apply(this,arguments);
 try{
  const dlg=$('dialog');
  if(!dlg.open||!$('f_parent'))return;
  ctx=t?secOf(t.id):(parent?secOf(parent.id):(view==='projects'?curSec():'design'));
  if(ctx==='supply')ctx='design';
  clean();
 }catch(e){}
};
document.addEventListener('click',()=>setTimeout(clean,0));
document.addEventListener('change',()=>setTimeout(clean,0));
})();
