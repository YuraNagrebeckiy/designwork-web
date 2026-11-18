'use strict';
(function(){
let tries=0;
function init(){
 const D=window.DIO;
 if(!D||typeof D.fcall!=='function'){if(++tries<50)setTimeout(init,100);return;}
 let PID='',LAST='',FILES=[];
 const orig=D.fcall;
 D.fcall=function(name,params){
  if(params&&params.projectId)PID=params.projectId;
  return orig.apply(this,arguments);
 };
 const ruD=d=>d?d.slice(8,10)+'.'+d.slice(5,7)+'.'+d.slice(0,4):'';
 const fsize=n=>{n=Number(n)||0;return n>=1e6?(n/1e6).toFixed(1)+' МБ':Math.max(1,Math.ceil(n/1024))+' КБ';};
 const q=id=>document.getElementById(id);
 async function browse(target,fid,retry){
  const box=q('pk_list');
  if(!box)return;
  if(!PID){box.textContent='Откройте комплектацию объекта заново';return;}
  box.textContent='Загружаю…';
  try{
   const r=await orig.call(D,'supplyDo',{op:'fileList',projectId:PID,folderId:fid||''},60000);
   LAST=r.path.length>1?r.path[r.path.length-1].id:'';
   FILES=r.files||[];
   const t=esc(target);
   let h=`<div class='pk-path'>`+r.path.map((p,i)=>`<button type='button' data-pkd='${esc(p.id)}' data-target='${t}'>${i?'':'📁 '}${esc(p.name)}</button>`).join(' › ')+`</div>`;
   h+=r.folders.map(f=>`<button type='button' class='pkf' data-pkd='${esc(f.id)}' data-target='${t}'>📁 ${esc(f.name)}</button>`).join('');
   h+=FILES.map((f,i)=>`<button type='button' class='pkf' data-pkfile='${i}' data-target='${t}'>${esc(f.name)}<small>${esc(ruD(String(f.date)))} · ${fsize(f.size)}</small></button>`).join('');
   if(!r.folders.length&&!FILES.length)h+=`<p class='notice'>Папка пустая.</p>`;
   box.innerHTML=h;
  }catch(err){
   if(fid&&!retry){LAST='';browse(target,'',true);return;}
   box.textContent=err.message||String(err);
  }
 }
 document.addEventListener('click',e=>{
  const t=e.target.closest&&e.target.closest('[data-pick],[data-pkd],[data-pkfile]');
  if(!t)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  if(t.dataset.pick!==undefined){browse(t.dataset.pick,LAST);return;}
  if(t.dataset.pkd!==undefined){browse(t.dataset.target,t.dataset.pkd);return;}
  const f=FILES[Number(t.dataset.pkfile)],inp=q(t.dataset.target),box=q('pk_list');
  if(f&&inp){
   inp.value=f.url;
   inp.dataset.fname=f.name;
   if(box)box.innerHTML=`<p class='notice'>Выбрано: <b>${esc(f.name)}</b>. Нажмите «Сохранить».</p>`;
  }
 },true);
}
init();
})();
