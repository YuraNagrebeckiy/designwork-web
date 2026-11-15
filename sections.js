'use strict';
(function(){
const st=document.createElement('style');
st.textContent=`.sectabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:0 0 14px}
.sg-top{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.sg-top b{font-size:13px;min-width:38px}
.sg-top .prog{flex:1;margin:0}
#content .sectabs button{width:100%;border-radius:999px;padding:6px 8px;font-size:13px}
#content .sectabs button.on{background:var(--accent);color:#fff;border-color:var(--accent)}
html[data-theme=dark] #content .sectabs button.on{color:#15171d}
.supplybox{border:1px dashed var(--line);border-radius:12px;padding:22px;color:var(--muted)}
.buildtpl{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 12px}
.buildtpl label{display:flex;align-items:center;gap:6px;margin:0}
#content .grid article.panel{cursor:pointer;transition:border-color .15s,box-shadow .15s}
#content .grid article.panel:hover{border-color:var(--accent);box-shadow:0 2px 10px rgba(16,24,40,.08)}
#content button.ico{min-width:34px;padding:6px;display:inline-flex;align-items:center;justify-content:center}
#content button.ico svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}`;
document.head.appendChild(st);

let sec='design',lastPid='';
const SEC=[['design','Проектирование'],['build','Стройка'],['supply','Комплектация']];
const TPL_NAME='Дизайн интерьера';
const TPL_IDS=(()=>{const a=[];for(let s=1;s<=9;s++)for(let t=1;t<=12;t++)a.push(s+'.'+t);return new Set(a);})();
const BT=[['Подготовка и демонтаж',7],['Черновая инженерия (электрика, сантехника, вентиляция)',14],['Стяжка и гидроизоляция',10],['Перегородки и штукатурка',14],['Чистовая отделка (плитка, шпаклёвка, покраска)',21],['Потолки и двери',7],['Напольные покрытия',7],['Монтаж приборов и сантехники',7],['Мебель и свет',10],['Клининг и сдача объекта',3]];
const ICON=`<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/></svg>`;
const secOf=t=>((state.sections||{})[t.id]==='build')?'build':'design';
window.secFilter=ts=>{
 if(!state||view!=='projects'||!projectId)return ts;
 return sec==='supply'?[]:ts.filter(t=>secOf(t)===sec);
};
window.secGo=function(pid,s){
 view='projects';projectId=pid;lastPid=pid;sec=s;
 render();
};

function decorate(){
 if(!state||view!=='projects'||!projectId)return;
 const c=document.getElementById('content'),tb=c&&c.querySelector('.toolbar');
 if(!c||!tb)return;
 if(!c.querySelector('.sectabs')){
  const S=window.secStats?window.secStats(projectId):null;
  tb.insertAdjacentHTML('afterend',`<div class='sectabs'>${SEC.map(s=>{const n=S?S[s[0]]:0;return `<div class='sg'><div class='sg-top'><b>${n}%</b><div class='prog'><i style='width:${n}%'></i></div></div><button type='button' data-sec='${s[0]}' class='${s[0]===sec?'on':''}'>${s[1]}</button></div>`;}).join('')}</div>`);
 }
 const pe=c.querySelector('[data-action=projectEdit]');
 if(pe&&!pe.classList.contains('ico')){
  pe.classList.add('ico');
  pe.title='Участники и доступ';
  pe.setAttribute('aria-label','Участники и доступ');
  pe.innerHTML=ICON;
 }
 if(sec==='build'&&!c.querySelector('.buildtpl')&&manage(projectId)&&!state.tasks.some(t=>t.projectId===projectId&&secOf(t)==='build')){
  const d=document.createElement('div');
  d.className='buildtpl';
  d.innerHTML=`<span class='notice'>На стройке пока нет этапов.</span><button type='button' class='primary' data-buildtpl='1'>Добавить типовые этапы</button>`;
  c.querySelector('.sectabs').after(d);
 }
 if(sec==='design'&&!c.querySelector('.buildtpl')&&manage(projectId)&&window.studioPlanTpl&&!state.tasks.some(t=>t.projectId===projectId&&secOf(t)==='design')){
  const d=document.createElement('div');
  d.className='buildtpl';
  d.innerHTML=`<span class='notice' id='dtplNote'>В проектировании пока нет этапов.</span><label>Старт <input type='date' id='dtplStart' value='${today()}'></label><button type='button' class='primary' data-designtpl='1'>Добавить шаблон «${TPL_NAME}»</button>`;
  c.querySelector('.sectabs').after(d);
 }
 if(sec==='supply'){
  const g=document.getElementById('ganttRoot');
  if(g){
   if(window.renderSupply)window.renderSupply(g,projectId);
   else g.innerHTML=`<div class='supplybox'><h3>Комплектация</h3><p>Раздел загружается…</p></div>`;
  }
  const tr=c.querySelector('.tree');
  if(tr)tr.innerHTML='';
 }
}

const pend=[],tagged=new Set();
function flush(){
 if(!pend.length||!state)return;
 const sm=state.sections||{},nowt=Date.now();
 for(let i=pend.length-1;i>=0;i--){
  const q=pend[i];
  if(nowt-q.at>180000){pend.splice(i,1);continue;}
  const t=state.tasks.find(x=>String(x.id).indexOf('tmp-')!==0&&!q.before.has(x.id)&&!tagged.has(x.id)&&!sm[x.id]&&x.projectId===q.p&&x.title===q.t&&!x.parentId);
  if(t){
   pend.splice(i,1);
   tagged.add(t.id);
   oCall('sectionSet',{id:t.id,section:'build'}).then(()=>reload()).catch(e=>toast('Не удалось отнести задачу к стройке: '+(e.message||e)));
  }
 }
}

const oRender=render;
render=function(){
 if(projectId!==lastPid){lastPid=projectId;sec='design';}
 const full=state?state.tasks:null,on=!!(state&&view==='projects'&&projectId);
 let r;
 if(on)state.tasks=window.secFilter(full);
 try{r=oRender.apply(this,arguments);}
 finally{if(on)state.tasks=full;}
 try{decorate();}catch(e){}
 try{flush();}catch(e){}
 return r;
};

const oCall=call;
call=async function(action,payload){
 const before=state?new Set(state.tasks.map(t=>t.id)):new Set();
 const r=await oCall.apply(this,arguments);
 if(action==='taskCreate'&&sec==='build'&&payload&&!payload.parentId)pend.push({p:payload.projectId,t:payload.title,before:before,at:Date.now()});
 return r;
};

async function addTpl(){
 const pid=projectId;
 if(!confirm('Добавить 10 типовых этапов стройки? Первый начнётся сегодня, каждый следующий — после предыдущего. Сроки потом можно перетащить в Ганте.'))return;
 let prev=null;
 try{
  for(const x of BT){
   const s=prev?plus(prev.end,1):today(),e=plus(s,x[1]-1);
   const id=await call('taskCreate',{projectId:pid,title:x[0],start:s,end:e,assigneeId:'',deps:prev?[prev.id]:[],lag:0,kind:'stage'});
   prev={id:id,end:e};
  }
 }catch(err){toast(err.message||String(err));}
}

let dbusy=false;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function dsrv(action,payload){
 const r=await transport({action:action,payload:payload||{},token:token});
 if(!r||!r.ok){const m=String(r&&r.error||'Сервер не ответил');if(m.indexOf('AUTH:')===0)signoutLocal();throw Error(m);}
 return r.data;
}
async function addDesignTpl(){
 if(dbusy||!projectId)return;
 const pid=projectId,inp=document.getElementById('dtplStart'),start=(inp&&inp.value)||today();
 const ops=window.studioPlanTpl(TPL_IDS,start),n=ops.length,stages=ops.filter(o=>o.kind==='stage').length;
 if(!n){toast('Шаблон не найден');return;}
 if(!confirm('Добавить шаблон «'+TPL_NAME+'»: этапов '+stages+', задач '+(n-stages)+'? Старт '+start+'. Создание займёт около минуты, не закрывайте страницу.'))return;
 dbusy=true;
 const btn=document.querySelector('[data-designtpl]'),note=document.getElementById('dtplNote');
 if(btn)btn.disabled=true;
 const ids=new Map();let done=0;
 try{
  for(const x of ops){
   if(note)note.textContent='Создаю: '+done+' из '+n+'…';
   let id='';
   for(let tries=0;;tries++){
    try{
     if(tries){
      const s=await dsrv('state',{}),used=new Set([...ids.values()]),t=s.tasks.find(q=>q.projectId===pid&&q.title===x.title&&!used.has(q.id));
      if(t){id=t.id;break;}
     }
     id=await dsrv('taskCreate',{projectId:pid,parentId:x.parent?ids.get(x.parent):'',title:x.title,note:x.note||'',start:x.start,end:x.end,assigneeId:'',deps:x.deps.map(k=>ids.get(k)).filter(Boolean),lag:0,kind:x.kind,calendarEnabled:x.kind==='task'});
     break;
    }catch(e){
     if(String(e.message||e).indexOf('AUTH:')===0||tries>=2)throw e;
     await pause(1500*(tries+1));
    }
   }
   ids.set(x.key,id);done++;
  }
  toast('Шаблон «'+TPL_NAME+'» добавлен');
 }catch(err){
  toast('Создано '+done+' из '+n+'. '+(err.message||String(err))+' Удалите созданное и повторите.');
 }finally{
  dbusy=false;
  try{await reload();}catch(e){}
  render();
 }
}

document.addEventListener('click',e=>{
 if(e.target.closest('[data-designtpl]')){addDesignTpl();return;}
 if(e.target.closest('[data-buildtpl]')){addTpl();return;}
 const b=e.target.closest('[data-sec]');
 if(b){sec=b.dataset.sec;render();return;}
 const a=e.target.closest('#content .grid article.panel');
 if(a&&!e.target.closest('button,a,input,select,textarea')){
  const o=a.querySelector('[data-action=openProject]');
  if(o)o.click();
 }
});

if(typeof showForm!=='undefined'){
 const oSF2=showForm;
 showForm=function(){
  const r=oSF2.apply(this,arguments);
  try{
   const tb=document.querySelector('[data-nmode=tpl]');
   if(tb&&document.getElementById('n_tpl')){
    tb.textContent=TPL_NAME;
    const b=document.querySelector('#n_tpl b');
    if(b)b.textContent='Шаблон «'+TPL_NAME+'»';
   }
  }catch(e){}
  return r;
 };
}

if(state)render();
})();
