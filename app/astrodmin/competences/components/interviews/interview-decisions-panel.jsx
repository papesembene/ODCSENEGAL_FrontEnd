import { useState } from "react"
import { Check, Download, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InterviewFilters, InterviewPagination, InterviewSelect, InterviewStats, InterviewTableMessage } from "./interview-workspace-ui"
import { FINAL_STATUS_LABELS, formatTestScore, getCandidateName, getCoachBadges, getDecisionAid, getReviewDecision } from "./interview-presentation"
import { exportInterviewDecisions } from "./interview-export"

const SIGNAL_OPTIONS = [
  { value: "all", label: "Tous les signaux" }, { value: "pending", label: "Sans décision finale" },
  { value: "arbitration", label: "À arbitrer" }, { value: "favorable", label: "Favorables" },
]
const BULK_OPTIONS = [
  { value: "none", label: "Choisir une décision" }, { value: "retenu", label: "Retenir" },
  { value: "liste_attente", label: "Mettre en liste d'attente" }, { value: "rejete", label: "Rejeter" },
]

export default function InterviewDecisionsPanel({ interviews, onOpenEvaluation }) {
  const [signal, setSignal] = useState("all")
  const [selectedIds, setSelectedIds] = useState([])
  const [decision, setDecision] = useState("none")
  const [exporting, setExporting] = useState(false)
  const rows = interviews.evaluations.filter((evaluation) => {
    const aid = getDecisionAid(evaluation)
    if (signal === "pending") return !evaluation.final_status || evaluation.final_status === "en_attente"
    if (signal === "arbitration") return aid.value === "arbitration"
    return signal !== "favorable" || ["favorable", "very_favorable"].includes(aid.value)
  })
  const selectedSet = new Set(selectedIds)
  const selectedRows = rows.filter((row) => selectedSet.has(row.id))
  const allSelected = rows.length > 0 && selectedRows.length === rows.length
  const toggleRow = (id, checked) => setSelectedIds((previous) => checked
    ? [...new Set([...previous, id])] : previous.filter((value) => value !== id))
  const applyDecision = async () => {
    try {
      await interviews.handleBulkUpdateFinalStatus(selectedRows.map((row) => row.id), decision)
      setSelectedIds([])
      setDecision("none")
    } catch {
      // Preserve the selection so the user can retry after the displayed error.
    }
  }
  const handleExport = async () => {
    setExporting(true)
    try {
      await exportInterviewDecisions(interviews)
      toast.success("Export CSV généré")
    } catch (error) {
      toast.error(error.name === "TimeoutError" ? "L'export prend trop de temps. Réessayez." : error.message || "Export impossible")
    } finally {
      setExporting(false)
    }
  }
  const status = interviews.evaluationSummary.status || {}
  return (
    <Card className="flex min-h-0 flex-col lg:h-[calc(100dvh-22rem)] lg:min-h-[480px]">
      <CardHeader className="shrink-0 pb-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div><CardTitle role="heading" aria-level={2} className="text-lg">Décisions finales</CardTitle><CardDescription>Comparez les avis, puis décidez individuellement ou par sélection.</CardDescription></div>
          <Button variant="outline" onClick={handleExport} disabled={exporting || !interviews.selectedCampaignId}>
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {exporting ? "Export en cours…" : "Exporter le CSV"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <InterviewStats items={[
          { label: "En attente de décision", value: status.en_attente },
          { label: "Retenus", value: status.retenu }, { label: "Liste d'attente", value: status.liste_attente },
          { label: "Rejetés", value: status.rejete },
        ]} />
        <InterviewFilters interviews={interviews}>
          <InterviewSelect id="decision-signal" label="Signaux sur cette page" value={signal} onChange={setSignal} options={SIGNAL_OPTIONS} />
        </InterviewFilters>
        {selectedRows.length ? (
          <div className="flex shrink-0 flex-wrap items-end gap-3 rounded-lg border border-orange-200 bg-orange-50/40 p-3 dark:border-orange-900 dark:bg-orange-950/20">
            <p className="mr-auto self-center text-sm font-medium" aria-live="polite">{selectedRows.length} candidat(s) sélectionné(s) sur cette page</p>
            <InterviewSelect id="bulk-decision" label="Décision groupée" value={decision} onChange={setDecision} options={BULK_OPTIONS} />
            <Button onClick={applyDecision} disabled={decision === "none" || interviews.submitting || interviews.evaluationsLoading}>
              {interviews.submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              Appliquer
            </Button>
            <Button variant="ghost" size="icon" aria-label="Annuler la sélection" onClick={() => setSelectedIds([])}><X className="h-4 w-4" /></Button>
          </div>
        ) : null}
        <Table containerClassName="isolate min-h-[160px] max-h-[58vh] flex-1 overscroll-contain rounded-lg border"
          aria-label="Décisions de la campagne" aria-busy={interviews.evaluationsLoading}>
          <TableHeader className="sticky top-0 z-20 bg-background shadow-sm">
            <TableRow>
              <TableHead className="sticky left-0 z-30 w-12 bg-background">
                <Checkbox checked={allSelected ? true : selectedRows.length ? "indeterminate" : false}
                  disabled={interviews.evaluationsLoading || !rows.length} aria-label="Sélectionner les candidats visibles de cette page"
                  onCheckedChange={(checked) => setSelectedIds(checked === true ? rows.map((row) => row.id) : [])} />
              </TableHead>
              <TableHead className="sticky left-12 z-30 min-w-[220px] bg-background">Candidat</TableHead>
              <TableHead className="min-w-[110px]">Score test</TableHead>
              <TableHead>Filtreur</TableHead><TableHead>Coach</TableHead><TableHead>Motivation</TableHead>
              <TableHead className="min-w-[180px]">Points d'attention</TableHead><TableHead>Synthèse</TableHead>
              <TableHead>Décision finale</TableHead><TableHead className="sticky right-0 z-30 bg-background text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interviews.evaluationsLoading || !rows.length ? (
              <InterviewTableMessage colSpan={10} loading={interviews.evaluationsLoading}>Aucun candidat pour ces filtres.</InterviewTableMessage>
            ) : rows.map((evaluation) => {
              const aid = getDecisionAid(evaluation)
              const badges = getCoachBadges(evaluation)
              return (
                <TableRow key={evaluation.id} className={aid.value === "arbitration" ? "bg-amber-50 dark:bg-amber-950/20" : "bg-background"} data-state={selectedSet.has(evaluation.id) ? "selected" : undefined}>
                  <TableCell className="sticky left-0 z-10 bg-inherit">
                    <Checkbox checked={selectedSet.has(evaluation.id)} aria-label={`Sélectionner ${getCandidateName(evaluation)}`}
                      onCheckedChange={(checked) => toggleRow(evaluation.id, checked === true)} />
                  </TableCell>
                  <TableCell className="sticky left-12 z-10 bg-inherit">
                    <p className="font-medium">{getCandidateName(evaluation)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{evaluation.candidate_snapshot?.email || "-"}</p>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    <p className="font-medium">{formatTestScore(evaluation.test_score)}</p>
                    {evaluation.test_details?.violations?.totalViolations > 0 ? <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">{evaluation.test_details.violations.totalViolations} infraction(s)</p> : null}
                  </TableCell>
                  {["filter", "validator", "motivation"].map((key) => (
                    <TableCell key={key} className="min-w-[140px] max-w-[200px]">
                      <span className="line-clamp-2" title={getReviewDecision(evaluation, key)}>{getReviewDecision(evaluation, key) || "-"}</span>
                    </TableCell>
                  ))}
                  <TableCell><div className="flex flex-wrap gap-1">
                    {badges.length ? badges.map(({ key, label, tone, icon: Icon }) => (
                      <Badge key={key} variant="outline" className={tone}><Icon className="mr-1 h-3 w-3" />{label}</Badge>
                    )) : <span className="text-muted-foreground">-</span>}
                  </div></TableCell>
                  <TableCell><Badge variant="outline" className={aid.className}>{aid.label}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{FINAL_STATUS_LABELS[evaluation.final_status] || "En attente"}</Badge></TableCell>
                  <TableCell className="sticky right-0 z-10 bg-inherit text-right">
                    <Button size="sm" variant="outline" onClick={() => onOpenEvaluation(evaluation.id)}>Modifier</Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <InterviewPagination interviews={interviews} />
      </CardContent>
    </Card>
  )
}
