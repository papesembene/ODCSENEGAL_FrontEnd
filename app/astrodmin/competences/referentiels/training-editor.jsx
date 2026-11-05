"use client"

import { Loader2, Upload, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getPublicMediaUrl } from "@/lib/public-api"
import { TRAINING_FIELDS, TRAINING_STATUSES } from "./training-form"
import TrainingResidenceFields from "./training-residence-fields"

export default function TrainingEditor({ manager }) {
  const { open, setOpen, form, update, busy, error, save, editing, upload } = manager
  return <Dialog open={open} onOpenChange={(value) => { if (!busy) setOpen(value) }}>
    <DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{editing ? "Modifier le référentiel" : "Ajouter un référentiel"}</DialogTitle>
        <DialogDescription>Les informations publiées alimentent le site et les listes de sélection de la plateforme.</DialogDescription>
      </DialogHeader>
      <form onSubmit={save} className="space-y-5">
        <fieldset disabled={busy} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {TRAINING_FIELDS.map((field) => <div key={field.name} className={field.name === "title" ? "space-y-2 sm:col-span-2" : "space-y-2"}>
              <Label htmlFor={`training-${field.name}`}>{field.label}{field.required ? " *" : ""}</Label>
              <Input id={`training-${field.name}`} type={field.type || "text"} required={field.required}
                min={field.min} max={field.type === "number" ? field.max : undefined}
                maxLength={field.type === "number" ? undefined : field.max}
                value={form[field.name]} onChange={(event) => update(field.name, event.target.value)} />
            </div>)}
          </div>
          <div className="space-y-2"><Label htmlFor="training-description">Description</Label>
            <Textarea id="training-description" value={form.description} maxLength={10000} rows={4} onChange={(event) => update("description", event.target.value)} />
          </div>
          <div className="space-y-2"><Label htmlFor="training-skills">Objectifs et compétences (une ligne par objectif)</Label>
            <Textarea id="training-skills" value={form.skills} rows={4} onChange={(event) => update("skills", event.target.value)} />
          </div>
          <div className="space-y-2"><Label htmlFor="training-careers">Débouchés professionnels</Label>
            <Textarea id="training-careers" value={form.careers} maxLength={3000} onChange={(event) => update("careers", event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="training-image">Illustration (facultative, 10 Mo maximum)</Label>
            <div className="flex items-center gap-3"><Upload aria-hidden="true" className="h-4 w-4 shrink-0" />
              <Input id="training-image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { upload(event.target.files?.[0]); event.target.value = "" }} />
            </div>
            {form.imageUrl && <div className="flex items-start gap-3">
              <img src={getPublicMediaUrl(form.imageUrl)} alt="Aperçu du référentiel" className="h-28 w-48 rounded border object-cover" />
              <Button type="button" variant="outline" size="sm" onClick={() => update("imageUrl", "")}><X className="mr-2 h-4 w-4" />Retirer</Button>
            </div>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="training-status">Publication</Label>
              <select id="training-status" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.status} onChange={(event) => update("status", event.target.value)}>
                {Object.entries(TRAINING_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 self-end pb-2">
              <Checkbox id="training-female-only" checked={form.femaleOnly} onCheckedChange={(value) => update("femaleOnly", value === true)} />
              <Label htmlFor="training-female-only">Formation réservée aux femmes</Label>
            </div>
          </div>
          <TrainingResidenceFields manager={manager} />
        </fieldset>
        {error && <Alert variant="destructive" role="alert"><AlertDescription>{error}</AlertDescription></Alert>}
        <DialogFooter>
          <Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>Annuler</Button>
          <Button type="submit" disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer le référentiel</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}
