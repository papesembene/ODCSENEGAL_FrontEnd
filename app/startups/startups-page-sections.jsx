"use client"

import Image from "next/image"
import Link from "@/components/ui/interactive-link"
import { ArrowRight, Briefcase, Lightbulb, Network, Rocket, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PublicPageHero from "@/components/public-page-hero"

const ICONS = {
  briefcase: Briefcase,
  lightbulb: Lightbulb,
  network: Network,
  rocket: Rocket,
  trendingUp: TrendingUp,
}

export function StartupsHeroSection() {
  return (
    <PublicPageHero eyebrow="Entreprendre et accélérer" title="Accompagnements des startups"
      image="/heross.jpeg" imageClassName="object-[center_30%]"
      description="Orange Startup Studio est l'initiative du Groupe Sonatel dédiée à l'accompagnement des startups sénégalaises, quel que soit leur stade de développement. Notre mission est de faire émerger des champions nationaux et régionaux de l'innovation.">
            <Button asChild size="lg" className="bg-orange-1 hover:bg-orange-500">
              <Link href="#programmes">
                Découvrir les programmes <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
    </PublicPageHero>
  )
}

export function StartupsVisionSection({ valuePropositions }) {
  return (
    <section className="bg-white py-16 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Notre Vision</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Créer un écosystème d&apos;innovation dynamique au Sénégal, où les startups peuvent prospérer.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-4">
          {valuePropositions.map((item) => (
            <ValueCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function StartupsProgrammesSection({ programmes }) {
  return (
    <section id="programmes" className="bg-gray-50 py-16 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Nos Programmes d&apos;Accompagnement
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Découvrez nos différents programmes adaptés à chaque stade de développement de votre startup.
          </p>
        </div>

        <div className="mt-12">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mx-auto grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="startup-lab">Ideation</TabsTrigger>
              <TabsTrigger value="orange-fab">Croissance</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <ProgrammesGrid programmes={programmes} />
            </TabsContent>
            <TabsContent value="startup-lab" className="mt-6">
              <ProgrammesGrid programmes={programmes.filter((programme) => programme.title === "Startup Lab")} compact />
            </TabsContent>
            <TabsContent value="orange-fab" className="mt-6">
              <ProgrammesGrid programmes={programmes.filter((programme) => programme.title === "Orange Fab")} compact />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}

export function StartupsTeamSection({ teamMembers }) {
  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Notre Équipe</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Rencontrez l&apos;équipe dédiée qui accompagne les startups dans leur développement.
          </p>
        </div>

        <div className="mt-12">
          <div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((member) => (
                <div key={member.name} className="min-w-0">
                  <Card className="h-full overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="relative h-32 w-32 overflow-hidden rounded-full">
                          <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">{member.name}</h3>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function StartupsCoworkingSection({ coworkingSpaces }) {
  return (
    <section className="bg-white py-16 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Espaces et Ressources
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Découvrez nos espaces de travail et ressources disponibles pour les startups accompagnées.
          </p>
        </div>

        <div className="mt-12">
          {coworkingSpaces.map((space) => (
            <div key={space.name} className="mb-16 grid gap-8 md:grid-cols-2">
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{space.name}</h3>
                <p className="mt-4 text-gray-600 dark:text-gray-300">{space.description}</p>
                <ul className="mt-6 space-y-2">
                  {space.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-600 dark:text-gray-300">
                      <div className="mr-2 h-1.5 w-1.5 rounded-full bg-orange-1"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button asChild variant="outline" className="w-full md:w-auto">
                    <Link href={space.link}>
                      Découvrir <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative h-[200px] overflow-hidden rounded-lg md:h-[250px]">
                <Image src={space.image || "/placeholder.svg"} alt={space.name} fill className="object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function StartupsPageAnimations({ teamCount }) {
  return (
    <style>{`
      @keyframes scroll {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(calc(-300px * ${teamCount}));
        }
      }
      .animate-scroll {
        animation: scroll 30s linear infinite;
      }
      .animate-scroll:hover {
        animation-play-state: paused;
      }
    `}</style>
  )
}

function ValueCard({ description, icon, title }) {
  const Icon = ICONS[icon]

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Icon className="h-8 w-8 text-orange-1" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function ProgrammesGrid({ compact = false, programmes }) {
  return (
    <div className={`mx-auto grid max-w-5xl gap-8 ${compact ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-2"}`}>
      {programmes.map((programme) => (
        <ProgrammeCard key={programme.title} programme={programme} compact={compact} />
      ))}
    </div>
  )
}

function ProgrammeCard({ compact, programme }) {
  const Icon = ICONS[programme.icon]

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-lg ${compact ? "mx-auto max-w-md" : ""}`}>
      <div className="relative h-48">
        <Image src={programme.image || "/placeholder.svg"} alt={programme.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t/srgb from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-orange-1 text-white">{programme.duration}</Badge>
        </div>
      </div>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Icon className="h-10 w-10 text-orange-1" />
          <CardTitle>{programme.title}</CardTitle>
        </div>
        <CardDescription className="mt-2">{programme.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Éligibilité</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{programme.eligibility}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Avantages</h4>
            <ul className="mt-1 space-y-1">
              {programme.benefits.map((benefit) => (
                <li key={benefit} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <div className="mr-2 h-1.5 w-1.5 rounded-full bg-orange-1"></div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button asChild variant="outline">
          <Link href={programme.link}>
            En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild className="bg-orange-1 text-white hover:bg-orange-600">
          <Link href="/candidatures/fermees">Postuler</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
