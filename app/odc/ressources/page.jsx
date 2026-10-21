"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Video, BookOpen, Globe, Download, ExternalLink, Search, ArrowLeft } from "lucide-react"

export default function RessourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const resources = {
    cours: [
      {
        title: "Introduction au développement web",
        description: "Les bases du HTML, CSS et JavaScript pour débutants",
        type: "PDF",
        size: "2.4 MB",
        date: "10/01/2023",
        link: "/ressources/intro-dev-web.pdf",
      },
      {
        title: "React.js pour les débutants",
        description: "Apprendre à créer des interfaces utilisateur avec React",
        type: "PDF",
        size: "3.8 MB",
        date: "15/02/2023",
        link: "/ressources/react-debutants.pdf",
      },
      {
        title: "Python et Data Science",
        description: "Introduction à l'analyse de données avec Python",
        type: "PDF",
        size: "5.2 MB",
        date: "03/03/2023",
        link: "/ressources/python-data-science.pdf",
      },
      {
        title: "Fondamentaux du Cloud Computing",
        description: "Comprendre les concepts et services cloud essentiels",
        type: "PDF",
        size: "4.1 MB",
        date: "22/04/2023",
        link: "/ressources/cloud-computing.pdf",
      },
      {
        title: "Cybersécurité : les bonnes pratiques",
        description: "Guide des pratiques essentielles en sécurité informatique",
        type: "PDF",
        size: "3.5 MB",
        date: "17/05/2023",
        link: "/ressources/cybersecurite.pdf",
      },
    ],
    webinaires: [
      {
        title: "L'avenir de l'IA en Afrique",
        description: "Discussion sur les opportunités et défis de l'IA sur le continent africain",
        duration: "1h 15min",
        date: "05/02/2023",
        link: "/ressources/webinaire-ia-afrique",
      },
      {
        title: "Développer sa carrière tech au Sénégal",
        description: "Conseils et témoignages de professionnels du secteur",
        duration: "58min",
        date: "18/03/2023",
        link: "/ressources/webinaire-carriere-tech",
      },
      {
        title: "Entrepreneuriat numérique : de l'idée au produit",
        description: "Comment transformer une idée en startup tech viable",
        duration: "1h 22min",
        date: "09/04/2023",
        link: "/ressources/webinaire-entrepreneuriat",
      },
      {
        title: "Femmes dans la Tech : briser les barrières",
        description: "Table ronde sur l'inclusion des femmes dans le secteur numérique",
        duration: "1h 05min",
        date: "12/05/2023",
        link: "/ressources/webinaire-femmes-tech",
      },
    ],
    bibliotheque: [
      {
        title: "Clean Code",
        author: "Robert C. Martin",
        description: "Principes pour écrire un code propre et maintenable",
        category: "Développement",
        available: true,
      },
      {
        title: "Design Patterns",
        author: "Erich Gamma et al.",
        description: "Les patterns de conception essentiels en programmation orientée objet",
        category: "Architecture logicielle",
        available: true,
      },
      {
        title: "Python for Data Analysis",
        author: "Wes McKinney",
        description: "Manipulation, analyse et visualisation de données avec Python",
        category: "Data Science",
        available: false,
      },
      {
        title: "Don't Make Me Think",
        author: "Steve Krug",
        description: "Principes d'ergonomie et d'expérience utilisateur pour le web",
        category: "UX/UI Design",
        available: true,
      },
      {
        title: "The Lean Startup",
        author: "Eric Ries",
        description: "Méthodologie pour créer et développer une startup efficacement",
        category: "Entrepreneuriat",
        available: true,
      },
      {
        title: "Cracking the Coding Interview",
        author: "Gayle Laakmann McDowell",
        description: "Préparation aux entretiens techniques dans les entreprises tech",
        category: "Carrière",
        available: false,
      },
    ],
    externes: [
      {
        title: "freeCodeCamp",
        description: "Plateforme d'apprentissage gratuite avec des certifications en développement web",
        link: "https://www.freecodecamp.org/",
        category: "Développement",
      },
      {
        title: "Kaggle",
        description: "Plateforme de compétitions de data science et d'apprentissage",
        link: "https://www.kaggle.com/",
        category: "Data Science",
      },
      {
        title: "AWS Training",
        description: "Formations gratuites sur les services Amazon Web Services",
        link: "https://aws.amazon.com/fr/training/",
        category: "Cloud",
      },
      {
        title: "Google Digital Skills for Africa",
        description: "Programme de formation aux compétences numériques adapté au contexte africain",
        link: "https://learndigital.withgoogle.com/digitalskills/",
        category: "Digital Skills",
      },
      {
        title: "MDN Web Docs",
        description: "Documentation complète sur les technologies web par Mozilla",
        link: "https://developer.mozilla.org/",
        category: "Développement",
      },
      {
        title: "TensorFlow Tutorials",
        description: "Tutoriels officiels pour apprendre le machine learning avec TensorFlow",
        link: "https://www.tensorflow.org/tutorials",
        category: "IA/ML",
      },
    ],
  }

  const filterResources = (items) => {
    if (!searchQuery) return items
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-linear-to-r/srgb from-[#ff7900] to-[#ff9d4d] py-16">
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
            <h1 className="text-4xl font-bold sm:text-5xl">Ressources Pédagogiques</h1>
            <p className="mt-4 text-xl">
              Accédez à notre bibliothèque de ressources pour approfondir vos connaissances et compléter votre
              formation.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white py-8 shadow-md dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-2xl items-center rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
            <Search className="ml-2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une ressource..."
              className="w-full border-0 bg-transparent px-4 py-2 focus:outline-hidden dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mr-2 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="sr-only">Effacer</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Resources Tabs */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="cours" className="mx-auto max-w-6xl">
            <TabsList className="mb-8 grid w-full grid-cols-4">
              <TabsTrigger value="cours" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Supports de cours</span>
              </TabsTrigger>
              <TabsTrigger value="webinaires" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span>Webinaires</span>
              </TabsTrigger>
              <TabsTrigger value="bibliotheque" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Bibliothèque</span>
              </TabsTrigger>
              <TabsTrigger value="externes" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Ressources externes</span>
              </TabsTrigger>
            </TabsList>

            {/* Supports de cours */}
            <TabsContent value="cours">
              <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Supports de cours</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                          Titre
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                          Format
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                          Taille
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterResources(resources.cours).map((resource, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30"
                        >
                          <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {resource.title}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{resource.description}</td>
                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{resource.type}</td>
                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{resource.size}</td>
                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{resource.date}</td>
                          <td className="px-4 py-4 text-sm">
                            <Button asChild variant="outline" size="sm">
                              <a href={resource.link} download>
                                <Download className="mr-2 h-4 w-4" /> Télécharger
                              </a>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filterResources(resources.cours).length === 0 && (
                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                      Aucun résultat trouvé pour "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Webinaires */}
            <TabsContent value="webinaires">
              <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Webinaires et conférences</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {filterResources(resources.webinaires).map((webinar, index) => (
                    <Card key={index} className="flex flex-col h-full">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                            <Video size={24} />
                          </div>
                          <CardTitle>{webinar.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="grow">
                        <CardDescription className="text-base mb-4">{webinar.description}</CardDescription>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>Durée: {webinar.duration}</span>
                          <span>Date: {webinar.date}</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button asChild>
                          <Link href={webinar.link}>
                            Regarder <Video className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                {filterResources(resources.webinaires).length === 0 && (
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    Aucun résultat trouvé pour "{searchQuery}"
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Bibliothèque */}
            <TabsContent value="bibliotheque">
              <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Bibliothèque</h2>
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {filterResources(resources.bibliotheque).map((book, index) => (
                    <div
                      key={index}
                      className="flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="flex h-48 items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
                        <div className="w-24 h-36 bg-linear-to-br/srgb from-orange-500 to-orange-600 rounded-md flex items-center justify-center text-white font-bold p-2 text-center shadow-md">
                          {book.title}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="mb-1 font-bold text-gray-900 dark:text-white">{book.title}</h3>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">par {book.author}</p>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">{book.description}</p>
                        <div className="mt-auto">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{book.category}</span>
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                book.available
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {book.available ? "Disponible" : "Emprunté"}
                            </span>
                          </div>
                          <Button
                            variant={book.available ? "default" : "outline"}
                            className="w-full"
                            disabled={!book.available}
                          >
                            {book.available ? "Réserver" : "Indisponible"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filterResources(resources.bibliotheque).length === 0 && (
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    Aucun résultat trouvé pour "{searchQuery}"
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Ressources externes */}
            <TabsContent value="externes">
              <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Ressources externes</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filterResources(resources.externes).map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-start rounded-lg border p-4 transition-all hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <div className="mr-4 shrink-0">
                        <div className="h-12 w-12 rounded-md bg-orange-100 flex items-center justify-center text-orange-500">
                          <Globe size={24} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-1 font-bold text-gray-900 dark:text-white">{resource.title}</h3>
                        <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">{resource.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            {resource.category}
                          </span>
                          <a
                            href={resource.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm font-medium text-[#ff7900] hover:text-[#e66f00] dark:text-orange-400 dark:hover:text-orange-300"
                          >
                            Visiter <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filterResources(resources.externes).length === 0 && (
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    Aucun résultat trouvé pour "{searchQuery}"
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-100 py-12 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Besoin d'aide ?</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Notre équipe est disponible pour vous aider à trouver les ressources dont vous avez besoin pour votre
              apprentissage.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/odc/contact">Contacter l'équipe pédagogique</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
