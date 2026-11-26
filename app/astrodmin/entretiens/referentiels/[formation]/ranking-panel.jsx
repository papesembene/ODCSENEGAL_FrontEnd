"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Dices, Download, History, RefreshCw, Trophy } from "lucide-react"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 })
const formatScore = (value) => (value == null ? "—" : number.format(value))
const dateTime = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Dakar" })
const formatDate = (value) => (value ? dateTime.format(new Date(value)) : "")
const fullName = (row) => [row?.first_name, row?.last_name].filter(Boolean).join(" ") || row?.email || "Candidat"

const STATUS = {
  selected: ["Présélectionné", "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300"],
  tie_selected: ["Ex æquo · tiré au sort", "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300"],
  tie_not_selected: ["Ex æquo · non tiré", "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300"],
  not_selected: ["Non présélectionné", "bg-muted text-muted-foreground"],
}

async function exportRanking(data) {
  const { utils, writeFile } = await import("xlsx")
  const rows = data.rows.map((row) => ({
    Rang: row.rank, Prénom: row.first_name, Nom: row.last_name, "E-mail": row.email, Téléphone: row.phone,
    Validateur: row.validator, Technique: row.scores.technique, Motivation: row.scores.motivation,
    "Situation sociale": row.scores.social, "Score global": row.scores.global, Appréciation: row.comment,
    Présélection: row.preselection ? STATUS[row.preselection][0] : "",
  }))
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, utils.json_to_sheet(rows), "Classement")
  writeFile(workbook, `classement-${data.formation}.xlsx`)
}

