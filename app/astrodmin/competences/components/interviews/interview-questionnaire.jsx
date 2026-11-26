"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { BookOpen, Building2, CalendarCheck, Check, ClipboardList, Clock, GraduationCap, Laptop, Mail, MapPin, Phone, Save, Shuffle, UserX, X } from "lucide-react"
import { toast } from "sonner"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import TrainingName from "@/components/trainings/training-name"
import { cn } from "@/lib/utils"
import { educationLabel } from "@/app/odc/candidatures/education-options"

export const QUESTION_SECTIONS = { technique: "Technique", motivation: "Motivation", social: "Situation sociale ou familiale" }
const SCORE_MAXIMUM = { technique: 50, motivation: 30, social: 20 }
const sectionMaximum = (questionnaire, section) => questionnaire?.config?.[section]?.weight ?? SCORE_MAXIMUM[section]
const DRAFT_DELAY_MS = 450
const pendingDrafts = new Map()
const QUESTIONNAIRE_STATUS = { draft: "En cours", validated: "Évalué", absent: "Absent" }
const STATUS_TONE = {
  draft: "bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-300",
  validated: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
  absent: "bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-300",
}
const REVIEW_STATUS = {
  correct: "Réponse correcte", incorrect: "Réponse incorrecte", no_answer: "Ne sait pas / aucune réponse",
  unanswered: "Réponse non renseignée", graded: "Note enregistrée", ungraded: "Note non renseignée",
}
const PROFILES = [
  { value: "avec", label: "Oui" },
  { value: "sans", label: "Non" },
]
const CONFIRMATIONS = {
  validate: ["Valider l’entretien ?", "Le serveur calcule la note et verrouille l’évaluation."],
  absent: ["Marquer le candidat comme absent ?", "Sa fiche sera clôturée et aucune note ne sera attribuée."],
  reopen: ["Rouvrir l’évaluation ?", "Le validateur pourra reprendre les réponses et devra valider l’entretien de nouveau."],
}

const yesNo = (value) => typeof value === "boolean" ? (value ? "Oui" : "Non") : null
const formatDakarDateTime = (value) => {
  if (!value) return null
  const date = new Date(/(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? value : `${value}Z`)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Dakar" }).format(date)
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="break-words text-sm font-medium">{value}</dd>
      </div>
    </div>
  )
}

function InfoGroup({ title, rows }) {
  const visible = rows.filter((row) => row.value)
  if (!visible.length) return null
  return (
    <section className="space-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <dl className="divide-y">{visible.map((row) => <InfoRow key={row.label} {...row} />)}</dl>
    </section>
  )
}

