'use strict';
/* Патч «Комплектации»: докупки как строки основной таблицы, подитоги этапов, PDF по этапам.
   Берёт supply2.js, заменяет нужные функции и запускает. Если структура файла изменилась, запускается исходный supply2.js без изменений. */
(function(){
var src='';
try{var x=new XMLHttpRequest();x.open('GET','supply2.js?v='+Math.floor(Date.now()/300000),false);x.send();if(x.status===200)src=x.responseText;}catch(e){}
if(!src)return;
var A=String.raw`function mkIn(cls,attr,k,v,ph,date,dis){return '<input class="'+cls+'" '+attr+' data-k="'+k+'"'+(date?' type="date"':' inputmode="decimal"')+' value="'+esc(v)+'" placeholder="'+esc(ph)+'"'+dis+'>';}
function mainRow(i,ch){
 const a=num(ch.amount),f=i.final===''||i.final===null||i.final===undefined?a:num(i.final),iid='data-iid="'+esc(i.id)+'"',dis=S.canEdit?'':' disabled';
 return '<div class="s2-a m"><div><b>Основная смета</b></div>'
 +'<div data-l="Оплата">'+mkIn('s2_in',iid,'payDate',i.payDate||'','',1,dis)+'</div><div data-l="Доставка">'+mkIn('s2_in',iid,'deliveryDate',i.deliveryDate||'','',1,dis)+'</div>'
 +'<div class="r" data-l="Смета">'+money(a)+'</div><div class="r" data-l="Скидка">'+money(a-f)+'</div>'
 +'<div class="r" data-l="Партнёрские">'+mkIn('s2_in',iid,'partner',i.partner,'0',0,dis)+'</div><div class="r" data-l="Итого">'+mkIn('s2_in',iid,'final',i.final,a,0,dis)+'</div><div class="s2-oa"></div></div>';
}
function addRow(o){
 const ed=S.canEdit,id=esc(o.id),rid='data-rid="'+id+'"',dis=ed?'':' disabled',a=num(o.amount),emp=(o.amount===''||o.amount===null||o.amount===undefined)&&(o.discount===''||o.discount===null||o.discount===undefined);
 return '<div class="s2-a"><div>'+esc(o.title)+(o.note?'<small>'+esc(o.note)+'</small>':'')+(o.fileUrl?'<small><a href="'+esc(o.fileUrl)+'" target="_blank" rel="noopener noreferrer">Файл ↗</a></small>':'')+'</div>'
 +'<div data-l="Оплата">'+mkIn('s2_ao',rid,'payDate',o.payDate||'','',1,dis)+'</div><div data-l="Доставка">'+mkIn('s2_ao',rid,'deliveryDate',o.deliveryDate||'','',1,dis)+'</div>'
 +'<div class="r" data-l="Смета">'+mkIn('s2_ao',rid,'amount',o.amount,'0',0,dis)+'</div><div class="r" data-l="Скидка">'+money(o.discount)+'</div>'
 +'<div class="r" data-l="Партнёрские">'+mkIn('s2_ao',rid,'partner',o.partner,'0',0,dis)+'</div><div class="r" data-l="Итого">'+mkIn('s2_ao',rid,'total',emp?'':String(Math.round((a-num(o.discount))*100)/100),'0',0,dis)+'</div>'
 +(ed?'<div class="s2-oa"><button type="button" data-s2="orderEdit" data-rid="'+id+'" title="Изменить">✎</button><button type="button" class="danger" data-s2="orderDel" data-rid="'+id+'" title="Удалить">×</button></div>':'<div></div>')+'</div>';
}
function itemHtml(i){
 const offs=S.offers.filter(o=>o.itemId===i.id),ch=chosenOf(i),iid=esc(i.id),ed=S.canEdit;
 const stt=ch?'ok':(offs.length?'wait':'none'),cm=matchCat(i.title);
 let h='<section class="s2-item"><div class="s2-h"><span class="s2-dot '+stt+'" title="'+(ch?'Компания выбрана':offs.length?'Идёт тендер':'Предложений нет')+'"></span><div class="s2-t"><b>'+esc(i.title)+'</b></div>';
 if(ed)h+='<div class="s2-ha"><button type="button" data-s2="itemRename" data-iid="'+iid+'" title="Переименовать">✎</button><button type="button" class="danger" data-s2="itemDel" data-iid="'+iid+'" title="Удалить позицию">×</button></div>';
 h+='</div>';
 const nt=noteOf(i);
 if(ed||nt)h+='<label class="s2-note"><span>Пояснение / заметка</span><textarea class="s2_note" data-iid="'+iid+'" rows="1" maxlength="2000" placeholder="Заметки для себя по этой позиции" '+(ed?'':'readonly')+'>'+esc(nt)+'</textarea></label>';
 if(cm)h+='<details class="s2-hint"><summary>Пояснения к закупке</summary><dl>'+LBL.map((l,k)=>'<dt>'+esc(l)+'</dt><dd>'+esc(cm.r[k+1]||'')+'</dd>').join('')+'</dl></details>';
 const showAll=!ch||S.open[i.id];
 if(ch){
  const ad=addonsOf(i),b=block(i,ch),m=om(ch);
  h+='<div class="s2-win"><div class="s2-wh"><span class="s2-badge">Прошла отбор</span><b>'+esc(ch.company)+'</b><span class="sp"></span>'+(ed?'<button type="button" data-s2="unchoose" data-iid="'+iid+'">Отменить выбор</button><button type="button" data-s2="offerEdit" data-oid="'+esc(ch.id)+'" title="Изменить">✎</button>':'')+'</div>';
  if(m.info||m.note||ch.fileUrl)h+='<div class="s2-tx" style="margin-top:6px">'+(m.info?'<p><i>Информация:</i> '+esc(m.info)+'</p>':'')+(m.note?'<p><i>Пояснение:</i> '+esc(m.note)+'</p>':'')+(ch.fileUrl?'<a href="'+esc(ch.fileUrl)+'" target="_blank" rel="noopener noreferrer">Смета ↗</a>':'')+'</div>';
  h+='<div class="s2-a h"><div></div><div>Оплата</div><div>Доставка</div><div class="r">Смета</div><div class="r">Скидка</div><div class="r">Партнёрские</div><div class="r">Итого</div><div></div></div>'+mainRow(i,ch)+ad.map(addRow).join('');
  if(ed)h+='<div class="s2-addh"><button type="button" data-s2="addonAdd" data-iid="'+iid+'">+ Докупка</button></div>';
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
`;
var B=String.raw`function sub(list){const t={a:0,d:0,n:0,p:0,none:0};list.forEach(i=>{const ch=chosenOf(i);if(!ch){t.none++;return;}const b=block(i,ch);t.a+=b.a;t.d+=b.d;t.n+=b.n;t.p+=b.p;});return t;}
function html(){
 const ed=S.canEdit;
 let h='<div class="s2"><div class="s2-bar">'+(ed?'<input id="s2_new" placeholder="Позиция или несколько через запятую: плитка, кухня, двери" maxlength="400"><button type="button" class="primary" data-s2="itemAdd">+ Позиция</button>':'')+'<button type="button" data-s2="pdf">Сохранить в PDF</button></div>';
 if(!S.items.length)h+='<p class="notice">Позиций пока нет. '+(ed?'Нажмите «+ Позиция»: выберите из списка по этапам или впишите свои.':'')+'</p>';
 const order=(S.cat||[]).map(g=>g[0]).concat(['Свои позиции']),by={};
 S.items.forEach(i=>{const g=groupOf(i);(by[g]=by[g]||[]).push(i);});
 order.concat(Object.keys(by).filter(k=>order.indexOf(k)<0)).forEach(g=>{
  const list=by[g];if(!list||!list.length)return;
  const done=list.filter(i=>chosenOf(i)).length,s=sub(list);
  h+='<div class="s2-g"><h3>'+esc(g)+'</h3><small>выбрано '+done+' из '+list.length+'</small></div><div class="s2-list">'+list.map(itemHtml).join('')+'</div>'
  +'<div class="s2-blk s2-sub"><span>Подитог этапа «'+esc(g)+'»'+(s.none?' · без выбора: '+s.none:'')+'</span><span>смета <b>'+money(s.a)+'</b></span><span>скидка <b>'+money(s.d)+'</b></span><span>партнёрские <b>'+money(s.p)+'</b></span><span>итого <b class="big">'+money(s.n)+'</b></span></div>';
 });
 if(S.items.length){
  const t=totals();
  h+='<div class="s2-tot"><div style="grid-column:1/-1">Итого по всем этапам</div><div>Смета с докупками<b>'+money(t.a)+'</b></div><div>Скидка<b>'+money(t.d)+'</b></div><div>Итого после скидки<b>'+money(t.n)+'</b></div><div>Партнёрские<b>'+money(t.p)+'</b></div><div>Позиций без выбора<b>'+t.none+'</b></div></div>';
 }
 return h+archive()+'</div>';
}
`;
var C=String.raw`function printPdf(){
 const d=new Date(),ds=p2(d.getDate())+'.'+p2(d.getMonth()+1)+'.'+d.getFullYear(),t=totals();
 const order=(S.cat||[]).map(g=>g[0]).concat(['Свои позиции']),by={};
 S.items.forEach(i=>{const g=groupOf(i);(by[g]=by[g]||[]).push(i);});
 const sr=(label,s,cls)=>'<tr class="'+cls+'"><td colspan="5">'+label+'</td><td class="r">'+money(s.a)+'</td><td class="r">'+money(s.d)+'</td><td class="r">'+money(s.n)+'</td><td class="r">'+money(s.p)+'</td></tr>';
 let n=0,rows='';
 order.concat(Object.keys(by).filter(k=>order.indexOf(k)<0)).forEach(g=>{
  const list=by[g];if(!list||!list.length)return;
  rows+='<tr class="g"><td colspan="9">'+esc(g)+'</td></tr>';
  list.forEach(i=>{
   n++;
   const ch=chosenOf(i),nt=noteOf(i);
   const ntr=nt?'<tr class="n"><td></td><td colspan="8"><b>Пояснение:</b> '+esc(nt).replace(/\n/g,'<br>')+'</td></tr>':'';
   if(!ch){rows+='<tr><td>'+n+'</td><td>'+esc(i.title)+'</td><td colspan="7">компания не выбрана</td></tr>'+ntr;return;}
   const a=num(ch.amount),f=i.final===''||i.final===null||i.final===undefined?a:num(i.final);
   rows+='<tr><td>'+n+'</td><td>'+esc(i.title)+'</td><td>'+esc(ch.company)+'</td><td class="r">'+esc(ruD(i.payDate))+'</td><td class="r">'+esc(ruD(i.deliveryDate))+'</td><td class="r">'+money(a)+'</td><td class="r">'+money(a-f)+'</td><td class="r">'+money(f)+'</td><td class="r">'+money(i.partner)+'</td></tr>';
   addonsOf(i).forEach(o=>{rows+='<tr class="s"><td></td><td>Докупка: '+esc(o.title)+(o.note?' ('+esc(o.note)+')':'')+'</td><td></td><td class="r">'+esc(ruD(o.payDate))+'</td><td class="r">'+esc(ruD(o.deliveryDate))+'</td><td class="r">'+money(o.amount)+'</td><td class="r">'+money(o.discount)+'</td><td class="r">'+money(num(o.amount)-num(o.discount))+'</td><td class="r">'+money(o.partner)+'</td></tr>';});
   const m=om(ch);
   if(m.info||m.note)rows+='<tr class="n"><td></td><td colspan="8">'+(m.info?'<b>Информация:</b> '+esc(m.info)+' ':'')+(m.note?'<b>Пояснение к предложению:</b> '+esc(m.note):'')+'</td></tr>';
   rows+=ntr;
  });
  rows+=sr('Подитог этапа «'+esc(g)+'»',sub(list),'sb');
 });
 const w=window.open('','_blank');
 if(!w){toast('Разрешите всплывающие окна для этого сайта');return;}
 w.document.write('<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Комплектация — '+esc(S.name)+'</title><style>body{font:12px/1.4 Arial,Helvetica,sans-serif;color:#111;margin:14mm 10mm}h1{font-size:18px;margin:0 0 4px}.sub{color:#555;margin-bottom:14px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #888;padding:5px 7px;text-align:left;vertical-align:top}th{background:#eee}td.r,th.r{text-align:right;white-space:nowrap}tr.g td{background:#dfe6ee;font-weight:bold}tr.sb td{background:#eef1f5;font-weight:bold}tfoot td{font-weight:bold;background:#f6f6f6}tr.s td{background:#f1f2f6}tr.n td{background:#fafafa;font-size:11px;color:#333}@page{size:A4 landscape;margin:10mm}</style></head><body><h1>'+esc(S.name)+'</h1><div class="sub">Комплектация • '+ds+'</div><table><thead><tr><th>№</th><th>Позиция</th><th>Компания</th><th class="r">Оплата</th><th class="r">Доставка</th><th class="r">Смета</th><th class="r">Скидка</th><th class="r">Итого</th><th class="r">Партнёрские</th></tr></thead><tbody>'+rows+'</tbody><tfoot>'+sr('Итого по всем этапам',t,'')+'</tfoot></table></body></html>');
 w.document.close();
 setTimeout(()=>{try{w.focus();w.print();}catch(e){}},400);
}
`;
var CH=String.raw`if(el.classList.contains('s2_ao')){
  const o=S.orders.find(x=>x.id===el.dataset.rid);
  if(!o)return;
  const k=el.dataset.k,v=el.value;
  const p={id:o.id,title:o.title,payDate:o.payDate||'',deliveryDate:o.deliveryDate||'',amount:norm(o.amount),discount:norm(o.discount),partner:norm(o.partner),fileUrl:o.fileUrl||'',note:o.note||''};
  if(k==='payDate'||k==='deliveryDate')p[k]=v;
  else if(k==='amount')p.amount=norm(v);
  else if(k==='partner')p.partner=norm(v);
  else if(k==='total'){const t=norm(v);if(t===''){p.discount='';}else{const a=num(p.amount),dd=a-num(t);if(!a||dd<0){p.amount=t;p.discount='';}else p.discount=String(Math.round(dd*100)/100);}}
  el.blur();
  guarded(async()=>{await supplyDo('orderEdit',p);await load();draw();});
  return;
 }
 if(el.classList.contains('s2_in')){`;
function cut(s,a,b,rep){var i=s.indexOf(a),j=s.indexOf(b,i+1);if(i<0||j<0)return null;return s.slice(0,i)+rep+s.slice(j);}
function swap(s,a,rep){var i=s.indexOf(a);if(i<0||s.indexOf(a,i+1)>=0)return null;return s.slice(0,i)+rep+s.slice(i+a.length);}
var out=src;
var steps=[
 function(s){return cut(s,'function addRow(o){','function archive(',A);},
 function(s){return cut(s,'function html(){','function autosize(',B);},
 function(s){return cut(s,'function printPdf(){',"document.addEventListener('click',",C);},
 function(s){return swap(s,"if(el.classList.contains('s2_in')){",CH);},
 function(s){return swap(s,"a.classList.contains('s2_in')||","a.classList.contains('s2_in')||a.classList.contains('s2_ao')||");}
];
for(var k=0;k<steps.length;k++){var r=steps[k](out);if(r===null){out=src;if(window.console)console.warn('supply2 patch: шаг '+(k+1)+' не применён, работает исходная версия');break;}out=r;}
(0,Function)(out)();
})();
