import { CardFooter } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, Globe, Mail, Phone, MapPin, Calendar, Users, Award } from "lucide-react"

// Modifier la fonction getStartupBySlug pour la rendre asynchrone
async function getStartupBySlug(slug) {
  const startups = [
    {
      name: "AgriTech Sénégal",
      slug: "agritech-senegal",
      tagline: "Révolutionner l'agriculture par la technologie",
      description:
        "Solutions technologiques pour améliorer la productivité agricole et connecter les agriculteurs aux marchés.",
      longDescription: `
        AgriTech Sénégal développe des solutions technologiques innovantes pour le secteur agricole sénégalais. 
        Notre mission est d'améliorer la productivité des agriculteurs, de faciliter leur accès aux marchés et de promouvoir une agriculture durable.
        
        Notre plateforme principale permet aux agriculteurs de recevoir des conseils personnalisés basés sur les données météorologiques, 
        les caractéristiques de leur sol et les meilleures pratiques agricoles. Nous proposons également un système de mise en relation 
        directe entre agriculteurs et acheteurs, éliminant ainsi les intermédiaires et permettant une meilleure rémunération des producteurs.
        
        Depuis notre participation au programme Orange Fab en 2022, nous avons pu développer notre solution et l'étendre à plusieurs régions du Sénégal, 
        touchant plus de 5000 agriculteurs. Nous avons également levé des fonds pour financer notre expansion dans d'autres pays d'Afrique de l'Ouest.
      `,
      sector: "AgriTech",
      image: "/placeholder.svg?height=400&width=800",
      logo: "/placeholder.svg?height=200&width=200",
      website: "https://example.com",
      email: "contact@agritechsenegal.com",
      phone: "+221 XX XXX XX XX",
      address: "Dakar, Sénégal",
      founded: "2020",
      team: "15 employés",
      program: "Orange Fab",
      year: "2022",
      achievements: [
        "Plus de 5000 agriculteurs utilisateurs",
        "Augmentation moyenne de 30% des revenus des agriculteurs",
        "Levée de fonds de 500 000 €",
        "Prix de l'innovation agricole 2022",
      ],
      socialMedia: {
        facebook: "https://facebook.com",
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com",
        instagram: "https://instagram.com",
      },
      gallery: [
        "/placeholder.svg?height=300&width=400",
        "/placeholder.svg?height=300&width=400",
        "/placeholder.svg?height=300&width=400",
        "/placeholder.svg?height=300&width=400",
      ],
      testimonials: [
        {
          quote:
            "AgriTech Sénégal a transformé ma façon de cultiver. Grâce à leurs conseils personnalisés, j'ai pu augmenter ma production de 40%.",
          author: "Mamadou Diallo",
          role: "Agriculteur à Thiès",
        },
        {
          quote:
            "La plateforme m'a permis de vendre directement aux acheteurs et d'obtenir de meilleurs prix pour mes produits.",
          author: "Fatou Ndiaye",
          role: "Productrice à Saint-Louis",
        },
      ],
    },
  ]

  return startups.find((startup) => startup.slug === slug) || startups[0]
}

