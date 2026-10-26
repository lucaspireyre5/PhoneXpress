/* Phone Xpress — formulaire V25 compatible Odoo.
   Un seul envoi HTML vers FormSubmit dans un iframe invisible.
   Confirmation uniquement après redirection _next vers notre page témoin.
   Aucune redirection visible, aucun deuxième envoi automatique. */
(() => {
  'use strict';
  const form = document.getElementById('quote-form');
  if (!form || form.dataset.initialized === 'yes') return;
  form.dataset.initialized = 'yes';

  const byId = id => document.getElementById(id);
  const status = byId('quote-status');
  const submit = form.querySelector('[type="submit"]');
  const device = byId('quote-device');
  const fault = byId('quote-fault');
  const phone = byId('quote-phone');
  const name = byId('quote-name');
  const email = byId('quote-email');
  const model = byId('quote-model');
  const description = byId('quote-description');
  const privacy = byId('quote-privacy');
  const honey = byId('px-honey');
  const result = byId('quote-result');
  const resultTitle = byId('quote-result-title');
  const summary = byId('quote-summary');
  const newQuote = byId('quote-new');
  const copyQuote = byId('quote-copy');
  const copyStatus = byId('quote-copy-status');
  const fallback = byId('quote-fallback');
  const draft = byId('quote-draft');
  const draftEmail = byId('quote-draft-email');
  const draftCopy = byId('quote-draft-copy');
  const draftCopyStatus = byId('quote-draft-copy-status');
  const successUrl = byId('px-success-url');
  const sourceUrl = byId('px-source-url');
  const recipient = 'phonexpress34480@gmail.com';
  const necessary = [status, submit, device, fault, phone, name, email, model, description,
    privacy, honey, result, resultTitle, summary, newQuote, copyQuote, copyStatus, fallback,
    draft, draftEmail, draftCopy, draftCopyStatus, successUrl, sourceUrl];
  if (!necessary.every(Boolean)) return;

  let sending = false;
  let pendingToken = null;
  let timer = null;
  let frame = null;
  let lastRecap = '';
  const originalSubmitText = submit.querySelector('span')?.textContent || 'Envoyer ma demande';
  const section = document.getElementById('devis');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const notify = (message, error = false) => {
    status.textContent = message;
    status.classList.toggle('error', error);
  };
  const hideFallback = () => {
    fallback.hidden = true;
    draft.value = '';
    draftCopyStatus.textContent = '';
    draftEmail.removeAttribute('href');
  };
  const showFallback = recap => {
    draft.value = recap;
    draftEmail.href = 'mailto:' + recipient
      + '?subject=' + encodeURIComponent('Phone Xpress — Demande de devis')
      + '&body=' + encodeURIComponent(recap);
    fallback.hidden = false;
  };
  const release = () => {
    sending = false;
    pendingToken = null;
    if (timer) clearTimeout(timer);
    timer = null;
    submit.disabled = false;
    form.removeAttribute('aria-busy');
    const label = submit.querySelector('span');
    if (label) label.textContent = originalSubmitText;
  };
  const copy = async (source, feedback) => {
    try {
      await navigator.clipboard.writeText(source.value);
      feedback.textContent = 'Récapitulatif copié.';
    } catch {
      source.focus(); source.select();
      feedback.textContent = 'Texte sélectionné. Appuyez sur Ctrl+C pour le copier.';
    }
  };
  copyQuote.addEventListener('click', () => copy(summary, copyStatus));
  draftCopy.addEventListener('click', () => copy(draft, draftCopyStatus));

  document.querySelectorAll('[data-problem]').forEach(link => link.addEventListener('click', () => {
    if (sending) return;
    const option = Array.from(fault.options).find(o => o.value === link.dataset.problem);
    if (option) fault.value = option.value;
    if (link.dataset.problem === 'Autre problème') device.value = 'Tablette';
    else if (!device.value) device.value = 'Smartphone';
  }));

  const receiveSuccess = () => {
    if (!sending || !pendingToken) return;
    release();
    hideFallback();
    notify('');
    summary.value = lastRecap;
    copyStatus.textContent = '';
    form.hidden = true;
    result.hidden = false;
    section?.classList.add('quote-is-confirmed');
    result.scrollIntoView({behavior: reduced.matches ? 'auto' : 'smooth', block: 'center'});
    resultTitle.focus({preventScroll:true});
  };

  // Message envoyé uniquement par confirmation-devis.html après la redirection
  // FormSubmit « _next », ce qui indique un retour du service après soumission.
  window.addEventListener('message', event => {
    if (!sending || !frame || event.source !== frame.contentWindow) return;
    const data = event.data;
    if (!data || data.type !== 'PHONE_XPRESS_RECEIPT_V25' || data.token !== pendingToken) return;
    // Permet aussi les pages intégrées par un iframe Odoo avec origine sandboxée.
    if (event.origin !== location.origin && event.origin !== 'null') return;
    receiveSuccess();
  });

  const ensureFrame = () => {
    if (frame) return frame;
    frame = document.createElement('iframe');
    frame.name = 'px-formsubmit-v25';
    frame.title = 'Transmission sécurisée de la demande Phone Xpress';
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    frame.style.cssText = 'position:absolute;width:1px;height:1px;border:0;clip-path:inset(50%);opacity:0;pointer-events:none';
    document.body.appendChild(frame);
    // Repli : lecture de la page de retour, si son script est filtré.
    frame.addEventListener('load', () => {
      if (!sending || !pendingToken) return;
      try {
        const win = frame.contentWindow;
        const meta = win.document.querySelector('meta[name="px-receipt"]');
        const url = new URL(win.location.href);
        if (meta?.content === 'phone-xpress-v25'
          && url.origin === location.origin
          && url.searchParams.get('token') === pendingToken) receiveSuccess();
      } catch { /* Origine distante FormSubmit: aucune confirmation supposée. */ }
    });
    return frame;
  };

  form.addEventListener('input', event => {
    if (sending) return;
    event.target.setCustomValidity?.('');
    hideFallback();
    notify('');
  });

  // Bloque toute soumission native incontrôlée, y compris dans une iframe Odoo.
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (sending) return;
    hideFallback();
    notify('');
    for (const field of [name, phone, email, model, description]) {
      field.setCustomValidity('');
      field.value = field.value.trim();
    }
    if (name.value.length < 2) name.setCustomValidity('Indiquez votre nom et prénom.');
    if (!model.value) model.setCustomValidity('Indiquez la marque et le modèle.');
    const digits = phone.value.replace(/\D/g, '');
    if (!/^\+?[\d\s().-]+$/.test(phone.value) || digits.length < 9 || digits.length > 15) {
      phone.setCustomValidity('Indiquez un numéro valide (9 à 15 chiffres).');
    }
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.setCustomValidity('Vérifiez votre adresse e-mail.');
    }
    if (!form.reportValidity()) return;
    if (honey.value.trim()) { notify('Le formulaire n’a pas pu être validé.', true); return; }

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

    if (!['http:', 'https:'].includes(location.protocol) || navigator.onLine === false) {
      showFallback(recap);
      notify('Vous êtes hors ligne ou en aperçu local : aucun e-mail envoyé. Vous pouvez conserver votre demande ci-dessous.', true);
      return;
    }

    // La destination n'est activée par JS que lorsque le gestionnaire est prêt.
    // POST classique (comme le formulaire qui envoyait déjà les e-mails), mais
    // dans un iframe invisible avec une URL de retour contrôlée (_next).
    let endpoint;
    try {
      endpoint = new URL(form.dataset.endpoint || '');
      if (endpoint.origin !== 'https://formsubmit.co'
          || decodeURIComponent(endpoint.pathname) !== '/' + recipient
          || endpoint.search || endpoint.hash) throw Error('endpoint');
    } catch {
      showFallback(recap);
      notify('Le destinataire n’est pas correctement configuré. Contactez Phone Xpress.', true);
      return;
    }

    const token = window.crypto?.randomUUID?.() || String(Date.now()) + '-' + Math.random().toString(36).slice(2);
    const receipt = new URL('confirmation-devis.html', location.href);
    receipt.hash = '';
    receipt.search = new URLSearchParams({token}).toString();
    successUrl.value = receipt.href;
    sourceUrl.value = location.href.split('#')[0];
    if (email.value) {
      let reply = form.querySelector('input[name="_replyto"]');
      if (!reply) { reply = document.createElement('input'); reply.type = 'hidden'; reply.name = '_replyto'; form.appendChild(reply); }
      reply.value = email.value;
    }

    frame = ensureFrame();
    form.action = endpoint.href;
    form.target = frame.name;
    lastRecap = recap;
    pendingToken = token;
    sending = true;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    const label = submit.querySelector('span');
    if (label) label.textContent = 'Envoi en cours…';
    notify('Transmission de votre demande en cours…');
    // AUCUN AJAX : évite le blocage réseau/CORS qui affichait la bannière rouge.
    // La confirmation n'apparaît que lorsque la page de retour a été atteinte.
    try {
      HTMLFormElement.prototype.submit.call(form);
    } catch {
      release(); showFallback(recap);
      notify('Impossible de lancer l’envoi. Votre demande est conservée ci-dessous.', true);
      return;
    }
    timer = setTimeout(() => {
      if (!sending) return;
      release();
      showFallback(lastRecap);
      notify('Nous n’avons pas reçu la confirmation de FormSubmit. L’envoi a peut-être abouti : vérifiez auprès de Phone Xpress avant tout nouvel essai.', true);
    }, 30000);
  });

  newQuote.addEventListener('click', () => {
    if (sending) return;
    form.reset();
    [name, phone, email, model, description].forEach(field => field.setCustomValidity(''));
    hideFallback();
    notify('');
    summary.value = '';
    copyStatus.textContent = '';
    result.hidden = true;
    form.hidden = false;
    section?.classList.remove('quote-is-confirmed');
    name.focus();
  });

  // L'envoi reste désactivé si ce JS ne charge pas : évite un Thanks! externe.
  submit.disabled = false;
})();
