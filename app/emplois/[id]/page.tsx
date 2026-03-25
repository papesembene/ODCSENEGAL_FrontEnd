"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  ArrowLeft,
  Briefcase,
  Building,
  Calendar,
  Check,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Send,
  Share2,
  User,
} from "lucide-react"

// Données simulées pour l'offre d'emploi
const offreEmploi = {
  id: 1,
  titre: "Développeur Full Stack",
  entreprise: "Orange Digital Center",
  logo: "/placeholder.svg?height=400&width=400&text=ODC",
  lieu: "Dakar, Sénégal",
  type: "CDI",
  categorie: "Développement",
  datePublication: "2023-04-01",
  dateLimite: "2023-05-15",
  competences: ["React", "Node.js", "MongoDB", "TypeScript", "Git"],
  description:
    "Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe et participer au développement de nos plateformes numériques innovantes.",
  salaire: "Compétitif",
  responsabilites: [
    "Développer et maintenir des applications web et mobiles",
    "Collaborer avec les équipes de design et de produit",
    "Participer à la conception technique des solutions",
    "Assurer la qualité du code et la performance des applications",
    "Participer aux revues de code et aux sessions de pair programming",
  ],
  profil: [
    "Minimum 3 ans d'expérience en développement web",
    "Maîtrise des technologies front-end (React, Angular ou Vue)",
    "Maîtrise des technologies back-end (Node.js, Express)",
    "Expérience avec les bases de données NoSQL (MongoDB)",
    "Connaissance des principes de CI/CD",
    "Capacité à travailler en équipe et à communiquer efficacement",
  ],
  avantages: [
    "Environnement de travail stimulant et innovant",
    "Possibilité de télétravail partiel",
    "Formation continue et développement professionnel",
    "Tickets restaurant et mutuelle d'entreprise",
    "Événements d'entreprise réguliers",
  ],
  processRecrutement: [
    "Entretien téléphonique initial",
    "Test technique",
    "Entretien avec l'équipe technique",
    "Entretien final avec le responsable du département",
  ],
}

// Schéma de validation pour le formulaire de candidature
const formSchema = z.object({
  nom: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  prenom: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide" }),
  telephone: z.string().min(8, { message: "Veuillez entrer un numéro de téléphone valide" }),
  message: z.string().min(10, { message: "Votre message doit contenir au moins 10 caractères" }),
  cv: z.string().min(1, { message: "Veuillez joindre votre CV" }),
})

