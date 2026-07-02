"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  CalendarCheck2,
  ChevronRight,
  Mail,
  Lock,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAdminApi } from "@/app/hooks/useAdminApi"

const juryRoles = [
  {
    title: "Filtre",
    value: "filter",
    description: "Premier regard sur le dossier et cohérence générale de l'évaluation.",
  },
  {
    title: "Validation",
    value: "validator",
    description: "Vérification métier et validation de la décision finale du jury.",
  },
  {
    title: "Motivation",
    value: "motivation",
    description: "Appréciation de la motivation, du projet et de l'engagement du candidat.",
  },
]

export default function JuryRolesRegistrationPage() {
  const { toast } = useToast()
  const { juryMembers } = useAdminApi()
  const [selectedRole, setSelectedRole] = useState(juryRoles[0].value)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "test123",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdCredentials, setCreatedCredentials] = useState(null)

  const activeRole = useMemo(
    () => juryRoles.find((role) => role.value === selectedRole) || juryRoles[0],
    [selectedRole],
  )

  const handleSubmit = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast({
        title: "Champs requis",
        description: "Renseignez le prénom, le nom et l'email du membre du jury.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      setCreatedCredentials(null)

      const response = await juryMembers.create({
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: activeRole.value,
      })

      setCreatedCredentials({
        email: response.user?.email || formData.email.trim(),
        password: formData.password,
        roleLabel: response.role_label || activeRole.title,
      })
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "test123",
      })

      toast({
        title: "Utilisateur créé",
        description: `${response.user?.email || "Le compte"} a été ajouté avec le rôle ${response.role_label || activeRole.title}.`,
      })
    } catch (error) {
      toast({
        title: "Création impossible",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/astrodmin/parametres">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Inscription des rôles jury</h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Préparez ici la future gestion des membres du jury. Pour qu&apos;un créneau soit considéré comme
                complet, les trois rôles doivent être affectés.
              </p>
            </div>
          </div>

          <Badge variant="outline" className="w-fit">
            Version initiale
          </Badge>
        </div>
      </section>

      <Card className="border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5" />
            Pourquoi cette section est utile
          </CardTitle>
          <CardDescription className="text-amber-700/80 dark:text-amber-200/80">
            Elle prépare la résolution du blocage affiché lors de la planification des entretiens.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-amber-800 dark:text-amber-100">
          <p>
            Message actuel : aucun créneau complet tant que les rôles <strong>filtre</strong>, <strong>validation</strong>{" "}
            et <strong>motivation</strong> ne sont pas tous renseignés sur un créneau.
          </p>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        {juryRoles.map((role) => (
          <button
            key={role.title}
            type="button"
            onClick={() => setSelectedRole(role.value)}
            className="text-left"
          >
            <Card
              className={`h-full transition-all hover:-translate-y-0.5 hover:shadow-md ${
                selectedRole === role.value
                  ? "border-orange-400 ring-2 ring-orange-200 dark:border-orange-500 dark:ring-orange-950/50"
                  : ""
              }`}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle>{role.title}</CardTitle>
                  <CardDescription className="mt-1">{role.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </button>
        ))}
      </section>

      <Card className="border-orange-200 dark:border-orange-900/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-orange-500" />
            Inscrire un nouvel utilisateur jury
          </CardTitle>
          <CardDescription>
            Le rôle est récupéré automatiquement depuis la carte sélectionnée.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-xl bg-orange-50 p-4 dark:bg-orange-950/20">
            <p className="text-sm text-muted-foreground">Rôle sélectionné</p>
            <div className="mt-2 flex items-center gap-3">
              <Badge className="bg-orange-500 text-white hover:bg-orange-500">{activeRole.title}</Badge>
              <span className="text-sm text-muted-foreground">{activeRole.description}</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jury-first-name">Prénom</Label>
              <Input
                id="jury-first-name"
                value={formData.firstName}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, firstName: event.target.value }))
                }
                placeholder="Ex: Awa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jury-last-name">Nom</Label>
              <Input
                id="jury-last-name"
                value={formData.lastName}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, lastName: event.target.value }))
                }
                placeholder="Ex: Diop"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jury-email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="jury-email"
                  type="email"
                  className="pl-9"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="Ex: jury@odc.sn"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jury-role">Type de rôle</Label>
              <Input id="jury-role" value={activeRole.title} readOnly className="bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jury-password">Mot de passe</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="jury-password"
                type="password"
                className="pl-9"
                value={formData.password}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="test123"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              Enregistrer l&apos;utilisateur
            </Button>
            <p className="text-sm text-muted-foreground">
              Le compte sera créé avec le rôle <strong>{activeRole.value}</strong> et le scope d&apos;entretien jury.
            </p>
          </div>

          {createdCredentials ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Compte créé avec succès</p>
              <div className="mt-3 space-y-1 text-sm text-emerald-900 dark:text-emerald-100">
                <p>
                  <strong>Email :</strong> {createdCredentials.email}
                </p>
                <p>
                  <strong>Rôle :</strong> {createdCredentials.roleLabel}
                </p>
                <p>
                  <strong>Mot de passe :</strong> {createdCredentials.password}
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck2 className="h-5 w-5 text-emerald-500" />
            Prochaine étape
          </CardTitle>
          <CardDescription>
            Cette page est prête pour accueillir ensuite le formulaire ou le tableau d&apos;inscription des jurés.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Pour le moment, nous avons ajouté l&apos;entrée de menu et la structure de la rubrique. La prochaine
            évolution peut être la liste des jurés avec affectation par rôle.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
