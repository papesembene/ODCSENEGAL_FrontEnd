# Frontend US 00 a 24

Format simple a copier dans GitHub:

- Titre
- Objectif
- Contexte
- Travail attendu
- Fichiers principaux
- Criteres de sortie

## US00 - Mettre en place le cadre de stabilisation frontend

Objectif:
Organiser le travail frontend pour eviter les conflits et suivre les corrections.

Contexte:
Le projet continue a evoluer et doit etre stabilise en equipe avec une methode claire.

Travail attendu:
- creer ou mettre a jour le board GitHub
- creer ou mettre a jour les labels
- creer ou mettre a jour les issues de stabilisation
- definir la branche de travail commune et les regles de merge

Fichiers principaux:
- documentation sprint
- configuration GitHub

Criteres de sortie:
- board pret
- labels prets
- issues pretes
- methode de travail claire

## US01 - Reactiver le build strict du frontend

Objectif:
Empecher que des erreurs de build passent silencieusement.

Contexte:
Le frontend autorisait un build permissif avec des erreurs TypeScript et ESLint ignorees.

Travail attendu:
- retirer les options qui ignorent les erreurs importantes
- verifier la coherence de la configuration frontend

Fichiers principaux:
- frontend/next.config.mjs
- frontend/package.json

Criteres de sortie:
- le build n ignore plus les erreurs critiques
- la configuration est coherente avec une phase de stabilisation

## US02 - Securiser la connexion administration

Objectif:
Rendre le flux admin plus coherent cote frontend.

Contexte:
L espace admin dependait trop de localStorage et de admin_authenticated.

Travail attendu:
- utiliser admin_token comme signal frontend minimal
- nettoyer login et logout admin
- harmoniser la protection des pages admin

