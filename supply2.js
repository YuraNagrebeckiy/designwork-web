'use strict';
(function(){
const D=window.DIO;
if(!D||typeof showForm==='undefined')return;
const MARK='@поз:',META='META:';
const st=document.createElement('style');
st.textContent=`
.s2{max-width:1100px}
.s2 *{box-sizing:border-box}
.s2-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 14px}
.s2-bar input{flex:1 1 260px;min-width:0}
.s2-bar button{flex:none}
.s2-g{margin:22px 0 8px;display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap}
.s2-g h3{margin:0;font-size:15px}
.s2-g small{color:var(--muted)}
.s2-item{border:1px solid var(--line);border-radius:16px;background:var(--panel);padding:14px;margin:10px 0}
.s2-h{display:flex;align-items:center;gap:10px}
.s2-dot{width:12px;height:12px;border-radius:50%;flex:none;background:#b5584f}
.s2-dot.wait{background:#d1a93a}.s2-dot.ok{background:#4d8765}
.s2-t{flex:1;min-width:0}
.s2-t b{display:block;font-size:16px;line-height:1.3;overflow-wrap:anywhere}
.s2-ha{display:flex;gap:6px;flex:none}
.s2-ha button,.s2-oa button{min-width:36px;min-height:36px;padding:4px 10px}
.s2-hint{margin:8px 0 0;font-size:13px}
.s2-hint summary{cursor:pointer;color:var(--accent-text,var(--accent))}
.s2-hint dl{display:grid;grid-template-columns:minmax(0,1fr);gap:2px;margin:8px 0 0}
.s2-hint dt{margin:8px 0 0;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}
.s2-hint dd{margin:0;line-height:1.45}
.s2-tend{margin-top:10px;display:grid;gap:8px}
.s2-cap{font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin:12px 0 2px}
.s2-offer{display:grid;grid-template-columns:minmax(0,1.2fr) 130px minmax(0,2.4fr) auto;gap:6px 14px;align-items:start;border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:color-mix(in srgb,var(--panel-solid,#fff) 50%,transparent)}
.s2-co{font-weight:650;overflow-wrap:anywhere}
.s2-pr{font-weight:650;white-space:nowrap}
.s2-tx{font-size:13px;line-height:1.45;overflow-wrap:anywhere}
.s2-tx p{margin:0 0 4px}.s2-tx i{font-style:normal;color:var(--muted)}
.s2-tx a{margin-right:8px}
.s2-oa{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.s2-win{margin-top:10px;border:1px solid color-mix(in srgb,#4d8765 40%,transparent);border-left:4px solid #4d8765;border-radius:12px;padding:12px;background:color-mix(in srgb,#4d8765 7%,transparent)}
.s2-wh{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.s2-badge{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#1f3d2d;background:#dcebe2;border-radius:999px;padding:3px 10px}
html[data-theme=dark] .s2-badge{background:#27392f;color:#d6ece0}
.s2-wh b{font-size:15px}
.s2-wh .sp{flex:1}
.s2-fields{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin-top:12px}
.s2-f{display:flex;flex-direction:column;gap:3px;min-width:0}
.s2-f>span,.s2-a [data-l]::before{font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}
.s2-f>b{font-size:15px;min-height:38px;display:flex;align-items:center}
.s2-f input{width:100%;min-width:0;min-height:38px;height:38px}
.s2-addh{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:14px 0 4px}
.s2-a{display:grid;grid-template-columns:minmax(0,1.6fr) 130px 130px 110px 100px 110px 120px auto;gap:6px 10px;align-items:center;border-top:1px solid var(--line);padding:8px 0;font-size:13px}
.s2-a.h{font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);border-top:0;padding-bottom:2px}
.s2-a [data-l]::before{content:none}
.s2-a .r{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.s2-a small{display:block;color:var(--muted)}
.s2-a input{width:100%;min-height:36px;height:36px}
.s2-ft{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px}
.s2-ft .sp{flex:1}
.s2-blk{display:flex;gap:18px;flex-wrap:wrap;align-items:baseline;justify-content:flex-end;padding:10px 12px;border-radius:12px;background:var(--soft);margin-top:10px;font-size:13px;color:var(--muted)}
.s2-blk b{color:var(--ink);font-size:15px;font-variant-numeric:tabular-nums}
.s2-blk b.big{font-size:17px}
.s2-tot{margin-top:18px;padding:14px;border:1px solid var(--line);border-radius:16px;background:var(--panel);display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px 16px}
.s2-tot div{font-size:12px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;color:var(--muted)}
.s2-tot b{display:block;margin-top:2px;font-size:19px;letter-spacing:0;text-transform:none;color:var(--ink);font-variant-numeric:tabular-nums}
.s2-arc{margin-top:20px}.s2-arc summary{cursor:pointer;color:var(--muted)}
.s2-arc table{width:100%;border-collapse:collapse;font-size:13px;margin-top:8px}.s2-arc td,.s2-arc th{border-top:1px solid var(--line);padding:5px 6px;text-align:left}.s2-arc .r{text-align:right}
.scp2 #s2_q{position:sticky;top:0;z-index:2;display:block;width:100%;margin:8px 0 6px;background:var(--panel-solid,#fff)}
.scp2 .sc-g{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin:16px 0 6px;padding:8px 12px;border-radius:10px;background:var(--soft);font-weight:700;font-size:14px;line-height:1.3}
.scp2 .sc-g button{margin:0;padding:4px 10px;font-size:12px;font-weight:500;white-space:nowrap}
.scp2 .sc-it{border:1px solid var(--line);border-radius:12px;padding:8px 12px;margin:6px 0}
.scp2 label.sc-row{display:flex!important;flex-direction:row!important;align-items:flex-start!important;gap:10px!important;margin:0!important;cursor:pointer;font-weight:600;font-size:14px}
.scp2 input.sc_ck{width:20px!important;height:20px!important;min-width:20px!important;flex:none!important;margin:1px 0 0!important;padding:0!important}
.scp2 details{margin:6px 0 0 30px;font-size:13px}.scp2 dl{display:grid;gap:2px;margin:6px 0 0}.scp2 dt{margin-top:6px;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--muted)}.scp2 dd{margin:0}
.scp2 textarea{width:100%;min-height:84px}
@media(max-width:860px){
 .s2-item{padding:12px}
 .s2-offer{grid-template-columns:1fr auto;gap:6px 10px}
 .s2-offer .s2-tx{grid-column:1/-1}
 .s2-offer .s2-oa{grid-column:1/-1;justify-content:flex-start}
 .s2-fields{grid-template-columns:1fr 1fr}
 .s2-a{grid-template-columns:1fr 1fr;gap:8px 12px;padding:10px 0}
 .s2-a.h{display:none}
 .s2-a>:first-child{grid-column:1/-1;font-size:14px}
 .s2-a [data-l]::before{content:attr(data-l);display:block}
 .s2-a .r{text-align:left}
 .s2-a .s2-oa{grid-column:1/-1;justify-content:flex-start}
 .s2-blk{justify-content:space-between}
 .s2-bar input{flex-basis:100%}
 .s2-bar button{flex:1}
}`;
document.head.appendChild(st);

const S={pid:'',box:null,items:[],offers:[],types:[],stages:[],orders:[],canEdit:false,name:'',open:{},cat:null};
const p2=n=>String(n).padStart(2,'0');
const num=v=>{const n=Number(String(v===null||v===undefined?'':v).replace(/\s/g,'').replace(',','.'));return isFinite(n)?n:0;};
const norm=v=>{const t=String(v||'').replace(/\s/g,'').replace(',','.');return t===''?'':(isFinite(Number(t))?t:String(v).trim());};
const money=v=>{if(v===''||v===null||v===undefined)return '—';const n=Number(v);return isFinite(n)?n.toLocaleString('ru-RU',{maximumFractionDigits:2})+' ₽':'—';};
const ruD=d=>d?String(d).slice(8,10)+'.'+String(d).slice(5,7)+'.'+String(d).slice(0,4):'';
function rel(v){
 if(!v)return '';
 const a=new Date(v+'T00:00:00'),b=new Date();
 b.setHours(0,0,0,0);
 const n=Math.round((a-b)/864e5);
 return n===0?'сегодня':(n>0?'через '+n+' дн.':Math.abs(n)+' дн. назад');
}
const supplyDo=(op,payload)=>D.fcall('supplyDo',Object.assign({op:op,projectId:S.pid},payload),60000);
async function load(){
 const d=await D.fcall('supplyGet',{projectId:S.pid},60000);
 S.items=d.items||[];S.offers=d.offers||[];S.types=d.types||[];S.stages=d.stages||[];S.orders=d.orders||[];S.canEdit=!!d.canEdit;S.name=d.projectName||'';
}
async function loadCat(){
 if(S.cat)return S.cat;
 try{
  const r=await fetch('supplycat.js?v='+Math.floor(Date.now()/300000)),t=await r.text();
  const a=t.indexOf('const CAT='),b=t.indexOf('];\nconst FLAT',a);
  if(a<0||b<0)throw Error('no cat');
  S.cat=Function('"use strict";return '+t.slice(a+10,b+1))();
 }catch(e){S.cat=[];}
 return S.cat;
}
const LBL=['Нужно на объекте','Когда заказывать','Производство','На что смотреть','Что предусмотреть','Совет'];
function flat(){const out=[];(S.cat||[]).forEach(g=>g[1].forEach(r=>out.push({g:g[0],n:r[0],r:r})));return out;}
function matchCat(title){
 const t=String(title||'').trim().toLowerCase();
 if(!t)return null;
 return flat().find(x=>{const n=x.n.toLowerCase();return t===n||t.indexOf(n)===0;})||null;
}
function canon(part){
 const t=part.trim().toLowerCase();
 if(t.length<4)return part.trim();
 const c=flat().filter(x=>x.n.toLowerCase().indexOf(t)===0);
 return c.length===1?c[0].n:part.trim();
}
function splitParts(text){
 let s=String(text||'');
 const hold=[],ph=m=>{hold.push(m);return '\u0001'+(hold.length-1)+'\u0002';};
 flat().map(x=>x.n).sort((a,b)=>b.length-a.length).forEach(n=>{s=s.replace(new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),ph);});
 s=s.replace(/\([^)]*\)/g,ph);
 const back=x=>{let k=0;while(/\u0001\d+\u0002/.test(x)&&k++<5)x=x.replace(/\u0001(\d+)\u0002/g,(m,i)=>hold[+i]);return x;};
 return s.split(/[\n;,]+/).map(x=>back(x).trim()).filter(Boolean);
}
const typeOfItem=id=>S.types.find(t=>t.title===MARK+id);
function addonsOf(i){
 const t=typeOfItem(i.id),sids=new Set(t?S.stages.filter(s=>s.typeId===t.id).map(s=>s.id):[]);
 return S.orders.filter(o=>o.itemId===i.id||sids.has(o.stageId));
}
const chosenOf=i=>S.offers.find(o=>o.id===i.chosen&&o.itemId===i.id)||null;
const encMeta=(i,n)=>(i||n)?META+JSON.stringify({i:i,n:n}):'';
function om(o){
 const nat={info:String(o.info||''),note:String(o.note||'')};
 if(nat.info||nat.note)return nat;
 const f=String(o.fileName||'');
 if(f.indexOf(META)===0){try{const j=JSON.parse(f.slice(META.length));return {info:String(j.i||''),note:String(j.n||'')};}catch(e){return {info:'',note:'',bad:true};}}
 return nat;
}
function sums(list){let a=0,d=0,p=0;list.forEach(o=>{a+=num(o.amount);d+=num(o.discount);p+=num(o.partner);});return {a:a,d:d,p:p,n:a-d};}
function block(i,ch){
 const a=num(ch.amount),f=i.final===''||i.final===null||i.final===undefined?a:num(i.final),s=sums(addonsOf(i));
 return {a:a+s.a,d:(a-f)+s.d,n:f+s.n,p:num(i.partner)+s.p};
}
function totals(){
 const t={a:0,d:0,n:0,p:0,none:0};
 S.items.forEach(i=>{const ch=chosenOf(i);if(!ch){t.none++;return;}const b=block(i,ch);t.a+=b.a;t.d+=b.d;t.n+=b.n;t.p+=b.p;});
 return t;
}
function groupOf(i){const m=matchCat(i.title);return m?m.g:'Свои позиции';}

