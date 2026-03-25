"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  BookOpen,
  Calendar,
  FileText,
  ImageIcon,
  LinkIcon,
  MessageSquare,
  PaperclipIcon,
  Plus,
  Search,
  Send,
  ThumbsUp,
  Video,
} from "lucide-react"

const forumTopics = [
  {
    id: 1,
    title: "Comment intégrer l'IA dans les solutions de santé rurale ?",
    author: {
      name: "Aminata Diop",
      avatar: "/placeholder.svg?height=40&width=40&text=AD",
    },
    category: "Intelligence Artificielle",
    replies: 12,
    views: 89,
    lastActivity: "Il y a 2 heures",
    excerpt:
      "Je travaille sur un projet de télémédecine pour les zones rurales et je cherche des conseils sur l'intégration de l'IA pour améliorer le diagnostic à distance...",
  },
  {
    id: 2,
    title: "Retour d'expérience : Déploiement d'une solution IoT pour l'agriculture",
    author: {
      name: "Ibrahim Diallo",
      avatar: "/placeholder.svg?height=40&width=40&text=ID",
    },
    category: "IoT",
    replies: 8,
    views: 56,
    lastActivity: "Il y a 1 jour",
    excerpt:
      "Nous avons récemment déployé un réseau de capteurs IoT pour surveiller l'irrigation dans plusieurs exploitations agricoles. Voici les défis que nous avons rencontrés et comment nous les avons surmontés...",
  },
  {
    id: 3,
    title: "Recherche partenaires pour projet d'inclusion financière",
    author: {
      name: "Moussa Sall",
      avatar: "/placeholder.svg?height=40&width=40&text=MS",
    },
    category: "Fintech",
    replies: 5,
    views: 42,
    lastActivity: "Il y a 3 jours",
    excerpt:
      "Notre startup développe une solution de microfinance mobile et nous recherchons des partenaires pour un projet pilote dans les régions de Thiès et Diourbel...",
  },
]

const resources = [
  {
    id: 1,
    title: "Guide de l'innovation ouverte",
    type: "document",
    icon: <FileText className="h-10 w-10 text-blue-500" />,
    author: "Orange Digital Center",
    date: "15 mai 2023",
    downloads: 78,
    format: "PDF",
    size: "2.4 MB",
  },
  {
    id: 2,
    title: "Webinaire : Financement des startups en Afrique",
    type: "video",
    icon: <Video className="h-10 w-10 text-red-500" />,
    author: "Orange Ventures",
    date: "22 juin 2023",
    views: 156,
    duration: "1h 15min",
    format: "MP4",
  },
  {
    id: 3,
    title: "Modèles de documents juridiques pour startups",
    type: "document",
    icon: <FileText className="h-10 w-10 text-blue-500" />,
    author: "Cabinet Juridique Digital",
    date: "10 avril 2023",
    downloads: 124,
    format: "ZIP",
    size: "5.7 MB",
  },
  {
    id: 4,
    title: "Présentation : Écosystème startup au Sénégal",
    type: "presentation",
    icon: <ImageIcon className="h-10 w-10 text-green-500" />,
    author: "Ministère de l'Économie Numérique",
    date: "5 mars 2023",
    downloads: 92,
    format: "PPTX",
    size: "8.2 MB",
  },
]

const discussionMessages = [
  {
    id: 1,
    author: {
      name: "Aminata Diop",
      avatar: "/placeholder.svg?height=40&width=40&text=AD",
    },
    content:
      "Je travaille sur un projet de télémédecine pour les zones rurales et je cherche des conseils sur l'intégration de l'IA pour améliorer le diagnostic à distance. Nous avons des contraintes de connectivité et de puissance de calcul sur les appareils utilisés. Quelqu'un a-t-il de l'expérience dans ce domaine ?",
    timestamp: "Hier, 14:30",
    likes: 5,
  },
  {
    id: 2,
    author: {
      name: "Mamadou Dieng",
      avatar: "/placeholder.svg?height=40&width=40&text=MD",
    },
    content:
      "Bonjour Aminata, j'ai travaillé sur un projet similaire l'année dernière. Pour les contraintes de connectivité, nous avons opté pour une approche hybride : un modèle d'IA léger fonctionnant directement sur l'appareil pour les diagnostics de base, et un modèle plus complexe sur le cloud pour les cas nécessitant une analyse approfondie. Les données sont synchronisées lorsque la connexion est disponible.",
    timestamp: "Hier, 15:45",
    likes: 3,
  },
  {
    id: 3,
    author: {
      name: "Fatou Ndiaye",
      avatar: "/placeholder.svg?height=40&width=40&text=FN",
    },
    content:
      "Je recommande également d'explorer les modèles d'IA optimisés pour les appareils mobiles comme TensorFlow Lite ou ONNX Runtime. Ils permettent d'exécuter des modèles assez sophistiqués même sur des appareils à ressources limitées. N'oubliez pas aussi l'aspect réglementaire concernant les données de santé, qui est crucial pour ce type de projet.",
    timestamp: "Aujourd'hui, 09:15",
    likes: 7,
  },
]

