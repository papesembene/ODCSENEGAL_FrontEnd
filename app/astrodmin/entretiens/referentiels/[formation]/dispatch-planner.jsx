"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, CalendarClock, Eye, Plus, Shuffle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const number = new Intl.NumberFormat("fr-FR")
const dateTime = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
const formatAt = (value) => (value ? dateTime.format(new Date(`${value}Z`)) : "—")
const toMinutes = (value) => {
  const [hours, minutes] = String(value || "").split(":").map(Number)
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : null
}

function tomorrow() {
  const date = new Date(Date.now() + 24 * 3600 * 1000)
  return date.toISOString().slice(0, 10)
}

function initialSchedule(data) {
  return data?.schedule || {
    start_date: tomorrow(), day_start: "09:00", day_end: "17:00", duration: 15,
    breaks: [{ start: "13:00", end: "14:00" }], skip_weekends: true,
  }
}

function perDay(schedule) {
  const start = toMinutes(schedule.day_start)
  const end = toMinutes(schedule.day_end)
  const duration = Number(schedule.duration)
  if (start == null || end == null || !duration || end <= start) return 0
  const breaks = schedule.breaks.reduce((sum, item) => {
    const from = toMinutes(item.start)
    const to = toMinutes(item.end)
    return from != null && to != null && to > from ? sum + (to - from) : sum
  }, 0)
  return Math.max(0, Math.floor((end - start - breaks) / duration))
}

