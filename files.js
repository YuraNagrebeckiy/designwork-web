'use strict';
(function(){
const CH=4*1024*1024;
const SVG=`<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48'/></svg>`;
const st=document.createElement('style');
st.textContent=`.card[data-drag]{position:relative}
.card[data-drag]>.row{padding-right:46px}
.clipbtn{position:absolute;top:8px;right:8px;display:inline-flex;align-items:center;justify-content:center;gap:3px;min-height:32px;min-width:32px;padding:3px 7px;border-radius:16px;border:1px solid var(--line);background:var(--panel);color:var(--muted);z-index:3}
.clipbtn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.clipbtn.has{background:var(--accent);border-color:var(--accent);color:#fff}
html[data-theme=dark] .clipbtn.has{color:#15171d}
.clipbtn.has svg{stroke-width:2.6}
.clipbtn b{font-size:11px;font-weight:700}
.frow{border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin:6px 0;display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center}
.frow .fn{flex:1 1 180px;min-width:0;overflow-wrap:anywhere}
.frow button,.btnlike{min-height:36px;padding:5px 10px}
.btnlike{display:inline-flex;align-items:center;border:1px solid var(--line);border-radius:9px;color:var(--ink);text-decoration:none;background:var(--panel)}
#fl_view{margin:10px 0;border:1px solid var(--line);border-radius:10px;padding:8px}
#fl_view img,#fl_view video{max-width:100%;height:auto;display:block;margin:6px auto}
#fl_view audio{width:100%}
#fl_view iframe{width:100%;height:65dvh;border:0}
#fl_view pre{white-space:pre-wrap;overflow:auto;max-height:60dvh;margin:6px 0;font-size:13px}`;
document.head.appendChild(st);

let cur='',files=[],busy=false,viewUrl='';
const TEXT_EXT=['txt','csv','json','md','log','xml','ini','yml','yaml','tsv'];
const p2=n=>String(n).padStart(2,'0');
const fmtSize=n=>{n=Number(n)||0;if(n<1024)return n+' Б';if(n<1048576)return (n/1024).toFixed(1).replace('.',',')+' КБ';if(n<1073741824)return (n/1048576).toFixed(1).replace('.',',')+' МБ';return (n/1073741824).toFixed(2).replace('.',',')+' ГБ';};
const fmtAt=s=>{const d=new Date(s);return isNaN(d)?'':p2(d.getDate())+'.'+p2(d.getMonth()+1)+' '+p2(d.getHours())+':'+p2(d.getMinutes());};
const msg=t=>{const e=$('fl_state');if(e)e.textContent=t;};

async function fcall(action,payload,ms){
 const API=String(window.STUDIO_API||'').trim();
 const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),ms||60000);
 try{
  const res=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:action,payload:payload,token:token}),signal:ctl.signal,redirect:'follow'});
  if(!res.ok)throw Error('Сервер недоступен ('+res.status+')');
  const r=await res.json();
  if(!r.ok){if(String(r.error).startsWith('AUTH:'))signoutLocal();throw Error(r.error);}
  return r.data;
 }catch(e){
  throw Error(e.name==='AbortError'?'Сервер отвечает слишком долго. Повторите.':(e.message||String(e)));
 }finally{clearTimeout(to);}
}

function b64(buf){const u=new Uint8Array(buf),n=0x8000;let s='';for(let i=0;i<u.length;i+=n)s+=String.fromCharCode.apply(null,u.subarray(i,i+n));return btoa(s);}

async function upload(file,onp){
 const s=await fcall('fileStart',{taskId:cur,name:file.name,mime:file.type||'application/octet-stream',size:file.size},60000);
 if(s.done)return;
 let off=0;
 while(off<file.size){
  const end=Math.min(off+CH,file.size),data=b64(await file.slice(off,end).arrayBuffer());
  let ok=false,err=null,fin=false;
  for(let k=0;k<3&&!ok;k++){
   try{const r=await fcall('fileChunk',{upId:s.upId,offset:off,data:data},180000);ok=true;fin=!!r.done;}
   catch(e){err=e;await new Promise(r=>setTimeout(r,1500*(k+1)));}
  }
  if(!ok)throw err;
  off=end;
  onp(Math.round(off*100/file.size));
  if(fin)return;
 }
}

async function fetchAll(fid,size,onp,stopAt){
 if(!size)return {blob:new Blob([]),partial:false};
 const parts=[];let off=0,total=0,mime='';
 for(;;){
  const r=await fcall('fileGet',{taskId:cur,id:fid,offset:off,length:CH},120000);
  total=Number(r.size)||0;mime=r.mime||'';
  const bin=atob(r.data),u=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  parts.push(u);off+=u.length;
  if(onp)onp(total?Math.min(100,Math.round(off*100/total)):0);
  if(r.whole||!u.length||(total&&off>=total)||(stopAt&&off>=stopAt))break;
 }
 return {blob:new Blob(parts,{type:mime}),partial:total>off};
}

