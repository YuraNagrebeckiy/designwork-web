'use strict';
(function(){
let lastKey='';
const oRender=render;
render=function(){
 const key=String(view)+'|'+String(projectId);
 const same=key===lastKey;
 const sc=[...document.querySelectorAll('.gantt-scroll')].map(e=>[e.scrollLeft,e.scrollTop]),wy=window.scrollY,wx=window.scrollX;
 const r=oRender.apply(this,arguments);
 lastKey=key;
 if(same){
  document.querySelectorAll('.gantt-scroll').forEach((e,i)=>{if(sc[i]){e.scrollLeft=sc[i][0];e.scrollTop=sc[i][1];}});
  if(Math.abs(window.scrollY-wy)>2||Math.abs(window.scrollX-wx)>2)window.scrollTo(wx,wy);
 }
 return r;
};
})();
