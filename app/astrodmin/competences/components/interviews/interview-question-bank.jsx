"use client"

import { useEffect, useState } from "react"
import { Download, Plus, Save, Upload } from "lucide-react"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { QUESTION_SECTIONS } from "./interview-questionnaire"
import InterviewQuestionEditor from "./interview-question-editor"

const CONFIG_SECTIONS = [["technique", "Technique"], ["motivation", "Motivation"], ["social", "Situation sociale"]]

function topicCounts(questions) {
  const topics = { "technique:avec": new Set(), "technique:sans": new Set(), motivation: new Set(), social: new Set() }
  for (const question of questions) {
    if (question.active === false) continue
    const key = question.section === "technique" ? `technique:${question.profile}` : question.section
    topics[key]?.add(question.topic.trim().toLocaleLowerCase("fr"))
  }
  return Object.fromEntries(Object.entries(topics).map(([key, value]) => [key, value.size]))
}

function QuestionnaireComposition({ config, questions, disabled, onSave }) {
  const [draft, setDraft] = useState(config)
  const [saving, setSaving] = useState(false)
  useEffect(() => { setDraft(config) }, [config])
  const total = CONFIG_SECTIONS.reduce((sum, [key]) => sum + (Number(draft[key]?.weight) || 0), 0)
  const available = topicCounts(questions)
  const changed = JSON.stringify(draft) !== JSON.stringify(config)
  const update = (key, field, value) => setDraft((current) => ({
    ...current, [key]: { ...current[key], [field]: value === "" ? "" : Number(value) },
  }))
  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    try { await onSave(draft) } finally { setSaving(false) }
  }
  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border bg-muted/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">Composition du questionnaire</h3>
          <p className="text-sm text-muted-foreground">Nombre de questions tirées au sort par partie et poids de chaque partie dans la note sur 100. Les questionnaires déjà générés gardent leur composition.</p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${total === 100 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300"}`}>
          Total des pondérations : {total} / 100
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {CONFIG_SECTIONS.map(([key, label]) => {
          const topics = key === "technique"
            ? `${available["technique:avec"]} thématique(s) « avec » · ${available["technique:sans"]} « sans »`
            : `${available[key]} thématique(s) disponible(s)`
          const short = key === "technique"
            ? Math.min(available["technique:avec"], available["technique:sans"]) < (Number(draft[key]?.count) || 0)
            : available[key] < (Number(draft[key]?.count) || 0)
          return (
            <fieldset key={key} className="space-y-2 rounded-lg border bg-card p-3" disabled={disabled || saving}>
              <legend className="px-1 text-sm font-medium">{label}</legend>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor={`config-${key}-count`} className="text-xs text-muted-foreground">Questions</Label>
                  <Input id={`config-${key}-count`} type="number" min={1} max={50} required value={draft[key]?.count ?? ""} onChange={(event) => update(key, "count", event.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`config-${key}-weight`} className="text-xs text-muted-foreground">Pondération (%)</Label>
                  <Input id={`config-${key}-weight`} type="number" min={0} max={100} required value={draft[key]?.weight ?? ""} onChange={(event) => update(key, "weight", event.target.value)} />
                </div>
              </div>
              <p className={`text-xs ${short ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground"}`}>{topics}</p>
            </fieldset>
          )
        })}
      </div>
      <div className="flex justify-end gap-2">
        {changed ? <Button type="button" variant="ghost" onClick={() => setDraft(config)} disabled={saving}>Annuler</Button> : null}
        <Button type="submit" disabled={disabled || saving || !changed || total !== 100}><Save aria-hidden="true" />Enregistrer la composition</Button>
      </div>
    </form>
  )
}

const COLUMNS = ["Catégorie", "Thématique", "Profil", "Question", "Réponse A", "Réponse B", "Réponse C", "Réponse D", "Bonne réponse", "Points"]
const MAX_WORKBOOK_SIZE = 2 * 1024 * 1024
const MAX_ROWS = 400

async function downloadTemplate() {
  const { utils, writeFile } = await import("xlsx")
  const workbook = utils.book_new()
  const exampleRows = [
    ["technique", "Web", "avec", "Quel langage sert à styliser une page web ?", "HTML", "CSS", "SQL", "", "B", 1],
    ["technique", "Web", "sans", "Quel appareil permet de consulter un site web ?", "Un navigateur sur téléphone", "Une lampe", "Une calculatrice simple", "", "A", 1],
    ["technique", "Langages", "avec", "Quels langages s’exécutent dans le navigateur ? (plusieurs réponses)", "HTML", "Python", "JavaScript", "SQL", "A,C", 2],
    ["motivation", "Projet", "tous", "Quel projet aimeriez-vous réaliser ?", "", "", "", "", "", 1],
    ["social", "Disponibilité", "tous", "De quel accompagnement auriez-vous besoin pour suivre la formation ?", "", "", "", "", "", 1],
  ]
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([COLUMNS]), "Questions")
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([COLUMNS, ...exampleRows]), "Exemples")
  writeFile(workbook, "modele-questions-entretien.xlsx")
}

