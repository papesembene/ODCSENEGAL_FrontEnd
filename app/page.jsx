"use client"

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
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowRight, 
  BookOpen, 
  Rocket, 
  Lightbulb, 
  Users, 
  ChevronRight, 
  Calendar, 
  Clock, 
  MapPin,
  Check
} from "lucide-react"
import HeroSection from "@/components/home/hero-section"
import StatisticsSection from "@/components/home/statistics-section"
import TestimonialsSection from "@/components/home/testimonials-section"
import PartnersSection from "@/components/home/partners-section"
import NewsMarquee from "@/components/home/news-marquee"
import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion"
import { getUpcomingEvents } from "@/lib/public-api"
import { useInView } from "react-intersection-observer"
import { EventDetails } from "./startups/evenements/eventComponents/EventDetailsDialog"
import { useState, useEffect } from "react"

export default function Home() {
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

  const breakingNews = [
    
  ]

  const [objectifsRef, objectifsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  })

  // Event states
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showRegistration, setShowRegistration] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  })
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getCategoryColor = (category) => {
    switch(category?.toLowerCase()) {
      case "pitch": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "formation": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "workshop": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "hackathon": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "conférence": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "networking": return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form data:", formData)
    setRegistrationSuccess(true)
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
    })
    setTimeout(() => {
      setShowRegistration(false)
      setRegistrationSuccess(false)
      setSelectedEvent(null)
    }, 3000)
  }

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoading(true)
        const events = await getUpcomingEvents()
        setUpcomingEvents(events)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUpcomingEvents()
  }, [])

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Breaking News */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
{/*         <NewsMarquee news={breakingNews} /> */}
      </motion.div>

      {/* Hero Section */}
      <HeroSection />

      {/* Objectives Section */}
      <motion.section 
        ref={objectifsRef}
        initial="hidden"
        animate={objectifsInView ? "show" : "hidden"}
        variants={staggerContainer(0.1, 0.2)}
        className="bg-white dark:bg-gray-900 py-20 px-4"
      >
        <motion.div
          variants={fadeIn('up', 'tween', 0.2, 1)}
          className="container mx-auto max-w-4xl text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Orange Digital Center (ODC)
          </h2>

          <motion.p 
            variants={fadeIn('up', 'tween', 0.4, 1)}
            className="mt-6 text-xl leading-8 text-gray-600 dark:text-gray-300"
          >
            Initiative de Sonatel, forme aux compétences numériques, favorise l'emploi des jeunes et accompagne les startups innovantes.
          </motion.p>

          <motion.div 
            variants={fadeIn('up', 'tween', 0.6, 1)}
            className="mt-10 flex justify-center"
          >
            <Button asChild size="lg" className="group">
              <Link href="/about" className="flex items-center">
                En savoir plus
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Programs Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl text-center mb-16"
          >
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Nos <span className="text-orange-1">Programmes</span>
            </h2>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
              Découvrez nos espaces innovants conçus pour booster vos compétences
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row justify-center gap-8 max-w-6xl mx-auto">
            {spaces.slice(0, 2).map((space, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <StatisticsSection />
      </motion.div>

      {/* Events Section - Commented out
      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Événements à Venir
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Participez à nos événements pour développer vos compétences et élargir votre réseau.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/startups/evenements">
                Tous les événements <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="mt-12 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="mt-12 text-center text-red-500">
              <p>Aucun événement prévu</p>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Aucun événement à venir pour le moment.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {upcomingEvents.slice(0, 3).map((event) => (
                <Card key={event.id} className="overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative h-48">
                    <Image 
                      src={event.image || "/placeholder-event.jpg"} 
                      alt={event.title || "Image de l'événement"} 
                      fill 
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-event.jpg"
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <Badge className={getCategoryColor(event?.category)}>
                        {event?.category || 'Événement'}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>
                          {event.date ? new Date(event.date).toLocaleDateString('fr-FR', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          }) : "Date à confirmer"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{event.time || "Heure à confirmer"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{event.location || "Lieu à préciser"}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                      {event.description}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedEvent(event)}
                    >
                      Détails <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedEvent(event)
                        setShowRegistration(true)
                      }}
                    >
                      S'inscrire
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      */}

      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <TestimonialsSection />
      </motion.div>

      {/* Partners */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <PartnersSection />
      </motion.div>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative py-16 text-white overflow-hidden"
      >
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
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild className="bg-white text-[#000000] hover:bg-white hover:text-[#000000] border-none h-12 px-6 text-sm md:text-base">
                  <Link href="/odc/candidatures">Postuler à une formation</Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  className="bg-[#000000] text-white hover:bg-[#000000] hover:text-white border-none h-12 px-6 text-sm md:text-base"
                >
                  <Link href="/candidatures/fermees">Postuler à un programme d'accompagnements</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Event Details Dialog */}
      <EventDetails
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={() => setShowRegistration(true)}
        showRegisterButton={true}
      />

      {/* Registration Dialog */}
      <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inscription à l'événement</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour vous inscrire à l'événement.
            </DialogDescription>
          </DialogHeader>
          {registrationSuccess ? (
            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Inscription réussie !
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Merci pour votre inscription. Vous recevrez bientôt un email de confirmation.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message (optionnel)</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRegistration(false)}>
                  Annuler
                </Button>
                <Button type="submit">S'inscrire</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
