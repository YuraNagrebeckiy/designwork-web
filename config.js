// Адрес сервера Google Apps Script (Web App, заканчивается на /exec)
window.STUDIO_API = 'https://script.google.com/macros/s/AKfycbyS2UbVSa_ZYzQ5jf1ZfERW7j-B9e3bBD-cSgshETuMprVVOoCZE-k2x3f2USWcDV6h/exec';

// Дополнительный модуль интерфейса: график, меню. Загружается после app.js и notify.js.
window.addEventListener('load', function () {
  var s = document.createElement('script');
  s.src = 'features.js?v=1';
  document.body.appendChild(s);
});
