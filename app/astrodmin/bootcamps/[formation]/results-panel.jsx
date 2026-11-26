"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Eye, History, Mail, RefreshCw, Save, Search, Send, X } from "lucide-react"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { DECISIONS } from "./bootcamp-workspace"

const NOTIFIED = ["retained", "waiting_list", "rejected"]
const EMAIL_STATUS = {
  pending: ["En attente", "text-sky-700 dark:text-sky-300"], sending: ["En cours d’envoi", "text-sky-700 dark:text-sky-300"],
  sent: ["Envoyé", "text-emerald-700 dark:text-emerald-300"], failed: ["Échec", "text-destructive"], cancelled: ["Annulé", "text-muted-foreground"],
}
const dateTime = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Dakar" })
const formatDate = (value) => (value ? dateTime.format(new Date(value)) : "")
const fullName = (row) => [row?.first_name, row?.last_name].filter(Boolean).join(" ") || row?.email || "Candidat"
const normalize = (value) => String(value || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

// A row still needs the e-mail when its current decision has never been queued or sent.
const alreadyNotified = (row) => row.notification && row.notification.decision === row.decision && row.notification.status !== "cancelled"

export default function ResultsPanel({ formation, campaignId }) {
  const { bootcamps: api } = useAdminApi()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [templates, setTemplates] = useState(null)
  const [templateTab, setTemplateTab] = useState("retained")
  const [preview, setPreview] = useState(null)
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState("")
  const [decisionFilter, setDecisionFilter] = useState("all")
  const [notificationFilter, setNotificationFilter] = useState("all")
  const [confirm, setConfirm] = useState("")
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    api.results(formation, campaignId, { signal: controller.signal })
      .then(({ data: result }) => {
        if (controller.signal.aborted) return
        setData(result)
        setTemplates(result.templates)
        setSelected([])
      })
      .catch((failure) => { if (!controller.signal.aborted) setError(failure.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [api, campaignId, formation, reload])

  const rows = data?.rows || []
  const counts = useMemo(() => Object.fromEntries(NOTIFIED.map((decision) => [decision, rows.filter((row) => row.final && row.decision === decision).length])), [rows])
  const terms = normalize(search).split(/\s+/).filter(Boolean)
  const visible = rows.filter((row) => {
    if (decisionFilter !== "all" && row.decision !== decisionFilter) return false
    if (notificationFilter === "todo" && (alreadyNotified(row) || !row.final)) return false
    if (notificationFilter === "done" && !alreadyNotified(row)) return false
    if (notificationFilter === "failed" && row.notification?.status !== "failed") return false
    return terms.every((term) => normalize([row.first_name, row.last_name, row.email, row.bootcamp].join(" ")).includes(term))
  })
  const sendable = (row) => row.final && NOTIFIED.includes(row.decision) && !alreadyNotified(row)
  const recipients = rows.filter((row) => selected.includes(row.candidate_id) && sendable(row))
  const recipientCounts = Object.fromEntries(NOTIFIED.map((decision) => [decision, recipients.filter((row) => row.decision === decision).length]))
  const validated = data?.status === "validated" && !data?.changed_since_validation
  const templatesChanged = data && templates && JSON.stringify(templates) !== JSON.stringify(data.templates)

  async function run(payload, message) {
    setBusy(true)
    setError("")
    setNotice("")
    setConfirm("")
    try {
      const { data: result } = await api.resultsAction(formation, { campaign_id: campaignId, revision: data.revision, ...payload })
      setNotice(typeof message === "function" ? message(result) : message)
      setReload((value) => value + 1)
      return result
    } catch (failure) {
      setError(failure.message)
      return null
    } finally {
      setBusy(false)
    }
  }

  async function showPreview(decision) {
    setError("")
    try {
      const { data: result } = await api.resultsAction(formation, { action: "preview", campaign_id: campaignId, decision, templates })
      setPreview({ ...result, decision })
    } catch (failure) {
      setError(failure.message)
    }
  }

  const selectGroup = (decision) => setSelected(rows.filter((row) => sendable(row) && (decision === "all" || row.decision === decision)).map((row) => row.candidate_id))

  if (loading && !data) return <div role="status" className="space-y-3"><span className="sr-only">Chargement des résultats…</span><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>
  if (!data) return <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error || "Résultats indisponibles."}</p>

  const { bootcamps } = data
  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-5 [&>*]:bg-card">
        {[["Bootcamps soumis", `${bootcamps.submitted}/${bootcamps.total}`, ""], ["Retenus", counts.retained, "text-emerald-700 dark:text-emerald-300"],
          ["Liste d’attente", counts.waiting_list, "text-amber-700 dark:text-amber-300"], ["Non retenus", counts.rejected, "text-red-700 dark:text-red-300"],
          ["E-mails envoyés", data.emails.sent || 0, ""]].map(([label, value, tone]) => (
          <div key={label} className="px-4 py-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className={cn("text-xl font-semibold tabular-nums", tone)}>{value}</dd></div>
        ))}
      </dl>

      {error ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
      {notice ? <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-800 dark:text-emerald-300">{notice}</p> : null}

      <section className="space-y-3 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">1 · Valider les résultats</h3>
            <p className="text-sm text-muted-foreground">Les décisions proviennent des Bootcamps dont le coach a soumis les résultats. Aucun e-mail ne part sans votre action.</p>
          </div>
          {validated ? <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300">Validés</span> : null}
        </div>
        {bootcamps.launched ? <p className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{bootcamps.launched} Bootcamp(s) attendent encore la soumission des résultats par le coach.</p> : null}
        {data.changed_since_validation ? <p className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-400/10 dark:text-amber-200"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Des décisions ont changé depuis la validation. Validez de nouveau avant d’envoyer.</p> : null}
        {validated ? <p className="flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />Validés le {formatDate(data.validated_at)} par {data.validated_by?.name}.</p>
          : <Button onClick={() => setConfirm("validate")} disabled={busy || !bootcamps.submitted || bootcamps.launched > 0}><CheckCircle2 aria-hidden="true" />Valider les résultats</Button>}
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
        <div>
          <h3 className="font-semibold">2 · Préparer les e-mails</h3>
          <p className="text-sm text-muted-foreground">Un message par statut. Variables disponibles : {data.placeholders.map((key) => `{${key}}`).join(", ")}. Laissez une ligne vide entre deux paragraphes.</p>
        </div>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Statut du message">
          {NOTIFIED.map((decision) => (
            <button key={decision} type="button" role="tab" aria-selected={templateTab === decision} onClick={() => setTemplateTab(decision)}
              className={cn("rounded-full border px-3 py-1 text-sm transition", templateTab === decision ? "border-orange-500 bg-orange-50 font-medium text-orange-800 dark:bg-orange-400/10 dark:text-orange-200" : "hover:bg-muted")}>
              {DECISIONS[decision][0]}
            </button>
          ))}
        </div>
        {templates ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="result-subject">Objet</Label>
              <Input id="result-subject" maxLength={200} value={templates[templateTab].subject} disabled={busy}
                onChange={(event) => setTemplates((current) => ({ ...current, [templateTab]: { ...current[templateTab], subject: event.target.value } }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="result-body">Message</Label>
              <Textarea id="result-body" rows={9} maxLength={5000} value={templates[templateTab].body} disabled={busy}
                onChange={(event) => setTemplates((current) => ({ ...current, [templateTab]: { ...current[templateTab], body: event.target.value } }))} />
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => showPreview(templateTab)} disabled={busy}><Eye aria-hidden="true" />Aperçu</Button>
              {templatesChanged ? <Button variant="ghost" onClick={() => setTemplates(data.templates)} disabled={busy}>Annuler</Button> : null}
              <Button onClick={() => run({ action: "templates", templates }, "Messages enregistrés.")} disabled={busy || !templatesChanged}><Save aria-hidden="true" />Enregistrer les messages</Button>
            </div>
            {!templatesChanged ? <p className="text-right text-xs text-muted-foreground">Aucune modification : ces messages seront envoyés tels quels. Modifiez un texte pour pouvoir l’enregistrer.</p> : null}
          </div>
        ) : null}
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">3 · Choisir les destinataires et envoyer</h3>
            <p className="text-sm text-muted-foreground">Un candidat ne reçoit jamais deux fois le même résultat. S’il change de statut, il pourra recevoir le nouveau message.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.emails.failed ? <Button variant="outline" size="sm" onClick={() => run({ action: "retry" }, "Les e-mails en échec ont été remis en file.")} disabled={busy}><RefreshCw aria-hidden="true" />Relancer les échecs ({data.emails.failed})</Button> : null}
            <Button size="sm" onClick={() => setConfirm("send")} disabled={busy || !validated || !recipients.length || templatesChanged}>
              <Send aria-hidden="true" />Envoyer à {recipients.length} destinataire(s)
            </Button>
          </div>
        </div>
        {templatesChanged ? <p className="text-sm text-amber-700 dark:text-amber-300">Enregistrez les messages modifiés avant d’envoyer.</p>
          : !validated ? <p className="text-sm text-amber-700 dark:text-amber-300">Validez d’abord les résultats (étape 1) pour pouvoir envoyer.</p>
            : !recipients.length ? <p className="text-sm text-muted-foreground">Choisissez les destinataires ci-dessous (par exemple « Retenus à prévenir ») pour activer l’envoi.</p> : null}
        <div className="flex flex-wrap gap-1.5 text-sm">
          <span className="self-center text-muted-foreground">Sélection rapide :</span>
          <Button variant="outline" size="sm" onClick={() => selectGroup("retained")}>Retenus à prévenir</Button>
          <Button variant="outline" size="sm" onClick={() => selectGroup("waiting_list")}>Liste d’attente à prévenir</Button>
          <Button variant="outline" size="sm" onClick={() => selectGroup("rejected")}>Non retenus à prévenir</Button>
          <Button variant="outline" size="sm" onClick={() => selectGroup("all")}>Tous à prévenir</Button>
          {selected.length ? <Button variant="ghost" size="sm" onClick={() => setSelected([])}><X aria-hidden="true" />Vider la sélection</Button> : null}
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input aria-label="Rechercher un candidat" className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nom, e-mail ou Bootcamp" />
          </div>
          <select aria-label="Filtrer par décision" className="h-10 rounded-md border bg-background px-3 text-sm" value={decisionFilter} onChange={(event) => setDecisionFilter(event.target.value)}>
            <option value="all">Toutes les décisions</option>
            {Object.entries(DECISIONS).map(([value, [label]]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select aria-label="Filtrer par envoi" className="h-10 rounded-md border bg-background px-3 text-sm" value={notificationFilter} onChange={(event) => setNotificationFilter(event.target.value)}>
            <option value="all">Tous les envois</option>
            <option value="todo">À prévenir</option>
            <option value="done">Déjà prévenus</option>
            <option value="failed">Envoi en échec</option>
          </select>
        </div>
        <p className="text-sm text-muted-foreground" role="status">{visible.length} candidat(s) affiché(s) sur {rows.length} · {recipients.length} sélectionné(s) à prévenir</p>
        <div className="overflow-hidden rounded-xl border">
          <Table aria-label="Résultats finaux" className="min-w-[820px]">
            <TableHeader className="bg-muted/40">
              <TableRow><TableHead className="w-10"><span className="sr-only">Sélection</span></TableHead><TableHead>Candidat</TableHead><TableHead>Bootcamp</TableHead><TableHead>Décision</TableHead><TableHead>Appréciation du coach</TableHead><TableHead>E-mail de résultat</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((row) => {
                const [label, tone] = DECISIONS[row.decision]
                const mail = row.notification ? EMAIL_STATUS[row.notification.status] : null
                return (
                  <TableRow key={row.candidate_id}>
                    <TableCell>
                      <Checkbox aria-label={`Sélectionner ${fullName(row)}`} checked={selected.includes(row.candidate_id)} disabled={!sendable(row)}
                        onCheckedChange={(checked) => setSelected((current) => (checked ? [...current, row.candidate_id] : current.filter((id) => id !== row.candidate_id)))} />
                    </TableCell>
                    <TableCell><span className="font-medium capitalize">{fullName(row)}</span><span className="block text-xs text-muted-foreground">{row.email}</span></TableCell>
                    <TableCell>{row.bootcamp}{!row.final ? <span className="block text-xs text-amber-700 dark:text-amber-300">Résultats non soumis</span> : null}</TableCell>
                    <TableCell><span className={cn("whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", tone)}>{label}</span></TableCell>
                    <TableCell className="max-w-56"><span className="line-clamp-2 text-sm text-muted-foreground" title={row.coach_comment}>{row.coach_comment || "—"}</span></TableCell>
                    <TableCell className="text-sm">
                      {mail ? <>
                        <span className={cn("font-medium", mail[1])}>{mail[0]}</span>
                        <span className="block text-xs text-muted-foreground">{DECISIONS[row.notification.decision]?.[0]} · {formatDate(row.notification.sent_at || row.notification.queued_at)}</span>
                        {row.notification.decision !== row.decision ? <span className="block text-xs text-amber-700 dark:text-amber-300">Décision modifiée depuis</span> : null}
                      </> : <span className="text-muted-foreground">Non envoyé</span>}
                    </TableCell>
                  </TableRow>
                )
              })}
              {!visible.length ? <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">Aucun candidat ne correspond à ces critères.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </div>
      </section>

      {data.history.length ? (
        <details className="rounded-xl border bg-card">
          <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium"><History className="size-4" aria-hidden="true" />Historique ({data.history.length})</summary>
          <ol className="divide-y border-t text-sm">
            {[...data.history].reverse().map((event, index) => (
              <li key={index} className="space-y-1 px-4 py-2">
                <p><span className="text-muted-foreground">{formatDate(event.at)} · {event.by?.name} — </span>
                  {event.action === "validate"
                    ? `Résultats validés (${event.counts.retained} retenu(s), ${event.counts.waiting_list} en liste d’attente, ${event.counts.rejected} non retenu(s)).`
                    : `Envoi : ${event.counts.retained} retenu(s), ${event.counts.waiting_list} liste d’attente, ${event.counts.rejected} non retenu(s)${event.skipped ? ` · ${event.skipped} déjà prévenu(s) ignoré(s)` : ""}.`}
                </p>
                {event.templates ? (
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer">Messages utilisés</summary>
                    {Object.entries(event.templates).map(([decision, template]) => (
                      <div key={decision} className="mt-1 rounded border p-2"><p className="font-medium">{DECISIONS[decision][0]} · {template.subject}</p><p className="whitespace-pre-wrap">{template.body}</p></div>
                    ))}
                  </details>
                ) : null}
              </li>
            ))}
          </ol>
        </details>
      ) : null}

      <AlertDialog open={Boolean(preview)} onOpenChange={(open) => { if (!open) setPreview(null) }}>
        <AlertDialogContent className="sm:max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Aperçu · {preview ? DECISIONS[preview.decision][0] : ""}</AlertDialogTitle>
            <AlertDialogDescription>
              À : {preview?.to}{preview?.sample ? " (exemple : aucun candidat avec ce statut)" : ""}<br />Objet : <strong>{preview?.subject}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          {preview ? <iframe title="Aperçu de l’e-mail" sandbox="" srcDoc={`<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#111">${preview.html}</div>`} className="h-80 w-full rounded-md border bg-white" /> : null}
          <AlertDialogFooter><AlertDialogCancel>Fermer</AlertDialogCancel></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(confirm)} onOpenChange={(open) => { if (!open) setConfirm("") }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm === "validate" ? "Valider les résultats ?" : `Envoyer ${recipients.length} e-mail(s) de résultat ?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "validate"
                ? `${counts.retained} retenu(s), ${counts.waiting_list} en liste d’attente, ${counts.rejected} non retenu(s). Aucun e-mail ne part à cette étape.`
                : `${recipientCounts.retained} retenu(s), ${recipientCounts.waiting_list} en liste d’attente, ${recipientCounts.rejected} non retenu(s) recevront le message correspondant à leur statut. Cet envoi est définitif.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => (confirm === "validate"
              ? run({ action: "validate", confirmed: true }, "Résultats validés. Vous pouvez préparer et envoyer les e-mails.")
              : run({ action: "send", confirmed: true, candidate_ids: recipients.map((row) => row.candidate_id) },
                (result) => `${result.queued} e-mail(s) mis en file d’envoi${result.skipped ? `, ${result.skipped} déjà prévenu(s) ignoré(s)` : ""}.`))}>
              {confirm === "validate" ? "Valider" : <><Mail aria-hidden="true" />Envoyer</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
