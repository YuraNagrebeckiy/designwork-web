'use strict';
(function(){
const CH=4*1024*1024;
const st=document.createElement('style');
st.textContent=`.mgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;margin:10px 0}
.mgrid>p{grid-column:1/-1}
.mtile{position:relative;aspect-ratio:1/1;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--bg);display:flex;align-items:center;justify-content:center;text-align:center;font-size:12px;color:var(--muted);cursor:pointer}
.mtile img{width:100%;height:100%;object-fit:cover;display:block}
.mtile span{padding:6px;overflow-wrap:anywhere}
.mtile:hover{border-color:var(--accent)}
.mx{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;font-size:14px;line-height:22px;text-align:center}
#md_view{margin:10px 0;border:1px solid var(--line);border-radius:10px;padding:8px}
#md_view img{max-width:100%;max-height:70dvh;display:block;margin:6px auto}
#md_view iframe{width:100%;height:65dvh;border:0}`;
document.head.appendChild(st);

let pid='',tid='',items=[],busy=false,viewUrl='',thumbBusy=false;
const thumbCache={};
let thumbTried={};
const msg=t=>{const e=$('md_state');if(e)e.textContent=t;};

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
 const s=await fcall('fileStart',{taskId:tid,name:file.name,mime:file.type||'application/octet-stream',size:file.size},60000);
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

async function fetchAll(fid,size,onp){
 if(!size)return {blob:new Blob([])};
 const parts=[];let off=0,total=0,mime='';
 for(;;){
  const r=await fcall('fileGet',{taskId:tid,id:fid,offset:off,length:CH},120000);
  total=Number(r.size)||0;mime=r.mime||'';
  const bin=atob(r.data),u=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  parts.push(u);off+=u.length;
  if(onp)onp(total?Math.min(100,Math.round(off*100/total)):0);
  if(r.whole||!u.length||(total&&off>=total))break;
 }
 return {blob:new Blob(parts,{type:mime})};
}

function tileHtml(f){
 const label=f.kind==='link'?'Ссылка: '+f.name:f.name;
 const x=f.canDelete?`<b class='mx' data-m='del' data-fid='${esc(f.id)}' title='Удалить'>×</b>`:'';
 const body=thumbCache[f.id]?`<img alt='' src='${thumbCache[f.id]}'>`:`<span>${esc(label)}</span>`;
 return `<div class='mtile' data-m='open' data-fid='${esc(f.id)}' title='${esc(f.name)}'>${body}${x}</div>`;
}

function drawGrid(){
 const g=$('md_grid');
 if(!g)return;
 g.innerHTML=items.length?items.map(tileHtml).join(''):`<p class='notice'>Пока пусто. Добавьте референсы: картинки, PDF или ссылки.</p>`;
}

async function loadThumbs(){
 if(thumbBusy)return;
 thumbBusy=true;
 try{
  const need=items.filter(f=>f.kind==='file'&&(f.mime||'').indexOf('image/')===0&&!thumbCache[f.id]&&!thumbTried[f.id]);
  for(let i=0;i<need.length;i+=6){
   if(!$('md_grid')||!tid)return;
   const ids=need.slice(i,i+6).map(f=>f.id);
   ids.forEach(k=>{thumbTried[k]=1;});
   try{
    const r=await fcall('fileThumbs',{taskId:tid,ids:ids},60000);
    Object.keys(r||{}).forEach(k=>{thumbCache[k]='data:'+r[k].mime+';base64,'+r[k].data;});
   }catch(e){}
   drawGrid();
  }
 }finally{thumbBusy=false;}
}

function addHtml(){
 return `<h3>Добавить</h3><label>Картинки и файлы с устройства (размер не ограничен)<input id='md_file' type='file' multiple accept='image/*,application/pdf'></label><label>Или ссылка на референс (Pinterest, Google Диск и другое)<input id='md_url' type='url' placeholder='https://…' maxlength='1000'></label><label>Название ссылки (необязательно)<input id='md_lname' maxlength='150'></label><button type='button' id='md_addlink'>Добавить ссылку</button>`;
}

function setCount(n){
 if(!state)return;
 state.files=state.files||{};
 if(n)state.files[tid]=n;else delete state.files[tid];
 decorate(true);
}

async function refresh(){
 if(!$('md_grid'))return;
 try{
  const d=await fcall('fileList',{taskId:tid},40000);
  if(!$('md_grid'))return;
  items=d.files||[];
  drawGrid();
  const add=$('md_add');
  if(add&&!add.dataset.ready){
   add.dataset.ready='1';
   add.innerHTML=d.canAdd?addHtml():`<p class='notice'>Мудборд ведут руководитель и команда объекта. Вы можете смотреть и скачивать.</p>`;
   if(d.folderUrl&&String(d.folderUrl).indexOf('https://')===0)add.insertAdjacentHTML('beforeend',`<p><a class='btnlike' href='${esc(d.folderUrl)}' target='_blank' rel='noopener noreferrer'>Открыть папку на Google Диске</a></p>`);
  }
  setCount(items.length);
  loadThumbs();
 }catch(e){
  const g=$('md_grid');if(g)g.innerHTML=`<p class='error'>${esc(e.message||String(e))}</p>`;
 }
}

function closeView(){
 if(viewUrl){URL.revokeObjectURL(viewUrl);viewUrl='';}
 const box=$('md_view');
 if(box){box.innerHTML='';box.classList.add('hidden');}
}

function openMood(id){
 if(!state)return;
 pid=id;tid='mood:'+id;items=[];busy=false;thumbTried={};
 showForm(`<h2>Мудборд</h2><p class='notice'>${esc(projectName(id))}</p><div id='md_grid' class='mgrid'><p class='notice'>Загрузка…</p></div><div id='md_view' class='hidden'></div><p class='notice' id='md_state'></p><div id='md_add'></div>`,async()=>{});
 const ft=$('editform').querySelector('.footer');
 if(ft)ft.innerHTML=`<button type='button' data-action='close'>Закрыть</button>`;
 refresh();
}

async function download(f){
 if(f.kind==='link'){window.open(f.url,'_blank','noopener');return;}
 if(busy)return;
 busy=true;
 try{
  msg('Скачивание — 0%');
  const r=await fetchAll(f.id,f.size,p=>msg('Скачивание «'+f.name+'» — '+p+'%'));
  msg('');
  const u=URL.createObjectURL(r.blob),a=document.createElement('a');
  a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),60000);
 }catch(err){msg('');toast(err.message||String(err));}
 finally{busy=false;}
}

