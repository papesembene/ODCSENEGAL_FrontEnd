"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Clock, FileText, PaperclipIcon, Plus, Send } from "lucide-react"

const mySolutions = [
  {
    id: 1,
    challengeTitle: "Optimisation de la gestion des déchets urbains",
    organization: "Ministère de l'Environnement",
    submittedDate: "10 mai 2023",
    status: "En évaluation",
    lastUpdate: "15 mai 2023",
    description:
      "Notre solution utilise des capteurs IoT pour optimiser les itinéraires de collecte des déchets en fonction du taux de remplissage des conteneurs.",
  },
  {
    id: 2,
    challengeTitle: "Plateforme de télémédecine pour zones rurales",
    organization: "Orange Healthcare",
    submittedDate: "22 mai 2023",
    status: "Présélectionnée",
    lastUpdate: "28 mai 2023",
    description:
      "Application mobile fonctionnant en mode hors ligne permettant aux agents de santé communautaire de consulter des spécialistes à distance.",
  },
]

const discussionMessages = [
  {
    id: 1,
    sender: "Ministère de l'Environnement",
    avatar: "/placeholder.svg?height=40&width=40&text=ME",
    message:
      "Bonjour, nous avons examiné votre proposition et nous sommes intéressés par votre approche. Pourriez-vous nous donner plus de détails sur la durée de vie des capteurs et leur résistance aux conditions extérieures ?",
    timestamp: "15 mai 2023, 14:30",
    isOwn: false,
  },
  {
    id: 2,
    sender: "Votre Startup",
    avatar: "/placeholder.svg?height=40&width=40&text=VS",
    message:
      "Bonjour, merci pour votre intérêt ! Nos capteurs ont une durée de vie de 5 ans et sont conçus pour résister aux conditions extérieures extrêmes (IP67). Ils fonctionnent avec des batteries longue durée et sont équipés de panneaux solaires pour une recharge autonome.",
    timestamp: "15 mai 2023, 15:45",
    isOwn: true,
  },
  {
    id: 3,
    sender: "Ministère de l'Environnement",
    avatar: "/placeholder.svg?height=40&width=40&text=ME",
    message:
      "C'est très intéressant. Avez-vous déjà déployé cette solution dans d'autres villes ? Quels ont été les résultats en termes d'optimisation des coûts de collecte ?",
    timestamp: "16 mai 2023, 09:15",
    isOwn: false,
  },
]