export default function RankingPanel({ formation, campaignId }) {
  const { interviews } = useAdminApi()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [count, setCount] = useState("")
  const [onlySelected, setOnlySelected] = useState(false)
  const [confirm, setConfirm] = useState("")
  const [swap, setSwap] = useState(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")
    interviews.getRanking(formation, { campaign_id: campaignId }, { signal: controller.signal })
      .then(({ data: result }) => {
        if (controller.signal.aborted) return
        setData(result)
        setCount((current) => current || result.preselection?.count || "")
      })
      .catch((failure) => { if (!controller.signal.aborted) setError(failure.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [campaignId, formation, interviews, reload])

  const byId = useMemo(() => Object.fromEntries((data?.rows || []).map((row) => [row.candidate_id, row])), [data])
  const selection = data?.preselection || {}
  const validated = selection.status === "validated"
  const tie = selection.tie
  const rows = (data?.rows || []).filter((row) => !onlySelected || row.preselection === "selected" || row.preselection === "tie_selected")

  async function run(payload, message) {
    setBusy(true)
    setError("")
    setNotice("")
    setConfirm("")
    try {
      const { data: result } = await interviews.updateRanking(formation, {
        campaign_id: campaignId, revision: selection.revision || 0, ...payload,
      })
      setData(result)
      setNotice(message(result))
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
      setSwap(null)
    }
  }

  const preselect = () => run({ action: "preselect", count: Number(count) }, (result) => (
    result.preselection.tie
      ? `${result.preselection.selected.length} candidat(s) présélectionné(s), dont ${result.preselection.tie.places} tiré(s) au sort parmi ${result.preselection.tie.candidates.length} ex æquo.`
      : `${result.preselection.selected.length} candidat(s) présélectionné(s).`
  ))

  if (loading && !data) {
    return <div role="status" className="space-y-3"><span className="sr-only">Chargement du classement…</span><Skeleton className="h-24 w-full rounded-xl" /><Skeleton className="h-64 w-full rounded-xl" /></div>
  }
  if (!data) {
    return <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error || "Classement indisponible."}</p>
  }

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border bg-border [&>*]:bg-card">
        {[["Entretiens validés", data.evaluated, "text-emerald-700 dark:text-emerald-300"], ["Entretiens non terminés", data.pending, data.pending ? "text-amber-600 dark:text-amber-400" : ""], ["Absents", data.absent, ""]].map(([label, value, tone]) => (
          <div key={label} className="px-4 py-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className={cn("text-xl font-semibold tabular-nums", tone)}>{value}</dd></div>
        ))}
      </dl>

      {error ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
      {notice ? <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-800 dark:text-emerald-300">{notice}</p> : null}

      <section className="space-y-4 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 font-semibold"><Trophy className="size-4 text-orange-600" aria-hidden="true" />Présélection des meilleurs candidats</h3>
            <p className="text-sm text-muted-foreground">Seuls les entretiens validés comptent. En cas d’égalité au seuil, un tirage au sort départage les ex æquo ; il est enregistré et ne change pas en rechargeant la page.</p>
          </div>
          {validated ? <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300">Validée</span>
            : selection.selected?.length ? <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-400/15 dark:text-orange-300">Brouillon</span> : null}
        </div>

        {validated ? (
          <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <span>{selection.selected.length} candidat(s) présélectionné(s), validé le {formatDate(selection.validated_at)} par {selection.validated_by?.name}. Ils sont disponibles pour les Bootcamps.</span>
          </p>
        ) : (
          <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => {
            event.preventDefault()
            if (selection.selected?.length) setConfirm("recompute")
            else preselect()
          }}>
            <div className="space-y-1.5">
              <Label htmlFor="preselection-count">Nombre de candidats à retenir</Label>
              <Input id="preselection-count" type="number" min={1} max={5000} required className="w-48" value={count} onChange={(event) => setCount(event.target.value)} disabled={busy} />
            </div>
            <Button type="submit" disabled={busy || !data.evaluated || !count}><Dices aria-hidden="true" />{selection.selected?.length ? "Recalculer" : "Sélectionner les meilleurs"}</Button>
            {selection.selected?.length ? (
              <Button type="button" className="ml-auto" disabled={busy || data.stale} onClick={() => setConfirm("validate")}><CheckCircle2 aria-hidden="true" />Valider la sélection</Button>
            ) : null}
          </form>
        )}

        {data.pending && !validated ? <p className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{data.pending} entretien(s) ne sont pas encore validés : ils ne figurent pas dans le classement.</p> : null}
        {data.stale ? <p className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-400/10 dark:text-amber-200"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Des entretiens ont été validés ou modifiés depuis le calcul. Recalculez la présélection avant de la valider.</p> : null}

        {tie ? (
          <div className="space-y-3 rounded-lg border border-amber-300/60 bg-amber-50/50 p-3 dark:border-amber-800 dark:bg-amber-400/5">
            <p className="text-sm">
              <strong>Ex æquo au seuil · {formatScore(tie.score)}/100</strong> — {tie.places} place(s) pour {tie.candidates.length} candidats, attribuée(s) par tirage au sort.
              {!validated ? " Vous pouvez remplacer un candidat tiré par un autre candidat de même score." : ""}
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {tie.candidates.map((candidate) => {
                const drawn = tie.selected.includes(candidate)
                return (
                  <li key={candidate} className="flex items-center justify-between gap-2 rounded-md border bg-card px-3 py-2 text-sm">
                    <span className="min-w-0 truncate capitalize">{fullName(byId[candidate])}</span>
                    {drawn ? <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300">Tiré</span>
                      : validated ? <span className="shrink-0 text-xs text-muted-foreground">Non tiré</span>
                        : <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => setSwap({ add: candidate, remove: tie.selected[0] })}>Retenir à la place…</Button>}
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-orange-600" checked={onlySelected} onChange={(event) => setOnlySelected(event.target.checked)} disabled={!selection.selected?.length} />
          Afficher seulement les présélectionnés
        </label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setReload((value) => value + 1)} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} aria-hidden="true" />Actualiser</Button>
          <Button variant="outline" size="sm" onClick={() => exportRanking(data).catch((failure) => setError(failure.message))} disabled={!data.rows.length}><Download aria-hidden="true" />Exporter</Button>
        </div>
      </div>

      {data.rows.length ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table aria-label="Classement des candidats" className="min-w-[900px]">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-14">Rang</TableHead><TableHead>Candidat</TableHead><TableHead>Validateur</TableHead>
                <TableHead className="text-right">Technique</TableHead><TableHead className="text-right">Motivation</TableHead>
                <TableHead className="text-right">Social</TableHead><TableHead className="text-right">Global</TableHead>
                <TableHead>Appréciation</TableHead><TableHead>Présélection</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const status = row.preselection ? STATUS[row.preselection] : null
                const kept = row.preselection === "selected" || row.preselection === "tie_selected"
                return (
                  <TableRow key={row.candidate_id} className={cn(kept && "bg-emerald-50/50 dark:bg-emerald-400/5")}>
                    <TableCell className="font-semibold tabular-nums">{row.rank}</TableCell>
                    <TableCell><span className="font-medium capitalize">{fullName(row)}</span><span className="block text-xs text-muted-foreground">{row.email}</span></TableCell>
                    <TableCell>{row.validator || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatScore(row.scores.technique)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatScore(row.scores.motivation)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatScore(row.scores.social)}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatScore(row.scores.global)}</TableCell>
                    <TableCell className="max-w-64"><span className="line-clamp-2 text-sm text-muted-foreground" title={row.comment}>{row.comment || "—"}</span></TableCell>
                    <TableCell>{status ? <span className={cn("whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", status[1])}>{status[0]}</span> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Aucun entretien validé pour le moment.</p>}

      {selection.history?.length ? (
        <details className="rounded-xl border bg-card">
          <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium"><History className="size-4" aria-hidden="true" />Historique de la présélection ({selection.history.length})</summary>
          <ol className="divide-y border-t text-sm">
            {[...selection.history].reverse().map((event, index) => (
              <li key={index} className="px-4 py-2">
                <span className="text-muted-foreground">{formatDate(event.at)} · {event.by?.name} — </span>
                {event.action === "draw" ? `Présélection de ${event.count} candidat(s) avec tirage au sort parmi ${event.tied.length} ex æquo à ${formatScore(event.score)} (tirés : ${event.drawn.map((id) => fullName(byId[id])).join(", ")}).`
                  : event.action === "select" ? `Présélection de ${event.selected} candidat(s), sans égalité au seuil.`
                    : event.action === "replace" ? `${fullName(byId[event.added])} retenu(e) à la place de ${fullName(byId[event.removed])} (ex æquo à ${formatScore(event.score)}).`
                      : `Présélection validée (${event.selected} candidat(s)).`}
              </li>
            ))}
          </ol>
        </details>
      ) : null}

      <AlertDialog open={Boolean(confirm)} onOpenChange={(open) => { if (!open) setConfirm("") }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm === "validate" ? "Valider la présélection ?" : "Recalculer la présélection ?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "validate"
                ? `${selection.selected?.length || 0} candidat(s) deviendront disponibles pour les Bootcamps. La présélection ne pourra plus être modifiée et les évaluations concernées ne pourront plus être rouvertes.`
                : "Un nouveau calcul remplace la présélection en cours. S’il y a des ex æquo au seuil, un nouveau tirage au sort sera effectué. L’ancien tirage reste dans l’historique."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => (confirm === "validate"
              ? run({ action: "validate", confirmed: true }, () => "Présélection validée : les candidats sont disponibles pour les Bootcamps.")
              : preselect())}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(swap)} onOpenChange={(open) => { if (!open) setSwap(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retenir {fullName(byId[swap?.add])} ?</AlertDialogTitle>
            <AlertDialogDescription>Choisissez le candidat tiré au sort qu’il ou elle remplace. Le remplacement est enregistré dans l’historique.</AlertDialogDescription>
          </AlertDialogHeader>
          <select aria-label="Candidat remplacé" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm capitalize"
            value={swap?.remove || ""} onChange={(event) => setSwap((current) => ({ ...current, remove: event.target.value }))}>
            {tie?.selected.map((candidate) => <option key={candidate} value={candidate}>{fullName(byId[candidate])}</option>)}
          </select>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => run({ action: "replace", add: swap.add, remove: swap.remove },
              () => `${fullName(byId[swap.add])} remplace ${fullName(byId[swap.remove])}.`)}>Remplacer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
