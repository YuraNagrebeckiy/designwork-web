'use strict';
(function(){
if(typeof window.renderSupply!=='function'||!window.DIO)return;
const D=window.DIO;
let last=[],cur={box:null,pid:''};
const seen=new WeakSet();
const KEY='dw_sd_';
const getLoc=(id,k)=>{try{return localStorage.getItem(KEY+id+'_'+k)||'';}catch(e){return '';}};
const setLoc=(id,k,v)=>{try{if(v)localStorage.setItem(KEY+id+'_'+k,v);else localStorage.removeItem(KEY+id+'_'+k);}catch(e){}};
const st=document.createElement('style');
st.textContent=`.sd-note{margin:8px 0;padding:8px 12px;border-radius:10px;background:rgba(245,158,11,.14);font-size:13px}
.sd-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:2px 0 10px}
.sd-f{display:flex;flex-direction:column;gap:4px;min-width:0}
.sd-f b{font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--muted,#6b7280)}
.sd-f input{width:100%;box-sizing:border-box;min-width:0}
.sd-f input.bad{border-color:#e11d48}
.sd-f small{color:var(--muted,#6b7280);min-height:14px}
@media(max-width:560px){.sd-row{grid-template-columns:1fr}}`;
document.head.appendChild(st);
const of=D.fcall;
D.fcall=function(name){
 const r=of.apply(this,arguments);
 if(name==='supplyGet'&&r&&typeof r.then==='function')r.then(d=>{if(d&&d.items)last=d.items;}).catch(()=>{});
 return r;
};
function rel(v){
 if(!v)return '';
 const a=new Date(v+'T00:00:00'),b=new Date();
 b.setHours(0,0,0,0);
 const n=Math.round((a-b)/864e5);
 if(n===0)return 'сегодня';
 return n>0?'через '+n+' дн.':Math.abs(n)+' дн. назад';
}
function field(it,k,label,val,ed){
 return `<div class='sd-f'><b>${label}</b><input type='date' class='sd_in' data-id='${esc(it.id)}' data-k='${k}' value='${esc(val)}' ${ed?'':'disabled'}><small>${esc(rel(val))}</small></div>`;
}
function decorate(box){
 const sup=last.some(i=>'payDate' in i||'deliveryDate' in i);
 if(last.length&&!sup&&!box.querySelector('.sd-note'))box.insertAdjacentHTML('afterbegin',`<div class='sd-note'>Даты пока сохраняются только на этом устройстве: серверная часть ещё не обновлена.</div>`);
 box.querySelectorAll('.sp-item').forEach((c,i)=>{
  if(c.querySelector('.sd-row'))return;
  const it=last[i],h=c.querySelector('.sp-head');
  if(!it||!h)return;
  const ed=!!c.querySelector('[data-sp=itemDel]');
  const pay=sup?(it.payDate||''):getLoc(it.id,'pay'),del=sup?(it.deliveryDate||''):getLoc(it.id,'del');
  h.insertAdjacentHTML('afterend',`<div class='sd-row'>${field(it,'pay','Дата оплаты',pay,ed)}${field(it,'del','Дата доставки на объект',del,ed)}</div>`);
  mark(c.querySelector('.sd-row'));
 });
}
function mark(row){
 if(!row)return;
 const p=row.querySelector('[data-k=pay]'),d=row.querySelector('[data-k=del]');
 const bad=!!(p.value&&d.value&&d.value<p.value);
 d.classList.toggle('bad',bad);
 d.title=bad?'Доставка раньше оплаты':'';
}
function watch(box){
 if(!seen.has(box)){
  seen.add(box);
  new MutationObserver(()=>decorate(box)).observe(box,{childList:true});
 }
 decorate(box);
}
const orig=window.renderSupply;
window.renderSupply=function(box,pid){
 cur={box:box,pid:pid};
 const r=orig.apply(this,arguments);
 watch(box);
 return r;
};
document.addEventListener('change',e=>{
 const el=e.target;
 if(!el||!el.classList||!el.classList.contains('sd_in'))return;
 const id=el.dataset.id,k=el.dataset.k,v=el.value;
 setLoc(id,k,v);
 const sm=el.parentElement.querySelector('small');
 if(sm)sm.textContent=rel(v);
 mark(el.closest('.sd-row'));
 const p={op:'itemEdit',projectId:cur.pid,id:id};
 p[k==='pay'?'payDate':'deliveryDate']=v;
 Promise.resolve(D.fcall('supplyDo',p,60000)).catch(()=>{});
});
const live=document.querySelector('#content .sp-item');
if(live&&live.parentElement){cur.box=live.parentElement;watch(cur.box);}
})();
