
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, Rocket, Lightbulb, Globe, Award, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AnimatedSection from "@/components/AnimatedSection"

const stats = [
  { value: "10,000+", label: "Jeunes formés" },
  { value: "200+", label: "Startups accompagnées" },
  { value: "50+", label: "Partenariats stratégiques" },
  { value: "100%", label: "Engagement pour l'innovation" }
]

const values = [
  {
    icon: <Users className="h-8 w-8 text-orange-500" />,
    title: "Communauté",
    description: "Nous croyons en la force du collectif pour impulser le changement."
  },
  {
    icon: <Rocket className="h-8 w-8 text-orange-500" />,
    title: "Innovation",
    description: "Nous encourageons la créativité et les solutions disruptives."
  },
  {
    icon: <Lightbulb className="h-8 w-8 text-orange-500" />,
    title: "Savoir",
    description: "Le partage des connaissances est au cœur de notre mission."
  },
  {
    icon: <Globe className="h-8 w-8 text-orange-500" />,
    title: "Impact",
    description: "Nous visons une transformation numérique inclusive et durable."
  }
]

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-linear-to-r/srgb from-orange-500 to-orange-600 opacity-10 dark:opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Transformer le numérique au Sénégal
              </h1>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
                Orange Digital Center est le hub d'innovation qui forme aux métiers du numérique, accompagne les startups et connecte les talents.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <AnimatedSection className="md:w-1/2">
              <Image
                src="/objectifAccueil.png"
                alt="Mission ODC"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
              />
            </AnimatedSection>
            <AnimatedSection className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Notre Mission</h2>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
                Orange Digital Center, initiative de Sonatel, est le bras armé de l'État dans la mise en œuvre du new deal technologique pour développer l'emploi des jeunes et accompagner les startups.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                    <p className="text-2xl font-bold text-orange-500">{stat.value}</p>
                    <p className="text-gray-600 dark:text-gray-300">{stat.label}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Nos Valeurs</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Les principes qui guident chacune de nos actions
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <AnimatedSection key={index}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="items-center">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                      {value.icon}
                    </div>
                    <CardTitle className="text-center">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
            <AnimatedSection className="md:w-1/2">
              <Image
                src="/odcAccueil.jpeg"
                alt="Histoire ODC"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
              />
            </AnimatedSection>
            <AnimatedSection className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Notre Histoire</h2>
              <div className="mt-6 space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                    <Award className="h-5 w-5 text-orange-500 dark:text-orange-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold">2019 - Lancement</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Création du premier Orange Digital Center en Afrique de l'Ouest à Dakar.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                    <BookOpen className="h-5 w-5 text-orange-500 dark:text-orange-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold">2021 - Expansion</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Ouverture de nouveaux programmes et partenariats avec les universités.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                    <Rocket className="h-5 w-5 text-orange-500 dark:text-orange-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold">2023 - Accélération</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Lancement du programme Startup School et incubation de 50+ startups.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  )
}
