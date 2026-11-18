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
.sp-fl a,.st-row a{margin-right:8px}
.sp-fl a.dl,.st-row a.dl{font-size:18px;text-decoration:none}
.sp-am{text-align:right;font-weight:600;white-space:nowrap}
.sp-sum{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:10px;align-items:end}
.sp-tot{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-top:16px;padding:14px;border:1px solid var(--accent);border-radius:12px}
.sp-tot div{font-size:13px;color:var(--muted)}
.sp-tot b{display:block;font-size:18px;color:var(--ink)}
.st-type{border:2px solid var(--accent);border-radius:14px;padding:12px;margin:12px 0;background:var(--panel)}
.st-stage{border:1px solid var(--line);border-radius:12px;padding:10px;margin:10px 0}
.st-sh{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px}
.st-sh b{font-size:15px}
.st-sh label{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted)}
.st-sh small{color:var(--muted)}
.st-row{display:grid;grid-template-columns:minmax(120px,1.6fr) 140px repeat(4,minmax(80px,1fr)) auto;gap:8px;align-items:center;padding:6px 0;border-top:1px solid var(--line);font-size:13px}
.st-row.a{grid-template-columns:minmax(110px,1.4fr) 130px 130px repeat(4,minmax(70px,.8fr)) minmax(90px,.8fr) auto}
.st-row.h{border-top:0;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--muted)}
.st-row .r{text-align:right;white-space:nowrap}
.st-row small{display:block;color:var(--muted)}
.st-row input[type=date]{width:100%;box-sizing:border-box;min-width:0}
.st-sum{margin-top:8px;padding:8px 10px;border-radius:10px;background:rgba(82,101,223,.1);font-size:13px}
.st-sum.t{background:rgba(82,101,223,.18);font-size:14px}
.st-add{margin-top:12px;padding-top:10px;border-top:1px dashed var(--line)}
.st-add>b{display:block;margin-bottom:6px}
.pkf{display:block;width:100%;text-align:left;margin:4px 0}
.pkf small{color:var(--muted);margin-left:6px}
#pk_list{margin:6px 0;max-height:220px;overflow:auto;font-size:13px}
@media(max-width:760px){.sp-offer{grid-template-columns:1fr 1fr}.sp-act{margin-left:0}.st-row,.st-row.a{grid-template-columns:1fr 1fr}.st-row.h{display:none}}`;
document.head.appendChild(st);

const S={pid:'',box:null,items:[],offers:[],types:[],stages:[],orders:[],folder:'',files:[],canEdit:false,shared:false,name:'',open:{}};
const p2=n=>String(n).padStart(2,'0');
const money=v=>{if(v===''||v===null||v===undefined)return '—';const n=Number(v);return isFinite(n)?n.toLocaleString('ru-RU',{maximumFractionDigits:2})+' ₽':'—';};
const num=v=>{const n=Number(v);return isFinite(n)?n:0;};
const ruD=d=>d?d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4):'';
function rel(v){
 if(!v)return '';
 const a=new Date(v+'T00:00:00'),b=new Date();
 b.setHours(0,0,0,0);
 const n=Math.round((a-b)/864e5);
 return n===0?'сегодня':(n>0?'через '+n+' дн.':Math.abs(n)+' дн. назад');
}
function sumOrders(list){let a=0,d=0,p=0;list.forEach(o=>{a+=num(o.amount);d+=num(o.discount);p+=num(o.partner);});return {a:a,d:d,p:p,n:a-d};}
const sumLine=(s,label,cls)=>`<div class='st-sum ${cls||''}'>${label}: смета <b>${money(s.a)}</b> · скидка <b>${money(s.d)}</b> · итого <b>${money(s.n)}</b> · партнёрские <b>${money(s.p)}</b></div>`;
function driveId(u){const m=String(u||'').match(/\/d\/([\w-]+)|[?&]id=([\w-]+)/);return m?(m[1]||m[2]):'';}
function dlUrl(u){const id=driveId(u);return id?'https://drive.google.com/uc?export=download&id='+id:u;}
const isFolder=u=>/\/folders\//.test(u||'');
function linkHtml(u){
 if(!u)return '';
 return `<a href='${esc(u)}' target='_blank' rel='noopener noreferrer'>Открыть</a>`+(isFolder(u)?'':`<a class='dl' href='${esc(dlUrl(u))}' target='_blank' rel='noopener noreferrer' title='Скачать с Диска'>⬇</a>`);
}
const addons=i=>S.orders.filter(o=>o.itemId===i.id);
const typeOrders=()=>S.orders.filter(o=>o.typeId);
const fsize=n=>{n=Number(n)||0;return n>=1e6?(n/1e6).toFixed(1)+' МБ':Math.max(1,Math.ceil(n/1024))+' КБ';};

function supplyDo(op,payload){return D.fcall('supplyDo',Object.assign({op:op,projectId:S.pid},payload),60000);}
async function load(){
 const d=await D.fcall('supplyGet',{projectId:S.pid},60000);
 S.items=d.items||[];S.offers=d.offers||[];S.types=d.types||[];S.stages=d.stages||[];S.orders=d.orders||[];S.folder=d.folder||'';S.canEdit=!!d.canEdit;S.shared=!!d.shared;S.name=d.projectName||'';
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
 const ad=sumOrders(S.orders.filter(o=>o.itemId));
 am+=ad.a;fin+=ad.n;disc+=ad.d;par+=ad.p;
 return {am:am,fin:fin,disc:disc,par:par,none:none};
}

function offerHtml(o,i,ch){
 const chosen=!!ch&&ch.id===o.id;
 let f=`<span class='notice'>ссылка на файл не указана</span>`;
 if(o.fileUrl){f=linkHtml(o.fileUrl);if(o.fileName)f+=`<small>${esc(o.fileName)}</small>`;}
 else if(o.fileId&&D.okId(o.fileId)){
  f=S.shared?`<a href='${esc(D.view(o.fileId))}' target='_blank' rel='noopener noreferrer'>Открыть</a><a class='dl' href='${esc(D.dl(o.fileId))}' target='_blank' rel='noopener noreferrer' title='Скачать'>⬇</a>`:'';
  if(o.fileName)f+=`<small>${esc(o.fileName)}</small>`;
 }
 const acts=S.canEdit?`<div class='sp-act'>${chosen?`<button type='button' data-sp='unchoose' data-iid='${esc(i.id)}'>Отменить выбор</button>`:`<button type='button' class='primary' data-sp='choose' data-iid='${esc(i.id)}' data-oid='${esc(o.id)}'>Выбрать</button>`}<button type='button' data-sp='offerEdit' data-oid='${esc(o.id)}' title='Изменить'>✎</button><button type='button' class='danger' data-sp='offerDel' data-oid='${esc(o.id)}' title='Удалить'>×</button></div>`:'<div></div>';
 return `<div class='sp-offer ${chosen?'ok':'wait'}'><div class='sp-co'>${esc(o.company)}</div><div class='sp-fl'>${f}</div><div class='sp-am'>${money(o.amount)}</div>${acts}</div>`;
}

function addonRow(o){
 const ed=S.canEdit,dis=ed?'':'disabled';
 return `<div class='st-row a'><div>${esc(o.title)}${o.note?`<small>${esc(o.note)}</small>`:''}</div><div><input type='date' class='st_in' data-kind='order' data-id='${esc(o.id)}' data-k='payDate' value='${esc(o.payDate)}' ${dis} title='Дата оплаты'><small>${esc(rel(o.payDate))}</small></div><div><input type='date' class='st_in' data-kind='order' data-id='${esc(o.id)}' data-k='deliveryDate' value='${esc(o.deliveryDate)}' ${dis} title='Дата доставки'><small>${esc(rel(o.deliveryDate))}</small></div><div class='r'>${money(o.amount)}</div><div class='r'>${money(o.discount)}</div><div class='r'>${money(o.partner)}</div><div class='r'><b>${money(num(o.amount)-num(o.discount))}</b></div><div>${linkHtml(o.fileUrl)}</div>${ed?`<div class='sp-act'><button type='button' data-sp='orderEdit' data-rid='${esc(o.id)}' title='Изменить'>✎</button><button type='button' class='danger' data-sp='orderDel' data-rid='${esc(o.id)}' title='Удалить'>×</button></div>`:'<div></div>'}</div>`;
}

function addonsHtml(i,ch){
 const ad=addons(i);
 let h=`<div class='st-add'><b>Докупки и доборки к этой позиции</b>`;
 if(ad.length){
  h+=`<div class='st-row a h'><div>Докупка</div><div>Оплата</div><div>Доставка</div><div class='r'>Смета</div><div class='r'>Скидка</div><div class='r'>Партнёрские</div><div class='r'>Итого</div><div>Файл</div><div></div></div>`+ad.map(addonRow).join('');
 }else h+=`<p class='notice'>Докупок пока нет.</p>`;
 if(S.canEdit)h+=`<button type='button' data-sp='addonAdd' data-iid='${esc(i.id)}'>+ Докупка</button>`;
 const a=Number(ch.amount)||0,f=i.final===''?a:Number(i.final),s=sumOrders(ad);
 const tot={a:a+s.a,d:(a-f)+s.d,n:f+s.n,p:num(i.partner)+s.p};
 if(ad.length)h+=sumLine(tot,'Всё по позиции (основная смета + докупки)','t');
 return h+`</div>`;
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
  h+=addonsHtml(i,ch);
 }
 return h+`</div>`;
}

function orderRow(o){
 const ed=S.canEdit;
 return `<div class='st-row'><div>${esc(o.title)}${o.note?`<small>${esc(o.note)}</small>`:''}</div><div><input type='date' class='st_in' data-kind='order' data-id='${esc(o.id)}' data-k='payDate' value='${esc(o.payDate)}' ${ed?'':'disabled'} title='Дата покупки'><small>${esc(rel(o.payDate))}</small></div><div class='r'>${money(o.amount)}</div><div class='r'>${money(o.discount)}</div><div class='r'>${money(o.partner)}</div><div class='r'><b>${money(num(o.amount)-num(o.discount))}</b></div>${ed?`<div class='sp-act'><button type='button' data-sp='orderEdit' data-rid='${esc(o.id)}' title='Изменить'>✎</button><button type='button' class='danger' data-sp='orderDel' data-rid='${esc(o.id)}' title='Удалить'>×</button></div>`:'<div></div>'}</div>`;
}

function stageHtml(s){
 const os=S.orders.filter(o=>o.stageId===s.id),ed=S.canEdit;
 let h=`<div class='st-stage'><div class='st-sh'><b>${esc(s.title)}</b><label>Доставка на объект<input type='date' class='st_in' data-kind='stage' data-id='${esc(s.id)}' data-k='deliveryDate' value='${esc(s.deliveryDate)}' ${ed?'':'disabled'}></label><small>${esc(rel(s.deliveryDate))}</small>`;
 if(ed)h+=`<span class='sp-act'><button type='button' data-sp='orderAdd' data-sid='${esc(s.id)}'>+ Заказ</button><button type='button' data-sp='stageEdit' data-sid='${esc(s.id)}' title='Изменить этап'>✎</button><button type='button' class='danger' data-sp='stageDel' data-sid='${esc(s.id)}' title='Удалить этап'>×</button></span>`;
 h+=`</div>`;
 if(os.length){
  h+=`<div class='st-row h'><div>Заказ</div><div>Куплено</div><div class='r'>Смета</div><div class='r'>Скидка</div><div class='r'>Партнёрские</div><div class='r'>Итого</div><div></div></div>`+os.map(orderRow).join('')+sumLine(sumOrders(os),'Итого по этапу');
 }else h+=`<p class='notice'>Заказов пока нет.</p>`;
 return h+`</div>`;
}

function typeHtml(t){
 const sts=S.stages.filter(s=>s.typeId===t.id),os=S.orders.filter(o=>o.typeId===t.id),ed=S.canEdit;
 let h=`<div class='st-type'><div class='sp-head'><b>${esc(t.title)}</b>${t.partner?`<small>Подрядчик: ${esc(t.partner)}</small>`:''}`;
 if(ed)h+=`<span class='sp-act'><button type='button' class='primary' data-sp='stageAdd' data-tid='${esc(t.id)}'>+ Этап</button><button type='button' data-sp='typeEdit' data-tid='${esc(t.id)}' title='Изменить тип'>✎</button><button type='button' class='danger' data-sp='typeDel' data-tid='${esc(t.id)}' title='Удалить тип'>×</button></span>`;
 h+=`</div>`;
 h+=sts.length?sts.map(stageHtml).join(''):`<p class='notice'>Добавьте этапы этого типа, например «Скрытая» и «Отделочная».</p>`;
 if(os.length)h+=sumLine(sumOrders(os),'Всего по типу «'+esc(t.title)+'»','t');
 return h+`</div>`;
}

function html(){
 let h=`<div class='toolbar'>${S.canEdit?`<button type='button' class='primary' data-sp='typeAdd'>+ Тип закупки</button><input id='sp_new' placeholder='Простая позиция (например, кухня)' maxlength='200' style='max-width:340px'><button type='button' data-sp='itemAdd'>+ Позиция</button>`:''}<button type='button' data-sp='folder' title='Открыть папку объекта на Google Диске'>⬆ Загрузить на Диск${S.folder?'':' (папка не задана)'}</button>${S.canEdit?`<button type='button' data-sp='folderSet' title='Задать адрес папки'>✎ Папка</button>`:''}<button type='button' data-sp='pdf'>Сохранить в PDF</button></div>`;
 h+=`<h3>Типы закупок</h3>`;
 if(!S.types.length)h+=`<p class='notice'>Типов пока нет. ${S.canEdit?'Тип — это группа закупок у одного подрядчика, например «Сантехника» с этапами доставки.':''}</p>`;
 h+=S.types.map(typeHtml).join('');
 if(S.types.length&&typeOrders().length)h+=`<div class='sp-tot'>${(()=>{const s=sumOrders(typeOrders());return `<div>Смета по типам<b>${money(s.a)}</b></div><div>Скидка<b>${money(s.d)}</b></div><div>Итого по типам<b>${money(s.n)}</b></div><div>Партнёрские<b>${money(s.p)}</b></div>`;})()}</div>`;
 h+=`<h3>Отдельные позиции и тендеры</h3>`;
 if(!S.items.length)h+=`<p class='notice'>Пока нет позиций. ${S.canEdit?'Добавьте первую закупку.':''}</p>`;
 h+=S.items.map(itemHtml).join('');
 const t=totals();
 if(S.items.length)h+=`<div class='sp-tot'><div>Сумма выбранных смет и докупок<b>${money(t.am)}</b></div><div>Скидка<b>${money(t.disc)}</b></div><div>Итого после скидки<b>${money(t.fin)}</b></div><div>Партнёрское вознаграждение<b>${money(t.par)}</b></div><div>Позиций без выбора<b>${t.none}</b></div></div>`;
 return h;
}

function draw(){
 const b=S.box;
 if(!b||!document.body.contains(b))return;
 const a=document.activeElement;
 if(a&&b.contains(a)&&a.classList&&(a.classList.contains('sp_in')||a.classList.contains('st_in')))return;
 b.innerHTML=html();
}

window.renderSupply=function(box,pid){
 S.box=box;
 if(S.pid!==pid){S.pid=pid;S.items=[];S.offers=[];S.types=[];S.stages=[];S.orders=[];S.folder='';S.open={};box.innerHTML=`<p class='notice'>Загрузка…</p>`;}
 else draw();
 const mine=pid;
 load().then(()=>{if(S.pid===mine)draw();}).catch(e=>{if(S.box===box)box.innerHTML=`<p class='error'>${esc(e.message||String(e))}</p>`;});
};

const pickHtml=id=>`<button type='button' data-pick='${id}'>Выбрать файл из папки Диска</button><div id='pk_list'></div>`;

function offerForm(item,offer){
 if(!item)return;
 showForm(`<h2>${offer?'Предложение компании':'Новое предложение'}</h2><p class='notice'>${esc(item.title)}</p><label>Компания<input id='so_co' maxlength='150' value='${esc(offer?offer.company:'')}' required></label><label>Сумма сметы, ₽<input id='so_am' inputmode='decimal' value='${esc(offer?offer.amount:'')}'></label><label>Ссылка на файл сметы на Google Диске<input id='so_url' type='url' maxlength='500' placeholder='https://drive.google.com/file/d/...' value='${esc(offer?offer.fileUrl:'')}' data-fname='${esc(offer?offer.fileName:'')}'></label>${pickHtml('so_url')}<p class='notice'>Загрузите файл в папку объекта на Диске (кнопка «Загрузить на Диск» над списком), затем выберите его здесь. Приложение хранит только ссылку.</p>`,async()=>{
  const co=$('so_co').value.trim(),am=$('so_am').value.trim(),inp=$('so_url'),url=inp.value.trim();
  if(!co)throw Error('Укажите компанию');
  const p={company:co,amount:am,fileUrl:url,fileName:url?(inp.dataset.fname||''):''};
  if(offer){p.id=offer.id;await supplyDo('offerEdit',p);}
  else{p.itemId=item.id;await supplyDo('offerAdd',p);}
  $('dialog').close();
  await load();
  draw();
 });
}

function typeForm(t){
 showForm(`<h2>${t?'Тип закупки':'Новый тип закупки'}</h2><label>Название типа<input id='ty_t' maxlength='200' value='${esc(t?t.title:'')}' required placeholder='например, Сантехника'></label><label>Подрядчик (один на весь тип)<input id='ty_p' maxlength='150' value='${esc(t?t.partner:'')}'></label>`,async()=>{
  const v=$('ty_t').value.trim();
  if(!v)throw Error('Укажите название');
  const p={title:v,partner:$('ty_p').value.trim()};
  if(t){p.id=t.id;await supplyDo('typeEdit',p);}else await supplyDo('typeAdd',p);
  $('dialog').close();
  await load();
  draw();
 });
}

function stageForm(typ,s){
 if(!typ)return;
 showForm(`<h2>${s?'Этап':'Новый этап'}</h2><p class='notice'>Тип: ${esc(typ.title)}</p><label>Название этапа<input id='sg_t' list='sg_l' maxlength='200' value='${esc(s?s.title:'')}' required placeholder='например, Скрытая часть'></label><datalist id='sg_l'><option value='Скрытая часть (черновая стройка)'><option value='Отделочная часть (финишная отделка)'></datalist><label>Дата доставки на объект<input id='sg_d' type='date' value='${esc(s?s.deliveryDate:'')}'></label>`,async()=>{
  const v=$('sg_t').value.trim();
  if(!v)throw Error('Укажите название');
  const p={title:v,deliveryDate:$('sg_d').value};
  if(s){p.id=s.id;await supplyDo('stageEdit',p);}else{p.typeId=typ.id;await supplyDo('stageAdd',p);}
  $('dialog').close();
  await load();
  draw();
 });
}

function orderForm(ctx,o){
 if(!ctx||(!ctx.stage&&!ctx.item))return;
 const first=ctx.stage?!S.orders.some(x=>x.stageId===ctx.stage.id):false;
 const where=ctx.stage?'Этап: '+ctx.stage.title:'Позиция: '+ctx.item.title;
 showForm(`<h2>${o?'Заказ':'Новая докупка'}</h2><p class='notice'>${esc(where)}</p><label>Название (что докупаем)<input id='or_t' maxlength='200' value='${esc(o?o.title:(first?'Первая закупка':'Докупка'))}' required></label><label>Дата покупки или оплаты<input id='or_d' type='date' value='${esc(o?o.payDate:'')}'></label><label>Дата доставки на объект<input id='or_v' type='date' value='${esc(o?o.deliveryDate:'')}'></label><label>Сумма заказа, ₽<input id='or_a' inputmode='decimal' value='${esc(o?o.amount:'')}'></label><label>Сумма скидки, ₽<input id='or_s' inputmode='decimal' value='${esc(o?o.discount:'')}'></label><label>Партнёрские, ₽<input id='or_p' inputmode='decimal' value='${esc(o?o.partner:'')}'></label><label>Ссылка на файл на Google Диске (смета, счёт)<input id='or_u' type='url' maxlength='500' placeholder='https://drive.google.com/file/d/...' value='${esc(o?o.fileUrl:'')}'></label>${pickHtml('or_u')}<label>Заметка<input id='or_n' maxlength='500' value='${esc(o?o.note:'')}' placeholder='что докупили'></label>`,async()=>{
  const v=$('or_t').value.trim();
  if(!v)throw Error('Укажите название');
  const p={title:v,payDate:$('or_d').value,deliveryDate:$('or_v').value,amount:$('or_a').value.trim(),discount:$('or_s').value.trim(),partner:$('or_p').value.trim(),fileUrl:$('or_u').value.trim(),note:$('or_n').value.trim()};
  if(o){p.id=o.id;await supplyDo('orderEdit',p);}
  else{if(ctx.stage)p.stageId=ctx.stage.id;else p.itemId=ctx.item.id;await supplyDo('orderAdd',p);}
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
  let r=`<tr><td>${n}</td><td>${esc(i.title)}</td><td>${esc(ch.company)}</td><td class='r'>${money(a)}</td><td class='r'>${money(a-f)}</td><td class='r'>${money(f)}</td><td class='r'>${money(i.partner)}</td></tr>`;
  addons(i).forEach(o=>{r+=`<tr class='s'><td></td><td>Докупка: ${esc(o.title)}${o.payDate?' · оплата '+ruD(o.payDate):''}${o.deliveryDate?' · доставка '+ruD(o.deliveryDate):''}</td><td></td><td class='r'>${money(o.amount)}</td><td class='r'>${money(o.discount)}</td><td class='r'>${money(num(o.amount)-num(o.discount))}</td><td class='r'>${money(o.partner)}</td></tr>`;});
  return r;
 }).join('');
 const trs=S.types.map(ty=>{
  const sts=S.stages.filter(s=>s.typeId===ty.id);
  let h=`<tr class='g'><td colspan='7'>${esc(ty.title)}${ty.partner?' — '+esc(ty.partner):''}</td></tr>`;
  sts.forEach(s=>{
   const os=S.orders.filter(o=>o.stageId===s.id),sm=sumOrders(os);
   h+=`<tr class='s'><td colspan='7'>Этап: ${esc(s.title)}${s.deliveryDate?' · доставка на объект '+ruD(s.deliveryDate):''}</td></tr>`;
   os.forEach(o=>{h+=`<tr><td></td><td>${esc(o.title)}${o.payDate?' ('+ruD(o.payDate)+')':''}${o.note?' — '+esc(o.note):''}</td><td></td><td class='r'>${money(o.amount)}</td><td class='r'>${money(o.discount)}</td><td class='r'>${money(num(o.amount)-num(o.discount))}</td><td class='r'>${money(o.partner)}</td></tr>`;});
   h+=`<tr class='s'><td colspan='3'>Итого по этапу</td><td class='r'>${money(sm.a)}</td><td class='r'>${money(sm.d)}</td><td class='r'>${money(sm.n)}</td><td class='r'>${money(sm.p)}</td></tr>`;
  });
  return h;
 }).join('');
 const st2=sumOrders(typeOrders());
 const w=window.open('','_blank');
 if(!w){toast('Разрешите всплывающие окна для этого сайта');return;}
 w.document.write(`<!doctype html><html lang='ru'><head><meta charset='utf-8'><title>Комплектация — ${esc(S.name)}</title><style>body{font:12px/1.4 Arial,Helvetica,sans-serif;color:#111;margin:14mm 10mm}h1{font-size:18px;margin:0 0 4px}h2{font-size:14px;margin:18px 0 6px}.sub{color:#555;margin-bottom:14px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #888;padding:5px 7px;text-align:left;vertical-align:top}th{background:#eee}td.r,th.r{text-align:right;white-space:nowrap}tfoot td{font-weight:bold;background:#f6f6f6}tr.g td{background:#dde1ff;font-weight:bold}tr.s td{background:#f1f2f6}@page{size:A4 landscape;margin:10mm}</style></head><body><h1>${esc(S.name)}</h1><div class='sub'>Комплектация • Дата формирования: ${ds}</div>${S.types.length?`<h2>Типы закупок</h2><table><thead><tr><th>№</th><th>Тип / этап / заказ</th><th></th><th class='r'>Смета</th><th class='r'>Скидка</th><th class='r'>Итого</th><th class='r'>Партнёрские</th></tr></thead><tbody>${trs}</tbody><tfoot><tr><td colspan='3'>Итого по типам</td><td class='r'>${money(st2.a)}</td><td class='r'>${money(st2.d)}</td><td class='r'>${money(st2.n)}</td><td class='r'>${money(st2.p)}</td></tr></tfoot></table>`:''}${S.items.length?`<h2>Отдельные позиции (с докупками)</h2><table><thead><tr><th>№</th><th>Позиция</th><th>Компания</th><th class='r'>Смета</th><th class='r'>Скидка</th><th class='r'>Итог после скидки</th><th class='r'>Партнёрское</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan='3'>Итого</td><td class='r'>${money(t.am)}</td><td class='r'>${money(t.disc)}</td><td class='r'>${money(t.fin)}</td><td class='r'>${money(t.par)}</td></tr></tfoot></table>`:''}</body></html>`);
 w.document.close();
 setTimeout(()=>{try{w.focus();w.print();}catch(e){}},400);
}

