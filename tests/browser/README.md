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

Le theme conserve la palette sRGB et les espacements historiques. Pour les
nouveaux composants, preferer `flex`/`grid` avec `gap` aux marges `space-*`.
Tailwind 4 requiert Safari 16.4+, Chrome 111+ ou Firefox 128+; valider ce perimetre
avec l'equipe avant la mise en production nationale. La recette des vraies
donnees et les essais de charge sur l'infrastructure cible restent distincts.
