# Fiche de QA - Tests Manuels Critiques

Ce document liste les parcours utilisateur et administrateur critiques à vérifier manuellement avant chaque merge important sur les branches `main` ou `develop`.

---

## 1. ODC (Candidatures Compétences)
**URL :** `/odc/candidatures`

- [ ] **Chargement** : La page s'affiche correctement avec tous les champs.
- [ ] **Validation en Temps Réel** :
    - [ ] L'email est validé (format et unicité).
    - [ ] Le numéro CNI/Passeport est validé en fonction du type sélectionné.
    - [ ] L'unicité du CNI est vérifiée auprès du serveur.
- [ ] **Champs Obligatoires** : Vérifier que le bouton de soumission reste bloqué ou affiche des erreurs si des champs requis sont vides.
- [ ] **Soumission Success** : Remplir un formulaire valide et vérifier l'affichage de l'écran de succès.
- [ ] **Soumission Error** : Simuler une erreur (ex: déconnecter le backend) et vérifier le message d'erreur utilisateur.

---

## 2. Startups (Candidature Générale)
**URL :** `/startups/candidature`

- [ ] **Navigation multi-étapes** : Passer d'une étape à l'autre sans perte de données.
- [ ] **Upload de Fichiers (CV & Pitch Deck)** :
    - [ ] **Drag & Drop** : Vérifier que le dépôt de fichier fonctionne.
    - [ ] **Taille** : Tenter d'uploader un fichier > 10 Mo (doit être refusé).
    - [ ] **Type** : Tenter d'uploader un fichier non autorisé (ex: .exe) (doit être refusé).
    - [ ] **Suppression** : Cliquer sur l'icône de suppression pour retirer un fichier avant soumission.
- [ ] **Calculs Dynamiques** : Vérifier que les champs conditionnels s'affichent (ex: "Autre rôle").
- [ ] **Soumission finale** : Vérifier que le payload JSON contient bien les références aux fichiers.

---

## 3. Orange Fab (Accélération)
**URL :** `/startups/candidature/orange-fab`

- [ ] **Spécificités Orange Fab** : Vérifier les champs propres à ce programme (NINEA, Chiffre d'affaires, etc.).
- [ ] **Validation spécifique** : Vérifier que les règles métier Orange Fab sont appliquées.
- [ ] **Checkboxes Légales** : Vérifier que l'acceptation des règlements est obligatoire.

---

## 4. Administration (Astrodmin)
**URL :** `/astrodmin`

- [ ] **Authentification** : 
    - [ ] Test de connexion avec identifiants valides.
    - [ ] Test avec identifiants erronés (message d'erreur clair).
    - [ ] Persistance du token (recharge de page).
- [ ] **Dashboard** :
    - [ ] Chargement des graphiques (Recharts).
    - [ ] Filtrage par période (7, 14, 30 jours).
- [ ] **Gestion des Candidatures (Compétences)** :
    - [ ] Liste des candidats s'affiche.
    - [ ] **Mise à jour de statut** : Changer le statut d'un candidat et vérifier que l'API `update` fonctionne sans erreur.
    - [ ] Recherche et filtres par formation/statut.
- [ ] **Gestion des Startups** :
    - [ ] Consultation des dossiers et fichiers uploadés (CV/Pitch Deck).
- [ ] **Déconnexion** : Vérifier la redirection et la suppression du token.

---

## 5. Tests de Non-Régression (Transverse)
- [ ] **Responsive Design** : Tester les formulaires sur mobile (iPhone/Android via inspecteur).
- [ ] **Performance UI** : Pas de ralentissement majeur lors de la saisie (debounce sur les validations).
- [ ] **Console Browser** : Aucune erreur rouge critique lors de la navigation standard.