export default function OffreEmploiDetailPage({ params }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Initialiser le formulaire
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      message: "",
      cv: "",
    },
  })

  // Gérer la soumission du formulaire
  const onSubmit = async (data) => {
    setIsSubmitting(true)

    // Simuler une requête API
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log("Données soumises:", data)
    setIsSubmitting(false)
    setIsSuccess(true)

    // Réinitialiser le formulaire après 2 secondes
    setTimeout(() => {
      form.reset()
      setIsSuccess(false)
    }, 2000)
  }

  // Formater la date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }

  // Calculer le temps restant
  const getTimeRemaining = (dateString) => {
    const deadline = new Date(dateString)
    const now = new Date()
    const diffTime = deadline - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Offre expirée"
    if (diffDays === 0) return "Dernier jour pour postuler"
    if (diffDays === 1) return "Plus qu'un jour pour postuler"
    return `${diffDays} jours restants`
  }

  return (
    <div className="min-h-screen py-8 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <Button
            asChild
            variant="ghost"
            className="mb-4 -ml-4 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-500"
          >
            <Link href="/emplois" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux offres
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Colonne principale */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-6 flex items-start gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                  <Image
                    src={offreEmploi.logo || "/placeholder.svg"}
                    alt={offreEmploi.entreprise}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="mb-2 text-3xl font-bold">{offreEmploi.titre}</h1>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Building className="h-4 w-4" />
                    <span>{offreEmploi.entreprise}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  <MapPin className="mr-1 h-4 w-4 text-orange-500" />
                  {offreEmploi.lieu}
                </div>
                <div className="flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  <Briefcase className="mr-1 h-4 w-4 text-orange-500" />
                  {offreEmploi.type}
                </div>
                <div className="flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  <Calendar className="mr-1 h-4 w-4 text-orange-500" />
                  Publié le {formatDate(offreEmploi.datePublication)}
                </div>
                <div className="flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  <Clock className="mr-1 h-4 w-4 text-orange-500" />
                  {getTimeRemaining(offreEmploi.dateLimite)}
                </div>
              </div>

              <Tabs defaultValue="description" className="mb-8">
                <TabsList className="mb-4">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="entreprise">L&apos;entreprise</TabsTrigger>
                  <TabsTrigger value="processus">Processus</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="space-y-6">
                  <div>
                    <h2 className="mb-3 text-xl font-semibold">Description du poste</h2>
                    <p className="mb-4 text-gray-700 dark:text-gray-300">{offreEmploi.description}</p>

                    <h3 className="mb-2 text-lg font-medium">Compétences requises</h3>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {offreEmploi.competences.map((competence, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="border-orange-500/30 bg-orange-500/5 text-orange-700 dark:text-orange-400"
                        >
                          {competence}
                        </Badge>
                      ))}
                    </div>

                    <h3 className="mb-2 text-lg font-medium">Responsabilités</h3>
                    <ul className="mb-4 space-y-2">
                      {offreEmploi.responsabilites.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>

                    <h3 className="mb-2 text-lg font-medium">Profil recherché</h3>
                    <ul className="mb-4 space-y-2">
                      {offreEmploi.profil.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>

                    <h3 className="mb-2 text-lg font-medium">Avantages</h3>
                    <ul className="space-y-2">
                      {offreEmploi.avantages.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="entreprise" className="space-y-4">
                  <div>
                    <h2 className="mb-3 text-xl font-semibold">À propos de {offreEmploi.entreprise}</h2>
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      Orange Digital Center est un écosystème innovant dédié au développement des compétences numériques
                      et à l'innovation. Notre mission est de former les jeunes aux technologies du numérique et de
                      soutenir les startups dans leur développement.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      Nous offrons un environnement de travail stimulant où la créativité, l'innovation et le
                      développement personnel sont encouragés. Rejoindre notre équipe, c'est participer à la
                      transformation numérique du Sénégal et de l'Afrique.
                    </p>
                  </div>

                  <div className="mt-4">
                    <Button asChild variant="outline" className="gap-2">
                      <Link href="#" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Visiter le site web
                      </Link>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="processus" className="space-y-4">
                  <div>
                    <h2 className="mb-3 text-xl font-semibold">Processus de recrutement</h2>
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      Notre processus de recrutement est conçu pour évaluer à la fois vos compétences techniques et
                      votre adéquation avec notre culture d'entreprise.
                    </p>

                    <div className="space-y-4">
                      {offreEmploi.processRecrutement.map((etape, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 dark:text-gray-300">{etape}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Colonne latérale */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-xl font-semibold">Postuler</h3>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600">Postuler maintenant</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Postuler pour: {offreEmploi.titre}</DialogTitle>
                        <DialogDescription>
                          Remplissez le formulaire ci-dessous pour soumettre votre candidature.
                        </DialogDescription>
                      </DialogHeader>

                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="nom"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nom</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Votre nom" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="prenom"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Prénom</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Votre prénom" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="votre.email@exemple.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="telephone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Téléphone</FormLabel>
                                <FormControl>
                                  <Input placeholder="+221 XX XXX XX XX" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Message de motivation</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Présentez-vous et expliquez pourquoi vous êtes intéressé par ce poste..."
                                    className="min-h-[100px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="cv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CV (PDF)</FormLabel>
                                <FormControl>
                                  <Input type="file" accept=".pdf" onChange={(e) => field.onChange(e.target.value)} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <DialogFooter>
                            <Button
                              type="submit"
                              className="w-full bg-orange-500 hover:bg-orange-600"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                  Envoi en cours...
                                </span>
                              ) : isSuccess ? (
                                <span className="flex items-center gap-2">
                                  <Check className="h-4 w-4" />
                                  Candidature envoyée !
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <Send className="h-4 w-4" />
                                  Envoyer ma candidature
                                </span>
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  <div className="mt-4 flex items-center justify-between">
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Télécharger PDF
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Partager
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 text-xl font-semibold">Informations</h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Recruteur</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Service RH - Orange Digital Center</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Date limite</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(offreEmploi.dateLimite)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Type de contrat</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{offreEmploi.type}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Lieu</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{offreEmploi.lieu}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
