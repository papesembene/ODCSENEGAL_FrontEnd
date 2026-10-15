"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { CalendarClock, Plus, Search, Users } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

function formatSlotDate(value) {
  return value ? new Date(value).toLocaleString("fr-FR") : "-"
}

export default function CompetencesInterviewSlotAssignmentCard({
  slots,
  adminOptions,
  occupancy = {},
  submitting,
  onSave,
  onCreate,
  onPlan,
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mode, setMode] = useState("single")
  const [selectedSlotIds, setSelectedSlotIds] = useState([])
  const [draftAssignments, setDraftAssignments] = useState(EMPTY_ASSIGNMENTS)
  const [slotSearch, setSlotSearch] = useState("")
  const [userSearch, setUserSearch] = useState("")
  const deferredSearch = useDeferredValue(slotSearch).trim().toLowerCase()
  const visibleSlots = slots.filter((slot) => slot.label.toLowerCase().includes(deferredSearch))
  const visibleAdmins = adminOptions.filter((admin) => admin.label.toLowerCase().includes(userSearch.trim().toLowerCase()))

  const selectedSlots = useMemo(
    () => slots.filter((slot) => selectedSlotIds.includes(slot.id)),
    [selectedSlotIds, slots],
  )

  const openSingleSlot = (slot) => {
    setMode("single")
    setSelectedSlotIds([slot.id])
    setDraftAssignments(getSlotAssignments(slot))
    setUserSearch("")
    setDialogOpen(true)
  }

  const openBulkAssignment = () => {
    setMode("bulk")
    setSelectedSlotIds([])
    setDraftAssignments(EMPTY_ASSIGNMENTS)
    setUserSearch("")
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
    try {
      await onSave(selectedSlotIds, {
        ...draftAssignments,
        assigned_jury_ids: draftAssignments.assigned_filter_ids,
      })
      setDialogOpen(false)
    } catch {
      // Keep the selected assignments available after a failed request.
    }
  }

  const renderRolePicker = (role) => (
    <div key={role.key} role="group" aria-label={role.label} className="space-y-3 rounded-lg border p-3">
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
        {visibleAdmins.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun membre correspondant.</p>
        ) : (
          visibleAdmins.map((admin) => {
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
              <CardTitle role="heading" aria-level={2} className="text-lg">Créneaux et jurys</CardTitle>
              <CardDescription>
                {slots.length} créneau(x). Affectez les personnes par rôle, puis planifiez les candidats.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {onPlan ? <Button type="button" variant="outline" onClick={onPlan} disabled={submitting || !slots.length}>
                <CalendarClock className="mr-2 h-4 w-4" />Planifier
              </Button> : null}
              <Button type="button" variant="outline" onClick={openBulkAssignment} disabled={submitting || !slots.length}>
                <Users className="mr-2 h-4 w-4" />Affectation groupée
              </Button>
              {onCreate ? <Button type="button" onClick={onCreate} disabled={submitting}>
                <Plus className="mr-2 h-4 w-4" />Nouveau créneau
              </Button> : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {slots.length > 0 ? <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input className="pl-9" aria-label="Rechercher un créneau" placeholder="Rechercher un créneau"
              value={slotSearch} onChange={(event) => setSlotSearch(event.target.value)} />
          </div> : null}
          {slots.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <CalendarClock className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
              <p className="font-medium">Aucun créneau pour cette campagne</p>
              <p className="mt-1 text-sm text-muted-foreground">Ajoutez une plage horaire pour commencer les affectations.</p>
            </div>
          ) : (
            <Table containerClassName="isolate max-h-[58vh] rounded-lg border">
              <TableHeader className="sticky top-0 z-20 bg-background">
                <TableRow>
                  <TableHead className="min-w-[200px]">Créneau</TableHead>
                  <TableHead className="min-w-[180px]">Horaires</TableHead>
                  <TableHead>Candidats</TableHead>
                  <TableHead className="min-w-[260px]">Jurys affectés</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {visibleSlots.length === 0 ? <TableRow><TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                Aucun créneau correspondant à votre recherche.
              </TableCell></TableRow> : visibleSlots.map((slot) => {
                const counts = countAssignments(slot)

                return (
                  <TableRow key={slot.id}>
                    <TableCell className="font-medium">{slot.label}</TableCell>
                    <TableCell className="text-sm">
                      <p>{formatSlotDate(slot.start_at)}</p>
                      <p className="text-xs text-muted-foreground">Fin : {formatSlotDate(slot.end_at)}</p>
                    </TableCell>
                    <TableCell className="tabular-nums">{occupancy[slot.id] || 0}</TableCell>
                    <TableCell><div className="flex flex-wrap gap-1.5">
                      {ROLE_FIELDS.map((role) => (
                        <Badge key={role.key} variant={counts[role.key] ? "secondary" : "outline"}>
                          {role.label}: {counts[role.key]}
                        </Badge>
                      ))}
                    </div></TableCell>
                    <TableCell className="text-right">
                      <Button type="button" variant="outline" size="sm" disabled={submitting} onClick={() => openSingleSlot(slot)}>
                        Gérer les jurys
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              </TableBody>
            </Table>
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
            <Input aria-label="Rechercher un membre du jury" placeholder="Rechercher un membre du jury"
              value={userSearch} onChange={(event) => setUserSearch(event.target.value)} />
            {mode === "bulk" ? (
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-medium">Créneaux concernés</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedSlotIds.length} créneau(x) sélectionné(s)
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Les affectations choisies remplaceront celles des créneaux sélectionnés.</p>
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
