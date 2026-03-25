import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Search, Globe, Filter } from "lucide-react"

export default function StartupsListPage() {
  const startups = [
    {
      name: "AgriTech Sénégal",
      slug: "agritech-senegal",
      tagline: "Révolutionner l'agriculture par la technologie",
      description:
        "Solutions technologiques pour améliorer la productivité agricole et connecter les agriculteurs aux marchés.",
      sector: "AgriTech",
      image: "/images/agritech.jpg",
      website: "https://example.com",
      program: "Orange Fab",
      year: "2022",
    },
     {
      name: "Maad",
      slug: "agritech-senegal",
      tagline: "Révolutionner l'agriculture par la technologie",
      description:
        "Solution de distribution pour les commerçants informels.",
      sector: "AgriTech",
      image: "/images/maad.jpg",
      website: "https://example.com",
      program: "Orange Fab",
      year: "2021",
    },
   {
      name: "Talibi",
      slug: "agritech-senegal",
      tagline: "Révolutionner l'agriculture par la technologie",
      description:
        "Plateforme de mise en relation entre étudiants et professeurs particuliers",
      sector: "Tech",
      image: "/images/talibi.png",
      website: "https://example.com",
      program: "Orange Fab",
      year: "2022",
    },
    {
      name: "Bay Seddo",
      slug: "fintech-senegal",
      tagline: "Inclusion financière pour tous",
      description: "Service de paiement mobile et de transfert d'argent.",
      sector: "FinTech",
      image: "/images/bayseedo.png?height=200&width=300",
      website: "https://example.com",
      program: "Startup Lab",
      year: "2022",
    },
    {
      name: "LogiSen",
      slug: "logisen",
      tagline: "Optimiser la logistique urbaine",
      description: "Plateforme de mise en relation entre transporteurs et commerçants pour optimiser les livraisons.",
      sector: "LogTech",
      image: "/placeholder.svg?height=200&width=300",
      website: "https://example.com",
      program: "Orange Fab",
      year: "2023",
    },
    {
      name: "CleanTech",
      slug: "cleantech",
      tagline: "Pour un Sénégal plus propre",
      description: "Solutions innovantes de gestion des déchets et de recyclage adaptées au contexte africain.",
      sector: "CleanTech",
      image: "/placeholder.svg?height=200&width=300",
      website: "https://example.com",
      program: "Startup Lab",
      year: "2021",
    },
    {
      name: "TourismTech",
      slug: "tourismtech",
      tagline: "Découvrir le Sénégal autrement",
      description:
        "Application de découverte touristique mettant en valeur le patrimoine culturel et naturel du Sénégal.",
      sector: "TourismTech",
      image: "/placeholder.svg?height=200&width=300",
      website: "https://example.com",
      program: "Orange Fab",
      year: "2022",
    },
    {
      name: "E-Commerce Sénégal",
      slug: "ecommerce-senegal",
      tagline: "Le shopping en ligne simplifié",
      description: "Plateforme de commerce électronique adaptée au contexte sénégalais avec paiement mobile intégré.",
      sector: "E-Commerce",
      image: "/placeholder.svg?height=200&width=300",
      website: "https://example.com",
      program: "Startup Lab",
      year: "2023",
    },
    {
      name: "RenewSen",
      slug: "renewsen",
      tagline: "L'énergie renouvelable pour tous",
      description: "Solutions d'énergie solaire abordables pour les zones rurales et urbaines du Sénégal.",
      sector: "CleanTech",
      image: "/placeholder.svg?height=200&width=300",
      website: "https://example.com",
      program: "Orange Fab",
      year: "2021",
    },
    {
      name: "MobilityTech",
      slug: "mobilitytech",
      tagline: "Repenser la mobilité urbaine",
      description: "Application de covoiturage et de transport partagé pour réduire les embouteillages à Dakar.",
      sector: "MobilityTech",
      image: "/placeholder.svg?height=200&width=300",
      website: "https://example.com",
      program: "Startup Lab",
      year: "2022",
    },
    {
      name: "CyberSecurity Sénégal",
      slug: "cybersecurity-senegal",
      tagline: "Protéger les données des entreprises",
      description: "Solutions de cybersécurité adaptées aux PME et aux grandes entreprises sénégalaises.",
      sector: "CyberSecurity",
      image: "/placeholder.svg?height=200&width=300",
      website: "https://example.com",
      program: "Orange Fab",
      year: "2023",
    },
    {
      name: "ArtTech",
      slug: "arttech",
      tagline: "Valoriser l'art et la culture sénégalaise",
      description: "Plateforme de promotion et de vente d'œuvres d'art sénégalaises à l'international.",
      sector: "ArtTech",
      image: "/placeholder.svg?height=200&width=300",
      website: "https://example.com",
      program: "Startup Lab",
      year: "2021",
    },
  ]

  const sectors = [...new Set(startups.map((startup) => startup.sector))].sort()
  const programs = [...new Set(startups.map((startup) => startup.program))].sort()
  const years = [...new Set(startups.map((startup) => startup.year))].sort((a, b) => b - a)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[300px] overflow-hidden">
        <Image src="/images/startup_accompagne.jpg?height=300&width=1200" alt="Startups Accompagnées" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative z-10 mx-auto flex h-full items-center px-4">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Startups Accompagnées</h1>
            <p className="mt-4 text-lg sm:text-xl">
              Découvrez les startups innovantes qui ont bénéficié de nos programmes d'accompagnement.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-white py-8 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input type="text" placeholder="Rechercher une startup..." className="pl-10" />
            </div>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <div className="w-full sm:w-40">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les secteurs</SelectItem>
                    {sectors.map((sector, index) => (
                      <SelectItem key={index} value={sector.toLowerCase()}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-40">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Programme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les programmes</SelectItem>
                    {programs.map((program, index) => (
                      <SelectItem key={index} value={program.toLowerCase()}>
                        {program}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-40">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Année" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les années</SelectItem>
                    {years.map((year, index) => (
                      <SelectItem key={index} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filtrer
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Startups List Section */}
      <section className="bg-gray-50 py-16 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {startups.map((startup, index) => (
              <Card key={index} className="overflow-hidden transition-all hover:shadow-lg">
                <div className="relative h-48">
                  <Image src={startup.image || "/placeholder.svg"} alt={startup.name} fill className="object-cover" />
                  <div className="absolute bottom-0 left-0 bg-orange-500 px-3 py-1 text-sm text-white">
                    {startup.sector}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{startup.name}</CardTitle>
                  <CardDescription>{startup.tagline}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{startup.description}</p>
                  <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                    <span>{startup.program}</span>
                    <span>•</span>
                    <span>Promotion {startup.year}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button asChild variant="outline">
                    <Link href={`/startups/liste/${startup.slug}`}>
                      En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="px-2">
                    <a href={startup.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-5 w-5" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-500 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Vous souhaitez rejoindre ces startups ?</h2>
            <p className="mt-4 text-lg">
              Postulez dès maintenant à nos programmes d'accompagnement et bénéficiez de notre expertise pour développer
              votre projet.
            </p>
            <div className="mt-8">
              <Button asChild variant="secondary" size="lg">
                <Link href="/candidatures/fermees">
                  Déposer ma candidature <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
