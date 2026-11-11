'use strict';
(function(){
const D=window.DIO;
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

let pid='',tid='',items=[],busy=false,shared=false;
const msg=t=>{const e=$('md_state');if(e)e.textContent=t;};
const direct=f=>shared&&f.kind==='file'&&D.okId(f.driveId);

function tileHtml(f){
 const label=f.kind==='link'?'Ссылка: '+f.name:f.name;
 const x=f.canDelete?`<b class='mx' data-m='del' data-fid='${esc(f.id)}' title='Удалить'>×</b>`:'';
 const body=direct(f)?`<img loading='lazy' alt='${esc(label)}' src='${esc(D.thumb(f.driveId,400))}'>`:`<span>${esc(label)}</span>`;
 return `<div class='mtile' data-m='open' data-fid='${esc(f.id)}' title='${esc(f.name)}'>${body}${x}</div>`;
}

function drawGrid(){
 const g=$('md_grid');
 if(!g)return;
 g.innerHTML=items.length?items.map(tileHtml).join(''):`<p class='notice'>Пока пусто. Добавьте референсы: картинки, PDF или ссылки.</p>`;
}

function addHtml(){
 return `<h3>Добавить</h3><label>Картинки и файлы с устройства (размер не ограничен, грузятся прямо на Google Диск)<input id='md_file' type='file' multiple accept='image/*,application/pdf'></label><label>Или ссылка на референс (Pinterest, Google Диск и другое)<input id='md_url' type='url' placeholder='https://…' maxlength='1000'></label><label>Название ссылки (необязательно)<input id='md_lname' maxlength='150'></label><button type='button' id='md_addlink'>Добавить ссылку</button>`;
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
  const d=await D.fcall('fileList',{taskId:tid},40000);
  if(!$('md_grid'))return;
  items=d.files||[];shared=!!d.shared;
  drawGrid();
  const add=$('md_add');
  if(add&&!add.dataset.ready){
   add.dataset.ready='1';
   add.innerHTML=d.canAdd?addHtml():`<p class='notice'>Мудборд ведут руководитель и команда объекта. Вы можете смотреть и скачивать.</p>`;
   if(d.folderUrl&&String(d.folderUrl).indexOf('https://')===0)add.insertAdjacentHTML('beforeend',`<p><a class='btnlike' href='${esc(d.folderUrl)}' target='_blank' rel='noopener noreferrer'>Открыть папку на Google Диске</a></p>`);
  }
  setCount(items.length);
 }catch(e){
  const g=$('md_grid');if(g)g.innerHTML=`<p class='error'>${esc(e.message||String(e))}</p>`;
 }
}

function closeView(){
 const box=$('md_view');
 if(box){box.innerHTML='';box.classList.add('hidden');}
}

function openMood(id){
 if(!state)return;
 pid=id;tid='mood:'+id;items=[];busy=false;
 showForm(`<h2>Мудборд</h2><p class='notice'>${esc(projectName(id))}</p><p><button type='button' class='primary' data-board='${esc(id)}'>Открыть доску: рисовать, заметки, фото</button></p><div id='md_grid' class='mgrid'><p class='notice'>Загрузка…</p></div><div id='md_view' class='hidden'></div><p class='notice' id='md_state'></p><div id='md_add'></div>`,async()=>{});
 const ft=$('editform').querySelector('.footer');
 if(ft)ft.innerHTML=`<button type='button' data-action='close'>Закрыть</button>`;
 refresh();
}

async function download(f){
 if(f.kind==='link'){if(String(f.url).indexOf('https://')===0)window.open(f.url,'_blank','noopener');return;}
 if(direct(f)){D.openUrl(D.dl(f.driveId));return;}
 if(busy)return;
 busy=true;
 try{
  msg('Скачивание — 0%');
  const blob=await D.fetchAll(tid,f.id,f.size,p=>msg('Скачивание «'+f.name+'» — '+p+'%'));
  msg('');
  D.saveBlob(blob,f.name);
 }catch(err){msg('');toast(err.message||String(err));}
 finally{busy=false;}
}

function openItem(f){
 if(f.kind==='link'){
  if(String(f.url).indexOf('https://')===0)window.open(f.url,'_blank','noopener');
  return;
 }
 if(!direct(f)){download(f);return;}
 const box=$('md_view');if(!box)return;
 box.classList.remove('hidden');
 const body=(f.mime||'').indexOf('image/')===0?`<img alt='' src='${esc(D.thumb(f.driveId,2000))}'>`:`<iframe src='${esc(D.view(f.driveId))}' allow='autoplay; fullscreen' title='${esc(f.name)}'></iframe>`;
 box.innerHTML=`<div class='toolbar'><b>${esc(f.name)}</b><button type='button' data-m='dl' data-fid='${esc(f.id)}'>Скачать</button><button type='button' data-m='close'>Закрыть</button></div>${body}`;
 box.scrollIntoView({block:'nearest'});
}

async function addLink(){
 if(busy)return;
 const u=$('md_url');if(!u)return;
 const url=u.value.trim();
 if(!url){toast('Вставьте ссылку');return;}
 busy=true;
 try{
  await D.fcall('fileLink',{taskId:tid,url:url,name:$('md_lname').value},60000);
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
 const c=document.createElement('button');
 c.type='button';c.dataset.board=projectId;c.textContent='Доска';
 tb.appendChild(c);
}

document.addEventListener('click',async e=>{
 const bb=e.target.closest('[data-board]');
 if(bb){
  if($('dialog').open)$('dialog').close();
  if(window.openBoard)window.openBoard(bb.dataset.board);
  return;
 }
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
  try{await D.fcall('fileDelete',{taskId:tid,id:f.id},60000);closeView();await refresh();}
  catch(err){toast(err.message||String(err));}
  finally{busy=false;}
 }
});

document.addEventListener('error',e=>{
 const t=e.target;
 if(t&&t.tagName==='IMG'&&t.closest&&t.closest('.mtile')){
  const s=document.createElement('span');
  s.textContent=t.alt||'';
  t.replaceWith(s);
 }
},true);

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
   await D.upload(tid,f,p=>msg(tag+' — '+p+'%'));
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
