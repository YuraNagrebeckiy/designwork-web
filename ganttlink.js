'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined')return;
const HU=[262,28,174,330,48,205,350,120];
const A=x=>typeof arr==='function'?arr(x):(Array.isArray(x)?x:[]);
function paint(){
 const root=document.getElementById('ganttRoot');
 if(!root||typeof state==='undefined'||!state||!state.tasks)return;
 const rows=[...root.querySelectorAll('.grow')].filter(r=>!r.classList.contains('ghead')&&r.querySelector('.bar'));
 if(!rows.length)return;
 const by=new Map(state.tasks.map(t=>[t.id,t]));
 const rootOf=t=>{let c=t,n=0;while(c.parentId&&by.has(c.parentId)&&n++<10)c=by.get(c.parentId);return c.id;};
 const uf=new Map();
 const find=x=>{while(uf.get(x)!==x){uf.set(x,uf.get(uf.get(x)));x=uf.get(x);}return x;};
 state.tasks.forEach(t=>{const r=rootOf(t);if(!uf.has(r))uf.set(r,r);});
 state.tasks.forEach(t=>A(t.deps).forEach(d=>{
  const p=by.get(d);
  if(!p||p.projectId!==t.projectId)return;
  const a=find(rootOf(t)),b=find(rootOf(p));
  if(a!==b)uf.set(a,b);
 }));
 const order=new Map();
 let prev=null;
 rows.forEach(r=>{
  const t=by.get(r.querySelector('.bar').dataset.id);
  if(!t)return;
  const k=find(rootOf(t));
  if(!order.has(k))order.set(k,order.size);
  const h=HU[order.get(k)%HU.length];
  r.dataset.bh=h;
  r.style.setProperty('--bh',h);
  r.classList.toggle('bsep',prev!==null&&prev!==k);
  prev=k;
 });
}
function drawLinks(box,bars){
 const old=box.querySelector('svg.mylinks');
 if(old)old.remove();
 const gr=box.getBoundingClientRect();
 if(bars.size<2||!gr.width)return;
 if(getComputedStyle(box).position==='static')box.style.position='relative';
 const by=new Map(state.tasks.map(t=>[t.id,t]));
 const pos=id=>{const r=bars.get(id).getBoundingClientRect();return {l:r.left-gr.left,r:r.right-gr.left,b:r.bottom-gr.top,m:(r.top+r.bottom)/2-gr.top};};
 let solid='',dash='';
 bars.forEach((b,id)=>{
  const t=by.get(id);
  if(!t)return;
  const c=pos(id);
  A(t.deps).forEach(d=>{
   if(!bars.has(d))return;
   const a=pos(d);
   if(a.m===c.m)return;
   if(c.l>=a.r+16){const xm=(a.r+c.l)/2;solid+='M'+a.r+' '+a.m+'H'+xm+'V'+c.m+'H'+(c.l-1);}
   else{const ym=(a.m+c.m)/2;solid+='M'+a.r+' '+a.m+'H'+(a.r+8)+'V'+ym+'H'+(c.l-10)+'V'+c.m+'H'+(c.l-1);}
  });
  if(t.parentId&&bars.has(t.parentId)){
   const p=pos(t.parentId),x=p.l+8;
   dash+='M'+x+' '+p.b+'V'+c.m+'H'+Math.max(x+2,c.l-1);
  }
 });
 if(!solid&&!dash)return;
 box.insertAdjacentHTML('beforeend','<svg class="mylinks" width="'+gr.width+'" height="'+gr.height+'" style="position:absolute;left:0;top:0;pointer-events:none;overflow:visible;z-index:1"><defs><marker id="mlarr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="#5b6dd8"/></marker></defs><path d="'+dash+'" fill="none" stroke="#8f99d9" stroke-width="1.3" stroke-dasharray="4 3"/><path d="'+solid+'" fill="none" stroke="#5b6dd8" stroke-width="1.6" marker-end="url(#mlarr)"/></svg>');
}
function links(){
 const box=document.querySelector('.mygantt .gantt');
 if(!box||typeof state==='undefined'||!state||!state.tasks)return;
 const bars=new Map();
 box.querySelectorAll('.bar[data-id]').forEach(b=>bars.set(b.dataset.id,b));
 drawLinks(box,bars);
}
function anLinks(){
 const g=document.querySelector('.an-g');
 if(!g||typeof state==='undefined'||!state||!state.tasks)return;
 const idx=new Map();
 state.tasks.forEach(t=>idx.set(t.title+'|'+t.start+'|'+t.end,t));
 const bars=new Map();
 g.querySelectorAll('.an-row:not(.proj) .an-b[title]').forEach(b=>{
  const p=String(b.getAttribute('title')).split(' • ');
  if(p.length<2)return;
  const dd=p[1].split(' — ');
  if(dd.length<2)return;
  const t=idx.get(p[0]+'|'+dd[0]+'|'+dd[1]);
  if(t&&!bars.has(t.id))bars.set(t.id,b);
 });
 drawLinks(g,bars);
}
const NL=String.fromCharCode(10);
const stl=document.createElement('style');
stl.textContent='.slf label{display:grid;gap:4px;margin:10px 0}.slf label.check{display:flex;align-items:center;gap:8px}.slf textarea{width:100%;box-sizing:border-box;min-height:96px;resize:vertical;font:inherit;padding:10px;border:1px solid var(--line);border-radius:10px}.slf input:not([type=checkbox]){width:100%;box-sizing:border-box}.libf pre{max-height:300px!important}#lb_load{margin:10px 0}#lb_load h4{margin:0 0 6px;font-size:13px}.lbd{display:flex;gap:3px;align-items:flex-end;overflow-x:auto;padding:4px 0}.lbd>div{flex:none;width:26px;text-align:center;font-size:10px;color:var(--muted);border-radius:6px;padding-top:2px}.lbd>div.in{background:rgba(82,101,223,.14)}.lbd>div.off{opacity:.55}.lbd i{display:block;margin:0 auto 2px;width:16px;border-radius:4px 4px 0 0;background:#5265df}.lbd i.m{background:#c9822b}.lbd i.h{background:#e5484d}.lbd i.z{background:rgba(127,127,127,.3)}.lbspin{perspective:300px;display:flex;justify-content:center;margin:6px 0 10px}.lbspin svg{width:64px;height:58px;animation:lbsp 1.4s linear infinite}.lbspin.stop svg{animation:none}@keyframes lbsp{to{transform:rotateY(360deg)}}.lbfact{margin-top:12px;padding-top:8px;border-top:1px solid var(--line);color:var(--muted);font-size:12px;line-height:1.4}.lbfact b{color:var(--ink)}';
document.head.appendChild(stl);
const tmf=v=>{let h=Math.floor(v+1e-9),m=Math.round((v-h)*60);if(m===60){h++;m=0;}return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');};
function psubBtns(){
 if(typeof state==='undefined'||!state||!state.tasks)return;
 const by=new Map(state.tasks.map(t=>[t.id,t]));
 const ok=id=>{const t=by.get(id);if(!t||!t.assigneeId)return false;const p=t.parentId&&by.get(t.parentId);return !(p&&p.parentId);};
 document.querySelectorAll('.ppage .pfree .pf').forEach(r=>{
  if(r.querySelector('[data-psub]'))return;
  const pl=r.querySelector('[data-pplan]');
  if(!pl||!ok(pl.dataset.pplan))return;
  const b=document.createElement('button');
  b.type='button';b.dataset.psub=pl.dataset.pplan;b.textContent='+ Подзадача';
  r.appendChild(b);
 });
 document.querySelectorAll('.ppage .pday .pb .psh').forEach(sh=>{
  if(sh.querySelector('[data-psub]'))return;
  const pb=sh.closest('.pb');
  if(!pb||!ok(pb.dataset.bid))return;
  const b=document.createElement('button');
  b.type='button';b.dataset.psub=pb.dataset.bid;b.textContent='+подз.';b.title='Добавить подзадачу в этот день';
  sh.appendChild(b);
 });
}
function subForm(par,day){
 let s0=9;
 if(day===today()){const d=new Date(),h=Math.ceil((d.getHours()+d.getMinutes()/60)*4)/4;s0=Math.min(19,Math.max(7,h));}
 if(s0>=13&&s0<14)s0=14;
 showForm('<div class="slf"><h2>Подзадачи в график дня</h2><p class="notice">Задача: '+esc(par.title)+'</p><label>Названия подзадач (по одной в строке)<textarea id="sb_t" rows="4" required></textarea></label><label>День<input id="sb_d" type="date" value="'+day+'" required></label><label>Начать в<input id="sb_s" type="time" step="900" value="'+tmf(s0)+'" required></label><label>Часов на каждую (шаг 0,5)<input id="sb_h" type="number" min="0.5" max="8" step="0.5" value="1" required></label><p class="notice">Подзадачи встанут одна за другой, обед с 13:00 до 14:00 пропускается. Потом их можно перетащить и растянуть.</p></div>',async()=>{
  const lines=document.getElementById('sb_t').value.split(NL).map(x=>x.trim()).filter(Boolean);
  if(!lines.length)throw Error('Укажите название подзадачи');
  const dd=document.getElementById('sb_d').value,hh=Number(document.getElementById('sb_h').value),tv=document.getElementById('sb_s').value.split(':');
  if(!dd)throw Error('Укажите день');
  if(!(hh>=0.5&&hh<=8&&Math.round(hh*2)===hh*2))throw Error('Часов: от 0,5 до 8, шаг 0,5');
  let cur=Number(tv[0])+Number(tv[1]||0)/60;
  for(const title of lines){
   if(cur>=13&&cur<14)cur=14;
   await call('taskCreate',{projectId:par.projectId,parentId:par.id,title:title,note:'Начало: '+tmf(cur),start:dd,end:dd,assigneeId:par.assigneeId,deps:[],lag:0,kind:'sub',calendarEnabled:false,hours:hh});
   cur+=hh;
   if(cur-hh<13&&cur>13)cur+=1;
  }
  await reload();
  render();
 });
}
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('[data-psub]');
 if(!b)return;
 e.stopImmediatePropagation();
 e.preventDefault();
 const par=state.tasks.find(x=>x.id===b.dataset.psub),dy=document.querySelector('.ppage .pday');
 if(par)subForm(par,dy?dy.dataset.day:today());
},true);
const oR=render;
render=function(){
 const r=oR.apply(this,arguments);
 setTimeout(()=>{try{paint();}catch(e){}try{links();}catch(e){}try{anLinks();}catch(e){}try{psubBtns();}catch(e){}},60);
 return r;
};
const cont=document.getElementById('content');
if(cont){
 let tm=0;
 new MutationObserver(ms=>{
  if(ms.every(m=>[...m.addedNodes,...m.removedNodes].every(n=>n.nodeType===1&&n.classList.contains('mylinks'))))return;
  clearTimeout(tm);
  tm=setTimeout(()=>{try{paint();}catch(e){}try{anLinks();}catch(e){}try{psubBtns();}catch(e){}},200);
 }).observe(cont,{childList:true,subtree:true});
 document.addEventListener('toggle',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('mygantt'))setTimeout(()=>{try{links();}catch(x){}},50);},true);
 window.addEventListener('resize',()=>{try{links();}catch(x){}try{anLinks();}catch(x){}});
}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const BL=new Set();
let lbWho='';
const personalOf=uid=>state.projects.find(p=>String(p.name).indexOf('Личное: ')===0&&A(p.members)[0]===uid);
const oT=transport;
transport=async function(req){
 if(!(req&&req.action==='taskCreate'&&req.payload&&document.getElementById('lb_top')))return oT.apply(this,arguments);
 const p=Object.assign({},req.payload),note=String(p.note||''),lines=note.split(NL);
 if(lbWho&&lbWho!==state.me.id){
  const mine=state.projects.find(x=>x.id===p.projectId);
  if(mine&&String(mine.name).indexOf('Личное: ')===0&&A(mine.members)[0]===state.me.id){
   const pp=personalOf(lbWho);
   if(!pp)return {ok:false,error:'У исполнителя нет личного пространства. Выберите объект в поле «Куда добавить».'};
   p.projectId=pp.id;
  }
  p.assigneeId=lbWho;
 }
 const items=lines.filter(l=>l.indexOf('☐ ')===0).map(l=>l.slice(2));
 let isB=false,kids=null;
 if(!p.parentId&&p.kind==='task'&&note.indexOf('Размер и сложность учтены')===0){p.kind='stage';isB=true;}
 else if(p.kind==='sub'&&BL.has(p.parentId)){p.kind='task';kids=items;}
 else if(!p.parentId&&p.kind==='task'&&items.length){kids=items;}
 if(kids&&kids.length)p.note=lines.filter(l=>l.indexOf('☐ ')!==0).join(NL);
 const res=await oT.call(this,Object.assign({},req,{payload:p}));
 try{
  const id=res&&res.ok?res.data:'';
  if(id&&isB)BL.add(id);
  if(id&&kids&&kids.length){
   for(const k of kids){
    await oT.call(this,{action:'taskCreate',payload:{projectId:p.projectId,parentId:id,title:cap(k),note:'',start:p.start,end:p.end,assigneeId:p.assigneeId,deps:[],lag:0,kind:'sub',calendarEnabled:false},token:req.token});
   }
  }
 }catch(e){}
 return res;
};
let FACTS=['Зазор для вентиляции кровельного пирога обычно не менее 40–50 мм.','Закладывайте в график 10–20% времени на согласования и правки.'];
try{
 fetch('busy.js').then(r=>r.text()).then(t=>{
  const m=t.match(/const FACTS=\[([\s\S]*?)\n\];/);
  if(m){const a=(new Function('return ['+m[1]+']'))();if(a&&a.length)FACTS=a;}
 }).catch(()=>{});
}catch(e){}
let factI=Math.floor(Math.random()*50),factAt=0;
function loadPanel(){
 const box=document.getElementById('lb_load'),sel=document.getElementById('lb_who');
 if(!box||!sel)return;
 lbWho=sel.value;
 const st=(document.getElementById('lb_start')||{}).value||today();
 const sm=(document.getElementById('lb_sum')||{}).textContent||'';
 const m=sm.match(/до (\d\d)\.(\d\d)\.(\d{4})/);
 const en=m?m[3]+'-'+m[2]+'-'+m[1]:plus(st,6);
 const n=Math.max(7,Math.min(28,days(st,en)+3));
 const leaf=new Set(state.tasks.map(t=>t.parentId).filter(Boolean));
 const mine=state.tasks.filter(t=>t.assigneeId===lbWho&&t.status!=='Готово'&&!leaf.has(t.id));
 let cells='';
 for(let i=0;i<n;i++){
  const d=plus(st,i),dw=new Date(d+'T00:00:00Z').getUTCDay(),act=mine.filter(t=>t.start<=d&&t.end>=d),hr=act.reduce((s,t)=>s+(Number(t.hours)>0?Number(t.hours):0),0),c=act.length;
  const cls=hr>8||c>=5?'h':(c>=3?'m':(c?'':'z'));
  cells+='<div class="'+(d<=en?'in':'')+(dw===0||dw===6?' off':'')+'" title="'+d+': задач '+c+(hr?', часов '+hr:'')+'"><i class="'+cls+'" style="height:'+(6+Math.min(c,6)*8)+'px"></i>'+d.slice(8)+'</div>';
 }
 const uname=(state.users.find(u=>u.id===lbWho)||{}).name||'';
 const tg=document.getElementById('lb_target');
 const warn=(lbWho!==state.me.id&&tg&&!tg.value&&!personalOf(lbWho))?'<p class="notice">У сотрудника нет личного пространства: выберите объект в поле «Куда добавить».</p>':'';
 box.innerHTML='<h4>Нагрузка: '+esc(uname)+' — открытые задачи по дням. Период ветки выделен.</h4><div class="lbd">'+cells+'</div><small>Высота столбца — число задач в день. Оранжевый — от 3, красный — от 5 или больше 8 часов.</small>'+warn;
}
function libEnhance(){
 const tg=document.getElementById('lb_target');
 if(!tg||document.getElementById('lb_who'))return;
 if(!(typeof admin==='function'&&admin()))return;
 const us=state.users.filter(u=>u.approved==='true'&&u.role!=='observer').sort((a,b)=>String(a.name).localeCompare(String(b.name),'ru'));
 const lab=document.createElement('label');
 lab.innerHTML='Исполнитель (вся ветка придёт ему в «Мои задачи»)<select id="lb_who">'+us.map(u=>'<option value="'+esc(u.id)+'"'+(u.id===state.me.id?' selected':'')+'>'+esc(u.name)+'</option>').join('')+'</select>';
 tg.closest('label').after(lab);
 const pre=document.getElementById('lb_pre');
 if(pre&&!document.getElementById('lb_load')){const ld=document.createElement('div');ld.id='lb_load';pre.after(ld);}
 lbWho=state.me.id;
 setTimeout(loadPanel,30);
}
function runDecor(){
 const top=document.getElementById('lb_top');
 if(!top)return;
 const nbp=top.closest('.nbp');
 if(!nbp||nbp.querySelector('.lbspin'))return;
 const sp=document.createElement('div');
 sp.className='lbspin';
 sp.innerHTML='<svg viewBox="340 95 330 370" aria-hidden="true"><use href="#cubes" stroke="#7b7b7b" stroke-width="4"/><use href="#redcube"/></svg>';
 nbp.insertBefore(sp,nbp.firstChild);
 const ft=document.createElement('div');
 ft.className='lbfact';
 nbp.appendChild(ft);
 factAt=0;
}
setInterval(()=>{
 const ft=document.querySelector('.lbfact'),sp=document.querySelector('.lbspin'),top=document.getElementById('lb_top');
 if(!ft||!top)return;
 const now=Date.now();
 if(now-factAt>7000){factI=(factI+1)%FACTS.length;factAt=now;ft.innerHTML='<b>Знаете ли вы?</b> '+FACTS[factI];}
 if(sp&&/^(Готово|Создание прервано)/.test(top.textContent))sp.classList.add('stop');
},1000);
document.addEventListener('change',e=>{
 const el=e.target;
 if(el&&el.id&&(el.id==='lb_who'||el.id.indexOf('lb_')===0))setTimeout(loadPanel,60);
});
const dlg=document.getElementById('dialog');
if(dlg){
 new MutationObserver(()=>{
  try{libEnhance();}catch(e){}
  try{runDecor();}catch(e){}
  const s=document.getElementById('lb_sum'),t=document.getElementById('lb_target');
  if(!s||!t||t.value)return;
  const re=/задач [0-9]+, подзадач [0-9]+[.]/;
  if(re.test(s.textContent))s.textContent=s.textContent.replace(re,'Группы станут задачами, пункты пояснения — их подзадачами.');
 }).observe(dlg,{childList:true,subtree:true,characterData:true});
}
if(typeof state!=='undefined'&&state)render();
})();
