'use strict';
(function(){
if(typeof document==='undefined'||typeof showForm==='undefined'||typeof window.renderSupply!=='function'||!window.DIO)return;
const D=window.DIO;
const st=document.createElement('style');
st.textContent='.sf-btn{display:inline-flex;align-items:center;gap:4px;min-height:32px;padding:3px 10px;border-radius:16px;border:1px solid var(--line);background:var(--panel);color:var(--muted);margin-left:auto}.sf-btn.has{background:var(--accent);border-color:var(--accent);color:#fff}.sf-btn b{font-size:11px}.sf-row{border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin:6px 0;display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center}.sf-row .fn{flex:1 1 180px;min-width:0;overflow-wrap:anywhere}.sf-row button,.sf-row a{min-height:36px;padding:5px 10px}';
document.head.appendChild(st);
let cur={box:null,pid:''},counts={},busy=false,tid='',files=[];
const seen=new WeakSet(),orig=window.renderSupply;
const p2=n=>String(n).padStart(2,'0');
const fmtSize=n=>{n=Number(n)||0;if(n<1024)return n+' Б';if(n<1048576)return (n/1024).toFixed(1).replace('.',',')+' КБ';if(n<1073741824)return (n/1048576).toFixed(1).replace('.',',')+' МБ';return (n/1073741824).toFixed(2).replace('.',',')+' ГБ';};
const fmtAt=s=>{const d=new Date(s);return isNaN(d)?'':p2(d.getDate())+'.'+p2(d.getMonth()+1)+' '+p2(d.getHours())+':'+p2(d.getMinutes());};
const msg=t=>{const e=document.getElementById('sf_state');if(e)e.textContent=t;};
function go(u){const a=document.createElement('a');a.href=u;a.rel='noopener noreferrer';document.body.appendChild(a);a.click();a.remove();}
function setBtn(b,n){b.classList.toggle('has',n>0);b.innerHTML='📎'+(n?' <b>'+n+'</b>':'');b.title=n?'Файлов: '+n:'Прикрепить файл';}
function key(iid){return 'supply:'+cur.pid+'#'+iid;}

function decorate(box){
 box.querySelectorAll('.s2-item').forEach(it=>{
  if(it.querySelector('.sf-btn'))return;
  const e=it.querySelector('[data-iid]'),h=it.querySelector('.s2-h'),t=it.querySelector('.s2-t b');
  if(!e||!h)return;
  const b=document.createElement('button');
  b.type='button';b.className='sf-btn';b.dataset.sfi=e.dataset.iid;b.dataset.t=t?t.textContent:'';
  b.setAttribute('aria-label','Файлы позиции');
  setBtn(b,counts[key(e.dataset.iid)]||0);
  h.appendChild(b);
 });
}
function watch(box){
 if(seen.has(box)){decorate(box);return;}
 seen.add(box);
 new MutationObserver(()=>decorate(box)).observe(box,{childList:true});
 decorate(box);
}
async function loadCounts(box,pid){
 try{
  const c=await D.fcall('fileCountsSupply',{projectId:pid},40000);
  if(cur.pid!==pid)return;
  counts=c||{};
  box.querySelectorAll('.sf-btn').forEach(b=>setBtn(b,counts['supply:'+pid+'#'+b.dataset.sfi]||0));
 }catch(e){}
}
window.renderSupply=function(box,pid){
 cur={box:box,pid:pid};
 const r=orig.apply(this,arguments);
 watch(box);
 loadCounts(box,pid);
 return r;
};

function rowHtml(f){
 const meta=esc(f.by||'')+' • '+fmtAt(f.at)+(f.kind==='file'?' • '+fmtSize(f.size):' • ссылка');
 let btns='';
 if(f.kind==='link'){if(String(f.url).indexOf('https://')===0)btns+=`<a class='btnlike' href='${esc(f.url)}' target='_blank' rel='noopener noreferrer'>Открыть</a>`;}
 else btns+=`<button type='button' data-sf='dl' data-fid='${esc(f.id)}'>Скачать</button>`;
 if(f.canDelete)btns+=`<button type='button' class='danger' data-sf='del' data-fid='${esc(f.id)}'>Удалить</button>`;
 return `<div class='sf-row'><div class='fn'><b>${esc(f.name)}</b><br><small>${meta}</small></div>${btns}</div>`;
}

async function refresh(){
 const box=document.getElementById('sf_list');
 if(!box)return;
 try{
  const d=await D.fcall('fileList',{taskId:tid},40000);
  const b2=document.getElementById('sf_list');
  if(!b2)return;
  files=d.files||[];
  b2.innerHTML=files.length?files.map(rowHtml).join(''):`<p class='notice'>Пока ничего нет.</p>`;
  const add=document.getElementById('sf_add');
  if(add&&!add.dataset.ready){
   add.dataset.ready='1';
   add.innerHTML=d.canAdd?`<label>Файл с устройства (смета, счёт, чертёж)<input id='sf_file' type='file' multiple></label>`:`<p class='notice'>Файлы добавляет руководитель или команда объекта.</p>`;
  }
  counts[tid]=files.length;
  document.querySelectorAll('.sf-btn').forEach(b=>{if(key(b.dataset.sfi)===tid)setBtn(b,files.length);});
 }catch(e){box.innerHTML=`<p class='error'>${esc(e.message||String(e))}</p>`;}
}

function openDlg(iid,title){
 tid=key(iid);files=[];busy=false;
 showForm(`<h2>Файлы позиции</h2><p class='notice'>${esc(title)}</p><div id='sf_list'><p class='notice'>Загрузка…</p></div><p class='notice' id='sf_state'></p><div id='sf_add'></div>`,async()=>{});
 const ft=document.getElementById('editform').querySelector('.footer');
 if(ft)ft.innerHTML=`<button type='button' data-action='close'>Закрыть</button>`;
 refresh();
}

document.addEventListener('click',async e=>{
 const c=e.target.closest('.sf-btn');
 if(c){e.preventDefault();openDlg(c.dataset.sfi,c.dataset.t||'');return;}
 const b=e.target.closest('[data-sf]');
 if(!b)return;
 const f=files.find(x=>x.id===b.dataset.fid);
 if(!f||busy)return;
 busy=true;
 try{
  if(b.dataset.sf==='dl'){
   if(f.yd){const r=await D.fcall('fileUrl',{taskId:tid,id:f.id},60000);go(r.href);}
   else{msg('Скачивание — 0%');const blob=await D.fetchAll(tid,f.id,f.size,p=>msg('Скачивание «'+f.name+'» — '+p+'%'));msg('');D.saveBlob(blob,f.name);}
  }else if(b.dataset.sf==='del'){
   if(!confirm('Удалить файл «'+f.name+'»?'))return;
   await D.fcall('fileDelete',{taskId:tid,id:f.id},60000);
   await refresh();
  }
 }catch(err){msg('');toast(err.message||String(err));}
 finally{busy=false;}
});

document.addEventListener('change',async e=>{
 const el=e.target;
 if(!el||el.id!=='sf_file')return;
 const list=Array.from(el.files||[]);
 el.value='';
 if(!list.length||busy)return;
 busy=true;
 try{
  for(let i=0;i<list.length;i++){
   const f=list[i],tag='Файл '+(i+1)+' из '+list.length+': '+f.name;
   msg(tag+' — 0%');
   await D.upload(tid,f,p=>msg(tag+' — '+p+'%'));
   await refresh();
  }
  msg('Готово');
 }catch(err){msg('');toast(err.message||String(err));await refresh();}
 finally{busy=false;}
});

const dlg=document.getElementById('dialog');
if(dlg)dlg.addEventListener('close',()=>{tid='';busy=false;});
const live=document.querySelector('#content');
if(live){const b=live.querySelector('.s2-item');if(b&&b.parentElement){cur.box=b.parentElement;watch(cur.box);}}
})();
