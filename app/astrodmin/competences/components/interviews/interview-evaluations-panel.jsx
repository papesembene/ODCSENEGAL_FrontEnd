import { CalendarClock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InterviewFilters, InterviewPagination, InterviewStats, InterviewTableMessage } from "./interview-workspace-ui"
import {
  FINAL_STATUS_LABELS, INTERVIEW_PROGRESS_LABELS, formatCriterionValue, formatTestScore,
  getCandidateName, getDecisionActionLabel, getEvaluationSectionReview, getReviewDecision,
} from "./interview-presentation"

export default function InterviewEvaluationsPanel({ interviews, onPlan, onOpenEvaluation }) {
  const sections = Object.entries(interviews.selectedCampaign?.scorecard_config?.sections || {})
    .filter(([, section]) => section.criteria?.length)
  const columns = 6 + sections.reduce((total, [, section]) => total + section.criteria.length, 0)
  const summary = interviews.evaluationSummary
  return (
    <Card className="flex min-h-0 flex-col lg:h-[calc(100dvh-22rem)] lg:min-h-[480px]">
      <CardHeader className="shrink-0 pb-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle role="heading" aria-level={2} className="text-lg">Évaluations des candidats</CardTitle>
            <CardDescription>Les critères de cette campagne, dans un seul tableau.</CardDescription>
          </div>
          <Button onClick={onPlan} disabled={interviews.submitting || !interviews.campaignSlots.length}>
            <CalendarClock className="mr-2 h-4 w-4" />Planifier les candidats
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <InterviewStats items={[
          { label: "Évaluations complètes", value: summary.complete },
          { label: "À compléter", value: summary.incomplete },
          { label: "Prêtes à décider", value: summary.ready_for_decision },
        ]} />
        <InterviewFilters interviews={interviews} progress />
        <Table containerClassName="isolate min-h-[160px] max-h-[58vh] flex-1 overscroll-contain rounded-lg border"
          aria-label="Évaluations de la campagne" aria-busy={interviews.evaluationsLoading}>
          <TableHeader className="sticky top-0 z-20 bg-background shadow-sm">
            <TableRow>
              <TableHead rowSpan={sections.length ? 2 : 1} className="sticky left-0 z-30 min-w-[220px] bg-background">Candidat</TableHead>
              <TableHead rowSpan={sections.length ? 2 : 1} className="min-w-[110px]">Score test</TableHead>
              {sections.map(([key, section]) => (
                <TableHead key={key} colSpan={section.criteria.length} className="border-l bg-muted/50 text-center font-semibold text-foreground">
                  {section.title || key}
                </TableHead>
              ))}
              <TableHead rowSpan={sections.length ? 2 : 1}>Évaluation</TableHead>
              <TableHead rowSpan={sections.length ? 2 : 1}>Passage</TableHead>
              <TableHead rowSpan={sections.length ? 2 : 1}>Décision finale</TableHead>
              <TableHead rowSpan={sections.length ? 2 : 1} className="sticky right-0 z-30 bg-background text-right">Action</TableHead>
            </TableRow>
            {sections.length ? <TableRow>
              {sections.flatMap(([key, section]) => section.criteria.map((criterion) => (
                <TableHead key={`${key}-${criterion.key}`} className="min-w-[140px] border-l text-center">{criterion.label}</TableHead>
              )))}
            </TableRow> : null}
          </TableHeader>
          <TableBody>
            {interviews.evaluationsLoading || !interviews.evaluations.length ? (
              <InterviewTableMessage colSpan={columns} loading={interviews.evaluationsLoading}>
                Aucun candidat pour ces filtres. Vous pouvez les effacer ou planifier des candidats.
              </InterviewTableMessage>
            ) : interviews.evaluations.map((evaluation) => (
              <TableRow key={evaluation.id} className={getReviewDecision(evaluation, "filter") === "echec"
                ? "bg-red-100 text-red-950 hover:bg-red-200/70 dark:bg-red-950/40 dark:text-red-100" : "bg-background"}>
                <TableCell className="sticky left-0 z-10 bg-inherit">
                  <p className="font-medium">{getCandidateName(evaluation)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{evaluation.candidate_snapshot?.email || "-"}</p>
                  <p className="text-xs text-muted-foreground">{evaluation.candidate_snapshot?.phone || "-"}</p>
                </TableCell>
                <TableCell className="font-medium tabular-nums">{formatTestScore(evaluation.test_score)}</TableCell>
                {sections.flatMap(([key, section]) => section.criteria.map((criterion) => (
                  <TableCell key={`${key}-${criterion.key}`} className="max-w-[240px] border-l">
                    <span className="line-clamp-3 text-sm" title={formatCriterionValue(getEvaluationSectionReview(evaluation, key)[criterion.key], criterion)}>
                      {formatCriterionValue(getEvaluationSectionReview(evaluation, key)[criterion.key], criterion)}
                    </span>
                  </TableCell>
                )))}
                <TableCell><Badge variant="secondary">{evaluation.is_complete ? "Complète" : "À compléter"}</Badge></TableCell>
                <TableCell className="whitespace-nowrap">{INTERVIEW_PROGRESS_LABELS[evaluation.interview_progress_status] || "-"}</TableCell>
                <TableCell><Badge variant="outline">{FINAL_STATUS_LABELS[evaluation.final_status] || "En attente"}</Badge></TableCell>
                <TableCell className="sticky right-0 z-10 bg-inherit text-right">
                  <Button size="sm" variant="outline" onClick={() => onOpenEvaluation(evaluation.id)}>{getDecisionActionLabel(evaluation)}</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <InterviewPagination interviews={interviews} />
      </CardContent>
    </Card>
  )
}
