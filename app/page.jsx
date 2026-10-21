"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
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
import PortalAnnouncementsSection from "@/components/home/portal-announcements-section"
import PortalNewsSection from "@/components/home/portal-news-section"
import StatisticsSection from "@/components/home/statistics-section"
import TestimonialsSection from "@/components/home/testimonials-section"
import PartnersSection from "@/components/home/partners-section"
import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion"
import { useInView } from "react-intersection-observer"

const HOME_SPACES = [
  {
    title: "Développement des Compétences Numériques",
    description: "Formations gratuites dans les métiers du numérique pour favoriser l'employabilité des jeunes.",
    icon: <BookOpen className="h-10 w-10 text-orange-1" />,
    link: "/competences",
    image: "/odc2Accueil.jpg",
  },
  {
    title: "Accompagnement des Startups",
    description: "Programmes d'accompagnement sur mesure pour les startups à tous les stades de développement.",
    icon: <Rocket className="h-10 w-10 text-orange-1" />,
    link: "/startups",
    image: "/oss1.png",
  },
]

export default function Home() {
  const [objectifsRef, objectifsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  })

  return (
    <div className="flex flex-col overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
      </motion.div>

      <HeroSection />
      <PortalAnnouncementsSection />
      <PortalNewsSection />

      <motion.section 
        ref={objectifsRef}
        initial="hidden"
        animate={objectifsInView ? "show" : "hidden"}
        variants={staggerContainer(0.1, 0.2)}
        className="bg-white px-4 py-12 dark:bg-gray-950 md:py-14"
      >
        <motion.div
          variants={fadeIn('up', 'tween', 0.2, 1)}
          className="container mx-auto max-w-4xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-4xl">
              Orange Digital Center <span className="text-orange-600">(ODC)</span>
          </h2>

          <motion.p 
            variants={fadeIn('up', 'tween', 0.4, 1)}
            className="mx-auto mt-4 max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-300 sm:text-lg"
          >
            Initiative de Sonatel, forme aux compétences numériques, favorise l'emploi des jeunes et accompagne les startups innovantes.
          </motion.p>

          <motion.div 
            variants={fadeIn('up', 'tween', 0.6, 1)}
            className="mt-7 flex justify-center"
          >
            <Button asChild size="lg" className="group rounded-full bg-orange-1 px-7 text-black hover:bg-orange-500">
              <Link href="/about" className="flex items-center">
                En savoir plus
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>

      <section className="relative overflow-hidden bg-white px-4 py-24 dark:bg-gray-950">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r/srgb from-transparent via-orange-500/50 to-transparent" />
        <div className="absolute right-[-8rem] top-24 h-96 w-96 rounded-full bg-orange-100 blur-3xl dark:bg-orange-500/10" />
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl text-center mb-16"
          >
            <span className="inline-flex rounded-full bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
              Deux portes d'entrée
            </span>
            <h2 className="mt-5 text-4xl font-black tracking-tight text-gray-950 dark:text-white sm:text-5xl">
              Nos <span className="text-orange-1">Programmes</span>
            </h2>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
              Découvrez nos espaces innovants conçus pour booster vos compétences
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
            {HOME_SPACES.map((space, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <Card className="group relative h-full overflow-hidden rounded-[2rem] border border-gray-200/80 bg-white shadow-xl shadow-gray-200/70 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-200/60 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                  <div className="relative h-72 overflow-hidden">
                    <Image 
                      src={space.image} 
                      alt={space.title} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t/srgb from-black/80 via-black/15 to-transparent" />
                    <div className="absolute bottom-5 left-5 rounded-2xl border border-white/20 bg-white/15 p-3 text-white backdrop-blur-md">
                      {space.icon}
                    </div>
                  </div>
                  
                  <CardHeader className="px-7 pt-7">
                    <CardTitle className="text-2xl font-black leading-tight text-gray-950 transition-colors duration-300 group-hover:text-orange-1 dark:text-white">
                      {space.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="grow px-7 pb-5">
                    <p className="text-lg leading-8 text-gray-600 dark:text-gray-300">
                      {space.description}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="px-7 pb-7">
                    <Button asChild variant="outline" className="group/button h-12 w-full rounded-full border-orange-1 bg-orange-50/60 font-bold hover:bg-orange-1 hover:text-black dark:bg-orange-500/10 dark:hover:bg-orange-500">
                      <Link href={space.link} className="flex items-center justify-between">
                        <span>
                          Explorer le programme
                        </span>
                        <ArrowRight className="h-5 w-5 transition-transform group-hover/button:translate-x-2" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <StatisticsSection />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <TestimonialsSection />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <PartnersSection />
      </motion.div>

      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative overflow-hidden py-20 text-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.28),transparent_28%),linear-gradient(135deg,#111111_0%,#FF7900_55%,#b84d00_100%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/15 bg-white/10 p-8 text-center shadow-2xl shadow-black/20 backdrop-blur-md sm:p-12">
            <h2 className="text-3xl font-black sm:text-5xl drop-shadow-md">
              Prêt à rejoindre l'aventure ?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/90 drop-shadow-md">
              Que vous soyez étudiant, entrepreneur ou professionnel, Orange Digital Center a un programme adapté à vos besoins.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild className="h-12 rounded-full border-none bg-white px-6 text-sm font-bold text-black hover:bg-white hover:text-black md:text-base">
                  <Link href="/odc/candidatures">Postuler à une formation</Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  className="h-12 rounded-full border border-white/20 bg-black text-sm font-bold text-white hover:bg-black hover:text-white md:text-base"
                >
                  <Link href="/candidatures/fermees">Postuler à un programme d'accompagnements</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
