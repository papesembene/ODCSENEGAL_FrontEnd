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
import { getPublicMediaUrl } from "@/lib/public-api"
import { HOME_LINK_OPTIONS } from "./portal-content-config"

export default function PortalContentDialog({
  open,
  onOpenChange,
  editingItem,
  formData,
  saving,
  uploadingImage,
  onFieldChange,
  onImageUpload,
  onSubmit,
}) {
  const isCandidatureSlide = formData.slotKey === "candidature" || editingItem?.slotKey === "candidature"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le slide d'accueil</DialogTitle>
          <DialogDescription>
            Changez le texte, l'image et le bouton affichés sur la page d'accueil.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>Titre du slide</Label>
            <Input value={formData.title} onChange={(event) => onFieldChange("title", event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Texte affiché sous le titre</Label>
            <Textarea
              value={formData.summary}
              onChange={(event) => onFieldChange("summary", event.target.value)}
              placeholder="Exemple : Du 03 au 17 novembre 2025..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div className="space-y-3">
              <FieldInput
                label="Image"
                value={formData.imageUrl}
                placeholder="/odc1Accueil.jpg"
                onChange={(value) => onFieldChange("imageUrl", value)}
              />
              <div className="space-y-2">
                <Label>Changer l'image</Label>
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  disabled={uploadingImage}
                  onChange={(event) => onImageUpload(event.target.files?.[0])}
                />
                <p className="text-xs text-muted-foreground">
                  {uploadingImage ? "Upload en cours..." : "Formats acceptés : JPG, PNG, WEBP, GIF."}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Aperçu</Label>
              <div className="overflow-hidden rounded-lg border bg-muted">
                {formData.imageUrl ? (
                  <img src={getPublicMediaUrl(formData.imageUrl)} alt="Aperçu du slide" className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                    Aucune image
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`grid gap-4 ${isCandidatureSlide ? "" : "md:grid-cols-2"}`}>
            <FieldInput
              label="Texte du bouton"
              value={formData.linkLabel}
              placeholder="Exemple : Postuler"
              onChange={(value) => onFieldChange("linkLabel", value)}
            />
            {isCandidatureSlide ? (
              <div className="rounded-lg border bg-orange-50 p-3 text-sm text-orange-900">
                La destination du bouton est automatique: elle dépend de la campagne de candidature définie par
                l'admin compétences ou le super admin.
              </div>
            ) : (
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
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FieldInput
              label="Afficher à partir du"
              type="datetime-local"
              value={formData.startsAt}
              onChange={(value) => onFieldChange("startsAt", value)}
            />
            <FieldInput
              label="Afficher jusqu'au"
              type="datetime-local"
              value={formData.endsAt}
              onChange={(value) => onFieldChange("endsAt", value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label>Mettre ce slide en premier</Label>
              <p className="text-sm text-muted-foreground">
                Utile lorsqu'une candidature ou annonce importante est en cours.
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
                {saving ? "Enregistrement..." : "Enregistrer le slide"}
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
