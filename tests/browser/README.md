# Regressions navigateur

Les API et identites sont simulees. Aucun candidat reel ni envoi email n'est
necessaire. Node 22 et Chromium sont requis:

```bash
npm ci
npx playwright install chromium
npm run test:styles
npm run build
ODC_BROWSER_START_SERVER=1 npm run test:online
ODC_BROWSER_START_SERVER=1 npm run test:portal
ODC_BROWSER_START_SERVER=1 npm run test:home
ODC_BROWSER_START_SERVER=1 npm run test:home-motion
ODC_BROWSER_START_SERVER=1 npm run test:home-story
ODC_BROWSER_START_SERVER=1 npm run test:header
ODC_BROWSER_START_SERVER=1 npm run test:site-motion
ODC_BROWSER_START_SERVER=1 npm run test:candidature-access
ODC_BROWSER_START_SERVER=1 npm run test:candidates
ODC_BROWSER_START_SERVER=1 npm run test:admin
```

Dans PowerShell, definir `$env:ODC_BROWSER_START_SERVER="1"` avant les commandes.
Sans cette variable, les parcours utilisent un serveur deja lance sur
`http://127.0.0.1:3101`. Le port peut etre modifie via `ODC_BROWSER_BASE_URL`.
`PLAYWRIGHT_CHROMIUM_EXECUTABLE` permet d'utiliser un Chrome local deja installe.

- `styles`: contrat de 156 rendus (26 elements, 3 largeurs, clair/sombre), plus
  verification du focus accessible en mode contraste force. Les valeurs de
  reference sont issues de Tailwind 3.4.19, avant migration; ne pas les
  regenerer simplement pour faire passer une regression.
- `online`: autosave avec chronometre, expiration unique, resultat confirme
  malgre une panne secondaire, coupure a la soumission et nouvelle tentative.
- `portal`: accueil, connexion admin, trois candidatures, tableau jury et
  dialogue coach en mobile et desktop. `ODC_SCREENSHOT_DIR` permet de conserver
  les captures hors du depot pour une comparaison visuelle.
- `candidates`: pages serveur, recherche avec remise a la premiere page,
  navigation pendant le chargement des statistiques, details a la demande,
  exports CSV/XLSX complets et reprise apres erreur.
- `admin`: chargement par onglet, recherche serveur dans les resultats et
  sessions, export filtre, selection paginee des candidats d'un groupe,
  notifications et reprise apres erreur.
- `home`: accueil responsive de 320 a 1440 pixels, premier ecran adaptable,
  campagne dynamique, carrousel manuel au clavier, menu mobile, temoignages,
  logos partenaires, bannieres du CM, texte agrandi a 200 %, theme sombre et
  affichage de secours si une API est indisponible.
- `candidature-access`: boutons partages, campagne ouverte/fermee/a venir,
  indisponibilite API, acces direct au formulaire bloque hors campagne,
  revalidation au clic et conservation des champs si la campagne ferme.
- `home-motion`: degrade orange, transitions du carrousel manuel et retour de
  navigation reel Next.js, fondu prolonge, sortie du texte, mots decales,
  navigation rapide sans file d'attente et apparitions au scroll sur l'accueil,
  cadrage de la photo principale sans deplacer les textes, titres masques par
  mots, relief photo sans deplacer les liens, navigation tactile, avec et sans
  reduction des animations (y compris un changement de preference a chaud).
- `site-motion`: bannieres partagees sur huit pages en mobile et desktop,
  apparitions au defilement non repetees, survol des cartes, ouverture des
  formations, reduction des animations, conservation des champs de formulaire
  et lisibilite sans JavaScript. Les animations ne remontent pas les pages et
  ne s'appliquent pas aux sessions chronometrees ni aux tableaux administratifs.
- `header`: contraction horizontale vers une capsule centree, nom du centre,
  hauteur constante et absence de saut de page, menu accessible au clavier,
  navigation et fermeture hors du menu, retour a pleine largeur en haut,
  mouvement progressif de plus d'une seconde et inversion rapide sans attente,
  de 320 a 1440 pixels, avec et sans reduction des animations.
- `home-story`: grands panneaux des programmes, superposition reelle pendant
  le scroll, introduction animee finie, retour statique sans animations,
  nouvelle section impact, valeurs completes et texte agrandi a 200 %,
  temoignages manuels a hauteur stable et mur des 16 logos originaux.

Le theme conserve la palette sRGB et les espacements historiques. Pour les
nouveaux composants, preferer `flex`/`grid` avec `gap` aux marges `space-*`.
Tailwind 4 requiert Safari 16.4+, Chrome 111+ ou Firefox 128+; valider ce perimetre
avec l'equipe avant la mise en production nationale. La recette des vraies
donnees et les essais de charge sur l'infrastructure cible restent distincts.
