import Link from "@/components/ui/interactive-link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ExternalLink, Quote } from "lucide-react"

export default function SuccessStoriesPage() {
  const successStories = [
    {
      id: 1,
      name: "AgriTech Sénégal",
      logo: "/placeholder.svg?height=80&width=80",
      image: "/placeholder.svg?height=400&width=600",
      founder: "Amadou Diallo",
      founderRole: "CEO & Co-fondateur",
      founderImage: "/placeholder.svg?height=100&width=100",
      program: "Orange Fab",
      year: "2021",
      sector: "Agriculture",
      description:
        "AgriTech Sénégal développe des solutions technologiques pour optimiser la production agricole et connecter les agriculteurs aux marchés.",
      quote:
        "L'accompagnement d'Orange Startup Studio a été déterminant pour le développement de notre startup. Les mentors nous ont guidés à chaque étape et nous ont aidés à structurer notre vision.",
      achievements: [
        "Levée de fonds de 200 millions FCFA",
        "Expansion dans 3 pays d'Afrique de l'Ouest",
        "Plus de 10 000 agriculteurs utilisateurs",
        "15 emplois créés",
      ],
      website: "https://agritech-senegal.com",
      link: "/startups/success-stories/agritech-senegal",
    },
    {
      id: 2,
      name: "HealthTech",
      logo: "/placeholder.svg?height=80&width=80",
      image: "/placeholder.svg?height=400&width=600",
      founder: "Fatou Ndiaye",
      founderRole: "Fondatrice & CEO",
      founderImage: "/placeholder.svg?height=100&width=100",
      program: "Orange Fab",
      year: "2020",
      sector: "Santé",
      description:
        "HealthTech a développé une plateforme de télémédecine qui a révolutionné l'accès aux soins dans les zones rurales du Sénégal.",
      quote:
        "Grâce au programme Orange Fab, nous avons pu accélérer notre croissance et accéder à de nouveaux marchés. Le réseau de partenaires d'Orange a été un véritable atout pour notre développement.",

      achievements: [
        "Plus de 50 000 utilisateurs",
        "Partenariat avec le Ministère de la Santé",
        "Levée de fonds de 150 millions FCFA",
        "12 emplois créés",
      ],
      website: "https://healthtech.sn",
      link: "/startups/success-stories/healthtech",
    },
    {
      id: 3,
      name: "EduSenegal",
      logo: "/placeholder.svg?height=80&width=80",
      image: "/placeholder.svg?height=400&width=600",
      founder: "Ibrahima Fall",
      founderRole: "Co-fondateur & CTO",
      founderImage: "/placeholder.svg?height=100&width=100",
      program: "Startup Lab",
      year: "2022",
      sector: "Éducation",
      description:
        "EduSenegal a créé une plateforme éducative en ligne adaptée au programme scolaire sénégalais, permettant aux élèves d'accéder à des cours de qualité à distance.",
      quote:
        "Le Startup Lab nous a permis de passer de l'idée au prototype en un temps record. Les ressources mises à notre disposition et les conseils des experts ont été précieux pour valider notre concept.",
      achievements: [
        "Plus de 20 000 élèves utilisateurs",
        "Partenariats avec 50 écoles",
        "Levée de fonds de 80 millions FCFA",
        "8 emplois créés",
      ],
      website: "https://edusenegal.sn",
      link: "/startups/success-stories/edusenegal",
    },
    {
      id: 4,
      name: "FinTech Pay",
      logo: "/placeholder.svg?height=80&width=80",
      image: "/placeholder.svg?height=400&width=600",
      founder: "Moussa Sow",
      founderRole: "CEO",
      founderImage: "/placeholder.svg?height=100&width=100",
      program: "Mentorat",
      year: "2021",
      sector: "Finance",
      description:
        "FinTech Pay a développé une solution de paiement mobile adaptée aux petits commerçants, leur permettant d'accepter des paiements électroniques sans frais d'équipement.",
      quote:
        "Le programme de mentorat d'Orange Startup Studio nous a permis de bénéficier de l'expertise de professionnels du secteur financier. Leurs conseils ont été déterminants pour affiner notre modèle économique.",
      achievements: [
        "5 000 commerçants utilisateurs",
        "Volume de transactions de 2 milliards FCFA",
        "Partenariat avec 3 banques",
        "10 emplois créés",
      ],
      website: "https://fintechpay.sn",
      link: "/startups/success-stories/fintech-pay",
    },
    {
      id: 5,
      name: "EcoWaste",
      logo: "/placeholder.svg?height=80&width=80",
      image: "/placeholder.svg?height=400&width=600",
      founder: "Omar Seck",
      founderRole: "Fondateur",
      founderImage: "/placeholder.svg?height=100&width=100",
      program: "Startup Lab",
      year: "2022",
      sector: "Environnement",
      description:
        "EcoWaste a développé une solution innovante pour la gestion et le recyclage des déchets urbains, contribuant à l'amélioration de l'environnement dans les villes sénégalaises.",
      quote:
        "Le Startup Lab nous a fourni l'accompagnement nécessaire pour transformer notre idée en un business viable. Les ateliers et le mentorat ont été essentiels pour structurer notre projet.",
      achievements: [
        "Collecte de 500 tonnes de déchets recyclables",
        "Partenariats avec 3 municipalités",
        "Levée de fonds de 50 millions FCFA",
        "12 emplois créés",
      ],
      website: "https://ecowaste.sn",
      link: "/startups/success-stories/ecowaste",
    },
    {
      id: 6,
      name: "LogiSenegal",
      logo: "/placeholder.svg?height=80&width=80",
      image: "/placeholder.svg?height=400&width=600",
      founder: "Aminata Diallo",
      founderRole: "CEO & Co-fondatrice",
      founderImage: "/placeholder.svg?height=100&width=100",
      program: "Orange Fab",
      year: "2020",
      sector: "Logistique",
      description:
        "LogiSenegal a développé une plateforme de logistique qui optimise la livraison du dernier kilomètre dans les zones urbaines et périurbaines du Sénégal.",
      quote:
        "Orange Fab nous a permis d'accélérer notre développement commercial et d'accéder à des partenaires stratégiques. Le programme nous a donné la crédibilité nécessaire pour convaincre nos premiers clients.",
      achievements: [
        "Réseau de 200 livreurs",
        "Plus de 50 000 livraisons effectuées",
        "Partenariats avec 30 e-commerces",
        "15 emplois créés",
      ],
      website: "https://logisenegal.com",
      link: "/startups/success-stories/logisenegal",
    },
  ]

  const sectors = ["Tous", "Agriculture", "Santé", "Éducation", "Finance", "Environnement", "Logistique"]
  const programs = ["Tous", "Startup Lab", "Orange Fab", "Mentorat", "Financement"]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Success Stories</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Découvrez les parcours inspirants des startups accompagnées par Orange Startup Studio.
        </p>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="Tous" className="w-full">
          <div className="mb-8 flex flex-col space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-medium">Filtrer par programme</h3>
              <TabsList className="h-auto flex-wrap">
                {programs.map((program) => (
                  <TabsTrigger key={program} value={program} className="mb-2">
                    {program}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Filtrer par secteur</h3>
              <TabsList className="h-auto flex-wrap">
                {sectors.map((sector) => (
                  <TabsTrigger key={sector} value={sector} className="mb-2">
                    {sector}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          <TabsContent value="Tous" className="mt-6">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {successStories.map((story) => (
                <Card key={story.id} className="overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative h-48">
                    <Image src={story.image || "/placeholder.svg"} alt={story.name} fill className="object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t/srgb from-black/70 to-transparent p-4">
                      <div className="flex items-center space-x-2">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white">
                          <Image
                            src={story.logo || "/placeholder.svg"}
                            alt={`${story.name} logo`}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{story.name}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-orange-500 text-white">{story.program}</Badge>
                            <span className="text-xs text-white">{story.year}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center space-x-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full">
                        <Image
                          src={story.founderImage || "/placeholder.svg"}
                          alt={story.founder}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{story.founder}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{story.founderRole}</p>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300">{story.description}</p>

                    <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <div className="flex items-start space-x-2">
                        <Quote className="h-5 w-5 shrink-0 text-orange-500" />
                        <p className="text-sm italic text-gray-600 dark:text-gray-300">
                          {story.quote.length > 150 ? `${story.quote.substring(0, 150)}...` : story.quote}
                        </p>
                      </div>
                    </div>

                    <h4 className="mt-4 font-semibold">Réalisations clés</h4>
                    <ul className="mt-2 space-y-1">
                      {story.achievements.slice(0, 2).map((achievement, index) => (
                        <li
                          key={index}
                          className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                          <span>{achievement}</span>
                        </li>
                      ))}
                      {story.achievements.length > 2 && (
                        <li className="text-sm text-orange-500">
                          + {story.achievements.length - 2} autres réalisations
                        </li>
                      )}
                    </ul>

                    <div className="mt-6 flex items-center justify-between">
                      <Button asChild variant="outline" size="sm">
                        <Link href={story.link}>
                          Lire l'histoire complète <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={story.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Site web
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contenu similaire pour les autres onglets, filtré par programme ou secteur */}
          {programs.slice(1).map((program) => (
            <TabsContent key={program} value={program} className="mt-6">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {successStories
                  .filter((story) => story.program === program)
                  .map((story) => (
                    <Card key={story.id} className="overflow-hidden transition-all hover:shadow-lg">
                      {/* Contenu similaire à celui ci-dessus */}
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}

          {sectors.slice(1).map((sector) => (
            <TabsContent key={sector} value={sector} className="mt-6">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {successStories
                  .filter((story) => story.sector === sector)
                  .map((story) => (
                    <Card key={story.id} className="overflow-hidden transition-all hover:shadow-lg">
                      {/* Contenu similaire à celui ci-dessus */}
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Become a Success Story Section */}
      <section className="mt-16 rounded-lg bg-orange-50 p-8 dark:bg-orange-950">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Devenez notre prochaine success story
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Vous avez un projet innovant et ambitieux ? Rejoignez Orange Startup Studio et bénéficiez d'un
              accompagnement sur mesure pour développer votre startup.
            </p>
            <div className="mt-8">
              <Button asChild>
                <Link href="/candidatures/fermees">
                  Postuler maintenant <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden h-64 overflow-hidden rounded-lg md:block">
            <Image
              src="/placeholder.svg?height=300&width=500"
              alt="Devenez notre prochaine success story"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
