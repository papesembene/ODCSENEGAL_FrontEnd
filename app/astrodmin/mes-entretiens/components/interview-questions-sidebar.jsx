"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function CandidateFoundQuestions({ evaluation }) {
  const [limit, setLimit] = useState(5)
  const questions = (evaluation?.test_details?.questions || []).filter((item) => item.isCorrect)
  if (!evaluation) return <p className="text-sm text-muted-foreground">Sélectionnez un candidat dans le tableau.</p>
  if (!questions.length) return <p className="text-sm text-muted-foreground">Aucune question trouvée par ce candidat.</p>

  return (
    <div className="space-y-3">
      {questions.slice(0, limit).map((question) => (
        <article key={question.index} className="space-y-2 rounded-md border bg-background p-3 text-sm">
          <p className="font-medium"><span className="mr-2 text-muted-foreground">{question.index}.</span>{question.question}</p>
          <p><span className="font-medium">Réponse candidat : </span>{question.answerLabel || "Non renseignée"}</p>
          <p className="text-emerald-800"><span className="font-medium">Réponse attendue : </span>{question.correctAnswerLabel || question.answerLabel || "Non renseignée"}</p>
        </article>
      ))}
      {questions.length > 5 ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{Math.min(limit, questions.length)} / {questions.length} questions</span>
          {limit < questions.length ? <Button size="sm" variant="outline" onClick={() => setLimit(limit + 5)}>5 de plus</Button> : null}
          {limit > 5 ? <Button size="sm" variant="ghost" onClick={() => setLimit(5)}>Réduire</Button> : null}
        </div>
      ) : null}
    </div>
  )
}

export default function InterviewQuestionsSidebar({ questions, selectedEvaluation }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const name = [selectedEvaluation?.candidate_snapshot?.first_name, selectedEvaluation?.candidate_snapshot?.last_name]
    .filter(Boolean).join(" ") || selectedEvaluation?.candidate_snapshot?.email
  return (
    <div className="min-w-0">
      <Button type="button" variant="outline" className="mb-3 w-full justify-between lg:hidden"
        aria-expanded={mobileOpen} aria-controls="jury-questions" onClick={() => setMobileOpen(!mobileOpen)}>
        Questions d'entretien et du candidat<ChevronDown className="ml-2 h-4 w-4" />
      </Button>
      <div id="jury-questions" className={`${mobileOpen ? "grid" : "hidden"} gap-3 lg:grid lg:h-[min(60dvh,640px)] lg:grid-rows-2`}>
        <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-orange-200">
          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-orange-200 bg-orange-50/50 px-3 py-2">
            <h2 className="text-sm font-semibold text-orange-950">Questions d'entretien</h2>
            <Badge variant="outline">{questions.length}</Badge>
          </header>
          <div className="min-h-0 max-h-[40dvh] space-y-3 overflow-y-auto p-3 lg:max-h-none">
            {!questions.length ? <p className="text-sm text-muted-foreground">Aucune question préparée pour ce référentiel.</p> : null}
            {questions.map((item, index) => (
              <article key={item.id || index} className="space-y-2 text-sm">
                <p className="font-medium">{index + 1}. {item.question}</p>
                <p className="rounded-md bg-muted/40 p-2"><span className="font-medium">Réponse attendue : </span>{item.expected_answer || "À compléter"}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-blue-200">
          <header className="shrink-0 border-b border-blue-200 bg-blue-50/50 px-3 py-2">
            <h2 className="text-sm font-semibold text-blue-950">Questions trouvées au test</h2>
            <p className="mt-1 truncate text-xs text-muted-foreground" title={name}>{name || "Aucun candidat sélectionné"}</p>
          </header>
          <div className="min-h-0 max-h-[40dvh] overflow-y-auto p-3 lg:max-h-none">
            <CandidateFoundQuestions key={selectedEvaluation?.id || "none"} evaluation={selectedEvaluation} />
          </div>
        </section>
      </div>
    </div>
  )
}
