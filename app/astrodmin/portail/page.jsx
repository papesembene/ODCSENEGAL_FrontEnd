"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  Edit,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react"

import { useAdminApi } from "@/app/hooks/useAdminApi"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import PortalContentDialog from "./portal-content-dialog"
import {
  CONTENT_TYPES,
  EMPTY_PORTAL_CONTENT_FORM,
  STATUS_LABELS,
  formatPortalContentDate,
  getPortalContentTypeLabel,
  normalizePortalContentForm,
} from "./portal-content-config"

export default function PortalManagementPage() {
  const { portalContent } = useAdminApi()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState(EMPTY_PORTAL_CONTENT_FORM)

  const stats = useMemo(() => ({
    total: items.length,
    published: items.filter((item) => item.status === "published").length,
    banners: items.filter((item) => item.type === "banner").length,
    news: items.filter((item) => item.type === "news").length,
  }), [items])

  const fetchContents = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await portalContent.getAll({
        type: typeFilter,
        status: statusFilter,
      })
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
  }, [typeFilter, statusFilter])

  const openCreateDialog = () => {
    setEditingItem(null)
    setFormData(EMPTY_PORTAL_CONTENT_FORM)
    setDialogOpen(true)
  }

  const openEditDialog = (item) => {
    setEditingItem(item)
    setFormData(normalizePortalContentForm(item))
    setDialogOpen(true)
  }

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!formData.title.trim()) {
      toast.error("Le titre est obligatoire")
      return
    }

    try {
      setSaving(true)
      if (editingItem) {
        await portalContent.update(editingItem.id, formData)
        toast.success("Contenu mis à jour")
      } else {
        await portalContent.create(formData)
        toast.success("Contenu créé")
      }
      setDialogOpen(false)
      await fetchContents()
    } catch (submitError) {
      toast.error(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (item, status) => {
    try {
      await portalContent.update(item.id, { status })
      toast.success(status === "published" ? "Contenu publié" : "Statut mis à jour")
      await fetchContents()
    } catch (statusError) {
      toast.error(statusError.message)
    }
  }

  const handleDelete = async (item) => {
    if (!confirm(`Supprimer "${item.title}" ?`)) {
      return
    }
    try {
      await portalContent.remove(item.id)
      toast.success("Contenu supprimé")
      await fetchContents()
    } catch (deleteError) {
      toast.error(deleteError.message)
    }
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion du portail
          </h1>
          <p className="mt-2 text-muted-foreground">
            Publiez les bannières, nouveautés et informations visibles sur le portail public.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="bg-orange-500 text-black hover:bg-orange-600">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un contenu
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle>{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Publiés</CardDescription>
            <CardTitle>{stats.published}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bannières</CardDescription>
            <CardTitle>{stats.banners}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Nouveautés</CardDescription>
            <CardTitle>{stats.news}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Contenus du portail</CardTitle>
              <CardDescription>
                Les contenus publiés apparaissent automatiquement côté public.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchContents} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Mis à jour</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Aucun contenu pour le moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.title}</div>
                        <div className="line-clamp-1 max-w-md text-sm text-muted-foreground">
                          {item.summary || item.body || "Aucun résumé"}
                        </div>
                      </TableCell>
                      <TableCell>{getPortalContentTypeLabel(item.type)}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "published" ? "default" : "secondary"}>
                          {STATUS_LABELS[item.status] || item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.priority}</TableCell>
                      <TableCell>{formatPortalContentDate(item.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {item.status === "published" ? (
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(item, "draft")}>
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(item, "published")}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleDelete(item)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PortalContentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingItem={editingItem}
        formData={formData}
        saving={saving}
        onFieldChange={updateField}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