function offerHtml(o,i,ch){
 const m=om(o),win=!!ch&&ch.id===o.id,ed=S.canEdit;
 let tx='';
 if(m.info)tx+='<p><i>Информация:</i> '+esc(m.info)+'</p>';
 if(m.note)tx+='<p><i>Пояснение:</i> '+esc(m.note)+'</p>';
 if(o.fileUrl)tx+='<a href="'+esc(o.fileUrl)+'" target="_blank" rel="noopener noreferrer">Смета ↗</a>';
 if(!tx)tx='<i>Без пояснений</i>';
 const act=ed?'<div class="s2-oa">'+(win?'<button type="button" data-s2="unchoose" data-iid="'+esc(i.id)+'">Отменить выбор</button>':'<button type="button" class="primary" data-s2="choose" data-iid="'+esc(i.id)+'" data-oid="'+esc(o.id)+'">Выбрать</button>')+'<button type="button" data-s2="offerEdit" data-oid="'+esc(o.id)+'" title="Изменить">✎</button><button type="button" class="danger" data-s2="offerDel" data-oid="'+esc(o.id)+'" title="Удалить">×</button></div>':'<div></div>';
 return '<div class="s2-offer"><div class="s2-co">'+esc(o.company)+'</div><div class="s2-pr">'+money(o.amount)+'</div><div class="s2-tx">'+tx+'</div>'+act+'</div>';
}
function addRow(o){
 const ed=S.canEdit,id=esc(o.id);
 return '<div class="s2-a"><div>'+esc(o.title)+(o.note?'<small>'+esc(o.note)+'</small>':'')+(o.fileUrl?'<small><a href="'+esc(o.fileUrl)+'" target="_blank" rel="noopener noreferrer">Файл ↗</a></small>':'')+'</div>'
 +'<div data-l="Оплата">'+(ruD(o.payDate)||'—')+'<small>'+esc(rel(o.payDate))+'</small></div><div data-l="Доставка">'+(ruD(o.deliveryDate)||'—')+'<small>'+esc(rel(o.deliveryDate))+'</small></div>'
 +'<div class="r" data-l="Смета">'+money(o.amount)+'</div><div class="r" data-l="Скидка">'+money(o.discount)+'</div><div class="r" data-l="Партнёрские">'+money(o.partner)+'</div><div class="r" data-l="Итого"><b>'+money(num(o.amount)-num(o.discount))+'</b></div>'
 +(ed?'<div class="s2-oa"><button type="button" data-s2="orderEdit" data-rid="'+id+'" title="Изменить">✎</button><button type="button" class="danger" data-s2="orderDel" data-rid="'+id+'" title="Удалить">×</button></div>':'<div></div>')+'</div>';
}
function itemHtml(i){
 const offs=S.offers.filter(o=>o.itemId===i.id),ch=chosenOf(i),iid=esc(i.id),ed=S.canEdit;
 const stt=ch?'ok':(offs.length?'wait':'none'),cm=matchCat(i.title);
 let h='<section class="s2-item"><div class="s2-h"><span class="s2-dot '+stt+'" title="'+(ch?'Компания выбрана':offs.length?'Идёт тендер':'Предложений нет')+'"></span><div class="s2-t"><b>'+esc(i.title)+'</b></div>';
 if(ed)h+='<div class="s2-ha"><button type="button" data-s2="itemRename" data-iid="'+iid+'" title="Переименовать">✎</button><button type="button" class="danger" data-s2="itemDel" data-iid="'+iid+'" title="Удалить позицию">×</button></div>';
 h+='</div>';
 if(cm)h+='<details class="s2-hint"><summary>Пояснения к закупке</summary><dl>'+LBL.map((l,k)=>'<dt>'+esc(l)+'</dt><dd>'+esc(cm.r[k+1]||'')+'</dd>').join('')+'</dl></details>';
 const showAll=!ch||S.open[i.id];
 if(ch){
  const a=num(ch.amount),f=i.final===''||i.final===null||i.final===undefined?a:num(i.final),ad=addonsOf(i),b=block(i,ch),dis=ed?'':'disabled',m=om(ch);
  h+='<div class="s2-win"><div class="s2-wh"><span class="s2-badge">Прошла отбор</span><b>'+esc(ch.company)+'</b><span class="sp"></span>'+(ed?'<button type="button" data-s2="unchoose" data-iid="'+iid+'">Отменить выбор</button><button type="button" data-s2="offerEdit" data-oid="'+esc(ch.id)+'" title="Изменить">✎</button>':'')+'</div>';
  if(m.info||m.note||ch.fileUrl)h+='<div class="s2-tx" style="margin-top:6px">'+(m.info?'<p><i>Информация:</i> '+esc(m.info)+'</p>':'')+(m.note?'<p><i>Пояснение:</i> '+esc(m.note)+'</p>':'')+(ch.fileUrl?'<a href="'+esc(ch.fileUrl)+'" target="_blank" rel="noopener noreferrer">Смета ↗</a>':'')+'</div>';
  h+='<div class="s2-fields"><div class="s2-f"><span>Смета</span><b>'+money(a)+'</b></div><div class="s2-f"><span>Скидка</span><b>'+money(a-f)+'</b></div>'
  +'<label class="s2-f"><span>Итого</span><input class="s2_in" data-iid="'+iid+'" data-k="final" inputmode="decimal" value="'+esc(i.final)+'" placeholder="'+esc(a)+'" '+dis+'></label>'
  +'<label class="s2-f"><span>Партнёрские</span><input class="s2_in" data-iid="'+iid+'" data-k="partner" inputmode="decimal" value="'+esc(i.partner)+'" placeholder="0" '+dis+'></label>'
  +'<label class="s2-f"><span>Оплата</span><input type="date" class="s2_in" data-iid="'+iid+'" data-k="payDate" value="'+esc(i.payDate||'')+'" '+dis+'></label>'
  +'<label class="s2-f"><span>Доставка</span><input type="date" class="s2_in" data-iid="'+iid+'" data-k="deliveryDate" value="'+esc(i.deliveryDate||'')+'" '+dis+'></label></div>';
  h+='<div class="s2-addh"><div class="s2-cap" style="margin:0">Докупки у этой фирмы ('+ad.length+')</div>'+(ed?'<button type="button" data-s2="addonAdd" data-iid="'+iid+'">+ Докупка</button>':'')+'</div>';
  if(ad.length)h+='<div class="s2-a h"><div>Что докупили</div><div>Оплата</div><div>Доставка</div><div class="r">Смета</div><div class="r">Скидка</div><div class="r">Партнёрские</div><div class="r">Итого</div><div></div></div>'+ad.map(addRow).join('');
  h+='<div class="s2-blk"><span>Итого по позиции</span><span>смета <b>'+money(b.a)+'</b></span><span>скидка <b>'+money(b.d)+'</b></span><span>партнёрские <b>'+money(b.p)+'</b></span><span>итого <b class="big">'+money(b.n)+'</b></span></div></div>';
  const others=offs.filter(o=>o.id!==ch.id);
  if(others.length)h+='<div class="s2-ft"><button type="button" data-s2="toggle" data-iid="'+iid+'">'+(S.open[i.id]?'Скрыть остальных':'Остальные участники тендера ('+others.length+')')+'</button></div>';
  if(S.open[i.id])h+='<div class="s2-tend">'+others.map(o=>offerHtml(o,i,ch)).join('')+'</div>';
 }else{
  h+='<div class="s2-cap">Тендер'+(offs.length?' — '+offs.length+' '+(offs.length===1?'предложение':'предложений'):'')+'</div><div class="s2-tend">'+offs.map(o=>offerHtml(o,i,ch)).join('')+(offs.length?'':'<p class="notice" style="margin:0">Предложений пока нет. Добавьте компании, цены и пояснения, затем выберите одну.</p>')+'</div>';
 }
 if(ed&&(showAll||!ch))h+='<div class="s2-ft"><button type="button" data-s2="offerAdd" data-iid="'+iid+'">+ Компания в тендер</button></div>';
 return h+'</section>';
}
function archive(){
 const ts=S.types.filter(t=>String(t.title).indexOf(MARK)!==0);
 if(!ts.length)return '';
 let rows='';
 ts.forEach(t=>{
  S.stages.filter(s=>s.typeId===t.id).forEach(s=>{
   S.orders.filter(o=>o.stageId===s.id).forEach(o=>{rows+='<tr><td>'+esc(t.title)+'</td><td>'+esc(s.title)+'</td><td>'+esc(o.title)+'</td><td class="r">'+money(o.amount)+'</td><td class="r">'+money(o.discount)+'</td></tr>';});
  });
 });
 return '<details class="s2-arc"><summary>Прежние типы закупок (архив, не входят в итоги)</summary><table><thead><tr><th>Тип</th><th>Этап</th><th>Заказ</th><th class="r">Смета</th><th class="r">Скидка</th></tr></thead><tbody>'+(rows||'<tr><td colspan="5">Заказов нет</td></tr>')+'</tbody></table></details>';
}
function html(){
 const ed=S.canEdit;
 let h='<div class="s2"><div class="s2-bar">'+(ed?'<input id="s2_new" placeholder="Позиция или несколько через запятую: плитка, кухня, двери" maxlength="400"><button type="button" class="primary" data-s2="itemAdd">+ Позиция</button>':'')+'<button type="button" data-s2="pdf">Сохранить в PDF</button></div>';
 if(!S.items.length)h+='<p class="notice">Позиций пока нет. '+(ed?'Нажмите «+ Позиция»: выберите из списка по этапам или впишите свои.':'')+'</p>';
 const order=(S.cat||[]).map(g=>g[0]).concat(['Свои позиции']),by={};
 S.items.forEach(i=>{const g=groupOf(i);(by[g]=by[g]||[]).push(i);});
 order.concat(Object.keys(by).filter(k=>order.indexOf(k)<0)).forEach(g=>{
  const list=by[g];if(!list||!list.length)return;
  const done=list.filter(i=>chosenOf(i)).length;
  h+='<div class="s2-g"><h3>'+esc(g)+'</h3><small>выбрано '+done+' из '+list.length+'</small></div>'+list.map(itemHtml).join('');
 });
 if(S.items.length){
  const t=totals();
  h+='<div class="s2-tot"><div>Смета с докупками<b>'+money(t.a)+'</b></div><div>Скидка<b>'+money(t.d)+'</b></div><div>Итого после скидки<b>'+money(t.n)+'</b></div><div>Партнёрские<b>'+money(t.p)+'</b></div><div>Позиций без выбора<b>'+t.none+'</b></div></div>';
 }
 return h+archive()+'</div>';
}
function draw(){
 const b=S.box;
 if(!b||!document.body.contains(b))return;
 const a=document.activeElement;
 if(a&&b.contains(a)&&a.classList&&a.classList.contains('s2_in'))return;
 b.innerHTML=html();
}
window.renderSupply=function(box,pid){
 S.box=box;
 if(S.pid!==pid){S.pid=pid;S.items=[];S.offers=[];S.types=[];S.stages=[];S.orders=[];S.open={};box.innerHTML='<p class="notice">Загрузка…</p>';}
 else draw();
 const mine=pid;
 Promise.all([loadCat(),load()]).then(()=>{if(S.pid===mine)draw();}).catch(e=>{if(S.box===box)box.innerHTML='<p class="error">'+esc(e.message||String(e))+'</p>';});
};
const run=fn=>guarded(async()=>{await fn();await load();draw();});

