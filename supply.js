'use strict';
(function(){
const D=window.DIO;
const st=document.createElement('style');
st.textContent=`.sp-item{border:1px solid var(--line);border-radius:12px;padding:12px;margin:10px 0;background:var(--panel)}
.sp-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.sp-head b{flex:1;min-width:0;overflow-wrap:anywhere}
.sp-act{display:flex;gap:6px;flex-wrap:wrap;margin-left:auto}
.sp-dot{width:14px;height:14px;border-radius:50%;flex:none}
.sp-dot.none{background:#e11d48;box-shadow:0 0 8px 2px rgba(225,29,72,.55)}
.sp-dot.wait{background:#f59e0b;box-shadow:0 0 8px 2px rgba(245,158,11,.55)}
.sp-dot.ok{background:#16a34a;box-shadow:0 0 8px 2px rgba(22,163,74,.55)}
.sp-offer{display:grid;grid-template-columns:1.2fr 1.6fr .8fr auto;gap:8px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin:6px 0}
.sp-offer.wait{border-color:#f59e0b;box-shadow:0 0 10px 1px rgba(245,158,11,.35)}
.sp-offer.ok{border-color:#16a34a;box-shadow:0 0 10px 1px rgba(22,163,74,.35)}
.sp-co{font-weight:600;overflow-wrap:anywhere}
.sp-fl{overflow-wrap:anywhere;font-size:13px}
.sp-fl a{margin-right:8px}
.sp-am{text-align:right;font-weight:600;white-space:nowrap}
.sp-sum{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:10px;align-items:end}
.sp-tot{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-top:16px;padding:14px;border:1px solid var(--accent);border-radius:12px}
.sp-tot div{font-size:13px;color:var(--muted)}
.sp-tot b{display:block;font-size:18px;color:var(--ink)}
@media(max-width:760px){.sp-offer{grid-template-columns:1fr 1fr}.sp-act{margin-left:0}}`;
document.head.appendChild(st);

const S={pid:'',box:null,items:[],offers:[],canEdit:false,shared:false,name:'',open:{}};
const p2=n=>String(n).padStart(2,'0');
const money=v=>{if(v===''||v===null||v===undefined)return '—';const n=Number(v);return isFinite(n)?n.toLocaleString('ru-RU',{maximumFractionDigits:2})+' ₽':'—';};

function supplyDo(op,payload){return D.fcall('supplyDo',Object.assign({op:op,projectId:S.pid},payload),60000);}
async function load(){
 const d=await D.fcall('supplyGet',{projectId:S.pid},60000);
 S.items=d.items||[];S.offers=d.offers||[];S.canEdit=!!d.canEdit;S.shared=!!d.shared;S.name=d.projectName||'';
}
function chosenOf(i){return S.offers.find(o=>o.id===i.chosen&&o.itemId===i.id)||null;}

function totals(){
 let am=0,fin=0,disc=0,par=0,none=0;
 S.items.forEach(i=>{
  const ch=chosenOf(i);
  if(!ch){none++;return;}
  const a=Number(ch.amount)||0,f=i.final===''?a:Number(i.final);
  am+=a;fin+=f;disc+=a-f;par+=Number(i.partner)||0;
 });
 return {am:am,fin:fin,disc:disc,par:par,none:none};
}

function offerHtml(o,i,ch){
 const chosen=!!ch&&ch.id===o.id;
 let f=`<span class='notice'>смета не загружена</span>`;
 if(o.fileId&&D.okId(o.fileId)){
  f=S.shared?`<a href='${esc(D.view(o.fileId))}' target='_blank' rel='noopener noreferrer'>Открыть</a><a href='${esc(D.dl(o.fileId))}' target='_blank' rel='noopener noreferrer'>Скачать</a>`:'';
  if(o.fileName)f+=`<small>${esc(o.fileName)}</small>`;
 }
 const acts=S.canEdit?`<div class='sp-act'>${chosen?`<button type='button' data-sp='unchoose' data-iid='${esc(i.id)}'>Отменить выбор</button>`:`<button type='button' class='primary' data-sp='choose' data-iid='${esc(i.id)}' data-oid='${esc(o.id)}'>Выбрать</button>`}<button type='button' data-sp='offerEdit' data-oid='${esc(o.id)}' title='Изменить'>✎</button><button type='button' class='danger' data-sp='offerDel' data-oid='${esc(o.id)}' title='Удалить'>×</button></div>`:'<div></div>';
 return `<div class='sp-offer ${chosen?'ok':'wait'}'><div class='sp-co'>${esc(o.company)}</div><div class='sp-fl'>${f}</div><div class='sp-am'>${money(o.amount)}</div>${acts}</div>`;
}

function itemHtml(i){
 const offs=S.offers.filter(o=>o.itemId===i.id),ch=chosenOf(i);
 const stt=ch?'ok':(offs.length?'wait':'none');
 const tip=ch?'Компания выбрана':(offs.length?'Есть предложения, выбор не сделан':'Нет ни одного предложения');
 const shown=ch?[ch]:offs,hidden=ch?offs.filter(o=>o.id!==ch.id):[];
 let h=`<div class='sp-item'><div class='sp-head'><span class='sp-dot ${stt}' title='${tip}'></span><b>${esc(i.title)}</b>`;
 if(S.canEdit)h+=`<span class='sp-act'><button type='button' data-sp='itemRename' data-iid='${esc(i.id)}' title='Переименовать'>✎</button><button type='button' class='danger' data-sp='itemDel' data-iid='${esc(i.id)}' title='Удалить позицию'>×</button></span>`;
 h+=`</div>`;
 h+=shown.map(o=>offerHtml(o,i,ch)).join('');
 if(hidden.length){
  h+=`<button type='button' data-sp='toggle' data-iid='${esc(i.id)}'>${S.open[i.id]?'Скрыть отклонённые':'Показать отклонённые ('+hidden.length+')'}</button>`;
  if(S.open[i.id])h+=hidden.map(o=>offerHtml(o,i,ch)).join('');
 }
 if(S.canEdit)h+=` <button type='button' data-sp='offerAdd' data-iid='${esc(i.id)}'>+ Компания</button>`;
 if(ch){
  const a=Number(ch.amount)||0,disc=i.final===''?null:a-Number(i.final),dis=S.canEdit?'':'disabled';
  h+=`<div class='sp-sum'><label>Итог после скидки, ₽<input class='sp_in' data-iid='${esc(i.id)}' data-k='final' inputmode='decimal' value='${esc(i.final)}' ${dis}></label><div>Скидка: <b>${disc===null?'—':money(disc)}</b></div><label>Партнёрское вознаграждение, ₽<input class='sp_in' data-iid='${esc(i.id)}' data-k='partner' inputmode='decimal' value='${esc(i.partner)}' ${dis}></label></div>`;
 }
 return h+`</div>`;
}

function html(){
 let h=`<div class='toolbar'>${S.canEdit?`<input id='sp_new' placeholder='Что закупаем (например, кухня)' maxlength='200' style='max-width:340px'><button type='button' class='primary' data-sp='itemAdd'>+ Позиция</button>`:''}<button type='button' data-sp='pdf'>Сохранить в PDF</button></div>`;
 if(!S.items.length)h+=`<p class='notice'>Пока нет позиций. ${S.canEdit?'Добавьте первую закупку.':''}</p>`;
 h+=S.items.map(itemHtml).join('');
 const t=totals();
 if(S.items.length)h+=`<div class='sp-tot'><div>Сумма выбранных смет<b>${money(t.am)}</b></div><div>Скидка<b>${money(t.disc)}</b></div><div>Итого после скидки<b>${money(t.fin)}</b></div><div>Партнёрское вознаграждение<b>${money(t.par)}</b></div><div>Позиций без выбора<b>${t.none}</b></div></div>`;
 return h;
}

function draw(){
 const b=S.box;
 if(!b||!document.body.contains(b))return;
 const a=document.activeElement;
 if(a&&b.contains(a)&&a.classList&&a.classList.contains('sp_in'))return;
 b.innerHTML=html();
}

window.renderSupply=function(box,pid){
 S.box=box;
 if(S.pid!==pid){S.pid=pid;S.items=[];S.offers=[];S.open={};box.innerHTML=`<p class='notice'>Загрузка…</p>`;}
 else draw();
 const mine=pid;
 load().then(()=>{if(S.pid===mine)draw();}).catch(e=>{if(S.box===box)box.innerHTML=`<p class='error'>${esc(e.message||String(e))}</p>`;});
};

function offerForm(item,offer){
 if(!item)return;
 showForm(`<h2>${offer?'Предложение компании':'Новое предложение'}</h2><p class='notice'>${esc(item.title)}</p><label>Компания<input id='so_co' maxlength='150' value='${esc(offer?offer.company:'')}' required></label><label>Сумма сметы, ₽<input id='so_am' inputmode='decimal' value='${esc(offer?offer.amount:'')}'></label><label>Файл сметы (загрузится на Google Диск)<input id='so_file' type='file'></label><p class='notice' id='so_st'>${offer&&offer.fileName?'Сейчас: '+esc(offer.fileName):''}</p>`,async()=>{
  const co=$('so_co').value.trim(),am=$('so_am').value.trim(),file=$('so_file').files[0];
  if(!co)throw Error('Укажите компанию');
  let fid='';
  if(file){
   $('so_st').textContent='Загрузка сметы…';
   fid=await D.upload('supply:'+S.pid,file,p=>{const e=$('so_st');if(e)e.textContent='Загрузка сметы — '+p+'%';});
  }
  const p={company:co,amount:am};
  if(fid){p.fileId=fid;p.fileName=file.name;}
  if(offer){p.id=offer.id;await supplyDo('offerEdit',p);}
  else{p.itemId=item.id;await supplyDo('offerAdd',p);}
  $('dialog').close();
  await load();
  draw();
 });
}

function printPdf(){
 const d=new Date(),ds=p2(d.getDate())+'.'+p2(d.getMonth()+1)+'.'+d.getFullYear(),t=totals();
 let n=0;
 const rows=S.items.map(i=>{
  n++;
  const ch=chosenOf(i);
  if(!ch)return `<tr><td>${n}</td><td>${esc(i.title)}</td><td colspan='5'>компания не выбрана</td></tr>`;
  const a=Number(ch.amount)||0,f=i.final===''?a:Number(i.final);
  return `<tr><td>${n}</td><td>${esc(i.title)}</td><td>${esc(ch.company)}</td><td class='r'>${money(a)}</td><td class='r'>${money(a-f)}</td><td class='r'>${money(f)}</td><td class='r'>${money(i.partner)}</td></tr>`;
 }).join('');
 const w=window.open('','_blank');
 if(!w){toast('Разрешите всплывающие окна для этого сайта');return;}
 w.document.write(`<!doctype html><html lang='ru'><head><meta charset='utf-8'><title>Комплектация — ${esc(S.name)}</title><style>body{font:12px/1.4 Arial,Helvetica,sans-serif;color:#111;margin:14mm 10mm}h1{font-size:18px;margin:0 0 4px}.sub{color:#555;margin-bottom:14px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #888;padding:5px 7px;text-align:left;vertical-align:top}th{background:#eee}td.r,th.r{text-align:right;white-space:nowrap}tfoot td{font-weight:bold;background:#f6f6f6}@page{size:A4 landscape;margin:10mm}</style></head><body><h1>${esc(S.name)}</h1><div class='sub'>Комплектация • Дата формирования: ${ds}</div><table><thead><tr><th>№</th><th>Позиция</th><th>Компания</th><th class='r'>Смета</th><th class='r'>Скидка</th><th class='r'>Итог после скидки</th><th class='r'>Партнёрское</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan='3'>Итого</td><td class='r'>${money(t.am)}</td><td class='r'>${money(t.disc)}</td><td class='r'>${money(t.fin)}</td><td class='r'>${money(t.par)}</td></tr></tfoot></table></body></html>`);
 w.document.close();
 setTimeout(()=>{try{w.focus();w.print();}catch(e){}},400);
}

document.addEventListener('click',e=>{
 const b=e.target.closest('[data-sp]');
 if(!b||!S.box||!S.box.contains(b))return;
 const a=b.dataset.sp,iid=b.dataset.iid,oid=b.dataset.oid;
 if(a==='pdf'){printPdf();return;}
 if(a==='toggle'){S.open[iid]=!S.open[iid];draw();return;}
 const item=S.items.find(x=>x.id===iid),offer=S.offers.find(x=>x.id===oid);
 const run=fn=>guarded(async()=>{await fn();await load();draw();});
 if(a==='itemAdd'){
  const v=($('sp_new').value||'').trim();
  if(!v){toast('Введите название позиции');return;}
  run(()=>supplyDo('itemAdd',{title:v}));
  return;
 }
 if(a==='itemRename'&&item){
  const v=prompt('Название позиции',item.title);
  if(v&&v.trim())run(()=>supplyDo('itemEdit',{id:iid,title:v.trim()}));
  return;
 }
 if(a==='itemDel'&&item){
  if(confirm('Удалить позицию «'+item.title+'» и все предложения?'))run(()=>supplyDo('itemDelete',{id:iid}));
  return;
 }
 if(a==='offerAdd'&&item){offerForm(item,null);return;}
 if(a==='offerEdit'&&offer){offerForm(S.items.find(x=>x.id===offer.itemId),offer);return;}
 if(a==='offerDel'&&offer){
  if(confirm('Удалить предложение «'+offer.company+'»? Файл сметы тоже будет удалён.'))run(()=>supplyDo('offerDelete',{id:oid}));
  return;
 }
 if(a==='choose'){run(()=>supplyDo('choose',{itemId:iid,offerId:oid}));return;}
 if(a==='unchoose'){run(()=>supplyDo('choose',{itemId:iid,offerId:''}));return;}
});

document.addEventListener('change',e=>{
 const el=e.target;
 if(!el||!el.classList||!el.classList.contains('sp_in')||!S.box||!S.box.contains(el))return;
 const p={id:el.dataset.iid};
 p[el.dataset.k]=el.value;
 el.blur();
 guarded(async()=>{await supplyDo('itemEdit',p);await load();draw();});
});

document.addEventListener('keydown',e=>{
 if(e.key==='Enter'&&e.target&&e.target.id==='sp_new'){
  e.preventDefault();
  const b=S.box&&S.box.querySelector('[data-sp=itemAdd]');
  if(b)b.click();
 }
});
})();
