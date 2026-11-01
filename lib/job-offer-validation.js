import * as z from "zod"

export const jobOfferSchema = z.object({
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
  dateLimite: z.date({ error: "La date limite est requise" }),
  processRecrutement: z.array(z.string()).min(1, { message: "Ajoutez au moins une étape du processus" }),
  conditions: z.boolean().refine((val) => val === true, { message: "Vous devez accepter les conditions" }),
})

export const jobApplicationSchema = z.object({
  nom: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  prenom: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide" }),
  telephone: z.string().min(8, { message: "Veuillez entrer un numéro de téléphone valide" }),
  message: z.string().min(10, { message: "Votre message doit contenir au moins 10 caractères" }),
  cv: z.string().min(1, { message: "Veuillez joindre votre CV" }),
})