// Modifier le composant de page pour le rendre asynchrone et utiliser await
export default async function StartupDetailPage({ params }) {
  const startup = await getStartupBySlug(params.slug)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <Image src={startup.image || "/placeholder.svg"} alt={startup.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t/srgb from-black/80 to-black/40" />
        <div className="container relative z-10 mx-auto flex h-full items-end px-4 pb-12">
          <div className="flex items-center space-x-6">
            <div className="relative h-32 w-32 overflow-hidden rounded-lg border-4 border-white bg-white">
              <Image
                src={startup.logo || "/placeholder.svg"}
                alt={`${startup.name} logo`}
                fill
                className="object-contain"
              />
            </div>
            <div className="text-white">
              <div className="mb-2">
                <Badge className="bg-orange-500 text-white">{startup.sector}</Badge>
              </div>
              <h1 className="text-4xl font-bold leading-tight">{startup.name}</h1>
              <p className="mt-2 text-xl">{startup.tagline}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="border-b bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-4 py-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/startups/liste">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-gray-50 py-16 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Sidebar */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Globe className="h-5 w-5 text-orange-500" />
                    <div>
                      <h3 className="font-semibold">Site web</h3>
                      <a
                        href={startup.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {startup.website.replace("https://", "")}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-orange-500" />
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <a href={`mailto:${startup.email}`} className="text-blue-600 hover:underline dark:text-blue-400">
                        {startup.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-orange-500" />
                    <div>
                      <h3 className="font-semibold">Téléphone</h3>
                      <a href={`tel:${startup.phone}`} className="text-blue-600 hover:underline dark:text-blue-400">
                        {startup.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-orange-500" />
                    <div>
                      <h3 className="font-semibold">Adresse</h3>
                      <p>{startup.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>À propos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-orange-500" />
                    <div>
                      <h3 className="font-semibold">Année de création</h3>
                      <p>{startup.founded}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-orange-500" />
                    <div>
                      <h3 className="font-semibold">Équipe</h3>
                      <p>{startup.team}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Award className="h-5 w-5 text-orange-500" />
                    <div>
                      <h3 className="font-semibold">Programme</h3>
                      <p>
                        {startup.program} - Promotion {startup.year}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Réseaux sociaux</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <a
                      href={startup.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-gray-200 p-2 text-gray-700 transition-colors hover:bg-orange-500 hover:text-white dark:bg-gray-700 dark:text-gray-300"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                      </svg>
                    </a>
                    <a
                      href={startup.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-gray-200 p-2 text-gray-700 transition-colors hover:bg-orange-500 hover:text-white dark:bg-gray-700 dark:text-gray-300"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </a>
                    <a
                      href={startup.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-gray-200 p-2 text-gray-700 transition-colors hover:bg-orange-500 hover:text-white dark:bg-gray-700 dark:text-gray-300"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                    <a
                      href={startup.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-gray-200 p-2 text-gray-700 transition-colors hover:bg-orange-500 hover:text-white dark:bg-gray-700 dark:text-gray-300"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>À propos de {startup.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none dark:prose-invert">
                    {startup.longDescription.split("\n\n").map((paragraph, index) => (
                      <p key={index} className="mb-4 text-gray-600 dark:text-gray-300">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Réalisations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {startup.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="rounded-full bg-orange-100 p-1 dark:bg-orange-900">
                          <svg
                            className="h-4 w-4 text-orange-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-600 dark:text-gray-300">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Galerie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {startup.gallery.map((image, index) => (
                      <div key={index} className="relative h-48 overflow-hidden rounded-lg">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${startup.name} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Témoignages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {startup.testimonials.map((testimonial, index) => (
                      <div key={index} className="rounded-lg bg-gray-100 p-6 dark:bg-gray-700">
                        <p className="italic text-gray-600 dark:text-gray-300">"{testimonial.quote}"</p>
                        <div className="mt-4">
                          <p className="font-semibold">{testimonial.author}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Related Startups Section */}
      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Startups similaires</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((_, index) => (
              <Card key={index} className="overflow-hidden transition-all hover:shadow-lg">
                <div className="relative h-48">
                  <Image
                    src="/placeholder.svg?height=200&width=300"
                    alt={`Startup similaire ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 bg-orange-500 px-3 py-1 text-sm text-white">
                    {startup.sector}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Startup similaire {index + 1}</CardTitle>
                  <CardDescription>Tagline de la startup</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Description courte de la startup similaire dans le même secteur d'activité.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline">
                    <Link href={`/startups/liste/startup-${index + 1}`}>
                      En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
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
            <h2 className="text-3xl font-bold sm:text-4xl">Vous avez un projet innovant ?</h2>
            <p className="mt-4 text-lg">
              Rejoignez notre programme d'accompagnement et bénéficiez de notre expertise pour développer votre startup.
            </p>
            <div className="mt-8">
              <Button asChild variant="secondary" size="lg">
                <Link href="/candidatures/fermees">
                  Postuler maintenant <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
