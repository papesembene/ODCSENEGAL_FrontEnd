"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "@/components/ui/interactive-link"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import { Checkbox } from "@/components/ui/checkbox"
import { useTrainingCatalog } from "@/components/trainings/training-catalog-provider"
import JuryImportDialog from "./jury-import-dialog"
import { downloadJuryCredentials, readJuryCredentials } from "./jury-workbooks"

const juryRoles = [
  {
    title: "Filtre",
    value: "filter",
    description: "Profil par défaut pour les personnes souvent chargées du premier échange.",
  },
  {
    title: "Validateur",
    value: "validator",
    description: "Réalise les entretiens des candidats qui lui sont affectés.",
  },
  { title: "Coach", value: "coach", description: "Compte de coach rattaché à un ou plusieurs référentiels." },
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
  formations: [],
  alsoSecondRole: false,
}

// A validator may also coach a Bootcamp, and a coach may also run interviews.
const SECOND_ROLE = { validator: "coach", coach: "validator" }
const roleTitle = (value) => juryRoles.find((role) => role.value === value)?.title || value

function SecondRoleCheckbox({ role, checked, onChange, disabled }) {
  const second = SECOND_ROLE[role]
  if (!second) return null
  return (
    <label className="flex items-start gap-2 rounded-lg border p-3 text-sm">
      <input type="checkbox" className="mt-0.5 accent-orange-600" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      <span>
        <span className="font-medium">Ce compte est aussi {roleTitle(second).toLowerCase()}</span>
        <span className="block text-xs text-muted-foreground">
          {second === "coach" ? "Il pourra encadrer des Bootcamps (« Mes bootcamps ») en plus de ses entretiens." : "Il pourra mener des entretiens (« Mes entretiens ») en plus de ses Bootcamps."}
          {" "}Mêmes référentiels pour les deux rôles.
        </span>
      </span>
    </label>
  )
}

const needsFormation = (role) => role === "validator" || role === "coach"

function FormationCheckboxes({ catalog, selected, onChange, disabled }) {
  const available = new Map(catalog.options.map(({ value, label }) => [value, label]))
  const selectedArchived = selected.filter((id) => !available.has(id))
  return <fieldset className="space-y-2" disabled={disabled}>
    <legend className="text-sm font-medium">Référentiels</legend>
    {catalog.error ? <p role="alert" className="text-sm text-destructive">Impossible de charger les référentiels.</p> : null}
    {!catalog.options.length && !catalog.error ? <p className="text-sm text-muted-foreground">{catalog.phase === "loading" ? "Chargement…" : "Aucun référentiel disponible."}</p> : null}
    <div className="grid max-h-40 gap-2 overflow-auto">
      {[...available, ...selectedArchived.map((id) => [id, catalog.allOptions.find((item) => item.value === id)?.label || id])].map(([id, label]) => (
        <Label key={id} className="gap-2 py-0.5">
          <Checkbox checked={selected.includes(id)} onCheckedChange={(checked) => onChange(checked ? [...selected, id] : selected.filter((value) => value !== id))} />
          {label}
        </Label>
      ))}
    </div>
  </fieldset>
}