async function openItem(f){
 if(f.kind==='link'){
  if(String(f.url).indexOf('https://')===0)window.open(f.url,'_blank','noopener');
  return;
 }
 const mime=f.mime||'',isImg=mime.indexOf('image/')===0,isPdf=mime==='application/pdf'||String(f.name).toLowerCase().endsWith('.pdf');
 if(!isImg&&!isPdf){download(f);return;}
 if(busy)return;
 busy=true;
 try{
  msg('Загрузка — 0%');
  const r=await fetchAll(f.id,f.size,p=>msg('Загрузка — '+p+'%'));
  msg('');
  closeView();
  const box=$('md_view');if(!box)return;
  box.classList.remove('hidden');
  box.innerHTML=`<div class='toolbar'><b>${esc(f.name)}</b><button type='button' data-m='dl' data-fid='${esc(f.id)}'>Скачать</button><button type='button' data-m='close'>Закрыть</button></div><div id='md_body'></div>`;
  viewUrl=URL.createObjectURL(isPdf?r.blob.slice(0,r.blob.size,'application/pdf'):r.blob);
  const el=document.createElement(isPdf?'iframe':'img');
  el.src=viewUrl;
  if(!isPdf)el.alt=f.name;
  $('md_body').appendChild(el);
  box.scrollIntoView({block:'nearest'});
 }catch(err){msg('');toast(err.message||String(err));}
 finally{busy=false;}
}

async function addLink(){
 if(busy)return;
 const u=$('md_url');if(!u)return;
 const url=u.value.trim();
 if(!url){toast('Вставьте ссылку');return;}
 busy=true;
 try{
  await fcall('fileLink',{taskId:tid,url:url,name:$('md_lname').value},60000);
  u.value='';$('md_lname').value='';
  await refresh();
 }catch(err){toast(err.message||String(err));}
 finally{busy=false;}
}

function decorate(update){
 if(!state||view!=='projects'||!projectId)return;
 const tb=document.querySelector('#content .toolbar');
 if(!tb)return;
 const n=(state.files||{})['mood:'+projectId]||0,label=n?'Мудборд ('+n+')':'Мудборд';
 let b=tb.querySelector('[data-mood]');
 if(b){b.textContent=label;return;}
 if(update)return;
 b=document.createElement('button');
 b.type='button';b.dataset.mood=projectId;b.textContent=label;
 tb.appendChild(b);
}

document.addEventListener('click',async e=>{
 const mb=e.target.closest('[data-mood]');
 if(mb){openMood(mb.dataset.mood);return;}
 if(e.target.closest('#md_addlink')){addLink();return;}
 const b=e.target.closest('[data-m]');
 if(!b||!tid)return;
 const act=b.dataset.m;
 if(act==='close'){closeView();return;}
 const f=items.find(x=>x.id===b.dataset.fid);
 if(!f)return;
 if(act==='open')openItem(f);
 else if(act==='dl')download(f);
 else if(act==='del'){
  if(busy||!confirm('Удалить «'+f.name+'» из мудборда?'))return;
  busy=true;
  try{await fcall('fileDelete',{taskId:tid,id:f.id},60000);closeView();await refresh();}
  catch(err){toast(err.message||String(err));}
  finally{busy=false;}
 }
});

document.addEventListener('keydown',e=>{
 if(e.key==='Enter'&&e.target&&(e.target.id==='md_url'||e.target.id==='md_lname')){e.preventDefault();addLink();}
});

document.addEventListener('change',async e=>{
 const el=e.target;
 if(!el||el.id!=='md_file')return;
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

$('dialog').addEventListener('close',()=>{closeView();tid='';pid='';busy=false;});

const oRender=render;
render=function(){const r=oRender.apply(this,arguments);try{decorate();}catch(e){}return r;};
if(state)render();
})();
