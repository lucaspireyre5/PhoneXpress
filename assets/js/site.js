(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.main-nav');
  const navToggle = document.querySelector('.menu-toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const closeMenu = () => {
    if (!nav || !navToggle) return;
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Ouvrir le menu');
  };
  navToggle?.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') !== 'true';
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    nav?.classList.toggle('open', open);
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', e => {
    if (nav?.classList.contains('open') && header && !header.contains(e.target)) closeMenu();
  });
  window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 30), { passive: true });
  if ('IntersectionObserver' in window && !reduced.matches) {
    document.documentElement.classList.add('js-motion');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { rootMargin: '0px 0px -35px 0px', threshold: .045 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  if ('IntersectionObserver' in window && (location.pathname.endsWith('/') || location.pathname.endsWith('index.html'))) {
    const links = [...document.querySelectorAll('.main-nav a[href^="#"]')];
    const sections = [...document.querySelectorAll('main section[id]')];
    if (links.length && sections.length) {
      const active = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
      }), { rootMargin: '-25% 0px -65% 0px' });
      sections.forEach(section => active.observe(section));
    }
  }

  // Quiet atmospheric layers; the hero X is a compressed WebP photograph-like artwork.
  if (!document.querySelector('.cyber-backdrop')) {
    const scene = document.createElement('div');
    scene.className = 'cyber-backdrop';
    scene.setAttribute('aria-hidden', 'true');
    scene.innerHTML = '<span class="cyber-scan"></span><span class="cyber-signal"></span>';
    document.body.prepend(scene);
  }

  const enableShuriken = () => {
    if (reduced.matches || !window.matchMedia('(any-pointer:fine)').matches) return;
    const shuriken = document.createElement('div');
    shuriken.className = 'cursor-shuriken';
    shuriken.setAttribute('aria-hidden', 'true');
    shuriken.innerHTML = `
      <svg class="shuriken-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bladeFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f8fcff"/>
            <stop offset="45%" stop-color="#a8d9ff"/>
            <stop offset="100%" stop-color="#6f95bc"/>
          </linearGradient>
          <radialGradient id="coreFill" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stop-color="#dff6ff"/>
            <stop offset="65%" stop-color="#5bb9ff"/>
            <stop offset="100%" stop-color="#0d355e"/>
          </radialGradient>
        </defs>
        <g fill="url(#bladeFill)" stroke="#12375b" stroke-width="1.6" stroke-linejoin="round">
          <path d="M32 4c3 11 8 16 16 18-7 3-13 8-16 18-3-10-9-15-16-18 8-2 13-7 16-18Z"/>
          <path d="M60 32c-11 3-16 8-18 16-3-7-8-13-18-16 10-3 15-9 18-16 2 8 7 13 18 16Z"/>
          <path d="M32 60c-3-11-8-16-16-18 7-3 13-8 16-18 3 10 9 15 16 18-8 2-13 7-16 18Z"/>
          <path d="M4 32c11-3 16-8 18-16 3 7 8 13 18 16-10 3-15 9-18 16-2-8-7-13-18-16Z"/>
        </g>
        <circle cx="32" cy="32" r="9.8" fill="url(#coreFill)" stroke="#153a62" stroke-width="1.8"/>
        <circle cx="32" cy="32" r="3.8" fill="#eafaff" stroke="#1f5f90" stroke-width="1.2"/>
      </svg>
      <span class="shuriken-pulse"></span>`;
    document.body.appendChild(shuriken);
    let tx = window.innerWidth * 0.5;
    let ty = window.innerHeight * 0.5;
    let x = tx;
    let y = ty;
    let angle = 0;
    let visible = false;
    let impactLock = false;
    let lastMove = performance.now();
    let activeFrame = 0;
    let lastImpactTarget = {x: -1000, y: -1000};
    const show = () => { if (!visible) { visible = true; shuriken.classList.add('active'); } };
    const hide = () => { visible = false; shuriken.classList.remove('active'); };
    window.addEventListener('pointermove', event => {
      tx = event.clientX;
      ty = event.clientY;
      lastMove = performance.now();
      show();
      if (!activeFrame) activeFrame = requestAnimationFrame(tick);
    }, { passive: true });
    window.addEventListener('pointerleave', hide);
    document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
    const impact = () => {
      if (impactLock) return;
      impactLock = true;
      shuriken.classList.remove('is-impact');
      void shuriken.offsetWidth;
      shuriken.classList.add('is-impact');
      setTimeout(() => {
        shuriken.classList.remove('is-impact');
        impactLock = false;
      }, 380);
    };
    const tick = () => {
      activeFrame = 0;
      if (document.hidden || !visible) return;
      const dx = tx - x;
      const dy = ty - y;
      const dist = Math.hypot(dx, dy);
      const chase = dist > 140 ? .10 : dist > 50 ? .19 : .29;
      x += dx * chase;
      y += dy * chase;
      angle += 10 + Math.min(dist * .08, 18);
      shuriken.style.transform = `translate3d(${x - 29}px,${y - 29}px,0) rotate(${angle}deg)`;
      if (dist < 18 && Math.hypot(tx - lastImpactTarget.x, ty - lastImpactTarget.y) > 35) {
        impact();
        lastImpactTarget = {x: tx, y: ty};
      }
      if (dist > .4 || performance.now() - lastMove < 190) {
        activeFrame = requestAnimationFrame(tick);
      }
    };
  };
  enableShuriken();

  const mascot = document.querySelector('.px-mascot');
  if (mascot) {
    const button = mascot.querySelector('.mascot-launcher');
    const dialog = mascot.querySelector('.mascot-dialog');
    const close = () => {
      dialog.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Une question ? Ouvrir l’aide Phone Xpress');
    };
    button.addEventListener('click', () => {
      const show = dialog.hidden;
      dialog.hidden = !show;
      button.setAttribute('aria-expanded', String(show));
      button.setAttribute('aria-label', show ? 'Fermer l’aide Phone Xpress' : 'Une question ? Ouvrir l’aide Phone Xpress');
    });
    mascot.querySelector('.mascot-close')?.addEventListener('click', () => { close(); button.focus(); });
    mascot.querySelector('.mascot-devis')?.addEventListener('click', close);
    document.addEventListener('click', e => { if (!dialog.hidden && !mascot.contains(e.target)) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !dialog.hidden) { close(); button.focus(); } });
  }

})();
