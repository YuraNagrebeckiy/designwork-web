'use strict';
(function(){
const st=document.createElement('style');
st.id='mobilefix';
st.textContent=`
@media(max-width:760px){
html{-webkit-text-size-adjust:100%}
html,body{max-width:100%;overflow-x:hidden}
main,#content,section,.panel,.card,.column,.toolbar,.formgrid>*,.grid>*,.board>*{min-width:0;max-width:100%}
h1,h2,h3,h4,p,label,small,span,li,td,th,summary,.meta,.badge,.card,.panel,.notice,.error,#identity{overflow-wrap:anywhere;word-break:break-word}
header{padding:8px max(12px,env(safe-area-inset-right)) 8px max(12px,env(safe-area-inset-left));gap:8px}
.brand{flex:1 1 auto;min-width:0}
.tools{flex:none}
nav{order:3;width:100%;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px}
nav button{flex:none;white-space:nowrap;min-height:40px;padding:8px 12px}
.menu{max-width:calc(100vw - 24px);width:max-content;min-width:180px}
.menu button{white-space:normal;overflow-wrap:anywhere}
button{max-width:100%;white-space:normal;overflow-wrap:anywhere;line-height:1.25}
.toolbar>button,.toolbar>select,.toolbar>label{flex:1 1 140px}
.card .actions button,.footer button{flex:1 1 130px}
.footer{justify-content:stretch}
input,select,textarea{font-size:16px;max-width:100%;min-width:0}
input[type=date],input[type=time],input[type=number]{-webkit-appearance:none;appearance:none;min-width:0}
textarea{width:100%}
label.check{align-items:flex-start}
label.check input{flex:none}
dialog{width:calc(100vw - 16px);max-width:calc(100vw - 16px);padding:14px;border-radius:14px;margin:auto}
dialog form,dialog .panel{min-width:0}
dialog table{display:block;max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
dialog img,dialog svg,dialog canvas{max-width:100%;height:auto}
dialog h2,dialog h3{overflow-wrap:anywhere}
.glabel{overflow:hidden}
#message{left:8px;right:8px;bottom:max(8px,env(safe-area-inset-bottom))}
}
`;
document.head.appendChild(st);
})();