function kindOf(f){
 const m=f.mime||'',n=String(f.name||'').toLowerCase(),ext=n.indexOf('.')>=0?n.split('.').pop():'';
 if(m.indexOf('image/')===0)return 'img';
 if(m==='application/pdf'||ext==='pdf')return 'pdf';
 if(m.indexOf('video/')===0)return 'video';
 if(m.indexOf('audio/')===0)return 'audio';
 if(m.indexOf('text/')===0||m==='application/json'||TEXT_EXT.indexOf(ext)>=0)return 'text';
 return '';
}

function listHtml(){
 if(!files.length)return `<p class='notice'>Пока ничего нет.</p>`;
 return files.map(f=>{
  const meta=esc(f.by||'')+' • '+fmtAt(f.at)+(f.kind==='file'?' • '+fmtSize(f.size):' • ссылка');
  let btns='';
  if(f.kind==='link'){
   if(String(f.url).indexOf('https://')===0)btns=`<a class='btnlike' href='${esc(f.url)}' target='_blank' rel='noopener noreferrer'>Открыть</a>`;
  }else{
   if(kindOf(f))btns+=`<button type='button' data-fa='view' data-fid='${esc(f.id)}'>Просмотр</button>`;
   btns+=`<button type='button' data-fa='dl' data-fid='${esc(f.id)}'>Скачать</button>`;
  }
  if(f.canDelete)btns+=`<button type='button' class='danger' data-fa='del' data-fid='${esc(f.id)}'>Удалить</button>`;
  return `<div class='frow'><div class='fn'><b>${esc(f.name)}</b><br><small>${meta}</small></div>${btns}</div>`;
 }).join('');
}

function addHtml(){
 return `<h3>Добавить</h3><label>Файл с устройства (размер не ограничен)<input id='fl_file' type='file' multiple></label><label>Или ссылка на готовый файл (Google Диск и другое)<input id='fl_url' type='url' placeholder='https://drive.google.com/…' maxlength='1000'></label><label>Название ссылки (необязательно)<input id='fl_lname' maxlength='150'></label><button type='button' id='fl_addlink'>Добавить ссылку</button><p class='notice'>Чтобы коллеги открыли ссылку, у них должен быть доступ к этому файлу в Google.</p>`;
}

function clipHtml(n){return SVG+(n?`<b>${n}</b>`:'');}
function setClip(id,n){
 if(!state)return;
 state.files=state.files||{};
 if(n)state.files[id]=n;else delete state.files[id];
 document.querySelectorAll('.clipbtn').forEach(b=>{if(b.dataset.clip!==id)return;b.classList.toggle('has',n>0);b.title=n?'Файлов: '+n:'Файлов нет';b.innerHTML=clipHtml(n);});
}

function decorate(){
 if(!state||!state.me)return;
 const f=state.files||{};
 document.querySelectorAll('#content .card[data-drag]').forEach(c=>{
  if(c.querySelector('.clipbtn'))return;
  const id=c.dataset.drag,n=f[id]||0,b=document.createElement('button');
  b.type='button';b.className='clipbtn'+(n?' has':'');b.dataset.clip=id;
  b.title=n?'Файлов: '+n:'Файлов нет';b.setAttribute('aria-label',b.title);
  b.innerHTML=clipHtml(n);
  c.appendChild(b);
 });
}

async function refresh(){
 if(!$('fl_list'))return;
 try{
  const d=await fcall('fileList',{taskId:cur},40000);
  const box=$('fl_list');if(!box)return;
  files=d.files||[];
  box.innerHTML=listHtml();
  const add=$('fl_add');
  if(add&&!add.dataset.ready){
   add.dataset.ready='1';
   add.innerHTML=d.canAdd?addHtml():`<p class='notice'>Наблюдатели могут только просматривать и скачивать.</p>`;
   if(d.folderUrl&&String(d.folderUrl).indexOf('https://')===0)add.insertAdjacentHTML('beforeend',`<p><a class='btnlike' href='${esc(d.folderUrl)}' target='_blank' rel='noopener noreferrer'>Открыть папку на Google Диске</a></p>`);
  }
  setClip(cur,files.length);
 }catch(e){
  const box=$('fl_list');if(box)box.innerHTML=`<p class='error'>${esc(e.message||String(e))}</p>`;
 }
}

function closeView(){
 if(viewUrl){URL.revokeObjectURL(viewUrl);viewUrl='';}
 const box=$('fl_view');
 if(box){box.innerHTML='';box.classList.add('hidden');}
}

function openFiles(id){
 const t=state&&state.tasks.find(x=>x.id===id);
 if(!t)return;
 cur=id;files=[];busy=false;
 showForm(`<h2>Файлы задачи</h2><p class='notice'>${esc(t.title)}</p><div id='fl_list'><p class='notice'>Загрузка…</p></div><div id='fl_view' class='hidden'></div><p class='notice' id='fl_state'></p><div id='fl_add'></div>`,async()=>{});
 const ft=$('editform').querySelector('.footer');
 if(ft)ft.innerHTML=`<button type='button' data-action='close'>Закрыть</button>`;
 refresh();
}

