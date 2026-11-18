/* Руби 3D Дизайн — включает анимацию перехода только при переключении разделов,
   чтобы фоновое обновление данных не заставляло интерфейс «моргать». */
(function(){
  var timer;
  function go(){
    var el=document.getElementById('content');if(!el)return;
    el.setAttribute('data-go','');clearTimeout(timer);
    timer=setTimeout(function(){el.removeAttribute('data-go')},900);
  }
  function isSwitch(b){
    var p=b.parentElement;
    return !!(p&&p.querySelector(':scope>button.active')&&p.querySelectorAll(':scope>button').length>1);
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('button');if(!b)return;
    if(b.id==='theme'){
      var h=document.documentElement;h.classList.add('g-switch');
      setTimeout(function(){h.classList.remove('g-switch')},600);return;
    }
    if(isSwitch(b))go();
  },true);
  document.addEventListener('change',function(e){
    if(e.target&&e.target.tagName==='SELECT'&&e.target.closest('.toolbar'))go();
  },true);
  var c=document.getElementById('content');
  if(c&&window.MutationObserver){
    new MutationObserver(function(){if(!c.classList.contains('hidden'))go()})
      .observe(c,{attributes:true,attributeFilter:['class']});
  }
})();
