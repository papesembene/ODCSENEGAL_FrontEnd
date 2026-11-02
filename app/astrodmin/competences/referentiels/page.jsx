"use client"

import { Archive, ArrowLeft, Pencil, Plus, RefreshCw } from "lucide-react"
import Link from "@/components/ui/interactive-link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import CatalogFeedback from "@/components/trainings/catalog-feedback"
import TrainingEditor from "./training-editor"
import useTrainingManagement from "./use-training-management"
import { TRAINING_STATUSES } from "./training-form"

export default function TrainingManagementPage() {
  const manager = useTrainingManagement()
  if (manager.allowed === null) return <p className="p-6" role="status">Vérification des accès…</p>
  if (!manager.allowed) return <Alert variant="destructive" className="m-6"><AlertDescription>La gestion des référentiels est réservée au super admin et à l'admin Compétences.</AlertDescription></Alert>
  return <div className="space-y-6 p-4 sm:p-6 md:p-8">
    <Link href="/astrodmin/competences" className="inline-flex items-center gap-2 text-sm"><ArrowLeft className="h-4 w-4" />Compétences</Link>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Référentiels</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gérez les formations proposées et leurs informations publiques.</p></div>
      <Button onClick={() => manager.begin()} disabled={manager.catalog.phase !== "ready"}><Plus className="mr-2 h-4 w-4" />Ajouter un référentiel</Button>
    </div>
    <CatalogFeedback />
    <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4">
      <div className="min-w-48 flex-1 space-y-2"><Label htmlFor="training-search">Rechercher</Label>
        <Input id="training-search" placeholder="Nom ou description…" value={manager.search} maxLength={200} onChange={(event) => manager.changeSearch(event.target.value)} />
      </div>
      <div className="space-y-2"><Label htmlFor="training-status-filter">Statut</Label>
        <select id="training-status-filter" className="h-10 rounded-md border bg-background px-3 text-sm" value={manager.status} onChange={(event) => manager.changeStatus(event.target.value)}>
          <option value="all">Tous les statuts</option>
          {Object.entries(TRAINING_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <Button variant="outline" aria-label="Actualiser les référentiels" onClick={manager.catalog.refresh} disabled={manager.catalog.phase === "loading"}><RefreshCw className="h-4 w-4" /></Button>
    </div>
    <div className="overflow-hidden rounded-lg border bg-card"><Table>
      <TableHeader><TableRow><TableHead>Référentiel</TableHead><TableHead>Durée</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
      <TableBody>{manager.items.map((item) => <TableRow key={item.code}>
        <TableCell><p className="font-medium">{item.title}</p><p className="mt-1 line-clamp-2 max-w-xl text-sm text-muted-foreground">{item.description}</p></TableCell>
        <TableCell className="whitespace-nowrap">{item.duration}</TableCell>
        <TableCell><Badge variant="outline">{TRAINING_STATUSES[item.status]}</Badge></TableCell>
        <TableCell><div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" aria-label={`Modifier ${item.title}`} onClick={() => manager.begin(item)} disabled={manager.busy}><Pencil className="mr-2 h-4 w-4" />Modifier</Button>
          {item.status !== "archived" && <Button variant="outline" size="sm" aria-label={`Archiver ${item.title}`} onClick={() => manager.setArchiveTarget(item)} disabled={manager.busy}><Archive className="h-4 w-4" /></Button>}
        </div></TableCell>
      </TableRow>)}</TableBody>
    </Table>{manager.catalog.phase === "ready" && manager.total === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Aucun référentiel ne correspond à votre recherche.</p>}</div>
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>{manager.total} référentiel(s) · Page {manager.page} / {manager.pages}</span>
      <div className="flex gap-2"><Button variant="outline" size="sm" disabled={manager.page <= 1} onClick={() => manager.setPage(manager.page - 1)}>Précédent</Button>
        <Button variant="outline" size="sm" disabled={manager.page >= manager.pages} onClick={() => manager.setPage(manager.page + 1)}>Suivant</Button></div>
    </div>
    <TrainingEditor manager={manager} />
    <AlertDialog open={Boolean(manager.archiveTarget)} onOpenChange={(value) => { if (!value && !manager.busy) manager.setArchiveTarget(null) }}>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Archiver ce référentiel ?</AlertDialogTitle>
        <AlertDialogDescription>{manager.archiveTarget?.title} ne sera plus proposé aux nouveaux candidats. Les anciens dossiers, tests et entretiens seront conservés. Vous pourrez le republier depuis « Modifier ».</AlertDialogDescription>
      </AlertDialogHeader>
        {manager.error && <p role="alert" className="text-sm text-destructive">{manager.error}</p>}
        <AlertDialogFooter><AlertDialogCancel disabled={manager.busy}>Annuler</AlertDialogCancel>
          <AlertDialogAction disabled={manager.busy} onClick={(event) => { event.preventDefault(); manager.archive() }}>Confirmer l'archivage</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
}