async function readWorkbook(file) {
  if (!/\.xlsx$/i.test(file.name) || file.size > MAX_WORKBOOK_SIZE) {
    throw new Error("Choisissez un fichier .xlsx de 2 Mo maximum.")
  }
  const { read, utils } = await import("xlsx")
  const workbook = read(await file.arrayBuffer(), { sheetRows: MAX_ROWS + 2 })
  const sheet = workbook.Sheets.Questions || workbook.Sheets[workbook.SheetNames[0]]
  const rows = sheet ? utils.sheet_to_json(sheet, { header: 1, defval: "", blankrows: true }) : []
  if (!rows.length || !COLUMNS.every((column, index) => String(rows[0][index] || "").trim() === column)) {
    throw new Error("Les en-têtes ne correspondent pas au modèle Excel.")
  }
  if (sheet["!fullref"] && utils.decode_range(sheet["!fullref"]).e.r > MAX_ROWS) {
    throw new Error(`Le fichier contient plus de ${MAX_ROWS} lignes de questions.`)
  }
  return rows.slice(1).flatMap((cells, index) => {
    const values = cells.map((cell) => String(cell).trim())
    if (!values.some(Boolean)) return []
    const [section, topic, profile, prompt, a, b, c, d, correct, points] = values
    return [{ line: index + 2, question: { section, topic, profile, prompt, options: [a, b, c, d], correct, points: Number(points) } }]
  })
}

