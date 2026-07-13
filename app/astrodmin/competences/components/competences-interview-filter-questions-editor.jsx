"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

function buildDraftQuestions(campaign) {
  return (campaign?.filter_questions || []).map((item, index) => ({
    id: item.id || `question_${index + 1}`,
    question: item.question || "",
    expected_answer: item.expected_answer || "",
  }))
}

function cleanQuestions(questions) {
  return questions
    .map((item, index) => ({
      id: item.id || `question_${index + 1}`,
      question: String(item.question || "").trim(),
      expected_answer: String(item.expected_answer || "").trim(),
    }))
    .filter((item) => item.question)
}

function FilterQuestionsReadOnly({ questions }) {
  if (!questions?.length) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        Aucune question préparée pour ce référentiel.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">N°</TableHead>
            <TableHead>Question à poser</TableHead>
            <TableHead>Réponse attendue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((item, index) => (
            <TableRow key={item.id || index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="max-w-[420px] whitespace-pre-wrap">{item.question}</TableCell>
              <TableCell className="max-w-[420px] whitespace-pre-wrap">
                {item.expected_answer || <span className="text-muted-foreground">À compléter</span>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function CompetencesInterviewFilterQuestionsEditor({
  campaigns = [],
  selectedCampaignId = "",
  onSelectedCampaignChange,
  onSave,
  submitting = false,
  canEdit = true,
  title = "Questions d'entretien",
  description = "Les validateurs/coachs préparent ici les questions que les filtreurs pourront poser pendant l'entretien.",
}) {
  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedCampaignId) || null,
    [campaigns, selectedCampaignId],
  )
  const [draftQuestions, setDraftQuestions] = useState([])

  useEffect(() => {
    setDraftQuestions(buildDraftQuestions(selectedCampaign))
  }, [selectedCampaign])

  const updateQuestion = (index, patch) => {
    setDraftQuestions((previous) =>
      previous.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    )
  }

  const addQuestion = () => {
    setDraftQuestions((previous) => [
      ...previous,
      {
        id: `question_${Date.now()}`,
        question: "",
        expected_answer: "",
      },
    ])
  }

  const removeQuestion = (index) => {
    setDraftQuestions((previous) => previous.filter((_, itemIndex) => itemIndex !== index))
  }

  const handleSave = () => {
    if (!selectedCampaign) {
      return
    }
    onSave(selectedCampaign.id, cleanQuestions(draftQuestions))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant="outline">{selectedCampaign ? `${draftQuestions.length} question(s)` : "À choisir"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>Référentiel / campagne</Label>
          <Select value={selectedCampaignId || "none"} onValueChange={onSelectedCampaignChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir le référentiel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" disabled>
                Choisir le référentiel
              </SelectItem>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.formation ? `${campaign.formation} - ` : ""}
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!selectedCampaign ? (
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            Choisissez d'abord un référentiel/campagne pour gérer les questions.
          </div>
        ) : !canEdit ? (
          <FilterQuestionsReadOnly questions={selectedCampaign.filter_questions || []} />
        ) : (
          <div className="space-y-4">
            {draftQuestions.length === 0 ? (
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                Aucune question préparée pour le moment.
              </div>
            ) : (
              <div className="space-y-3">
                {draftQuestions.map((item, index) => (
                  <div key={item.id || index} className="grid gap-3 rounded-lg border p-3 lg:grid-cols-[1fr_1fr_auto]">
                    <div className="space-y-2">
                      <Label>Question à poser</Label>
                      <Textarea
                        value={item.question}
                        onChange={(event) => updateQuestion(index, { question: event.target.value })}
                        className="min-h-20"
                        placeholder="Ex: Expliquez votre projet ou votre logique de résolution..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Réponse attendue</Label>
                      <Textarea
                        value={item.expected_answer}
                        onChange={(event) => updateQuestion(index, { expected_answer: event.target.value })}
                        className="min-h-20"
                        placeholder="Ce que le filtreur doit vérifier dans la réponse..."
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" variant="outline" onClick={() => removeQuestion(index)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Retirer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={addQuestion}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une question
              </Button>
              <Button type="button" onClick={handleSave} disabled={submitting}>
                Enregistrer les questions
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