export default function SolutionsSection() {
  const [activeTab, setActiveTab] = useState("my-solutions")
  const [selectedSolution, setSelectedSolution] = useState(mySolutions[0])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send the message to the backend
    setNewMessage("")
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Propositions de Solutions</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
          Soumettez vos solutions innovantes en réponse aux défis publiés, suivez leur évolution et échangez avec les
          porteurs de défis pour affiner vos propositions.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
          <TabsTrigger value="my-solutions">Mes Solutions</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunités</TabsTrigger>
        </TabsList>

        <TabsContent value="my-solutions" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Solutions soumises</h3>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Nouvelle solution</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Soumettre une nouvelle solution</DialogTitle>
                  <DialogDescription>Proposez votre solution en réponse à un défi d&apos;innovation.</DialogDescription>
                </DialogHeader>
                <form className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="challenge-select">Défi concerné</Label>
                      <Select>
                        <SelectTrigger id="challenge-select">
                          <SelectValue placeholder="Sélectionner un défi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="challenge-1">Optimisation de la gestion des déchets urbains</SelectItem>
                          <SelectItem value="challenge-2">Plateforme de télémédecine pour zones rurales</SelectItem>
                          <SelectItem value="challenge-3">Système de paiement mobile pour microfinance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="solution-title">Titre de la solution</Label>
                      <Input id="solution-title" placeholder="Ex: Système IoT de gestion intelligente des déchets" />
                    </div>
                    <div>
                      <Label htmlFor="solution-description">Description de la solution</Label>
                      <Textarea
                        id="solution-description"
                        placeholder="Décrivez votre solution, son fonctionnement et ses avantages"
                        rows={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="solution-file">Documents complémentaires (optionnel)</Label>
                      <div className="mt-2 flex items-center gap-2">
                        <Input id="solution-file" type="file" className="flex-1" />
                        <Button variant="outline" size="sm" type="button">
                          <PaperclipIcon className="h-4 w-4 mr-2" />
                          Joindre
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" onClick={() => setIsFormOpen(false)}>
                      Soumettre
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              {mySolutions.map((solution) => (
                <motion.div
                  key={solution.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelectedSolution(solution)}
                >
                  <Card
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      selectedSolution.id === solution.id
                        ? "border-primary border-2"
                        : "border border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{solution.challengeTitle}</CardTitle>
                        <Badge
                          className={
                            solution.status === "Présélectionnée"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          }
                        >
                          {solution.status}
                        </Badge>
                      </div>
                      <CardDescription>{solution.organization}</CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Soumise le {solution.submittedDate}</span>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-2">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>{selectedSolution.challengeTitle}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center justify-between">
                      <span>{selectedSolution.organization}</span>
                      <Badge
                        className={
                          selectedSolution.status === "Présélectionnée"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        }
                      >
                        {selectedSolution.status}
                      </Badge>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="w-full grid grid-cols-3">
                      <TabsTrigger value="details">Détails</TabsTrigger>
                      <TabsTrigger value="discussion">Discussion</TabsTrigger>
                      <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="space-y-4 mt-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Description de la solution</h4>
                        <p className="text-gray-600 dark:text-gray-300">{selectedSolution.description}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Documents</h4>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <span className="text-gray-600 dark:text-gray-300">Présentation_Solution.pdf</span>
                          <Button variant="ghost" size="sm" className="ml-auto">
                            Télécharger
                          </Button>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Statut actuel</h4>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                selectedSolution.status === "Présélectionnée"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              }
                            >
                              {selectedSolution.status}
                            </Badge>
                            <span className="text-gray-600 dark:text-gray-300">
                              Dernière mise à jour: {selectedSolution.lastUpdate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="discussion" className="mt-4">
                      <div className="flex flex-col h-[400px]">
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                          {discussionMessages.map((message) => (
                            <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                              <div className="flex max-w-[80%]">
                                {!message.isOwn && (
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarImage src={message.avatar} alt={message.sender} />
                                    <AvatarFallback>{message.sender[0]}</AvatarFallback>
                                  </Avatar>
                                )}
                                <div>
                                  <div
                                    className={`rounded-lg p-3 ${
                                      message.isOwn
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-gray-100 dark:bg-gray-800"
                                    }`}
                                  >
                                    <p className="text-sm">{message.message}</p>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {message.isOwn ? "Vous" : message.sender} • {message.timestamp}
                                  </p>
                                </div>
                                {message.isOwn && (
                                  <Avatar className="h-8 w-8 ml-2">
                                    <AvatarImage src={message.avatar} alt={message.sender} />
                                    <AvatarFallback>{message.sender[0]}</AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <Separator />
                        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                          <Input
                            placeholder="Tapez votre message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1"
                          />
                          <Button type="submit" size="icon">
                            <Send className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </TabsContent>
                    <TabsContent value="timeline" className="mt-4">
                      <div className="space-y-6">
                        <div className="relative pl-8 pb-6 border-l-2 border-gray-200 dark:border-gray-800">
                          <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-green-500"></div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Solution soumise</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{selectedSolution.submittedDate}</p>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                              Vous avez soumis votre solution en réponse au défi &quot;
                              {selectedSolution.challengeTitle}&quot;.
                            </p>
                          </div>
                        </div>
                        <div className="relative pl-8 pb-6 border-l-2 border-gray-200 dark:border-gray-800">
                          <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Première évaluation</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">12 mai 2023</p>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                              Votre solution a été examinée par l&apos;équipe de {selectedSolution.organization}.
                            </p>
                          </div>
                        </div>
                        <div className="relative pl-8 pb-6 border-l-2 border-gray-200 dark:border-gray-800">
                          <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-purple-500"></div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Discussion initiée</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">15 mai 2023</p>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                              {selectedSolution.organization} a initié une discussion pour obtenir plus de détails sur
                              votre solution.
                            </p>
                          </div>
                        </div>
                        {selectedSolution.status === "Présélectionnée" && (
                          <div className="relative pl-8">
                            <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-amber-500"></div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">Solution présélectionnée</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">28 mai 2023</p>
                              <p className="mt-2 text-gray-600 dark:text-gray-300">
                                Félicitations ! Votre solution a été présélectionnée pour la phase suivante.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <Button variant="outline">Mettre à jour</Button>
                  <Button>Contacter le porteur de défi</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6 mt-6">
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Découvrez les défis d&apos;innovation
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-lg mx-auto">
              Explorez les défis publiés par les administrations, entreprises et universités et proposez vos solutions
              innovantes.
            </p>
            <Button asChild>
              <a href="#challenges">Voir les défis</a>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
