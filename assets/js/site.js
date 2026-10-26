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

  const form = document.getElementById('quote-form');
  if (!form) return;
  const status = document.getElementById('quote-status');
  const submit = form.querySelector('[type="submit"]');
  const device = document.getElementById('quote-device');
  const fault = document.getElementById('quote-fault');
  const phone = document.getElementById('quote-phone');
  const name = document.getElementById('quote-name');
  const email = document.getElementById('quote-email');
  const model = document.getElementById('quote-model');
  const description = document.getElementById('quote-description');
  const privacy = document.getElementById('quote-privacy');
  const honey = document.getElementById('px-honey');
  const result = document.getElementById('quote-result');
  const resultTitle = document.getElementById('quote-result-title');
  const summary = document.getElementById('quote-summary');
  const newQuote = document.getElementById('quote-new');
  const copyQuote = document.getElementById('quote-copy');
  const copyStatus = document.getElementById('quote-copy-status');
  const fallback = document.getElementById('quote-fallback');
  const draft = document.getElementById('quote-draft');
  const draftEmail = document.getElementById('quote-draft-email');
  const draftCopy = document.getElementById('quote-draft-copy');
  const draftCopyStatus = document.getElementById('quote-draft-copy-status');
  const recipient = 'phonexpress34480@gmail.com';
  if (![status, submit, device, fault, phone, name, email, model, description, privacy,
    honey, result, resultTitle, summary, newQuote, copyQuote, copyStatus,
    fallback, draft, draftEmail, draftCopy, draftCopyStatus].every(Boolean)) return;
  const submitMarkup = submit.innerHTML;
  let sending = false;

  // Clicking a service fills its corresponding problem, avoiding unnecessary typing.
  document.querySelectorAll('[data-problem]').forEach(link => link.addEventListener('click', () => {
    if (sending) return;
    const found = Array.from(fault.options).find(o => o.value === link.dataset.problem);
    if (found) fault.value = found.value;
    if (link.dataset.problem === 'Autre problème' && device) device.value = 'Tablette';
    if (!device.value) device.value = 'Smartphone';
    fault.dispatchEvent(new Event('input', { bubbles: true }));
    device.dispatchEvent(new Event('input', { bubbles: true }));
  }));

  const notify = (message, error = false) => {
    status.textContent = message;
    status.classList.toggle('error', error);
    status.focus({ preventScroll: true });
  };
  const hideFallback = () => {
    fallback.hidden = true;
    draft.value = '';
    draftEmail.removeAttribute('href');
    draftCopyStatus.textContent = '';
  };
  const showFallback = recap => {
    draft.value = recap;
    draftEmail.href = 'mailto:' + recipient
      + '?subject=' + encodeURIComponent('Phone Xpress — Demande de devis')
      + '&body=' + encodeURIComponent(recap);
    draftCopyStatus.textContent = '';
    fallback.hidden = false;
  };
  const copyText = async (source, feedback) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard-unavailable');
      await navigator.clipboard.writeText(source.value);
      feedback.textContent = 'Récapitulatif copié.';
    } catch {
      source.focus();
      source.select();
      feedback.textContent = 'Copiez le texte sélectionné (Ctrl+C ou appui long).';
    }
  };
  copyQuote.addEventListener('click', () => copyText(summary, copyStatus));
  draftCopy.addEventListener('click', () => copyText(draft, draftCopyStatus));
  const clearFeedbackOnEdit = event => {
    if (sending) return;
    event.target.setCustomValidity?.('');
    hideFallback();
    status.textContent = '';
    status.classList.remove('error');
  };
  form.addEventListener('input', clearFeedbackOnEdit);
  form.addEventListener('change', clearFeedbackOnEdit);

  form.addEventListener('submit', async event => {
    // This handler always owns submission, including validation/error paths.
    event.preventDefault();
    if (sending) return;
    hideFallback();
    status.textContent = '';
    status.classList.remove('error');
    [name, phone, email, model, description].forEach(field => {
      field.setCustomValidity('');
      field.value = field.value.trim();
    });
    if (name.value.length < 2) name.setCustomValidity('Indiquez votre nom et prénom.');
    if (!model.value) model.setCustomValidity('Indiquez la marque et le modèle de votre appareil.');
    const digits = phone.value.replace(/\D/g, '');
    if (!/^\+?[\d\s().-]+$/.test(phone.value) || digits.length < 9 || digits.length > 15) {
      phone.setCustomValidity('Indiquez un numéro de téléphone valide, entre 9 et 15 chiffres.');
    }
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.setCustomValidity('Vérifiez votre adresse e-mail.');
    }
    if (!form.reportValidity()) return;
    if (honey.value.trim()) {
      notify('La demande n’a pas pu être validée. Appelez la boutique au 09 88 33 65 81.', true);
      return;
    }

    const recap = [
      'DEMANDE DE DEVIS — PHONE XPRESS',
      'Nom et prénom : ' + name.value,
      'Téléphone : ' + phone.value,
      email.value ? 'E-mail : ' + email.value : null,
      'Type d’appareil : ' + device.value,
      'Marque et modèle : ' + model.value,
      'Nature de la panne : ' + fault.value,
      'Description complémentaire : ' + (description.value || 'Non précisée'),
      'Information données personnelles lue : ' + (privacy.checked ? 'Oui' : 'Non')
    ].filter(Boolean).join('\n');

    // Local/offline previews never send customer data to an external service.
    if (!/^https?:$/.test(location.protocol)) {
      showFallback(recap);
      notify('Mode aperçu local : aucune demande envoyée. Ouvrez le site publié ou utilisez le brouillon e-mail ci-dessous.', true);
      return;
    }
    if (navigator.onLine === false) {
      showFallback(recap);
      notify('Connexion indisponible : aucune demande envoyée. Retrouvez votre brouillon ci-dessous et réessayez une fois en ligne.', true);
      return;
    }
    if (typeof fetch !== 'function' || typeof AbortController !== 'function') {
      showFallback(recap);
      notify('Votre navigateur ne permet pas cet envoi. Utilisez le brouillon e-mail ci-dessous ou appelez la boutique au 09 88 33 65 81.', true);
      return;
    }

    let endpoint;
    try {
      endpoint = new URL(form.action);
      if (endpoint.origin !== 'https://formsubmit.co'
        || decodeURIComponent(endpoint.pathname) !== '/ajax/' + recipient
        || endpoint.search || endpoint.hash) throw new Error('invalid-endpoint');
    } catch {
      showFallback(recap);
      notify('Le formulaire doit être configuré. Utilisez le brouillon e-mail ci-dessous ou appelez la boutique au 09 88 33 65 81.', true);
      return;
    }

    const payload = {};
    new FormData(form).forEach((value, key) => { if (typeof value === 'string') payload[key] = value; });
    payload._subject = 'Phone Xpress — Nouvelle demande de devis';
    payload._template = 'table';
    payload._url = location.href.split('#')[0];
    if (email.value) {
      payload.email = email.value;
      payload._replyto = email.value;
    } else {
      delete payload.email;
      delete payload._replyto;
    }

    sending = true;
    const controls = [...form.querySelectorAll('input, select, textarea, button')]
      .map(control => ({ control, disabled: control.disabled }));
    controls.forEach(({ control }) => { control.disabled = true; });
    submit.querySelector('span').textContent = 'Envoi en cours…';
    form.setAttribute('aria-busy', 'true');
    notify('Envoi de votre demande en cours…');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(endpoint.href, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'omit',
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      let feedback;
      try {
        feedback = await response.json();
      } catch {
        throw new Error('submission-unconfirmed');
      }
      // An activation acknowledgement can itself contain success: true.
      if (feedback && /activate|activation|actived/i.test(String(feedback.message || ''))) {
        throw new Error('activation-required');
      }
      if (!response.ok || !feedback || (feedback.success !== true && feedback.success !== 'true')) {
        throw new Error('submission-unconfirmed');
      }
      summary.value = recap;
      copyStatus.textContent = '';
      form.hidden = true;
      result.hidden = false;
      result.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'nearest' });
      resultTitle.focus({ preventScroll: true });
    } catch (error) {
      showFallback(recap);
      notify(error.message === 'activation-required'
        ? 'Le formulaire attend son activation par la boutique. Vos informations sont conservées ci-dessous. Vous pouvez préparer un e-mail ou appeler le 09 88 33 65 81.'
        : 'L’envoi n’a pas pu être confirmé. Votre demande a peut-être été transmise : vérifiez auprès de la boutique avant de renvoyer pour éviter un doublon. Vos informations et un brouillon e-mail sont conservés ci-dessous.', true);
    } finally {
      clearTimeout(timeout);
      sending = false;
      controls.forEach(({ control, disabled }) => { control.disabled = disabled; });
      submit.innerHTML = submitMarkup;
      form.removeAttribute('aria-busy');
    }
  });

  newQuote.addEventListener('click', () => {
    if (sending) return;
    form.reset();
    form.querySelectorAll('input, select, textarea').forEach(field => field.setCustomValidity(''));
    hideFallback();
    summary.value = '';
    copyStatus.textContent = '';
    status.textContent = '';
    status.classList.remove('error');
    result.hidden = true;
    form.hidden = false;
    name.focus();
  });
  // Enable only once the handler that prevents native navigation is attached.
  submit.disabled = false;
  window.addEventListener('pageshow', () => {
    if (!sending) {
      submit.disabled = false;
      submit.innerHTML = submitMarkup;
    }
  });
})();
