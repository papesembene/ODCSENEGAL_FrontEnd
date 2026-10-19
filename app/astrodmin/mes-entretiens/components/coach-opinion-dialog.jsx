"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { COACH_RECOMMENDATION_OPTIONS, getEvaluationSectionReview } from "../interview-helpers"

export default function CoachOpinionDialog({
  evaluation,
  onOpenChange,
  onSave,
  open,
  submitting,
}) {
  const validatorReview = getEvaluationSectionReview(evaluation || {}, "validator")
  const [draft, setDraft] = useState({})

  useEffect(() => {
    if (!open || !evaluation) {
      return
    }
    setDraft({
      coach_pick: Boolean(validatorReview.coach_pick),
      strong_potential: Boolean(validatorReview.strong_potential),
      cohort_balance: Boolean(validatorReview.cohort_balance),
      social_context: Boolean(validatorReview.social_context),
      comment: validatorReview.comment || "",
    })
  }, [
    evaluation,
    open,
    validatorReview.coach_pick,
    validatorReview.cohort_balance,
    validatorReview.comment,
    validatorReview.social_context,
    validatorReview.strong_potential,
  ])

  const candidateName = [
    evaluation?.candidate_snapshot?.first_name,
    evaluation?.candidate_snapshot?.last_name,
  ].filter(Boolean).join(" ") || evaluation?.candidate_snapshot?.email || "Candidat"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Avis coach</DialogTitle>
          <DialogDescription>
            Recommandation qualitative pour {candidateName}. Elle aide la décision finale sans la remplacer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {COACH_RECOMMENDATION_OPTIONS.map((option) => {
              const selected = Boolean(draft[option.key])
              const Icon = option.icon
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setDraft((previous) => ({ ...previous, [option.key]: !selected }))}
                  className={`rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-emerald-300 bg-emerald-50 text-emerald-950 shadow-sm"
                      : "border-border bg-background hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full p-2 ${
                        selected ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="font-semibold">{option.label}</span>
                    </div>
                    <Badge variant={selected ? "default" : "outline"}>
                      {selected ? "Retenu" : "Choisir"}
                    </Badge>
                  </div>
                  <p className={`mt-2 text-sm ${selected ? "text-emerald-800" : "text-muted-foreground"}`}>
                    {option.description}
                  </p>
                </button>
              )
            })}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coach-opinion-comment">Commentaire coach</Label>
            <Textarea
              id="coach-opinion-comment"
              value={draft.comment || ""}
              onChange={(event) => setDraft((previous) => ({ ...previous, comment: event.target.value }))}
              placeholder="Pourquoi recommander ce candidat ? Réserves, potentiel, contexte..."
              className="min-h-28"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            type="button"
            disabled={submitting || !evaluation}
            onClick={() => onSave(evaluation, draft)}
          >
            Enregistrer l'avis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
