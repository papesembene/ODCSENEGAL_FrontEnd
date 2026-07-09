# Roadmap refonte entretiens

## Objectif

Refondre le module entretien pour reproduire la logique du fichier Excel, sans figer les colonnes dans le code.

Le module doit permettre de planifier les entretiens par référentiel, jour et créneau, d'affecter plusieurs rôles à une même personne selon le créneau, et de remplir des fiches dynamiques basées sur les critères du référentiel.

## Principes métier

- Les colonnes de la fiche ne sont pas fixes.
- Chaque référentiel possède sa propre grille d'évaluation.
- Une personne peut avoir plusieurs rôles sur un même créneau.
- Les rôles sont liés au créneau, pas uniquement au compte utilisateur.
- Le super admin et l'admin compétences planifient et supervisent.
- Les jurys et validateurs voient uniquement les candidats qui leur sont affectés.
- Les validateurs/coachs peuvent voir les apprenants liés à leur référentiel.
- Les questions et réponses du test en ligne doivent être visibles pendant l'entretien.

## Structure cible inspirée de l'Excel

### Données candidat

- Nom
- Email
- Téléphone
- Score test en ligne
- Sexe
- Référentiel
- Créneau

### Sections dynamiques

Chaque section correspond à une étape d'évaluation.

Exemples pour Dev Web Mobile :

- Filtre
- Validation
- Motivation

Chaque section contient des critères configurables :

- case à cocher
- note
- texte court
- commentaire long
- choix simple
- champ calculé
- verdict

## Modèle cible

### Référentiel

Définit le domaine de formation ou d'évaluation.

### Campagne entretien

Contient :

- nom
- référentiel
- période
- statut
- grille d'évaluation dynamique

### Créneau

Contient :

- campagne
- référentiel
- date et heure
- capacité
- candidats planifiés
- affectations jury par rôle

### Affectation jury

Une affectation contient :

- utilisateur
- créneau
- rôles sur ce créneau

Exemple :

```txt
Mamadou Diop
Créneau : DWM 27/12 9h
Rôles : filtre, validation
```

### Fiche entretien

Contient :

- candidat
- campagne
- créneau
- réponses par section dynamique
- statut entretien
- décision finale
- historique des modifications

## Étapes de réalisation

### Phase 1 - Base métier backend

- Rendre la grille d'évaluation entièrement dynamique.
- Ne plus limiter la grille aux seules sections `filter`, `validator`, `motivation`.
- Garder les sections Excel DWM comme configuration par défaut.
- Préparer une structure d'affectation multi-rôles par créneau.
- Conserver la compatibilité avec les anciennes fiches.

### Phase 2 - Planification

- Permettre au super admin/admin compétences de créer des créneaux par référentiel et par jour.
- Affecter une ou plusieurs personnes à un ou plusieurs rôles sur chaque créneau.
- Afficher clairement les créneaux incomplets.
- Planifier automatiquement les candidats admis aux tests.

### Phase 3 - Fiche dynamique

- Générer la fiche à partir de la grille du référentiel.
- Afficher les sections et critères configurés.
- Autoriser chaque jury à remplir uniquement ses sections affectées.
- Permettre au super admin/admin compétences de consulter toute la fiche.

### Phase 4 - Questions du test en ligne

- Afficher dans la fiche :
  - score du candidat
  - questions posées
  - réponses du candidat
  - bonnes réponses si disponibles
  - infractions anti-triche
- Utiliser ces informations dans les sections filtre/validation.

### Phase 5 - Interfaces par profil

- Super admin : supervision et accès globaux.
- Admin compétences : planification, référentiels, campagnes, créneaux, jurys, décisions.
- Jury filtre : créneaux et candidats affectés au filtre.
- Validateur/coach : candidats affectés et apprenants de son référentiel.
- Jury motivation : candidats affectés à la motivation.

### Phase 6 - Listes finales

- Générer :
  - liste officielle
  - liste d'attente
  - rejetés
  - fiches incomplètes
- Filtrer par référentiel, sexe, score, statut, créneau.
- Exporter au format Excel en reconstruisant dynamiquement les colonnes.

## Règles à respecter

- Ne pas figer les critères dans le code.
- Ne pas mélanger les interfaces super admin, admin compétences, jurys et CM.
- Ne pas imposer un rôle fixe à un utilisateur.
- Garder la structure Excel comme référence fonctionnelle.
- Préserver les données existantes pendant la migration.
- Avancer par petites phases testables.
