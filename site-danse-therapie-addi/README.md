# Élan Créatif — site danse-thérapie ADDI & médiation créative

Site statique (Eleventy), gratuit à héberger, dont **tout le contenu texte se modifie depuis une Google Sheet** — comme Base44 — sans toucher au code. Les images se déposent dans le dossier `/images`.

## En bref, comment ça marche

```
Google Sheet (votre contenu)  →  build Eleventy  →  site statique  →  Netlify (gratuit)
```

À chaque modification de la Sheet (ou des images/du code), vous relancez juste un déploiement sur Netlify — automatique si le dépôt est connecté à GitHub.

---

## 1. Installer et tester en local

```bash
npm install
npm start        # site consultable sur http://localhost:8080, contenu de secours local
npm run build     # génère le site dans _site/
```

Sans `GOOGLE_SHEET_ID` défini, le site se construit avec le contenu d'exemple présent dans `local-data/contenu.sample.json` — ça n'est jamais bloquant.

## 2. Créer votre Google Sheet

Créez une feuille avec un onglet nommé **contenu** et ces colonnes exactement :

| id | type | titre | slug | resume | contenu | image | ordre | publication | datePublication |
|----|------|-------|------|--------|---------|-------|-------|-------------|------------------|
| 1  | page | Danse-thérapie ADDI | danse-therapie-addi | Résumé court | Texte complet (le HTML simple est accepté : `<p>`, `<strong>`, etc.) | /images/addi.jpg | 1 | oui | |
| 3  | article | Titre de l'article | slug-de-larticle | Résumé | Texte complet | /images/x.jpg | 1 | oui | 2026-07-01 |

- **type** : `page` (génère une page autonome, ex. `/danse-therapie-addi/`) ou `article` (génère un article de blog sous `/blog/...`).
- **slug** : la partie de l'URL — uniquement lettres minuscules, chiffres et tirets.
- **publication** : mettez `oui` pour publier une ligne, autre chose (ou vide) pour la garder en brouillon.
- **ordre** : un nombre, pour contrôler l'ordre d'affichage.

Vous pouvez ajouter des colonnes si besoin (ex. `prix`, `duree`) : elles seront simplement ignorées par le site tant que vous ne les utilisez pas dans un template.

**Important — partage de la feuille :** Fichier → Partager → "Tous les utilisateurs disposant du lien" → Lecteur. (Pas besoin de "Publier sur le Web" : le site interroge directement l'API de visualisation de Google, qui gère correctement les virgules et sauts de ligne dans vos textes — contrairement à un export CSV brut.)

Récupérez l'ID de la feuille dans son URL :
`https://docs.google.com/spreadsheets/d/`**`CET_ID_ICI`**`/edit`

## 3. Déployer sur Netlify (gratuit)

1. Poussez ce projet sur un dépôt GitHub.
2. Sur [netlify.com](https://netlify.com) → **Add new site → Import an existing project** → choisissez le dépôt.
3. Netlify détecte automatiquement `netlify.toml` (commande `npm run build`, dossier `_site`).
4. Dans **Site settings → Environment variables**, ajoutez :
   - `GOOGLE_SHEET_ID` = l'ID récupéré à l'étape 2
   - `URL` = l'URL Netlify de votre site (ou votre nom de domaine une fois configuré)
5. Déployez. À chaque modification poussée sur GitHub, ou chaque nouveau déploiement manuel, Netlify relit votre Google Sheet à jour.

Pour republier après une simple modification de la Sheet (sans toucher au code) : **Deploys → Trigger deploy → Deploy site** dans Netlify. Ça prend 30 secondes et ne vous coûte rien.

## 4. Ajouter des images

1. Glissez votre photo dans le dossier `/images` (interface web GitHub : "Add file → Upload files").
2. Dans la Google Sheet, indiquez le chemin dans la colonne `image` : `/images/mon-fichier.jpg`.
3. C'est tout — le site génère automatiquement plusieurs tailles et les formats WebP/JPEG, avec chargement différé (voir `images/README-images.txt`).

## 5. Personnaliser les couleurs, polices, coordonnées

Tout se trouve dans **`_data/site.js`** : nom du site, accroche, e-mail, ville, et les 7 couleurs du système de design. Changez une valeur ici, elle se répercute partout (CSS, balises meta, données structurées) au prochain build. Vous n'avez jamais besoin de toucher au CSS pour un changement de teinte.

## 6. Continuer à faire évoluer le site

- **Nouvelle page** ("Tarifs", "Formations"...) : ajoutez une ligne `type: page` dans la Sheet — elle apparaît automatiquement dans le menu et génère sa propre URL.
- **Nouvel article de blog** : une ligne `type: article`.
- **Design/structure** (nouvelle section, mise en page différente) : ça, ça reste du code — revenez vers Claude (ou un développeur) avec ce projet et vos demandes précises. La structure ci-dessous vous permet de repérer facilement quoi modifier.

## Arborescence du projet

```
danse-therapie-site/
├── eleventy.config.js       configuration Eleventy + shortcode image
├── netlify.toml              configuration de déploiement Netlify
├── _data/
│   ├── site.js                identité, couleurs, polices (à personnaliser)
│   ├── contenu.js, pages.js, articles.js   exposent le contenu de la Sheet
│   └── annee.js
├── lib/googleSheet.js        récupération + repli local du contenu
├── local-data/contenu.sample.json   contenu de secours (mode hors-ligne/local)
├── _includes/
│   ├── layouts/base.njk
│   └── partials/  (tête, en-tête, pied de page, JSON-LD, motif-signature)
├── css/style.njk              feuille de style (générée depuis site.js)
├── js/main.js                  menu mobile, apparitions au scroll, trait animé
├── index.njk, a-propos.njk, contact.njk, blog.njk, article.njk,
│   page-dynamique.njk, mentions-legales.njk, politique-confidentialite.njk
└── images/
```

## SEO / visibilité pour les moteurs de recherche IA

- Données structurées (JSON-LD) : `WebSite`, `LocalBusiness`, `Service` (pages), `Article` (blog), `FAQPage`.
- `sitemap.xml` généré automatiquement à partir de toutes les pages réellement construites.
- `robots.txt` et `humans.txt` inclus.
- Pensez à remplacer l'URL d'exemple dans `robots.txt` et `_data/site.js` par votre vraie URL une fois le domaine choisi.

## Accessibilité

- Lien d'évitement, focus clavier visible (contour couleur dédiée), navigation mobile au clavier.
- Contrastes du système de couleurs vérifiés (texte/fond ≥ 4.5:1, boutons ≥ 3:1 pour les composants d'interface).
- Toutes les images demandent un texte alternatif ; le build échoue volontairement si vous en oubliez un.
- Animations désactivées automatiquement si la personne a activé "Réduire les animations" dans son système.

## Ce qui reste à compléter

Cherchez `[À compléter]` dans `a-propos.njk`, `mentions-legales.njk` et `politique-confidentialite.njk`, et remplissez votre contenu réel (parcours, SIRET, etc.) directement dans ces fichiers ou en me les redonnant à modifier.
