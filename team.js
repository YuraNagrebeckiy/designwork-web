'use strict';
(function(){
if(typeof document==='undefined'||typeof showForm==='undefined')return;
const ROLE={admin:'Руководитель',employee:'Сотрудник'};
const staff=()=>state.users.filter(u=>u.approved==='true'&&(u.role==='admin'||u.role==='employee'));
function fixNew(){
 const s=document.getElementById('n_members');
 if(!s||s.dataset.team)return;
 s.dataset.team='1';
 const sel=[...s.selectedOptions].map(o=>o.value);
 s.innerHTML=opts(staff(),sel);
}
function fixSettings(){
 const f=document.getElementById('editform');
 if(!f||!document.getElementById('p_name'))return;
 const h=[...f.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Участники объекта');
 if(!h)return;
 const hint=h.nextElementSibling,el=hint&&hint.nextElementSibling;
 if(!el||el.dataset.team||!(el.classList.contains('pick')||el.classList.contains('notice')))return;
 const cur=new Set([...f.querySelectorAll('input[name="p_members"]:checked')].map(i=>i.value));
 const list=staff();
 const box=document.createElement('div');
 box.className='pick';
 box.dataset.team='1';
 box.innerHTML=list.length?list.map(u=>'<label class="check"><input type="checkbox" name="p_members" value="'+esc(u.id)+'" '+(cur.has(u.id)?'checked':'')+'><span>'+esc(u.name)+' <small>'+esc(ROLE[u.role]||'')+'</small></span></label>').join(''):'<p class="notice">Нет одобренных сотрудников.</p>';
 el.replaceWith(box);
}
const oSF=showForm;
showForm=function(){
 const r=oSF.apply(this,arguments);
 try{fixNew();}catch(e){}
 try{fixSettings();}catch(e){}
 return r;
};
})();
