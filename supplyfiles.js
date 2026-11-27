'use strict';
(function(){
if(typeof document==='undefined'||typeof showForm==='undefined'||typeof window.renderSupply!=='function'||!window.DIO)return;
const D=window.DIO;
const st=document.createElement('style');
st.textContent='.sf-btn{display:inline-flex;align-items:center;gap:4px;min-height:30px;padding:2px 8px;border-radius:16px;border:1px solid var(--line);background:var(--panel);color:var(--muted)}.sf-btn.has{background:var(--accent);border-color:var(--accent);color:#fff}.sf-btn b{font-size:11px}.s2-wh .sf-btn{margin-left:4px}.sf-row{border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin:6px 0;display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center}.sf-row .fn{flex:1 1 180px;min-width:0;overflow-wrap:anywhere}.sf-row button,.sf-row a{min-height:36px;padding:5px 10px}';
document.head.appendChild(st);
let cur={box:null,pid:''},counts={},busy=false,tid='',files=[],pend=[];
const seen=new WeakSet(),orig=window.renderSupply;
const p2=n=>String(n).padStart(2,'0');
const fmtSize=n=>{n=Number(n)||0;if(n<1024)return n+' Б';if(n<1048576)return (n/1024).toFixed(1).replace('.',',')+' КБ';if(n<1073741824)return (n/1048576).toFixed(1).replace('.',',')+' МБ';return (n/1073741824).toFixed(2).replace('.',',')+' ГБ';};
const fmtAt=s=>{const d=new Date(s);return isNaN(d)?'':p2(d.getDate())+'.'+p2(d.getMonth()+1)+' '+p2(d.getHours())+':'+p2(d.getMinutes());};
const msg=t=>{const e=document.getElementById('sf_state');if(e)e.textContent=t;};
const msgF=t=>{const e=document.getElementById('sf_fstate');if(e)e.textContent=t;};
function go(u){const a=document.createElement('a');a.href=u;a.rel='noopener noreferrer';document.body.appendChild(a);a.click();a.remove();}
function setBtn(b,n){b.classList.toggle('has',n>0);b.innerHTML='📎'+(n?' <b>'+n+'</b>':'');b.title=n?'Файлов: '+n:'Прикрепить файл';}
function key(k){return 'supply:'+cur.pid+'#'+k;}
function addBtn(parent,k,title){
 const b=document.createElement('button');
 b.type='button';b.className='sf-btn';b.dataset.sfi=k;b.dataset.t=title;
 b.setAttribute('aria-label','Файлы');
 setBtn(b,counts[key(k)]||0);
 parent.appendChild(b);
}

function decorate(box){
 box.querySelectorAll('.s2-item').forEach(it=>{
  const t=it.querySelector('.s2-t b'),tt=t?t.textContent:'';
  it.querySelectorAll('.s2-a').forEach(row=>{
   if(row.classList.contains('h')||row.querySelector('.sf-btn'))return;
   let k='';
   if(row.classList.contains('m')){const e=row.querySelector('[data-iid]');if(e)k=e.dataset.iid+'-m';}
   else{const e=row.querySelector('[data-rid]');if(e)k=e.dataset.rid;}
   const first=row.firstElementChild,last=row.lastElementChild;
   if(!k||!first||!last)return;
   const lbl=((first.firstChild&&first.firstChild.textContent)||'').trim();
   addBtn(last,k,tt+(lbl?' · '+lbl:''));
  });
  it.querySelectorAll('.s2-offer').forEach(of=>{
   if(of.querySelector('.sf-btn'))return;
   const e=of.querySelector('[data-oid]'),oa=of.querySelector('.s2-oa'),co=of.querySelector('.s2-co');
   if(!e||!oa)return;
   addBtn(oa,e.dataset.oid,tt+' · предложение: '+(co?co.textContent:''));
  });
  it.querySelectorAll('.s2-wh').forEach(w=>{
   if(w.querySelector('.sf-btn'))return;
   const e=w.querySelector('[data-s2="offerEdit"]'),nm=w.querySelector('b');
   if(!e)return;
   addBtn(w,e.dataset.oid,tt+' · предложение: '+(nm?nm.textContent:''));
  });
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

function openDlg(k,title){
 tid=key(k);files=[];busy=false;
 showForm(`<h2>Файлы сметы</h2><p class='notice'>${esc(title)}</p><div id='sf_list'><p class='notice'>Загрузка…</p></div><p class='notice' id='sf_state'></p><div id='sf_add'></div>`,async()=>{});
 const ft=document.getElementById('editform').querySelector('.footer');
 if(ft)ft.innerHTML=`<button type='button' data-action='close'>Закрыть</button>`;
 refresh();
}

/* Загрузка смет прямо в формах: «+ Компания в тендер», «Предложение компании», «+ Докупка». Файл уходит на Диск после того, как запись сохранена. */
function injectForm(){
 if(document.getElementById('sf_form_file'))return;
 const u=document.getElementById('so_url')||document.getElementById('or_u');
 if(!u)return;
 const lb=u.closest('label');
 if(!lb)return;
 pend=[];
 const cap=document.getElementById('so_url')?'Файл сметы с устройства (можно несколько)':'Файл с устройства: смета, счёт (можно несколько)';
 lb.insertAdjacentHTML('afterend',`<label>${cap}<input id='sf_form_file' type='file' multiple></label><p class='notice' id='sf_fstate'></p>`);
}
new MutationObserver(()=>{try{injectForm();}catch(e){}}).observe(document.body,{childList:true,subtree:true});

async function uploadPending(params,r){
 const list=pend.slice();
 pend=[];
 const pid=params.projectId||cur.pid;
 let id=(params.op==='offerEdit'||params.op==='orderEdit')?String(params.id||''):(typeof r==='string'?r:(r&&r.id?String(r.id):''));
 if(!/^[A-Za-z0-9_-]{8,100}$/.test(id)){
  id='';
  const d=await origCall.call(D,'supplyGet',{projectId:pid},60000);
  if(params.op==='offerAdd'){const l=(d.offers||[]).filter(o=>o.itemId===params.itemId&&o.company===params.company);if(l.length)id=l[l.length-1].id;}
  else{const l=(d.orders||[]).filter(o=>o.stageId===params.stageId&&o.title===params.title);if(l.length)id=l[l.length-1].id;}
 }
 if(!id)throw Error('не удалось найти сохранённую запись');
 const t='supply:'+pid+'#'+id;
 for(let i=0;i<list.length;i++){
  const f=list[i],tag='Файл '+(i+1)+' из '+list.length+': '+f.name;
  msgF(tag+' — 0%');
  await D.upload(t,f,p=>msgF(tag+' — '+p+'%'));
 }
 counts[t]=(counts[t]||0)+list.length;
 msgF('');
}
const origCall=D.fcall;
const FORM_OPS=/^(offerAdd|offerEdit|orderAdd|orderEdit)$/;
D.fcall=async function(name,params){
 const r=await origCall.apply(this,arguments);
 if(name==='supplyDo'&&params&&FORM_OPS.test(String(params.op))&&pend.length){
  try{await uploadPending(params,r);}
  catch(err){toast('Запись сохранена, но файл не загрузился: '+(err.message||String(err))+'. Загрузить его можно кнопкой 📎 у записи.');}
 }
 return r;
};

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
 if(!el)return;
 if(el.id==='sf_form_file'){
  pend=Array.from(el.files||[]);
  msgF(pend.length?'Загрузится после сохранения: '+pend.map(f=>f.name).join(', '):'');
  return;
 }
 if(el.id!=='sf_file')return;
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
if(dlg)dlg.addEventListener('close',()=>{tid='';busy=false;pend=[];});
const live=document.querySelector('#content');
if(live){const b=live.querySelector('.s2-item');if(b&&b.parentElement){cur.box=b.parentElement;watch(cur.box);}}
})();
