import { useEffect, useState } from "react"
import { ClipboardList, Plus } from "lucide-react"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import CompetencesInterviewScorecardEditor from "../competences-interview-scorecard-editor"
import InterviewFormDialog from "./interview-form-dialog"
import { InterviewSelect } from "./interview-workspace-ui"
import { useTrainingCatalog } from "@/components/trainings/training-catalog-provider"
import CatalogFeedback from "@/components/trainings/catalog-feedback"

export function InterviewCampaignDialog({ interviews, formation: selectedFormation, open, onOpenChange, onCreated }) {
  const catalog = useTrainingCatalog()
  const { candidatures } = useAdminApi()
  const [sourceCampaigns, setSourceCampaigns] = useState([])
  const [sourceLoading, setSourceLoading] = useState(false)
  const [sourceError, setSourceError] = useState("")
  const update = (field, value) => interviews.setCampaignForm((previous) => ({ ...previous, [field]: value }))
  const formation = interviews.campaignForm.formation
  const sourceOptions = sourceCampaigns
    .filter((campaign) => ["published", "archived"].includes(campaign.status)
      && ["all", formation].includes(campaign.formation))
    .map((campaign) => ({ value: campaign.id, label: [campaign.title, campaign.promotion].filter(Boolean).join(" · ") }))
  const canSubmit = !sourceLoading && sourceOptions.some((option) => option.value === interviews.campaignForm.candidature_campaign_id)

  useEffect(() => {
    if (!open) return
    let active = true
    setSourceLoading(true)
    setSourceError("")
    candidatures.getCampaigns().then((response) => {
      if (active) setSourceCampaigns(response.data || [])
    }).catch((error) => {
      if (active) {
        setSourceCampaigns([])
        setSourceError(error.message || "Impossible de charger les campagnes de candidature.")
      }
    }).finally(() => {
      if (active) setSourceLoading(false)
    })
    return () => { active = false }
  }, [candidatures, open])

  return (
    <InterviewFormDialog open={open} onOpenChange={onOpenChange} title="Nouvelle campagne d'entretien"
      description="Une campagne regroupe les entretiens d'un référentiel et sa grille d'évaluation."
      submitting={interviews.submitting} submitDisabled={!canSubmit} onSubmit={async () => {
        if (!canSubmit) return null
        const campaign = await interviews.handleCreateCampaign()
        if (campaign) onCreated?.(campaign)
        return campaign
      }} submitLabel="Créer la campagne">
      <div className="space-y-1.5">
        <Label htmlFor="campaign-name">Nom de la campagne</Label>
        <Input id="campaign-name" required maxLength={200} value={interviews.campaignForm.name}
          onChange={(event) => update("name", event.target.value)} placeholder="Ex. Entretiens Dev Web Mobile - Promotion 2026" />
      </div>
      <CatalogFeedback />
      <InterviewSelect id="campaign-formation" label="Référentiel" value={formation}
        onChange={(value) => interviews.setCampaignForm((previous) => ({
          ...previous, formation: value, candidature_campaign_id: "",
        }))} options={selectedFormation ? catalog.allOptions : catalog.options} disabled={Boolean(selectedFormation)} />
      <InterviewSelect id="campaign-source" label="Campagne de candidature" value={interviews.campaignForm.candidature_campaign_id}
        onChange={(value) => update("candidature_campaign_id", value)} options={sourceOptions}
        placeholder={sourceLoading ? "Chargement…" : "Choisir une campagne"}
        disabled={!formation || sourceLoading || !sourceOptions.length} />
      {sourceError ? <p className="text-sm text-destructive" role="alert">{sourceError}</p> : null}
      {formation && !sourceLoading && !sourceError && !sourceOptions.length ? (
        <p className="text-sm text-muted-foreground">Aucune campagne de candidature publiée ou archivée pour ce référentiel.</p>
      ) : null}
      <div className="space-y-1.5">
        <Label htmlFor="campaign-description">Description <span className="font-normal text-muted-foreground">(facultative)</span></Label>
        <Textarea id="campaign-description" value={interviews.campaignForm.description} rows={3}
          onChange={(event) => update("description", event.target.value)} placeholder="Précisions utiles pour cette campagne" />
      </div>
    </InterviewFormDialog>
  )
}

export default function InterviewCampaignPanel({ interviews, onCreate }) {
  if (!interviews.selectedCampaign) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-dashed px-6 py-14 text-center">
        <ClipboardList className="mb-4 h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Préparez votre première campagne</h2>
        <p className="mb-5 mt-2 max-w-md text-sm text-muted-foreground">
          Choisissez un référentiel, définissez ses critères, puis organisez les créneaux.
        </p>
        <Button onClick={onCreate}><Plus className="mr-2 h-4 w-4" />Créer une campagne</Button>
      </div>
    )
  }
  return <CompetencesInterviewScorecardEditor selectedCampaign={interviews.selectedCampaign}
    submitting={interviews.submitting} locked={(interviews.selectedCampaign.evaluation_count || 0) > 0}
    onSave={interviews.handleUpdateCampaignScorecard} />
}
