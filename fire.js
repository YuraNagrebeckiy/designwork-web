'use strict';
(function(){
const st=document.createElement('style');
st.textContent=`.burn{animation:burn2 1.5s ease-in-out infinite!important}
.burn::before,.burn::after{content:'';position:absolute;left:0;right:0;bottom:0;top:auto!important;height:min(100%,34px)!important;pointer-events:none;border-radius:inherit;transform-origin:50% 100%;filter:blur(1.2px);-webkit-mask-image:linear-gradient(to top,#000 35%,transparent);mask-image:linear-gradient(to top,#000 35%,transparent)}
.burn::before{background:radial-gradient(ellipse 11px 26px at 18px 100%,rgba(255,70,0,.55),rgba(255,70,0,0) 72%),radial-gradient(ellipse 13px 32px at 50px 100%,rgba(255,150,0,.5),rgba(255,150,0,0) 72%),radial-gradient(ellipse 9px 22px at 82px 100%,rgba(255,40,0,.5),rgba(255,40,0,0) 72%)!important;background-size:96px 100%!important;background-repeat:repeat-x!important;animation:fl1 1.1s ease-in-out infinite alternate!important}
.burn::after{background:radial-gradient(ellipse 8px 18px at 30px 100%,rgba(255,220,80,.5),rgba(255,220,80,0) 70%),radial-gradient(ellipse 10px 24px at 70px 100%,rgba(255,120,0,.45),rgba(255,120,0,0) 70%);background-size:88px 100%;background-repeat:repeat-x;animation:fl2 .8s ease-in-out infinite alternate}
@keyframes fl1{0%{transform:scaleY(.8) skewX(-3deg);background-position-x:0;opacity:.75}50%{transform:scaleY(1.05) skewX(2deg);opacity:1}100%{transform:scaleY(.9) skewX(-2deg);background-position-x:12px;opacity:.8}}
@keyframes fl2{0%{transform:scaleY(1) skewX(3deg);background-position-x:0}100%{transform:scaleY(.75) skewX(-3deg);background-position-x:-14px}}
@keyframes burn2{0%,100%{box-shadow:0 0 5px 1px rgba(255,120,0,.55),0 0 12px 3px rgba(255,59,0,.35)}50%{box-shadow:0 0 9px 2px rgba(255,170,0,.6),0 0 20px 5px rgba(255,59,0,.4)}}
@media(prefers-reduced-motion:reduce){.burn,.burn::before,.burn::after{animation:none!important}}`;
document.head.appendChild(st);
})();
