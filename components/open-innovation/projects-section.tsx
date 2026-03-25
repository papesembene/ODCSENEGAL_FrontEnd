"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, CheckCircle2, Clock, FileText, Plus, Users, XCircle } from "lucide-react"

const projects = [
  {
    id: 1,
    title: "Plateforme de télémédecine rurale",
    organization: "Orange Healthcare",
    collaborators: [
      { name: "Votre Startup", avatar: "/placeholder.svg?height=40&width=40&text=VS" },
      { name: "Dr. Aminata Diop", avatar: "/placeholder.svg?height=40&width=40&text=AD" },
      { name: "Ministère de la Santé", avatar: "/placeholder.svg?height=40&width=40&text=MS" },
    ],
    status: "En cours",
    progress: 65,
    startDate: "15 avril 2023",
    endDate: "30 septembre 2023",
    description:
      "Développement d'une solution de télémédecine adaptée aux zones rurales, permettant aux agents de santé communautaire de consulter des spécialistes à distance.",
    tasks: [
      { id: 1, title: "Analyse des besoins", status: "completed" },
      { id: 2, title: "Conception de l'architecture", status: "completed" },
      { id: 3, title: "Développement du prototype", status: "completed" },
      { id: 4, title: "Tests en conditions réelles", status: "in-progress" },
      { id: 5, title: "Déploiement pilote", status: "pending" },
      { id: 6, title: "Formation des utilisateurs", status: "pending" },
    ],
  },
  {
    id: 2,
    title: "Système de gestion des déchets intelligents",
    organization: "Ministère de l'Environnement",
    collaborators: [
      { name: "Votre Startup", avatar: "/placeholder.svg?height=40&width=40&text=VS" },
      { name: "Ibrahim Diallo", avatar: "/placeholder.svg?height=40&width=40&text=ID" },
      { name: "Ville de Dakar", avatar: "/placeholder.svg?height=40&width=40&text=VD" },
    ],
    status: "En cours",
    progress: 40,
    startDate: "10 mai 2023",
    endDate: "15 décembre 2023",
    description:
      "Développement d'un système IoT pour optimiser la collecte des déchets urbains, basé sur des capteurs de remplissage et une plateforme de gestion intelligente des itinéraires.",
    tasks: [
      { id: 1, title: "Étude de faisabilité", status: "completed" },
      { id: 2, title: "Conception des capteurs", status: "completed" },
      { id: 3, title: "Développement de la plateforme", status: "in-progress" },
      { id: 4, title: "Installation des capteurs pilotes", status: "in-progress" },
      { id: 5, title: "Tests et optimisation", status: "pending" },
      { id: 6, title: "Déploiement à grande échelle", status: "pending" },
    ],
  },
]

