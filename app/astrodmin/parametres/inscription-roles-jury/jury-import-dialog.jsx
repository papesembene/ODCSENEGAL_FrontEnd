"use client"

import { useState } from "react"
import { Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { downloadJuryCredentials, downloadJuryTemplate, readJuryCredentials, readJuryImport } from "./jury-workbooks"

export default function JuryImportDialog({ catalog, createMember, onImported }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState("")
  const [error, setError] = useState("")
  const [result, setResult] = useState(null)

  function changeOpen(value) {
    if (busy || downloading) return
    setOpen(value)
    setFile(null)
    setResult(null)
    setProgress("")
    setError("")
  }

  async function importMembers(event) {
    event.preventDefault()
    if (!file || busy || catalog.phase !== "ready") return
    setBusy(true)
    setError("")
    try {
      const { users, issues } = await readJuryImport(file, catalog.options)
      const credentials = []
      for (const [index, { line, payload }] of users.entries()) {
        setProgress(`Création des comptes (${index + 1}/${users.length})…`)
        try {
          const response = await createMember(payload)
          credentials.push(readJuryCredentials(response, {
            ...payload, roleLabel: payload.role === "coach" ? "Coach" : "Validateur",
          }))
        } catch (failure) {
          issues.push({ line, email: payload.email, error: failure.message })
        }
      }
      setResult({ credentials, issues: issues.sort((a, b) => a.line - b.line) })
      if (credentials.length) await onImported()
    } catch (failure) {
      setError(failure.message || "Impossible de lire le fichier Excel.")
    } finally {
      setProgress("")
      setBusy(false)
    }
  }

  async function download(action) {
    setError("")
    setDownloading(true)
    try {
      await action()
    } catch {
      setError("Le téléchargement a échoué. Réessayez.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Importer des utilisateurs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importer des validateurs et des coachs</DialogTitle>
          <DialogDescription>
            {result ? "Téléchargez les identifiants des comptes créés pendant cet import."
              : "Utilisez le modèle Excel. Un rôle vide correspond à Validateur. Séparez les référentiels par des points-virgules."}
          </DialogDescription>
        </DialogHeader>
        {result ? (
          <div className="space-y-3">
            <p role="status" className="text-sm">
              {result.credentials.length} compte(s) créé(s) · {result.issues.length} ligne(s) en erreur
            </p>
            {result.issues.length > 0 && (
              <ul className="max-h-44 space-y-1 overflow-auto rounded-lg border p-3 text-sm">
                {result.issues.map(({ line, email, error: issue }) => (
                  <li key={line} className="break-words">Ligne {line}{email && ` (${email})`} — {issue}</li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <form id="import-jury-form" className="space-y-3" onSubmit={importMembers}>
            <Button type="button" variant="outline" onClick={() => download(downloadJuryTemplate)} disabled={busy || downloading} className="gap-2">
              <Download className="h-4 w-4" /> Modèle Excel
            </Button>
            <div className="space-y-2">
              <Label htmlFor="jury-import-file">Fichier Excel</Label>
              <Input id="jury-import-file" type="file" accept=".xlsx" disabled={busy} onChange={(event) => {
                setFile(event.currentTarget.files?.[0] || null)
                setError("")
              }} />
            </div>
            {catalog.phase === "error" && <p role="alert" className="text-sm text-destructive">Impossible de charger les référentiels.</p>}
            {progress && <p role="status" className="text-sm">{progress}</p>}
          </form>
        )}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button type="button" variant="outline" disabled={busy || downloading} onClick={() => changeOpen(false)}>Fermer</Button>
          {result ? (
            result.credentials.length > 0 && <Button type="button" disabled={downloading} className="gap-2"
              onClick={() => download(() => downloadJuryCredentials(result.credentials, "identifiants-import.xlsx"))}>
              <Download className="h-4 w-4" /> Télécharger les identifiants Excel
            </Button>
          ) : <Button type="submit" form="import-jury-form" disabled={!file || busy || downloading || catalog.phase !== "ready"}>Importer</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