export default function DispatchPlanner({ data, disabled, onRun, eligibleRemaining }) {
  const [schedule, setSchedule] = useState(() => initialSchedule(data))
  const [capacity, setCapacity] = useState(() => data?.per_validator || "")
  const [preview, setPreview] = useState(null)
  const [running, setRunning] = useState(false)
  const validators = data?.validators?.length || 0

  useEffect(() => {
    setSchedule(initialSchedule(data))
    setCapacity(data?.per_validator || (validators ? Math.ceil(eligibleRemaining / validators) || "" : ""))
    setPreview(null)
    // Reset when the referential workspace changes, not on every refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.workspace_id])

  const update = (field, value) => setSchedule((current) => ({ ...current, [field]: value }))
  const updateBreak = (index, field, value) => setSchedule((current) => ({
    ...current, breaks: current.breaks.map((item, key) => (key === index ? { ...item, [field]: value } : item)),
  }))
  const payload = () => ({
    per_validator: Number(capacity),
    schedule: { ...schedule, duration: Number(schedule.duration), breaks: schedule.breaks.filter((item) => item.start && item.end) },
  })
  const daily = perDay(schedule)

  async function submit(event) {
    event.preventDefault()
    setRunning(true)
    const result = await onRun({ ...payload(), preview: true })
    setRunning(false)
    if (result) setPreview({ ...result, request: payload() })
  }

  async function confirm() {
    setRunning(true)
    const result = await onRun({ ...preview.request, seed: preview.seed })
    setRunning(false)
    if (result) setPreview(null)
  }

  return (
    <>
      <form className="space-y-4" onSubmit={submit}>
        <fieldset disabled={disabled || running} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="dispatch-start-date">Premier jour</Label>
            <Input id="dispatch-start-date" type="date" required value={schedule.start_date} onChange={(event) => update("start_date", event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dispatch-day-start">Début de journée</Label>
            <Input id="dispatch-day-start" type="time" step={300} required value={schedule.day_start} onChange={(event) => update("day_start", event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dispatch-day-end">Fin de journée</Label>
            <Input id="dispatch-day-end" type="time" step={300} required value={schedule.day_end} onChange={(event) => update("day_end", event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dispatch-duration">Durée d’un entretien (min)</Label>
            <Input id="dispatch-duration" type="number" min={5} max={180} required value={schedule.duration} onChange={(event) => update("duration", event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="per-validator">Maximum par validateur</Label>
            <Input id="per-validator" type="number" min={1} max={5000} required value={capacity} onChange={(event) => setCapacity(event.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2 lg:col-span-3">
            <span className="text-sm font-medium">Pauses</span>
            <div className="flex flex-wrap items-center gap-2">
              {schedule.breaks.map((item, index) => (
                <div key={index} className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
                  <Input aria-label={`Début de la pause ${index + 1}`} type="time" step={300} required className="h-8 w-28" value={item.start} onChange={(event) => updateBreak(index, "start", event.target.value)} />
                  <span className="text-muted-foreground">–</span>
                  <Input aria-label={`Fin de la pause ${index + 1}`} type="time" step={300} required className="h-8 w-28" value={item.end} onChange={(event) => updateBreak(index, "end", event.target.value)} />
                  <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={`Retirer la pause ${index + 1}`}
                    onClick={() => update("breaks", schedule.breaks.filter((_, key) => key !== index))}><X className="size-4" /></Button>
                </div>
              ))}
              {schedule.breaks.length < 5 ? (
                <Button type="button" variant="outline" size="sm" onClick={() => update("breaks", [...schedule.breaks, { start: "", end: "" }])}>
                  <Plus aria-hidden="true" />Ajouter une pause
                </Button>
              ) : null}
            </div>
          </div>
        </fieldset>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Label htmlFor="dispatch-weekends" className="flex items-center gap-2 font-normal">
            <Checkbox id="dispatch-weekends" checked={schedule.skip_weekends} disabled={disabled || running}
              onCheckedChange={(checked) => update("skip_weekends", checked === true)} />
            Pas d’entretien le samedi ni le dimanche
          </Label>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarClock className="size-4" aria-hidden="true" />
            ≈ {number.format(daily)} entretien(s) par jour et par validateur
          </p>
          <Button type="submit" className="ml-auto" disabled={disabled || running || !daily}>
            <Eye aria-hidden="true" />{running && !preview ? "Calcul…" : "Prévisualiser la répartition"}
          </Button>
        </div>
      </form>

      <Dialog open={Boolean(preview)} onOpenChange={(open) => { if (!open && !running) setPreview(null) }}>
        <DialogContent className="flex max-h-[90dvh] flex-col gap-0 p-0 sm:max-w-3xl">
          <DialogHeader className="border-b px-5 py-4 pr-12">
            <DialogTitle>Aperçu de la répartition</DialogTitle>
            <DialogDescription>Rien n’est enregistré tant que vous n’avez pas confirmé. Les horaires sont en heure de Dakar.</DialogDescription>
          </DialogHeader>
          {preview ? (
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <div className="rounded-lg bg-muted/50 px-3 py-2"><dt className="text-xs text-muted-foreground">Nouvelles affectations</dt><dd className="text-lg font-semibold tabular-nums">{number.format(preview.new_assignments)}</dd></div>
                <div className="rounded-lg bg-muted/50 px-3 py-2"><dt className="text-xs text-muted-foreground">Validateurs</dt><dd className="text-lg font-semibold tabular-nums">{number.format(preview.validators.length)}</dd></div>
                <div className="rounded-lg bg-muted/50 px-3 py-2"><dt className="text-xs text-muted-foreground">Durée d’un entretien</dt><dd className="text-lg font-semibold tabular-nums">{preview.schedule.duration} min</dd></div>
              </dl>
              {preview.unassigned > 0 ? (
                <p className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {number.format(preview.unassigned)} candidat(s) resteront sans validateur : la capacité ({preview.request.per_validator} par validateur) est atteinte. Augmentez le maximum ou ajoutez des validateurs.
                </p>
              ) : null}
              {!preview.new_assignments ? (
                <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                  Aucun nouveau candidat à affecter : tous les candidats éligibles ont déjà un validateur et un horaire.
                  La répartition n’ajoute que les nouveaux candidats. Pour changer le validateur ou l’horaire d’un candidat déjà affecté,
                  utilisez le bouton « Déplacer » dans l’onglet Candidats (possible tant que sa convocation n’est pas partie).
                </p>
              ) : null}
              <ul className="space-y-2">
                {preview.validators.map((validator) => (
                  <li key={validator.id} className="rounded-lg border">
                    <details>
                      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                        <span className="min-w-0 flex-1 font-medium">{validator.name}</span>
                        <span className="text-sm tabular-nums"><strong>+{validator.new}</strong> <span className="text-muted-foreground">({validator.existing} déjà affecté(s))</span></span>
                        <span className="text-sm text-muted-foreground">{validator.new ? `${formatAt(validator.first)} → ${formatAt(validator.last)}` : "Aucun nouveau créneau"}</span>
                      </summary>
                      {validator.candidates?.length ? (
                        <ol className="max-h-56 divide-y overflow-y-auto border-t text-sm">
                          {validator.candidates.map((row, index) => (
                            <li key={index} className="flex justify-between gap-3 px-4 py-1.5">
                              <span className="truncate capitalize">{row.name || "Candidat"}</span>
                              <span className="shrink-0 tabular-nums text-muted-foreground">{formatAt(row.at)}</span>
                            </li>
                          ))}
                        </ol>
                      ) : null}
                    </details>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <DialogFooter className="border-t px-5 py-3">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={running}>Retour aux paramètres</Button>
            </DialogClose>
            <Button type="button" onClick={confirm} disabled={running || !preview?.new_assignments}>
              <Shuffle aria-hidden="true" />{running ? "Enregistrement…" : "Confirmer la répartition"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
