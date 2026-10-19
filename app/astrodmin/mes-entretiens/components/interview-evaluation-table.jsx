"use client"

import { Fragment } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getCoachRecommendationLabels, getEditableSectionKeys, getEvaluationRoleLabels, getRoleKeys, getTreatmentInfo, getVisibleCriteria, getVisibleSectionKeys, isFilterFailure } from "../interview-helpers"
import { renderCriterionCell } from "./criterion-cell"

export default function InterviewEvaluationTable({
  activeEvaluationId,
  assignedSlots,
  currentAdminId,
  currentAdminName,
  evaluations,
  inlineDrafts,
  onOpenCoachOpinion,
  onSelectEvaluation,
  onSave,
  savingEvaluationId,
  scorecardConfig,
  setDrafts,
  submitting,
  now,
}) {
  const sections = scorecardConfig?.sections || {}
  const sectionKeys = Object.keys(sections)
  const visibleSectionKeys = Array.from(new Set(evaluations.flatMap((evaluation) => {
    const slot = assignedSlots.find((item) => item.id === evaluation.slot_id)
    const roles = slot ? getEvaluationRoleLabels(slot, currentAdminId) : []
    return getVisibleSectionKeys(sectionKeys, getRoleKeys(roles))
  })))
  const visibleCriteriaCount = visibleSectionKeys.reduce(
    (total, sectionKey) => total + getVisibleCriteria(sections[sectionKey]).length,
    0,
  )
  const colSpan = 5 + Math.max(visibleCriteriaCount, 1)

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border">
      <Table className="min-w-max" containerClassName="h-[min(60dvh,640px)] overflow-auto">
        <TableHeader className="sticky top-0 z-20 bg-background">
          <TableRow>
            <TableHead rowSpan={2} className="sticky left-0 top-0 z-30 min-w-[180px] bg-background">
              Candidat
            </TableHead>
            <TableHead rowSpan={2} className="sticky top-0 z-20 min-w-[150px] bg-background">Rôle</TableHead>
            <TableHead rowSpan={2} className="sticky top-0 z-20 min-w-[150px] bg-background">Traitement</TableHead>
            <TableHead rowSpan={2} className="sticky top-0 z-20 min-w-[110px] bg-background">Score</TableHead>
            {visibleSectionKeys.length === 0 ? (
              <TableHead rowSpan={2} className="sticky top-0 z-20 bg-background">Critères</TableHead>
            ) : (
              visibleSectionKeys.map((sectionKey) => (
                <TableHead
                  key={sectionKey}
                  colSpan={getVisibleCriteria(sections[sectionKey]).length}
                  className="sticky top-0 z-20 border-l bg-orange-50 text-center font-semibold text-orange-900"
                >
                  {sections[sectionKey]?.title || sectionKey}
                </TableHead>
              ))
            )}
            <TableHead rowSpan={2} className="top-0 z-30 min-w-[180px] bg-background text-right lg:sticky lg:right-0">
              Action
            </TableHead>
          </TableRow>
          <TableRow>
            {visibleSectionKeys.flatMap((sectionKey) =>
              getVisibleCriteria(sections[sectionKey]).map((criterion) => (
                <TableHead key={`${sectionKey}-${criterion.key}`} className="sticky top-10 z-20 border-l bg-background text-center">
                  {criterion.label}
                </TableHead>
              )),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluations.map((evaluation) => {
            const slot = assignedSlots.find((item) => item.id === evaluation.slot_id)
            const roles = slot ? getEvaluationRoleLabels(slot, currentAdminId) : ["-"]
            const editableSectionKeys = getEditableSectionKeys(slot, currentAdminId, now, evaluation)
            const treatmentInfo = getTreatmentInfo(evaluation, roles, scorecardConfig)
            const isActive = activeEvaluationId === evaluation.id
            const coachRecommendationLabels = getCoachRecommendationLabels(evaluation)
            const hasCoachRecommendation = coachRecommendationLabels.length > 0
            const hasFilterFailure = isFilterFailure(evaluation)
            const stickyCellTone = hasFilterFailure ? "bg-red-100" : "bg-background"

            return (
              <Fragment key={evaluation.id}>
                <TableRow
                  className={[
                    "cursor-pointer transition-colors",
                    hasFilterFailure ? "bg-red-100/80 hover:bg-red-100" : "",
                    hasCoachRecommendation && !hasFilterFailure ? "bg-emerald-50/70 hover:bg-emerald-50" : "",
                    isActive ? "ring-1 ring-inset ring-orange-300" : "",
                  ].filter(Boolean).join(" ")}
                  tabIndex={0}
                  aria-selected={isActive}
                  onClick={() => onSelectEvaluation(evaluation.id)}
                  onKeyDown={(event) => {
                    if (event.target === event.currentTarget && ["Enter", " "].includes(event.key)) {
                      event.preventDefault()
                      onSelectEvaluation(evaluation.id)
                    }
                  }}
                >
                  <TableCell className={`sticky left-0 z-10 font-medium ${stickyCellTone}`}>
                    {[evaluation.candidate_snapshot?.first_name, evaluation.candidate_snapshot?.last_name].filter(Boolean).join(" ") || evaluation.candidate_snapshot?.email || "Candidat"}
                    <p className="text-xs font-normal text-muted-foreground">
                      {evaluation.candidate_snapshot?.email || "-"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {roles.map((role) => (
                        <Badge key={role} variant="outline">{role}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={treatmentInfo.status === "done" ? "secondary" : "outline"} className="w-fit">
                        {treatmentInfo.label}
                      </Badge>
                      {hasCoachRecommendation ? (
                        <Badge className="w-fit bg-emerald-600 hover:bg-emerald-600">
                          Avis coach
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>{evaluation.test_score ?? "-"} pts</TableCell>
                  {visibleSectionKeys.length === 0 ? (
                    <TableCell className="text-sm text-muted-foreground">Aucun critère visible.</TableCell>
                  ) : (
                    visibleSectionKeys.flatMap((sectionKey) =>
                      getVisibleCriteria(sections[sectionKey]).map((criterion) => (
                        <TableCell key={`${evaluation.id}-${sectionKey}-${criterion.key}`} className="border-l align-top">
                          {renderCriterionCell({
                            canEdit: editableSectionKeys.includes(sectionKey),
                            criterion,
                            currentAdminName,
                            drafts: inlineDrafts,
                            evaluation,
                            sectionKey,
                            setDrafts,
                          })}
                        </TableCell>
                      )),
                    )
                  )}
                  <TableCell className={`z-10 text-right lg:sticky lg:right-0 ${stickyCellTone}`}>
                    <div className="flex justify-end gap-2">
                      {editableSectionKeys.includes("validator") ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation()
                            onOpenCoachOpinion(evaluation)
                          }}
                        >
                          Avis coach
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          void onSave(evaluation, scorecardConfig)
                        }}
                        disabled={submitting || savingEvaluationId === evaluation.id || editableSectionKeys.length === 0}
                      >
                        {editableSectionKeys.length ? "Enregistrer" : "Lecture seule"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </Fragment>
            )
          })}
          {evaluations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="text-center text-muted-foreground">
                Aucun candidat.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  )
}
