'use strict';
(function(){
const st=document.createElement('style');
st.textContent=`
#dialog:has(.scp){overflow-x:hidden}
.scp{min-width:0;max-width:100%;overflow-wrap:anywhere}
.scp h2{margin:0 0 6px}
.scp #sc_q{position:sticky;top:0;z-index:2;display:block;width:100%;box-sizing:border-box;margin:8px 0 6px;background:var(--panel,#fff)}
.scp .sc-g{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin:18px 0 8px;padding:8px 12px;border-radius:10px;background:rgba(91,91,214,.09);font-weight:700;font-size:14px;line-height:1.3}
.scp .sc-g button{margin:0;padding:4px 10px;font-size:12px;font-weight:500;white-space:nowrap}
.scp .sc-it{border:1px solid var(--line,#e5e7eb);border-radius:12px;padding:10px 12px;margin:8px 0;background:var(--panel,#fff);transition:border-color .15s,box-shadow .15s}
.scp .sc-it:has(.sc_ck:checked){border-color:var(--accent,#5b5bd6);box-shadow:0 0 0 2px rgba(91,91,214,.16)}
.scp .sc-it:has(.sc_ck:disabled){opacity:.55}
.scp label.sc-row{display:flex!important;flex-direction:row!important;align-items:flex-start!important;gap:10px!important;margin:0!important;cursor:pointer;font-weight:600;line-height:1.35;font-size:14px}
.scp input.sc_ck{width:20px!important;height:20px!important;min-width:20px!important;flex:none!important;margin:1px 0 0!important;padding:0!important;accent-color:var(--accent,#5b5bd6)}
.scp .sc-row span{display:block;flex:1;min-width:0}
.scp details{margin:6px 0 0 30px!important;font-size:13px}
.scp summary{cursor:pointer;color:var(--accent,#5b5bd6);font-weight:500}
.scp dl,.sc-hint dl{display:grid;grid-template-columns:minmax(0,1fr);gap:2px;margin:8px 0 2px}
.scp dt,.sc-hint dt{margin:8px 0 0;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--muted,#6b7280)}
.scp dd,.sc-hint dd{margin:0;font-size:13px;line-height:1.45}
.scp dd:last-of-type,.sc-hint dd:last-of-type{margin-top:2px;padding:6px 9px;border-radius:8px;background:rgba(245,158,11,.12)}
.sc-hint{margin:4px 0 10px;padding:8px 12px;border:1px solid var(--line,#e5e7eb);border-radius:10px;background:var(--panel,#fff)}
.sc-hint summary{cursor:pointer;color:var(--accent,#5b5bd6);font-weight:500}
`;
document.head.appendChild(st);
})();