async function viewFile(f){
 if(busy)return;
 const k=kindOf(f);
 if(!k)return;
 if(k!=='text'&&f.size>200*1048576){toast('Файл слишком большой для просмотра. Скачайте его.');return;}
 busy=true;
 try{
  msg('Загрузка для просмотра — 0%');
  const r=await fetchAll(f.id,f.size,p=>msg('Загрузка для просмотра — '+p+'%'),k==='text'?CH:0);
  msg('');
  closeView();
  const box=$('fl_view');if(!box)return;
  box.classList.remove('hidden');
  box.innerHTML=`<div class='toolbar'><b>${esc(f.name)}</b><button type='button' data-fa='close'>Закрыть просмотр</button></div><div id='fl_body'></div>`;
  const body=$('fl_body');
  if(k==='text'){
   const pre=document.createElement('pre');
   pre.textContent=await r.blob.text();
   body.appendChild(pre);
   if(r.partial)body.insertAdjacentHTML('beforeend',`<p class='notice'>Показано начало файла. Остальное — после скачивания.</p>`);
  }else{
   const blob=k==='pdf'?r.blob.slice(0,r.blob.size,'application/pdf'):r.blob;
   viewUrl=URL.createObjectURL(blob);
   let el;
   if(k==='img'){el=document.createElement('img');el.alt=f.name;el.onerror=()=>toast('Браузер не может показать этот формат. Скачайте файл.');}
   else if(k==='pdf'){el=document.createElement('iframe');el.title=f.name;}
   else{el=document.createElement(k);el.controls=true;if(k==='video')el.setAttribute('playsinline','');}
   el.src=viewUrl;
   body.appendChild(el);
  }
  box.scrollIntoView({block:'nearest'});
 }catch(err){
  msg('');toast(err.message||String(err));
 }finally{busy=false;}
}

async function downloadFile(f){
 if(busy)return;
 busy=true;
 try{
  msg('Скачивание — 0%');
  const r=await fetchAll(f.id,f.size,p=>msg('Скачивание «'+f.name+'» — '+p+'%'),0);
  msg('');
  const u=URL.createObjectURL(r.blob),a=document.createElement('a');
  a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),60000);
 }catch(err){
  msg('');toast(err.message||String(err));
 }finally{busy=false;}
}

async function addLink(){
 if(busy)return;
 const u=$('fl_url');if(!u)return;
 const url=u.value.trim();
 if(!url){toast('Вставьте ссылку на файл');return;}
 busy=true;
 try{
  await fcall('fileLink',{taskId:cur,url:url,name:$('fl_lname').value},60000);
  u.value='';$('fl_lname').value='';
  await refresh();
 }catch(err){toast(err.message||String(err));}
 finally{busy=false;}
}

document.addEventListener('click',async e=>{
 const c=e.target.closest('.clipbtn');
 if(c){e.preventDefault();openFiles(c.dataset.clip);return;}
 if(e.target.closest('#fl_addlink')){addLink();return;}
 const b=e.target.closest('[data-fa]');
 if(!b)return;
 const act=b.dataset.fa;
 if(act==='close'){closeView();return;}
 const f=files.find(x=>x.id===b.dataset.fid);
 if(!f)return;
 if(act==='view')viewFile(f);
 else if(act==='dl')downloadFile(f);
 else if(act==='del'){
  if(busy||!confirm('Удалить файл «'+f.name+'»?'))return;
  busy=true;
  try{await fcall('fileDelete',{taskId:cur,id:f.id},60000);if(!$('fl_view').classList.contains('hidden'))closeView();await refresh();}
  catch(err){toast(err.message||String(err));}
  finally{busy=false;}
 }
});

document.addEventListener('keydown',e=>{
 if(e.key==='Enter'&&e.target&&(e.target.id==='fl_url'||e.target.id==='fl_lname')){e.preventDefault();addLink();}
});

document.addEventListener('change',async e=>{
 const el=e.target;
 if(!el||el.id!=='fl_file')return;
 const list=Array.from(el.files||[]);
 el.value='';
 if(!list.length||busy)return;
 busy=true;
 try{
  for(let i=0;i<list.length;i++){
   const f=list[i],tag='Файл '+(i+1)+' из '+list.length+': '+f.name;
   msg(tag+' — 0%');
   await upload(f,p=>msg(tag+' — '+p+'%'));
   await refresh();
  }
  msg('Готово');
 }catch(err){
  msg('');toast(err.message||String(err));
  await refresh();
 }finally{busy=false;}
});

$('dialog').addEventListener('close',()=>{closeView();cur='';busy=false;});

const oRender=render;
render=function(){const r=oRender.apply(this,arguments);try{decorate();}catch(e){}return r;};
if(state)render();
})();
