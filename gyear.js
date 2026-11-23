'use strict';
(function(){
if(typeof document==='undefined'||typeof render==='undefined'||typeof state==='undefined')return;
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;};
const DEF=()=>matchMedia('(max-width:760px)').matches?160:230;
const MON=['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
const RH=34;
const kindOfT=t=>(typeof window.kindOf==='function')?window.kindOf(t):(t.kind||(t.parentId?'task':'stage'));
const hol=d=>(window.studioCal&&window.studioCal.kind)?window.studioCal.kind(d):'';
const gy={on:LS('dwGYear')==='1',year:Number(today().slice(0,4))};
let lastKey='';
const st=document.createElement('style');
st.textContent='.gtb{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:6px 0}.gtb button{min-height:30px;padding:2px 12px;font-size:13px}.gtb b{min-width:90px;text-align:center}.gtb .gtn{color:var(--muted);font-size:12px}';
document.head.appendChild(st);
function toolbar(){
 if(gy.on)return '<div class="gtb"><button type="button" data-gy="prev" title="Предыдущий год">◀</button><b>'+gy.year+' год</b><button type="button" data-gy="next" title="Следующий год">▶</button><button type="button" data-gy="today">Сегодня</button><button type="button" data-gy="off">Дни</button><span class="gtn">Только этапы и задачи, подзадачи скрыты</span></div>';
 return '<div class="gtb"><button type="button" data-gy="today" title="Сдвинуть график к полосе сегодняшнего дня">Сегодня</button><button type="button" data-gy="on" title="График на год: только этапы и задачи">Год</button></div>';
}
function links(rows,pos,w){
 const idx=new Map();
 rows.forEach((r,i)=>{const p=pos.get(r.t.id);if(p){p.i=i;idx.set(r.t.id,p);}});
 let paths='';
 idx.forEach(c=>{
  const par=c.t.parentId&&idx.get(c.t.parentId);
  if(!par||par.i>=c.i)return;
  const x1=par.l+3,y1=par.i*RH+27,y2=c.i*RH+17,x2=Math.max(c.l,x1+4);
  paths+='<path d="M '+x1+' '+y1+' V '+y2+' H '+x2+'" fill="none" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="3 2" marker-end="url(#yar2)"/>';
 });
 idx.forEach(b=>{
  arr(b.t.deps).forEach(did=>{
   const a=idx.get(did);
   if(!a)return;
   const stage=a.k==='stage'&&b.k==='stage';
   const x1=a.l+a.w,x2=b.l,y1=a.i*RH+17,y2=b.i*RH+17,xm=x1+3;
   paths+='<path d="M '+x1+' '+y1+' H '+xm+' V '+y2+' H '+Math.max(x2,xm)+'" fill="none" stroke="'+(stage?'#9b6bd3':'var(--muted)')+'" stroke-width="'+(stage?1.8:1.2)+'" marker-end="url(#'+(stage?'yar3':'yar')+')"/>';
  });
 });
 if(!paths)return '';
 return '<svg class="depsvg" width="'+w+'" height="'+(rows.length*RH)+'" aria-hidden="true"><defs>'
  +'<marker id="yar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/></marker>'
  +'<marker id="yar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/></marker>'
  +'<marker id="yar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#9b6bd3"/></marker>'
  +'</defs>'+paths+'</svg>';
}
function yearGantt(root){
 const yr=gy.year,min=yr+'-01-01',max=yr+'-12-31',n=days(min,max)+1,L0=DEF();
 const W=Math.max(600,root.clientWidth||document.getElementById('content').clientWidth||1000);
 const DAY=Math.max(2.4,(W-L0-24)/n),w=n*DAY,td=today();
 const ts=state.tasks.filter(t=>t.projectId===projectId&&t.end>=min&&t.start<=max);
 const rows=tree(ts).filter(r=>kindOfT(r.t)!=='sub');
 let head='';
 for(let m=0;m<12;m++){
  const a=yr+'-'+String(m+1).padStart(2,'0')+'-01',b=m<11?yr+'-'+String(m+2).padStart(2,'0')+'-01':(yr+1)+'-01-01',len=days(a,b);
  head+='<span class="gmon" style="left:'+(days(min,a)*DAY)+'px;width:'+(len*DAY)+'px;text-align:center;border-left:1px solid var(--line)">'+MON[m]+'</span>';
 }
 let layer='',i=0;
 while(i<n){
  const d=plus(min,i),k=hol(d);
  if(!k){i++;continue;}
  let j=i;
  while(j+1<n&&hol(plus(min,j+1))===k)j++;
  layer+='<div class="hl '+k+'" style="left:'+(i*DAY)+'px;width:'+((j-i+1)*DAY)+'px"></div>';
  i=j+1;
 }
 for(let m=1;m<12;m++)layer+='<div class="hl" style="left:'+(days(min,yr+'-'+String(m+1).padStart(2,'0')+'-01')*DAY)+'px;width:1px;background:var(--line)"></div>';
 const pos=new Map();
 const body=rows.map(r=>{
  const t=r.t,k=kindOfT(t),a=t.start<min?min:t.start,b=t.end>max?max:t.end,lf=days(min,a)*DAY,wd=Math.max(4,(days(a,b)+1)*DAY);
  pos.set(t.id,{t:t,k:k,l:lf,w:wd});
  const cls=(t.status==='Готово'?' done':t.status==='Пауза'?' pause':'')+(k==='stage'?' k-stage':'');
  const tt=esc(t.title+' • '+name(t.assigneeId)+' • '+t.start+' — '+t.end);
  return '<div class="grow" style="height:'+RH+'px"><div class="glabel" title="'+tt+'" style="padding:6px 8px 6px '+(10+(k==='stage'?0:14))+'px;'+(k==='stage'?'font-weight:700':'')+'">'+esc(t.title)+'</div><div class="track" style="width:'+w+'px;background:none"><button type="button" class="bar'+cls+'" style="top:5px;left:'+lf+'px;width:'+wd+'px" data-action="taskEdit" data-id="'+esc(t.id)+'" title="'+tt+'"><span class="bt">'+(wd>70?esc(t.title):'')+'</span></button></div></div>';
 }).join('');
 const tl=td>=min&&td<=max?'<div class="todayline" style="left:'+(L0+days(min,td)*DAY)+'px"></div>':'';
 return '<div class="gantt-scroll"><div class="gantt" style="width:'+(L0+w)+'px"><div class="grow ghead"><div class="glabel">Этапы и задачи</div><div class="track" style="width:'+w+'px;background:none">'+head+'</div></div>'+body+'<div class="holl" style="left:'+L0+'px;top:42px;width:'+w+'px">'+layer+'</div>'+links(rows,pos,w)+tl+'</div></div>'+(rows.length?'<p class="notice">Пунктир — этап и его задачи; сплошная линия со стрелкой — зависимость (окончание → старт), фиолетовая — между этапами.</p>':'<p class="notice">В этом году этапов и задач нет.</p>');
}
function center(sc,smooth){
 const tl=sc.querySelector('.todayline'),lab=sc.querySelector('.glabel');
 if(!tl||!lab)return false;
 const x=Math.max(0,parseFloat(tl.style.left)-lab.offsetWidth-(sc.clientWidth-lab.offsetWidth)*0.3);
 if(smooth&&sc.scrollTo)sc.scrollTo({left:x,behavior:'smooth'});else sc.scrollLeft=x;
 return true;
}
function key(){return (view==='projects'&&projectId)?'p:'+projectId+(gy.on?':y'+gy.year:''):'';}
function decorate(pos){
 const root=document.getElementById('ganttRoot');
 if(!root||!state||view!=='projects'||!projectId){lastKey='';return;}
 if(gy.on)root.innerHTML=toolbar()+yearGantt(root);
 else root.insertAdjacentHTML('afterbegin',toolbar());
 const k=key(),same=!!pos&&k===lastKey;
 lastKey=k;
 setTimeout(()=>{
  const sc=root.querySelector('.gantt-scroll');
  if(!sc)return;
  if(same){sc.scrollLeft=pos.l;sc.scrollTop=pos.t;}
  else if(!gy.on)center(sc,false);
 },0);
}
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('[data-gy]');
 if(!b)return;
 const a=b.dataset.gy;
 if(a==='today'){
  if(gy.on){gy.year=Number(today().slice(0,4));render();}
  else{const sc=document.querySelector('#ganttRoot .gantt-scroll');if(sc)center(sc,true);}
  return;
 }
 if(a==='on'){gy.on=true;LS('dwGYear','1');render();return;}
 if(a==='off'){gy.on=false;LS('dwGYear','0');render();return;}
 if(a==='prev'){gy.year--;render();return;}
 if(a==='next'){gy.year++;render();}
});
const oR=render;
render=function(){
 const sc0=document.querySelector('#ganttRoot .gantt-scroll'),pos=sc0?{l:sc0.scrollLeft,t:sc0.scrollTop}:null;
 const r=oR.apply(this,arguments);
 try{decorate(pos);}catch(e){}
 return r;
};
})();
