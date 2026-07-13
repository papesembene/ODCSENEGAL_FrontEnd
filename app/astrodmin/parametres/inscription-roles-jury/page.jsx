"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Copy,
  Eye,
  KeyRound,
  Mail,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageSizeSelector, PaginationControls } from "@/components/ui/data-pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useAdminApi } from "@/app/hooks/useAdminApi"

const juryRoles = [
  {
    title: "Filtre",
    value: "filter",
    description: "Profil par défaut pour les personnes souvent chargées du premier échange.",
  },
  {
    title: "Validation / coach",
    value: "validator",
    description: "Profil par défaut pour les coachs qui préparent les questions du référentiel.",
  },
  {
    title: "Motivation",
    value: "motivation",
    description: "Profil par défaut pour l'appréciation de la motivation du candidat.",
  },
]

const initialFormData = {
  firstName: "",
  lastName: "",
  email: "",
}

export default function JuryRolesRegistrationPage() {
  const { toast } = useToast()
  const { juryMembers } = useAdminApi()
  const [selectedRole, setSelectedRole] = useState(juryRoles[0].value)
  const [formData, setFormData] = useState(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdCredentials, setCreatedCredentials] = useState(null)
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [membersError, setMembersError] = useState("")
  const [editingMemberId, setEditingMemberId] = useState("")
  const [memberRoleDraft, setMemberRoleDraft] = useState("")
  const [membersPage, setMembersPage] = useState(1)
  const [membersPageSize, setMembersPageSize] = useState(10)
  const [createError, setCreateError] = useState("")
  const [memberSearch, setMemberSearch] = useState("")
  const [selectedMemberId, setSelectedMemberId] = useState("")
  const [passwordResettingId, setPasswordResettingId] = useState("")

  const activeRole = useMemo(
    () => juryRoles.find((role) => role.value === selectedRole) || juryRoles[0],
    [selectedRole],
  )
  const filteredMembers = useMemo(() => {
    const search = memberSearch.trim().toLowerCase()
    if (!search) return members

    return members.filter((member) =>
      [
        member.first_name,
        member.last_name,
        member.email,
        member.role_label,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search),
    )
  }, [memberSearch, members])

  const paginatedMembers = useMemo(() => {
    const start = (membersPage - 1) * membersPageSize
    return filteredMembers.slice(start, start + membersPageSize)
  }, [filteredMembers, membersPage, membersPageSize])

  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedMemberId) || null,
    [members, selectedMemberId],
  )

  const updateField = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }))
  }

  const fetchMembers = useCallback(async () => {
    try {
      setMembersLoading(true)
      setMembersError("")
      const response = await juryMembers.getAll()
      setMembers(response.data || [])
    } catch (error) {
      setMembersError(error.message || "Impossible de charger les membres du jury.")
      toast({
        title: "Chargement impossible",
        description: error.message || "Impossible de charger les membres du jury.",
        variant: "destructive",
      })
    } finally {
      setMembersLoading(false)
    }
  }, [juryMembers, toast])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  useEffect(() => {
    const totalPages = Math.max(Math.ceil(filteredMembers.length / membersPageSize), 1)
    if (membersPage > totalPages) {
      setMembersPage(totalPages)
    }
  }, [filteredMembers.length, membersPage, membersPageSize])

  const handleCopyCredentials = async () => {
    if (!createdCredentials) return

    await navigator.clipboard.writeText(
      [
        `Email : ${createdCredentials.email}`,
        `Mot de passe temporaire : ${createdCredentials.password}`,
        `Rôle : ${createdCredentials.roleLabel}`,
        `Email envoyé : ${createdCredentials.emailSent ? "Oui" : "Non"}`,
      ].join("\n"),
    )

    toast({
      title: "Identifiants copiés",
      description: "Vous pouvez les transmettre au membre du jury.",
    })
  }

  const handleSubmit = async (event) => {
    event?.preventDefault()
    setCreateError("")

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setCreateError("Renseignez le prénom, le nom et l'email du membre du jury.")
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
        role: activeRole.value,
      })

      setCreatedCredentials({
        email: response.data?.email || response.user?.email || formData.email.trim(),
        password: response.temporary_password || "",
        roleLabel: response.role_label || activeRole.title,
        emailSent: Boolean(response.credentials_email_sent),
        emailMessage: response.credentials_email_message || "",
      })
      setSelectedMemberId(response.data?.id || "")
      setFormData(initialFormData)
      setCreateDialogOpen(false)
      setCredentialsModalOpen(true)
      await fetchMembers()

      toast({
        title: "Utilisateur créé",
        description: `${response.user?.email || "Le compte"} a été ajouté. Le rôle réel se règle ensuite par créneau.`,
      })
    } catch (error) {
      setCreateError(error.message || "Une erreur est survenue pendant la création.")
      toast({
        title: "Création impossible",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartEditRole = (member) => {
    setEditingMemberId(member.id)
    setMemberRoleDraft(member.role || juryRoles[0].value)
  }

  const handleSaveRole = async (memberId) => {
    try {
      await juryMembers.update(memberId, { role: memberRoleDraft })
      setEditingMemberId("")
      setMemberRoleDraft("")
      await fetchMembers()
      toast({
        title: "Rôle mis à jour",
        description: "Le membre du jury a été modifié.",
      })
    } catch (error) {
      toast({
        title: "Modification impossible",
        description: error.message || "Impossible de modifier le rôle.",
        variant: "destructive",
      })
    }
  }

  const handleToggleMember = async (member) => {
    try {
      await juryMembers.update(member.id, { is_active: !member.is_active })
      await fetchMembers()
      toast({
        title: member.is_active ? "Compte désactivé" : "Compte activé",
        description: member.email,
      })
    } catch (error) {
      toast({
        title: "Action impossible",
        description: error.message || "Impossible de changer le statut.",
        variant: "destructive",
      })
    }
  }

  const handleShowDetails = (member) => {
    setSelectedMemberId(member.id)
  }

  const handleResetPassword = async (member) => {
    const confirmed = window.confirm(
      `Générer un nouveau mot de passe temporaire pour ${member.email} ? L'ancien mot de passe ne fonctionnera plus.`,
    )
    if (!confirmed) return

    try {
      setPasswordResettingId(member.id)
      const response = await juryMembers.resetPassword(member.id)
      setCreatedCredentials({
        email: response.data?.email || member.email,
        password: response.temporary_password || "",
        roleLabel: response.data?.role_label || member.role_label,
        emailSent: Boolean(response.credentials_email_sent),
        emailMessage: response.credentials_email_message || "",
      })
      setCredentialsModalOpen(true)
      await fetchMembers()
      toast({
        title: "Mot de passe réinitialisé",
        description: response.credentials_email_sent
          ? "Les nouveaux identifiants ont été envoyés par email."
          : "Le mot de passe est affiché ici, l'email n'a pas été envoyé.",
      })
    } catch (error) {
      toast({
        title: "Réinitialisation impossible",
        description: error.message || "Impossible de générer un nouveau mot de passe.",
        variant: "destructive",
      })
    } finally {
      setPasswordResettingId("")
    }
  }

  const handleDeleteMember = async (member) => {
    if (!window.confirm(`Supprimer ou désactiver le compte ${member.email} ?`)) {
      return
    }

    try {
      const response = await juryMembers.remove(member.id)
      await fetchMembers()
      toast({
        title: response.deleted ? "Membre supprimé" : "Membre désactivé",
        description: response.message || member.email,
      })
    } catch (error) {
      toast({
        title: "Suppression impossible",
        description: error.message || "Impossible de supprimer ce membre.",
        variant: "destructive",
      })
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
                Créez les comptes des membres du jury. Le rôle par défaut aide l'organisation, mais le rôle réel se décide par créneau et par référentiel.
              </p>
            </div>
          </div>

          <Badge variant="outline" className="w-fit">
            Mot de passe automatique
          </Badge>
        </div>
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Comptes jury créés</CardTitle>
              <CardDescription>
            Retrouvez ici les membres d'entretien. Une même personne peut être coach sur un référentiel et filtreur sur un autre selon ses affectations.
              </CardDescription>
            </div>
            <Button type="button" onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Ajouter un jury
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={memberSearch}
              onChange={(event) => {
                setMemberSearch(event.target.value)
                setMembersPage(1)
              }}
              className="pl-9"
              placeholder="Rechercher par nom, email ou rôle..."
            />
          </div>

          {membersLoading ? (
            <p className="text-sm text-muted-foreground">Chargement des membres...</p>
          ) : membersError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {membersError}
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun membre du jury créé pour le moment.</p>
          ) : filteredMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun membre ne correspond à cette recherche.</p>
          ) : (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[860px] text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Membre</th>
                    <th className="px-4 py-3 font-medium">Profil par défaut</th>
                      <th className="px-4 py-3 font-medium">Statut</th>
                      <th className="px-4 py-3 font-medium">Email accès</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMembers.map((member) => (
                      <tr
                        key={member.id}
                        className={`border-t ${selectedMemberId === member.id ? "bg-orange-50/60" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium">
                            {member.first_name} {member.last_name}
                          </p>
                          <p className="text-muted-foreground">{member.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          {editingMemberId === member.id ? (
                            <div className="flex items-center gap-2">
                              <Select value={memberRoleDraft} onValueChange={setMemberRoleDraft}>
                                <SelectTrigger className="w-[170px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {juryRoles.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                      {role.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button size="sm" onClick={() => handleSaveRole(member.id)}>
                                OK
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="outline">{member.role_label}</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={member.is_active ? "default" : "secondary"}>
                            {member.is_active ? "Actif" : "Désactivé"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={member.credentials_email_sent ? "outline" : "secondary"}>
                            {member.credentials_email_sent ? "Envoyé" : "À transmettre"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => handleShowDetails(member)}>
                              <Eye className="mr-1 h-4 w-4" />
                              Détails
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => handleStartEditRole(member)}>
                              <Pencil className="mr-1 h-4 w-4" />
                              Rôle
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => handleToggleMember(member)}>
                              {member.is_active ? "Désactiver" : "Activer"}
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => handleDeleteMember(member)}>
                              <Trash2 className="mr-1 h-4 w-4" />
                              Supprimer
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Détail du jury</CardTitle>
                  <CardDescription>
                    Accès, rôle et mot de passe temporaire en cas de reset.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedMember ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-lg font-semibold">
                          {selectedMember.first_name} {selectedMember.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                      </div>
                      <div className="grid gap-3 text-sm">
                        <div className="rounded-lg border p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Profil par défaut</p>
                          <p className="mt-1 font-medium">{selectedMember.role_label}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Statut</p>
                          <p className="mt-1 font-medium">{selectedMember.is_active ? "Actif" : "Désactivé"}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Identifiants email</p>
                          <p className="mt-1 font-medium">
                            {selectedMember.credentials_email_sent ? "Envoyés" : "Non envoyés / à transmettre"}
                          </p>
                          {selectedMember.credentials_email_message ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {selectedMember.credentials_email_message}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-center gap-2"
                        disabled={passwordResettingId === selectedMember.id}
                        onClick={() => handleResetPassword(selectedMember)}
                      >
                        <KeyRound className="h-4 w-4" />
                        {passwordResettingId === selectedMember.id
                          ? "Génération..."
                          : "Réinitialiser et envoyer"}
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                      Cliquez sur “Détails” pour consulter un compte jury.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <PageSizeSelector
              value={membersPageSize}
              onChange={(nextPageSize) => {
                setMembersPageSize(nextPageSize)
                setMembersPage(1)
              }}
            />
            <PaginationControls
              page={membersPage}
              pageSize={membersPageSize}
              totalItems={filteredMembers.length}
              itemLabel="membres"
              onPageChange={setMembersPage}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open)
          if (open) {
            setCreateError("")
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Ajouter un jury</DialogTitle>
            <DialogDescription>
              Choisissez un profil par défaut puis renseignez les informations. Le rôle opérationnel sera défini dans les créneaux de chaque référentiel.
            </DialogDescription>
          </DialogHeader>

          <form id="create-jury-form" onSubmit={handleSubmit} className="space-y-5">
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
                        {selectedRole === role.value ? (
                          <CheckCircle2 className="h-5 w-5 text-orange-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
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

            <div className="rounded-xl bg-orange-50 p-4 dark:bg-orange-950/20">
              <p className="text-sm text-muted-foreground">Profil par défaut sélectionné</p>
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
                  onChange={(event) => updateField("firstName", event.target.value)}
                  placeholder="Ex: Awa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jury-last-name">Nom</Label>
                <Input
                  id="jury-last-name"
                  value={formData.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
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
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="Ex: jury@odc.sn"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jury-role">Profil par défaut</Label>
                <Input id="jury-role" value={activeRole.title} readOnly className="bg-muted" />
              </div>
            </div>

            <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              Aucun mot de passe à saisir. Il sera généré automatiquement et affiché après création.
            </div>

            {createError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {createError}
              </div>
            ) : null}
          </form>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" form="create-jury-form" disabled={isSubmitting}>
              {isSubmitting ? "Création..." : "Enregistrer l'utilisateur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={credentialsModalOpen} onOpenChange={setCredentialsModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Compte créé avec succès</AlertDialogTitle>
            <AlertDialogDescription>
              Transmettez ces identifiants au membre du jury. Le mot de passe est temporaire.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {createdCredentials ? (
            <div className="space-y-3">
              <div className="rounded-xl border bg-muted/40 p-4 text-sm">
                <p>
                  <strong>Email :</strong> {createdCredentials.email}
                </p>
                <p className="mt-2">
                  <strong>Rôle :</strong> {createdCredentials.roleLabel}
                </p>
                <p className="mt-2">
                  <strong>Mot de passe temporaire :</strong> {createdCredentials.password || "-"}
                </p>
              </div>
              <div
                className={`rounded-xl border p-3 text-sm ${
                  createdCredentials.emailSent
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                {createdCredentials.emailSent
                  ? "Email envoyé automatiquement au membre du jury."
                  : createdCredentials.emailMessage || "Email non envoyé. Copiez les identifiants et transmettez-les manuellement."}
              </div>
            </div>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel>Fermer</AlertDialogCancel>
            <AlertDialogAction onClick={handleCopyCredentials} className="gap-2">
              <Copy className="h-4 w-4" />
              Copier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
