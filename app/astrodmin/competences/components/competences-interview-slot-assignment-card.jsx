"use client"

import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ROLE_FIELDS = [
  { key: "assigned_filter_ids", label: "Filtreurs" },
  { key: "assigned_validator_ids", label: "Validateurs" },
  { key: "assigned_motivation_ids", label: "Jury motivation" },
]

export default function CompetencesInterviewSlotAssignmentCard({
  slots,
  adminOptions,
  submitting,
  onSave,
}) {
  const [selectedSlotId, setSelectedSlotId] = useState("")
  const [draftAssignments, setDraftAssignments] = useState({
    assigned_filter_ids: [],
    assigned_validator_ids: [],
    assigned_motivation_ids: [],
  })

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === selectedSlotId) || null,
    [selectedSlotId, slots],
  )

  const applySlot = (slotId) => {
    setSelectedSlotId(slotId)
    const slot = slots.find((item) => item.id === slotId)
    setDraftAssignments({
      assigned_filter_ids: [...(slot?.assigned_filter_ids || slot?.assigned_jury_ids || [])],
      assigned_validator_ids: [...(slot?.assigned_validator_ids || [])],
      assigned_motivation_ids: [...(slot?.assigned_motivation_ids || [])],
    })
  }

  const toggleUser = (field, userId, checked) => {
    setDraftAssignments((prev) => {
      const nextIds = new Set(prev[field] || [])
      if (checked) {
        nextIds.add(userId)
      } else {
        nextIds.delete(userId)
      }

      return {
        ...prev,
        [field]: Array.from(nextIds),
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Affectation par créneau</CardTitle>
        <CardDescription>
          Choisissez un créneau puis assignez les filtreurs, validateurs et membres du jury motivation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Créneau</Label>
          <Select value={selectedSlotId} onValueChange={applySlot}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un créneau" />
            </SelectTrigger>
            <SelectContent>
              {slots.map((slot) => (
                <SelectItem key={slot.id} value={slot.id}>
                  {slot.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSlot ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
              <div>
                <p className="font-medium">{selectedSlot.label}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedSlot.start_at ? new Date(selectedSlot.start_at).toLocaleString("fr-FR") : "-"}
                </p>
              </div>
              <Badge variant="outline">{selectedSlot.status}</Badge>
            </div>

            {ROLE_FIELDS.map((role) => (
              <div key={role.key} className="space-y-4 rounded-lg border p-4">
                <div>
                  <h3 className="font-medium">{role.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(draftAssignments[role.key] || []).length} personne(s) affectée(s)
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Personnes affectées</p>
                  <div className="flex flex-wrap gap-2">
                    {(draftAssignments[role.key] || []).length === 0 ? (
                      <span className="text-sm text-muted-foreground">Aucune personne affectée pour le moment.</span>
                    ) : (
                      adminOptions
                        .filter((admin) => (draftAssignments[role.key] || []).includes(admin.value))
                        .map((admin) => (
                          <Badge key={`${role.key}-${admin.value}-selected`} variant="secondary">
                            {admin.label}
                          </Badge>
                        ))
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Admins disponibles</p>
                  <div className="grid gap-3 md:grid-cols-2">
                  {adminOptions.map((admin) => {
                    const checkboxId = `${selectedSlot.id}-${role.key}-${admin.value}`
                    const checked = (draftAssignments[role.key] || []).includes(admin.value)

                    return (
                      <div key={checkboxId} className="flex items-center space-x-3 rounded-md border p-3">
                        <Checkbox
                          id={checkboxId}
                          checked={checked}
                          onCheckedChange={(value) => toggleUser(role.key, admin.value, Boolean(value))}
                        />
                        <Label htmlFor={checkboxId} className="flex-1 cursor-pointer">
                          {admin.label}
                        </Label>
                      </div>
                    )
                  })}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <Button
                onClick={() =>
                  onSave(selectedSlot.id, {
                    ...draftAssignments,
                    assigned_jury_ids: draftAssignments.assigned_filter_ids,
                  })
                }
                disabled={submitting}
              >
                Enregistrer ce créneau
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sélectionnez un créneau pour gérer ses affectations.</p>
        )}
      </CardContent>
    </Card>
  )
}
