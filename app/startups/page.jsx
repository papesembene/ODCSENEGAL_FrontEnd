"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Check } from "lucide-react"
import {
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Users,
  Rocket,
  Lightbulb,
  Briefcase,
  Network,
  TrendingUp,
  Building,
  Award,
  Globe,
} from "lucide-react"

import { EventDetails } from "./evenements/eventComponents/EventDetailsDialog";

export default function StartupsPage() {
  // Ajout des états React nécessaires
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

  // Fonction pour gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Fonction pour gérer la soumission du formulaire
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

  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

useEffect(() => {
  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/events/upcoming`)
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des événements')
      }
      
      const data = await response.json()
      setUpcomingEvents(data.events)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  fetchUpcomingEvents()
}, [])

  const programmes = [
    {
      title: "Startup Lab",
      description: "Soutien à l'idéation et au prototypage pour les porteurs de projets innovants.",
      icon: <Lightbulb className="h-10 w-10 text-orange-1" />,
      image: "/asset.jpg",
      link: "/startups/programmes/startup-lab",
      eligibility: "Entrepreneurs en phase d'idéation ou de prototypage",
      benefits: ["Accompagnement personnalisé", "Ateliers et formations", "Prototypage", "Réseau"],
      duration: "3 mois",
    },
    {
      title: "Orange Fab",
      description: "Programme d'accélération intensif pour startups en phase active de croissance.",
      icon: <Rocket className="h-10 w-10 text-orange-1" />,
      image: "/oss2.png",
      link: "/startups/programmes/orange-fab",
      eligibility: "Startups avec un produit sur le marché et une traction significative",
      benefits: [
        "Accélération business",
        "Mentorat de haut niveau",
        "Accès au réseau Orange",
        "Visibilité internationale",
      ],
      duration: "3 mois",
    },
  ]


  const team = [
    {
      name: "Gora Der",
      role: "Chef de département OSS",
      image: "/images/gora-f.jpg  ",
    },
    {
      name: "Alioune Gassama",
      role: "Coach Technique et innovation",
      image: "/images/alioune.jpeg",
    },
    {
      name: "Daniel Jordan Ayenoue",
      role: "Responsable Startup Lab",
      image: "/images/daniel.jpeg",
    },
    {
      name: "Serigne Ndiaye Diop",
      role: "Responsable Orange Fab",
      image: "/images/serigne.jpeg",
    },
  ]

  const coworkingSpaces = [
    {
      name: "Espace de Coworking & 5G lab",
      description: "Espace de travail partagé pour les startups accompagnées.",
      image: "/images/even4.jpg",
      features: ["Postes de travail dédiés", "Salles de réunion", "Internet haut débit", "Espace détente"],
      link: "/startups/programmes/coworking",
    },
  ]

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case "pitch":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "formation":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "workshop":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const startups = [
    {
      name: "AgriTech Sénégal",
      slug: "agritech-senegal",
      tagline: "Révolutionner l'agriculture par la technologie",
      description:
        "Solutions technologiques pour améliorer la productivité agricole et connecter les agriculteurs aux marchés.",
      sector: "AgriTech",
      image: "/images/agritech.jpg",
      website: "https://example.com",
      program: "Orange Fab",
      year: "2022",
    },
    {
      name: "Maad",
      slug: "Maad",
      tagline: "AgriTech",
      description: "Solution de distribution pour les commerçants informels.",
      sector: "EdTech",
      image: "/images/maad.jpg",
      website: "https://example.com",
      program: "Startup Lab",
      year: "2023",
    },
    {
      name: "Talibi",
      slug: "Tech",
      tagline: "Révolutionner l'agriculture par la technologie",
      description: "Plateforme de mise en relation entre étudiants et professeurs particuliers",
      sector: "HealthTech",
      image: "/images/talibi.png",
      website: "https://example.com",
      program: "Orange Fab",
      year: "2021",
    }
  ]

  return (
    <div className="flex flex-col relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[500px]  overflow-hidden">
        <Image
            src="/heross.jpeg"
            alt="Orange Startup Studio"
            fill
            priority
            className="object-cover object-[center_30%]"
          />        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        <div className="container relative z-10 mx-auto flex h-full items-center px-4">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">Accompagnements des startups</h1>
            <p className="mt-6 text-lg sm:text-xl">
              Orange Startup Studio est l'initiative du Groupe Sonatel dédiée à l'accompagnement des startups
              sénégalaises, quel que soit leur stade de développement. Notre mission est de faire émerger des champions
              nationaux et régionaux de l'innovation.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-orange-1 hover:bg-orange-500">
                <Link href="#programmes">
                  Découvrir les programmes <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
             
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Notre Vision
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Créer un écosystème d'innovation dynamique au Sénégal, où les startups peuvent prospérer.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-4">
            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Rocket className="h-8 w-8 text-orange-1" />
                  <CardTitle>Accompagnement</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Programmes sur mesure pour chaque stade de développement de votre startup.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Briefcase className="h-8 w-8 text-orange-1" />
                  <CardTitle>Financement</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Accès à des opportunités de financement adaptées à vos besoins.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Network className="h-8 w-8 text-orange-1" />
                  <CardTitle>Réseau</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Connexion avec un écosystème riche de partenaires, mentors et investisseurs.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <TrendingUp className="h-8 w-8 text-orange-1" />
                  <CardTitle>Croissance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Stratégies et ressources pour accélérer votre développement commercial.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Programmes Section */}
      <section id="programmes" className="bg-gray-50 py-16 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Nos Programmes d'Accompagnement
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Découvrez nos différents programmes adaptés à chaque stade de développement de votre startup.
            </p>
          </div>

          <div className="mt-12">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-3">
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="startup-lab">Ideation</TabsTrigger>
                <TabsTrigger value="orange-fab">Croissance</TabsTrigger>
                {/* <TabsTrigger value="financement">Financement</TabsTrigger> */}
              </TabsList>
              <TabsContent value="all" className="mt-6">
                <div className="max-w-5xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
                  {programmes.map((programme, index) => (
                    <Card key={index} className="overflow-hidden transition-all hover:shadow-lg">
                      <div className="relative h-48">
                        <Image
                          src={programme.image || "/placeholder.svg"}
                          alt={programme.title || "Image de l'événement"}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <Badge className="bg-orange-1 text-white">{programme.duration}</Badge>
                        </div>
                      </div>
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          {programme.icon}
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
                              {programme.benefits.map((benefit, i) => (
                                <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
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
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="startup-lab" className="mt-6">
                <div className="max-w-5xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {programmes
                    .filter((p) => p.title === "Startup Lab")
                    .map((programme, index) => (
                      <Card key={index} className="overflow-hidden transition-all hover:shadow-lg mx-auto max-w-md">
                        <div className="relative h-48">
                          <Image
                            src={programme.image || "/placeholder.svg"}
                            alt={programme.title || "programme"}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-4 left-4">
                            <Badge className="bg-orange-1 text-white">{programme.duration}</Badge>
                          </div>
                        </div>
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            {programme.icon}
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
                                {programme.benefits.map((benefit, i) => (
                                  <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
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
                          <Button asChild>
                            <Link href="/candidatures/fermees">Postuler</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="orange-fab" className="mt-6">
                <div className="max-w-5xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {programmes
                    .filter((p) => p.title === "Orange Fab")
                    .map((programme, index) => (
                      <Card key={index} className="overflow-hidden transition-all hover:shadow-lg mx-auto max-w-md">
                        <div className="relative h-48">
                          <Image
                            src={programme.image || "/placeholder.svg"}
                            alt={programme.title || "Image du programme"}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-4 left-4">
                            <Badge className="bg-orange-1 text-white">{programme.duration}</Badge>
                          </div>
                        </div>
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            {programme.icon}
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
                                {programme.benefits.map((benefit, i) => (
                                  <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
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
                          <Button asChild>
                            <Link href="/candidatures/fermees">Postuler</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Event Section */}
      

      {/* Team Section */}
      <section className="bg-gray-50 py-16 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Notre Équipe
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Rencontrez l'équipe dédiée qui accompagne les startups dans leur développement.
            </p>
          </div>

          <div className="mt-12">
            <div className="relative overflow-hidden">
              <div className="flex animate-scroll">
                {[...team, ...team].map((member, index) => (
                  <div key={index} className="flex-none w-[300px] px-4">
                    <Card className="overflow-hidden h-full">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="relative h-32 w-32 overflow-hidden rounded-full">
                            <Image
                              src={member.image || "/placeholder.svg"}
                              alt={member.name || "Image du membre"}
                              fill
                              className="object-cover"
                            />
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

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-300px * ${team.length}));
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }

        @keyframes scroll-startups {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-350px * ${startups.length}));
          }
        }
        .animate-scroll-startups {
          animation: scroll-startups 40s linear infinite;
        }
        .animate-scroll-startups:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Coworking Section */}
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
            {coworkingSpaces.map((space, index) => (
              <div key={index} className="mb-16 grid gap-8 md:grid-cols-2">
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{space.name}</h3>
                  <p className="mt-4 text-gray-600 dark:text-gray-300">{space.description}</p>
                  <ul className="mt-6 space-y-2">
                    {space.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-600 dark:text-gray-300">
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
                <div className="relative h-[200px] md:h-[250px] overflow-hidden rounded-lg">
                  <Image src={space.image || "/placeholder.svg"} alt={space.name || "Image du space"} fill className="object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Event Details Modal */}
      <EventDetails
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={() => setShowRegistration(true)}
        showRegisterButton={selectedEvent?.id <= 3} // ou votre condition personnalisée
      />

      {/* Registration Modal */}
      <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inscription à l'événement</DialogTitle>
            <DialogDescription>Remplissez le formulaire ci-dessous pour vous inscrire à l'événement.</DialogDescription>
          </DialogHeader>
          {registrationSuccess ? (
            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Inscription réussie !</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Merci pour votre inscription. Vous recevrez bientôt un email de confirmation avec les détails de
                l'événement.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
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
                  <Input id="company" name="company" value={formData.company} onChange={handleInputChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message (optionnel)</Label>
                <Textarea id="message" name="message" value={formData.message} onChange={handleInputChange} rows={4} />
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
