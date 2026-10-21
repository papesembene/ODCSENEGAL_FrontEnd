"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Clock, Plus, Search, Users } from "lucide-react"

const challengeCategories = [
  "Tous",
  "Santé",
  "Éducation",
  "Agriculture",
  "Énergie",
  "Finance",
  "Transport",
  "Environnement",
]

const challenges = [
  {
    id: 1,
    title: "Optimisation de la gestion des déchets urbains",
    organization: "Ministère de l'Environnement",
    type: "Administration",
    category: "Environnement",
    deadline: "15 juin 2023",
    participants: 12,
    status: "En cours",
    description:
      "Développer une solution innovante pour optimiser la collecte et le traitement des déchets urbains dans les grandes villes du Sénégal.",
  },
  {
    id: 2,
    title: "Plateforme de télémédecine pour zones rurales",
    organization: "Orange Healthcare",
    type: "Entreprise",
    category: "Santé",
    deadline: "30 juin 2023",
    participants: 8,
    status: "En cours",
    description:
      "Concevoir une solution de télémédecine adaptée aux contraintes des zones rurales (connectivité limitée, faible alphabétisation numérique).",
  },
  {
    id: 3,
    title: "Système de paiement mobile pour microfinance",
    organization: "Banque Centrale",
    type: "Administration",
    category: "Finance",
    deadline: "10 juillet 2023",
    participants: 15,
    status: "En cours",
    description:
      "Développer une solution de paiement mobile sécurisée et accessible pour les institutions de microfinance opérant dans les zones rurales.",
  },
  {
    id: 4,
    title: "Plateforme d'apprentissage en ligne pour écoles primaires",
    organization: "Ministère de l'Éducation",
    type: "Administration",
    category: "Éducation",
    deadline: "20 juillet 2023",
    participants: 7,
    status: "En cours",
    description:
      "Créer une plateforme d'apprentissage en ligne adaptée aux programmes scolaires sénégalais et accessible même avec une connexion internet limitée.",
  },
  {
    id: 5,
    title: "Solution de traçabilité pour produits agricoles",
    organization: "Sonatel Agritech",
    type: "Entreprise",
    category: "Agriculture",
    deadline: "5 août 2023",
    participants: 10,
    status: "En cours",
    description:
      "Développer un système de traçabilité des produits agricoles du producteur au consommateur, basé sur la blockchain ou d'autres technologies innovantes.",
  },
]

export default function ChallengesSection() {
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)

  const filteredChallenges = challenges.filter(
    (challenge) =>
      (selectedCategory === "Tous" || challenge.category === selectedCategory) &&
      (searchQuery === "" ||
        challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.organization.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Défis d&apos;Innovation</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
          Découvrez les défis d&apos;innovation lancés par les administrations publiques, les entreprises et les
          universités. Proposez vos solutions innovantes et collaborez avec les porteurs de défis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un défi..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {challengeCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Publier un défi</span>
                    <span className="sm:hidden">Publier</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Publier un nouveau défi d&apos;innovation</DialogTitle>
                    <DialogDescription>
                      Décrivez votre défi d&apos;innovation et les solutions que vous recherchez.
                    </DialogDescription>
                  </DialogHeader>
                  <form className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="challenge-title">Titre du défi</Label>
                        <Input id="challenge-title" placeholder="Ex: Optimisation de la gestion des déchets urbains" />
                      </div>
                      <div>
                        <Label htmlFor="challenge-description">Description du défi</Label>
                        <Textarea
                          id="challenge-description"
                          placeholder="Décrivez le problème à résoudre et les object"
                          rows={5}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="challenge-category">Catégorie</Label>
                          <Select>
                            <SelectTrigger id="challenge-category">
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              {challengeCategories
                                .filter((cat) => cat !== "Tous")
                                .map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="challenge-deadline">Date limite</Label>
                          <Input id="challenge-deadline" type="date" />
                        </div>
                      </div>
                      <div>
                        <Label>Type d&apos;organisation</Label>
                        <RadioGroup defaultValue="administration" className="flex flex-col space-y-1 mt-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="administration" id="administration" />
                            <Label htmlFor="administration" className="font-normal">
                              Administration publique
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="entreprise" id="entreprise" />
                            <Label htmlFor="entreprise" className="font-normal">
                              Entreprise
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="universite" id="universite" />
                            <Label htmlFor="universite" className="font-normal">
                              Université / Recherche
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit" onClick={() => setIsFormOpen(false)}>
                        Publier le défi
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-4">
            {filteredChallenges.length > 0 ? (
              filteredChallenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{challenge.title}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <span>{challenge.organization}</span>
                            <span className="mx-2">•</span>
                            <Badge variant="outline">{challenge.type}</Badge>
                          </CardDescription>
                        </div>
                        <Badge
                          className={
                            challenge.status === "En cours"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          }
                        >
                          {challenge.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{challenge.description}</p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Badge variant="secondary">{challenge.category}</Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Deadline: {challenge.deadline}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{challenge.participants} participants</span>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">Aucun défi ne correspond à votre recherche</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <Card className="bg-linear-to-br/srgb from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-0 shadow-md">
            <CardHeader>
              <CardTitle>Comment ça marche ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <div className="shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5 text-blue-600 dark:text-blue-400 font-semibold">
                  1
                </div>
                <p className="ml-4 text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Publiez un défi</span> : Décrivez le problème à résoudre et les
                  objectifs à atteindre.
                </p>
              </div>
              <div className="flex items-start">
                <div className="shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5 text-blue-600 dark:text-blue-400 font-semibold">
                  2
                </div>
                <p className="ml-4 text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Recevez des propositions</span> : Les startups et innovateurs
                  soumettent leurs solutions.
                </p>
              </div>
              <div className="flex items-start">
                <div className="shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5 text-blue-600 dark:text-blue-400 font-semibold">
                  3
                </div>
                <p className="ml-4 text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Échangez et affinez</span> : Discutez avec les porteurs de solutions
                  pour améliorer les propositions.
                </p>
              </div>
              <div className="flex items-start">
                <div className="shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5 text-blue-600 dark:text-blue-400 font-semibold">
                  4
                </div>
                <p className="ml-4 text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Collaborez</span> : Travaillez ensemble pour développer et déployer la
                  solution.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => setIsFormOpen(true)}>
                Publier un défi
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Défis actifs</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Solutions proposées</span>
                <span className="font-semibold">47</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Projets en cours</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Solutions déployées</span>
                <span className="font-semibold">15</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
