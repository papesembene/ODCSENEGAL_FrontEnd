"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, Briefcase, Calendar, MapPin, Search } from "lucide-react"

// Types pour les offres d'emploi
type OffreEmploi = {
  id: number
  titre: string
  entreprise: string
  logo: string
  lieu: string
  type: string
  categorie: string
  datePublication: string
  competences: string[]
  description: string
  salaire: string
}

// Données simulées pour les offres d'emploi
const offresEmploi: OffreEmploi[] = [
  {
    id: 1,
    titre: "Développeur Full Stack",
    entreprise: "Orange Digital Center",
    logo: "/placeholder.svg?height=400&width=400&text=ODC",
    lieu: "Dakar, Sénégal",
    type: "CDI",
    categorie: "Développement",
    datePublication: "2023-04-01",
    competences: ["React", "Node.js", "MongoDB"],
    description:
      "Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe et participer au développement de nos plateformes numériques innovantes.",
    salaire: "Compétitif",
  },
  {
    id: 2,
    titre: "UX/UI Designer",
    entreprise: "Design Innovation Lab",
    logo: "/placeholder.svg?height=400&width=400&text=DIL",
    lieu: "Dakar, Sénégal",
    type: "CDI",
    categorie: "Design",
    datePublication: "2023-04-05",
    competences: ["Figma", "Adobe XD", "Design Thinking"],
    description:
      "Rejoignez notre équipe de design pour créer des expériences utilisateur exceptionnelles pour nos clients dans divers secteurs.",
    salaire: "Selon profil",
  },
  {
    id: 3,
    titre: "Data Scientist",
    entreprise: "Tech4Africa",
    logo: "/placeholder.svg?height=400&width=400&text=T4A",
    lieu: "Dakar, Sénégal",
    type: "CDD",
    categorie: "Data",
    datePublication: "2023-04-10",
    competences: ["Python", "Machine Learning", "SQL"],
    description:
      "Nous recherchons un Data Scientist pour analyser et interpréter des ensembles de données complexes et développer des modèles prédictifs.",
    salaire: "Compétitif",
  },
  {
    id: 4,
    titre: "Chef de Projet Digital",
    entreprise: "Sonatel",
    logo: "/placeholder.svg?height=400&width=400&text=Sonatel",
    lieu: "Dakar, Sénégal",
    type: "CDI",
    categorie: "Management",
    datePublication: "2023-04-12",
    competences: ["Gestion de projet", "Agile", "Scrum"],
    description:
      "Vous serez responsable de la planification, de l'exécution et de la livraison de projets digitaux pour nos clients clés.",
    salaire: "Selon expérience",
  },
  {
    id: 5,
    titre: "Ingénieur DevOps",
    entreprise: "CloudTech Sénégal",
    logo: "/placeholder.svg?height=400&width=400&text=CTS",
    lieu: "Dakar, Sénégal",
    type: "CDI",
    categorie: "Infrastructure",
    datePublication: "2023-04-15",
    competences: ["Docker", "Kubernetes", "CI/CD"],
    description:
      "Rejoignez notre équipe pour mettre en place et maintenir notre infrastructure cloud et nos pipelines d'intégration continue.",
    salaire: "Compétitif",
  },
  {
    id: 6,
    titre: "Développeur Mobile",
    entreprise: "MobileTech",
    logo: "/placeholder.svg?height=400&width=400&text=MT",
    lieu: "Thiès, Sénégal",
    type: "Freelance",
    categorie: "Développement",
    datePublication: "2023-04-18",
    competences: ["Flutter", "React Native", "Firebase"],
    description:
      "Nous recherchons un développeur mobile talentueux pour créer des applications mobiles innovantes pour nos clients.",
    salaire: "Selon projet",
  },
]

const categories: string[] = ["Toutes", "Développement", "Design", "Data", "Management", "Infrastructure", "Marketing"]
const typesContrat: string[] = ["Tous", "CDI", "CDD", "Stage", "Freelance", "Alternance"]
const lieux: string[] = ["Tous", "Dakar", "Thiès", "Saint-Louis", "Ziguinchor", "Kaolack"]

// Props pour le composant OffreEmploiCard
interface OffreEmploiCardProps {
  offre: OffreEmploi
  index: number
}