Fichiers principaux:
- frontend/app/astrodmin/page.jsx
- frontend/app/astrodmin/layout.jsx
- frontend/app/hooks/useAdminApi.js
- frontend/app/astrodmin/*

Criteres de sortie:
- connexion admin fonctionnelle
- redirection protegees correctes
- deconnexion propre

## US03 - Unifier les URLs API et l environnement

Objectif:
Avoir une seule logique d URL backend dans le frontend.

Contexte:
Le projet melangeait localhost, URL prod et variables d environnement.

Travail attendu:
- remplacer les URLs codees en dur
- utiliser NEXT_PUBLIC_API_URL comme source de verite
- verifier les pages publiques touchees

Fichiers principaux:
- frontend/app/contexts/AuthContext.jsx
- frontend/app/odc/candidatures/page.jsx
- frontend/app/startups/evenements/page.jsx
- frontend/app/startups/programmes/coworking/page.jsx
- frontend/app/page.jsx
- frontend/app/startups/page.jsx

Criteres de sortie:
- plus d URL backend codee en dur dans les fichiers corriges
- logique API coherente en local et en production

## US04 - Supprimer les routes mock du frontend

Objectif:
Enlever les routes Next temporaires ou ambiguës.

Contexte:
Certaines routes donnaient une architecture confuse entre mock et vrai backend.

Travail attendu:
- identifier les routes mock non utilisees
- supprimer les routes inutiles
- clarifier les flux reels

Fichiers principaux:
- frontend/app/api/auth/profile/route.ts
- frontend/app/api/auth/google/route.js
- frontend/app/api/admin/check-auth/route.js

Criteres de sortie:
- plus de routes mock inutiles dans le frontend

## US05 - Stabiliser le formulaire candidature ODC

Objectif:
Reduire le risque de maintenance sur le formulaire ODC sans changer le metier.

Contexte:
La page etait tres grosse et melangeait UI, constantes, validations et helpers.

Travail attendu:
- extraire les constantes
- extraire les validations
- extraire les helpers de saisie
- alleger la page principale
- verifier le formulaire manuellement

Fichiers principaux:
- frontend/app/odc/candidatures/page.jsx
- frontend/app/odc/candidatures/constants.js
- frontend/app/odc/candidatures/validation.js
- frontend/app/odc/candidatures/input-helpers.js

Criteres de sortie:
- formulaire charge
- comportement identique
- fichier principal allege

## US06 - Extraire les constantes du formulaire candidature Startup

Objectif:
Sortir les donnees statiques du formulaire Startup.

Contexte:
La page startup contient trop de listes et de configuration dans un seul fichier.

Travail attendu:
- deplacer regions, indicatifs, secteurs, roles, diplomes, formes juridiques
- deplacer les regles de fichiers et donnees statiques vers un fichier dedie

Fichiers principaux:
- frontend/app/startups/candidature/page.jsx
- frontend/app/startups/candidature/constants.js

Criteres de sortie:
- les constantes ne sont plus definies dans page.jsx
- le formulaire se comporte comme avant

## US07 - Extraire les constantes du formulaire candidature Orange Fab

Objectif:
Sortir les donnees statiques du formulaire Orange Fab.

Contexte:
La page Orange Fab est tres grosse et melange UI, logique et donnees statiques.

Travail attendu:
- deplacer toutes les listes, options et regles statiques
- creer un fichier constants.js dedie

Fichiers principaux:
- frontend/app/startups/candidature/orange-fab/page.jsx
- frontend/app/startups/candidature/orange-fab/constants.js

Criteres de sortie:
- les donnees statiques sont externalisees
- le comportement reste identique

## US08 - Extraire les validations et helpers du formulaire candidature Startup

Objectif:
Separer la logique metier de validation et de saisie du rendu.

Contexte:
La page startup contient trop de logique directe dans page.jsx.

Travail attendu:
- creer validation.js
- creer input-helpers.js
- brancher la page dessus sans changer le comportement

Fichiers principaux:
- frontend/app/startups/candidature/page.jsx
- frontend/app/startups/candidature/validation.js
- frontend/app/startups/candidature/input-helpers.js

Criteres de sortie:
- validations externalisees
- helpers externalises
- comportement inchange

## US09 - Extraire les validations et helpers du formulaire candidature Orange Fab

Objectif:
Separer la logique metier de validation et de saisie du rendu Orange Fab.

Contexte:
La page Orange Fab est difficile a maintenir telle quelle.

Travail attendu:
- creer validation.js
- creer input-helpers.js
- brancher la page dessus sans changer le comportement

Fichiers principaux:
- frontend/app/startups/candidature/orange-fab/page.jsx
- frontend/app/startups/candidature/orange-fab/validation.js
- frontend/app/startups/candidature/orange-fab/input-helpers.js

Criteres de sortie:
- logique mieux separee
- page plus lisible
- comportement inchange

## US10 - Alleger la page principale du formulaire candidature Startup

Objectif:
Reduire la taille et la complexite de page.jsx startup.

Contexte:
Meme apres extraction des constantes et validations, la page restera dense.

Travail attendu:
- nettoyer la structure
- retirer le code mort ou redondant
- simplifier le rendu sans casser le metier

Fichiers principaux:
- frontend/app/startups/candidature/page.jsx

Criteres de sortie:
- page plus legere
- test manuel OK
- aucune regression visible

## US11 - Alleger la page principale du formulaire candidature Orange Fab

Objectif:
Reduire la taille et la complexite de page.jsx Orange Fab.

Contexte:
La page Orange Fab est un des plus gros points chauds du frontend.

Travail attendu:
- nettoyer la structure
- retirer le code mort ou redondant
- simplifier le rendu sans casser le metier

Fichiers principaux:
- frontend/app/startups/candidature/orange-fab/page.jsx

Criteres de sortie:
- page plus legere
- test manuel OK
- aucune regression visible

## US12 - Stabiliser l espace admin des tests

Objectif:
Alleger et decouper la grosse page admin des tests.

Contexte:
Cette page est un point chaud du frontend et devient difficile a maintenir.

Travail attendu:
- extraire la logique reusable
- simplifier la page
- verifier que le comportement admin reste identique

Fichiers principaux:
- frontend/app/astrodmin/competences/tests/page.jsx

Criteres de sortie:
- page plus lisible
- meme comportement

## US13 - Securiser le rendu HTML riche

Objectif:
Reduire le risque XSS sur les contenus HTML rendus dans le frontend.

Contexte:
Le rendu HTML riche etait un point sensible du projet.

Travail attendu:
- verifier le composant de rendu riche
- sanitiser ou encadrer le rendu
- verifier les pages qui l utilisent

Fichiers principaux:
- frontend/components/ui/rich-text-display.tsx
- frontend/app/test/[testId]/page.jsx
- frontend/app/astrodmin/competences/tests/page.jsx

Criteres de sortie:
- affichage securise
- rendu non casse

## US14 - Stabiliser la couche auth utilisateur

Objectif:
Corriger les incoherences entre contexte auth et pages profil.

Contexte:
Le frontend utilisateur presentait des incoherences de contrat et de fonctions exposees.

Travail attendu:
- harmoniser les fonctions du contexte auth
- verifier la page profil
- nettoyer les appels incoherents

Fichiers principaux:
- frontend/app/contexts/AuthContext.jsx
- frontend/app/profile/page.jsx

Criteres de sortie:
- API auth coherente
- flux profil stable

## US15 - Centraliser les appels API publics du frontend

Objectif:
Eviter les fetch disperses dans les pages publiques.

Contexte:
Les appels reseau etaient trop disperses dans plusieurs pages.

Travail attendu:
- identifier les appels repetes
- creer des helpers ou services dedies
- brancher les pages publiques sur ces helpers

Fichiers principaux:
- frontend/app/page.jsx
- frontend/app/startups/evenements/page.jsx
- frontend/app/startups/page.jsx
- frontend/app/lib/*

Criteres de sortie:
- logique API publique centralisee
- moins de duplication

## US16 - Centraliser les appels API admin du frontend

Objectif:
Homogeneiser les appels admin et reduire la duplication.

Contexte:
La logique admin API reste encore trop dispersee.

Travail attendu:
- centraliser les appels admin
- utiliser un helper unique la ou c est possible
- verifier les pages admin principales

Fichiers principaux:
- frontend/app/hooks/useAdminApi.js
- frontend/app/astrodmin/*

Criteres de sortie:
- logique admin API plus centralisee

## US17 - Harmoniser les erreurs, loaders et messages succes des formulaires

Objectif:
Rendre les formulaires publics plus coherents visuellement et fonctionnellement.

Contexte:
Les messages et loaders varient trop selon les formulaires.

Travail attendu:
- harmoniser les messages d erreur
- harmoniser les loaders
- harmoniser les messages de succes

Fichiers principaux:
- frontend/app/odc/candidatures/page.jsx
- frontend/app/startups/candidature/page.jsx
- frontend/app/startups/candidature/orange-fab/page.jsx

Criteres de sortie:
- experience plus coherente sur tous les formulaires

## US18 - Reduire le client-side sur les pages informatives

Objectif:
Limiter l usage inutile de use client.

Contexte:
Le frontend utilise trop de pages client-only alors que certaines peuvent etre allegees.

Travail attendu:
- identifier les pages purement informatives
- retirer use client la ou il n est pas necessaire
- verifier le rendu

Fichiers principaux:
- frontend/app/layout.jsx
- pages informatives dans frontend/app

Criteres de sortie:
- moins de pages client-only
- pas de regression visible

## US19 - Alleger le layout global frontend

Objectif:
Reduire ce qui est charge partout et ameliorer le confort global.

Contexte:
Le layout global reste trop charge pour un site de cette taille.

Travail attendu:
- revoir ce qui est rendu globalement
- limiter les blocs non essentiels partout
- verifier le rendu global

Fichiers principaux:
- frontend/app/layout.jsx
- frontend/components/header.jsx

Criteres de sortie:
- layout global plus leger
- rendu global coherent

## US20 - Fiabiliser les uploads du formulaire Startup

Objectif:
Securiser validation, types de fichiers et retours utilisateur sur les uploads startup.

Contexte:
Les uploads sont des points de friction classiques et doivent etre fiables.

Travail attendu:
- verifier validations de type et taille
- verifier les messages utilisateur
- verifier les cas d erreur

Fichiers principaux:
- frontend/app/startups/candidature/page.jsx

Criteres de sortie:
- uploads CV et pitch deck stables
- messages clairs

## US21 - Fiabiliser les uploads du formulaire Orange Fab

Objectif:
Faire le meme travail de durcissement sur Orange Fab.

Contexte:
Les uploads Orange Fab doivent etre fiables avant de poursuivre d autres evolutions.

Travail attendu:
- verifier validations de type et taille
- verifier les messages utilisateur
- verifier les cas d erreur

Fichiers principaux:
- frontend/app/startups/candidature/orange-fab/page.jsx

Criteres de sortie:
- uploads stables
- messages clairs

## US22 - Documenter l environnement frontend local

Objectif:
Rendre le demarrage local plus clair pour l equipe.

Contexte:
Le projet a besoin d une base de documentation plus nette pour l environnement local.

Travail attendu:
- documenter les variables d environnement
- documenter le demarrage frontend
- documenter les pre requis minimaux

Fichiers principaux:
- frontend/.env.local.example
- README frontend ou documentation projet

Criteres de sortie:
- variables d environnement documentees
- demarrage local documente

## US23 - Ecrire le protocole de test manuel frontend

Objectif:
Avoir une fiche de QA simple avant chaque merge important.

Contexte:
Le projet depend fortement de tests manuels sur les parcours critiques.

Travail attendu:
- lister les parcours a verifier
- structurer la fiche de test
- couvrir admin, ODC, Startup et Orange Fab

Fichiers principaux:
- document de tests manuels frontend

Criteres de sortie:
- checklist claire
- checklist reutilisable

## US24 - Definir la checklist de release frontend

Objectif:
Cadrer les verifications avant mise en production.

Contexte:
Une checklist de release evite les oublis et clarifie la responsabilite d equipe.

Travail attendu:
- definir les verifications techniques avant release
- definir les verifications fonctionnelles
- definir les points d environnement et de build

Fichiers principaux:
- document de release frontend

Criteres de sortie:
- checklist courte
- checklist exploitable par l equipe
