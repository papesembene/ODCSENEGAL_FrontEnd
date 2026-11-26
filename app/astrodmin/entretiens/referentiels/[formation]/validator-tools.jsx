"use client"

import { useEffect, useState } from "react"
import { Download, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const COLUMNS = ["Prénom", "Nom", "E-mail", "Rôle"]
const ROLE_LABELS = { validator: "Validateur", coach: "Coach" }
const ACTIONS = {
  create: ["Nouveau compte", "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300"],
  attach: ["Rattaché", "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300"],
  unchanged: ["Déjà présent", "bg-muted text-muted-foreground"],
  error: ["Erreur", "bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-300"],
}

async function downloadValidatorTemplate() {
  const { utils, writeFile } = await import("xlsx")
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([
    COLUMNS,
    ["Awa", "Diop", "awa.diop@example.com", "validateur"],
    ["Moussa", "Fall", "moussa.fall@example.com", "coach"],
    ["Fatou", "Ndiaye", "fatou.ndiaye@example.com", "validateur et coach"],
  ]), "Membres")
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([
    ["Colonne Rôle", "Valeurs acceptées"],
    ["validateur", "Mène les entretiens (Mes entretiens)"],
    ["coach", "Encadre les Bootcamps (Mes bootcamps)"],
    ["validateur et coach", "Les deux rôles sur le même compte"],
    ["(vide)", "Rôle par défaut de la page d’import"],
  ]), "Aide")
  writeFile(workbook, "modele-validateurs-coachs.xlsx")
}

async function readValidators(file) {
  if (!/\.xlsx$/i.test(file.name) || file.size > 2 * 1024 * 1024) throw new Error("Choisissez un fichier .xlsx de 2 Mo maximum.")
  const { read, utils } = await import("xlsx")
  const workbook = read(await file.arrayBuffer(), { sheetRows: 202 })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = sheet ? utils.sheet_to_json(sheet, { header: 1, defval: "", blankrows: false }) : []
  // The "Rôle" column is optional: older templates with only three columns still work.
  if (!COLUMNS.slice(0, 3).every((column, index) => String(rows[0]?.[index] || "").trim().toLowerCase() === column.toLowerCase())) {
    throw new Error("Les colonnes doivent être : Prénom, Nom, E-mail, Rôle.")
  }
  const values = rows.slice(1).map(([first_name, last_name, email, role]) => ({
    first_name: String(first_name).trim(), last_name: String(last_name).trim(), email: String(email).trim(), role: String(role || "").trim(),
  })).filter((row) => row.first_name || row.last_name || row.email)
  if (!values.length) throw new Error("Le fichier ne contient aucun validateur.")
  if (values.length > 200) throw new Error("Importez au maximum 200 validateurs à la fois.")
  return values
}

export function ValidatorImport({ formation, importValidators, disabled, onImported, defaultRole = "validator", label = "Importer des validateurs" }) {
  const [rows, setRows] = useState(null)
  const [plan, setPlan] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function selectFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setError("")
    setBusy(true)
    try {
      const values = await readValidators(file)
      const { data } = await importValidators({ formation, rows: values, preview: true, default_role: defaultRole })
      setRows(values)
      setPlan(data.rows)
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  async function confirm() {
    setBusy(true)
    setError("")
    try {
      const { data } = await importValidators({ formation, rows, preview: false, default_role: defaultRole })
      const done = data.rows.filter((row) => row.action === "create" || row.action === "attach").length
      setPlan(null)
      setRows(null)
      onImported(`${done} membre(s) ajouté(s) au référentiel.`, data.rows)
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  const useful = plan?.filter((row) => row.action === "create" || row.action === "attach").length || 0
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm" disabled={disabled || busy}>
          <label htmlFor="validators-excel" className={cn("cursor-pointer", (disabled || busy) && "pointer-events-none opacity-60")}>
            <UserPlus aria-hidden="true" />{busy && !plan ? "Lecture…" : label}
            <input id="validators-excel" type="file" accept=".xlsx" className="sr-only" onChange={selectFile} disabled={disabled || busy} />
          </label>
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => downloadValidatorTemplate().catch((failure) => setError(failure.message))}>
          <Download aria-hidden="true" />Modèle
        </Button>
      </div>
      {error && !plan ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <Dialog open={Boolean(plan)} onOpenChange={(open) => { if (!open && !busy) setPlan(null) }}>
        <DialogContent className="flex max-h-[85dvh] flex-col gap-0 p-0 sm:max-w-2xl">
          <DialogHeader className="border-b px-5 py-4 pr-12">
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>Colonne « Rôle » : validateur, coach ou « validateur et coach » (vide = {ROLE_LABELS[defaultRole].toLowerCase()}). Les nouveaux comptes reçoivent leurs identifiants par e-mail. Rien n’est créé avant votre confirmation.</DialogDescription>
          </DialogHeader>
          <ul className="min-h-0 flex-1 divide-y overflow-y-auto">
            {plan?.map((row) => {
              const [actionLabel, tone] = ACTIONS[row.action]
              return (
                <li key={row.index} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-2.5 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="font-medium">{[row.first_name, row.last_name].filter(Boolean).join(" ") || "—"}</span>
                    <span className="block truncate text-xs text-muted-foreground">{row.email || "Adresse manquante"} · {row.message}</span>
                  </span>
                  {row.roles?.length ? <span className="text-xs text-muted-foreground">{row.roles.map((role) => ROLE_LABELS[role] || role).join(" + ")}</span> : null}
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", tone)}>{actionLabel}</span>
                </li>
              )
            })}
          </ul>
          {error ? <p role="alert" className="border-t px-5 py-2 text-sm text-destructive">{error}</p> : null}
          <DialogFooter className="border-t px-5 py-3">
            <Button type="button" variant="outline" onClick={() => setPlan(null)} disabled={busy}>Annuler</Button>
            <Button type="button" onClick={confirm} disabled={busy || !useful}>
              {busy ? "Import…" : `Importer ${useful} membre(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function TeamsLinkDialog({ validator, onClose, onSave }) {
  const [url, setUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setUrl(validator?.teams_url || "")
    setError("")
  }, [validator])

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError("")
    try {
      await onSave(url.trim())
    } catch (failure) {
      setError(failure.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={Boolean(validator)} onOpenChange={(open) => { if (!open && !saving) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Lien Teams · {validator?.name}</DialogTitle>
            <DialogDescription>Modifiable tant qu’aucune convocation de ce validateur n’est partie.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="validator-teams-url">Lien de réunion Microsoft Teams</Label>
            <Input id="validator-teams-url" type="url" required value={url} placeholder="https://teams.microsoft.com/l/meetup-join/…"
              onChange={(event) => setUrl(event.target.value)} disabled={saving} />
          </div>
          {error ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
            <Button type="submit" disabled={saving || !url.trim() || url.trim() === validator?.teams_url}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
