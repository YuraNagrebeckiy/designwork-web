// Адрес сервера Google Apps Script (Web App, заканчивается на /exec)
// Предыдущий адрес (аккаунт yura.nagrebeckiy), для отката: https://script.google.com/macros/s/AKfycbyS2UbVSa_ZYzQ5jf1ZfERW7j-B9e3bBD-cSgshETuMprVVOoCZE-k2x3f2USWcDV6h/exec
window.STUDIO_API = 'https://script.google.com/macros/s/AKfycbz-efA9llTBhq7O0p2BMIeFLBKJOWXQplcG66qEu_vGvKX6JQ8GA6qFKfMpGc4AZWqu/exec';

// Быстрая загрузка: модули скачиваются одновременно, выполняются строго по порядку,
// экран скрыт и показывается один раз, когда всё готово (без промежуточных перерисовок).
// Порядок: features, members, touch, analytics, work, plan, fire, cal, ins, obj, keep, web, drive, files, mood, board,
// moodfix, ganttadd, supply, supplycat, supplyfix, supplydates, supply2x (патч поверх supply2), supplyfiles, personal, sections, overview, hier, mobile, ui, final, harden, dialog, branch, secfix, newobj, newobj2, newobj3, smr, tpls, team, tplfix, smrlog, ganttlink, pspace, donechk, autoplan, dayadd, carry, gyear, gyedit, gtools, palette, lib, queue, busy, gfold, team2, roles2, guide.
(function () {
  var root = document.documentElement;
  root.classList.add('booting');
  var css = document.createElement('style');
  css.textContent = 'html.booting #content,html.booting #nav{visibility:hidden}';
  document.head.appendChild(css);
  var calm = document.createElement('link');
  calm.rel = 'stylesheet';
  calm.href = 'calm.css?v=' + Math.floor(Date.now() / 300000);
  document.head.appendChild(calm);
  var fix = document.createElement('link');
  fix.rel = 'stylesheet';
  fix.href = 'supply2fix.css?v=' + Math.floor(Date.now() / 300000);
  document.head.appendChild(fix);
  var files = ['features.js', 'members.js', 'touch.js', 'analytics.js', 'work.js', 'plan.js', 'fire.js', 'cal.js', 'ins.js', 'obj.js', 'keep.js', 'web.js', 'drive.js', 'files.js', 'mood.js', 'board.js', 'moodfix.js', 'ganttadd.js', 'supply.js', 'supplycat.js', 'supplyfix.js', 'supplydates.js', 'supply2x.js', 'supplyfiles.js', 'personal.js', 'sections.js', 'overview.js', 'hier.js', 'mobile.js', 'ui.js', 'final.js', 'harden.js', 'dialog.js', 'branch.js', 'secfix.js', 'newobj.js', 'newobj2.js', 'newobj3.js', 'smr.js', 'tpls.js', 'team.js', 'tplfix.js', 'smrlog.js', 'ganttlink.js', 'pspace.js', 'donechk.js', 'autoplan.js', 'dayadd.js', 'carry.js', 'gyear.js', 'gyedit.js', 'gtools.js', 'palette.js', 'lib.js', 'queue.js', 'busy.js', 'gfold.js', 'team2.js', 'roles2.js', 'guide.js'];
  var booting = true, pendingState = null, saved = null, finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    booting = false;
    try {
      if (pendingState) applyState(pendingState);
      else if (saved && !state) { state = saved; render(); }
      else if (state) render();
    } catch (e) {}
    root.classList.remove('booting');
  }
  window.addEventListener('load', function () {
    try {
      if (typeof state !== 'undefined' && state) { saved = state; state = null; }
      var realApply = applyState;
      applyState = function (s) {
        if (booting) { pendingState = s; return; }
        return realApply.apply(this, arguments);
      };
    } catch (e) {}
    var v = Math.floor(Date.now() / 300000), left = files.length;
    function done() { left--; if (left <= 0) finish(); }
    files.forEach(function (f) {
      var s = document.createElement('script');
      s.src = f + '?v=' + v;
      s.async = false;
      s.onload = done;
      s.onerror = done;
      document.body.appendChild(s);
    });
    setTimeout(finish, 12000);
  });
})();
