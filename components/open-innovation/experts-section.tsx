"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Linkedin, Mail, Search, Star, Users } from "lucide-react"

const expertiseAreas = [
  "Tous",
  "Technologie",
  "Business",
  "Finance",
  "Marketing",
  "Juridique",
  "Design",
  "Santé",
  "Agriculture",
  "Énergie",
]

const experts = [
  {
    id: 1,
    name: "Dr. Aminata Diop",
    title: "Experte en IA et Big Data",
    organization: "Université Cheikh Anta Diop",
    expertise: ["Technologie", "IA", "Data Science"],
    rating: 4.9,
    projects: 12,
    availability: "Disponible",
    image: "/placeholder.svg?height=400&width=400&text=AD",
    bio: "Docteure en Intelligence Artificielle avec plus de 15 ans d'expérience dans le développement d'algorithmes d'apprentissage automatique et l'analyse de données massives. Spécialisée dans les applications de l'IA pour le développement durable en Afrique.",
  },
  {
    id: 2,
    name: "Moussa Sall",
    title: "Expert en Fintech",
    organization: "Orange Money",
    expertise: ["Finance", "Mobile Banking", "Inclusion Financière"],
    rating: 4.7,
    projects: 8,
    availability: "Disponible",
    image: "/placeholder.svg?height=400&width=400&text=MS",
    bio: "Pionnier des solutions de paiement mobile en Afrique de l'Ouest avec une expertise approfondie dans les systèmes financiers inclusifs. A contribué au développement de plusieurs solutions fintech adoptées par des millions d'utilisateurs.",
  },
  {
    id: 3,
    name: "Fatou Ndiaye",
    title: "Experte en Droit du Numérique",
    organization: "Cabinet Juridique Digital",
    expertise: ["Juridique", "Propriété Intellectuelle", "RGPD"],
    rating: 4.8,
    projects: 15,
    availability: "Disponible dans 2 semaines",
    image: "/placeholder.svg?height=400&width=400&text=FN",
    bio: "Avocate spécialisée en droit du numérique et propriété intellectuelle. Accompagne startups et entreprises dans leurs problématiques juridiques liées à l'innovation, la protection des données et la conformité réglementaire.",
  },
  {
    id: 4,
    name: "Ibrahim Diallo",
    title: "Expert en Agritech",
    organization: "AgriSenegal Innovation",
    expertise: ["Agriculture", "IoT", "Développement Durable"],
    rating: 4.6,
    projects: 10,
    availability: "Disponible",
    image: "/placeholder.svg?height=400&width=400&text=ID",
    bio: "Ingénieur agronome et entrepreneur tech, spécialisé dans le développement de solutions technologiques pour l'agriculture. A conçu plusieurs systèmes d'irrigation intelligente et plateformes de gestion agricole adoptés dans toute l'Afrique de l'Ouest.",
  },
  {
    id: 5,
    name: "Aissatou Sow",
    title: "Experte en UX/UI Design",
    organization: "Design4Africa",
    expertise: ["Design", "Expérience Utilisateur", "Accessibilité"],
    rating: 4.9,
    projects: 20,
    availability: "Disponible dans 1 semaine",
    image: "/placeholder.svg?height=400&width=400&text=AS",
    bio: "Designer UX/UI primée avec une passion pour la création d'interfaces accessibles et adaptées aux contextes africains. A travaillé sur des projets d'envergure internationale et formé plus de 200 designers à travers le continent.",
  },
  {
    id: 6,
    name: "Mamadou Dieng",
    title: "Expert en Énergie Renouvelable",
    organization: "SunTech Senegal",
    expertise: ["Énergie", "Développement Durable", "Technologie"],
    rating: 4.7,
    projects: 9,
    availability: "Disponible",
    image: "/placeholder.svg?height=400&width=400&text=MD",
    bio: "Ingénieur en énergie solaire avec une expertise dans le déploiement de solutions énergétiques durables en zones rurales. A dirigé plusieurs projets d'électrification rurale combinant technologies solaires et systèmes de gestion intelligente.",
  },
]

