'use strict';
(function(){
const reduced=false;
const st=document.createElement('style');
st.textContent='#cobweb{position:fixed;left:0;top:0;right:0;bottom:0;pointer-events:none;z-index:6;opacity:0;visibility:hidden;transition:opacity .8s}#cobweb.on{opacity:1;visibility:visible}#cobweb svg.w{position:absolute;left:0;top:0;width:100%;height:100%}#cobweb .th{fill:none;stroke:var(--muted);stroke-width:1;opacity:.5;stroke-linecap:round}#spider{position:absolute;left:0;top:0;width:34px;height:34px;margin:-17px 0 0 -17px;opacity:0;filter:drop-shadow(0 0 1px rgba(255,255,255,.7))}#spider .lg{transform-origin:17px 17px;animation:spl .22s linear infinite alternate}@keyframes spl{from{transform:rotate(-6deg)}to{transform:rotate(6deg)}}';
document.head.appendChild(st);
const box=document.createElement('div');box.id='cobweb';
box.innerHTML=`<div id="webwrap"></div><div id="spider"><svg viewBox="0 0 34 34" width="34" height="34"><g class="lg" stroke="#2b2b2b" stroke-width="1.3" stroke-linecap="round" fill="none"><path d="M17 17 L6 9 M17 17 L4 14 M17 17 L4 20 M17 17 L6 26 M17 17 L28 9 M17 17 L30 14 M17 17 L30 20 M17 17 L28 26"/></g><ellipse cx="17" cy="19" rx="5" ry="6.5" fill="#2b2b2b"/><circle cx="17" cy="11.5" r="3.2" fill="#2b2b2b"/></svg></div>`;
document.body.appendChild(box);
let web=null,crawlTimer=0,first=true;
function build(){
 const W=innerWidth,H=innerHeight,cx=W*0.64,cy=H*0.34,R=Math.hypot(Math.max(cx,W-cx),Math.max(cy,H-cy))+40,N=15,ang=[];
 for(let i=0;i<N;i++)ang.push(i*2*Math.PI/N+0.2+Math.sin(i*7.3)*0.06);
 let d='';
 ang.forEach(a=>{d+=`<line class="th" x1="${cx}" y1="${cy}" x2="${cx+Math.cos(a)*R}" y2="${cy+Math.sin(a)*R}"/>`;});
 const rings=Math.round(R/62);
 for(let k=1;k<=rings;k++){
  const r=k*62*(1+0.02*Math.sin(k));let p='';
  for(let i=0;i<N;i++){
   const a1=ang[i],a2=ang[(i+1)%N],a2r=i===N-1?a2+2*Math.PI:a2,am=(a1+a2r)/2,rc=r*0.9;
   const x1=cx+Math.cos(a1)*r,y1=cy+Math.sin(a1)*r,x2=cx+Math.cos(a2r)*r,y2=cy+Math.sin(a2r)*r,qx=cx+Math.cos(am)*rc,qy=cy+Math.sin(am)*rc;
   p+=(i?'':`M ${x1} ${y1} `)+`Q ${qx} ${qy} ${x2} ${y2} `;
  }
  d+=`<path class="th" d="${p}"/>`;
 }
 web={cx:cx,cy:cy,R:R,ang:ang};
 document.getElementById('webwrap').innerHTML=`<svg class="w" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${d}</svg>`;
}
function crawl(){
 const sp=document.getElementById('spider');
 if(!web||reduced||!sp||!sp.animate)return;
 const a=web.ang[Math.floor(Math.random()*web.ang.length)],c=Math.cos(a),s=Math.sin(a);
 const r0=web.R*0.98,r1=web.R*(0.22+Math.random()*0.2);
 const x0=web.cx+c*r0,y0=web.cy+s*r0,x1=web.cx+c*r1,y1=web.cy+s*r1;
 const rot=Math.atan2(-s,-c)*180/Math.PI+90;
 const f=(x,y,r)=>'translate('+x+'px,'+y+'px) rotate('+r+'deg)';
 sp.style.opacity=1;
 const an=sp.animate([
  {transform:f(x0,y0,rot),offset:0},
  {transform:f(x1,y1,rot),offset:0.5},
  {transform:f(x1,y1,rot),offset:0.62},
  {transform:f(x1,y1,rot+180),offset:0.66},
  {transform:f(x0,y0,rot+180),offset:1}
 ],{duration:12000,easing:'ease-in-out'});
 an.onfinish=()=>{sp.style.opacity=0;};
 an.oncancel=()=>{sp.style.opacity=0;};
}
function noTasksToday(){
 if(!state||state.me.role==='observer')return false;
 const td=today();
 return !state.tasks.some(t=>t.assigneeId===state.me.id&&t.status!=='Готово'&&t.start<=td);
}
function schedule(){
 if(crawlTimer||reduced)return;
 const wait=first?3000:15000+Math.random()*25000;
 first=false;
 crawlTimer=setTimeout(()=>{crawlTimer=0;if(box.classList.contains('on'))crawl();schedule();},wait);
}
function update(){
 const on=noTasksToday();
 if(on&&!web)build();
 box.classList.toggle('on',on);
 if(on)schedule();else{clearTimeout(crawlTimer);crawlTimer=0;first=true;}
}
function extraFire(){
 if(!state)return;
 const td=today();
 const burn=t=>t&&t.status!=='Готово'&&(Number(t.hours)>0?t.start:t.end)<td;
 const mark=(el,t)=>{if(!burn(t))return;['dl-g','dl-y','dl-r'].forEach(c=>el.classList.remove(c));el.classList.add('dl-fire','burn');};
 document.querySelectorAll('#content .card[data-drag]').forEach(c=>mark(c,state.tasks.find(x=>x.id===c.dataset.drag)));
 document.querySelectorAll('#content .bar[data-id]').forEach(b=>mark(b,state.tasks.find(x=>x.id===b.dataset.id)));
}
let rt=0;
window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{web=null;try{update();}catch(e){}},300);});
const oRender=render;
render=function(){const r=oRender.apply(this,arguments);try{update();extraFire();}catch(e){}return r;};
setInterval(()=>{try{update();extraFire();}catch(e){}},5000);
if(state)render();
})();
