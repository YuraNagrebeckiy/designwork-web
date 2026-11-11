'use strict';
(function(){
const st=document.createElement('style');
st.textContent=`button:not(.bar):not(.clipbtn){min-height:34px;padding:6px 12px;font-size:14px;font-weight:500;line-height:1.2;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--ink);box-shadow:0 1px 1px rgba(16,24,40,.05);transition:background .15s,border-color .15s,box-shadow .15s,transform .05s}
button:not(.bar):not(.clipbtn):hover{background:var(--soft);border-color:var(--accent)}
button:not(.bar):not(.clipbtn):active{transform:translateY(1px);box-shadow:none}
button.primary:not(.bar){background:var(--accent);border-color:var(--accent);color:#fff;box-shadow:0 1px 2px rgba(82,101,223,.35)}
button.primary:not(.bar):hover{background:var(--accent);filter:brightness(1.08)}
html[data-theme=dark] button.primary:not(.bar){color:#15171d}
button.danger:not(.bar){background:transparent}
button.danger:not(.bar):hover{background:var(--soft);border-color:var(--danger)}
nav button{border-radius:999px;padding:6px 14px}
nav button.active{background:var(--accent);border-color:var(--accent);color:#fff}
html[data-theme=dark] nav button.active{color:#15171d}
#theme,#menubtn{min-width:36px;min-height:36px;padding:0;border-radius:50%;display:inline-flex;align-items:center;justify-content:center}
.menu button{border:0;box-shadow:none;border-radius:8px;min-height:36px}
.card .actions button,.card .actions select{min-height:30px;padding:3px 10px;font-size:13px}
.footer button{min-width:96px}
input,select,textarea{min-height:38px;padding:7px 10px;border-radius:8px}
.toolbar select,.toolbar input{min-height:34px;padding:5px 10px}
select[multiple]{min-height:120px}
input[type=checkbox],input[type=radio]{min-height:0}`;
document.head.appendChild(st);
})();
