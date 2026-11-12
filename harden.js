'use strict';
(function(){
const ridMap={},RID_ACT=['taskCreate','projectCreate','chatSend','supplyDo','personalEnsure'];
const st=document.createElement('style');
st.textContent='.track{overflow:hidden}';
document.head.appendChild(st);

transport=async function(req){
 const API=String(window.STUDIO_API||'').trim();
 if(!API.startsWith('https://script.google.com/macros/s/')||!API.endsWith('/exec'))throw Error('Не настроен адрес сервера (config.js)');
 let key='';
 if(RID_ACT.indexOf(req.action)>=0){
  key=req.action+JSON.stringify(req.payload||{});
  req.rid=ridMap[key]||(ridMap[key]=(window.crypto&&crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random()));
 }
 const tries=(req.action==='state'||req.action==='ping')?2:1;
 let last;
 for(let i=0;i<tries;i++){
  const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),30000);
  try{
   const res=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(req),signal:ctl.signal,redirect:'follow'});
   if(!res.ok)throw Error('Сервер недоступен ('+res.status+')');
   const data=await res.json();
   if(key)delete ridMap[key];
   return data;
  }catch(e){
   last=e;
   if(i+1<tries&&e.name!=='AbortError')await new Promise(r=>setTimeout(r,900));
   else break;
  }finally{clearTimeout(to);}
 }
 throw Error(last&&last.name==='AbortError'?'Сервер отвечает слишком долго. Повторите.':'Нет связи с сервером. '+((last&&last.message)||''));
};

window.callBatch=function(items){return call('batch',{items:items});};

let reloadSeq=0,lastFull=Date.now(),revSeen='';
reload=async function(){
 const my=++reloadSeq;
 const s=await call('state');
 if(!token||my!==reloadSeq)return;
 lastFull=Date.now();
 applyState(s);
 try{localStorage.setItem('studioCache',JSON.stringify(s));}catch(e){}
};

const oGuarded=guarded;
guarded=function(fn,silent){
 if(silent&&fn===reload&&state){
  return oGuarded(async()=>{
   const r=await call('ping');
   if(r.rev!==revSeen||Date.now()-lastFull>300000){revSeen=r.rev;await reload();}
  },true);
 }
 return oGuarded(fn,silent);
};

const oGantt=renderGantt;
renderGantt=function(id){
 const lo=plus(today(),-1100),hi=plus(today(),1830),all=state.tasks;
 const ok=all.filter(t=>t.start>=lo&&t.end<=hi);
 if(ok.length===all.length)return oGantt(id);
 state.tasks=ok;
 try{return oGantt(id);}finally{state.tasks=all;}
};

const oPw=passwordForm;
passwordForm=function(){
 oPw.apply(this,arguments);
 ['pw1','pw2'].forEach(i=>{const e=$(i);if(e)e.minLength=12;});
 const n=$('dialog').querySelector('.notice');
 if(n)n.textContent='От 12 символов, лучше длиннее. Дальше вы будете входить по email и паролю.';
};
})();
