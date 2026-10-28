"use client"

import { useState } from "react"
import Link from "@/components/ui/interactive-link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, MapPin, Clock, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ArchivesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState("2023")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const pastEvents = [
    {
      id: 1,
      title: "Hackathon IA pour l'Agriculture",
      date: "20 Avril 2023",
      time: "09:00 - 18:00",
      location: "Orange Digital Center, Dakar",
      description: "Développez des solutions innovantes pour l'agriculture sénégalaise en utilisant l'intelligence artificielle.",
      image: "/placeholder.svg?height=200&width=300",
      category: "Hackathon",
      attendees: 50,
      link: "/startups/evenements/hackathon-ia-agriculture",
      year: "2023",
      details: "Ce hackathon a réuni des développeurs, des data scientists et des experts en agriculture pour créer des solutions innovantes utilisant l'IA.",
      agenda: [
        "09:00 - Accueil",
        "09:30 - Présentation des défis",
        "10:00 - Début du hackathon",
        "17:00 - Présentation des projets",
        "18:00 - Remise des prix"
      ],
      speakers: [
        {
          name: "Alioune Diop",
          role: "Expert en IA",
          image: "/placeholder.svg?height=100&width=100"
        }
      ]
    },
    {
      id: 2,
      title: "Conférence: Fintech en Afrique",
      date: "10 Mars 2023",
      time: "15:00 - 17:00",
      location: "Orange Digital Center, Dakar",
      description: "État des lieux et perspectives de la Fintech en Afrique, avec un focus sur le Sénégal.",
      image: "/placeholder.svg?height=200&width=300",
      category: "Conférence",
      attendees: 60,
      link: "/startups/evenements/conference-fintech-afrique",
      year: "2023",
      details: "Cette conférence a permis de faire le point sur l'évolution de la Fintech en Afrique et d'explorer les opportunités pour le Sénégal.",
      agenda: [
        "15:00 - Introduction",
        "15:30 - Table ronde",
        "16:30 - Questions/Réponses",
        "17:00 - Clôture"
      ],
      speakers: [
        {
          name: "Fatou Diop",
          role: "Expert Fintech",
          image: "/placeholder.svg?height=100&width=100"
        }
      ]
    },
    {
      id: 3,
      title: "Networking: Startups & Corporates",
      date: "15 Février 2023",
      time: "18:00 - 21:00",
      location: "Orange Digital Center, Dakar",
      description: "Rencontrez des représentants de grandes entreprises et explorez des opportunités de collaboration.",
      image: "/placeholder.svg?height=200&width=300",
      category: "Networking",
      attendees: 40,
      link: "/startups/evenements/networking-startups-corporates",
      year: "2023",
      details: "Un événement de networking qui a permis aux startups de rencontrer des représentants de grandes entreprises et d'explorer des opportunités de collaboration.",
      agenda: [
        "18:00 - Accueil",
        "18:30 - Pitchs des startups",
        "19:30 - Networking",
        "21:00 - Clôture"
      ],
      speakers: [
        {
          name: "Thomas Moreau",
          role: "Directeur Innovation",
          image: "/placeholder.svg?height=100&width=100"
        }
      ]
    },
    {
      id: 4,
      title: "Workshop: Growth Hacking",
      date: "20 Décembre 2022",
      time: "14:00 - 17:00",
      location: "Orange Digital Center, Dakar",
      description: "Techniques et stratégies de growth hacking pour accélérer la croissance de votre startup.",
      image: "/placeholder.svg?height=200&width=300",
      category: "Workshop",
      attendees: 25,
      link: "/startups/evenements/workshop-growth-hacking-2022",
      year: "2022",
      details: "Découvrez les techniques de growth hacking qui ont permis à de nombreuses startups de connaître une croissance exponentielle.",
      agenda: [
        "14:00 - Introduction",
        "14:30 - Études de cas",
        "15:30 - Atelier pratique",
        "16:30 - Mise en commun",
        "17:00 - Clôture"
      ],
      speakers: [
        {
          name: "Sophie Lambert",
          role: "Growth Hacker",
          image: "/placeholder.svg?height=100&width=100"
        }
      ]
    }
  ]

  const getCategoryColor = (category) => {
    switch(category.toLowerCase()) {
      case "pitch": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "formation": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "workshop": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "hackathon": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "conférence": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "networking": return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const filteredEvents = pastEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesYear = selectedYear === "all" || event.year === selectedYear
    const matchesCategory = selectedCategory === "all" || event.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesYear && matchesCategory
  })

  const years = ["all", "2023", "2022"]
  const categories = ["all", "Hackathon", "Conférence", "Networking", "Workshop", "Pitch", "Formation"]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/startups/evenements">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux événements
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Archives des événements
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Découvrez tous les événements passés organisés par Orange Startup Studio.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div>
          <Input
            type="text"
            placeholder="Rechercher un événement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>
                  {year === "all" ? "Toutes les années" : year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "Toutes les catégories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden transition-all hover:shadow-lg">
            <div className="relative h-48">
              <Image
                src={event.image || "/placeholder.svg"}
                alt={`Image de l'événement ${event.title} - ${event.category}`}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t/srgb from-black/70 to-transparent p-4">
                <Badge className={getCategoryColor(event.category)}>
                  {event.category}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
              <CardDescription className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{event.location}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">{event.description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={event.link}>
                  Voir le récap <ArrowLeft className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* No Results Message */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Aucun événement trouvé
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Essayez de modifier vos critères de recherche.
          </p>
        </div>
      )}
    </div>
  )
}
