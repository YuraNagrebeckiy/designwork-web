// Адрес сервера Google Apps Script (Web App, заканчивается на /exec)
window.STUDIO_API = 'https://script.google.com/macros/s/AKfycbyS2UbVSa_ZYzQ5jf1ZfERW7j-B9e3bBD-cSgshETuMprVVOoCZE-k2x3f2USWcDV6h/exec';

// Дополнительные модули интерфейса по очереди: features.js (график, меню, быстрое сохранение, чат),
// members.js (участники, типы проектов, карточки), touch.js (перенос полос после удержания).
// Параметр меняется каждые 5 минут, чтобы браузер брал свежую версию.
window.addEventListener('load', function () {
  var v = Math.floor(Date.now() / 300000);
  var files = ['features.js', 'members.js', 'touch.js'];
  (function next(i) {
    if (i >= files.length) return;
    var s = document.createElement('script');
    s.src = files[i] + '?v=' + v;
    s.onload = function () { next(i + 1); };
    s.onerror = function () { next(i + 1); };
    document.body.appendChild(s);
  })(0);
});
