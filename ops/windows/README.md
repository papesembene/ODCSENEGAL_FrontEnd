# Frontend Windows : service NSSM

## Perimetre de la recuperation

Ces fichiers ont ete recuperes du serveur dans le commit `d5662178`.
Leur presence dans Git ne lance aucune installation. La configuration decrite
ci-dessous provient de cette recuperation et doit etre verifiee sur le serveur:
les noms de services, ports et essais rapportes ne constituent pas une recette
effectuee sur le poste de developpement Linux.

Le script `C:\Orange Digital Center\deploy-frontend-production.ps1`, mentionne
ci-dessous, n'est pas fourni par cet export. Il doit etre recupere et examine
avant de suivre la procedure de mise a jour. Ne pas recreer ce script a partir
de suppositions, ni lancer les outils d'administration en production sans
validation de leur cible, sauvegarde et fenetre d'intervention adaptee.

## Configuration decrite sur le serveur

Le frontend utilise NSSM, comme l'ancien déploiement. Ce service Windows lance directement Node.js et Next.js ; IIS assure le proxy HTTPS.

Le premier service est `ODC-PROD-FRONTEND`, dans la release existante du 28 octobre 2026, sur le port 3005. Les prochaines mises à jour alternent avec `ODC-PROD-FRONTEND-SECONDARY`. La règle IIS indique lequel sert le site. Ces deux emplacements ne constituent pas une bascule automatique entre deux serveurs.

L'ancienne tâche `ODC-TEST-PROD-FRONTEND` est désactivée après migration pour éviter des gestionnaires concurrents. `MonSite` et les tâches API/email restent distincts.

## Flux de travail

Developper et tester sur le poste local, enregistrer les changements dans Git,
puis les pousser sur GitHub. Recuperer ensuite la version validee dans le depot
de travail du serveur, pas dans la release active, et utiliser la procedure de
deploiement verifiee. Conserver les identifiants des commits frontend et backend
deployes pour comparer les versions et preparer un retour arriere.

Ne pas modifier le code directement dans une release de production. Les fichiers
`.env`, les cles, les bases MongoDB, les uploads et les journaux restent propres
a chaque environnement: ils ne sont pas synchronises par un `git pull`.

## Relance et contrôle

- Le service publié démarre avec Windows. NSSM relance Node.js après sa sortie, même normale, avec un délai initial de 2 secondes et une limitation des redémarrages trop fréquents.
- Windows dispose aussi d'actions de récupération si NSSM lui-même échoue.
- `ODC-TEST-PROD-FRONTEND-WATCHDOG` contrôle le service publié et sa réponse HTTP locale chaque minute et au démarrage. Son état `Ready` entre les contrôles est normal ; le dernier résultat doit être `0`.
- Un service arrêté peut être démarré au premier contrôle. Un blocage doit échouer à trois contrôles consécutifs avant reprise. Une grâce de 60 secondes au démarrage et un délai de 120 secondes entre interventions évitent les boucles.
- Le contrôle vérifie le chemin Next.js, le port et le parent NSSM du processus. Il refuse de redémarrer un programme inconnu.

Le runtime est dans `C:\Orange Digital Center\ops\frontend-recovery`. Pour mettre à jour le contrôle sans arrêter le frontend, dans PowerShell administrateur :

```powershell
& "C:\Orange Digital Center\odc-test\frontend\ops\windows\Install-FrontendServiceWatchdog.ps1" -WhatIf
& "C:\Orange Digital Center\odc-test\frontend\ops\windows\Install-FrontendServiceWatchdog.ps1"
```

L'ancien `Install-FrontendRecovery.ps1` refuse l'installation par tâches dès qu'un service frontend existe.

## Mettre à jour

Après avoir enregistré les modifications, dans PowerShell administrateur :

```powershell
Set-Location "C:\Orange Digital Center\odc-test\frontend"
git status -sb
git pull --ff-only
& "C:\Orange Digital Center\deploy-frontend-production.ps1"
```

