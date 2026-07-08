"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Edit, KeyRound, Plus, RefreshCw, ShieldOff } from "lucide-react"

import { useAdminApi } from "@/app/hooks/useAdminApi"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const ADMIN_TYPES = [
  {
    value: "cm",
    label: "Community Manager",
    description: "Gère les slides, annonces, actualités et médias du portail public.",
  },
  {
    value: "competences",
    label: "Admin compétences",
    description: "Gère les candidatures formation, tests en ligne et entretiens compétences.",
  },
  {
    value: "startups",
    label: "Admin startups",
    description: "Gère les candidatures, programmes et contenus liés aux startups.",
  },
  {
    value: "super_admin",
    label: "Super admin",
    description: "Accès complet : paramètres, profils, portail, compétences et startups.",
  },
]

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  admin_type: "cm",
}

function getAdminTypeLabel(type) {
  return ADMIN_TYPES.find((item) => item.value === type)?.label || type
}

function getAdminTypeDescription(type) {
  return ADMIN_TYPES.find((item) => item.value === type)?.description || ""
}

export default function AdminProfilesPage() {
  const { adminProfiles } = useAdminApi()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [temporaryPassword, setTemporaryPassword] = useState("")
  const [passwordNotice, setPasswordNotice] = useState(null)

  const stats = useMemo(() => ({
    total: profiles.length,
    active: profiles.filter((profile) => profile.is_active).length,
    cm: profiles.filter((profile) => profile.admin_type === "cm").length,
  }), [profiles])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await adminProfiles.getAll(typeFilter)
      setProfiles(response.data || [])
    } catch (fetchError) {
      setError(fetchError.message)
      toast.error(fetchError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [typeFilter])

  const openCreateDialog = () => {
    setEditingProfile(null)
    setTemporaryPassword("")
    setPasswordNotice(null)
    setFormData(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEditDialog = (profile) => {
    setEditingProfile(profile)
    setTemporaryPassword("")
    setFormData({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      email: profile.email || "",
      admin_type: profile.admin_type || "cm",
    })
    setDialogOpen(true)
  }

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error("Prénom, nom et email sont requis")
      return
    }

    try {
      setSaving(true)
      if (editingProfile) {
        await adminProfiles.update(editingProfile.id, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          admin_type: formData.admin_type,
        })
        toast.success("Profil mis à jour")
        setDialogOpen(false)
      } else {
        const response = await adminProfiles.create(formData)
        const generatedPassword = response.temporary_password || ""
        setTemporaryPassword(generatedPassword)
        setPasswordNotice({
          email: response.data?.email || formData.email,
          password: generatedPassword,
          title: "Compte créé avec succès",
        })
        toast.success("Profil créé")
      }
      await fetchProfiles()
    } catch (submitError) {
      toast.error(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  const resetProfilePassword = async (profile) => {
    const confirmed = window.confirm(
      `Générer un nouveau mot de passe temporaire pour ${profile.email} ? L'ancien mot de passe ne fonctionnera plus.`
    )
    if (!confirmed) {
      return
    }

    try {
      const response = await adminProfiles.resetPassword(profile.id)
      setPasswordNotice({
        email: profile.email,
        password: response.temporary_password || "",
        title: "Mot de passe réinitialisé",
      })
      toast.success("Nouveau mot de passe généré")
    } catch (resetError) {
      toast.error(resetError.message)
    }
  }

  const toggleProfile = async (profile) => {
    try {
      await adminProfiles.update(profile.id, { is_active: !profile.is_active })
      toast.success(profile.is_active ? "Profil désactivé" : "Profil activé")
      await fetchProfiles()
    } catch (toggleError) {
      toast.error(toggleError.message)
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Profils administrateurs</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gérez les accès internes, dont le Community Manager responsable du portail public.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="bg-orange-500 text-black hover:bg-orange-600">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un profil
        </Button>
      </section>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {passwordNotice?.password && (
        <Alert>
          <AlertDescription className="space-y-3">
            <p className="font-medium text-foreground">{passwordNotice.title}</p>
            <p>
              Email : <span className="font-medium text-foreground">{passwordNotice.email}</span>
            </p>
            <div className="rounded-lg bg-muted px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Mot de passe temporaire</p>
              <p className="mt-1 font-mono text-base font-semibold text-foreground">{passwordNotice.password}</p>
            </div>
            <p>
              Copiez-le maintenant. Pour des raisons de sécurité, l'ancien mot de passe n'est jamais affichable :
              il est uniquement possible d'en générer un nouveau.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard label="Total" value={stats.total} />
        <StatsCard label="Actifs" value={stats.active} />
        <StatsCard label="CM" value={stats.cm} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Liste des profils</CardTitle>
              <CardDescription>Les membres jury restent gérés dans la section dédiée aux rôles jury.</CardDescription>
            </div>
            <div className="flex gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les profils</SelectItem>
                  {ADMIN_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchProfiles} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Profil</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Chargement...</TableCell>
                  </TableRow>
                ) : profiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Aucun profil trouvé.</TableCell>
                  </TableRow>
                ) : profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.first_name} {profile.last_name}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>{getAdminTypeLabel(profile.admin_type)}</TableCell>
                    <TableCell>
                      <Badge variant={profile.is_active ? "default" : "secondary"}>
                        {profile.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(profile)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          title="Réinitialiser le mot de passe"
                          onClick={() => resetProfilePassword(profile)}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleProfile(profile)}>
                          <ShieldOff className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProfile ? "Modifier le profil" : "Ajouter un profil"}</DialogTitle>
            <DialogDescription>
              Le mot de passe temporaire est généré automatiquement à la création.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prénom" value={formData.first_name} onChange={(value) => updateField("first_name", value)} />
              <Field label="Nom" value={formData.last_name} onChange={(value) => updateField("last_name", value)} />
            </div>
            <Field
              label="Email"
              type="email"
              value={formData.email}
              disabled={Boolean(editingProfile)}
              onChange={(value) => updateField("email", value)}
            />
            <div className="space-y-2">
              <Label>Profil</Label>
              <Select value={formData.admin_type} onValueChange={(value) => updateField("admin_type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{getAdminTypeDescription(formData.admin_type)}</p>
            </div>

            {temporaryPassword && (
              <Alert>
                <AlertDescription className="space-y-3">
                  <p className="font-medium text-foreground">Compte créé avec succès.</p>
                  <div className="rounded-lg bg-muted px-3 py-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Mot de passe temporaire</p>
                    <p className="mt-1 font-mono text-base font-semibold text-foreground">{temporaryPassword}</p>
                  </div>
                  <p>
                    Copiez ce mot de passe et transmettez-le à la personne concernée. Il est affiché uniquement ici
                    après la création du compte.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Fermer</Button>
              <Button type="submit" disabled={saving} className="bg-orange-500 text-black hover:bg-orange-600">
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatsCard({ label, value }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle>{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

function Field({ label, value, onChange, type = "text", disabled = false }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
