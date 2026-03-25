"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  Button,
  Badge,
  Progress,
  Avatar,
  Separator,
} from "@/components/ui"
import {
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  User,
  CheckCircle,
  AlertCircle,
  Bell,
  Download,
  Upload,
  BarChart,
  Users,
  ExternalLink,
  MapPin,
} from "lucide-react"

export default function StartupDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  // Données fictives pour le tableau de bord
  const startupData = {
    name: "TechInnovate",
    logo: "/placeholder.svg?height=100&width=100",
    program: "Startup Lab",
    status: "active",
    progress: 65,
    startDate: "15/01/2023",
    endDate: "15/07/2023",
    mentor: {
      name: "Fatou Ndiaye",
      role: "Mentor principal",
      avatar: "/placeholder.svg?height=50&width=50",
    },
    nextMilestone: {
      title: "Finalisation du MVP",
      date: "30/05/2023",
      description: "Présentation du prototype fonctionnel à l'équipe Orange Startup Studio.",
    },
    tasks: [
      {
        id: 1,
        title: "Finaliser le business model canvas",
        status: "completed",
        dueDate: "15/04/2023",
      },
      {
        id: 2,
        title: "Développer le prototype",
        status: "in-progress",
        dueDate: "25/05/2023",
      },
      {
        id: 3,
        title: "Préparer le pitch deck",
        status: "pending",
        dueDate: "10/06/2023",
      },
      {
        id: 4,
        title: "Réaliser les tests utilisateurs",
        status: "pending",
        dueDate: "20/06/2023",
      },
    ],
    events: [
      {
        id: 1,
        title: "Workshop: Growth Hacking",
        date: "29/05/2023",
        time: "14:00 - 17:00",
        location: "Orange Digital Center, Dakar",
        status: "upcoming",
      },
      {
        id: 2,
        title: "Mentorat individuel",
        date: "02/06/2023",
        time: "10:00 - 11:30",
        location: "En ligne",
        status: "upcoming",
      },
      {
        id: 3,
        title: "Masterclass: Levée de fonds",
        date: "22/06/2023",
        time: "10:00 - 12:00",
        location: "Orange Digital Center, Dakar",
        status: "upcoming",
      },
    ],
    resources: [
      {
        id: 1,
        title: "Guide du Business Model Canvas",
        type: "pdf",
        date: "20/01/2023",
        size: "2.4 MB",
      },
      {
        id: 2,
        title: "Template de Pitch Deck",
        type: "pptx",
        date: "05/02/2023",
        size: "3.1 MB",
      },
      {
        id: 3,
        title: "Méthodologie de test utilisateur",
        type: "pdf",
        date: "15/03/2023",
        size: "1.8 MB",
      },
    ],
    messages: [
      {
        id: 1,
        sender: "Fatou Ndiaye",
        avatar: "/placeholder.svg?height=40&width=40",
        date: "28/04/2023",
        content:
          "Bonjour, j'ai examiné votre business model canvas et j'ai quelques suggestions à vous faire. Pouvons-nous en discuter lors de notre prochaine session de mentorat ?",
        read: true,
      },
      {
        id: 2,
        sender: "Amadou Sow",
        avatar: "/placeholder.svg?height=40&width=40",
        date: "02/05/2023",
        content:
          "Je vous invite à participer au workshop sur le Growth Hacking le 29 mai. Ce sera très utile pour votre stratégie d'acquisition client.",
        read: false,
      },
    ],
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "in-progress":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      case "upcoming":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />
      case "pptx":
        return <FileText className="h-8 w-8 text-orange-500" />
      case "xlsx":
        return <FileText className="h-8 w-8 text-green-500" />
      default:
        return <FileText className="h-8 w-8 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full">
            <Image src={startupData.logo || "/placeholder.svg"} alt={startupData.name} fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{startupData.name}</h1>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor("active")}>Programme actif</Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {startupData.program} | {startupData.startDate} - {startupData.endDate}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Bell className="mr-2 h-4 w-4" />
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </span>
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
          </Button>
          <Button>
            <User className="mr-2 h-4 w-4" />
            Mon profil
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">Progression du programme</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">{startupData.progress}%</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Prochaine étape: {startupData.nextMilestone.title} ({startupData.nextMilestone.date})
            </span>
          </div>
          <Progress value={startupData.progress} className="h-2 w-full" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="tasks">Tâches</TabsTrigger>
              <TabsTrigger value="events">Événements</TabsTrigger>
              <TabsTrigger value="resources">Ressources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Prochaine étape</CardTitle>
                  <CardDescription>Votre prochain objectif dans le programme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                        <Clock className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{startupData.nextMilestone.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Date limite: {startupData.nextMilestone.date}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{startupData.nextMilestone.description}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Voir les détails
                  </Button>
                </CardFooter>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Tâches récentes</CardTitle>
                    <CardDescription>Vos tâches en cours et à venir</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {startupData.tasks.slice(0, 3).map((task) => (
                        <li key={task.id} className="flex items-start space-x-3">
                          {getStatusIcon(task.status)}
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Date limite: {task.dueDate}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full" onClick={() => setActiveTab("tasks")}>
                      Voir toutes les tâches
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Événements à venir</CardTitle>
                    <CardDescription>Vos prochains rendez-vous</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {startupData.events.slice(0, 2).map((event) => (
                        <li key={event.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{event.title}</h4>
                            <Badge className={getStatusColor(event.status)}>À venir</Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>{event.date}</span>
                            <Clock className="ml-2 h-4 w-4" />
                            <span>{event.time}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full" onClick={() => setActiveTab("events")}>
                      Voir tous les événements
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Statistiques</CardTitle>
                  <CardDescription>Votre progression en chiffres</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <div className="mt-2 text-2xl font-bold">4</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Tâches complétées</div>
                    </div>
                    <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <Calendar className="h-8 w-8 text-blue-500" />
                      <div className="mt-2 text-2xl font-bold">8</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Événements assistés</div>
                    </div>
                    <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <Users className="h-8 w-8 text-purple-500" />
                      <div className="mt-2 text-2xl font-bold">5</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Mentors rencontrés</div>
                    </div>
                    <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <BarChart className="h-8 w-8 text-orange-500" />
                      <div className="mt-2 text-2xl font-bold">65%</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Progression globale</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Mes tâches</CardTitle>
                    <CardDescription>Liste de toutes vos tâches dans le programme</CardDescription>
                  </div>
                  <Button>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marquer comme terminée
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 font-semibold">Tâches en cours</h3>
                      <ul className="space-y-4">
                        {startupData.tasks
                          .filter((task) => task.status === "in-progress")
                          .map((task) => (
                            <li key={task.id} className="flex items-start space-x-3 rounded-lg border p-4">
                              <Clock className="mt-0.5 h-5 w-5 text-orange-500" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{task.title}</h4>
                                  <Badge className={getStatusColor(task.status)}>En cours</Badge>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Date limite: {task.dueDate}</p>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="mb-4 font-semibold">Tâches à venir</h3>
                      <ul className="space-y-4">
                        {startupData.tasks
                          .filter((task) => task.status === "pending")
                          .map((task) => (
                            <li key={task.id} className="flex items-start space-x-3 rounded-lg border p-4">
                              <AlertCircle className="mt-0.5 h-5 w-5 text-gray-500" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{task.title}</h4>
                                  <Badge className={getStatusColor(task.status)}>À faire</Badge>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Date limite: {task.dueDate}</p>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="mb-4 font-semibold">Tâches terminées</h3>
                      <ul className="space-y-4">
                        {startupData.tasks
                          .filter((task) => task.status === "completed")
                          .map((task) => (
                            <li key={task.id} className="flex items-start space-x-3 rounded-lg border p-4">
                              <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{task.title}</h4>
                                  <Badge className={getStatusColor(task.status)}>Terminée</Badge>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Date limite: {task.dueDate}</p>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Événements</CardTitle>
                    <CardDescription>Calendrier des événements à venir et passés</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Voir le calendrier
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 font-semibold">Événements à venir</h3>
                      <ul className="space-y-4">
                        {startupData.events.map((event) => (
                          <li key={event.id} className="rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{event.title}</h4>
                              <Badge className={getStatusColor(event.status)}>À venir</Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{event.date}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                              <Button variant="outline" size="sm">
                                Détails
                              </Button>
                              <Button size="sm">S'inscrire</Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="mb-4 font-semibold">Événements passés</h3>
                      <p className="text-center text-gray-500 dark:text-gray-400">
                        Aucun événement passé à afficher pour le moment.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Ressources</CardTitle>
                    <CardDescription>Documents et ressources pour votre programme</CardDescription>
                  </div>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Téléverser un document
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 font-semibold">Documents du programme</h3>
                      <ul className="grid gap-4 md:grid-cols-2">
                        {startupData.resources.map((resource) => (
                          <li key={resource.id} className="flex items-center space-x-4 rounded-lg border p-4">
                            {getFileIcon(resource.type)}
                            <div className="flex-1">
                              <h4 className="font-medium">{resource.title}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {resource.date} • {resource.size}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="mb-4 font-semibold">Mes documents</h3>
                      <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
                        <div className="text-center">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Glissez-déposez vos fichiers ici ou cliquez pour téléverser
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mon mentor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <Image
                    src={startupData.mentor.avatar || "/placeholder.svg"}
                    alt={startupData.mentor.name}
                    fill
                    className="object-cover"
                  />
                </Avatar>
                <div>
                  <h3 className="font-semibold">{startupData.mentor.name}</h3>
                  <p className="text-sm text-orange-500">{startupData.mentor.role}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <Button variant="outline" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Rendez-vous
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Messages récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {startupData.messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <Image
                            src={message.avatar || "/placeholder.svg"}
                            alt={message.sender}
                            fill
                            className="object-cover"
                          />
                        </Avatar>
                        <span className="font-medium">{message.sender}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{message.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{message.content}</p>
                    {!message.read && (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Non lu</Badge>
                    )}
                    <Separator className="my-2" />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full">
                Voir tous les messages
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liens rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/startups/programmes/startup-lab">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Programme Startup Lab
                    </Link>
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/startups/evenements">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Calendrier des événements
                    </Link>
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/startups/coworking">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Réserver un espace de travail
                    </Link>
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/contact">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Contacter l'équipe OSS
                    </Link>
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
