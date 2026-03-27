# Objectifs de la semaine - Frontend

Periode:
- Semaine en cours

US deja terminees:
- US00
- US01
- US02
- US03
- US04
- US05

US de la semaine:
- US06
- US07
- US08
- US09
- US10
- US11
- US12
- US13
- US14
- US15
- US16
- US17
- US18
- US19
- US20
- US21
- US22
- US23
- US24

## Objectif principal

Avancer proprement sur le bloc frontend restant a partir de `US06` jusqu a `US24`.

Le but de la semaine est de:
- stabiliser les gros formulaires restants
- reduire la dette technique frontend
- mieux separer la logique et le rendu
- avancer en parallele a deux sans conflit Git
- garder une trace claire sur GitHub

## Objectifs de la semaine

1. Stabiliser les formulaires Startup et Orange Fab de `US06` a `US11`.
2. Avancer ensuite sur les US de securite, admin, auth, API et harmonisation de `US12` a `US17`.
3. Poser les bases de qualite, architecture, tests et release de `US18` a `US24`.
4. Tester manuellement les parcours critiques apres chaque bloc.
5. Garder le board GitHub, les branches et les PR a jour pendant toute la semaine.

## Repartition

Developpeur A:
- US06 - Extraire les constantes du formulaire candidature Startup
- US08 - Extraire les validations et helpers du formulaire candidature Startup
- US10 - Alleger la page principale du formulaire candidature Startup
- US12 - Stabiliser l espace admin des tests
- US14 - Stabiliser la couche auth utilisateur
- US16 - Centraliser les appels API admin du frontend
- US18 - Reduire le client-side sur les pages informatives
- US20 - Fiabiliser les uploads du formulaire Startup
- US22 - Documenter l environnement frontend local
- US24 - Definir la checklist de release frontend

Developpeur B:
- US07 - Extraire les constantes du formulaire candidature Orange Fab
- US09 - Extraire les validations et helpers du formulaire candidature Orange Fab
- US11 - Alleger la page principale du formulaire candidature Orange Fab
- US13 - Securiser le rendu HTML riche
- US15 - Centraliser les appels API publics du frontend
- US17 - Harmoniser les erreurs, loaders et messages succes des formulaires
- US19 - Alleger le layout global frontend
- US21 - Fiabiliser les uploads du formulaire Orange Fab
- US23 - Ecrire le protocole de test manuel frontend

## Ordre de travail

1. US06 et US07
2. US08 et US09
3. US10 et US11
4. US12 et US13
5. US14 et US15
6. US16 et US17
7. US18 et US19
8. US20 et US21
9. US22 et US23
10. US24

## Suivi quotidien

Chaque jour, verifier:
- quelle US est en cours
- quelle branche est utilisee
- si la PR est ouverte ou non
- si le test manuel a ete fait
- si la carte GitHub est dans la bonne colonne

## Colonnes du board

- A faire: US non commencee
- En cours: developpement actif
- En revue: PR ouverte
- Termine: PR mergee dans `main`

## Resultat attendu en fin de semaine

- `frontend/app/startups/candidature/page.jsx` plus legere
- `frontend/app/startups/candidature/orange-fab/page.jsx` plus legere
- constantes extraites
- validations extraites
- helpers de saisie extraits
- espace admin des tests mieux stabilise
- rendu HTML riche mieux securise
- couche auth et appels API plus coherents
- protocoles de test et release documentes
- PR propres et lisibles

## Definition de fin de semaine

La semaine est consideree comme reussie si:
- US06 a US24 sont planifiees et suivies proprement
- US06 a US11 sont traitees ou tres bien avancees
- le bloc suivant US12 a US17 est engage ou reparti clairement
- les documents de suivi, tests et release sont en place
- aucune regression visible n est introduite
- le travail est proprement suivi sur GitHub

## Rappel important

On ne cherche pas cette semaine a:
- refaire tout le frontend
- refaire tout le design
- ajouter de nouvelles features non prioritaires

On cherche cette semaine a:
- stabiliser
- simplifier
- securiser la suite du projet
- organiser proprement la progression jusqu a US24
