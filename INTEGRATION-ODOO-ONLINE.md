# Phone Xpress V18 — installation sur Odoo Online (navigateur)

**Ce projet est prepare pour Odoo Online, sans module Python ni installation serveur.**
Le ZIP contient `site/` (code complet et medias) ainsi que `integration-odoo/` (code a coller et apercu autonome).

## 1. Solution recommandee : bloc Code integre + iframe HTTPS

1. Publier le CONTENU du dossier `site/` sur un hebergement statique HTTPS public (par exemple GitHub Pages ou Cloudflare Pages). Le fichier `index.html` doit se trouver a la racine du site publie. Verifier que les images apparaissent et que le curseur de reparation repond.
2. Ouvrir `integration-odoo/01-CODE-A-COLLER-ODOO-IFRAME.html` dans un editeur de texte. Remplacer `https://ADRESSE-PUBLIQUE-DE-LA-V18/` par l'adresse HTTPS de cette publication.
3. Dans Odoo, ouvrir **Site Web → Modifier → Blocs → Contenu interne → Integrer du code / Embed Code**. Ajouter le bloc, puis dans ses options choisir **Modifier le code** (l'emplacement precise varie selon Odoo). Coller le code du fichier 01, enregistrer et publier.
4. Donner au bloc la pleine largeur et supprimer l'espacement haut/bas dans l'editeur si possible. Pour eviter deux en-tetes/pieds de page, masquer ceux d'Odoo sur cette page si l'option est disponible.
5. Tester depuis un ordinateur et un mobile, en particulier le formulaire, le glissement iPhone, le menu et le defilement (l'iframe occupe la hauteur de l'ecran pour que le fond fixe et les eclairs suivent bien le viewport).

*Limite :* Le visiteur fait defiler le contenu **a l'interieur de l'iframe**. Les sites avec des iframes ne sont pas ideaux pour le SEO du texte embarque. Pour un site indexable directement dans Odoo, il faut integrer les sections de maniere native et conserver les capacites autorisees par Odoo, ce qui n'est pas garanti par un simple collage.

## 2. Essai alternatif : un seul bloc sans hebergement externe

Dans `integration-odoo/03-TEST-BLOC-UNIQUE-SANS-HEBERGEMENT.html`, toutes les images, CSS et JS sont encapsules dans un iframe `srcdoc` tres volumineux. **C'est uniquement un essai**, pas la methode recommandee : selon la version, les droits et les filtres d'Odoo, l'editeur peut retirer `srcdoc`, certains scripts, les URLs `data:` ou refuser la taille du code. Ne pas remplacer le site public par cet essai sans verification complete.

Le fichier `02-APERCU-AUTONOME-TEST-NAVIGATEUR.html` s'ouvre sans connexion et affiche tout le site (images/animations embarquees). Il sert d'apercu/test, pas d'integration automatique Odoo.

## 3. Compatibilite, performances et points d'attention

- Decor nebuleuse unique et fixe, sans repetitions aux transitions des sections.
- Bords du visuel X fondus en CSS, y compris sur mobile.
- Eclairs cyan discrets dans `assets/js/px-lightning.js`, avec vitesse reduite sur mobile, arret en arriere-plan et desactivation lorsque l'utilisateur demande moins d'animations.
- Le curseur avant/apres, le menu mobile, le shuriken et la bulle d'aide necessitent JavaScript ; l'iframe les conserve en principe.
- Le formulaire conserve son action FormSubmit originale ; un **test d'envoi reel** doit etre effectue apres publication. Verifier l'e-mail d'activation et les messages recus. Le resultat de test n'est pas certifie ici.
- Les pages de confidentialite et de mentions legales doivent etre presentes sur Odoo si la variante `srcdoc` est utilisee. Pour un hebergement HTML complet, elles sont incluses dans `site/`.
- Si Odoo est deja le site principal de `phone-xpress.fr`, heberger cette version a une autre URL publique HTTPS et ne PAS remplacer par erreur la page d'accueil du domaine Odoo.

Documentation officielle des blocs : https://www.odoo.com/documentation/19.0/applications/websites/website/web_design/building_blocks.html
