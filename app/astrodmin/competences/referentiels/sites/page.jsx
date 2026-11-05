"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Pencil, Plus } from "lucide-react"
import { toast } from "sonner"
import Link from "@/components/ui/interactive-link"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import { useTrainingCatalog } from "@/components/trainings/training-catalog-provider"
import CatalogFeedback from "@/components/trainings/catalog-feedback"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TrainingSitesPage() {
  const catalog = useTrainingCatalog()
  const { trainingSites } = useAdminApi()
  const [allowed, setAllowed] = useState(null)
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: "", description: "", status: "active", displayOrder: "0" })
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("admin_user") || "{}")
      setAllowed(["super_admin", "competences"].includes(localStorage.getItem("admin_type"))
        && user.profile_data?.admin_scope !== "interview_member")
    } catch { setAllowed(false) }
  }, [])
  function begin(site) {
    setEditing(site || null)
    setForm({ name: site?.name || "", description: site?.description || "", status: site?.status || "active", displayOrder: String(site?.displayOrder ?? 0) })
    setError("")
    setOpen(true)
  }
  async function save(event) {
    event.preventDefault()
    if (lock.current || !allowed) return
    if (!/^\d{1,5}$/.test(form.displayOrder) || Number(form.displayOrder) > 10000) { setError("L'ordre doit être compris entre 0 et 10000."); return }
    lock.current = true
    setBusy(true)
    setError("")
    try {
      const payload = { ...form, name: form.name.trim(), displayOrder: Number(form.displayOrder), ...(editing ? { version: editing.version } : {}) }
      if (editing) await trainingSites.update(editing.code, payload)
      else await trainingSites.create(payload)
      localStorage.setItem("odc_training_catalog_updated", String(Date.now()))
      await catalog.refresh()
      setOpen(false)
      toast.success(editing ? "Site mis à jour" : "Site ajouté. Affectez-lui des référentiels pour proposer des formations.")
    } catch (failure) { setError(failure.message) }
    finally { lock.current = false; setBusy(false) }
  }
  if (allowed === null) return <p className="p-6" role="status">Vérification des accès…</p>
  if (!allowed) return <p className="p-6" role="alert">La gestion des sites est réservée aux administrateurs Compétences et super admins.</p>
  return <div className="space-y-6 p-4 sm:p-6 md:p-8">
    <Link href="/astrodmin/competences/referentiels" className="inline-flex items-center gap-2 text-sm"><ArrowLeft size={16} />Référentiels</Link>
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold">Sites de formation</h1>
      <p className="mt-1 text-sm text-muted-foreground">Les lieux où les candidats peuvent choisir de se former.</p></div>
      <Button onClick={() => begin()} disabled={catalog.phase !== "ready"}><Plus size={16} className="mr-2" />Ajouter un site</Button></div>
    <CatalogFeedback />
    <div className="overflow-hidden rounded-lg border bg-card"><Table><TableHeader><TableRow>
      <TableHead>Site</TableHead><TableHead>Formations publiées</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Action</TableHead>
    </TableRow></TableHeader><TableBody>{catalog.sites.map((site) => <TableRow key={site.code}>
      <TableCell><p className="font-medium">{site.name}</p><p className="mt-1 max-w-lg text-sm text-muted-foreground">{site.description}</p></TableCell>
      <TableCell>{catalog.items.filter((item) => item.status === "published" && item.siteIds.includes(site.code)).length}</TableCell>
      <TableCell>{site.status === "active" ? "Actif" : "Archivé"}</TableCell>
      <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => begin(site)} aria-label={`Modifier ${site.name}`}><Pencil size={14} className="mr-2" />Modifier</Button></TableCell>
    </TableRow>)}</TableBody></Table></div>
    <Dialog open={open} onOpenChange={(value) => { if (!busy) setOpen(value) }}><DialogContent>
      <DialogHeader><DialogTitle>{editing ? "Modifier le site" : "Ajouter un site"}</DialogTitle>
        <DialogDescription>Un site archivé n'est plus proposé aux nouveaux candidats. Les dossiers existants sont conservés.</DialogDescription></DialogHeader>
      <form onSubmit={save} className="space-y-4"><fieldset disabled={busy} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="site-name">Nom du site *</Label><Input id="site-name" value={form.name} required maxLength={120} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="space-y-2"><Label htmlFor="site-description">Description courte</Label><Textarea id="site-description" value={form.description} maxLength={500} rows={3} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="site-order">Ordre d'affichage</Label><Input id="site-order" type="number" min={0} max={10000} required value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="site-status">Statut</Label><select id="site-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="active">Actif</option><option value="archived">Archivé</option></select></div></div>
      </fieldset>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={busy}>Annuler</Button><Button type="submit" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer le site"}</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  </div>
}
