/* תפריט נגישות: גודל טקסט, ניגודיות, הדגשת קישורים, גופן קריא, עצירת אנימציות.
   ההגדרות נשמרות בדפדפן של הגולש. */
(function () {
  'use strict';

  var KEY = 'gal-a11y';
  var root = document.documentElement;
  var FONT_STEPS = [100, 115, 130, 150];
  var state = { font: 0, contrast: false, links: false, font2: false, motion: false };

  try { var saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved) for (var k in state) if (k in saved) state[k] = saved[k]; } catch (e) {}

  function apply() {
    root.style.fontSize = FONT_STEPS[state.font] === 100 ? '' : FONT_STEPS[state.font] + '%';
    root.classList.toggle('a11y-contrast', !!state.contrast);
    root.classList.toggle('a11y-links', !!state.links);
    root.classList.toggle('a11y-font', !!state.font2);
    root.classList.toggle('a11y-motion', !!state.motion);
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('a11y:change'));
  }
  apply();

  function init() {
    var wrap = document.querySelector('.a11y');
    if (!wrap) return;
    var toggle = wrap.querySelector('.a11y__toggle');
    var panel = wrap.querySelector('.a11y__panel');
    var value = wrap.querySelector('.a11y__value');
    var map = { contrast: 'contrast', links: 'links', font: 'font2', motion: 'motion' };

    function sync() {
      value.textContent = FONT_STEPS[state.font] + '%';
      wrap.querySelector('[data-a11y="font-down"]').disabled = state.font === 0;
      wrap.querySelector('[data-a11y="font-up"]').disabled = state.font === FONT_STEPS.length - 1;
      wrap.querySelector('[data-a11y="font-down"]').setAttribute('aria-label', 'הקטנת טקסט');
      wrap.querySelector('[data-a11y="font-up"]').setAttribute('aria-label', 'הגדלת טקסט');
      Object.keys(map).forEach(function (btn) {
        wrap.querySelector('[data-a11y="' + btn + '"]').setAttribute('aria-pressed', String(!!state[map[btn]]));
      });
    }
    function setOpen(open, focusBack) {
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) panel.querySelector('button:not(:disabled)').focus();
      else if (focusBack) toggle.focus();
    }

    toggle.addEventListener('click', function () { setOpen(panel.hidden); });
    panel.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a11y]');
      if (!b) return;
      var a = b.getAttribute('data-a11y');
      if (a === 'font-up') state.font = Math.min(FONT_STEPS.length - 1, state.font + 1);
      else if (a === 'font-down') state.font = Math.max(0, state.font - 1);
      else if (a === 'reset') state = { font: 0, contrast: false, links: false, font2: false, motion: false };
      else if (map[a]) state[map[a]] = !state[map[a]];
      apply(); sync();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) setOpen(false, true);
    });
    document.addEventListener('click', function (e) {
      if (!panel.hidden && !wrap.contains(e.target)) setOpen(false);
    });
    sync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
