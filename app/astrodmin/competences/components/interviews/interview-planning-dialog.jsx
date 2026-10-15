import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import InterviewFormDialog from "./interview-form-dialog"
import { InterviewSelect } from "./interview-workspace-ui"

export default function InterviewPlanningDialog({ interviews, open, onOpenChange }) {
  return (
    <InterviewFormDialog open={open} onOpenChange={onOpenChange} title="Planifier les candidats"
      description="Répartissez les candidats éligibles sur les créneaux de cette campagne."
      submitting={interviews.submitting} onSubmit={interviews.handleSeedEvaluations} submitLabel="Lancer la planification">
      <div className="rounded-lg border bg-muted/20 p-3 text-sm">
        <p className="font-medium">{interviews.selectedCampaign?.name}</p>
        <p className="mt-1 text-muted-foreground">{interviews.campaignSlots.length} créneau(x) disponible(s)</p>
      </div>
      <InterviewSelect id="planning-mode" label="Répartition" value={interviews.planningMode}
        onChange={interviews.setPlanningMode} options={[
          { value: "auto", label: "Équilibrer automatiquement les créneaux" },
          { value: "manual", label: "Définir un maximum par créneau" },
        ]} />
      {interviews.planningMode === "manual" ? (
        <div className="space-y-1.5">
          <Label htmlFor="planning-limit">Maximum de candidats par créneau</Label>
          <Input id="planning-limit" type="number" min={1} required step={1} value={interviews.candidatesPerSlot}
            onChange={(event) => interviews.setCandidatesPerSlot(event.target.value === "" ? "" : Math.max(Number(event.target.value) || 1, 1))} />
        </div>
      ) : <p className="text-sm text-muted-foreground">Le système calcule la répartition. Vous n'avez pas besoin de connaître le nombre de candidats à l'avance.</p>}
    </InterviewFormDialog>
  )
}
