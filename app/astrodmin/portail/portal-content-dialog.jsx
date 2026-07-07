"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { CONTENT_TYPES } from "./portal-content-config"

export default function PortalContentDialog({
  open,
  onOpenChange,
  editingItem,
  formData,
  saving,
  onFieldChange,
  onSubmit,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Modifier le contenu" : "Ajouter un contenu"}</DialogTitle>
          <DialogDescription>
            Un contenu publié devient visible automatiquement sur le portail public.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(value) => onFieldChange("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={(value) => onFieldChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priorité</Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(event) => onFieldChange("priority", event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Titre</Label>
            <Input value={formData.title} onChange={(event) => onFieldChange("title", event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Résumé court</Label>
            <Textarea
              value={formData.summary}
              onChange={(event) => onFieldChange("summary", event.target.value)}
              placeholder="Texte court visible dans le slider ou le bandeau nouveauté"
            />
          </div>

          <div className="space-y-2">
            <Label>Contenu détaillé</Label>
            <Textarea
              className="min-h-32"
              value={formData.body}
              onChange={(event) => onFieldChange("body", event.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FieldInput
              label="Image"
              value={formData.imageUrl}
              placeholder="/odc1Accueil.jpg"
              onChange={(value) => onFieldChange("imageUrl", value)}
            />
            <FieldInput
              label="Catégorie"
              value={formData.category}
              placeholder="Formation, Événement, Opportunité..."
              onChange={(value) => onFieldChange("category", value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FieldInput
              label="Texte du bouton"
              value={formData.linkLabel}
              placeholder="Postuler, En savoir plus..."
              onChange={(value) => onFieldChange("linkLabel", value)}
            />
            <FieldInput
              label="Lien du bouton"
              value={formData.linkUrl}
              placeholder="/odc/candidatures"
              onChange={(value) => onFieldChange("linkUrl", value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FieldInput
              label="Début d'affichage"
              type="datetime-local"
              value={formData.startsAt}
              onChange={(value) => onFieldChange("startsAt", value)}
            />
            <FieldInput
              label="Fin d'affichage"
              type="datetime-local"
              value={formData.endsAt}
              onChange={(value) => onFieldChange("endsAt", value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label>Mettre en avant</Label>
              <p className="text-sm text-muted-foreground">
                Le contenu prioritaire remonte en premier.
              </p>
            </div>
            <Switch
              checked={formData.isPinned}
              onCheckedChange={(checked) => onFieldChange("isPinned", checked)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving} className="bg-orange-500 text-black hover:bg-orange-600">
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function FieldInput({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
