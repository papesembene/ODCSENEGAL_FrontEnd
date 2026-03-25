"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchIcon, ArrowRight, BookOpen, Rocket, Users, Lightbulb } from "lucide-react"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Mock data for search results
  const allResults = [
    {
      type: "formation",
      title: "Développement Web Full Stack",
      description: "Formation intensive de 6 mois pour devenir développeur web full stack.",
      link: "/competences/formations/dev-web",
      image: "/placeholder.svg?height=100&width=200",
      icon: <BookOpen className="h-5 w-5 text-orange-500" />,
    },
    {
      type: "formation",
      title: "Intelligence Artificielle",
      description: "Apprenez les fondamentaux de l'IA et du machine learning.",
      link: "/competences/formations/ia",
      image: "/placeholder.svg?height=100&width=200",
      icon: <BookOpen className="h-5 w-5 text-orange-500" />,
    },
    {
      type: "startup",
      title: "Orange Fab",
      description: "Programme d'accélération pour startups en phase de croissance.",
      link: "/startups/programmes/orange-fab",
      image: "/placeholder.svg?height=100&width=200",
      icon: <Rocket className="h-5 w-5 text-orange-500" />,
    },
    {
      type: "startup",
      title: "Startup Lab",
      description: "Soutien à l'idéation et au prototypage pour les porteurs de projets.",
      link: "/startups/programmes/startup-lab",
      image: "/placeholder.svg?height=100&width=200",
      icon: <Rocket className="h-5 w-5 text-orange-500" />,
    },
    {
      type: "school",
      title: "Programme Full-time",
      description: "Formation intensive pour entrepreneurs débutants.",
      link: "/startup-school/programmes/full-time",
      image: "/placeholder.svg?height=100&width=200",
      icon: <Users className="h-5 w-5 text-orange-500" />,
    },
    {
      type: "connect",
      title: "Défis d'Innovation",
      description: "Participez à des défis lancés par des entreprises et institutions.",
      link: "/connect/defis",
      image: "/placeholder.svg?height=100&width=200",
      icon: <Lightbulb className="h-5 w-5 text-orange-500" />,
    },
  ]

  // Filter results based on search query and active tab
  const filteredResults = allResults.filter((result) => {
    const matchesQuery =
      searchQuery === "" ||
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab = activeTab === "all" || result.type === activeTab

    return matchesQuery && matchesTab
  })

  const handleSearch = (e) => {
    e.preventDefault()
    // In a real application, this would trigger a search API call
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Recherche</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Trouvez des formations, des programmes d'accompagnement, des événements et plus encore.
        </p>

        <form onSubmit={handleSearch} className="mt-8">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Rechercher</Button>
          </div>
        </form>

        <Tabs defaultValue="all" className="mt-8" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Tout</TabsTrigger>
            <TabsTrigger value="formation">Formations</TabsTrigger>
            <TabsTrigger value="startup">Startups</TabsTrigger>
            <TabsTrigger value="school">École</TabsTrigger>
            <TabsTrigger value="connect">Connect</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <ResultsList results={filteredResults} />
          </TabsContent>
          <TabsContent value="formation" className="mt-6">
            <ResultsList results={filteredResults} />
          </TabsContent>
          <TabsContent value="startup" className="mt-6">
            <ResultsList results={filteredResults} />
          </TabsContent>
          <TabsContent value="school" className="mt-6">
            <ResultsList results={filteredResults} />
          </TabsContent>
          <TabsContent value="connect" className="mt-6">
            <ResultsList results={filteredResults} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const ResultsList = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="mt-8 text-center">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Aucun résultat trouvé. Essayez avec d'autres termes de recherche.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-6">
      {results.map((result, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="relative h-48 w-full md:h-auto md:w-1/3">
              <Image src={result.image || "/placeholder.svg"} alt={result.title} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  {result.icon}
                  <CardTitle>{result.title}</CardTitle>
                </div>
                <CardDescription className="text-base">{result.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href={result.link}>
                    En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
