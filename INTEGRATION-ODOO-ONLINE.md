# V23 — Formulaire sans redirection dans Odoo

Le site reste intégré dans Odoo avec son iframe actuel. Le formulaire utilise
maintenant l'interface AJAX de FormSubmit : son envoi et sa confirmation se
déroulent dans la page, sans ouvrir une page FormSubmit.

Le destinataire reste **phonexpress34480@gmail.com**. Aucun envoi ne passe par
la messagerie personnelle du propriétaire du site.

## Mettre cette version en ligne

Remplacez les fichiers à l'endroit où le contenu de l'iframe est hébergé
(par exemple le dépôt GitHub Pages déjà utilisé). Conservez la même adresse
pour que le bloc Odoo existant continue à afficher le site. Les fichiers
modifiés sont `index.html`, `assets/js/site.js`, `assets/css/site.css`,
`confidentialite.html` et les références de cache de `mentions-legales.html`.

Conservez les boutons téléphone et itinéraire natifs déjà placés dans Odoo
à l'extérieur de l'iframe. Aucun changement du décor ou des animations
n'est nécessaire.

L'iframe doit permettre l'exécution des scripts. Une éventuelle politique
de sécurité doit autoriser les connexions à `https://formsubmit.co`.
Si vous utilisez un attribut `sandbox`, conservez les autorisations requises
par l'intégration actuelle ; l'ouverture facultative du brouillon dans une
messagerie nécessite aussi que les fenêtres externes puissent s'ouvrir.
Le bouton de copie reste disponible si cette ouverture est bloquée.

## Vérifier l'envoi

Depuis le site publié dans Odoo, effectuez une demande de test, puis vérifiez
sa réception dans **phonexpress34480@gmail.com**, y compris les indésirables.
Si FormSubmit demande une activation, le propriétaire de cette boîte doit
valider son e-mail d'activation. Cette étape n'est pas remplacée par le code.

En cas d'erreur, les champs restent remplis et aucun renvoi automatique
n'est effectué. L'utilisateur peut copier la demande ou préparer un brouillon
à envoyer lui-même. Le résultat positif signifie que FormSubmit a accepté
la demande pour acheminement, sans garantir sa présence en boîte de réception.

La version reste statique et ne contient pas de serveur PHP à installer
dans Odoo. Documentation : [FormSubmit AJAX](https://formsubmit.co/ajax-documentation).