Le script exige un dépôt sans modifications non commitées. Il prépare une release séparée avec la configuration de production, installe les dépendances et construit Next.js. Il configure le service inactif sur un port libre, puis vérifie l'accueil, l'administration, un fichier statique et le processus Node avant de basculer IIS.

Après validation du site public, l'ancien service passe en démarrage manuel et s'arrête après drainage. Sa release et sa configuration sont conservées. Une erreur avant validation rétablit l'ancienne cible. Le script affiche la sauvegarde nécessaire au retour arrière.

## Vérifier et diagnostiquer

Dans PowerShell administrateur :

```powershell
Get-Service -Name "ODC-PROD-FRONTEND","ODC-PROD-FRONTEND-SECONDARY" -ErrorAction SilentlyContinue |
  Select-Object Name, Status, StartType

Get-ScheduledTaskInfo -TaskName "ODC-TEST-PROD-FRONTEND-WATCHDOG" |
  Select-Object LastRunTime, LastTaskResult, NextRunTime

. "C:\Orange Digital Center\ops\frontend-recovery\FrontendService.Common.ps1"
$frontendActif = Get-PublishedFrontendNssmContext
$frontendActif | Select-Object Name, Frontend, Port
curl.exe -I --max-time 10 "http://127.0.0.1:$($frontendActif.Port)/"
curl.exe -I --max-time 15 https://orangedigitalcenter.sn/

Get-Content (Join-Path $frontendActif.Logs "nssm.stderr.log") -Tail 60
Get-Content (Join-Path $frontendActif.Logs "nssm.stdout.log") -Tail 30
Get-Content "C:\Orange Digital Center\ops\frontend-recovery\state\watchdog.log" -Tail 30
```

Si le service publié est arrêté, utiliser `Start-Service -Name $frontendActif.Name`. Un `Restart-Service -Name $frontendActif.Name` interrompt brièvement les requêtes ; conserver d'abord les journaux de l'incident.

NSSM écrit dans `ops-logs` de la release. Le contrôle conserve les 12 dernières rotations fermées et les deux fichiers actifs. Les événements NSSM sont aussi dans le journal Windows Application.

## Retour à la release précédente

Pour une mise à jour effectuée par le script, consulter `deployment.json` dans la sauvegarde affichée. `ActiveService`, `ActiveFrontend` et `ActivePort` y désignent la version précédente.

1. Vérifier que cette release existe, démarrer son service et attendre HTTP 200 sur son port.
2. Charger `FrontendService.Common.ps1` et lire la configuration IIS courante. Remplacer uniquement l'URL de `ReverseProxyToNextJS` par `http://127.0.0.1:ANCIEN_PORT/{R:0}` avec `Set-FrontendIisTextAtomic` ; préserver la règle API.
3. Remettre l'ancien service en démarrage automatique, vérifier IIS et le site public, puis passer le service retiré en démarrage manuel et l'arrêter après drainage.

Le contrôle suit automatiquement le service correspondant à IIS. Conserver toute release encore référencée par IIS ou par un service, même arrêté, et les sauvegardes utiles au retour arrière.

## Vérifications et limites

La documentation recue rapporte un test isole NSSM: un avertissement sur stderr
aurait laisse Node.js fonctionner, puis une sortie volontaire avec le code 7
aurait ete suivie d'une relance et d'un HTTP 200 en environ 2,8 secondes, sans
changement `AppNoConsole`. Ce resultat n'a pas ete reproduit lors de l'import
local; le valider sur l'environnement Windows autorise avant bascule.

Les journaux antérieurs ne permettent pas d'établir le déclencheur initial de la panne. Cette supervision réduit les interruptions de processus. Une panne complète du serveur nécessite une autre machine et un répartiteur pour maintenir le service. Aucune alerte externe n'est configurée ici.
