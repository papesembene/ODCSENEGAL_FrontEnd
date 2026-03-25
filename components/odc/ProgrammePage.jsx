"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, PenToolIcon as Tool, Lightbulb, MapPin, Calendar, ArrowRight, BookOpen } from "lucide-react"
import { motion } from "framer-motion"

export default function ProgrammesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#ff7900] to-[#ff9d4d] py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link href="/competences">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>
          </div>
          <div className="mx-auto max-w-3xl text-center text-white">
            <h1 className="text-4xl font-bold sm:text-5xl">Nos Programmes</h1>
            <p className="mt-4 text-xl">
              Découvrez nos différents programmes d'accompagnement et de formation pour développer les compétences
              numériques au Sénégal.
            </p>
          </div>
        </div>
      </section>

      {/* ODC Clubs Section - Sans photos */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white mr-4">
                  <Users size={32} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">ODC Clubs</h2>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Des communautés d'apprentissage et d'innovation dans les universités sénégalaises.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Communautés d'apprentissage dans les universités
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                  Les ODC Clubs sont des communautés d'étudiants passionnés par la technologie, présentes dans plusieurs
                  universités du Sénégal. Ces clubs permettent aux étudiants de développer leurs compétences numériques,
                  de collaborer sur des projets innovants et de se connecter avec l'écosystème tech local.
                </p>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                      <MapPin className="text-white" size={20} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">Universités partenaires</h4>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Université Cheikh Anta Diop (UCAD)",
                      "Université Gaston Berger (UGB)",
                      "Université Alioune Diop de Bambey",
                      "Université de Thiès",
                      "Université Assane Seck de Ziguinchor",
                    ].map((university, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-blue-500 font-bold">•</span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{university}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                      <Calendar className="text-white" size={20} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">Activités</h4>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Ateliers de programmation",
                      "Hackathons",
                      "Conférences tech",
                      "Projets collaboratifs",
                      "Mentorat par des professionnels",
                    ].map((activity, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-blue-500 font-bold">•</span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-black p-6 rounded-xl text-white">
                  <h4 className="text-xl font-bold mb-3">Rejoindre un ODC Club</h4>
                  <p className="text-white/80 mb-6">
                    Vous êtes étudiant et souhaitez rejoindre ou créer un ODC Club dans votre université ?
                    Contactez-nous pour plus d'informations.
                  </p>
                  <Button className="w-full bg-blue-500 hover:bg-blue-600">
                    <Users className="mr-2" size={18} />
                    Rejoindre un club
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FabLab Section - Sans photos */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white mr-4">
                  <Tool size={32} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">FabLab (Lab-S)</h2>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Un espace d'innovation, de fabrication numérique et de prototypage ouvert à tous.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Un espace d'innovation et de prototypage
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                  Le Lab-S est un espace de fabrication numérique ouvert à tous, équipé de machines à commande numérique
                  permettant de concevoir et réaliser rapidement des objets. C'est un lieu d'expérimentation, de partage
                  de connaissances et de collaboration entre innovateurs, entrepreneurs et étudiants.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[
                    {
                      icon: <Lightbulb className="text-white" size={20} />,
                      title: "Idéation",
                      description: "Développez vos idées innovantes avec l'accompagnement de nos experts.",
                    },
                    {
                      icon: <Tool className="text-white" size={20} />,
                      title: "Prototypage",
                      description: "Créez des prototypes fonctionnels grâce à nos équipements de pointe.",
                    },
                    {
                      icon: <ArrowRight className="text-white" size={20} />,
                      title: "Production",
                      description: "Réalisez vos projets et lancez vos produits sur le marché.",
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                        {feature.icon}
                      </div>
                      <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                      <p className="text-white/90">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nos équipements</h3>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      "Imprimantes 3D",
                      "Découpeuses laser",
                      "Fraiseuses CNC",
                      "Kits électroniques et robotiques",
                      "Stations de soudure",
                    ].map((equipment, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <span className="text-green-500 font-bold">•</span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{equipment}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
                  <h4 className="text-xl font-bold mb-3">Réservez votre session</h4>
                  <p className="mb-4 text-white/90">
                    Vous avez un projet innovant ? Réservez une session au FabLab pour bénéficier de nos équipements et
                    de l'accompagnement de nos experts.
                  </p>
                  <Button className="w-full bg-white text-green-600 hover:bg-gray-100">
                    Réserver maintenant
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* TechKi Section - Sans photos */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white mr-4">
                  <Lightbulb size={32} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Programme TechKi</h2>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Démocratiser l'accès aux compétences numériques dans les zones rurales et périurbaines.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Présentation du programme</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                  Le programme TechKi est une initiative mobile d'Orange Digital Center Sénégal visant à démocratiser
                  l'accès aux compétences numériques dans les zones rurales et périurbaines. Grâce à des unités mobiles
                  équipées, nous proposons des formations itinérantes pour toucher les jeunes qui n'ont pas accès aux
                  centres de formation traditionnels.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: <BookOpen className="text-white" size={20} />,
                      title: "Formation",
                      description: "Modules de formation adaptés aux besoins locaux et aux niveaux des participants.",
                    },
                    {
                      icon: <Lightbulb className="text-white" size={20} />,
                      title: "Sensibilisation",
                      description:
                        "Ateliers de découverte des métiers du numérique et des opportunités professionnelles.",
                    },
                    {
                      icon: <Calendar className="text-white" size={20} />,
                      title: "Accompagnement",
                      description:
                        "Suivi personnalisé des participants et mise en relation avec l'écosystème entrepreneurial.",
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                        {feature.icon}
                      </div>
                      <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                      <p className="text-white/90">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="bg-black p-6 rounded-xl text-white h-full flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-bold mb-3">Impact du programme</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {[
                        { label: "Régions couvertes", value: "15+" },
                        { label: "Jeunes formés", value: "5000+" },
                        { label: "Partenaires locaux", value: "20+" },
                        { label: "Taux d'insertion", value: "70%" },
                      ].map((item, index) => (
                        <div key={index} className="bg-white/10 p-4 rounded-lg text-center">
                          <div className="text-3xl font-bold text-orange-500 mb-1">{item.value}</div>
                          <p className="text-white/80 text-sm">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-gray-700">
                    <h4 className="text-xl font-bold mb-3">Modalités de participation</h4>
                    <p className="text-white/80 mb-6">
                      Le programme TechKi est accessible gratuitement à tous les jeunes âgés de 18 à 35 ans résidant
                      dans les zones d'intervention. Les sessions sont annoncées à l'avance via les canaux de
                      communication locaux.
                    </p>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">
                      Consulter le calendrier
                      <Calendar size={16} className="ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#ff7900] to-[#ff9d4d] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center text-white">
            <h2 className="text-3xl font-bold sm:text-4xl">Intéressé par nos programmes ?</h2>
            <p className="mt-4 text-xl">
              Contactez-nous pour en savoir plus sur nos programmes et comment y participer.
            </p>
            <div className="mt-8">
              <Button asChild variant="secondary" size="lg">
                <Link href="/odc/contact">
                  Nous contacter <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
