'use strict';
(function(){
const PAL=['#5265df','#e5484d','#2e9e6b','#c9822b','#9b6bd3','#2b9fc9','#b8527a','#6b7a2e'];
const MON=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;};
const K=d=>window.studioCal?window.studioCal.kind(d):'';
const OKN_HINT='Предварительный проект (45 дн.) → согласование (15 дн.) → разработка (120 дн.). Задания смежным разделам — через 60 дней после старта разработки (75 дн.). Согласование проекта (45 дн.) — за 15 дней до конца выдачи заданий, то есть сразу после разработки.';
const st=document.createElement('style');
st.textContent=`.an-list{display:flex;flex-wrap:wrap;gap:6px 16px;margin:8px 0 12px}.an-p i{display:inline-block;width:12px;height:12px;border-radius:3px}.an-p small{color:var(--muted)}
.an-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:var(--panel)}.an-g{position:relative}
.an-row{display:flex;height:26px;border-bottom:1px solid var(--line)}.an-row.an-head{height:34px}.an-row.proj{background:var(--bg)}
.an-l{width:var(--lw);flex:none;position:sticky;left:0;z-index:2;background-color:var(--panel);padding:0 8px;line-height:26px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13px;border-right:1px solid var(--line)}
.an-row.proj .an-l{font-weight:700;background-color:var(--bg)}.an-head .an-l{line-height:34px}
.an-t{position:relative;flex:none}
.an-b{position:absolute;top:5px;height:16px;border-radius:4px;color:#fff;font-size:11px;line-height:16px;padding:0 4px;overflow:hidden;white-space:nowrap}.an-b.done{opacity:.45}.an-row.proj .an-b{top:8px;height:10px;padding:0}
.an-b.vb{border:1px dashed #2e9e6b;background:repeating-linear-gradient(45deg,rgba(46,158,107,.35) 0 6px,rgba(46,158,107,.15) 6px 12px)!important;color:var(--ink)}
.an-w{color:var(--muted);font-size:11px;margin-left:6px}
.an-hl{position:absolute;top:34px;bottom:0;pointer-events:none;z-index:1}.an-hl.w{background:rgba(120,130,150,.14)}.an-hl.h{background:rgba(229,72,77,.16)}
.an-m{position:absolute;top:0;height:16px;border-left:1px solid var(--line);font-size:11px;padding-left:3px;color:var(--muted);white-space:nowrap}.an-d{position:absolute;top:18px;font-size:10px;color:var(--muted);width:20px;text-align:center}
.an-today{position:absolute;top:0;bottom:0;width:2px;background:#e5484d;z-index:2;pointer-events:none}
#pf_prev{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;margin-top:6px}
.an-seg{display:inline-flex;gap:6px}.an-seg button.on{background:var(--accent);color:#fff;border-color:var(--accent)}
.an-box{margin:6px 0}.an-box>b{margin-right:8px}.an-box button{min-height:28px!important;padding:2px 10px!important;font-size:12px!important;margin-right:6px}`;
document.head.appendChild(st);
const jget=(k,d)=>{try{const v=JSON.parse(LS(k));return v==null?d:v;}catch(e){return d;}};
const S={
 group:()=>LS('studioAnGroup')==='team'?'team':'proj',
 offP:()=>new Set(jget('studioAnOff',[])),
 offU:()=>new Set(jget('studioAnOffU',[])),
 depth:g=>{const v=LS('studioAnD_'+g);return v===null?(g==='team'?1:0):Number(v);},
 tasks:()=>LS('studioAnTasks')!=='off',
 vac:()=>LS('studioAnVac')!=='off'
};
function abbr(nm){
 const w=String(nm||'').trim().split(' ').filter(Boolean);
 if(!w.length||nm==='Не назначен')return '';
 return w.length>1?(w[0][0]+w[1][0]).toUpperCase():w[0];
}
const short=s=>s.length>14?s.slice(0,13)+'…':s;
function pctOf(pid){
 if(state.progress&&state.progress[pid]!==undefined)return state.progress[pid];
 const ts=state.tasks.filter(t=>t.projectId===pid),par=new Set(ts.map(t=>t.parentId).filter(Boolean));
 let tot=0,d=0;ts.forEach(t=>{if(par.has(t.id))return;const w=Math.max(1,days(t.start,t.end)+1);tot+=w;if(t.status==='Готово')d+=w;});
 return tot?Math.round(d*100/tot):0;
}
function pctP(pid){try{if(window.secStats)return window.secStats(pid).all;}catch(e){}return pctOf(pid);}
const lv=t=>{const k=window.kindOf?window.kindOf(t):(t.parentId?'task':'stage');return k==='stage'?0:k==='task'?1:2;};
const staff=()=>state.users.filter(u=>u.approved==='true'&&u.role!=='observer').sort((a,b)=>String(a.name).localeCompare(String(b.name),'ru'));
const allU=()=>staff().map(u=>u.id).concat(['__none']);
const uname=id=>id==='__none'?'Без исполнителя':name(id);
function collect(o){
 const grp=o.content==='vac'?'team':o.group,P=new Set(o.pids),U=new Set(o.uids),withT=o.content!=='vac',withV=o.content!=='tasks',groups=[],byU=new Map();
 const inR=(s,e)=>(!o.from||e>=o.from)&&(!o.to||s<=o.to);
 const pass=t=>P.has(t.projectId)&&U.has(t.assigneeId||'__none')&&lv(t)<=o.depth&&inR(t.start,t.end);
 const pidx=id=>Math.max(0,state.projects.findIndex(p=>p.id===id));
 const bucket=u=>{if(!byU.has(u))byU.set(u,{t:[],v:[]});return byU.get(u);};
 let lo='',hi='';
 const note=(s,e)=>{if(!lo||s<lo)lo=s;if(!hi||e>hi)hi=e;};
 if(withT){
  if(grp==='proj'){
   o.pids.forEach(pid=>{
    const p=state.projects.find(x=>x.id===pid);if(!p)return;
    const all=state.tasks.filter(t=>t.projectId===pid);if(!all.length)return;
    const items=tree(all.filter(pass));if(!items.length)return;
    const s=all.reduce((a,t)=>t.start<a?t.start:a,all[0].start),e=all.reduce((a,t)=>t.end>a?t.end:a,all[0].end),color=PAL[pidx(pid)%PAL.length];
    note(s,e);
    const rows=[{k:'p',label:p.name,start:s,end:e,color:color,pct:pctP(pid)}];
    items.forEach(x=>rows.push({k:'t',label:x.t.title,who:name(x.t.assigneeId),start:x.t.start,end:x.t.end,color:color,done:x.t.status==='Готово',d:x.d}));
    groups.push({id:'p:'+pid,name:p.name,rows:rows});
   });
  }else{
   state.tasks.filter(pass).sort((a,b)=>a.start.localeCompare(b.start)).forEach(t=>{
    note(t.start,t.end);
    const pn=projectName(t.projectId);
    bucket(t.assigneeId||'__none').t.push({k:'t',label:t.title,who:pn,tag:short(pn),start:t.start,end:t.end,color:PAL[pidx(t.projectId)%PAL.length],done:t.status==='Готово',d:lv(t)>=2?1:0});
   });
  }
 }
 if(withV&&state.vacations){
  const L=o.from||(withT?lo:''),H=o.to||(withT?hi:'');
  const vl=(u,full)=>(state.vacations[u]||[]).filter(v=>(!L||v.to>=L)&&(!H||v.from<=H)).map(v=>({k:'v',label:full?'Отпуск — '+uname(u):'Отпуск',who:uname(u),start:L&&v.from<L?L:v.from,end:H&&v.to>H?H:v.to,color:'#2e9e6b',d:0}));
  if(grp==='team')o.uids.forEach(u=>{if(u!=='__none')vl(u,false).forEach(r=>bucket(u).v.push(r));});
  else{
   const vr=[];
   o.uids.forEach(u=>{if(u!=='__none')vl(u,true).forEach(r=>vr.push(r));});
   if(vr.length){
    vr.sort((a,b)=>a.start.localeCompare(b.start));
    groups.push({id:'vac',name:'Отпуска сотрудников',rows:[{k:'g',label:'Отпуска сотрудников',start:vr[0].start,end:vr.reduce((a,r)=>r.end>a?r.end:a,vr[0].end)}].concat(vr)});
   }
  }
 }
 if(grp==='team')o.uids.forEach(u=>{
  const b=byU.get(u);if(!b)return;
  const rows=b.t.concat(b.v);if(!rows.length)return;
  const s=rows.reduce((a,r)=>r.start<a?r.start:a,rows[0].start),e=rows.reduce((a,r)=>r.end>a?r.end:a,rows[0].end);
  groups.push({id:'u:'+u,name:uname(u),rows:[{k:'g',label:uname(u)+(b.t.length?' • задач: '+b.t.length:''),start:s,end:e}].concat(rows)});
 });
 return groups;
}
function curOpts(){
 const g=S.group(),oP=S.offP(),oU=S.offU(),t=S.tasks(),v=S.vac();
 return {group:g,pids:state.projects.filter(p=>!oP.has(p.id)).map(p=>p.id),uids:allU().filter(u=>!oU.has(u)),depth:S.depth(g),content:t&&v?'all':t?'tasks':v?'vac':'none',from:'',to:''};
}
function renderAn(){
 const g=S.group(),oP=S.offP(),oU=S.offU(),d=S.depth(g);
 const pc=state.projects.map((p,i)=>`<label class='chk2 an-p'><input type='checkbox' data-anp='${esc(p.id)}' ${oP.has(p.id)?'':'checked'}><i style='background:${PAL[i%PAL.length]}'></i>${esc(p.name)} <small>${pctP(p.id)}%</small></label>`).join('')||'<p class="empty">Нет объектов</p>';
 const uc=allU().map(u=>`<label class='chk2 an-p'><input type='checkbox' data-anu='${esc(u)}' ${oU.has(u)?'':'checked'}>${esc(uname(u))}</label>`).join('');
 $('content').innerHTML=`<div class='toolbar'><h2 style='margin:0'>Аналитика</h2><span class='an-seg'><button type='button' data-an='g:proj' class='${g==='proj'?'on':''}'>Объекты</button><button type='button' data-an='g:team' class='${g==='team'?'on':''}'>Команда</button></span><select id='anDepth' aria-label='Детализация'>${[['0','Этапы работ'],['1','Этапы и задачи'],['2','Все уровни']].map(x=>`<option value='${x[0]}' ${Number(x[0])===d?'selected':''}>${x[1]}</option>`).join('')}</select><label class='chk2'><input type='checkbox' id='anTasks' ${S.tasks()?'checked':''}> Задачи</label><label class='chk2'><input type='checkbox' id='anVac' ${S.vac()?'checked':''}> Отпуска</label><button class='primary' type='button' data-an='pdf'>Сохранить в PDF</button></div><div class='an-box'><b>Объекты</b><button type='button' data-an='pall'>Все</button><button type='button' data-an='pnone'>Никто</button><div class='an-list'>${pc}</div></div><div class='an-box'><b>Сотрудники</b><button type='button' data-an='uall'>Все</button><button type='button' data-an='unone'>Никто</button><div class='an-list'>${uc}</div></div><div id='anG'></div>`;
 drawAn();
}
function drawAn(){
 const box=$('anG');
 if(!box)return;
 const o=curOpts();
 if(o.content==='none'){box.innerHTML='<p class="empty">Включите «Задачи» или «Отпуска»</p>';return;}
 const rows=[].concat(...collect(o).map(g=>g.rows));
 if(!rows.length){box.innerHTML='<p class="empty">Ничего не найдено. Проверьте галочки объектов и сотрудников</p>';return;}
 const min=plus(rows.reduce((a,r)=>r.start<a?r.start:a,rows[0].start),-2),max=plus(rows.reduce((a,r)=>r.end>a?r.end:a,rows[0].end),3);
 const n=days(min,max)+1,DW=n>260?7:n>120?14:24,lw=matchMedia('(max-width:760px)').matches?130:200,w=n*DW;
 let months='',ticks='',hl='';
 for(let i=0;i<n;i++){
  const d=plus(min,i);
  if(i===0||d.slice(8)==='01')months+=`<span class="an-m" style="left:${i*DW}px">${MON[+d.slice(5,7)-1]} ${d.slice(0,4)}</span>`;
  if(DW>=14)ticks+=`<span class="an-d" style="left:${i*DW+(DW-20)/2}px">${d.slice(8)}</span>`;
  else if(new Date(d+'T00:00:00Z').getUTCDay()===1)ticks+=`<span class="an-d" style="left:${i*DW-6}px">${d.slice(8)}</span>`;
 }
 for(let i=0;i<n;){
  const k=K(plus(min,i));
  if(!k){i++;continue;}
  let j=i;
  while(j+1<n&&K(plus(min,j+1))===k)j++;
  hl+=`<div class="an-hl ${k}" style="left:${lw+i*DW}px;width:${(j-i+1)*DW}px"></div>`;
  i=j+1;
 }
 const body=rows.map(r=>{
  const x=days(min,r.start)*DW,wd=(days(r.start,r.end)+1)*DW;
  if(r.k==='g')return `<div class="an-row proj"><div class="an-l" title="${esc(r.label)}">${esc(r.label)}</div><div class="an-t" style="width:${w}px"></div></div>`;
  if(r.k==='v')return `<div class="an-row"><div class="an-l" style="padding-left:20px" title="${esc(r.label)}">${esc(r.label)}</div><div class="an-t" style="width:${w}px"><div class="an-b vb" style="left:${x}px;width:${wd}px" title="${esc(r.label+' • '+r.start+' — '+r.end)}">${esc(r.label)}</div></div></div>`;
  if(r.k==='p')return `<div class="an-row proj"><div class="an-l" title="${esc(r.label)}">${esc(r.label)} <small>${r.pct}%</small></div><div class="an-t" style="width:${w}px"><div class="an-b" style="left:${x}px;width:${wd}px;background:${r.color};opacity:.5"></div><div class="an-b" style="left:${x}px;width:${wd*r.pct/100}px;background:${r.color}" title="Готовность ${r.pct}%"></div></div></div>`;
  const tg=r.tag!==undefined?r.tag:abbr(r.who);
  return `<div class="an-row"><div class="an-l" style="padding-left:${8+r.d*12}px" title="${esc(r.label+(r.who?' • '+r.who:''))}">${esc(r.label)}${tg?`<span class="an-w">${esc(tg)}</span>`:''}</div><div class="an-t" style="width:${w}px"><div class="an-b${r.done?' done':''}" style="left:${x}px;width:${wd}px;background:${r.color}" title="${esc(r.label+' • '+r.start+' — '+r.end+' • '+r.who)}">${esc(r.label)}</div></div></div>`;
 }).join('');
 const td=today(),tl=td>=min&&td<=max?`<div class="an-today" style="left:${lw+days(min,td)*DW+DW/2}px"></div>`:'';
 box.innerHTML=`<div class="an-wrap"><div class="an-g" style="--lw:${lw}px;width:${lw+w}px"><div class="an-row an-head"><div class="an-l">${S.group()==='team'?'Сотрудник / задача':'Объект / этап'}</div><div class="an-t" style="width:${w}px">${months}${ticks}</div></div>${body}${hl}${tl}</div></div>`;
}
function fit(g,s,w){
 if(g.measureText(s).width<=w)return s;
 while(s.length>1&&g.measureText(s+'…').width>w)s=s.slice(0,-1);
 return s+'…';
}
function drawPages(rows,from,to,title,only,scale,whoMode){
 const PW=842,PH=595,S2=scale||2.4,M=24,LW=190,TT=20,HH=28,RH2=15,wm=whoMode||'initials';
 const n=days(from,to)+1,cw=PW-2*M-LW,dw=cw/n,per=Math.floor((PH-2*M-TT-HH)/RH2),np=Math.max(1,Math.ceil(rows.length/per)),td=today(),out=[],x0=M+LW,top=M+TT,lim=only?Math.min(np,only):np;
 for(let pg=0;pg<lim;pg++){
  const cv=document.createElement('canvas');cv.width=Math.round(PW*S2);cv.height=Math.round(PH*S2);
  const g=cv.getContext('2d');g.scale(S2,S2);
  g.fillStyle='#fff';g.fillRect(0,0,PW,PH);
  g.textBaseline='middle';g.textAlign='left';
  g.fillStyle='#111';g.font='bold 10px Arial';g.fillText(fit(g,title,PW-2*M-70),M,M+6);
  g.font='8px Arial';g.fillStyle='#666';g.textAlign='right';g.fillText('стр. '+(pg+1)+' / '+np,PW-M,M+6);g.textAlign='left';
  const part=rows.slice(pg*per,(pg+1)*per),bottom=top+HH+part.length*RH2;
  for(let i=0;i<n;){
   const k=K(plus(from,i));
   if(!k){i++;continue;}
   let j=i;
   while(j+1<n&&K(plus(from,j+1))===k)j++;
   g.fillStyle=k==='h'?'rgba(229,72,77,.15)':'rgba(120,130,150,.15)';
   g.fillRect(x0+i*dw,top+HH,(j-i+1)*dw,part.length*RH2);
   i=j+1;
  }
  g.lineWidth=.5;
  for(let i=0;i<n;i++){
   const d=plus(from,i),x=x0+i*dw,mon=new Date(d+'T00:00:00Z').getUTCDay()===1;
   if(i===0||d.slice(8)==='01'){
    g.strokeStyle='#999';g.beginPath();g.moveTo(x,top);g.lineTo(x,bottom);g.stroke();
    g.fillStyle='#333';g.font='bold 7px Arial';g.fillText(fit(g,MON[+d.slice(5,7)-1]+' '+d.slice(0,4),Math.max(20,cw-(x-x0))),x+2,top+6);
   }else if(dw>=2.5&&mon){
    g.strokeStyle='#e4e4e4';g.beginPath();g.moveTo(x,top+12);g.lineTo(x,bottom);g.stroke();
   }
   g.fillStyle=K(d)?'#c0392b':'#666';g.font='6px Arial';
   if(dw>=11){g.textAlign='center';g.fillText(d.slice(8),x+dw/2,top+HH-8);g.textAlign='left';}
   else if(dw>=2.5&&mon)g.fillText(d.slice(8),x+1,top+HH-8);
  }
  g.strokeStyle='#999';g.beginPath();g.moveTo(M,top+HH);g.lineTo(M+LW+cw,top+HH);g.stroke();
  part.forEach((r,k)=>{
   const y=top+HH+k*RH2;
   if(r.k==='p'||r.k==='g'){g.fillStyle='#f1f2f6';g.fillRect(M,y,LW,RH2);g.fillRect(x0,y,cw,RH2);}
   g.strokeStyle='#e4e4e4';g.beginPath();g.moveTo(M,y+RH2);g.lineTo(M+LW+cw,y+RH2);g.stroke();
   const indent=(r.k==='t')?r.d*6:(r.k==='v'?8:0);
   let tg='',tw=0;
   if(r.k==='t'&&r.who&&wm!=='none'){
    tg=wm==='name'?r.who:(r.tag!==undefined?r.tag:abbr(r.who));
    if(tg.length>16)tg=tg.slice(0,15)+'…';
    if(tg){g.font='bold 6.5px Arial';tw=g.measureText(tg).width;g.fillStyle='#666';g.textAlign='right';g.fillText(tg,M+LW-4,y+RH2/2);g.textAlign='left';}
   }
   g.fillStyle='#111';g.font=((r.k==='p'||r.k==='g')?'bold 8':'7.5')+'px Arial';
   const txt=r.k==='p'?r.label+' — '+r.pct+'%':r.label;
   g.fillText(fit(g,txt,LW-8-indent-(tw?tw+6:0)),M+2+indent,y+RH2/2);
   if(r.k==='g')return;
   const sx=Math.max(0,days(from,r.start)),ex=Math.min(n-1,days(from,r.end));
   if(ex<sx)return;
   const bx=x0+sx*dw,bw=Math.max(1.5,(ex-sx+1)*dw);
   if(r.k==='p'){
    g.globalAlpha=.45;g.fillStyle=r.color;g.fillRect(bx,y+5,bw,5);g.globalAlpha=1;g.fillRect(bx,y+5,bw*r.pct/100,5);
   }else if(r.k==='v'){
    g.globalAlpha=.45;g.fillStyle='#2e9e6b';g.fillRect(bx,y+3,bw,RH2-6);g.globalAlpha=1;
    g.strokeStyle='#2e9e6b';g.lineWidth=.6;g.strokeRect(bx,y+3,bw,RH2-6);g.lineWidth=.5;
    if(bw>40){g.fillStyle='#143';g.font='6.5px Arial';g.fillText(fit(g,r.label,bw-4),bx+2,y+RH2/2);}
   }else{
    g.globalAlpha=r.done?.4:.92;g.fillStyle=r.color;g.fillRect(bx,y+3,bw,RH2-6);g.globalAlpha=1;
    if(bw>34){g.fillStyle='#fff';g.font='6.5px Arial';g.fillText(fit(g,r.label,bw-4),bx+2,y+RH2/2);}
   }
  });
  if(td>=from&&td<=to){
   const x=x0+days(from,td)*dw+dw/2;
   g.strokeStyle='#e5484d';g.lineWidth=1;g.beginPath();g.moveTo(x,top+HH);g.lineTo(x,bottom);g.stroke();
  }
  out.push(cv.toDataURL('image/jpeg',0.92));
  cv.width=1;cv.height=1;
 }
 return {pages:out,total:np,PW:PW,PH:PH,W:Math.round(PW*S2),H:Math.round(PH*S2)};
}
function pdfBlob(res){
 const enc=new TextEncoder(),chunks=[],offs=[];let len=0;
 const add=b=>{const u=typeof b==='string'?enc.encode(b):b;chunks.push(u);len+=u.length;};
 const N=res.pages.length;
 add('%PDF-1.4\n');
 const obj=(id,body)=>{offs[id]=len;add(id+' 0 obj\n');body();add('\nendobj\n');};
 obj(1,()=>add('<< /Type /Catalog /Pages 2 0 R >>'));
 obj(2,()=>add('<< /Type /Pages /Count '+N+' /Kids ['+res.pages.map((_,i)=>(3+3*i)+' 0 R').join(' ')+'] >>'));
 res.pages.forEach((url,i)=>{
  const bin=atob(url.split(',')[1]),data=new Uint8Array(bin.length);
  for(let j=0;j<bin.length;j++)data[j]=bin.charCodeAt(j);
  const pid=3+3*i,cid=pid+1,iid=pid+2,cs='q '+res.PW+' 0 0 '+res.PH+' 0 0 cm /Im0 Do Q';
  obj(pid,()=>add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+res.PW+' '+res.PH+'] /Resources << /XObject << /Im0 '+iid+' 0 R >> >> /Contents '+cid+' 0 R >>'));
  obj(cid,()=>add('<< /Length '+cs.length+' >>\nstream\n'+cs+'\nendstream'));
  obj(iid,()=>{add('<< /Type /XObject /Subtype /Image /Width '+res.W+' /Height '+res.H+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+data.length+' >>\nstream\n');add(data);add('\nendstream');});
 });
 const xr=len,total=3+3*N;
 add('xref\n0 '+total+'\n0000000000 65535 f \n');
 for(let id=1;id<total;id++)add(String(offs[id]).padStart(10,'0')+' 00000 n \n');
 add('trailer\n<< /Size '+total+' /Root 1 0 R >>\nstartxref\n'+xr+'\n%%EOF\n');
 return new Blob(chunks,{type:'application/pdf'});
}
function download(blob,nm){
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=nm;document.body.appendChild(a);a.click();
 setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},5000);
}
const ruD=d=>d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const spanOf=rows=>({lo:rows.reduce((a,r)=>!a||r.start<a?r.start:a,''),hi:rows.reduce((a,r)=>!a||r.end>a?r.end:a,'')});
function nameList(gs){
 const a=gs.map(g=>g.name).filter(x=>x!=='Отпуска сотрудников');
 if(!a.length)return 'Отпуска сотрудников';
 return a.length>3?a.slice(0,3).join(', ')+' и ещё '+(a.length-3):a.join(', ');
}
function titleFor(o,nm,from,to){
 const pre=o.content==='vac'?'Отпуска: ':(o.group==='team'?'Задачи: ':'Ганг: ');
 return pre+nm+' • '+ruD(from)+' – '+ruD(to);
}
function fname(nm,multi){
 let s=multi?nm:'';
 '/:*?"<>|'.split('').forEach(c=>{s=s.split(c).join('');});
 s=s.split(String.fromCharCode(92)).join('');
 return 'gantt-'+(s?s.slice(0,40)+'-':'')+today()+'.pdf';
}
function pdfForm(init){
 const o0=Object.assign({pids:state.projects.map(p=>p.id),uids:allU(),group:S.group(),content:'all',depth:S.depth(S.group())},init||{});
 if(o0.content==='none')o0.content='all';
 const chosen=nm=>[...document.querySelectorAll('#editform input[name='+nm+']:checked')].map(i=>i.value);
 const chk=(nm,list,sel)=>list.map(x=>`<label class='check'><input type='checkbox' name='${nm}' value='${esc(x[0])}' ${sel.indexOf(x[0])>=0?'checked':''}><span>${esc(x[1])}</span></label>`).join('');
 const projs=state.projects.map(p=>[p.id,p.name]),emps=allU().map(u=>[u,uname(u)]);
 const read=()=>({group:$('pf_group').value,content:$('pf_content').value,depth:Number($('pf_depth').value),pids:chosen('pf_p'),uids:chosen('pf_u')});
 const makeJobs=()=>{
  const o=read(),all=$('pf_mode').value==='all',range=all?{from:'',to:''}:{from:$('pf_from').value,to:$('pf_to').value};
  if(!all&&(!range.from||!range.to||range.to<range.from))return {err:'Проверьте даты'};
  if(o.content!=='vac'&&!o.pids.length)return {err:'Выберите хотя бы один объект'};
  if(!o.uids.length)return {err:'Выберите хотя бы одного сотрудника'};
  const groups=collect(Object.assign({},o,range));
  if(!groups.length)return {err:'В этом периоде ничего нет'};
  const oo=Object.assign({},o,{group:o.content==='vac'?'team':o.group});
  const mk=(gs,nm)=>{const rows=[].concat(...gs.map(g=>g.rows)),sp=spanOf(rows),from=range.from||sp.lo,to=range.to||sp.hi;return {rows:rows,from:from,to:to,name:nm,title:titleFor(oo,nm,from,to)};};
  const split=$('pf_split').value==='split'&&groups.length>1;
  const jobs=split?groups.map(g=>mk([g],g.name)):[mk(groups,nameList(groups))];
  return {jobs:jobs,span:spanOf([].concat(...groups.map(g=>g.rows)))};
 };
 let timer=0;
 const prev=()=>{
  const img=$('pf_prev'),info=$('pf_info');if(!img||!info)return;
  const team=$('pf_group').value==='team'||$('pf_content').value==='vac';
  $('pf_split').options[1].textContent=team?'Отдельный файл на каждого сотрудника':'Отдельный файл на каждый объект';
  const all=$('pf_mode').value==='all';
  $('pf_from').disabled=all;$('pf_to').disabled=all;
  const m=makeJobs();
  if(m.err){info.textContent=m.err;img.removeAttribute('src');return;}
  if(all){$('pf_from').value=m.span.lo;$('pf_to').value=m.span.hi;}
  const j=m.jobs[0],res=drawPages(j.rows,j.from,j.to,j.title,1,1.3,$('pf_who').value);
  img.src=res.pages[0];
  info.textContent='Файлов: '+m.jobs.length+'. Показана первая страница первого файла; страниц в нём: '+res.total+'. Строк: '+j.rows.length+'.';
 };
 const later=()=>{clearTimeout(timer);timer=setTimeout(prev,250);};
 showForm(`<h2>PDF: Ганг, задачи, отпуска</h2><div id='pf_wrap'><label>Группировать<select id='pf_group'><option value='proj'>По объектам</option><option value='team'>По сотрудникам</option></select></label><label>Что включить<select id='pf_content'><option value='all'>Задачи и отпуска</option><option value='tasks'>Только задачи</option><option value='vac'>Только отпуска</option></select></label><label>Детализация<select id='pf_depth'><option value='0'>Этапы работ</option><option value='1'>Этапы и задачи</option><option value='2'>Все уровни, с подзадачами</option></select></label><h3>Объекты <button type='button' data-pfs='p1'>Все</button> <button type='button' data-pfs='p0'>Никто</button></h3><div class='pick'>${chk('pf_p',projs,o0.pids)||'<small>Нет объектов</small>'}</div><h3>Сотрудники <button type='button' data-pfs='u1'>Все</button> <button type='button' data-pfs='u0'>Никто</button></h3><div class='pick'>${chk('pf_u',emps,o0.uids)}</div><label>Период<select id='pf_mode'><option value='all'>Всё сразу</option><option value='range'>Выбрать даты</option></select></label><div class='formgrid'>${input('С','pf_from','','date')}${input('По','pf_to','','date')}</div><label>Исполнитель или объект рядом с задачей<select id='pf_who'><option value='initials'>Коротко</option><option value='name'>Полностью</option><option value='none'>Не указывать</option></select></label><label>Файлы<select id='pf_split'><option value='one'>Один общий файл</option><option value='split'>Отдельный файл на каждый объект</option></select></label></div><p class='notice' id='pf_info'></p><img id='pf_prev' alt='Предпросмотр первой страницы'>`,async()=>{
  const m=makeJobs();if(m.err)throw Error(m.err);
  await sleep(30);
  for(let i=0;i<m.jobs.length;i++){
   const j=m.jobs[i];
   download(pdfBlob(drawPages(j.rows,j.from,j.to,j.title,0,0,$('pf_who').value)),fname(j.name,m.jobs.length>1));
   if(i<m.jobs.length-1)await sleep(700);
  }
  $('dialog').close();
  toast(m.jobs.length>1?'Сохранено файлов: '+m.jobs.length:'PDF сохранён');
 });
 $('pf_group').value=o0.group;$('pf_content').value=o0.content;$('pf_depth').value=String(o0.depth);
 document.querySelectorAll('#pf_wrap select,#pf_wrap input').forEach(el=>{el.onchange=later;el.oninput=later;});
 $('pf_wrap').onclick=e=>{
  const b=e.target.closest('[data-pfs]');if(!b)return;
  const k=b.dataset.pfs,nm=k[0]==='p'?'pf_p':'pf_u';
  document.querySelectorAll('#editform input[name='+nm+']').forEach(i=>{i.checked=k[1]==='1';});
  later();
 };
 prev();
}
function addNav(){
 const nav=$('nav');if(!nav||!state||nav.querySelector('[data-view="analytics"]'))return;
 const b=document.createElement('button');b.dataset.view='analytics';b.textContent='Аналитика';if(view==='analytics')b.className='active';nav.appendChild(b);
}
function addPdfBtn(){
 if(view!=='projects'||!projectId)return;
 const tb=document.querySelector('#content .toolbar');if(!tb||tb.querySelector('[data-an="pdfp"]'))return;
 const b=document.createElement('button');b.type='button';b.dataset.an='pdfp';b.textContent='Ганг в PDF';tb.appendChild(b);
}
const oRender=render;
render=function(){
 const sc=document.querySelector('.an-wrap'),sl=sc?sc.scrollLeft:0;
 const r=oRender.apply(this,arguments);
 try{
  addNav();
  if(view==='analytics'){renderAn();const w=document.querySelector('.an-wrap');if(w)w.scrollLeft=sl;}
  else addPdfBtn();
 }catch(e){}
 return r;
};
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('[data-an]');if(!b)return;
 const a=b.dataset.an;
 if(a.indexOf('g:')===0){LS('studioAnGroup',a.slice(2));renderAn();}
 else if(a==='pall'||a==='pnone'){LS('studioAnOff',JSON.stringify(a==='pall'?[]:state.projects.map(p=>p.id)));renderAn();}
 else if(a==='uall'||a==='unone'){LS('studioAnOffU',JSON.stringify(a==='uall'?[]:allU()));renderAn();}
 else if(a==='pdf'){pdfForm(curOpts());}
 else if(a==='pdfp'){pdfForm({pids:[projectId],uids:allU(),group:'proj',content:'tasks',depth:1});}
});
document.addEventListener('change',e=>{
 const el=e.target,d=el.dataset||{};
 if(d.anp){const o=S.offP();if(el.checked)o.delete(d.anp);else o.add(d.anp);LS('studioAnOff',JSON.stringify([...o]));drawAn();}
 else if(d.anu){const o=S.offU();if(el.checked)o.delete(d.anu);else o.add(d.anu);LS('studioAnOffU',JSON.stringify([...o]));drawAn();}
 else if(el.id==='anDepth'){LS('studioAnD_'+S.group(),el.value);drawAn();}
 else if(el.id==='anTasks'){LS('studioAnTasks',el.checked?'on':'off');drawAn();}
 else if(el.id==='anVac'){LS('studioAnVac',el.checked?'on':'off');drawAn();}
});
const oPF=projectForm;
projectForm=function(p){
 oPF.apply(this,arguments);
 const sel=$('p_type');
 if(p||!sel||sel.querySelector('option[value="okn"]'))return;
 const o=document.createElement('option');o.value='okn';o.textContent='ОКН (объект культурного наследия)';
 const pub=sel.querySelector('option[value="public"]');
 if(pub)pub.after(o);else sel.appendChild(o);
 const prev=sel.onchange;
 sel.onchange=()=>{if(prev)prev();if(sel.value==='okn')$('p_hint').textContent=OKN_HINT;};
};
document.addEventListener('keydown',e=>{
 if(e.key!=='Escape')return;
 const x=document.querySelector('#gpanel:not(.hidden) [data-g="x"]');if(x)x.click();
 const dl=$('dialog');if(dl&&dl.open)dl.close();
 const cb=$('chatbox');if(cb&&!cb.classList.contains('hidden')){const c=$('chClose');if(c)c.click();}
});
let downDialog=false;
document.addEventListener('pointerdown',e=>{
 downDialog=e.target===$('dialog');
 const pn=$('gpanel');
 if(pn&&!pn.classList.contains('hidden')&&!e.target.closest('#gpanel')&&!e.target.closest('.bar')&&!e.target.closest('dialog')){
  const x=pn.querySelector('[data-g="x"]');if(x)x.click();
 }
},true);
document.addEventListener('click',e=>{
 const dl=$('dialog');
 if(downDialog&&e.target===dl&&dl.open)dl.close();
 downDialog=false;
});
if(state)render();
})();