export default function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState(projects[0])
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Projets Collaboratifs</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
            Suivez l&apos;avancement de vos projets collaboratifs, gérez les tâches et coordonnez les efforts de toutes
            les parties prenantes.
          </p>
        </div>
        <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Nouveau projet</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Créer un nouveau projet collaboratif</DialogTitle>
              <DialogDescription>
                Définissez les détails de votre projet et invitez des collaborateurs à y participer.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-title">Titre du projet</Label>
                  <Input id="project-title" placeholder="Ex: Plateforme de télémédecine rurale" />
                </div>
                <div>
                  <Label htmlFor="project-description">Description du projet</Label>
                  <Textarea
                    id="project-description"
                    placeholder="Décrivez l'objectif du projet, les résultats attendus et les principales étapes"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="project-start-date">Date de début</Label>
                    <Input id="project-start-date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="project-end-date">Date de fin estimée</Label>
                    <Input id="project-end-date" type="date" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="project-organization">Organisation principale</Label>
                  <Select>
                    <SelectTrigger id="project-organization">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="your-startup">Votre Startup</SelectItem>
                      <SelectItem value="orange">Orange Sénégal</SelectItem>
                      <SelectItem value="ministry">Ministère de l'Innovation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Inviter des collaborateurs</Label>
                  <div className="flex gap-2 mt-2">
                    <Input placeholder="Rechercher un collaborateur..." className="flex-1" />
                    <Button variant="outline" type="button">
                      Ajouter
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className="flex items-center gap-1 px-3 py-1">
                      <span>Votre Startup</span>
                      <XCircle className="h-3 w-3 ml-1 cursor-pointer" />
                    </Badge>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewProjectDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" onClick={() => setIsNewProjectDialogOpen(false)}>
                  Créer le projet
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedProject(project)}
            >
              <Card
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedProject.id === project.id
                    ? "border-primary border-2"
                    : "border border-gray-200 dark:border-gray-800"
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <Badge
                      className={
                        project.status === "En cours"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription>{project.organization}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Progression</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex -space-x-2">
                    {project.collaborators.map((collaborator, index) => (
                      <Avatar key={index} className="h-8 w-8 border-2 border-background">
                        <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                        <AvatarFallback>{collaborator.name[0]}</AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-background text-xs font-medium">
                      +2
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedProject.title}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <span>{selectedProject.organization}</span>
                    <span className="mx-2">•</span>
                    <Badge
                      className={
                        selectedProject.status === "En cours"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      }
                    >
                      {selectedProject.status}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Documents</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Users className="h-4 w-4" />
                    <span>Équipe</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
                  <TabsTrigger value="tasks">Tâches</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-6 mt-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Description du projet</h4>
                    <p className="text-gray-600 dark:text-gray-300">{selectedProject.description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                        Calendrier
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Date de début:</span>
                          <span className="font-medium">{selectedProject.startDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Date de fin estimée:</span>
                          <span className="font-medium">{selectedProject.endDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Durée:</span>
                          <span className="font-medium">5 mois</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                        <Users className="h-5 w-5 mr-2 text-purple-500" />
                        Équipe
                      </h4>
                      <div className="space-y-3">
                        {selectedProject.collaborators.map((collaborator, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                              <AvatarFallback>{collaborator.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-gray-600 dark:text-gray-300">{collaborator.name}</span>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" className="w-full mt-2">
                          <Plus className="h-4 w-4 mr-1" />
                          <span>Ajouter un collaborateur</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Progression du projet</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Avancement global</span>
                        <span className="font-medium">{selectedProject.progress}%</span>
                      </div>
                      <Progress value={selectedProject.progress} className="h-3" />
                      <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
                        <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                          <div className="font-semibold text-gray-900 dark:text-white">3/6</div>
                          <div className="text-gray-500 dark:text-gray-400">Tâches terminées</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                          <div className="font-semibold text-gray-900 dark:text-white">2</div>
                          <div className="text-gray-500 dark:text-gray-400">En cours</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                          <div className="font-semibold text-gray-900 dark:text-white">1</div>
                          <div className="text-gray-500 dark:text-gray-400">À venir</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="tasks" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Liste des tâches</h4>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        <span>Ajouter une tâche</span>
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {selectedProject.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            {task.status === "completed" ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : task.status === "in-progress" ? (
                              <Clock className="h-5 w-5 text-amber-500" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-700" />
                            )}
                            <span
                              className={
                                task.status === "completed"
                                  ? "line-through text-gray-500 dark:text-gray-400"
                                  : "text-gray-900 dark:text-white"
                              }
                            >
                              {task.title}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              task.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : task.status === "in-progress"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                            }
                          >
                            {task.status === "completed"
                              ? "Terminée"
                              : task.status === "in-progress"
                                ? "En cours"
                                : "À faire"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="timeline" className="mt-4">
                  <div className="space-y-6">
                    <div className="relative pl-8 pb-6 border-l-2 border-gray-200 dark:border-gray-800">
                      <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-green-500"></div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Lancement du projet</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{selectedProject.startDate}</p>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                          Démarrage officiel du projet avec tous les partenaires.
                        </p>
                      </div>
                    </div>
                    <div className="relative pl-8 pb-6 border-l-2 border-gray-200 dark:border-gray-800">
                      <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-green-500"></div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Analyse des besoins</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">30 avril 2023</p>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                          Finalisation de l&apos;analyse des besoins et validation des spécifications.
                        </p>
                      </div>
                    </div>
                    <div className="relative pl-8 pb-6 border-l-2 border-gray-200 dark:border-gray-800">
                      <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-green-500"></div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Conception de l&apos;architecture</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">15 mai 2023</p>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                          Validation de l&apos;architecture technique et fonctionnelle.
                        </p>
                      </div>
                    </div>
                    <div className="relative pl-8 pb-6 border-l-2 border-gray-200 dark:border-gray-800">
                      <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-green-500"></div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Développement du prototype</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">30 juin 2023</p>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                          Livraison du prototype fonctionnel pour évaluation.
                        </p>
                      </div>
                    </div>
                    <div className="relative pl-8 pb-6 border-l-2 border-gray-200 dark:border-gray-800">
                      <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Tests en conditions réelles</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">En cours</p>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                          Phase de tests avec les utilisateurs finaux dans des conditions réelles d&apos;utilisation.
                        </p>
                      </div>
                    </div>
                    <div className="relative pl-8">
                      <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Déploiement final</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Prévu pour {selectedProject.endDate}</p>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                          Déploiement de la solution finalisée et formation des utilisateurs.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline">Exporter le rapport</Button>
              <Button>Mettre à jour le statut</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
