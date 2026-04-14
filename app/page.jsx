
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
  ArrowRight,
  BookOpen,
  Rocket,
} from "lucide-react"
import HeroSection from "@/components/home/hero-section"
import StatisticsSection from "@/components/home/statistics-section"
import TestimonialsSection from "@/components/home/testimonials-section"
import PartnersSection from "@/components/home/partners-section"
import AnimatedSection from "@/components/AnimatedSection"
import { getUpcomingEvents } from "@/lib/public-api"
import HomeEventsSection from "@/components/home/HomeEventsSection"

export default async function Home() {
  const spaces = [
    {
      title: "Développement des Compétences Numériques",
      description: "Formations gratuites dans les métiers du numérique pour favoriser l'employabilité des jeunes.",
      icon: <BookOpen className="h-10 w-10 text-orange-1" />,
      link: "/competences",
      image: "/odc2Accueil.jpg"
    },
    {
      title: "Accompagnement des Startups",
      description: "Programmes d'accompagnement sur mesure pour les startups à tous les stades de développement.",
      icon: <Rocket className="h-10 w-10 text-orange-1" />,
      link: "/startups",
      image: "/oss1.png"
    },
  ]

  let upcomingEvents = []
  try {
    upcomingEvents = await getUpcomingEvents()
  } catch (err) {
    console.error("Failed to fetch events:", err)
  }

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* Objectives Section */}
      <section className="bg-white dark:bg-gray-900 py-20 px-4">
        <AnimatedSection className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Orange Digital Center (ODC)
          </h2>

          <p className="mt-6 text-xl leading-8 text-gray-600 dark:text-gray-300">
            Initiative de Sonatel, forme aux compétences numériques, favorise l'emploi des jeunes et accompagne les startups innovantes.
          </p>

          <div className="mt-10 flex justify-center">
            <Button asChild size="lg" className="group">
              <Link href="/about" className="flex items-center">
                En savoir plus
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
              </Link>
            </Button>
          </div>
        </AnimatedSection>
      </section>

      {/* Programs Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 py-20 px-4">
        <div className="container mx-auto">
          <AnimatedSection className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Nos <span className="text-orange-1">Programmes</span>
            </h2>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
              Découvrez nos espaces innovants conçus pour booster vos compétences
            </p>
          </AnimatedSection>

          <div className="flex flex-col md:flex-row justify-center gap-8 max-w-6xl mx-auto">
            {spaces.slice(0, 2).map((space, index) => (
              <AnimatedSection
                key={index}
                delay={index * 0.15}
                className="w-full md:w-1/2 lg:w-1/3"
              >
                <Card className="h-full flex flex-col group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={space.image}
                      alt={space.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                  </div>

                  <CardHeader className="px-6 pt-6">
                    <CardTitle className="text-2xl font-bold group-hover:text-orange-1 transition-colors duration-300">
                      {space.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-6 pb-4 flex-grow">
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      {space.description}
                    </p>
                  </CardContent>

                  <CardFooter className="px-6 pb-6">
                    <Button asChild variant="outline" className="w-full group/button border-orange-1 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                      <Link href={space.link} className="flex items-center justify-between">
                        <span className="font-medium group-hover/button:text-orange-1 transition-colors duration-300">
                          Explorer le programme
                        </span>
                        <ArrowRight className="h-5 w-5 transition-transform group-hover/button:translate-x-2" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <StatisticsSection />

      {/* Events Section */}
      <HomeEventsSection upcomingEvents={upcomingEvents} />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Partners */}
      <PartnersSection />

      {/* CTA Section */}
      <section className="relative py-16 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-1 to-[#CC6200] animate-gradient-x" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl drop-shadow-md">
              Prêt à rejoindre l'aventure ?
            </h2>
            <p className="mt-4 text-lg drop-shadow-md">
              Que vous soyez étudiant, entrepreneur ou professionnel, Orange Digital Center a un programme adapté à vos besoins.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <AnimatedSection>
                <Button asChild className="bg-white text-[#000000] hover:bg-white hover:text-[#000000] border-none h-12 px-6 text-sm md:text-base">
                  <Link href="/odc/candidatures">Postuler à une formation</Link>
                </Button>
              </AnimatedSection>
              <AnimatedSection>
                <Button
                  asChild
                  className="bg-[#000000] text-white hover:bg-[#000000] hover:text-white border-none h-12 px-6 text-sm md:text-base"
                >
                  <Link href="/candidatures/fermees">Postuler à un programme d'accompagnements</Link>
                </Button>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
