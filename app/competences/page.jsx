"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  BookMarked,
  Rocket,
  Award,
  Users,
  Building,
  FileText,
  Clock,
  Code,
  Database,
  Cloud,
  UserCheck,
  Laptop,
  Globe,
  LineChart,
  ShieldCheck,
  PenToolIcon as Tool,
  Lightbulb,
} from "lucide-react"
import { useState } from "react"
import odcFormations from "@/data/odcFormations"
import FormationDetails from "@/components/odc/FormationDetails"

export default function CompetencesPage() {
  const [selectedFormation, setSelectedFormation] = useState(null)

  const handleFormationClick = (formation) => {
    setSelectedFormation(formation)
  }

  const handleCloseFormationDetails = () => {
    setSelectedFormation(null)
  }

  // Icônes pour chaque formation
  const formationIcons = {
    1: <Laptop className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />,
    2: <Globe className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />,
    3: <Database className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />,
    4: <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />,
    5: <Cloud className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />,
  }

  // Toutes les formations auront la même couleur orange
  const formationColors = {
    1: "bg-[#ff7900]",
    2: "bg-[#ff7900]",
    3: "bg-[#ff7900]",
    4: "bg-[#ff7900]",
    5: "bg-[#ff7900]",
  }
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <Image
          src="/hero.jpg?height=400&width=1200"
          alt="Développement des Compétences Numériques"
          fill
          className="object-cover"
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
            <div className="flex flex-col items-center rounded-lg bg-white/10 p-6 text-center backdrop-blur-sm">
              <div className="mb-4 rounded-full bg-white/30 p-3">
                <Rocket className="h-8 w-8" />
              </div>
              <div className="text-4xl font-bold">1000+</div>
              <div className="mt-2">Jeunes formés depuis 2017 </div>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-white/10 p-6 text-center backdrop-blur-sm">
              <div className="mb-4 rounded-full bg-white/30 p-3">
                <Award className="h-8 w-8" />
              </div>
              <div className="text-4xl font-bold">95%</div>
              <div className="mt-2">D'insertions global des jeunes formés</div>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-white/10 p-6 text-center backdrop-blur-sm">
              <div className="mb-4 rounded-full bg-white/30 p-3">
                <Users className="h-8 w-8" />
              </div>
              <div className="text-4xl font-bold">54%</div>
              <div className="mt-2">Taux de féminisation</div>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-white/10 p-6 text-center backdrop-blur-sm">
              <div className="mb-4 rounded-full bg-white/30 p-3">
                <Building className="h-8 w-8" />
              </div>
              <div className="text-4xl font-bold">5</div>
              <div className="mt-2">Partenaires pédagogiques</div>
            </div>
          </div>
        </div>
      </section>

      {/* École du Code Section */}
      <section className="bg-gray-50 py-16 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="relative h-64 overflow-hidden rounded-lg md:h-auto">
              <Image
                src="/code.jpg?height=400&width=600"
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
                <li className="flex items-start space-x-3">
                  <div className="rounded-full bg-orange-100 p-1 dark:bg-orange-900">
                    <svg className="h-4 w-4 text-[#ff7900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-800 dark:text-gray-300">Des formations intensives</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="rounded-full bg-orange-100 p-1 dark:bg-orange-900">
                    <svg className="h-4 w-4 text-[#ff7900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-800 dark:text-gray-300">Projets concrets et stages en entreprise</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="rounded-full bg-orange-100 p-1 dark:bg-orange-900">
                    <svg className="h-4 w-4 text-[#ff7900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-800 dark:text-gray-300">Accompagnement à l'insertion professionnelle</span>
                </li>
              </ul>
    
            </div>
          </div>
        </div>
      </section>

      {/* Formations Section - Sans photos */}
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
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {odcFormations.map((formation, index) => (
              <Card
                key={index}
                className="flex flex-col h-full hover:shadow-lg transition-all overflow-hidden border-t-4 border-[#ff7900]"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-4 mb-2">
                    
                    {/* CERCLE INDÉPENDANT */}
                    <div className="min-w-14 min-h-14 w-14 h-14 rounded-full bg-[#ff7900] flex items-center justify-center text-white shadow-md">
                      {formation.id === 1 ? (
                        <Laptop className="h-6 w-6" />
                      ) : formation.id === 2 ? (
                        <Globe className="h-6 w-6" />
                      ) : formation.id === 3 ? (
                        <Database className="h-6 w-6" />
                      ) : formation.id === 4 ? (
                        <Users className="h-6 w-6" />
                      ) : (
                        <Cloud className="h-6 w-6" />
                      )}
                    </div>

                    {/* TEXTE BIEN ISOLÉ */}
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold text-gray-900 leading-snug">
                        {formation.title}
                      </CardTitle>
                    </div>

                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="text-base mb-4">{formation.description}</CardDescription>
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center text-sm text-gray-800 dark:text-gray-400">
                      <Clock size={16} className="mr-2 text-[#ff7900]" />
                      <span>{formation.duration}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-800 dark:text-gray-400">
                      <UserCheck size={16} className="mr-2 text-[#ff7900]" />
                      <span>{formation.level}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-800 dark:text-gray-400">
                      {formation.id === 1 ? (
                        <Code size={16} className="mr-2 text-[#ff7900]" />
                      ) : formation.id === 2 ? (
                        <Globe size={16} className="mr-2 text-[#ff7900]" />
                      ) : formation.id === 3 ? (
                        <LineChart size={16} className="mr-2 text-[#ff7900]" />
                      ) : formation.id === 4 ? (
                        <Users size={16} className="mr-2 text-[#ff7900]" />
                      ) : (
                        <ShieldCheck size={16} className="mr-2 text-[#ff7900]" />
                      )}
                      <span className="line-clamp-1">{formation.careers.split(",")[0]}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-4">
                  <Button
                    className="w-full bg-[#ff7900] hover:bg-[#e56d00] text-white"
                    onClick={() => handleFormationClick(formation)}
                  >
                    En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Nos Programmes Section - Sans photos */}
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
            <Card className="overflow-hidden transition-all hover:shadow-lg border-t-4 border-[#ff7900]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-[#ff7900] flex items-center justify-center text-white">
                    <Users size={24} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-gray-900 leading-snug">
                      ODC Clubs
                    </CardTitle>
                  </div>
                  <CardTitle></CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Des communautés d'apprentissage et d'innovation dans les universités sénégalaises.
                </CardDescription>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-800">
                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                        <span className="text-[#ff7900] font-bold text-xs">✓</span>
                      </div>
                      <span>Présent dans 4 universités</span>
                    </li>
                    <li className="flex items-center text-sm text-gray-800">
                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                        <span className="text-[#ff7900] font-bold text-xs">✓</span>
                      </div>
                      <span>Hackathons et ateliers tech</span>
                    </li>
                    <li className="flex items-center text-sm text-gray-800">
                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                        <span className="text-[#ff7900] font-bold text-xs">✓</span>
                      </div>
                      <span>Mentorat par des professionnels</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transition-all hover:shadow-lg border-t-4 border-[#ff7900]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-[#ff7900] flex items-center justify-center text-white">
                    <Tool size={24} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-gray-900 leading-snug">
                      FabLab (Lab-S)
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Un espace d'innovation, de fabrication numérique et de prototypage ouvert à tous.
                </CardDescription>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-800">
                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                        <span className="text-[#ff7900] font-bold text-xs">✓</span>
                      </div>
                      <span>Imprimantes 3D et découpeuses laser</span>
                    </li>
                    <li className="flex items-center text-sm text-gray-800">
                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                        <span className="text-[#ff7900] font-bold text-xs">✓</span>
                      </div>
                      <span>Accompagnement au prototypage</span>
                    </li>
                    <li className="flex items-center text-sm text-gray-800">
                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                        <span className="text-[#ff7900] font-bold text-xs">✓</span>
                      </div>
                      <span>Espace de co-création</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transition-all hover:shadow-lg border-t-4 border-[#ff7900]">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-[#ff7900] flex items-center justify-center text-white">
                    <Lightbulb size={24} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-gray-900 leading-snug space-x-2">
                      Acculturation numérique : Tech ki
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Démocratiser l'accès aux compétences numériques dans les zones rurales et périurbaines.
                </CardDescription>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-800">
                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                        <span className="text-[#ff7900] font-bold text-xs">✓</span>
                      </div>
                      <span>14 régions couvertes</span>
                    </li>
                    <li className="flex items-center text-sm text-gray-800">
                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                        <span className="text-[#ff7900] font-bold text-xs">✓</span>
                      </div>
                      <span>5000+ jeunes formés</span>
                    </li>
                    <li className="flex items-center text-sm text-gray-800">
                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                        <span className="text-[#ff7900] font-bold text-xs">✓</span>
                      </div>
                      <span>Formations itinérantes</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild size="lg" className="bg-orange-1 text-white hover:bg-orange-1 hover:text-white">
                  <Link href="/odc/programmes">
                    Découvrir nos programmes <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
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
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild size="lg" className="bg-[#000000] text-white hover:bg-[#000000] hover:text-white">
                  <Link href="/odc/candidatures">
                    Déposer ma candidature <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section
      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">
                Ressources Pédagogiques
              </h2>
              <p className="mt-4 text-lg text-gray-800 dark:text-gray-300">
                Accédez à une variété de ressources pédagogiques pour approfondir vos connaissances et compléter votre
                formation.
              </p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-[#ff7900]" />
                  <span className="text-gray-800 dark:text-gray-300">Supports de cours et tutoriels</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-[#ff7900]" />
                  <span className="text-gray-800 dark:text-gray-300">Webinaires et conférences enregistrés</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-[#ff7900]" />
                  <span className="text-gray-800 dark:text-gray-300">Exercices pratiques et projets</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-[#ff7900]" />
                  <span className="text-gray-800 dark:text-gray-300">Bibliothèque de références techniques</span>
                </li>
              </ul>
              <div className="mt-8">
                <Button className="bg-[#ff7900] hover:bg-[#e56d00] text-white" asChild>
                  <Link href="/odc/ressources">
                    Accéder aux ressources <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative h-64 overflow-hidden rounded-lg md:h-auto">
              <Image
                src="/image1.jpg?height=400&width=600"
                alt="Ressources Pédagogiques"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>  */}

      {/* Formation Details Modal */}
      {selectedFormation && <FormationDetails formation={selectedFormation} onClose={handleCloseFormationDetails} />}
    </div>
  )
}