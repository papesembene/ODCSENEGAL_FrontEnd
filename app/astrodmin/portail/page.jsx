"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Edit, Image as ImageIcon, Megaphone, Newspaper, Plus, RefreshCw } from "lucide-react"

import { useAdminApi } from "@/app/hooks/useAdminApi"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { buildHomeSlides } from "@/lib/home-content-defaults"
import { getPublicMediaUrl } from "@/lib/public-api"
import PortalContentDialog from "./portal-content-dialog"
import PortalSimpleContentDialog from "./portal-simple-content-dialog"
import {
  EMPTY_PORTAL_CONTENT_FORM,
  STATUS_LABELS,
  normalizePortalContentForm,
} from "./portal-content-config"

const SIMPLE_CONTENT_LABELS = {
  info: {
    title: "Annonce accueil",
    addLabel: "Ajouter une annonce",
    description: "Message court affiché sous le slider de la page d'accueil.",
  },
  news: {
    title: "Actualité",
    addLabel: "Ajouter une actualité",
    description: "Nouveauté affichée dans le bandeau actualités du portail.",
  },
}

export default function PortalManagementPage() {
  const { portalContent } = useAdminApi()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [slideDialogOpen, setSlideDialogOpen] = useState(false)
  const [simpleDialogOpen, setSimpleDialogOpen] = useState(false)
  const [simpleDialogType, setSimpleDialogType] = useState("info")
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState(EMPTY_PORTAL_CONTENT_FORM)
  const [uploadingImage, setUploadingImage] = useState(false)

  const homeSlides = useMemo(
    () => buildHomeSlides(items.filter((item) => item.type === "banner")),
    [items],
  )
  const announcements = items.filter((item) => item.type === "info")
  const news = items.filter((item) => item.type === "news")
  const mediaItems = items.filter((item) => item.imageUrl)

  const fetchContents = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await portalContent.getAll()
      setItems(response.data || [])
    } catch (fetchError) {
      setError(fetchError.message)
      toast.error(fetchError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContents()
  }, [])

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const openSlideDialog = (slide) => {
    setEditingItem(slide.isDefaultSlide ? null : slide)
    setFormData(normalizePortalContentForm({ ...slide, type: "banner" }))
    setSlideDialogOpen(true)
  }

  const openSimpleDialog = (type, item = null) => {
    setSimpleDialogType(type)
    setEditingItem(item)
    setFormData(normalizePortalContentForm(item || {
      ...EMPTY_PORTAL_CONTENT_FORM,
      type,
      status: "published",
      linkLabel: type === "news" ? "Lire" : "",
      linkUrl: type === "news" ? "/actualites" : "",
    }))
    setSimpleDialogOpen(true)
  }

  const saveContent = async (event, closeDialog) => {
    event.preventDefault()
    if (!formData.title.trim()) {
      toast.error("Le titre est obligatoire")
      return
    }

    try {
      setSaving(true)
      if (editingItem?.id) {
        await portalContent.update(editingItem.id, formData)
        toast.success("Contenu mis à jour")
      } else {
        await portalContent.create(formData)
        toast.success("Contenu créé")
      }
      closeDialog(false)
      await fetchContents()
    } catch (submitError) {
      toast.error(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file) => {
    if (!file) {
      return
    }
    try {
      setUploadingImage(true)
      const response = await portalContent.uploadImage(file)
      const imageUrl = response.data?.imageUrl
      if (imageUrl) {
        updateField("imageUrl", imageUrl)
        toast.success("Image ajoutée")
      }
    } catch (uploadError) {
      toast.error(uploadError.message)
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion du portail</h1>
          <p className="mt-2 text-muted-foreground">
            Modifiez les zones visibles du portail sans toucher au code.
          </p>
        </div>
        <Button variant="outline" onClick={fetchContents} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="slides" className="space-y-5">
        <TabsList className="grid h-auto grid-cols-2 gap-2 md:grid-cols-4">
          <TabsTrigger value="slides">Slides accueil</TabsTrigger>
          <TabsTrigger value="annonces">Annonces accueil</TabsTrigger>
          <TabsTrigger value="actualites">Actualités</TabsTrigger>
          <TabsTrigger value="medias">Médias</TabsTrigger>
        </TabsList>

        <TabsContent value="slides">
          <SlidesPanel loading={loading} slides={homeSlides} onEdit={openSlideDialog} />
        </TabsContent>

        <TabsContent value="annonces">
          <SimpleContentPanel
            icon={Megaphone}
            title="Annonces de la page d'accueil"
            description="Messages courts affichés juste sous le grand slider."
            items={announcements}
            loading={loading}
            addLabel={SIMPLE_CONTENT_LABELS.info.addLabel}
            onAdd={() => openSimpleDialog("info")}
            onEdit={(item) => openSimpleDialog("info", item)}
          />
        </TabsContent>

        <TabsContent value="actualites">
          <SimpleContentPanel
            icon={Newspaper}
            title="Actualités du portail"
            description="Nouveautés affichées dans le bandeau d'actualités."
            items={news}
            loading={loading}
            addLabel={SIMPLE_CONTENT_LABELS.news.addLabel}
            onAdd={() => openSimpleDialog("news")}
            onEdit={(item) => openSimpleDialog("news", item)}
          />
        </TabsContent>

        <TabsContent value="medias">
          <MediaPanel items={mediaItems} loading={loading} />
        </TabsContent>
      </Tabs>

      <PortalContentDialog
        open={slideDialogOpen}
        onOpenChange={setSlideDialogOpen}
        editingItem={editingItem}
        formData={formData}
        saving={saving}
        onFieldChange={updateField}
        onImageUpload={handleImageUpload}
        uploadingImage={uploadingImage}
        onSubmit={(event) => saveContent(event, setSlideDialogOpen)}
      />

      <PortalSimpleContentDialog
        open={simpleDialogOpen}
        onOpenChange={setSimpleDialogOpen}
        title={SIMPLE_CONTENT_LABELS[simpleDialogType].title}
        description={SIMPLE_CONTENT_LABELS[simpleDialogType].description}
        formData={formData}
        saving={saving}
        showButtonFields={simpleDialogType === "news"}
        onFieldChange={updateField}
        onSubmit={(event) => saveContent(event, setSimpleDialogOpen)}
      />
    </div>
  )
}

function SlidesPanel({ loading, slides, onEdit }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Slides de la page d'accueil</CardTitle>
            <CardDescription>
              Images, titres, textes et boutons du grand slider affiché à l'ouverture du portail.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <EmptyState message="Chargement des slides..." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {slides.map((slide, index) => (
              <Card key={slide.id || slide.slotKey || index} className="overflow-hidden">
                <div className="relative h-44 bg-muted">
                  <img src={getPublicMediaUrl(slide.imageUrl)} alt={slide.title} className="h-full w-full object-cover" />
                  <div className="absolute left-3 top-3 flex gap-2">
                    <Badge variant={slide.isDefaultSlide ? "secondary" : "default"}>
                      {slide.isDefaultSlide ? "Par défaut" : STATUS_LABELS[slide.status] || "Publié"}
                    </Badge>
                    {slide.isPinned && <Badge variant="secondary">Premier</Badge>}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-base">{slide.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{slide.summary}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                    <div className="font-medium">Bouton</div>
                    <div className="text-muted-foreground">{slide.linkLabel || "Aucun bouton"}</div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => onEdit(slide)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {slide.isDefaultSlide ? "Personnaliser ce slide" : "Modifier ce slide"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SimpleContentPanel({ icon: Icon, title, description, items, loading, addLabel, onAdd, onEdit }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <Button onClick={onAdd} className="bg-orange-500 text-black hover:bg-orange-600">
            <Plus className="mr-2 h-4 w-4" />
            {addLabel}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <EmptyState message="Chargement..." />
        ) : items.length === 0 ? (
          <EmptyState message="Aucun élément publié ou en brouillon pour le moment." />
        ) : (
          <div className="grid gap-3">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    <Badge variant={item.status === "published" ? "default" : "secondary"}>
                      {STATUS_LABELS[item.status] || item.status}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.summary || "Aucun texte"}</p>
                </div>
                <Button variant="outline" onClick={() => onEdit(item)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MediaPanel({ items, loading }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Médias utilisés sur le portail</CardTitle>
        <CardDescription>
          Aperçu des images utilisées par les slides et contenus publiés.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <EmptyState message="Chargement des médias..." />
        ) : items.length === 0 ? (
          <EmptyState message="Aucune image personnalisée pour le moment." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-xl border">
                <img src={getPublicMediaUrl(item.imageUrl)} alt={item.title} className="h-36 w-full object-cover" />
                <div className="p-3">
                  <p className="line-clamp-1 text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.type === "banner" ? "Slide accueil" : "Contenu portail"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}
