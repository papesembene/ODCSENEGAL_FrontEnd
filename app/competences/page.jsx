
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import AnimatedSection from "@/components/AnimatedSection"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  BookMarked,
  Rocket,
  Award,
  Users,
  Building,
  Wrench,
  Lightbulb,
} from "lucide-react"
import FormationsSection from "@/components/odc/FormationsSection"

export default function CompetencesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <Image
          src="/hero.jpg"
          alt="Développement des Compétences Numériques"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative z-10 mx-auto flex h-full items-center px-4">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Développement des Compétences Numériques</h1>
            <p className="mt-4 text-lg sm:text-xl">
              Des formations gratuites et de qualité dans les métiers du numérique pour favoriser l'employabilité des
              jeunes Sénégalais et Etrangers.
            </p>
            <div className="mt-8">
              <Button className="bg-[#ff7900] hover:bg-[#e56d00] text-white" asChild size="lg">
                <Link href="/odc/candidatures">
                  Postuler maintenant <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white sm:text-4xl">
              Notre Mission
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-800 dark:text-gray-300">
              Offrir aux jeunes Sénégalais des formations gratuites et de qualité dans les métiers du numérique,
              favorisant ainsi leur employabilité et leur insertion professionnelle.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <Card>
              <div className="flex p-6 gap-4">
                <BookOpen className="h-12 w-12 text-[#ff7900] flex-shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-lg font-semibold">Formations Gratuites et Intensives</h3>
                  <div className="pe-4">
                    <p className="text-base mt-2 text-gray-600">
                      Toutes nos formations sont entièrement gratuites et accessibles à tous les jeunes Sénégalais et Étrangers motivés.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex p-6 gap-4">
                <GraduationCap className="h-12 w-12 text-[#ff7900] flex-shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-lg font-semibold">Écosystème intégré pour l'innovation</h3>
                  <div className="pe-4">
                    <p className="text-base mt-2 text-gray-600">
                      Un écosystème intégré réunissant talents, infrastructures et partenaires pour transformer les idées en solutions concrètes.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex p-6 gap-4">
                <BookMarked className="h-12 w-12 text-[#ff7900] flex-shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-lg font-semibold">Inclusion numérique et employabilité des jeunes</h3>
                  <div className="pe-4">
                    <p className="text-base mt-2 text-gray-600">
                      Nous renforçons les compétences des jeunes pour faciliter leur insertion professionnelle dans les métiers du futur.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Réussite Section */}
      <section className="bg-[#ff7900] py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { icon: <Rocket className="h-8 w-8" />, value: "1000+", label: "Jeunes formés depuis 2017" },
              { icon: <Award className="h-8 w-8" />, value: "95%", label: "D'insertions global des jeunes formés" },
              { icon: <Users className="h-8 w-8" />, value: "54%", label: "Taux de féminisation" },
              { icon: <Building className="h-8 w-8" />, value: "5", label: "Partenaires pédagogiques" },
            ].map((stat, index) => (
              <div key={index} className="flex flex-col items-center rounded-lg bg-white/10 p-6 text-center backdrop-blur-sm">
                <div className="mb-4 rounded-full bg-white/30 p-3">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold">{stat.value}</div>
                <div className="mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* École du Code Section */}
      <section className="bg-gray-50 py-16 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="relative h-64 overflow-hidden rounded-lg md:h-auto">
              <Image
                src="/code.jpg"
                alt="École du Code Sonatel Academy"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">
                École du Code Sonatel Academy
              </h2>
              <p className="mt-4 text-lg text-gray-800 dark:text-gray-300">
                Première école de codage gratuite en Afrique de l'Ouest, l'École du Code Sonatel Academy forme les
                jeunes talents aux métiers du numérique à travers des programmes intensifs et pratiques.
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  "Des formations intensives",
                  "Projets concrets et stages en entreprise",
                  "Accompagnement à l'insertion professionnelle"
                ].map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="rounded-full bg-orange-100 p-1 dark:bg-orange-900">
                      <svg className="h-4 w-4 text-[#ff7900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-800 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Formations Section */}
      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white sm:text-4xl">
              Nos Formations
            </h2>
            <p className="mt-4 text-lg text-gray-800 dark:text-gray-300">
              Découvrez notre catalogue de formations dans les métiers du numérique.
            </p>
          </div>
          <FormationsSection />
        </div>
      </section>

      {/* Nos Programmes Section */}
      <section className="bg-gray-50 py-16 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white sm:text-4xl">
              Notre chaîne de valeur
            </h2>
            <p className="mt-4 text-lg text-gray-800 dark:text-gray-300">
              Découvrez nos différents programmes d'accompagnement et de formation.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <Users size={24} />,
                title: "ODC Clubs",
                description: "Des communautés d'apprentissage et d'innovation dans les universités sénégalaises.",
                features: ["Présent dans 4 universités", "Hackathons et ateliers tech", "Mentorat par des professionnels"]
              },
              {
                icon: <Wrench size={24} />,
                title: "FabLab (Lab-S)",
                description: "Un espace d'innovation, de fabrication numérique et de prototypage ouvert à tous.",
                features: ["Imprimantes 3D et découpeuses laser", "Accompagnement au prototypage", "Espace de co-création"]
              },
              {
                icon: <Lightbulb size={24} />,
                title: "Acculturation numérique : Tech ki",
                description: "Démocratiser l'accès aux compétences numériques dans les zones rurales et périurbaines.",
                features: ["14 régions couvertes", "5000+ jeunes formés", "Formations itinérantes"]
              }
            ].map((program, index) => (
              <Card key={index} className="overflow-hidden transition-all hover:shadow-lg border-t-4 border-[#ff7900]">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-[#ff7900] flex items-center justify-center text-white">
                      {program.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold text-gray-900 leading-snug">
                        {program.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {program.description}
                  </CardDescription>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <ul className="space-y-2">
                      {program.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center text-sm text-gray-800">
                          <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                            <span className="text-[#ff7900] font-bold text-xs">✓</span>
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <AnimatedSection>
              <Button asChild size="lg" className="bg-orange-1 text-white hover:bg-orange-1 hover:text-white">
                <Link href="/odc/programmes">
                  Découvrir nos programmes <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Candidature Section */}
      <section className="bg-[#ff7900] py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Prêt à développer vos compétences ?</h2>
            <p className="mt-4 text-lg">
              Postulez dès maintenant à nos formations gratuites et lancez votre carrière dans le numérique.
            </p>
            <div className="mt-8">
              <AnimatedSection>
                <Button asChild size="lg" className="bg-[#000000] text-white hover:bg-[#000000] hover:text-white">
                  <Link href="/odc/candidatures">
                    Déposer ma candidature <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}