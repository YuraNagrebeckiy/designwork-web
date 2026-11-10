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
#pf_prev{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;margin-top:6px}`;
document.head.appendChild(st);
const off=()=>{try{return new Set(JSON.parse(LS('studioAnOff')||'[]'));}catch(e){return new Set();}};
const setOff=s=>LS('studioAnOff',JSON.stringify([...s]));
const showKids=()=>LS('studioAnKids')==='on';
const showVac=()=>LS('studioAnVac')!=='off';
function abbr(nm){
 const w=String(nm||'').trim().split(' ').filter(Boolean);
 if(!w.length||nm==='Не назначен')return '';
 return w.length>1?(w[0][0]+w[1][0]).toUpperCase():w[0];
}
function pctOf(pid){
 if(state.progress&&state.progress[pid]!==undefined)return state.progress[pid];
 const ts=state.tasks.filter(t=>t.projectId===pid),par=new Set(ts.map(t=>t.parentId).filter(Boolean));
 let tot=0,d=0;ts.forEach(t=>{if(par.has(t.id))return;const w=Math.max(1,days(t.start,t.end)+1);tot+=w;if(t.status==='Готово')d+=w;});
 return tot?Math.round(d*100/tot):0;
}
function buildRows(pids,withKids,from,to,withVac){
 const rows=[];let lo='',hi='';
 pids.forEach(pid=>{
  const pi=state.projects.findIndex(x=>x.id===pid),p=state.projects[pi];if(!p)return;
  const color=PAL[pi%PAL.length],ts=state.tasks.filter(t=>t.projectId===pid);if(!ts.length)return;
  const list=withKids?tree(ts):ts.filter(t=>!t.parentId).sort((a,b)=>a.start.localeCompare(b.start)).map(t=>({t:t,d:0}));
  const items=list.filter(x=>(!from||x.t.end>=from)&&(!to||x.t.start<=to));
  if(!items.length)return;
  const s=ts.reduce((a,t)=>t.start<a?t.start:a,ts[0].start),e=ts.reduce((a,t)=>t.end>a?t.end:a,ts[0].end);
  if(!lo||s<lo)lo=s;if(!hi||e>hi)hi=e;
  rows.push({k:'p',label:p.name,start:s,end:e,color:color,pct:pctOf(pid)});
  items.forEach(x=>rows.push({k:'t',label:x.t.title,who:name(x.t.assigneeId),start:x.t.start,end:x.t.end,color:color,done:x.t.status==='Готово',d:x.d}));
 });
 if(withVac&&state.vacations){
  const L=from||lo,H=to||hi,vr=[];
  if(L&&H)Object.keys(state.vacations).forEach(uid=>(state.vacations[uid]||[]).forEach(v=>{
   if(v.to<L||v.from>H)return;
   vr.push({k:'v',label:'Отпуск — '+name(uid),who:name(uid),start:v.from<L?L:v.from,end:v.to>H?H:v.to,color:'#2e9e6b',d:0});
  }));
  if(vr.length){
   vr.sort((a,b)=>a.start.localeCompare(b.start));
   rows.push({k:'g',label:'Отпуска сотрудников',start:vr[0].start,end:vr[vr.length-1].end,color:'#2e9e6b'});
   vr.forEach(r=>rows.push(r));
  }
 }
 return rows;
}
function renderAn(){
 const o=off();
 $('content').innerHTML=`<div class="toolbar"><h2 style="margin:0">Аналитика</h2><button type="button" data-an="all">Все</button><button type="button" data-an="none">Никто</button><label class="chk2"><input type="checkbox" id="anKids" ${showKids()?'checked':''}> Подзадачи</label><label class="chk2"><input type="checkbox" id="anVac" ${showVac()?'checked':''}> Отпуска</label><button class="primary" type="button" data-an="pdf">Сохранить в PDF</button></div><div class="an-list">${state.projects.map((p,i)=>`<label class="chk2 an-p"><input type="checkbox" data-anp="${esc(p.id)}" ${o.has(p.id)?'':'checked'}><i style="background:${PAL[i%PAL.length]}"></i>${esc(p.name)} <small>${pctOf(p.id)}%</small></label>`).join('')||'<p class="empty">Нет объектов</p>'}</div><div id="anG"></div>`;
 drawAn();
}
function drawAn(){
 const o=off(),pids=state.projects.filter(p=>!o.has(p.id)).map(p=>p.id),rows=buildRows(pids,showKids(),'','',showVac()),box=$('anG');
 if(!box)return;
 if(!rows.length){box.innerHTML='<p class="empty">Отметьте объекты галочками</p>';return;}
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
  if(r.k==='g')return `<div class="an-row proj"><div class="an-l">${esc(r.label)}</div><div class="an-t" style="width:${w}px"></div></div>`;
  if(r.k==='v')return `<div class="an-row"><div class="an-l" style="padding-left:20px" title="${esc(r.label)}">${esc(r.label)}</div><div class="an-t" style="width:${w}px"><div class="an-b vb" style="left:${x}px;width:${wd}px" title="${esc(r.label+' • '+r.start+' — '+r.end)}">${esc(r.label)}</div></div></div>`;
  if(r.k==='p')return `<div class="an-row proj"><div class="an-l" title="${esc(r.label)}">${esc(r.label)} <small>${r.pct}%</small></div><div class="an-t" style="width:${w}px"><div class="an-b" style="left:${x}px;width:${wd}px;background:${r.color};opacity:.5"></div><div class="an-b" style="left:${x}px;width:${wd*r.pct/100}px;background:${r.color}" title="Готовность ${r.pct}%"></div></div></div>`;
  const tg=abbr(r.who);
  return `<div class="an-row"><div class="an-l" style="padding-left:${8+r.d*12}px" title="${esc(r.label+(r.who?' • '+r.who:''))}">${esc(r.label)}${tg?`<span class="an-w">${esc(tg)}</span>`:''}</div><div class="an-t" style="width:${w}px"><div class="an-b${r.done?' done':''}" style="left:${x}px;width:${wd}px;background:${r.color}" title="${esc(r.label+' • '+r.start+' — '+r.end+' • '+r.who)}">${esc(r.label)}</div></div></div>`;
 }).join('');
 const td=today(),tl=td>=min&&td<=max?`<div class="an-today" style="left:${lw+days(min,td)*DW+DW/2}px"></div>`:'';
 box.innerHTML=`<div class="an-wrap"><div class="an-g" style="--lw:${lw}px;width:${lw+w}px"><div class="an-row an-head"><div class="an-l">Объект / этап</div><div class="an-t" style="width:${w}px">${months}${ticks}</div></div>${body}${hl}${tl}</div></div>`;
}
function fit(g,s,w){
 if(g.measureText(s).width<=w)return s;
 while(s.length>1&&g.measureText(s+'…').width>w)s=s.slice(0,-1);
 return s+'…';
}
function drawPages(rows,from,to,title,only,scale,whoMode){
 const PW=842,PH=595,S=scale||2.4,M=24,LW=190,TT=20,HH=28,RH2=15,wm=whoMode||'initials';
 const n=days(from,to)+1,cw=PW-2*M-LW,dw=cw/n,per=Math.floor((PH-2*M-TT-HH)/RH2),np=Math.max(1,Math.ceil(rows.length/per)),td=today(),out=[],x0=M+LW,top=M+TT,lim=only?Math.min(np,only):np;
 for(let pg=0;pg<lim;pg++){
  const cv=document.createElement('canvas');cv.width=Math.round(PW*S);cv.height=Math.round(PH*S);
  const g=cv.getContext('2d');g.scale(S,S);
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
    tg=wm==='name'?r.who:abbr(r.who);
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
 return {pages:out,total:np,PW:PW,PH:PH,W:Math.round(PW*S),H:Math.round(PH*S)};
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
function span(ps){
 const ts=state.tasks.filter(t=>ps.indexOf(t.projectId)>=0);if(!ts.length)return null;
 return {mn:ts.reduce((a,t)=>t.start<a?t.start:a,ts[0].start),mx:ts.reduce((a,t)=>t.end>a?t.end:a,ts[0].end)};
}
const titleOf=(ps,from,to)=>'Ганг: '+ps.map(projectName).join(', ')+' • '+ruD(from)+' – '+ruD(to);
function pdfForm(pids0){
 if(!state.projects.length){toast('Нет объектов');return;}
 const sp0=span(pids0.length?pids0:state.projects.map(p=>p.id));
 if(!sp0){toast('Нет задач');return;}
 const chosen=()=>[...document.querySelectorAll('#editform input[name="pf_p"]:checked')].map(i=>i.value);
 const range=ps=>{
  const sp=span(ps);if(!sp)return null;
  if($('pf_mode').value==='range'){const f=$('pf_from').value,t=$('pf_to').value;return (!f||!t||t<f)?null:{from:f,to:t,sp:sp};}
  return {from:sp.mn,to:sp.mx,sp:sp};
 };
 showForm(`<h2>Ганг в PDF</h2><h3>Объекты</h3><div class="pick">${state.projects.map(p=>`<label class="check"><input type="checkbox" name="pf_p" value="${esc(p.id)}" ${pids0.indexOf(p.id)>=0?'checked':''}><span>${esc(p.name)}</span></label>`).join('')}</div><label>Период<select id="pf_mode"><option value="all">Всё сразу</option><option value="range">Выбрать даты</option></select></label><div class="formgrid">${input('С','pf_from',sp0.mn,'date')}${input('По','pf_to',sp0.mx,'date')}</div><label>Исполнитель рядом с задачей<select id="pf_who"><option value="initials">Инициалы</option><option value="name">Имя</option><option value="none">Не указывать</option></select></label><label class="check"><input type="checkbox" id="pf_kids" ${showKids()?'checked':''}>Включить подзадачи</label><label class="check"><input type="checkbox" id="pf_vac" ${showVac()?'checked':''}>Показать отпуска сотрудников</label><p class="notice" id="pf_info"></p><img id="pf_prev" alt="Предпросмотр первой страницы">`,async()=>{
  const ps=chosen();if(!ps.length)throw Error('Выберите хотя бы один объект');
  const r=range(ps);if(!r)throw Error('Проверьте даты');
  const rows=buildRows(ps,$('pf_kids').checked,r.from,r.to,$('pf_vac').checked);
  if(!rows.length)throw Error('В этом периоде нет задач');
  await new Promise(x=>setTimeout(x,30));
  download(pdfBlob(drawPages(rows,r.from,r.to,titleOf(ps,r.from,r.to),0,0,$('pf_who').value)),'gantt-'+today()+'.pdf');
  $('dialog').close();toast('PDF сохранён');
 });
 let timer=0;
 const prev=()=>{
  const ps=chosen(),img=$('pf_prev'),info=$('pf_info');if(!img||!info)return;
  const sp=span(ps),all=$('pf_mode').value==='all';
  $('pf_from').disabled=all;$('pf_to').disabled=all;
  if(!sp){info.textContent=ps.length?'У выбранных объектов нет задач':'Выберите хотя бы один объект';img.removeAttribute('src');return;}
  $('pf_mode').options[0].textContent='Всё сразу ('+ruD(sp.mn)+' – '+ruD(sp.mx)+')';
  if(all){$('pf_from').value=sp.mn;$('pf_to').value=sp.mx;}
  const r=range(ps);
  if(!r){info.textContent='Проверьте даты: «По» не может быть раньше «С»';img.removeAttribute('src');return;}
  const rows=buildRows(ps,$('pf_kids').checked,r.from,r.to,$('pf_vac').checked);
  if(!rows.length){info.textContent='В этом периоде нет задач';img.removeAttribute('src');return;}
  const res=drawPages(rows,r.from,r.to,titleOf(ps,r.from,r.to),1,1.3,$('pf_who').value);
  img.src=res.pages[0];
  info.textContent='Так будет выглядеть первая страница. Страниц в файле: '+res.total+'. Строк: '+rows.length+'.';
 };
 const later=()=>{clearTimeout(timer);timer=setTimeout(prev,250);};
 document.querySelectorAll('#editform [name="pf_p"],#pf_mode,#pf_from,#pf_to,#pf_kids,#pf_who,#pf_vac').forEach(el=>{el.onchange=later;el.oninput=later;});
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
 if(a==='all'||a==='none'){setOff(a==='all'?new Set():new Set(state.projects.map(p=>p.id)));renderAn();}
 else if(a==='pdf'){const o=off();pdfForm(state.projects.filter(p=>!o.has(p.id)).map(p=>p.id));}
 else if(a==='pdfp'){pdfForm([projectId]);}
});
document.addEventListener('change',e=>{
 const el=e.target;
 if(el.dataset&&el.dataset.anp){const o=off();if(el.checked)o.delete(el.dataset.anp);else o.add(el.dataset.anp);setOff(o);drawAn();}
 else if(el.id==='anKids'){LS('studioAnKids',el.checked?'on':'off');drawAn();}
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
