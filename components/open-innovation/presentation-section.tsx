"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building, GraduationCap, Lightbulb, Users, Briefcase, BarChart3 } from "lucide-react"

const beneficiaries = [
  {
    id: "state",
    label: "État",
    icon: <Building className="h-10 w-10 text-blue-500" />,
    title: "Administrations Publiques",
    description:
      "Accélérez la transformation numérique des services publics en collaborant avec des startups innovantes et des experts du secteur.",
    benefits: [
      "Accès à un vivier de solutions innovantes",
      "Modernisation des services publics",
      "Optimisation des ressources",
      "Amélioration de l'expérience citoyen",
    ],
  },
  {
    id: "companies",
    label: "Entreprises",
    icon: <Briefcase className="h-10 w-10 text-purple-500" />,
    title: "Grandes Entreprises",
    description:
      "Développez votre avantage concurrentiel en collaborant avec des startups agiles et en accédant à des technologies de pointe.",
    benefits: [
      "Innovation ouverte et collaborative",
      "Accès à des technologies disruptives",
      "Agilité et rapidité d'exécution",
      "Développement de nouveaux marchés",
    ],
  },
  {
    id: "startups",
    label: "Startups",
    icon: <Lightbulb className="h-10 w-10 text-orange-500" />,
    title: "Startups",
    description:
      "Accélérez votre croissance en collaborant avec de grands groupes et en bénéficiant de l'expertise de mentors reconnus.",
    benefits: [
      "Accès à des marchés et clients potentiels",
      "Visibilité et crédibilité accrues",
      "Accompagnement par des experts",
      "Opportunités de financement",
    ],
  },
  {
    id: "universities",
    label: "Universités",
    icon: <GraduationCap className="h-10 w-10 text-green-500" />,
    title: "Universités & Recherche",
    description:
      "Valorisez vos travaux de recherche et développez des partenariats avec des acteurs économiques pour un impact concret.",
    benefits: [
      "Valorisation de la recherche",
      "Transfert de technologies",
      "Insertion professionnelle des étudiants",
      "Financement de projets innovants",
    ],
  },
  {
    id: "students",
    label: "Étudiants",
    icon: <Users className="h-10 w-10 text-red-500" />,
    title: "Étudiants & Talents",
    description:
      "Développez vos compétences en travaillant sur des projets concrets et construisez votre réseau professionnel.",
    benefits: [
      "Expérience professionnelle concrète",
      "Développement de compétences",
      "Networking avec des professionnels",
      "Opportunités d'emploi et de stage",
    ],
  },
  {
    id: "ecosystem",
    label: "Écosystème",
    icon: <BarChart3 className="h-10 w-10 text-teal-500" />,
    title: "Écosystème d'Innovation",
    description:
      "Renforcez la dynamique d'innovation locale en facilitant les collaborations entre tous les acteurs de l'écosystème.",
    benefits: [
      "Création d'une communauté d'innovation",
      "Partage de ressources et de connaissances",
      "Développement économique local",
      "Attraction et rétention des talents",
    ],
  },
]

export default function PresentationSection() {
  const [activeTab, setActiveTab] = useState("state")

  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">Espace Connect</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          La plateforme collaborative qui connecte tous les acteurs de l&apos;écosystème d&apos;innovation au Sénégal
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="overflow-hidden border-0 bg-linear-to-br/srgb from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 shadow-lg">
          <CardContent className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Notre Mission</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Faciliter la collaboration entre l&apos;État, les grandes entreprises, les startups, les universités,
                  les laboratoires de recherche et les étudiants pour co-créer des solutions innovantes répondant aux
                  défis actuels du Sénégal et de l&apos;Afrique.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                      <svg
                        className="h-4 w-4 text-green-600 dark:text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      Stimuler l&apos;innovation ouverte et collaborative
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                      <svg
                        className="h-4 w-4 text-green-600 dark:text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      Accélérer la transformation numérique du Sénégal
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                      <svg
                        className="h-4 w-4 text-green-600 dark:text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-300">
                      Créer un écosystème d&apos;innovation dynamique et inclusif
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=600&width=800"
                  alt="Collaboration et innovation"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Bénéfices par Acteur</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez comment l&apos;Espace Connect peut bénéficier à chaque type d&apos;acteur de l&apos;écosystème
            d&apos;innovation
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto py-2">
            {beneficiaries.map((beneficiary) => (
              <TabsTrigger key={beneficiary.id} value={beneficiary.id} className="gap-2">
                {beneficiary.icon}
                <span className="hidden sm:inline">{beneficiary.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {beneficiaries.map((beneficiary) => (
            <TabsContent key={beneficiary.id} value={beneficiary.id}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="mb-4">{beneficiary.icon}</div>
                        <h3 className="text-xl font-bold text-center mb-2 text-gray-900 dark:text-white">
                          {beneficiary.title}
                        </h3>
                      </div>
                      <div className="md:w-2/3">
                        <p className="text-gray-600 dark:text-gray-300 mb-6">{beneficiary.description}</p>
                        <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Principaux avantages :</h4>
                        <ul className="space-y-2">
                          {beneficiary.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start">
                              <div className="shrink-0 h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                                <svg
                                  className="h-3 w-3 text-blue-600 dark:text-blue-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              <p className="ml-3 text-gray-600 dark:text-gray-300">{benefit}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