export default function InterviewQuestionBank({ campaignId, scope = "de la campagne" }) {
  const { interviews } = useAdminApi()
  const [bank, setBank] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [reload, setReload] = useState(0)
  const [editor, setEditor] = useState(null)
  const [importMode, setImportMode] = useState("append")

  useEffect(() => {
    let active = true
    setLoading(true)
    setError("")
    setPreview(null)
    setEditor(null)
    interviews.getQuestionBank(campaignId)
      .then(({ data }) => { if (active) setBank(data) })
      .catch((failure) => {
        if (active) {
          setBank(null)
          setError(failure.message)
        }
      }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [campaignId, interviews, reload])

  async function previewImport(event) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setBusy(true)
    setPreview(null)
    setNotice("")
    setError("")
    try {
      const rows = await readWorkbook(file)
      const { data } = await interviews.checkQuestionBank(campaignId, rows.map((row) => row.question), importMode)
      setPreview({ ...data, fileName: file.name, rows })
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  async function saveImport() {
    setBusy(true)
    setError("")
    try {
      const { data } = await interviews.saveQuestionBank(campaignId, preview.questions, bank.revision, importMode)
      setBank(data)
      setPreview(null)
      setNotice(`${data.questions.length} questions enregistrées.`)
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  async function updateQuestion(payload) {
    setError("")
    setNotice("")
    const { data } = await interviews.editQuestionBank(campaignId, { ...payload, revision: bank.revision })
    setBank(data)
    setNotice({
      add: "Question ajoutée.",
      edit: "Question modifiée.",
      set_active: payload.active ? "Question réactivée." : "Question désactivée.",
    }[payload.action])
  }

  async function toggleQuestion(index, active) {
    setBusy(true)
    try {
      await updateQuestion({ action: "set_active", index, active })
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  async function saveConfig(config) {
    setError("")
    setNotice("")
    try {
      const { data } = await interviews.updateQuestionnaireConfig(campaignId, config)
      setBank((current) => ({ ...current, config: data.config, coverage_error: data.coverage_error }))
      setNotice("Composition du questionnaire enregistrée.")
    } catch (failure) {
      setError(failure.message)
    }
  }

  const questions = preview?.questions || bank?.questions || []
  const canEdit = Boolean(bank && !loading && !busy && !preview)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Banque de questions</CardTitle>
        <CardDescription>Chaque question tirée correspond à une thématique différente. Ajoutez plusieurs questions par thématique pour varier les questionnaires. Colonne « Bonne réponse » : une lettre (B) ou plusieurs (A,C) ; avec plusieurs bonnes réponses, les points ne sont accordés que si le candidat les donne toutes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {bank?.config ? <QuestionnaireComposition config={bank.config} questions={bank.questions} disabled={!canEdit} onSave={saveConfig} /> : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={() => setEditor({})} disabled={!canEdit || bank.questions.length >= MAX_ROWS}>
            <Plus aria-hidden="true" />Ajouter une question
          </Button>
          <Button variant="outline" type="button" onClick={() => downloadTemplate().catch((failure) => setError(failure.message))}>
            <Download className="mr-2 h-4 w-4" />Télécharger le modèle Excel
          </Button>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <Label htmlFor="interview-import-mode">Action à l’import</Label>
            <select id="interview-import-mode" className="h-10 max-w-full rounded-md border border-input bg-background px-3 text-sm"
              value={importMode} onChange={(event) => setImportMode(event.target.value)} disabled={!canEdit}>
              <option value="append">Ajouter à la banque</option>
              <option value="replace">Remplacer la banque</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="interview-bank-file" className="text-sm"><Upload className="h-4 w-4" />Importer les questions</Label>
            <Input id="interview-bank-file" className="w-full sm:w-auto" type="file" accept=".xlsx" onChange={previewImport} disabled={!canEdit} />
          </div>
        </div>
        {error ? (
          <div className="flex flex-wrap items-center gap-2 text-sm text-destructive" role="alert">
            <span>{error}</span><Button type="button" size="sm" variant="outline" onClick={() => setReload(reload + 1)}>Actualiser la banque</Button>
          </div>
        ) : null}
        {notice ? <p role="status" className="text-sm text-emerald-700">{notice}</p> : null}
        {!preview && bank?.coverage_error && <p className="rounded-lg border border-amber-500/40 p-3 text-sm">
          La banque ne couvre pas toutes les thématiques requises pour la génération. {bank.coverage_error}
        </p>}
        {!preview && bank?.questions.length >= MAX_ROWS && <p className="text-sm text-muted-foreground">La banque a atteint sa limite de {MAX_ROWS} questions.</p>}
        {loading ? <p role="status" className="text-sm text-muted-foreground">Chargement de la banque…</p> : null}
        {preview ? (
          <div className="space-y-3 rounded-lg border p-3">
            <p className="text-sm font-medium">Aperçu de {preview.fileName} · {preview.rows.length} ligne(s)</p>
            {preview.errors.length ? <ul className="list-disc space-y-1 pl-5 text-sm text-destructive">
              {preview.errors.map(({ index, message }, key) => (
                <li key={key}>{index == null ? message : `Ligne ${preview.rows[index].line} — ${message}`}</li>
              ))}
            </ul> : <p className="text-sm text-muted-foreground">
              {importMode === "append" ? "Cet import ajoutera les questions à la banque." : `Cet import remplacera la banque ${scope}.`}
              {" "}Les questionnaires déjà générés gardent leurs questions.
            </p>}
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={saveImport} disabled={busy || Boolean(preview.errors.length)}>Confirmer l’import</Button>
              <Button type="button" variant="outline" onClick={() => setPreview(null)} disabled={busy}>Annuler</Button>
            </div>
          </div>
        ) : null}
        {questions.length ? <Table containerClassName="max-h-96 rounded-lg border" aria-label={`Questions ${scope}`}>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow><TableHead>Catégorie</TableHead><TableHead>Thématique</TableHead><TableHead>Profil</TableHead><TableHead>Question</TableHead><TableHead>Propositions</TableHead><TableHead>Bonne réponse</TableHead><TableHead>Points</TableHead>
              {!preview && <><TableHead>Statut</TableHead><TableHead>Actions</TableHead></>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question, index) => <TableRow key={index}>
              <TableCell>{QUESTION_SECTIONS[question.section]}</TableCell><TableCell>{question.topic}</TableCell>
              <TableCell>{question.profile}</TableCell><TableCell className="whitespace-normal">{question.prompt}</TableCell>
              <TableCell className="min-w-44 whitespace-normal">
                {question.options.length ? question.options.map((option, key) => <div key={key}>{"ABCD"[key]}. {option}</div>) : "Réponse libre"}
              </TableCell>
              <TableCell>{question.correct ? String(question.correct).replace(/[^A-D]/gi, "").toUpperCase().split("").join(", ") : "Note manuelle"}</TableCell><TableCell>{question.points}</TableCell>
              {!preview && <>
                <TableCell>{question.active === false ? "Désactivée" : "Active"}</TableCell>
                <TableCell><div className="flex gap-2">
                  <Button variant="outline" size="sm" type="button" disabled={!canEdit}
                    onClick={() => setEditor({ index, question })}>Modifier</Button>
                  <Button variant="ghost" size="sm" type="button" disabled={!canEdit}
                    onClick={() => toggleQuestion(index, question.active === false)}>
                    {question.active === false ? "Réactiver" : "Désactiver"}
                  </Button>
                </div></TableCell>
              </>}
            </TableRow>)}
          </TableBody>
        </Table> : null}
        {!loading && bank && !questions.length && !preview ? <p className="text-sm text-muted-foreground">Aucune question enregistrée.</p> : null}
      </CardContent>
      {editor && <InterviewQuestionEditor question={editor.question} onClose={() => setEditor(null)} onSave={async (question) => {
        await updateQuestion({ action: editor.question ? "edit" : "add", index: editor.index, question })
        setEditor(null)
      }} />}
    </Card>
  )
}
