"use client"

import { useMemo, useState } from "react"
import { Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const ROLE_FIELDS = [
  { key: "assigned_filter_ids", label: "Filtreurs", shortLabel: "F" },
  { key: "assigned_validator_ids", label: "Validateurs / coachs", shortLabel: "V" },
  { key: "assigned_motivation_ids", label: "Jury motivation", shortLabel: "M" },
]

const EMPTY_ASSIGNMENTS = {
  assigned_filter_ids: [],
  assigned_validator_ids: [],
  assigned_motivation_ids: [],
}

function getSlotAssignments(slot) {
  return {
    assigned_filter_ids: [...(slot?.assigned_filter_ids || slot?.assigned_jury_ids || [])],
    assigned_validator_ids: [...(slot?.assigned_validator_ids || [])],
    assigned_motivation_ids: [...(slot?.assigned_motivation_ids || [])],
  }
}

function countAssignments(slot) {
  return {
    assigned_filter_ids: (slot?.assigned_filter_ids || slot?.assigned_jury_ids || []).length,
    assigned_validator_ids: (slot?.assigned_validator_ids || []).length,
    assigned_motivation_ids: (slot?.assigned_motivation_ids || []).length,
  }
}

function countAvailability(slot) {
  const responses = Object.values(slot?.availability_responses || {})
  return responses.reduce(
    (counts, item) => {
      const status = item?.status || "pending"
      if (status === "available") {
        counts.available += 1
      } else if (status === "unavailable") {
        counts.unavailable += 1
      } else {
        counts.pending += 1
      }
      return counts
    },
    { available: 0, unavailable: 0, pending: 0 },
  )
}

function formatSlotDate(value) {
  return value ? new Date(value).toLocaleString("fr-FR") : "-"
}

export default function CompetencesInterviewSlotAssignmentCard({
  slots,
  adminOptions,
  submitting,
  onSave,
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mode, setMode] = useState("single")
  const [selectedSlotIds, setSelectedSlotIds] = useState([])
  const [draftAssignments, setDraftAssignments] = useState(EMPTY_ASSIGNMENTS)

  const selectedSlots = useMemo(
    () => slots.filter((slot) => selectedSlotIds.includes(slot.id)),
    [selectedSlotIds, slots],
  )

  const openSingleSlot = (slot) => {
    setMode("single")
    setSelectedSlotIds([slot.id])
    setDraftAssignments(getSlotAssignments(slot))
    setDialogOpen(true)
  }

  const openBulkAssignment = () => {
    setMode("bulk")
    setSelectedSlotIds([])
    setDraftAssignments(EMPTY_ASSIGNMENTS)
    setDialogOpen(true)
  }

  const toggleSlot = (slotId, checked) => {
    setSelectedSlotIds((previous) => {
      if (checked) {
        return Array.from(new Set([...previous, slotId]))
      }
      return previous.filter((id) => id !== slotId)
    })
  }

  const toggleUser = (field, userId, checked) => {
    setDraftAssignments((previous) => {
      const nextIds = new Set(previous[field] || [])
      if (checked) {
        nextIds.add(userId)
      } else {
        nextIds.delete(userId)
      }
      return {
        ...previous,
        [field]: Array.from(nextIds),
      }
    })
  }

  const clearRole = (field) => {
    setDraftAssignments((previous) => ({
      ...previous,
      [field]: [],
    }))
  }

  const handleSave = async () => {
    await onSave(selectedSlotIds, {
      ...draftAssignments,
      assigned_jury_ids: draftAssignments.assigned_filter_ids,
    })
    setDialogOpen(false)
  }

  const renderRolePicker = (role) => (
    <div key={role.key} className="space-y-3 rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-medium">{role.label}</h4>
          <p className="text-xs text-muted-foreground">
            {(draftAssignments[role.key] || []).length} personne(s)
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => clearRole(role.key)}>
          Vider
        </Button>
      </div>

      <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
        {adminOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun membre d'entretien disponible.</p>
        ) : (
          adminOptions.map((admin) => {
            const checkboxId = `assignment-${mode}-${role.key}-${admin.value}`
            const checked = (draftAssignments[role.key] || []).includes(admin.value)

            return (
              <div key={checkboxId} className="flex items-center gap-3 rounded-md border bg-background p-2">
                <Checkbox
                  id={checkboxId}
                  checked={checked}
                  onCheckedChange={(value) => toggleUser(role.key, admin.value, Boolean(value))}
                />
                <Label htmlFor={checkboxId} className="min-w-0 flex-1 cursor-pointer truncate text-sm">
                  {admin.label}
                </Label>
              </div>
            )
          })
        )}
      </div>
    </div>
  )

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Affectation des jurys</CardTitle>
              <CardDescription>
                Affectez les filtreurs, validateurs et jurys motivation par créneau. La même personne peut avoir plusieurs rôles selon le besoin.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={openBulkAssignment} disabled={slots.length === 0}>
              <Users className="mr-2 h-4 w-4" />
              Affecter plusieurs créneaux
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <p className="rounded-lg border p-4 text-sm text-muted-foreground">
              Créez d'abord les créneaux de la campagne. Vous pourrez ensuite affecter les jurys.
            </p>
          ) : (
            <div className="space-y-3">
              {slots.map((slot) => {
                const counts = countAssignments(slot)
                const availability = countAvailability(slot)

                return (
                  <div key={slot.id} className="flex flex-col gap-3 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium">{slot.label}</p>
                      <p className="text-sm text-muted-foreground">{formatSlotDate(slot.start_at)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {ROLE_FIELDS.map((role) => (
                        <Badge key={role.key} variant={counts[role.key] ? "secondary" : "outline"}>
                          {role.shortLabel}: {counts[role.key]}
                        </Badge>
                      ))}
                      <Badge variant="outline">Dispo: {availability.available}</Badge>
                      <Badge variant="outline">Attente: {availability.pending}</Badge>
                      <Badge variant={availability.unavailable ? "destructive" : "outline"}>
                        Indispo: {availability.unavailable}
                      </Badge>
                      <Button type="button" variant="outline" size="sm" onClick={() => openSingleSlot(slot)}>
                        Affecter
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "bulk" ? "Affecter une équipe à plusieurs créneaux" : "Affecter les jurys du créneau"}
            </DialogTitle>
            <DialogDescription>
              {mode === "bulk"
                ? "Sélectionnez les créneaux concernés puis choisissez les personnes par rôle."
                : "Choisissez les personnes qui interviendront sur ce créneau."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {mode === "bulk" ? (
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-medium">Créneaux concernés</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedSlotIds.length} créneau(x) sélectionné(s)
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedSlotIds(slots.map((slot) => slot.id))}>
                    Tout sélectionner
                  </Button>
                </div>

                <div className="grid max-h-[240px] gap-2 overflow-y-auto md:grid-cols-2">
                  {slots.map((slot) => {
                    const checkboxId = `bulk-slot-${slot.id}`
                    const checked = selectedSlotIds.includes(slot.id)

                    return (
                      <div key={slot.id} className="flex items-start gap-3 rounded-md border p-3">
                        <Checkbox
                          id={checkboxId}
                          checked={checked}
                          onCheckedChange={(value) => toggleSlot(slot.id, Boolean(value))}
                          className="mt-1"
                        />
                        <Label htmlFor={checkboxId} className="flex-1 cursor-pointer space-y-1">
                          <span className="block font-medium">{slot.label}</span>
                          <span className="block text-xs text-muted-foreground">{formatSlotDate(slot.start_at)}</span>
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border p-4">
                <p className="font-medium">{selectedSlots[0]?.label || "Créneau"}</p>
                <p className="text-sm text-muted-foreground">{formatSlotDate(selectedSlots[0]?.start_at)}</p>
              </div>
            )}

            <div className="grid gap-3 xl:grid-cols-3">
              {ROLE_FIELDS.map(renderRolePicker)}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={handleSave} disabled={submitting || selectedSlotIds.length === 0}>
              Enregistrer les affectations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
