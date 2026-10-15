import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import CompetencesInterviewSlotAssignmentCard from "../competences-interview-slot-assignment-card"
import InterviewFormDialog from "./interview-form-dialog"

export default function InterviewSlotsPanel({ interviews, onPlan }) {
  const [createOpen, setCreateOpen] = useState(false)
  const update = (field, value) => interviews.setSlotForm((previous) => ({ ...previous, [field]: value }))
  return (
    <>
      <CompetencesInterviewSlotAssignmentCard slots={interviews.campaignSlots}
        adminOptions={interviews.adminOptions} occupancy={interviews.slotOccupancy}
        submitting={interviews.submitting} onSave={interviews.handleUpdateSlotAssignments}
        onCreate={() => setCreateOpen(true)} onPlan={onPlan} />
      <InterviewFormDialog open={createOpen} onOpenChange={setCreateOpen} title="Nouveau créneau"
        description="Ajoutez une plage horaire. Vous pourrez ensuite affecter les jurys et planifier les candidats."
        submitting={interviews.submitting} onSubmit={interviews.handleCreateSlot} submitLabel="Créer le créneau">
        <div className="space-y-1.5">
          <Label htmlFor="slot-label">Nom du créneau</Label>
          <Input id="slot-label" required value={interviews.slotForm.label} placeholder="Ex. Lundi matin - Salle 1"
            onChange={(event) => update("label", event.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="slot-start">Début</Label>
            <Input id="slot-start" type="datetime-local" required value={interviews.slotForm.start_at}
              onChange={(event) => update("start_at", event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slot-end">Fin</Label>
            <Input id="slot-end" type="datetime-local" required min={interviews.slotForm.start_at || undefined}
              value={interviews.slotForm.end_at} onChange={(event) => update("end_at", event.target.value)} />
          </div>
        </div>
      </InterviewFormDialog>
    </>
  )
}
