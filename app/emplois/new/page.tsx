"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Check, Plus, Trash2 } from "lucide-react"

// Schéma de validation pour le formulaire
const formSchema = z.object({
  titre: z.string().min(5, { message: "Le titre doit contenir au moins 5 caractères" }),
  entreprise: z.string().min(2, { message: "Le nom de l'entreprise est requis" }),
  categorie: z.string().min(1, { message: "Veuillez sélectionner une catégorie" }),
  type: z.string().min(1, { message: "Veuillez sélectionner un type de contrat" }),
  lieu: z.string().min(2, { message: "Le lieu est requis" }),
  description: z.string().min(20, { message: "La description doit contenir au moins 20 caractères" }),
  competences: z.array(z.string()).min(1, { message: "Ajoutez au moins une compétence requise" }),
  responsabilites: z.array(z.string()).min(1, { message: "Ajoutez au moins une responsabilité" }),
  profil: z.array(z.string()).min(1, { message: "Ajoutez au moins un critère de profil" }),
  avantages: z.array(z.string()),
  salaire: z.string().optional(),
  dateLimite: z.date({ required_error: "La date limite est requise" }),
  processRecrutement: z.array(z.string()).min(1, { message: "Ajoutez au moins une étape du processus" }),
  conditions: z.boolean().refine((val) => val === true, { message: "Vous devez accepter les conditions" }),
})

// Types de contrat disponibles
const typesContrat = ["CDI", "CDD", "Stage", "Freelance", "Alternance", "Temps partiel"]

// Catégories d'emploi
const categories = [
  "Développement",
  "Design",
  "Data",
  "Management",
  "Infrastructure",
  "Marketing",
  "Commercial",
  "Support",
  "Autre",
]

export default function NewOffreEmploiPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [newCompetence, setNewCompetence] = useState("")
  const [newResponsabilite, setNewResponsabilite] = useState("")
  const [newProfil, setNewProfil] = useState("")
  const [newAvantage, setNewAvantage] = useState("")
  const [newEtape, setNewEtape] = useState("")

  // Initialiser le formulaire
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titre: "",
      entreprise: "",
      categorie: "",
      type: "",
      lieu: "",
      description: "",
      competences: [],
      responsabilites: [],
      profil: [],
      avantages: [],
      salaire: "",
      dateLimite: undefined,
      processRecrutement: [],
      conditions: false,
    },
  })

  // Gérer l'ajout d'un élément à une liste
  const handleAddItem = (field, value, setValue) => {
    if (value.trim() === "") return

    form.setValue(field, [...form.getValues(field), value])
    setValue("")
  }

  // Gérer la suppression d'un élément d'une liste
  const handleRemoveItem = (field, index) => {
    const currentItems = form.getValues(field)
    form.setValue(
      field,
      currentItems.filter((_, i) => i !== index),
    )
  }

  // Gérer la soumission du formulaire
  const onSubmit = async (data) => {
    setIsSubmitting(true)

    // Simuler une requête API
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log("Données soumises:", data)
    setIsSubmitting(false)
    setIsSuccess(true)

    // Rediriger après 2 secondes
    setTimeout(() => {
      window.location.href = "/connect/emplois"
    }, 2000)
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
            <Link href="/connect/emplois" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux offres
            </Link>
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-3xl font-bold">Publier une offre d&apos;emploi</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Remplissez le formulaire ci-dessous pour publier une nouvelle offre d&apos;emploi
          </p>
        </motion.div>

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="titre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre du poste *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Développeur Full Stack" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="entreprise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l&apos;entreprise *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Orange Digital Center" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categorie"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((categorie) => (
                              <SelectItem key={categorie} value={categorie}>
                                {categorie}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de contrat *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un type de contrat" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {typesContrat.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lieu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lieu *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Dakar, Sénégal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salaire"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salaire (optionnel)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Compétitif ou 500 000 - 800 000 FCFA" {...field} />
                        </FormControl>
                        <FormDescription>Laissez vide si vous préférez ne pas préciser</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description du poste *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez le poste, ses objectifs et le contexte..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="competences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compétences requises *</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ex: React"
                          value={newCompetence}
                          onChange={(e) => setNewCompetence(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddItem("competences", newCompetence, setNewCompetence)
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => handleAddItem("competences", newCompetence, setNewCompetence)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {field.value.map((competence, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                          >
                            {competence}
                            <button
                              type="button"
                              onClick={() => handleRemoveItem("competences", index)}
                              className="ml-1 rounded-full p-1 hover:bg-orange-200 dark:hover:bg-orange-800/50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responsabilites"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsabilités *</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ex: Développer et maintenir des applications web"
                          value={newResponsabilite}
                          onChange={(e) => setNewResponsabilite(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddItem("responsabilites", newResponsabilite, setNewResponsabilite)
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => handleAddItem("responsabilites", newResponsabilite, setNewResponsabilite)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 space-y-2">
                        {field.value.map((responsabilite, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-md border border-gray-200 p-2 dark:border-gray-800"
                          >
                            <span>{responsabilite}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem("responsabilites", index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profil recherché *</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ex: Minimum 3 ans d'expérience en développement web"
                          value={newProfil}
                          onChange={(e) => setNewProfil(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddItem("profil", newProfil, setNewProfil)
                            }
                          }}
                        />
                        <Button type="button" onClick={() => handleAddItem("profil", newProfil, setNewProfil)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 space-y-2">
                        {field.value.map((profil, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-md border border-gray-200 p-2 dark:border-gray-800"
                          >
                            <span>{profil}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem("profil", index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="avantages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avantages (optionnel)</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ex: Tickets restaurant et mutuelle d'entreprise"
                          value={newAvantage}
                          onChange={(e) => setNewAvantage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddItem("avantages", newAvantage, setNewAvantage)
                            }
                          }}
                        />
                        <Button type="button" onClick={() => handleAddItem("avantages", newAvantage, setNewAvantage)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 space-y-2">
                        {field.value.map((avantage, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-md border border-gray-200 p-2 dark:border-gray-800"
                          >
                            <span>{avantage}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem("avantages", index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="processRecrutement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processus de recrutement *</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ex: Entretien téléphonique initial"
                          value={newEtape}
                          onChange={(e) => setNewEtape(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddItem("processRecrutement", newEtape, setNewEtape)
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => handleAddItem("processRecrutement", newEtape, setNewEtape)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 space-y-2">
                        {field.value.map((etape, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-md border border-gray-200 p-2 dark:border-gray-800"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white text-xs">
                                {index + 1}
                              </div>
                              <span>{etape}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem("processRecrutement", index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateLimite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date limite de candidature *</FormLabel>
                      <FormControl>
                        <DatePicker
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          placeholder="Sélectionnez une date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conditions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          J&apos;accepte les conditions d&apos;utilisation et je confirme que cette offre respecte les
                          lois en vigueur *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Publication en cours...
                      </span>
                    ) : isSuccess ? (
                      <span className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Offre publiée avec succès !
                      </span>
                    ) : (
                      "Publier l'offre d'emploi"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
