'use strict';
(function(){
var src='';
try{
 var x=new XMLHttpRequest();
 x.open('GET','analytics.js?v='+Math.floor(Date.now()/300000),false);
 x.send();
 if(x.status===200)src=x.responseText;
}catch(e){}
if(!src){
 var s=document.createElement('script');
 s.src='analytics.js?v='+Math.floor(Date.now()/300000);
 document.body.appendChild(s);
 return;
}
var orig=src;
function rep(a,b){
 var i=src.indexOf(a);
 if(i<0||src.indexOf(a,i+1)>=0)return;
 src=src.slice(0,i)+b+src.slice(i+a.length);
}
rep("const PW=842,PH=595,S2=scale||2.4,M=24,LW=190,TT=20,HH=28,RH2=15,wm=whoMode||'initials';",
 "let PW=842,PH=595,S2=scale||2.4;const M=24,LW=190,TT=20,HH=28,RH2=15,wm=whoMode||'initials';\n window.__pdfPage=null;\n const PO=window.__pdfOpt;\n if(PO){\n  const land=PO.ori!=='port';let bw=PO.fmt==='A3'?1191:842,bh=PO.fmt==='A3'?842:595;\n  if(!land){const t=bw;bw=bh;bh=t;}\n  const need=2*M+TT+HH+rows.length*RH2;\n  if(PO.one&&PO.fmt==='free'){PW=land?842:595;PH=Math.max(160,need);window.__pdfPage=[PW,PH];}\n  else if(PO.one){PW=bw;PH=bh;if(need>bh){PH=need;PW=Math.round(need*bw/bh);}window.__pdfPage=[bw,bh];}\n  else{PW=bw;PH=bh;window.__pdfPage=[bw,bh];}\n  const cap=Math.sqrt(14e6/(PW*PH));if(S2>cap)S2=cap;\n }");
rep("return {pages:out,total:np,PW:PW,PH:PH,W:Math.round(PW*S2),H:Math.round(PH*S2)};",
 "return {pages:out,total:np,PW:(window.__pdfPage?window.__pdfPage[0]:PW),PH:(window.__pdfPage?window.__pdfPage[1]:PH),W:Math.round(PW*S2),H:Math.round(PH*S2)};");
rep("const makeJobs=()=>{",
 "const makeJobs=()=>{(function(){var f=document.getElementById('pf_fit');if(f)window.__pdfOpt={one:f.value==='one',fmt:document.getElementById('pf_fmt').value,ori:document.getElementById('pf_ori').value};})();");
rep("<label>Файлы<select id='pf_split'>",
 "<label>Размещение<select id='pf_fit'><option value='pages'>По страницам</option><option value='one'>Всё на одном листе</option></select></label><label>Формат<select id='pf_fmt'><option value='A4'>A4</option><option value='A3'>A3</option><option value='free'>Без формата (как есть, на одном листе)</option></select></label><label>Ориентация<select id='pf_ori'><option value='land'>Горизонтальная</option><option value='port'>Вертикальная</option></select></label><label>Файлы<select id='pf_split'>");
var fn;
try{fn=new Function(src);}catch(e){fn=new Function(orig);}
fn();
})();
