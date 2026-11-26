"use client"

import { useEffect, useState } from "react"
import { ChevronsDown, ChevronsUp, Users } from "lucide-react"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const STATUS = {
  unassigned: "Non affecté", assigned: "Planifié", convened: "Convoqué", draft: "En cours", validated: "Évalué", absent: "Absent",
}
const STATUS_TONE = {
  unassigned: "bg-muted text-muted-foreground",
  assigned: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300",
  convened: "bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300",
  draft: "bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-300",
  validated: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
  absent: "bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-300",
}
const scheduleFormat = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
export const formatSchedule = (value) => (value ? scheduleFormat.format(new Date(/(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`)) : "—")
export const EMAIL_STATUS = { pending: "En attente", sending: "En cours", sent: "Envoyée", failed: "Échec", cancelled: "Annulée" }
export const nameOf = (row) => [row.candidate_snapshot.first_name, row.candidate_snapshot.last_name].filter(Boolean).join(" ") || row.candidate_snapshot.email

export default function ReferentialCandidateGroups({ groups, formation, campaignId, search, reload, onSelect, onReassign, loading }) {
  const [expandedGroups, setExpandedGroups] = useState([])

  if (!groups.length) {
    return <p role="status" className="text-sm text-muted-foreground">{loading ? "Recherche des candidats…" : "Aucun candidat trouvé."}</p>
  }

  const sortedGroups = [...groups].sort((a, b) => {
    if (a.id === "unassigned") return 1
    if (b.id === "unassigned") return -1
    return a.name.localeCompare(b.name, "fr")
  })
  const groupIds = sortedGroups.map((group) => group.id)
  const allExpanded = groupIds.every((id) => expandedGroups.includes(id))
  const ToggleIcon = allExpanded ? ChevronsUp : ChevronsDown

  return <>
    <div className="flex justify-end">
      <Button type="button" variant="outline" size="sm" disabled={loading}
        onClick={() => setExpandedGroups(allExpanded ? [] : groupIds)}>
        <ToggleIcon aria-hidden="true" />
        {allExpanded ? "Replier tout" : "Déplier tout"}
      </Button>
    </div>
    <Accordion type="multiple" value={expandedGroups} onValueChange={setExpandedGroups} className="min-w-0 overflow-hidden rounded-xl border">
      {sortedGroups.map((group) => (
        <AccordionItem key={group.id} value={group.id} className="last:border-b-0">
          <AccordionTrigger className="min-w-0 gap-3 px-3 py-3.5 text-left hover:bg-muted/70 hover:no-underline data-[state=open]:bg-muted/50 sm:px-5">
            <span className="flex min-w-0 flex-1 items-center gap-3">
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-foreground">
                {group.id === "unassigned" ? <Users className="size-4" /> : group.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 break-words font-semibold">{group.name}</span>
              <Badge variant="secondary" className="shrink-0 tabular-nums">{group.count} candidat{group.count === 1 ? "" : "s"}</Badge>
            </span>
          </AccordionTrigger>
          <AccordionContent className="border-t pb-0">
            {group.count ? (
              <CandidateGroupPage key={search} group={group} formation={formation} campaignId={campaignId} search={search} reload={reload} onSelect={onSelect} onReassign={onReassign} />
            ) : <p className="px-4 py-4 text-muted-foreground">Aucun candidat affecté.</p>}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </>
}

function CandidateGroupPage({ group, formation, campaignId, search, reload, onSelect, onReassign }) {
  const { interviews } = useAdminApi()
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setError("")
    setLoading(true)
    interviews.getReferential(formation, { group: group.id, campaign_id: campaignId, search, page }, { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) setData(result.data) })
      .catch((failure) => { if (!controller.signal.aborted) setError(failure.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [campaignId, formation, group.id, interviews, page, reload, retry, search])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1
  return (
    <div className="min-w-0" aria-busy={loading}>
      {error ? <div className="flex flex-wrap items-center gap-3 p-4">
        <p role="alert" className="text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={() => setRetry((current) => current + 1)}>Réessayer</Button>
      </div> : data?.candidates.length ? <>
        <Table aria-label={`Candidats — ${group.name}`} containerClassName="max-w-full" className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>Candidat</TableHead><TableHead>Validateur</TableHead><TableHead>Rendez-vous</TableHead><TableHead>Statut</TableHead>
              <TableHead>Convocation</TableHead><TableHead>Note</TableHead><TableHead className="text-right">Fiche</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.candidates.map((row) => <TableRow key={row.id}>
              <TableCell>
                <span className="font-medium">{nameOf(row)}</span>
                <span className="block break-all text-xs text-muted-foreground">{row.candidate_snapshot.email}</span>
              </TableCell>
              <TableCell>{row.validator || "—"}</TableCell>
              <TableCell className="whitespace-nowrap tabular-nums">{formatSchedule(row.scheduled_at)}</TableCell>
              <TableCell><span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_TONE[row.status] || STATUS_TONE.unassigned}`}>{STATUS[row.status] || row.status}</span></TableCell>
              <TableCell>{EMAIL_STATUS[row.email_status] || "Non envoyée"}</TableCell>
              <TableCell className="whitespace-nowrap tabular-nums">{row.score == null ? "—" : `${row.score} / 100`}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onReassign && ["unassigned", "assigned"].includes(row.status) && !row.email_status ? (
                    <Button variant="ghost" size="sm" onClick={() => onReassign(row)}>{row.validator ? "Déplacer" : "Affecter"}</Button>
                  ) : null}
                  <Button variant="outline" size="sm" onClick={() => onSelect(row)}>Ouvrir la fiche</Button>
                </div>
              </TableCell>
            </TableRow>)}
          </TableBody>
        </Table>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 text-sm">
          <Button variant="outline" size="sm" disabled={loading || data.page <= 1} onClick={() => setPage(data.page - 1)}>Précédent</Button>
          <span>Page {data.page} sur {totalPages}</span>
          <Button variant="outline" size="sm" disabled={loading || data.page >= totalPages} onClick={() => setPage(data.page + 1)}>Suivant</Button>
        </div>
      </> : <p role="status" className="px-4 py-4 text-muted-foreground">{loading ? "Chargement des candidats…" : "Aucun candidat trouvé."}</p>}
    </div>
  )
}
