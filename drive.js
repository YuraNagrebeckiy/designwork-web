'use strict';
(function(){
const MB=1048576;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function fcall(action,payload,ms){
 const API=String(window.STUDIO_API||'').trim();
 const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),ms||60000);
 try{
  const res=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:action,payload:payload,token:token}),signal:ctl.signal,redirect:'follow'});
  if(!res.ok)throw Error('Сервер недоступен ('+res.status+')');
  const r=await res.json();
  if(!r.ok){if(String(r.error).startsWith('AUTH:'))signoutLocal();throw Error(r.error);}
  return r.data;
 }catch(e){
  throw Error(e.name==='AbortError'?'Сервер отвечает слишком долго. Повторите.':(e.message||String(e)));
 }finally{clearTimeout(to);}
}

function b64(buf){const u=new Uint8Array(buf),n=0x8000;let s='';for(let i=0;i<u.length;i+=n)s+=String.fromCharCode.apply(null,u.subarray(i,i+n));return btoa(s);}
const okId=id=>/^[A-Za-z0-9_-]{10,100}$/.test(String(id||''));
const thumb=(id,w)=>'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w'+(w||400);
const dl=id=>'https://drive.usercontent.google.com/download?id='+encodeURIComponent(id)+'&export=download&confirm=t';
const view=id=>'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview';

function openUrl(u){const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener noreferrer';document.body.appendChild(a);a.click();a.remove();}
function saveBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000);}

function put(loc,blob,start,total,prog){
 return new Promise((resolve,reject)=>{
  const x=new XMLHttpRequest();
  x.open('PUT',loc);
  x.timeout=600000;
  x.setRequestHeader('Content-Range','bytes '+start+'-'+(start+blob.size-1)+'/'+total);
  x.upload.onprogress=e=>{if(e.lengthComputable)prog(start+e.loaded);};
  x.onload=()=>{
   if(x.status===308){resolve({done:false});return;}
   if(x.status===200||x.status===201){let id='';try{id=JSON.parse(x.responseText).id||'';}catch(e){}resolve({done:true,id:id});return;}
   reject(Error('HTTP '+x.status));
  };
  x.onerror=()=>reject(Error('NET'));
  x.ontimeout=()=>reject(Error('TIMEOUT'));
  x.send(blob);
 });
}

async function direct(s,file,onp){
 let off=0,size=8*MB,id='';
 const pr=b=>onp(Math.min(100,Math.round(b*100/file.size)));
 while(off<file.size){
  const end=Math.min(off+size,file.size),part=file.slice(off,end),t0=Date.now();
  let ok=false,err=null,res=null;
  for(let k=0;k<3&&!ok;k++){
   try{res=await put(s.loc,part,off,file.size,pr);ok=true;}
   catch(e){
    err=e;
    if(off===0&&k===0&&e.message==='NET')throw Error('NODIRECT');
    await sleep(1500*(k+1));
   }
  }
  if(!ok)throw err;
  const dt=(Date.now()-t0)/1000;
  off=end;pr(off);
  if(res.done){id=res.id;break;}
  if(dt<4&&size<64*MB)size*=2;
  else if(dt>25&&size>2*MB)size/=2;
 }
 if(!id)throw Error('Диск не вернул ID файла');
 return id;
}

async function proxy(s,file,onp){
 let off=0,size=4*MB,driveId='';
 while(off<file.size){
  const end=Math.min(off+size,file.size),data=b64(await file.slice(off,end).arrayBuffer()),t0=Date.now();
  let ok=false,err=null,r=null;
  for(let k=0;k<3&&!ok;k++){
   try{r=await fcall('fileChunk',{upId:s.upId,offset:off,data:data},180000);ok=true;}
   catch(e){err=e;await sleep(1500*(k+1));}
  }
  if(!ok)throw err;
  off=end;
  onp(Math.min(100,Math.round(off*100/file.size)));
  if(r.done){driveId=r.driveId;break;}
  if((Date.now()-t0)<6000&&size<8*MB)size=8*MB;
 }
 return driveId;
}

async function upload(taskId,file,onp){
 const s=await fcall('fileStart',{taskId:taskId,name:file.name,mime:file.type||'application/octet-stream',size:file.size},60000);
 if(s.done)return s.driveId;
 let useDirect=!!s.direct,id='';
 if(useDirect){
  try{id=await direct(s,file,onp);}
  catch(e){if(e.message!=='NODIRECT')throw e;useDirect=false;}
 }
 if(useDirect){
  const r=await fcall('fileFinish',{upId:s.upId,driveId:id},60000);
  return r.driveId;
 }
 return await proxy(s,file,onp);
}

async function fetchAll(taskId,fid,size,onp){
 if(!size)return new Blob([]);
 const parts=[];let off=0,total=0,mime='';
 for(;;){
  const r=await fcall('fileGet',{taskId:taskId,id:fid,offset:off,length:8*MB},180000);
  total=Number(r.size)||0;mime=r.mime||'';
  const bin=atob(r.data),u=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  parts.push(u);off+=u.length;
  if(onp)onp(total?Math.min(100,Math.round(off*100/total)):0);
  if(r.whole||!u.length||(total&&off>=total))break;
 }
 return new Blob(parts,{type:mime});
}

window.DIO={fcall:fcall,upload:upload,fetchAll:fetchAll,okId:okId,thumb:thumb,dl:dl,view:view,openUrl:openUrl,saveBlob:saveBlob};
})();