function CandidateCard({ candidate, score, technicalScore, followUp, startsAt, minutes, appreciation, status }) {
  const nameParts = [candidate.first_name, candidate.last_name].filter(Boolean)
  const initials = nameParts.map((part) => Array.from(part)[0]).join("").toUpperCase() || "—"
  return (
    <aside className="overflow-hidden rounded-xl border bg-card shadow-sm" aria-label="Fiche apprenant">
      <div className="border-b bg-gradient-to-b from-orange-50 to-card px-5 pb-5 pt-6 text-center dark:from-orange-400/10">
        <Avatar className="mx-auto size-16 ring-4 ring-background">
          <AvatarFallback className="bg-orange-500 text-lg font-semibold text-white">{initials}</AvatarFallback>
        </Avatar>
        <p className="mt-3 break-words text-lg font-semibold leading-tight">{nameParts.join(" ") || "Candidat"}</p>
        {candidate.id ? <p className="mt-0.5 break-all font-mono text-[11px] text-muted-foreground">{candidate.id}</p> : null}
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {candidate.desired_training ? <span className="rounded-full bg-background px-2.5 py-0.5 text-xs font-medium shadow-sm ring-1 ring-border"><TrainingName value={candidate.desired_training} /></span> : null}
          {status ? <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_TONE[status] || "bg-muted text-muted-foreground"}`}>{QUESTIONNAIRE_STATUS[status] || status}</span> : null}
        </div>
      </div>

      {technicalScore || score ? (
        <div className="grid grid-cols-2 divide-x border-b text-center">
          <div className="p-3">
            <p className="text-xs text-muted-foreground">Technique{technicalScore?.provisional ? " (provisoire)" : ""}</p>
            <p className="text-xl font-semibold tabular-nums">{technicalScore ? `${technicalScore.earned} / ${technicalScore.possible}` : "—"}</p>
          </div>
          <div className="p-3">
            <p className="text-xs text-muted-foreground">Score global</p>
            <p className="text-xl font-semibold tabular-nums text-orange-600 dark:text-orange-400">{score ? `${score.global} / 100` : "—"}</p>
          </div>
        </div>
      ) : null}

      <div className="space-y-5 p-5">
        <InfoGroup title="Contact" rows={[
          { icon: Mail, label: "E-mail", value: candidate.email },
          { icon: Phone, label: "Téléphone", value: candidate.phone },
          { icon: MapPin, label: "Région", value: candidate.region_of_residence },
        ]} />
        <InfoGroup title="Parcours" rows={[
          { icon: GraduationCap, label: "Niveau d’études", value: educationLabel(candidate.education_level) },
          { icon: BookOpen, label: "Parcours / spécialité", value: candidate.speciality },
          { icon: Building2, label: "Structure actuelle", value: candidate.current_structure },
          { icon: Laptop, label: "Notions informatiques déclarées", value: yesNo(candidate.computer_skills) },
          { icon: CalendarCheck, label: "Disponible pour la formation", value: yesNo(candidate.available_for_10_months) },
          { icon: MapPin, label: "Site de formation", value: candidate.training_site_name },
        ]} />
        <InfoGroup title="Entretien" rows={[
          { icon: Clock, label: "Rendez-vous Teams", value: formatDakarDateTime(startsAt) && `${formatDakarDateTime(startsAt)}${minutes ? ` · ${minutes} min` : ""}` },
          ...(followUp ? followUp.fields.map(([label, value]) => ({ icon: ClipboardList, label, value })) : []),
        ]} />
        {followUp?.total > 0 ? (
          <div className="space-y-2 rounded-lg bg-muted/50 p-3">
            <div className="flex justify-between text-sm"><span>Réponses enregistrées</span><span className="font-medium tabular-nums">{followUp.answered} / {followUp.total}</span></div>
            <Progress aria-label="Réponses enregistrées" className="h-1.5" indicatorClassName="bg-orange-500" value={followUp.answered / followUp.total * 100} />
            {followUp.qcm ? <p className="text-xs text-muted-foreground">{followUp.qcm.correct} correcte(s) · {followUp.qcm.incorrect} incorrecte(s) · {followUp.qcm.no_answer} « ne sait pas »</p> : null}
          </div>
        ) : null}
        {appreciation}
      </div>
    </aside>
  )
}

function Question({ question, answer, disabled, review, checking, checkFailed, onRetry, onChange, onCheck }) {
  const id = `interview-question-${question.id}`
  const multiple = Boolean(question.multiple)
  const chosen = multiple && Array.isArray(answer) ? answer : []
  const isChecked = (value) => (multiple && value !== "aucune" ? chosen.includes(value) : answer === value)
  const expectedLetters = review?.expected_option ? review.expected_option.split("") : []
  const expected = expectedLetters.map((letter) => `${letter}. ${question.options["ABCD".indexOf(letter)]}`).join(" · ")
  const answeredClass = question.options.length ? (Array.isArray(answer) ? answer.length > 0 : Boolean(answer)) : answer?.points != null
  const toggle = (value) => {
    if (!multiple || value === "aucune") return onChange(value)
    const next = chosen.includes(value) ? chosen.filter((item) => item !== value) : [...chosen, value]
    onChange(next.length ? next.sort() : undefined)
  }
  return (
    <fieldset id={id} tabIndex={-1} disabled={disabled}
      className={cn("scroll-mt-3 rounded-xl border bg-card p-4 shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 sm:p-5",
        answeredClass && !review && "border-orange-200 dark:border-orange-900")}>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-md bg-muted px-2 py-0.5 font-semibold">Question {question.id}</span>
        <span className="text-muted-foreground">{question.topic}</span>
        {multiple ? <span className="rounded-md bg-sky-100 px-2 py-0.5 font-medium text-sky-800 dark:bg-sky-400/15 dark:text-sky-300">Plusieurs réponses possibles</span> : null}
        <span className="ml-auto rounded-md bg-orange-100 px-2 py-0.5 font-medium text-orange-800 dark:bg-orange-400/15 dark:text-orange-300">{question.points} pt{question.points > 1 ? "s" : ""}</span>
      </div>
      <legend className="sr-only">Question {question.id}</legend>
      <p className="mb-4 text-base font-semibold leading-snug">{question.prompt}</p>
      {question.options.length ? (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {[...question.options, "Ne sait pas / Aucune réponse"].map((label, index) => {
              const isNone = index === question.options.length
              const value = isNone ? "aucune" : "ABCD"[index]
              const checked = isChecked(value)
              const right = !isNone && expectedLetters.includes(value)
              const correct = review && checked && right
              const wrong = review && checked && !right
              const reveal = review && !checked && right
              return (
                // "relative" keeps the hidden input inside its tile: otherwise focusing it scrolls the whole dialog and blanks it.
                <label key={value} className={cn(
                  "relative flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-orange-500",
                  isNone && "border-dashed sm:col-span-2",
                  checked && !review && "border-orange-500 bg-orange-50 font-medium dark:bg-orange-400/10",
                  correct && "border-emerald-500 bg-emerald-50 font-medium dark:bg-emerald-400/10",
                  wrong && "border-red-400 bg-red-50 font-medium dark:bg-red-400/10",
                  reveal && "border-emerald-500/60 border-dashed",
                  !checked && !disabled && "hover:border-orange-300 hover:bg-muted/40",
                  disabled && "cursor-default",
                )}>
                  <input className="sr-only" type={multiple && !isNone ? "checkbox" : "radio"} name={id} value={value} checked={checked} onChange={() => toggle(value)} />
                  <span aria-hidden="true" className={cn(
                    "grid size-7 shrink-0 place-items-center border text-xs font-semibold",
                    multiple && !isNone ? "rounded-md" : "rounded-full",
                    checked && !review && "border-orange-500 bg-orange-500 text-white",
                    correct && "border-emerald-500 bg-emerald-500 text-white",
                    wrong && "border-red-500 bg-red-500 text-white",
                  )}>
                    {correct ? <Check className="size-3.5" /> : wrong ? <X className="size-3.5" /> : isNone ? "?" : value}
                  </span>
                  <span className="min-w-0 flex-1 break-words">{label}</span>
                </label>
              )
            })}
          </div>
          {multiple && !review && !disabled && chosen.length && onCheck ? (
            <div className="flex justify-end">
              <Button type="button" size="sm" variant="outline" onClick={onCheck} disabled={checking}><Check aria-hidden="true" />Corriger cette réponse</Button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-points`}>Note / {question.points}</Label>
            <Input id={`${id}-points`} type="number" min={0} max={question.points} step={0.01} value={answer?.points ?? ""}
              onChange={(event) => onChange({ ...answer, points: event.target.value === "" ? null : Number(event.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-comment`}>Réponse ou appréciation</Label>
            <Textarea id={`${id}-comment`} rows={2} maxLength={3000} value={answer?.comment || ""}
              onChange={(event) => onChange({ points: null, ...answer, comment: event.target.value })} />
          </div>
        </div>
      )}
      {review ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm" role="status">
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium",
            review.outcome === "correct" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300"
              : review.outcome === "incorrect" ? "bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-300"
                : "bg-muted text-muted-foreground")}>
            {REVIEW_STATUS[review.outcome]}{review.points != null ? ` · ${review.points} / ${question.points} pt(s)` : ""}
          </span>
          {expected && review.outcome !== "correct" ? <span className="break-words text-muted-foreground">{expectedLetters.length > 1 ? "Bonnes réponses" : "Bonne réponse"} : <strong className="font-medium text-foreground">{expected}</strong></span> : null}
        </div>
      ) : null}
      {checking ? <p role="status" className="mt-2 text-xs text-muted-foreground">Vérification de la réponse…</p> : null}
      {checkFailed ? <Button type="button" size="sm" variant="outline" className="mt-2" onClick={onRetry}>Réessayer la correction</Button> : null}
    </fieldset>
  )
}

export default function InterviewQuestionnaire({ evaluation, readOnly = false, adminMode = false, allowReopen = false, onSaved }) {
  const { interviews } = useAdminApi()
  const [questionnaire, setQuestionnaire] = useState(null)
  const [profile, setProfile] = useState("")
  const [answers, setAnswers] = useState({})
  const [comment, setComment] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [sectionKey, setSectionKey] = useState("technique")
  const [focusQuestion, setFocusQuestion] = useState("")
  const [feedback, setFeedback] = useState({})
  const checks = useRef({})
  const [draftStatus, setDraftStatus] = useState("")
  const draftRef = useRef(null)
  const draftTimer = useRef(null)
  const mounted = useRef(false)
  const [reload, setReload] = useState(0)
  const evaluationId = evaluation.id

  function load(data) {
    const initialAnswers = data.answers || {}
    const initialComment = data.comment || ""
    draftRef.current = !readOnly && !data.read_only && data.status === "draft" ? {
      session: crypto.randomUUID(), revision: data.revision, sequence: 0, saved: 0,
      answers: initialAnswers, comment: initialComment, questions: data.questions || [], inFlight: null,
    } : null
    setDraftStatus(draftRef.current && (Object.keys(initialAnswers).length || initialComment) ? "Brouillon enregistré." : "")
    setQuestionnaire(data)
    setAnswers(initialAnswers)
    setComment(initialComment)
    // Admins receive the server review instead of feedback: show it next to the answers already saved.
    setFeedback(data.feedback || Object.fromEntries(Object.entries(data.review?.questions || {})
      .filter(([key, mark]) => mark.expected_option && initialAnswers[key])
      .map(([key, mark]) => [key, { ...mark, answer: initialAnswers[key] }])))
    checks.current = {}
  }

  const flushDraft = useCallback(() => {
    clearTimeout(draftTimer.current)
    draftTimer.current = null
    const draft = draftRef.current
    if (!draft || draft.saved >= draft.sequence) return Promise.resolve(true)
    const { sequence } = draft
    if (draft.inFlight?.sequence === sequence) return draft.inFlight.promise
    const payload = {
      action: "draft", revision: draft.revision, draft_session: draft.session, draft_sequence: sequence,
      answers: { ...draft.answers }, comment: draft.comment,
    }
    for (const question of draft.questions) {
      const answer = payload.answers[question.id]
      if (!question.options.length && answer?.points != null &&
          (!Number.isFinite(answer.points) || answer.points < 0 || answer.points > question.points)) {
        payload.answers[question.id] = { ...answer, points: null }
      }
    }
    if (mounted.current) setDraftStatus("Enregistrement du brouillon…")
    const promise = interviews.updateQuestionnaire(evaluationId, payload, { keepalive: true }).then(({ data }) => {
      draft.saved = Math.max(draft.saved, sequence)
      draft.revision = Math.max(draft.revision, data.revision)
      if (mounted.current && draftRef.current === draft) {
        setQuestionnaire((previous) => previous ? { ...previous, revision: draft.revision } : previous)
        if (draft.saved === draft.sequence) setDraftStatus("Brouillon enregistré.")
      }
      return true
    }).catch((failure) => {
      if (draftRef.current === draft && sequence === draft.sequence && draft.saved < sequence) {
        if (mounted.current) setDraftStatus(`Brouillon non enregistré. ${failure.message}`)
        else toast.error("Les dernières modifications du brouillon n’ont pas été enregistrées.")
      }
      return false
    }).finally(() => {
      if (draft.inFlight?.sequence === sequence) draft.inFlight = null
      if (pendingDrafts.get(evaluationId) === promise) pendingDrafts.delete(evaluationId)
    })
    draft.inFlight = { sequence, promise }
    pendingDrafts.set(evaluationId, promise)
    return promise
  }, [evaluationId, interviews])

  function stageDraft(changes) {
    const draft = draftRef.current
    if (!draft) return
    Object.assign(draft, changes)
    draft.sequence += 1
    setDraftStatus("Modifications à enregistrer…")
    if (draftTimer.current === null) draftTimer.current = setTimeout(flushDraft, DRAFT_DELAY_MS)
  }

  useEffect(() => {
    if (readOnly || !evaluationId) return
    mounted.current = true
    const flushWhenHidden = () => { if (document.visibilityState === "hidden") void flushDraft() }
    const flushOnExit = () => { void flushDraft() }
    document.addEventListener("visibilitychange", flushWhenHidden)
    window.addEventListener("pagehide", flushOnExit)
    window.addEventListener("online", flushOnExit)
    return () => {
      mounted.current = false
      document.removeEventListener("visibilitychange", flushWhenHidden)
      window.removeEventListener("pagehide", flushOnExit)
      window.removeEventListener("online", flushOnExit)
      void flushDraft()
    }
  }, [evaluationId, flushDraft, readOnly])

  useEffect(() => {
    let active = true
    setError("")
    setNotice("")
    setQuestionnaire(null)
    if (!evaluationId) return
    Promise.resolve(pendingDrafts.get(evaluationId))
      .then(() => active && interviews.getQuestionnaire(evaluationId))
      .then((result) => { if (active && result) load(result.data) })
      .catch((failure) => { if (active) setError(failure.message) })
    return () => { active = false }
  }, [evaluationId, interviews, reload])

  useEffect(() => {
    if (!focusQuestion) return
    const element = document.getElementById(`interview-question-${focusQuestion}`)
    element?.focus({ preventScroll: true })
    element?.scrollIntoView({ block: "nearest" })
    setFocusQuestion("")
  }, [focusQuestion, sectionKey])

  async function checkAnswer(question, answer) {
    const key = Symbol()
    checks.current[question.id] = key
    setFeedback((previous) => ({ ...previous, [question.id]: { answer, checking: true } }))
    try {
      const { data } = await interviews.checkInterviewAnswer(evaluationId, { question_id: question.id, answer, revision: questionnaire.revision })
      if (checks.current[question.id] === key) setFeedback((previous) => ({ ...previous, [question.id]: data }))
    } catch {
      if (checks.current[question.id] === key) setFeedback((previous) => ({ ...previous, [question.id]: { answer, failed: true } }))
    }
  }

  async function submit(action) {
    setBusy(true)
    setError("")
    setNotice("")
    setConfirmation("")
    try {
      if (action === "draft") {
        if (await flushDraft()) {
          setDraftStatus("Brouillon enregistré.")
          onSaved?.()
        }
        return
      }
      if ((action === "validate" || action === "absent") && !(await flushDraft())) return
      const { data } = action === "generate" ? await interviews.generateQuestionnaire(evaluationId, profile || questionnaire?.declared_profile)
        : await interviews.updateQuestionnaire(evaluationId, { revision: draftRef.current?.revision ?? questionnaire.revision ?? 0, action, answers, comment })
      load(data)
      setNotice({ validate: "Entretien validé.", absent: "Candidat marqué absent.", reopen: "Évaluation rouverte." }[action] || "")
      if (action !== "generate") onSaved?.()
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  const questions = questionnaire?.questions || []
  const locked = Boolean(questionnaire?.read_only)
  const closed = ["validated", "absent"].includes(questionnaire?.status) || locked
  const isAnswered = (question) => {
    const answer = answers[question.id]
    if (question.options.length) return Array.isArray(answer) ? answer.length > 0 : Boolean(answer)
    return Number.isFinite(answer?.points) && answer.points >= 0 && answer.points <= question.points
  }
  const missingQuestions = questions.filter((question) => !isAnswered(question))
  const answered = questions.length - missingQuestions.length
  const nextQuestion = missingQuestions[0]
  const sections = Object.entries(QUESTION_SECTIONS).map(([key, label]) => {
    const items = questions.filter((question) => question.section === key)
    return { key, label, items, answered: items.filter(isAnswered).length }
  })
  const score = questionnaire?.scores
  const review = readOnly || adminMode ? questionnaire?.review : null
  const visibleFeedback = readOnly ? review?.questions || {} : feedback
  const results = Object.values(review?.questions || {})
  const qcm = results.some((item) => item.expected_option) ? {
    correct: results.filter((item) => item.outcome === "correct").length,
    incorrect: results.filter((item) => item.outcome === "incorrect").length,
    no_answer: results.filter((item) => item.outcome === "no_answer").length,
  } : null
  const technical = sections.find((section) => section.key === "technique")?.items || []
  const reviewedTechnical = technical.map((item) => visibleFeedback[item.id]).filter((item) => item?.points != null)
  const technicalScore = reviewedTechnical.length && questionnaire.status !== "absent" ? {
    earned: reviewedTechnical.reduce((sum, item) => sum + item.points, 0),
    possible: technical.reduce((sum, item) => sum + item.points, 0),
    provisional: !score,
  } : score ? { earned: score.technique, possible: sectionMaximum(questionnaire, "technique") } : null
  const followUp = readOnly || adminMode ? {
    fields: [
      ["Statut", QUESTIONNAIRE_STATUS[questionnaire?.status] || evaluation.interview_status],
      ["Validateur", review?.reviewer || evaluation.validator],
      ["Convocation", evaluation.invitation_status],
      ["Dernière saisie", formatDakarDateTime(review?.saved_at)],
    ],
    answered, total: questions.length, qcm,
  } : null
  const progressValue = questions.length ? answered / questions.length * 100 : 0
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-muted/30">
      <div className="grid min-h-0 flex-1 content-start gap-4 overflow-y-auto p-4 sm:p-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
        <div className="min-w-0 space-y-4 lg:overflow-y-auto lg:pr-1">
          {error ? <div role="alert" className="flex flex-wrap items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <span className="mr-auto">{error}</span><Button type="button" size="sm" variant="outline" onClick={() => setReload(reload + 1)}>Recharger la fiche</Button>
          </div> : null}
          {notice ? <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-800 dark:text-emerald-300">{notice}</p> : null}
          {locked ? <p role="status" className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">La campagne est archivée : cette fiche est consultable en lecture seule.</p> : null}
          {adminMode && questionnaire && !closed ? <p className="rounded-lg border border-sky-300/50 bg-sky-50 p-3 text-sm text-sky-900 dark:border-sky-800 dark:bg-sky-400/10 dark:text-sky-200">Vous modifiez cette fiche en tant qu’administrateur. Votre nom sera enregistré comme auteur de la saisie.</p> : null}
          {!evaluationId ? <p className="rounded-xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">Aucun questionnaire n’est disponible pour ce candidat.</p> : null}
          {evaluationId && !questionnaire && !error ? (
            <div role="status" className="space-y-3">
              <span className="sr-only">Chargement du questionnaire…</span>
              <Skeleton className="h-24 w-full rounded-xl" /><Skeleton className="h-40 w-full rounded-xl" /><Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ) : null}

          {questionnaire && (questionnaire.profile || (!readOnly && !closed)) ? (
            <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
              {questionnaire.profile || questionnaire.declared_profile ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted"><Laptop className="size-4 text-muted-foreground" aria-hidden="true" /></span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {(questionnaire.profile || questionnaire.declared_profile) === "avec" ? "A déjà fait de l’informatique" : "N’a jamais fait d’informatique"}
                    </p>
                    <p className="text-xs text-muted-foreground">Réponse donnée à l’inscription : elle détermine les questions techniques.</p>
                  </div>
                </div>
              ) : (
              <fieldset disabled={Boolean(questionnaire.profile) || readOnly || busy}>
                <legend className="text-sm font-semibold">Le candidat a-t-il déjà fait de l’informatique ?</legend>
                <p className="mt-0.5 text-xs text-muted-foreground">Ce choix détermine la banque de questions techniques.</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {PROFILES.map(({ value, label }) => {
                    const checked = (questionnaire.profile || profile) === value
                    return (
                      <label key={value} className={cn(
                        "relative flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-orange-500 has-[:disabled]:cursor-default",
                        checked ? "border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-400/10 dark:text-orange-200" : "hover:bg-muted/50",
                      )}>
                        <input className="sr-only" type="radio" name="interview-computer-profile" value={value} checked={checked} onChange={() => setProfile(value)} />
                        {checked ? <Check className="size-4" aria-hidden="true" /> : null}{label}
                      </label>
                    )
                  })}
                </div>
              </fieldset>
              )}
              {!readOnly && !questions.length && !closed ? (
                <Button type="button" className="mt-4 w-full" onClick={() => submit("generate")} disabled={!(profile || questionnaire.declared_profile) || busy}>
                  <Shuffle aria-hidden="true" />Générer le questionnaire
                </Button>
              ) : null}
            </section>
          ) : null}
          {questionnaire && readOnly && !questions.length && !closed ? <p className="rounded-xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">Le questionnaire n’a pas encore été généré.</p> : null}

          {questions.length ? (
            <Tabs value={sectionKey} onValueChange={setSectionKey} className="space-y-4">
              <div className="sticky top-0 z-10 space-y-3 rounded-xl border bg-card p-3 shadow-sm">
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-medium">Progression</span>
                  <Progress aria-label="Progression du questionnaire" className="h-2 flex-1" indicatorClassName="bg-orange-500" value={progressValue} />
                  <span className="font-semibold tabular-nums" aria-live="polite">{answered}/{questions.length}</span>
                </div>
                <TabsList className="grid h-auto w-full grid-cols-3 gap-1 bg-muted/60 p-1" aria-label="Parties du questionnaire">
                  {sections.map((section) => {
                    const complete = section.items.length > 0 && section.answered === section.items.length
                    return (
                      <TabsTrigger key={section.key} value={section.key} className="flex h-auto items-center justify-center gap-1.5 whitespace-normal px-2 py-2 text-xs data-[state=active]:text-orange-700 sm:text-sm dark:data-[state=active]:text-orange-300">
                        <span>{section.key === "social" ? "Situation sociale" : section.label}</span>
                        <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", complete ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300" : "bg-background text-muted-foreground")}>
                          {section.answered}/{section.items.length}
                        </span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </div>
              {sections.map((section) => <TabsContent key={section.key} value={section.key} className="mt-0 space-y-3">
                {score ? <p className="text-right text-sm text-muted-foreground">Note de la partie : <strong className="text-foreground">{score[section.key]} / {sectionMaximum(questionnaire, section.key)}</strong></p> : null}
                {!section.items.length ? <p className="rounded-xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">Aucune question dans cette partie.</p> : null}
                {section.items.map((question) => {
                  const answer = answers[question.id]
                  const mark = visibleFeedback[question.id]
                  // Multiple-answer questions store a list: compare by value, not by reference.
                  const current = readOnly || JSON.stringify(mark?.answer) === JSON.stringify(answer) ? mark : null
                  return <Question key={question.id} question={question} answer={answer} review={current?.outcome ? current : null}
                    checking={current?.checking} checkFailed={current?.failed && !closed} onRetry={() => checkAnswer(question, answer)} disabled={closed || readOnly || busy}
                    onCheck={() => checkAnswer(question, answer)}
                    onChange={(value) => {
                      const updated = { ...(draftRef.current?.answers || answers), [question.id]: value }
                      if (value === undefined) delete updated[question.id]
                      setAnswers(updated)
                      stageDraft({ answers: updated })
                      // Single answers are corrected at once; multiple answers when the validator asks (or "ne sait pas").
                      if (question.options.length && value !== undefined && (!question.multiple || value === "aucune")) checkAnswer(question, value)
                    }} />
                })}
              </TabsContent>)}
            </Tabs>
          ) : null}
        </div>
        <div className="min-w-0 lg:overflow-y-auto">
          <CandidateCard candidate={evaluation.candidate_snapshot || {}} score={score} technicalScore={technicalScore} followUp={followUp}
            status={questionnaire?.status} startsAt={evaluation.scheduled_at || evaluation.slot_start_at} minutes={evaluation.scheduled_minutes} appreciation={questions.length ? <div className="space-y-2 border-t pt-4">
              {closed || readOnly ? <>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Appréciation générale</h3>
                <p className="whitespace-pre-wrap break-words text-sm">{comment || <span className="text-muted-foreground">Aucune appréciation enregistrée.</span>}</p>
              </> : <>
                <Label htmlFor="interview-overall-comment" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Appréciation générale</Label>
                <Textarea id="interview-overall-comment" rows={4} maxLength={3000} value={comment} disabled={busy} placeholder="Points forts, points d’attention, impression générale…" onChange={(event) => {
                  const value = event.target.value
                  setComment(value)
                  stageDraft({ comment: value })
                }} />
              </>}
            </div> : null} />
        </div>
      </div>
      {questionnaire && !closed && !readOnly ? <div className="flex shrink-0 flex-wrap items-center gap-3 border-t bg-background px-4 py-3 sm:px-5">
        <div className="mr-auto min-w-0 space-y-0.5 text-sm" role="status">
          {questions.length ? (nextQuestion ? <p className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
            <span><strong className="text-foreground">{missingQuestions.length}</strong> question(s) à compléter</span>
            <Button type="button" variant="link" size="sm" className="h-auto p-0 text-orange-700 dark:text-orange-300" onClick={() => {
              setSectionKey(nextQuestion.section)
              setFocusQuestion(nextQuestion.id)
            }}>Aller à la question {nextQuestion.id} →</Button>
          </p> : <p className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-300"><Check className="size-4" aria-hidden="true" />Prêt à être validé</p>) : null}
          {draftStatus ? <p className={cn("text-xs", draftStatus.startsWith("Brouillon non enregistré") ? "text-destructive" : "text-muted-foreground")}>{draftStatus}</p> : null}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="ghost" className="text-muted-foreground" disabled={busy} onClick={() => setConfirmation("absent")}><UserX aria-hidden="true" />Absent</Button>
          {questions.length ? <>
            <Button type="button" variant="outline" disabled={busy} onClick={() => submit("draft")}><Save aria-hidden="true" />Enregistrer</Button>
            <Button type="button" disabled={busy || answered !== questions.length} onClick={() => setConfirmation("validate")}><Check aria-hidden="true" />Valider l’entretien</Button>
          </> : null}
        </div>
      </div> : null}
      {(readOnly || adminMode) && allowReopen && closed && !locked && evaluation.final_status === "en_attente" ? (
        <div className="flex shrink-0 justify-end border-t bg-background px-4 py-3 sm:px-5">
          <Button type="button" variant="outline" disabled={busy} onClick={() => setConfirmation("reopen")}>Rouvrir l’évaluation</Button>
        </div>
      ) : null}
      <AlertDialog open={Boolean(confirmation)} onOpenChange={(open) => { if (!open) setConfirmation("") }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{CONFIRMATIONS[confirmation]?.[0]}</AlertDialogTitle>
            <AlertDialogDescription>{CONFIRMATIONS[confirmation]?.[1]}</AlertDialogDescription>
          </AlertDialogHeader>
          {confirmation === "validate" ? (
            <dl className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3 text-center text-sm">
              {sections.map((section) => <div key={section.key}>
                <dt className="text-xs text-muted-foreground">{section.key === "social" ? "Social" : section.label}</dt>
                <dd className="font-semibold tabular-nums">{section.answered}/{section.items.length}</dd>
              </div>)}
            </dl>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => submit(confirmation)}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
