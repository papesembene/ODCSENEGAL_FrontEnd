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
import { Textarea } from "@/components/ui/textarea"
import { HOME_LINK_OPTIONS } from "./portal-content-config"

export default function PortalSimpleContentDialog({
  open,
  onOpenChange,
  title,
  description,
  formData,
  saving,
  showButtonFields = false,
  onFieldChange,
  onSubmit,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>Titre</Label>
            <Input
              value={formData.title}
              onChange={(event) => onFieldChange("title", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Texte</Label>
            <Textarea
              className="min-h-28"
              value={formData.summary}
              onChange={(event) => onFieldChange("summary", event.target.value)}
              placeholder="Écrivez le message visible par les visiteurs."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Afficher à partir du</Label>
              <Input
                type="datetime-local"
                value={formData.startsAt}
                onChange={(event) => onFieldChange("startsAt", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Afficher jusqu'au</Label>
              <Input
                type="datetime-local"
                value={formData.endsAt}
                onChange={(event) => onFieldChange("endsAt", event.target.value)}
              />
            </div>
          </div>

          {showButtonFields && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Texte du bouton</Label>
                <Input
                  value={formData.linkLabel}
                  placeholder="Lire, Découvrir, Postuler..."
                  onChange={(event) => onFieldChange("linkLabel", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Destination du bouton</Label>
                <Select value={formData.linkUrl} onValueChange={(value) => onFieldChange("linkUrl", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une page" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOME_LINK_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

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
