# V22 — Version intégrée uniquement dans Odoo Online

La page GitHub n'est qu'une source d'assets et d'iframe ; ses boutons
téléphone et itinéraire ont été retirés (ainsi que l'ancienne page d'appel).

Le code à coller dans le bloc **Intégrer du code** d'Odoo est dans
`../integration-odoo/01-CODE-ODOO-BOUTONS-NATIFS.html`.
Il crée un iframe pleine largeur et deux liens **en dehors de l'iframe**.

Aucun JavaScript côté Odoo n'est nécessaire. Odoo peut filtrer le CSS personnalisé ;
si c'est le cas, utiliser 2 blocs Bouton Odoo avec les mêmes liens.

Formulaire : `phonexpress34480@gmail.com` via FormSubmit ;
tester la réception après mise en ligne et valider FormSubmit si demandé.
