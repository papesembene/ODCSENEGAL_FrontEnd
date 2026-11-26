"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const EMPTY = { title: "", start_date: "", end_date: "", location: "", description: "", capacity: "", coach_ids: [] }

export default function BootcampFormDialog({ open, bootcamp, coaches, campaignTitle, formationTitle, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const launched = bootcamp && bootcamp.status !== "draft"

  useEffect(() => {
    if (!open) return
    setError("")
    setForm(bootcamp ? {
      title: bootcamp.title, start_date: bootcamp.start_date, end_date: bootcamp.end_date, location: bootcamp.location || "",
      description: bootcamp.description || "", capacity: bootcamp.capacity || "", coach_ids: bootcamp.coach_ids || [],
    } : EMPTY)
  }, [open, bootcamp])

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError("")
    try {
      await onSave({ ...form, capacity: form.capacity === "" ? null : Number(form.capacity) })
    } catch (failure) {
      setError(failure.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value && !saving) onClose() }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{bootcamp ? "Modifier le Bootcamp" : "Nouveau Bootcamp"}</DialogTitle>
            <DialogDescription>{formationTitle} · {campaignTitle}{launched ? " — Bootcamp lancé : seuls le lieu et la description restent modifiables." : ""}</DialogDescription>
          </DialogHeader>
          <fieldset disabled={saving} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="bootcamp-title">Intitulé</Label>
              <Input id="bootcamp-title" required maxLength={150} value={form.title} disabled={launched} onChange={(event) => update("title", event.target.value)} placeholder="Bootcamp 1 · Groupe du matin" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5"><Label htmlFor="bootcamp-start">Date de début</Label><Input id="bootcamp-start" type="date" required value={form.start_date} disabled={launched} onChange={(event) => update("start_date", event.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="bootcamp-end">Date de fin</Label><Input id="bootcamp-end" type="date" required value={form.end_date} disabled={launched} onChange={(event) => update("end_date", event.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="bootcamp-capacity">Capacité</Label><Input id="bootcamp-capacity" type="number" min={1} max={5000} value={form.capacity} disabled={launched} onChange={(event) => update("capacity", event.target.value)} placeholder="Facultatif" /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bootcamp-location">Lieu ou modalité</Label>
              <Input id="bootcamp-location" maxLength={200} value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="ODC Dakar, salle 2 · ou : en ligne sur Teams" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bootcamp-description">Description</Label>
              <Textarea id="bootcamp-description" rows={3} maxLength={3000} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Programme, horaires, matériel à prévoir… (repris dans la convocation)" />
            </div>
            <fieldset className="space-y-2" disabled={launched || saving}>
              <legend className="text-sm font-medium">Coach(s) responsable(s)</legend>
              {coaches.length ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {coaches.map((coach) => (
                    <Label key={coach.id} htmlFor={`coach-${coach.id}`} className="flex items-center gap-2 rounded-lg border p-2.5 font-normal">
                      <Checkbox id={`coach-${coach.id}`} checked={form.coach_ids.includes(coach.id)}
                        onCheckedChange={(checked) => update("coach_ids", checked ? [...form.coach_ids, coach.id] : form.coach_ids.filter((id) => id !== coach.id))} />
                      <span className="min-w-0"><span className="block truncate text-sm">{coach.name}</span><span className="block truncate text-xs text-muted-foreground">{coach.email}</span></span>
                    </Label>
                  ))}
                </div>
              ) : <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Aucun coach actif pour ce référentiel. Créez-le dans Paramètres avec le rôle Coach.</p>}
            </fieldset>
          </fieldset>
          {error ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
            <Button type="submit" disabled={saving}>{saving ? "Enregistrement…" : bootcamp ? "Enregistrer" : "Créer le Bootcamp"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