export default function JuryRolesRegistrationPage() {
  const { toast } = useToast()
  const { juryMembers } = useAdminApi()
  const catalog = useTrainingCatalog()
  const [selectedRole, setSelectedRole] = useState("validator")
  const [formData, setFormData] = useState(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdCredentials, setCreatedCredentials] = useState(null)
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false)
  const [credentialsDownloading, setCredentialsDownloading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [membersError, setMembersError] = useState("")
  const [editingMemberId, setEditingMemberId] = useState("")
  const [memberRoleDraft, setMemberRoleDraft] = useState("")
  const [memberSecondRoleDraft, setMemberSecondRoleDraft] = useState(false)
  const [memberFormationsDraft, setMemberFormationsDraft] = useState([])
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

  const changeCredentialsOpen = (open) => {
    if (credentialsDownloading) return
    setCredentialsModalOpen(open)
    if (!open) setCreatedCredentials(null)
  }

  const handleDownloadCredentials = async () => {
    if (!createdCredentials?.password || credentialsDownloading) return
    setCredentialsDownloading(true)
    try {
      await downloadJuryCredentials([createdCredentials], "identifiants-utilisateur.xlsx")
    } catch {
      toast({ title: "Téléchargement impossible", description: "Réessayez avant de fermer cette fenêtre.", variant: "destructive" })
    } finally {
      setCredentialsDownloading(false)
    }
  }

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

      const payload = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        role: activeRole.value,
        formations: formData.formations,
        additional_roles: formData.alsoSecondRole && SECOND_ROLE[activeRole.value] ? [SECOND_ROLE[activeRole.value]] : [],
      }
      const response = await juryMembers.create(payload)

      setCreatedCredentials(readJuryCredentials(response, {
        ...payload,
        roleLabel: response.role_label || activeRole.title,
      }))
      setSelectedMemberId(response.data?.id || "")
      setFormData(initialFormData)
      setCreateDialogOpen(false)
      setCredentialsModalOpen(true)
      await fetchMembers()

      toast({
        title: "Utilisateur créé",
        description: `${response.user?.email || "Le compte"} a été ajouté.`,
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
    setMemberSecondRoleDraft(Boolean(SECOND_ROLE[member.role] && member.roles?.includes(SECOND_ROLE[member.role])))
    setMemberFormationsDraft(member.formations || [])
  }

  const handleSaveRole = async (memberId) => {
    try {
      await juryMembers.update(memberId, {
        role: memberRoleDraft, formations: memberFormationsDraft,
        additional_roles: memberSecondRoleDraft && SECOND_ROLE[memberRoleDraft] ? [SECOND_ROLE[memberRoleDraft]] : [],
      })
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
      setCreatedCredentials(readJuryCredentials(response, { ...member, roleLabel: member.role_label }))
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
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Utilisateurs</h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Inscrivez les validateurs et les coachs et choisissez leurs référentiels.
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
              <CardTitle>Utilisateurs enregistrés</CardTitle>
              <CardDescription>
            Retrouvez ici les membres d'entretien. Une même personne peut être coach sur un référentiel et filtreur sur un autre selon ses affectations.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <JuryImportDialog catalog={catalog} createMember={juryMembers.create} onImported={fetchMembers} />
              <Button type="button" onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Ajouter un utilisateur
              </Button>
            </div>
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
                            <div className="space-y-2">
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
                              <SecondRoleCheckbox role={memberRoleDraft} checked={memberSecondRoleDraft} onChange={setMemberSecondRoleDraft} />
                              {needsFormation(memberRoleDraft) ? <FormationCheckboxes catalog={catalog} selected={memberFormationsDraft} onChange={setMemberFormationsDraft} /> : null}
                              <Button size="sm" disabled={needsFormation(memberRoleDraft) && !memberFormationsDraft.length} onClick={() => handleSaveRole(member.id)}>
                                Enregistrer
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex flex-wrap gap-1">
                                {(member.roles?.length ? member.roles : [member.role]).map((role) => <Badge key={role} variant="outline">{roleTitle(role)}</Badge>)}
                              </div>
                              {needsFormation(member.role) ? <p className="text-xs text-muted-foreground">{member.formations?.length ? member.formations.map((code) => catalog.allOptions.find((item) => item.value === code)?.label || code).join(", ") : "À rattacher à un référentiel"}</p> : null}
                            </div>
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
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
            <DialogDescription>
              Choisissez le rôle et les référentiels auxquels l’utilisateur sera rattaché.
            </DialogDescription>
          </DialogHeader>

          <form id="create-jury-form" onSubmit={handleSubmit} className="space-y-5">
            <section className="grid gap-4 md:grid-cols-3">
              {juryRoles.map((role) => (
                <button
                  key={role.title}
                  type="button"
                  aria-pressed={selectedRole === role.value}
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

            <SecondRoleCheckbox role={activeRole.value} checked={formData.alsoSecondRole} onChange={(value) => updateField("alsoSecondRole", value)} disabled={isSubmitting} />
            {needsFormation(activeRole.value) ? <FormationCheckboxes catalog={catalog} selected={formData.formations} onChange={(value) => updateField("formations", value)} disabled={isSubmitting} /> : null}
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
            <Button type="submit" form="create-jury-form" disabled={isSubmitting || (needsFormation(activeRole.value) && !formData.formations.length)}>
              {isSubmitting ? "Création..." : "Enregistrer l'utilisateur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={credentialsModalOpen} onOpenChange={changeCredentialsOpen}>
        <AlertDialogContent className="max-h-[85dvh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Identifiants du compte</AlertDialogTitle>
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
            <AlertDialogCancel disabled={credentialsDownloading}>Fermer</AlertDialogCancel>
            <Button type="button" variant="outline" onClick={handleDownloadCredentials}
              disabled={!createdCredentials?.password || credentialsDownloading} className="gap-2">
              <Download className="h-4 w-4" />
              Télécharger Excel
            </Button>
            <Button type="button" onClick={handleCopyCredentials} className="gap-2">
              <Copy className="h-4 w-4" />
              Copier
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
