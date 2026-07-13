"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarClock, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { useAdminApi } from "@/app/hooks/useAdminApi"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import odcFormations from "@/data/odcFormations"
import { FORMATION_MAPPING } from "../dashboard-config"

const EMPTY_CAMPAIGN_FORM = {
  title: "",
  promotion: "",
  formation: "all",
  startAt: "",
  endAt: "",
  status: "draft",
  description: "",
}

const STATUS_LABELS = {
  draft: "Brouillon",
  published: "Publiée",
  archived: "Archivée",
}

const LIFECYCLE_LABELS = {
  open: "Ouverte",
  upcoming: "À venir",
  closed: "Fermée",
  inactive: "Inactive",
}

function toDatetimeLocal(value) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 16)
}

function formatDateTime(value) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default function CompetencesCampaignsTab() {
  const { candidatures } = useAdminApi()
  const [campaigns, setCampaigns] = useState([])
  const [formData, setFormData] = useState(EMPTY_CAMPAIGN_FORM)
  const [editingId, setEditingId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const formationOptions = useMemo(
    () => [
      { value: "all", label: "Toutes les formations" },
      ...odcFormations
        .map((formation) => ({
          value: FORMATION_MAPPING[formation.title],
          label: formation.title,
        }))
        .filter((formation) => formation.value),
    ],
    [],
  )

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const response = await candidatures.getCampaigns()
      setCampaigns(response.data || [])
    } catch (error) {
      toast.error(error.message || "Impossible de charger les campagnes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setEditingId("")
    setFormData(EMPTY_CAMPAIGN_FORM)
  }

  const editCampaign = (campaign) => {
    setEditingId(campaign.id)
    setFormData({
      title: campaign.title || "",
      promotion: campaign.promotion || "",
      formation: campaign.formation || "all",
      startAt: toDatetimeLocal(campaign.startAt),
      endAt: toDatetimeLocal(campaign.endAt),
      status: campaign.status || "draft",
      description: campaign.description || "",
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!formData.title || !formData.startAt || !formData.endAt) {
      toast.error("Titre, date d'ouverture et date de fermeture sont requis")
      return
    }

    try {
      setSaving(true)
      if (editingId) {
        await candidatures.updateCampaign(editingId, formData)
        toast.success("Campagne mise à jour")
      } else {
        await candidatures.createCampaign(formData)
        toast.success("Campagne créée")
      }
      resetForm()
      await fetchCampaigns()
    } catch (error) {
      toast.error(error.message || "Enregistrement impossible")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Modifier la campagne" : "Créer une campagne"}</CardTitle>
          <CardDescription>
            Ces dates ouvrent ou ferment réellement les candidatures côté portail et côté API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Titre" value={formData.title} onChange={(value) => updateField("title", value)} />
            <Field label="Promotion" value={formData.promotion} placeholder="Ex: Promotion 2026" onChange={(value) => updateField("promotion", value)} />

            <div className="space-y-2">
              <Label>Formation concernée</Label>
              <Select value={formData.formation} onValueChange={(value) => updateField("formation", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formationOptions.map((formation) => (
                    <SelectItem key={formation.value} value={formation.value}>{formation.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ouverture" type="datetime-local" value={formData.startAt} onChange={(value) => updateField("startAt", value)} />
              <Field label="Fermeture" type="datetime-local" value={formData.endAt} onChange={(value) => updateField("endAt", value)} />
            </div>

            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={(value) => updateField("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publiée</SelectItem>
                  <SelectItem value="archived">Archivée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Message interne</Label>
              <Textarea
                value={formData.description}
                placeholder="Optionnel"
                onChange={(event) => updateField("description", event.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer"}
              </Button>
              {editingId ? <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button> : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Campagnes de candidature</CardTitle>
            <CardDescription>Une campagne publiée et dans ses dates ouvre automatiquement les candidatures.</CardDescription>
          </div>
          <Button variant="outline" onClick={fetchCampaigns} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {campaigns.length === 0 && !loading ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              Aucune campagne créée pour le moment.
            </div>
          ) : null}

          {campaigns.map((campaign) => (
            <div key={campaign.id} className="rounded-xl border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{campaign.title}</h3>
                    <Badge variant={campaign.isOpen ? "default" : "secondary"}>
                      {LIFECYCLE_LABELS[campaign.lifecycleStatus] || campaign.lifecycleStatus}
                    </Badge>
                    <Badge variant="outline">{STATUS_LABELS[campaign.status] || campaign.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {campaign.promotion || "Promotion non renseignée"} · {campaign.formation === "all" ? "Toutes les formations" : campaign.formation}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarClock className="h-4 w-4" />
                    {formatDateTime(campaign.startAt)} - {formatDateTime(campaign.endAt)}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => editCampaign(campaign)}>
                  Modifier
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
