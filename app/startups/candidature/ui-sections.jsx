import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PublicFormSuccessState } from "@/components/ui/form-feedback"
import { ArrowRight, Check, Clock, Lightbulb, Users, X } from "lucide-react"

export function StartupCandidatureSuccessState() {
  return (
    <PublicFormSuccessState
      descriptions={[
        "Merci pour votre candidature. Notre équipe l'examinera dans les plus brefs délais et vous contactera pour la suite du processus.",
        "Un email de confirmation a été envoyé à l'adresse que vous avez fournie.",
      ]}
      actionHref="/startups"
      actionLabel="Retour à l'espace Startups"
    />
  )
}

export function StartupProgressSteps({ step }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex flex-col items-center ${
              i < step ? "text-orange-500" : i === step ? "text-blue-500" : "text-gray-400"
            }`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                i < step
                  ? "border-orange-500 bg-orange-100 dark:bg-orange-900"
                  : i === step
                    ? "border-blue-500 bg-blue-100 dark:bg-blue-900"
                    : "border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              {i < step ? <Check className="h-5 w-5" /> : <span>{i}</span>}
            </div>
            <span className="mt-2 text-sm">
              {i === 1 ? "Informations personnelles" : i === 2 ? "Informations entreprise" : "Produit/Service"}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div className="h-2 rounded-full bg-orange-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
      </div>
    </div>
  )
}

export function StartupRegulationDialog({ isOpen, onOpenChange }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <span className="text-orange-500 font-medium cursor-pointer hover:underline">règlement de participation</span>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Règlement du Concours INNOV'OSS 2024
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Veuillez lire attentivement ce règlement avant d'accepter les conditions de participation.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-bold text-lg mb-2">REGLEMENT DU CONCOURS</h3>
              <h4 className="font-semibold mb-2">« Appel à projet INNOV'OSS Décembre 2024 - 5ème Edition »</h4>
              <p className="mb-4">
                Le présent Règlement décrit les conditions et modalités de la cinquième édition du Concours « Appel à
                Projet INNOV'OSS 2024 » organisé par SONATEL, ci-après désigné « le Concours ».
              </p>
              <p className="mb-4">La participation au Concours vaut, pour le Participant, acceptation sans réserve du présent Règlement.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Article 1 : Définitions</h4>
              <p className="mb-2">
                Dans le cadre de l'interprétation du présent Règlement, les expressions suivantes auront la signification :
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Agritech :</strong> désigne un domaine d'activité où on utilise les outils technologiques pour améliorer le quotidien des agriculteurs.</li>
                <li><strong>Edtech :</strong> désigne une activité qui vise à faciliter l'enseignement et l'apprentissage en mettant la technologie au service de l'éducation.</li>
                <li><strong>Foodtech :</strong> désigne des innovations sur les produits, la distribution, le marché ou le modèle économique.</li>
                <li><strong>Intelligence Artificielle :</strong> désigne un processus d'imitation de l'intelligence humaine qui repose sur la création et l'application d'algorithmes exécutés dans un environnement informatique.</li>
                <li><strong>Orange fab :</strong> désigne le programme d'accélération de startups de Sonatel afin de les accompagner dans la phase de croissance. Il est dédié aux startups matures.</li>
                <li><strong>Orange Startup Studio (OSS) :</strong> est une structure du groupe SONATEL dédiée à la création et à l'accompagnement de Startup Innovantes et à fort potentiel.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Article 2 : Organisateur</h4>
              <p>
                SONATEL S.A, Société Anonyme avec Conseil d'Administration au capital social de cinquante milliards (50 000 000 000) de Francs CFA ayant son siège social au 64, Voie de Dégagement Nord (VDN), Dakar, immatriculée au Registre du Commerce et du Crédit Mobilier de Dakar sous le numéro SN.DKR.74 B 61, (ci-après « SONATEL » ou « l'Organisateur »), organise, du 29 novembre au 19 décembre 2024, un concours intitulé « L'appel à projet INNOV'OSS », (ci-après le « Concours »).
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Article 4 : Description du Concours</h4>
              <p className="mb-2">
                Orange Startup Studio (OSS) apporte un support financier, un accompagnement technique, de la visibilité et du networking pour toutes les startups admises à l'un de ses programmes ci-dessous :
              </p>
              <ul className="list-disc pl-6 mb-2">
                <li>Startup Lab</li>
                <li>Orange fab</li>
              </ul>
              <p className="mb-2">
                L'appel à projet INNOV'OSS 2024 est un concours d'excellence dont le but est de sélectionner des projets innovants orientés sur plusieurs thématiques ci-dessous :
              </p>
              <ul className="list-disc pl-6">
                <li>Immobilier/Foncier</li>
                <li>Transport</li>
                <li>Foodtech</li>
                <li>Edtech</li>
                <li>Insurtech</li>
                <li>Agritech</li>
                <li>Intelligence Artificielle</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Article 5 : Déroulement du Concours</h4>
              <p className="mb-2">Le concours se déroule en trois phases :</p>
              <div className="mb-3">
                <h5 className="font-medium">1ère phase : Inscription</h5>
                <p>Les inscriptions au Concours sont ouvertes du 29 novembre 2024 à 00 heure au 13 décembre 2024 à 23 heures 59 minutes.</p>
                <p>La participation au Concours est unique. Au risque de voir sa candidature écartée, un même candidat ne peut soumettre plusieurs candidatures au Concours.</p>
                <p>L'inscription au Concours est gratuite.</p>
              </div>
              <div className="mb-3">
                <h5 className="font-medium">2ème phase : Sélection du Jury</h5>
                <p>Le Jury fera une présélection des candidatures le 16 décembre 2024.</p>
                <p>La sélection définitive des candidatures aura lieu le 19 décembre 2024.</p>
              </div>
              <div>
                <h5 className="font-medium">3ème phase : Jury, Choix des finalistes, et délibération</h5>
                <p>Le jury chargé d'effectuer le classement des Projets sera constitué par des membres du personnel de SONATEL.</p>
                <p>Les critères retenus pour la sélection incluent :</p>
                <ul className="list-disc pl-6 mt-1">
                  <li>Qualité du Dossier</li>
                  <li>Caractère Innovant et Valeur ajoutée du projet</li>
                  <li>Impact Economique</li>
                  <li>Compétences Techniques du ou des entrepreneurs</li>
                  <li>Performance Environnementale du projet</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Article 6 : Avantages</h4>
              <p>
                Il est accordé aux Gagnants un accompagnement par OSS pour un développement de leur activité. Selon le niveau de maturité du projet, il sera autorisé à intégrer l'un des programmes Startup Lab ou Orange Fab.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Article 7 : Traitement des données personnelles</h4>
              <p>
                En participant au Concours, les candidats autorisent SONATEL à utiliser leur nom, prénoms et/ou image, la dénomination de leurs Projets, et leur description pour la promotion de la marque ORANGE.
              </p>
              <p className="mt-2">
                Les données personnelles recueillies dans le cadre du Concours sont traitées conformément à la loi n°2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Article 9 : Propriété Intellectuelle</h4>
              <p>
                Les Candidats sont titulaires des Connaissances, techniques et procédés antérieurs utilisés dans le cadre des développements ou projets présentés au Concours. Il appartient aux Candidats de protéger leurs Projets en déposant leur marque, dessin ou modèle industriel, nom de domaine et éventuellement un brevet.
              </p>
              <p className="mt-2">
                Les Résultats produits dans le cadre des programmes définis et permis par la collaboration des coachs de Sonatel sont détenus à parts égales par Sonatel et l'équipe gagnante.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Article 10 : Droit applicable - Règlement des litiges</h4>
              <p>
                Le présent Règlement est soumis au droit sénégalais en toutes ses dispositions. Tout litige relatif au Concours fera l'objet de la recherche d'une solution à l'amiable, et à défaut d'entente, le litige sera soumis aux Tribunaux compétents de Dakar.
              </p>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end items-center pt-4">
          <Button onClick={() => onOpenChange(false)} className="bg-orange-500 hover:bg-orange-600">
            J'ai lu et compris
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function StartupInfoTab() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Programme Startup Lab</CardTitle>
        <CardDescription>
          Notre programme d'accompagnement pour les startups en phase d'idéation et de prototypage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="rounded-lg border p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
              <Lightbulb className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Startup Lab</h3>
              <p className="text-sm text-muted-foreground">Phase d'idéation et prototypage</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Programme de 6 mois destiné aux entrepreneurs en phase d'idéation et de prototypage. Nous vous aidons à transformer votre idée en un projet viable.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Critères d'éligibilité</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                <li>Avoir une idée innovante ou un projet en phase de démarrage</li>
                <li>Être disponible pour s'engager pleinement dans le programme</li>
                <li>Avoir une équipe d'au moins 2 personnes</li>
                <li>Être basé au Sénégal</li>
                <li>Avoir un prototype ou MVP en développement</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">6 mois</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">10 startups</span>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/startups/programmes/startup-lab">
                  En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
