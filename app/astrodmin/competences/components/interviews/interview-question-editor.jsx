"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { QUESTION_SECTIONS } from "./interview-questionnaire"

const EMPTY = { section: "technique", profile: "avec", topic: "", prompt: "", options: [], correct: "", points: 1 }
const LETTERS = ["A", "B", "C", "D"]
const selectClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm"

export default function InterviewQuestionEditor({ question, onClose, onSave }) {
  const [draft, setDraft] = useState(() => ({
    ...(question || EMPTY), options: LETTERS.map((_, index) => question?.options[index] || ""),
  }))
  const [withOptions, setWithOptions] = useState(Boolean(question?.options.length))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const technical = draft.section === "technique"
  const multipleChoice = technical || withOptions
  const change = (field, value) => setDraft((current) => ({ ...current, [field]: value }))

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    setError("")
    setBusy(true)
    try {
      if (multipleChoice && !draft.correct) throw new Error("Cochez au moins une bonne réponse.")
      await onSave({
        ...draft, profile: technical ? (draft.profile === "sans" ? "sans" : "avec") : "tous",
        options: multipleChoice ? draft.options : [], correct: multipleChoice ? draft.correct : "",
        points: Number(draft.points),
      })
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  return <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose() }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>{question ? "Modifier la question" : "Ajouter une question"}</DialogTitle>
        <DialogDescription>Les questionnaires déjà générés conservent leurs questions.</DialogDescription>
      </DialogHeader>
      <form className="space-y-4" onSubmit={submit}>
        <fieldset disabled={busy} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bank-question-section">Catégorie</Label>
              <select id="bank-question-section" className={selectClass} value={draft.section} onChange={(event) => change("section", event.target.value)}>
                {Object.entries(QUESTION_SECTIONS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              {technical ? <>
                <Label htmlFor="bank-question-profile">Profil informatique</Label>
                <select id="bank-question-profile" className={selectClass} value={draft.profile === "sans" ? "sans" : "avec"} onChange={(event) => change("profile", event.target.value)}>
                  <option value="avec">Avec informatique</option>
                  <option value="sans">Sans informatique</option>
                </select>
              </> : <label className="flex items-center gap-2 pt-6 text-sm">
                <input type="checkbox" checked={withOptions} onChange={(event) => setWithOptions(event.target.checked)} />
                Question à choix multiple
              </label>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank-question-topic">Thématique</Label>
            <Input id="bank-question-topic" required maxLength={100} value={draft.topic} onChange={(event) => change("topic", event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank-question-prompt">Question</Label>
            <Textarea id="bank-question-prompt" required maxLength={1000} value={draft.prompt} onChange={(event) => change("prompt", event.target.value)} />
          </div>
          {multipleChoice && <div className="grid gap-3 sm:grid-cols-2">
            {LETTERS.map((letter, index) => <div className="space-y-2" key={letter}>
              <Label htmlFor={`bank-option-${letter}`}>Réponse {letter}{index === 3 ? " (facultative)" : ""}</Label>
              <Input id={`bank-option-${letter}`} required={index < 3} maxLength={350} value={draft.options[index]} onChange={(event) => {
                const options = [...draft.options]
                options[index] = event.target.value
                change("options", options)
              }} />
            </div>)}
            <fieldset className="space-y-2 sm:col-span-2">
              <legend className="text-sm font-medium">Bonne(s) réponse(s)</legend>
              <div className="flex flex-wrap gap-2">
                {LETTERS.map((letter, index) => {
                  const checked = (draft.correct || "").includes(letter)
                  return (
                    <label key={letter} className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${checked ? "border-orange-500 bg-orange-50 font-medium dark:bg-orange-400/10" : ""} ${draft.options[index] ? "" : "opacity-50"}`}>
                      <input type="checkbox" className="accent-orange-600" checked={checked} disabled={!draft.options[index]}
                        onChange={() => change("correct", [...LETTERS].filter((item) => (item === letter ? !checked : (draft.correct || "").includes(item))).join(""))} />
                      {letter}
                    </label>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">Cochez plusieurs lettres si plusieurs réponses sont attendues : le candidat n’obtient les points que s’il les donne toutes, sans réponse fausse.</p>
            </fieldset>
          </div>}
          <div className="max-w-32 space-y-2">
            <Label htmlFor="bank-question-points">Points</Label>
            <Input id="bank-question-points" type="number" required min={1} max={100} value={draft.points} onChange={(event) => change("points", event.target.value)} />
          </div>
        </fieldset>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>Annuler</Button>
          <Button type="submit" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer la question"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}
