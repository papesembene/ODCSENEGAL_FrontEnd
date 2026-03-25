"use client"
 
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, Rocket, Lightbulb, Globe, Award, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"
 
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
 
// const team = [
//   {
//     name: "Aïda Diop",
//     role: "Directrice",
//     image: "/team/aida.jpg"
//   },
//   {
//     name: "Jean Kébé",
//     role: "Responsable Formations",
//     image: "/team/jean.jpg"
//   },
//   {
//     name: "Fatou Ndiaye",
//     role: "Responsable Incubation",
//     image: "/team/fatou.jpg"
//   },
//   {
//     name: "Moussa Diallo",
//     role: "Responsable Partenariats",
//     image: "/team/moussa.jpg"
//   }
// ]
 
export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-10 dark:opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
            >
              Transformer le numérique au Sénégal
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-xl text-gray-600 dark:text-gray-300"
            >
              Orange Digital Center est le hub d'innovation qui forme aux métiers du numérique, accompagne les startups et connecte les talents.
            </motion.p>
          </div>
        </div>
      </section>
 
      {/* Mission Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="md:w-1/2"
            >
              <Image
                src="/objectifAccueil.png"
                alt="Mission ODC"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="md:w-1/2"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Notre Mission</h2>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
                Orange Digital Center, initiative de Sonatel, est le bras armé de l'État dans la mise en œuvre du new deal technologique pour développer l'emploi des jeunes et accompagner les startups.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow"
                  >
                    <p className="text-2xl font-bold text-orange-500">{stat.value}</p>
                    <p className="text-gray-600 dark:text-gray-300">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>
 
      {/* History Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="md:w-1/2"
            >
              <Image
                src="/odcAccueil.jpeg"
                alt="Histoire ODC"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="md:w-1/2"
            >
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
            </motion.div>
          </div>
        </div>
      </section>
 
      {/* Team Section
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Notre Équipe</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Des experts passionnés par l'innovation et le développement numérique
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-lg aspect-square">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">{member.name}</h3>
                      <p className="text-orange-300">{member.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}
 
      {/* CTA Section */}
      {/* <section className="py-16 bg-orange-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Prêt à rejoindre l'aventure ?</h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto">
            Que vous soyez étudiant, entrepreneur ou partenaire, découvrez comment collaborer avec nous.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button variant="secondary" size="lg">
              Nos Programmes <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="bg-black hover:bg-white hover:text-orange-500">
              Nous Contacter
            </Button>
          </div>
        </div>
      </section> */}
    </div>
  )
}
 