// Composant pour les cartes d'offres d'emploi avec animation
const OffreEmploiCard = ({ offre, index }: OffreEmploiCardProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  // Calculer la date relative
  const getRelativeDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return "Hier"
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
    return `Il y a ${Math.floor(diffDays / 30)} mois`
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="h-full overflow-hidden transition-all hover:shadow-lg bg-white dark:bg-gray-900">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
              <Image
                src={offre.logo || "/placeholder.svg"}
                alt={offre.entreprise}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-xl font-bold">{offre.titre}</h3>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{offre.entreprise}</p>

              <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {offre.lieu}
                </div>
                <div className="flex items-center">
                  <Briefcase className="mr-1 h-4 w-4" />
                  {offre.type}
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {getRelativeDate(offre.datePublication)}
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {offre.competences.map((competence, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="border-orange-500/30 bg-orange-500/5 text-orange-700 dark:text-orange-400"
                  >
                    {competence}
                  </Badge>
                ))}
              </div>

              <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{offre.description}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
            <Link href={`/emplois/${offre.id}`}>
              Voir l'offre <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default function EmploisPage() {
  const [selectedCategorie, setSelectedCategorie] = useState<string>("Toutes")
  const [selectedType, setSelectedType] = useState<string>("Tous")
  const [selectedLieu, setSelectedLieu] = useState<string>("Tous")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filteredOffres, setFilteredOffres] = useState<OffreEmploi[]>(offresEmploi)
  const headerRef = useRef<HTMLDivElement>(null)
  const isHeaderInView = useInView(headerRef, { once: true })

  // Filtrer les offres d'emploi en fonction des critères
  const filterOffres = (): OffreEmploi[] => {
    return offresEmploi.filter(
      (offre) =>
        (selectedCategorie === "Toutes" || offre.categorie === selectedCategorie) &&
        (selectedType === "Tous" || offre.type === selectedType) &&
        (selectedLieu === "Tous" || offre.lieu.includes(selectedLieu)) &&
        (searchQuery === "" ||
          offre.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          offre.entreprise.toLowerCase().includes(searchQuery.toLowerCase()) ||
          offre.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          offre.competences.some((comp) => comp.toLowerCase().includes(searchQuery.toLowerCase()))
    ))
  }

  // Mettre à jour les offres filtrées lorsque les filtres changent
  useEffect(() => {
    setFilteredOffres(filterOffres())
  }, [selectedCategorie, selectedType, selectedLieu, searchQuery])

  return (
    <div className="min-h-screen py-8 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <Button
            asChild
            variant="ghost"
            className="mb-4 -ml-4 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-500"
          >
            <Link href="/" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
          </Button>
        </div>

        <div className="mb-8" ref={headerRef}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="mb-2 text-3xl font-bold"
          >
            Offres d&apos;emploi
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400"
          >
            Découvrez les opportunités professionnelles dans le secteur du numérique au Sénégal
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Rechercher une offre..."
                className="pl-9 border-gray-300 dark:border-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Select value={selectedCategorie} onValueChange={setSelectedCategorie}>
                <SelectTrigger className="w-full sm:w-[180px] border-gray-300 dark:border-gray-700">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((categorie) => (
                    <SelectItem key={categorie} value={categorie}>
                      {categorie}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-[180px] border-gray-300 dark:border-gray-700">
                  <SelectValue placeholder="Type de contrat" />
                </SelectTrigger>
                <SelectContent>
                  {typesContrat.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLieu} onValueChange={setSelectedLieu}>
                <SelectTrigger className="w-full sm:w-[180px] border-gray-300 dark:border-gray-700">
                  <SelectValue placeholder="Lieu" />
                </SelectTrigger>
                <SelectContent>
                  {lieux.map((lieu) => (
                    <SelectItem key={lieu} value={lieu}>
                      {lieu}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 gap-6"
          >
            {filteredOffres.length > 0 ? (
              filteredOffres.map((offre, index) => <OffreEmploiCard key={offre.id} offre={offre} index={index} />)
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
              >
                <Search className="mb-4 h-10 w-10 text-gray-500 dark:text-gray-400" />
                <h3 className="mb-2 text-lg font-medium">Aucune offre trouvée</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Aucune offre ne correspond à vos critères de recherche. Essayez de modifier vos filtres.
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-center">
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/emplois/new">Publier une offre d&apos;emploi</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}