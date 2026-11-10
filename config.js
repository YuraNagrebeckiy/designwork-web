// Адрес сервера Google Apps Script (Web App, заканчивается на /exec)
window.STUDIO_API = 'https://script.google.com/macros/s/AKfycbyS2UbVSa_ZYzQ5jf1ZfERW7j-B9e3bBD-cSgshETuMprVVOoCZE-k2x3f2USWcDV6h/exec';

// Дополнительные модули интерфейса: features.js (график, меню, быстрое сохранение, чат), затем members.js (участники и доступ).
// Загружаются после app.js и notify.js. Параметр меняется каждые 5 минут, чтобы браузер брал свежую версию.
window.addEventListener('load', function () {
  var v = Math.floor(Date.now() / 300000);
  var a = document.createElement('script');
  a.src = 'features.js?v=' + v;
  a.onload = function () {
    var b = document.createElement('script');
    b.src = 'members.js?v=' + v;
    document.body.appendChild(b);
  };
  document.body.appendChild(a);
});