export default function ResourcesSection() {
  const [activeTab, setActiveTab] = useState("forum")
  const [newMessage, setNewMessage] = useState("")
  const [isNewTopicDialogOpen, setIsNewTopicDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send the message to the backend
    setNewMessage("")
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Espace d&apos;Échange et Ressources</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
          Partagez vos connaissances, posez vos questions et accédez à des ressources utiles pour vos projets
          d&apos;innovation. Collaborez avec d&apos;autres acteurs de l&apos;écosystème pour résoudre ensemble les défis
          du développement numérique.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
          <TabsTrigger value="forum" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Forum de discussion</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Ressources</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forum" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Rechercher dans le forum..." className="pl-9" />
            </div>
            <Dialog open={isNewTopicDialogOpen} onOpenChange={setIsNewTopicDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Nouveau sujet</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau sujet de discussion</DialogTitle>
                  <DialogDescription>
                    Partagez vos questions, idées ou expériences avec la communauté.
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="topic-title">Titre du sujet</Label>
                      <Input
                        id="topic-title"
                        placeholder="Ex: Comment intégrer l'IA dans les solutions de santé rurale ?"
                      />
                    </div>
                    <div>
                      <Label htmlFor="topic-category">Catégorie</Label>
                      <Select>
                        <SelectTrigger id="topic-category">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ia">Intelligence Artificielle</SelectItem>
                          <SelectItem value="iot">IoT</SelectItem>
                          <SelectItem value="fintech">Fintech</SelectItem>
                          <SelectItem value="agritech">Agritech</SelectItem>
                          <SelectItem value="healthtech">Healthtech</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="topic-content">Contenu</Label>
                      <Textarea
                        id="topic-content"
                        placeholder="Décrivez votre question ou partagez votre expérience..."
                        rows={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="topic-tags">Tags (optionnel)</Label>
                      <Input id="topic-tags" placeholder="Ex: IA, santé, rural (séparés par des virgules)" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewTopicDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" onClick={() => setIsNewTopicDialogOpen(false)}>
                      Publier
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              {forumTopics.map((topic) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{topic.title}</CardTitle>
                        <Badge variant="outline">{topic.category}</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={topic.author.avatar} alt={topic.author.name} />
                          <AvatarFallback>{topic.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <span>{topic.author.name}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{topic.excerpt}</p>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {topic.replies} réponses
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {topic.lastActivity}
                        </span>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-2">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Comment intégrer l&apos;IA dans les solutions de santé rurale ?</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src="/placeholder.svg?height=40&width=40&text=AD" alt="Aminata Diop" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <span>Aminata Diop</span>
                    <span className="mx-1">•</span>
                    <Badge variant="outline">Intelligence Artificielle</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto max-h-[500px]">
                  <div className="space-y-6">
                    {discussionMessages.map((message) => (
                      <div key={message.id} className="space-y-2">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={message.author.avatar} alt={message.author.name} />
                            <AvatarFallback>{message.author.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-white">{message.author.name}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{message.timestamp}</span>
                            </div>
                            <p className="mt-1 text-gray-600 dark:text-gray-300">{message.content}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <Button variant="ghost" size="sm" className="h-8 gap-1 text-gray-500 dark:text-gray-400">
                                <ThumbsUp className="h-4 w-4" />
                                <span>{message.likes}</span>
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 gap-1 text-gray-500 dark:text-gray-400">
                                <MessageSquare className="h-4 w-4" />
                                <span>Répondre</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="pt-4">
                  <form onSubmit={handleSendMessage} className="w-full space-y-4">
                    <Textarea
                      placeholder="Répondre à cette discussion..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={3}
                    />

                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm" type="button" className="gap-1">
                        <PaperclipIcon className="h-4 w-4" />
                        <span>Joindre</span>
                      </Button>
                      <Button type="submit" className="gap-1">
                        <Send className="h-4 w-4" />
                        <span>Envoyer</span>
                      </Button>
                    </div>
                  </form>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Rechercher des ressources..." className="pl-9" />
            </div>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Partager une ressource</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Partager une ressource</DialogTitle>
                  <DialogDescription>
                    Partagez des documents, vidéos ou liens utiles avec la communauté.
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="resource-title">Titre de la ressource</Label>
                      <Input id="resource-title" placeholder="Ex: Guide de l'innovation ouverte" />
                    </div>
                    <div>
                      <Label htmlFor="resource-type">Type de ressource</Label>
                      <Select>
                        <SelectTrigger id="resource-type">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="video">Vidéo</SelectItem>
                          <SelectItem value="presentation">Présentation</SelectItem>
                          <SelectItem value="link">Lien</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="resource-file">Fichier ou lien</Label>
                      <div className="mt-2 flex items-center gap-2">
                        <Input id="resource-file" type="file" className="flex-1" />
                        <Button variant="outline" size="sm" type="button">
                          <PaperclipIcon className="h-4 w-4 mr-2" />
                          Parcourir
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Formats acceptés : PDF, DOCX, PPTX, MP4, ZIP (max 20 MB)
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="resource-description">Description</Label>
                      <Textarea
                        id="resource-description"
                        placeholder="Décrivez brièvement cette ressource et son utilité"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="resource-tags">Tags (optionnel)</Label>
                      <Input
                        id="resource-tags"
                        placeholder="Ex: guide, innovation, méthodologie (séparés par des virgules)"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" onClick={() => setIsUploadDialogOpen(false)}>
                      Partager
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-center mb-4">{resource.icon}</div>
                    <CardTitle className="text-center text-base">{resource.title}</CardTitle>
                    <CardDescription className="text-center">{resource.author}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2 flex-1">
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <span>Date: {resource.date}</span>
                      <Badge variant="outline">{resource.format}</Badge>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      {resource.type === "video" ? (
                        <span>Vues: {resource.views}</span>
                      ) : (
                        <span>Téléchargements: {resource.downloads}</span>
                      )}
                      {resource.type === "video" ? (
                        <span>Durée: {resource.duration}</span>
                      ) : (
                        <span>Taille: {resource.size}</span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" className="w-full gap-2">
                      {resource.type === "video" ? (
                        <>
                          <Video className="h-4 w-4" />
                          <span>Regarder</span>
                        </>
                      ) : resource.type === "document" || resource.type === "presentation" ? (
                        <>
                          <FileText className="h-4 w-4" />
                          <span>Télécharger</span>
                        </>
                      ) : (
                        <>
                          <LinkIcon className="h-4 w-4" />
                          <span>Visiter</span>
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Collections populaires</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-center">Ressources pour startups</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Documents juridiques, guides de financement et modèles de business plan pour startups.
                  </p>
                  <Badge className="mx-auto">15 ressources</Badge>
                </CardContent>
                <CardFooter className="justify-center">
                  <Button variant="outline">Explorer</Button>
                </CardFooter>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-center">Tutoriels techniques</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Guides pratiques et tutoriels sur les technologies émergentes (IA, IoT, Blockchain).
                  </p>
                  <Badge className="mx-auto">23 ressources</Badge>
                </CardContent>
                <CardFooter className="justify-center">
                  <Button variant="outline">Explorer</Button>
                </CardFooter>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-center">Études de cas</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Retours d&apos;expérience et études de cas de projets d&apos;innovation réussis au Sénégal.
                  </p>
                  <Badge className="mx-auto">8 ressources</Badge>
                </CardContent>
                <CardFooter className="justify-center">
                  <Button variant="outline">Explorer</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