export default function ExpertsSection() {
  const [selectedExpertise, setSelectedExpertise] = useState("Tous")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedExpert, setSelectedExpert] = useState<(typeof experts)[0] | null>(null)
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false)

  const filteredExperts = experts.filter(
    (expert) =>
      (selectedExpertise === "Tous" || expert.expertise.includes(selectedExpertise)) &&
      (searchQuery === "" ||
        expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expert.expertise.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()))),
  )

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Réseau d&apos;Experts</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
          Accédez à un réseau de mentors et d&apos;experts pouvant être mobilisés sur vos projets d&apos;innovation.
          Bénéficiez de leur expertise et de leurs conseils pour développer vos solutions.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un expert..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Expertise" />
              </SelectTrigger>
              <SelectContent>
                {expertiseAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExperts.length > 0 ? (
              filteredExperts.map((expert) => (
                <motion.div
                  key={expert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelectedExpert(expert)}
                >
                  <Card
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      selectedExpert?.id === expert.id
                        ? "border-primary border-2"
                        : "border border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-4">
                        <div className="relative h-16 w-16 rounded-full overflow-hidden">
                          <Image
                            src={expert.image || "/placeholder.svg"}
                            alt={expert.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{expert.name}</CardTitle>
                          <CardDescription className="flex flex-col">
                            <span>{expert.title}</span>
                            <span>{expert.organization}</span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {expert.expertise.map((area, index) => (
                          <Badge key={index} variant="secondary">
                            {area}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span>{expert.rating}/5</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-blue-500 mr-1" />
                          <span>{expert.projects} projets</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Badge
                        className={
                          expert.availability.includes("Disponible")
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        }
                      >
                        {expert.availability}
                      </Badge>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">Aucun expert ne correspond à votre recherche</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:w-1/3">
          {selectedExpert ? (
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex flex-col items-center">
                  <div className="relative h-24 w-24 rounded-full overflow-hidden mb-4">
                    <Image
                      src={selectedExpert.image || "/placeholder.svg"}
                      alt={selectedExpert.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardTitle className="text-center">{selectedExpert.name}</CardTitle>
                  <CardDescription className="text-center">
                    {selectedExpert.title}
                    <br />
                    {selectedExpert.organization}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Biographie</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedExpert.bio}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Domaines d&apos;expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedExpert.expertise.map((area, index) => (
                      <Badge key={index} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                    <div className="flex items-center mb-1">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-semibold">Évaluation</span>
                    </div>
                    <span>{selectedExpert.rating}/5</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                    <div className="flex items-center mb-1">
                      <Users className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="font-semibold">Projets</span>
                    </div>
                    <span>{selectedExpert.projects} projets</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                    <div className="flex items-center mb-1">
                      <Calendar className="h-4 w-4 text-green-500 mr-1" />
                      <span className="font-semibold">Disponibilité</span>
                    </div>
                    <span>{selectedExpert.availability}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                    <div className="flex items-center mb-1">
                      <Mail className="h-4 w-4 text-purple-500 mr-1" />
                      <span className="font-semibold">Contact</span>
                    </div>
                    <span>Via plateforme</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Dialog open={isRequestFormOpen} onOpenChange={setIsRequestFormOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Demander un accompagnement</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Demande d&apos;accompagnement</DialogTitle>
                      <DialogDescription>
                        Envoyez une demande d&apos;accompagnement à {selectedExpert.name} pour bénéficier de son
                        expertise sur votre projet.
                      </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="project-name">Nom du projet</Label>
                        <Input id="project-name" placeholder="Ex: Plateforme de télémédecine rurale" />
                      </div>
                      <div>
                        <Label htmlFor="expertise-needed">Expertise recherchée</Label>
                        <Select>
                          <SelectTrigger id="expertise-needed">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedExpert.expertise.map((area, index) => (
                              <SelectItem key={index} value={area}>
                                {area}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="request-description">Description de votre besoin</Label>
                        <Textarea
                          id="request-description"
                          placeholder="Décrivez votre projet et le type d'accompagnement dont vous avez besoin"
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="request-duration">Durée estimée de l&apos;accompagnement</Label>
                        <Select>
                          <SelectTrigger id="request-duration">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ponctuel">Ponctuel (1-2 sessions)</SelectItem>
                            <SelectItem value="court">Court terme (1-2 semaines)</SelectItem>
                            <SelectItem value="moyen">Moyen terme (1-2 mois)</SelectItem>
                            <SelectItem value="long">Long terme (3+ mois)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRequestFormOpen(false)}>
                          Annuler
                        </Button>
                        <Button type="submit" onClick={() => setIsRequestFormOpen(false)}>
                          Envoyer la demande
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1 gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Contacter</span>
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Linkedin className="h-4 w-4" />
                    <span>Profil</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="bg-gray-50 dark:bg-gray-900 border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center h-[400px] text-center p-6">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Sélectionnez un expert</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Cliquez sur un expert pour voir son profil détaillé et demander un accompagnement.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
