/* Phone Xpress V26 — envoi officiel FormSubmit AJAX (sans redirection).
   Confirmation seulement si le service renvoie success === true ou "true".
   Ne jamais relancer automatiquement : en cas de problème réseau,
   une requête pourrait déjà avoir été traitée. Compatible iframe Odoo. */
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
  const sourceUrl = byId('px-source-url');
  const recipient = 'phonexpress34480@gmail.com';
  const necessary = [status, submit, device, fault, phone, name, email, model, description,
    privacy, honey, result, resultTitle, summary, newQuote, copyQuote, copyStatus, fallback,
    draft, draftEmail, draftCopy, draftCopyStatus, sourceUrl];
  if (!necessary.every(Boolean)) return;

  let sending = false;
  const section = byId('devis');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const textLabel = submit.querySelector('span');
  const originalSubmitText = textLabel?.textContent || 'Envoyer ma demande';

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
  const setSending = value => {
    sending = value;
    submit.disabled = value;
    if (value) form.setAttribute('aria-busy', 'true');
    else form.removeAttribute('aria-busy');
    if (textLabel) textLabel.textContent = value ? 'Envoi en cours…' : originalSubmitText;
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

  form.addEventListener('input', event => {
    if (sending) return;
    event.target.setCustomValidity?.('');
    hideFallback();
    notify('');
  });

  form.addEventListener('submit', async event => {
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
      notify('Connexion indisponible ou aperçu local : aucun envoi n’a été tenté. Vous pouvez conserver votre demande ci-dessous.', true);
      return;
    }

    // Le formulaire HTML garde l'action POST classique pour référence ;
    // l'API AJAX dédiée est la méthode officiellement prise en charge sans redirection.
    let url;
    try {
      const endpoint = new URL(form.dataset.endpoint || form.action);
      if (endpoint.origin !== 'https://formsubmit.co'
          || decodeURIComponent(endpoint.pathname) !== '/' + recipient
          || endpoint.search || endpoint.hash) throw Error('invalid endpoint');
      url = endpoint.origin + '/ajax/' + encodeURIComponent(recipient);
    } catch {
      showFallback(recap);
      notify('La destination du formulaire est incorrecte. Contactez Phone Xpress.', true);
      return;
    }

    sourceUrl.value = location.href.split('#')[0];
    const payload = Object.fromEntries(new FormData(form).entries());
    // AJAX ignore _next ; _replyto aide Thomas à répondre directement au visiteur.
    delete payload._next;
    if (!email.value) delete payload.email;
    if (email.value) payload._replyto = email.value;

    setSending(true);
    notify('Transmission de votre demande en cours…');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 22000);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      let data;
      try { data = await response.json(); }
      catch { throw new Error('invalid-response'); }
      // FormSubmit utilise parfois des chaînes : "false" doit rester un échec.
      const accepted = response.ok && (data?.success === true || data?.success === 'true');
      if (!accepted) {
        const message = String(data?.message || '');
        showFallback(recap);
        if (/activat|confirm.*(mail|email|adresse)/i.test(message)) {
          notify('FormSubmit demande l’activation de cette adresse e-mail. Ouvrez le message d’activation reçu sur la boîte Phone Xpress.', true);
        } else {
          notify('FormSubmit n’a pas confirmé l’envoi. Votre demande est conservée ci-dessous ; vérifiez la configuration ou contactez Phone Xpress.', true);
        }
        return;
      }

      hideFallback();
      notify('');
      summary.value = recap;
      copyStatus.textContent = '';
      form.hidden = true;
      result.hidden = false;
      section?.classList.add('quote-is-confirmed');
      result.scrollIntoView({behavior: reduced.matches ? 'auto' : 'smooth', block: 'center'});
      resultTitle.focus({preventScroll:true});
    } catch {
      showFallback(recap);
      notify('Impossible de vérifier la réponse de FormSubmit (réseau ou navigateur). L’envoi a peut-être abouti : vérifiez sa réception avant un nouvel essai pour éviter les doublons.', true);
    } finally {
      clearTimeout(timeout);
      setSending(false);
    }
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

  // Une erreur de chargement de ce script ne doit pas provoquer un POST non contrôlé.
  submit.disabled = false;
})();
