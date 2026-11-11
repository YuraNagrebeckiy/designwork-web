'use strict';
(function(){
const D=window.DIO;
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
#fl_view img{max-width:100%;max-height:70dvh;display:block;margin:6px auto}
#fl_view iframe{width:100%;height:65dvh;border:0}`;
document.head.appendChild(st);

let cur='',files=[],busy=false,shared=false;
const p2=n=>String(n).padStart(2,'0');
const fmtSize=n=>{n=Number(n)||0;if(n<1024)return n+' Б';if(n<1048576)return (n/1024).toFixed(1).replace('.',',')+' КБ';if(n<1073741824)return (n/1048576).toFixed(1).replace('.',',')+' МБ';return (n/1073741824).toFixed(2).replace('.',',')+' ГБ';};
const fmtAt=s=>{const d=new Date(s);return isNaN(d)?'':p2(d.getDate())+'.'+p2(d.getMonth()+1)+' '+p2(d.getHours())+':'+p2(d.getMinutes());};
const msg=t=>{const e=$('fl_state');if(e)e.textContent=t;};
const direct=f=>shared&&f.kind==='file'&&D.okId(f.driveId);

function listHtml(){
 if(!files.length)return `<p class='notice'>Пока ничего нет.</p>`;
 return files.map(f=>{
  const meta=esc(f.by||'')+' • '+fmtAt(f.at)+(f.kind==='file'?' • '+fmtSize(f.size):' • ссылка');
  let btns='';
  if(f.kind==='link'){
   if(String(f.url).indexOf('https://')===0)btns=`<a class='btnlike' href='${esc(f.url)}' target='_blank' rel='noopener noreferrer'>Открыть</a>`;
  }else{
   if(direct(f))btns+=`<button type='button' data-fa='view' data-fid='${esc(f.id)}'>Просмотр</button>`;
   btns+=`<button type='button' data-fa='dl' data-fid='${esc(f.id)}'>Скачать</button>`;
  }
  if(f.canDelete)btns+=`<button type='button' class='danger' data-fa='del' data-fid='${esc(f.id)}'>Удалить</button>`;
  return `<div class='frow'><div class='fn'><b>${esc(f.name)}</b><br><small>${meta}</small></div>${btns}</div>`;
 }).join('');
}

function addHtml(){
 return `<h3>Добавить</h3><label>Файл с устройства (размер не ограничен, грузится прямо на Google Диск)<input id='fl_file' type='file' multiple></label><label>Или ссылка на готовый файл (Google Диск и другое)<input id='fl_url' type='url' placeholder='https://drive.google.com/…' maxlength='1000'></label><label>Название ссылки (необязательно)<input id='fl_lname' maxlength='150'></label><button type='button' id='fl_addlink'>Добавить ссылку</button><p class='notice'>Чтобы коллеги открыли ссылку, у них должен быть доступ к этому файлу в Google.</p>`;
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
  const d=await D.fcall('fileList',{taskId:cur},40000);
  const box=$('fl_list');if(!box)return;
  files=d.files||[];shared=!!d.shared;
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

function viewFile(f){
 if(!direct(f))return;
 const box=$('fl_view');if(!box)return;
 box.classList.remove('hidden');
 const body=(f.mime||'').indexOf('image/')===0?`<img alt='' src='${esc(D.thumb(f.driveId,2000))}'>`:`<iframe src='${esc(D.view(f.driveId))}' allow='autoplay; fullscreen' title='${esc(f.name)}'></iframe>`;
 box.innerHTML=`<div class='toolbar'><b>${esc(f.name)}</b><button type='button' data-fa='dl' data-fid='${esc(f.id)}'>Скачать</button><button type='button' data-fa='close'>Закрыть просмотр</button></div>${body}`;
 box.scrollIntoView({block:'nearest'});
}

async function downloadFile(f){
 if(direct(f)){D.openUrl(D.dl(f.driveId));return;}
 if(busy)return;
 busy=true;
 try{
  msg('Скачивание — 0%');
  const blob=await D.fetchAll(cur,f.id,f.size,p=>msg('Скачивание «'+f.name+'» — '+p+'%'));
  msg('');
  D.saveBlob(blob,f.name);
 }catch(err){msg('');toast(err.message||String(err));}
 finally{busy=false;}
}

async function addLink(){
 if(busy)return;
 const u=$('fl_url');if(!u)return;
 const url=u.value.trim();
 if(!url){toast('Вставьте ссылку на файл');return;}
 busy=true;
 try{
  await D.fcall('fileLink',{taskId:cur,url:url,name:$('fl_lname').value},60000);
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
  try{await D.fcall('fileDelete',{taskId:cur,id:f.id},60000);closeView();await refresh();}
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
   await D.upload(cur,f,p=>msg(tag+' — '+p+'%'));
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
