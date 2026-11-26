"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { nameOf } from "./referential-candidate-groups"

const UNASSIGN = "__none__"

export default function ReassignDialog({ candidate, validators, hasSchedule, onClose, onSubmit }) {
  const [validatorId, setValidatorId] = useState("")
  const [at, setAt] = useState("")
  const [duration, setDuration] = useState(15)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!candidate) return
    setValidatorId(validators[0]?.id || "")
    setAt("")
    setError("")
  }, [candidate, validators])

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError("")
    try {
      await onSubmit(validatorId === UNASSIGN
        ? { validator_id: null }
        : { validator_id: validatorId, ...(at ? { at } : {}), ...(hasSchedule ? {} : { duration: Number(duration) }) })
    } catch (failure) {
      setError(failure.message)
    } finally {
      setSaving(false)
    }
  }

  const unassigning = validatorId === UNASSIGN
  return (
    <Dialog open={Boolean(candidate)} onOpenChange={(open) => { if (!open && !saving) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{candidate?.validator ? "Déplacer" : "Affecter"} · {candidate ? nameOf(candidate) : ""}</DialogTitle>
            <DialogDescription>
              Possible tant que la convocation n’est pas envoyée.{candidate?.validator ? ` Validateur actuel : ${candidate.validator}.` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reassign-validator">Validateur</Label>
            <select id="reassign-validator" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={validatorId} onChange={(event) => setValidatorId(event.target.value)} disabled={saving}>
              {validators.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.assigned} candidat(s)</option>)}
              {candidate?.validator ? <option value={UNASSIGN}>Retirer l’affectation</option> : null}
            </select>
          </div>
          {!unassigning ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="reassign-at">Horaire · heure de Dakar</Label>
                <Input id="reassign-at" type="datetime-local" step={300} value={at} required={!hasSchedule}
                  onChange={(event) => setAt(event.target.value)} disabled={saving} />
                <p className="text-xs text-muted-foreground">
                  {hasSchedule
                    ? "Laissez vide pour prendre le prochain créneau libre de ce validateur, selon les horaires de la répartition."
                    : "Aucune répartition enregistrée : indiquez l’horaire."}
                </p>
              </div>
              {!hasSchedule ? (
                <div className="space-y-2">
                  <Label htmlFor="reassign-duration">Durée (min)</Label>
                  <Input id="reassign-duration" type="number" min={5} max={180} required value={duration}
                    onChange={(event) => setDuration(event.target.value)} disabled={saving} />
                </div>
              ) : null}
            </>
          ) : <p className="text-sm text-muted-foreground">Le candidat repassera dans « Sans validateur ».</p>}
          {error ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
            <Button type="submit" disabled={saving || !validatorId}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