async function addTitles(titles){
 const have=new Set(S.items.map(i=>i.title.trim().toLowerCase()));
 const list=[];
 titles.forEach(t=>{const x=canon(t);if(x&&!have.has(x.toLowerCase())){have.add(x.toLowerCase());list.push(x);}});
 if(!list.length){toast('Эти позиции уже добавлены');return 0;}
 for(const t of list)await supplyDo('itemAdd',{title:t.slice(0,200)});
 return list.length;
}
function picker(){
 const have=S.items.map(i=>i.title.trim().toLowerCase());
 let h='<div class="scp2"><h2>Добавить позиции</h2><p class="notice">Отметьте нужное по этапам. Ниже можно вписать свои позиции: несколько через запятую или с новой строки.</p><input id="s2_q" placeholder="Поиск по названию">';
 (S.cat||[]).forEach(g=>{
  h+='<div class="sc-g">'+esc(g[0])+' <button type="button" data-s2="grpAll" data-g="'+esc(g[0])+'">Отметить этап</button></div>';
  g[1].forEach(r=>{
   const dis=have.some(t=>t===r[0].toLowerCase()||t.indexOf(r[0].toLowerCase())===0);
   h+='<div class="sc-it" data-n="'+esc(r[0].toLowerCase())+'"><label class="sc-row"><input type="checkbox" class="sc_ck" data-n="'+esc(r[0])+'" data-g="'+esc(g[0])+'"'+(dis?' disabled':'')+'><span>'+esc(r[0])+(dis?' <small>(уже добавлено)</small>':'')+'</span></label><details><summary>Пояснения</summary><dl>'+LBL.map((l,k)=>'<dt>'+esc(l)+'</dt><dd>'+esc(r[k+1]||'')+'</dd>').join('')+'</dl></details></div>';
  });
 });
 h+='<div class="sc-g">Своё (если в списке нет)</div><textarea id="s2_own" placeholder="например: зеркало в прихожую, ковёр, плинтус"></textarea><p id="s2_st" class="notice"></p></div>';
 showForm(h,async()=>{
  const ch=[...document.querySelectorAll('.sc_ck:checked')].map(c=>c.dataset.n),own=splitParts(($('s2_own')&&$('s2_own').value)||'');
  if(!ch.length&&!own.length)throw Error('Отметьте позиции или впишите свои');
  const e=$('s2_st');if(e)e.textContent='Добавляем…';
  await addTitles(ch.concat(own));
  $('dialog').close();
  await load();draw();
 });
}
function offerForm(item,offer){
 const m=offer?om(offer):{info:'',note:''};
 showForm('<h2>'+(offer?'Предложение компании':'Новое предложение')+'</h2><p class="notice">'+esc(item.title)+'</p><label>Компания<input id="so_co" maxlength="150" value="'+esc(offer?offer.company:'')+'" required></label><label>Цена, ₽<input id="so_am" inputmode="decimal" value="'+esc(offer?offer.amount:'')+'"></label><label>Информация (что входит, сроки, гарантия, условия)<textarea id="so_in" rows="3" maxlength="600">'+esc(m.info)+'</textarea></label><label>Пояснение (комментарий к этому предложению)<textarea id="so_nt" rows="3" maxlength="600">'+esc(m.note)+'</textarea></label><label>Ссылка на смету (необязательно)<input id="so_url" type="url" maxlength="500" placeholder="https://…" value="'+esc(offer?offer.fileUrl:'')+'"></label>',async()=>{
  const co=$('so_co').value.trim();
  if(!co)throw Error('Укажите компанию');
  const info=$('so_in').value.trim(),note=$('so_nt').value.trim();
  const p={company:co,amount:norm($('so_am').value),fileUrl:$('so_url').value.trim(),fileName:encMeta(info,note),info:info,note:note};
  if(offer){p.id=offer.id;await supplyDo('offerEdit',p);}else{p.itemId=item.id;await supplyDo('offerAdd',p);}
  $('dialog').close();
  await load();draw();
  const saved=offer?S.offers.find(x=>x.id===offer.id):S.offers.filter(x=>x.itemId===item.id).pop();
  if(saved&&(info||note)){const g=om(saved);if(g.info!==info||g.note!==note)toast('Сервер сохранил пояснения не полностью. Нужно обновить серверную часть (Code.gs).');}
 });
}
async function ensureStage(item){
 let t=typeOfItem(item.id);
 if(!t){await supplyDo('typeAdd',{title:MARK+item.id,partner:''});await load();t=typeOfItem(item.id);}
 if(!t)throw Error('Не удалось создать раздел докупок');
 let s=S.stages.find(x=>x.typeId===t.id);
 if(!s){await supplyDo('stageAdd',{typeId:t.id,title:'Докупки',deliveryDate:''});await load();s=S.stages.find(x=>x.typeId===t.id);}
 if(!s)throw Error('Не удалось создать этап докупок');
 return s;
}
function addonForm(item,o){
 const ch=chosenOf(item);
 showForm('<h2>'+(o?'Докупка':'Новая докупка')+'</h2><p class="notice">'+esc(item.title)+(ch?' · '+esc(ch.company):'')+'</p><label>Что докупаем<input id="or_t" maxlength="200" value="'+esc(o?o.title:'')+'" required></label><div class="formgrid"><label>Дата оплаты<input id="or_d" type="date" value="'+esc(o?o.payDate:'')+'"></label><label>Дата доставки<input id="or_v" type="date" value="'+esc(o?o.deliveryDate:'')+'"></label></div><div class="formgrid"><label>Сумма, ₽<input id="or_a" inputmode="decimal" value="'+esc(o?o.amount:'')+'"></label><label>Скидка, ₽<input id="or_s" inputmode="decimal" value="'+esc(o?o.discount:'')+'"></label></div><label>Партнёрские, ₽<input id="or_p" inputmode="decimal" value="'+esc(o?o.partner:'')+'"></label><label>Заметка<input id="or_n" maxlength="500" value="'+esc(o?o.note:'')+'"></label><label>Ссылка на файл (необязательно)<input id="or_u" type="url" maxlength="500" placeholder="https://…" value="'+esc(o?o.fileUrl:'')+'"></label>',async()=>{
  const v=$('or_t').value.trim();
  if(!v)throw Error('Укажите, что докупаем');
  const p={title:v,payDate:$('or_d').value,deliveryDate:$('or_v').value,amount:norm($('or_a').value),discount:norm($('or_s').value),partner:norm($('or_p').value),fileUrl:$('or_u').value.trim(),note:$('or_n').value.trim()};
  if(o){p.id=o.id;await supplyDo('orderEdit',p);}
  else{const s=await ensureStage(item);p.stageId=s.id;await supplyDo('orderAdd',p);}
  $('dialog').close();
  await load();draw();
 });
}
function printPdf(){
 const d=new Date(),ds=p2(d.getDate())+'.'+p2(d.getMonth()+1)+'.'+d.getFullYear(),t=totals();
 let n=0;
 const rows=S.items.map(i=>{
  n++;
  const ch=chosenOf(i);
  if(!ch)return '<tr><td>'+n+'</td><td>'+esc(i.title)+'</td><td colspan="5">компания не выбрана</td></tr>';
  const a=num(ch.amount),f=i.final===''||i.final===null||i.final===undefined?a:num(i.final);
  let r='<tr><td>'+n+'</td><td>'+esc(i.title)+(i.payDate?' · оплата '+ruD(i.payDate):'')+(i.deliveryDate?' · доставка '+ruD(i.deliveryDate):'')+'</td><td>'+esc(ch.company)+'</td><td class="r">'+money(a)+'</td><td class="r">'+money(a-f)+'</td><td class="r">'+money(f)+'</td><td class="r">'+money(i.partner)+'</td></tr>';
  addonsOf(i).forEach(o=>{r+='<tr class="s"><td></td><td>Докупка: '+esc(o.title)+(o.payDate?' · оплата '+ruD(o.payDate):'')+(o.deliveryDate?' · доставка '+ruD(o.deliveryDate):'')+'</td><td></td><td class="r">'+money(o.amount)+'</td><td class="r">'+money(o.discount)+'</td><td class="r">'+money(num(o.amount)-num(o.discount))+'</td><td class="r">'+money(o.partner)+'</td></tr>';});
  return r;
 }).join('');
 const w=window.open('','_blank');
 if(!w){toast('Разрешите всплывающие окна для этого сайта');return;}
 w.document.write('<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Комплектация — '+esc(S.name)+'</title><style>body{font:12px/1.4 Arial,Helvetica,sans-serif;color:#111;margin:14mm 10mm}h1{font-size:18px;margin:0 0 4px}.sub{color:#555;margin-bottom:14px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #888;padding:5px 7px;text-align:left;vertical-align:top}th{background:#eee}td.r,th.r{text-align:right;white-space:nowrap}tfoot td{font-weight:bold;background:#f6f6f6}tr.s td{background:#f1f2f6}@page{size:A4 landscape;margin:10mm}</style></head><body><h1>'+esc(S.name)+'</h1><div class="sub">Комплектация • '+ds+'</div><table><thead><tr><th>№</th><th>Позиция</th><th>Компания</th><th class="r">Смета</th><th class="r">Скидка</th><th class="r">Итого</th><th class="r">Партнёрские</th></tr></thead><tbody>'+rows+'</tbody><tfoot><tr><td colspan="3">Итого</td><td class="r">'+money(t.a)+'</td><td class="r">'+money(t.d)+'</td><td class="r">'+money(t.n)+'</td><td class="r">'+money(t.p)+'</td></tr></tfoot></table></body></html>');
 w.document.close();
 setTimeout(()=>{try{w.focus();w.print();}catch(e){}},400);
}
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('[data-s2]');
 if(!b)return;
 const a=b.dataset.s2;
 if(a==='grpAll'){document.querySelectorAll('.sc_ck').forEach(c=>{if(c.dataset.g===b.dataset.g&&!c.disabled)c.checked=true;});return;}
 if(!S.box||!S.box.contains(b))return;
 const iid=b.dataset.iid,oid=b.dataset.oid,rid=b.dataset.rid,item=S.items.find(x=>x.id===iid),offer=S.offers.find(x=>x.id===oid),ord=S.orders.find(x=>x.id===rid);
 if(a==='pdf'){printPdf();return;}
 if(a==='toggle'){S.open[iid]=!S.open[iid];draw();return;}
 if(a==='itemAdd'){
  const inp=$('s2_new'),v=(inp&&inp.value||'').trim();
  if(!v){picker();return;}
  run(async()=>{const n=await addTitles(splitParts(v));if(n&&inp)inp.value='';});
  return;
 }
 if(a==='itemRename'&&item){const v=prompt('Название позиции',item.title);if(v&&v.trim())run(()=>supplyDo('itemEdit',{id:iid,title:v.trim()}));return;}
 if(a==='itemDel'&&item){
  if(confirm('Удалить позицию «'+item.title+'», все предложения и докупки?'))run(async()=>{const t=typeOfItem(iid);if(t)await supplyDo('typeDelete',{id:t.id});await supplyDo('itemDelete',{id:iid});});
  return;
 }
 if(a==='offerAdd'&&item){offerForm(item,null);return;}
 if(a==='offerEdit'&&offer){offerForm(S.items.find(x=>x.id===offer.itemId),offer);return;}
 if(a==='offerDel'&&offer){if(confirm('Удалить предложение «'+offer.company+'»?'))run(()=>supplyDo('offerDelete',{id:oid}));return;}
 if(a==='choose'){run(()=>supplyDo('choose',{itemId:iid,offerId:oid}));return;}
 if(a==='unchoose'){run(()=>supplyDo('choose',{itemId:iid,offerId:''}));return;}
 if(a==='addonAdd'&&item){addonForm(item,null);return;}
 if(a==='orderEdit'&&ord){addonForm(S.items.find(x=>x.id===ord.itemId)||S.items.find(x=>{const t=typeOfItem(x.id);const s=S.stages.find(y=>y.id===ord.stageId);return t&&s&&s.typeId===t.id;}),ord);return;}
 if(a==='orderDel'&&ord){if(confirm('Удалить «'+ord.title+'»?'))run(()=>supplyDo('orderDelete',{id:rid}));return;}
});
document.addEventListener('change',e=>{
 const el=e.target;
 if(!el||!el.classList||!el.classList.contains('s2_in')||!S.box||!S.box.contains(el))return;
 const p={id:el.dataset.iid};
 p[el.dataset.k]=(el.dataset.k==='final'||el.dataset.k==='partner')?norm(el.value):el.value;
 el.blur();
 guarded(async()=>{await supplyDo('itemEdit',p);await load();draw();});
});
document.addEventListener('keydown',e=>{
 if(e.key==='Enter'&&e.target&&e.target.id==='s2_new'){e.preventDefault();const b=S.box&&S.box.querySelector('[data-s2=itemAdd]');if(b)b.click();}
});
document.addEventListener('input',e=>{
 if(!e.target||e.target.id!=='s2_q')return;
 const q=e.target.value.trim().toLowerCase();
 document.querySelectorAll('.scp2 .sc-it').forEach(r=>{r.style.display=!q||r.dataset.n.indexOf(q)>=0?'':'none';});
});
window.studioSupply2={splitParts:splitParts,canon:canon,om:om};
})();