async function pickFiles(btn){
 const box=$('pk_list');
 if(!box)return;
 if(!S.folder){box.textContent='Сначала задайте папку Диска кнопкой «✎ Папка» над списком.';return;}
 box.textContent='Загружаю список файлов…';
 try{
  const l=await supplyDo('fileList',{});
  S.files=l||[];
  box.innerHTML=S.files.length?S.files.map((f,i)=>`<button type='button' class='pkf' data-pickf='${i}' data-target='${esc(btn.dataset.pick)}'>${esc(f.name)}<small>${esc(ruD(String(f.date).slice(0,10)))} · ${fsize(f.size)}</small></button>`).join(''):'В папке нет файлов.';
 }catch(err){box.textContent=err.message||String(err);}
}

document.addEventListener('click',e=>{
 const pk=e.target.closest&&e.target.closest('[data-pick],[data-pickf]');
 if(pk){
  e.preventDefault();
  if(pk.dataset.pick!==undefined){pickFiles(pk);return;}
  const f=S.files[Number(pk.dataset.pickf)],inp=$(pk.dataset.target);
  if(f&&inp){inp.value=f.url;inp.dataset.fname=f.name;const box=$('pk_list');if(box)box.textContent='Выбрано: '+f.name;}
  return;
 }
 const b=e.target.closest('[data-sp]');
 if(!b||!S.box||!S.box.contains(b))return;
 const a=b.dataset.sp,iid=b.dataset.iid,oid=b.dataset.oid,tid=b.dataset.tid,sid=b.dataset.sid,rid=b.dataset.rid;
 if(a==='pdf'){printPdf();return;}
 if(a==='toggle'){S.open[iid]=!S.open[iid];draw();return;}
 const run=fn=>guarded(async()=>{await fn();await load();draw();});
 const askFolder=cur=>{
  const u=(prompt('Адрес папки комплектации на Google Диске (пусто — убрать)',cur||'')||'').trim();
  if(u&&!/^https:\/\/drive\.google\.com\/drive\/folders\//.test(u)){toast('Нужна ссылка вида https://drive.google.com/drive/folders/...');return null;}
  return u;
 };
 if(a==='folder'){
  if(S.folder){window.open(S.folder,'_blank','noopener');return;}
  if(!S.canEdit){toast('Папку задаёт руководитель или команда объекта');return;}
  const u=askFolder('');
  if(u)run(()=>supplyDo('folderSet',{url:u}));
  return;
 }
 if(a==='folderSet'){
  const u=askFolder(S.folder);
  if(u!==null)run(()=>supplyDo('folderSet',{url:u}));
  return;
 }
 const typ=S.types.find(x=>x.id===tid),stg=S.stages.find(x=>x.id===sid),ord=S.orders.find(x=>x.id===rid);
 if(a==='typeAdd'){typeForm(null);return;}
 if(a==='typeEdit'&&typ){typeForm(typ);return;}
 if(a==='typeDel'&&typ){if(confirm('Удалить тип «'+typ.title+'» со всеми этапами и заказами?'))run(()=>supplyDo('typeDelete',{id:tid}));return;}
 if(a==='stageAdd'&&typ){stageForm(typ,null);return;}
 if(a==='stageEdit'&&stg){stageForm(S.types.find(x=>x.id===stg.typeId),stg);return;}
 if(a==='stageDel'&&stg){if(confirm('Удалить этап «'+stg.title+'» и все его заказы?'))run(()=>supplyDo('stageDelete',{id:sid}));return;}
 if(a==='orderAdd'&&stg){orderForm({stage:stg},null);return;}
 if(a==='addonAdd'){const it=S.items.find(x=>x.id===iid);if(it)orderForm({item:it},null);return;}
 if(a==='orderEdit'&&ord){
  if(ord.itemId)orderForm({item:S.items.find(x=>x.id===ord.itemId)},ord);
  else orderForm({stage:S.stages.find(x=>x.id===ord.stageId)},ord);
  return;
 }
 if(a==='orderDel'&&ord){if(confirm('Удалить «'+ord.title+'»?'))run(()=>supplyDo('orderDelete',{id:rid}));return;}
 const item=S.items.find(x=>x.id===iid),offer=S.offers.find(x=>x.id===oid);
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
  if(confirm('Удалить предложение «'+offer.company+'»?'))run(()=>supplyDo('offerDelete',{id:oid}));
  return;
 }
 if(a==='choose'){run(()=>supplyDo('choose',{itemId:iid,offerId:oid}));return;}
 if(a==='unchoose'){run(()=>supplyDo('choose',{itemId:iid,offerId:''}));return;}
});

document.addEventListener('change',e=>{
 const el=e.target;
 if(!el||!el.classList||!S.box||!S.box.contains(el))return;
 if(el.classList.contains('st_in')){
  const p={id:el.dataset.id};
  p[el.dataset.k]=el.value;
  const act=el.dataset.kind==='stage'?'stageEdit':'orderEdit';
  el.blur();
  guarded(async()=>{await supplyDo(act,p);await load();draw();});
  return;
 }
 if(!el.classList.contains('sp_in'))return;
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
