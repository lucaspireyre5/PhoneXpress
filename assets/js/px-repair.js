(() => {
  'use strict';
  const range = document.getElementById('px-repair-range');
  if (!range) return;
  const target = range.closest('.px-repair');
  const update = () => {
    const n = Math.max(0, Math.min(100, Number(range.value) || 0));
    target.style.setProperty('--reveal', `${n}%`);
    range.style.setProperty('--reveal', `${n}%`);
    range.setAttribute('aria-valuetext', `${n} pour cent de l’écran réparé`);
  };
  range.addEventListener('input', update, { passive: true });
  range.addEventListener('change', update, { passive: true });
  update();
})();
