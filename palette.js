'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined')return;
const L={work:['#dce8f3','#5b83a8','#1f3347'],review:['#e6e0f2','#8470b0','#2d2547'],pause:['#e9e6e0','#8c857a','#3a362f'],done:['#dcebe2','#4d8765','#1f3d2d'],g:['#dcebe2','#4d8765','#1f3d2d'],y:['#f4e9c6','#a8832a','#4d3d0c'],r:['#f6dccf','#c07650','#5a2a18'],fire:['#f1cfcb','#b5584f','#5c211c']};
const D={work:['#2a3947','#7aa2c4','#d8e6f2'],review:['#38314d','#a393d1','#e6e0f5'],pause:['#38352f','#9d968a','#e6e2da'],done:['#27392f','#6fb08e','#d6ece0'],g:['#27392f','#6fb08e','#d6ece0'],y:['#4a3f1f','#cdaa50','#f5ebcb'],r:['#4d3023','#d98e68','#f7e1d6'],fire:['#4f2926','#d9776e','#f6d8d4']};
const SEL={work:'.bar',review:'.bar.review',pause:'.bar.pause',done:'.bar.done',g:'.bar.dl-g',y:'.bar.dl-y',r:'.bar.dl-r',fire:'.bar.dl-fire'};
function rule(pre,k,c){
 const s=SEL[k].split(',').map(x=>pre+x).join(',');
 return s+'{background:'+c[0]+'!important;color:'+c[2]+'!important;border:1px solid '+c[1]+'!important;border-left:4px solid '+c[1]+'!important;border-radius:8px!important;box-shadow:none!important;animation:none!important}';
}
let css='';
Object.keys(L).forEach(k=>{css+=rule('html body ',k,L[k]);});
Object.keys(D).forEach(k=>{css+=rule('html[data-theme=dark] body ',k,D[k]);});
css+='html body .bar .bt{color:inherit!important}';
css+='html body .bar.done{opacity:.8}';
css+='html body .pday .pb{background:hsl(var(--h),38%,91%);border-left-color:hsl(var(--h),30%,50%);color:#243042}';
css+='html body .pday .pb.fx{box-shadow:inset 0 0 0 2px hsl(var(--h),30%,50%)}';
css+='html body .pday .pab{background:hsl(var(--h),36%,93%);border-color:hsl(var(--h),30%,50%);color:#243042}';
css+='html[data-theme=dark] body .pday .pb{background:hsl(var(--h),20%,24%);border-left-color:hsl(var(--h),30%,58%);color:#e8edf3}';
css+='html[data-theme=dark] body .pday .pab{background:hsl(var(--h),18%,22%);border-color:hsl(var(--h),30%,58%);color:#e8edf3}';
const st=document.createElement('style');
st.textContent=css;
document.head.appendChild(st);
const HUES=[212,168,142,38,262,190];
function hues(){
 document.querySelectorAll('.pday').forEach(box=>{
  let i=0;
  box.querySelectorAll('.pb,.pab').forEach(b=>{b.style.setProperty('--h',String(HUES[i++%HUES.length]));});
 });
}
const oR=render;
render=function(){const r=oR.apply(this,arguments);try{hues();}catch(e){}return r;};
try{hues();}catch(e){}
})();
