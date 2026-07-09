"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const SECTIONS = [
  { key: "filter", label: "Filtreur" },
  { key: "validator", label: "Validateur" },
  { key: "motivation", label: "Motivation" },
]

const CRITERION_TYPES = [
  { value: "checkbox", label: "Case à cocher" },
  { value: "number", label: "Note" },
]

const CANDIDATE_PREVIEW_COLUMNS = ["Nom", "Email", "Téléphone", "Score test", "Sexe"]

function createEmptyScorecard() {
  const standardCriteria = {
    filter: [
      { key: "interviewer", label: "Nom du filtreur", type: "text", required: true, system: true },
      { key: "comment", label: "Commentaire filtreur", type: "textarea", required: true, system: true },
      {
        key: "decision",
        label: "Décision filtreur",
        type: "select",
        required: true,
        system: true,
        options: [
          { value: "validateur", label: "Validateur" },
          { value: "echec", label: "Échec" },
        ],
      },
    ],
    validator: [
      { key: "interviewer", label: "Nom du validateur", type: "text", required: true, system: true },
      {
        key: "verdict",
        label: "Verdict",
        type: "select",
        required: true,
        system: true,
        options: [
          { value: "oui", label: "Oui" },
          { value: "non", label: "Non" },
          { value: "reserve", label: "Avec réserve" },
          { value: "a_revoir", label: "À revoir" },
        ],
      },
      { key: "comment", label: "Commentaire validateur", type: "textarea", required: false, system: true },
    ],
    motivation: [
      { key: "interviewer", label: "Nom jury motivation", type: "text", required: true, system: true },
      { key: "comment", label: "Commentaire motivation", type: "textarea", required: true, system: true },
    ],
  }
  return {
    source: "custom",
    source_label: "Grille personnalisée par le super admin",
    sections: Object.fromEntries(
      SECTIONS.map((section) => [
        section.key,
        {
          title: section.label,
          criteria: standardCriteria[section.key],
        },
      ]),
    ),
  }
}

function normalizeScorecard(scorecard) {
  const fallback = createEmptyScorecard()
  const sourceSections = scorecard?.sections || fallback.sections
  return {
    source: scorecard?.source || fallback.source,
    source_label: scorecard?.source_label || fallback.source_label,
    sections: Object.fromEntries(
      SECTIONS.map((section) => [
        section.key,
        {
          title: sourceSections?.[section.key]?.title || section.label,
          criteria: (sourceSections?.[section.key]?.criteria || []).map((criterion) => ({
            ...criterion,
            required: Boolean(criterion.required),
            options: [...(criterion.options || [])],
          })),
        },
      ]),
    ),
  }
}

function createCriterion(sectionKey) {
  return {
    key: `critere_${sectionKey}_${Date.now()}`,
    label: "Nouveau critère",
    type: "checkbox",
    required: false,
    system: false,
  }
}

function getEditableCriteria(section) {
  return (section?.criteria || [])
    .map((criterion, index) => ({ criterion, index }))
    .filter(({ criterion }) => !criterion.system && criterion.type !== "computed")
}

function getPreviewCriteria(section) {
  return (section?.criteria || []).filter((criterion) => !criterion.system || criterion.type === "computed")
}

export default function CompetencesInterviewScorecardEditor({
  selectedCampaign,
  submitting,
  locked = false,
  onSave,
}) {
  const [draft, setDraft] = useState(normalizeScorecard(selectedCampaign?.scorecard_config))

  useEffect(() => {
    setDraft(normalizeScorecard(selectedCampaign?.scorecard_config))
  }, [selectedCampaign])

  const criterionCount = useMemo(
    () => SECTIONS.reduce(
      (total, section) => total + (
        draft.sections[section.key]?.criteria.filter(
          (criterion) => !criterion.system && criterion.type !== "computed",
        ).length || 0
      ),
      0,
    ),
    [draft],
  )

  if (!selectedCampaign) {
    return null
  }

  const updateSection = (sectionKey, updater) => {
    setDraft((previous) => ({
      ...previous,
      source: previous.source === "excel" ? "custom" : previous.source,
      source_label: "Grille personnalisée par le super admin",
      sections: {
        ...previous.sections,
        [sectionKey]: updater(previous.sections[sectionKey]),
      },
    }))
  }

  const updateCriterion = (sectionKey, criterionIndex, patch) => {
    updateSection(sectionKey, (section) => ({
      ...section,
      criteria: section.criteria.map((criterion, index) => (
        index === criterionIndex ? { ...criterion, ...patch } : criterion
      )),
    }))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Critères du référentiel</CardTitle>
            <CardDescription>
              Cette grille sera utilisée uniquement pour la campagne {selectedCampaign.name}.
            </CardDescription>
          </div>
          <Badge variant={criterionCount ? "outline" : "destructive"}>
            {criterionCount} critère(s)
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {locked ? (
          <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            Cette grille est verrouillée car des candidats sont déjà planifiés dans la campagne.
          </p>
        ) : null}
        {SECTIONS.map((sectionDefinition) => {
          const section = draft.sections[sectionDefinition.key]
          const editableCriteria = getEditableCriteria(section)

          return (
            <div key={sectionDefinition.key} className="space-y-4 rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{sectionDefinition.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {editableCriteria.length} critère(s) métier. Le nom, le commentaire et la décision sont automatiques.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateSection(sectionDefinition.key, (currentSection) => ({
                      ...currentSection,
                      criteria: [...currentSection.criteria, createCriterion(sectionDefinition.key)],
                    }))
                  }
                  disabled={locked}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un critère
                </Button>
              </div>

              {editableCriteria.length === 0 ? (
                <p className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                  Aucun critère métier dans cette section.
                </p>
              ) : (
                <div className="space-y-3">
                  {editableCriteria.map(({ criterion, index: criterionIndex }) => (
                    <div key={criterion.key} className="space-y-4 rounded-md border bg-muted/20 p-4">
                      <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto]">
                        <div className="space-y-2">
                          <Label>Libellé</Label>
                          <Input
                            value={criterion.label}
                            onChange={(event) =>
                              updateCriterion(sectionDefinition.key, criterionIndex, { label: event.target.value })
                            }
                            disabled={locked}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={criterion.type}
                            onValueChange={(type) =>
                              updateCriterion(sectionDefinition.key, criterionIndex, {
                                type,
                              })
                            }
                            disabled={locked}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CRITERION_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() =>
                              updateSection(sectionDefinition.key, (currentSection) => ({
                                ...currentSection,
                                criteria: currentSection.criteria.filter((_, index) => index !== criterionIndex),
                              }))
                            }
                            disabled={locked}
                            aria-label="Supprimer le critère"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {criterion.type === "number" ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Note minimale</Label>
                            <Input
                              type="number"
                              value={criterion.min ?? 0}
                              onChange={(event) =>
                                updateCriterion(sectionDefinition.key, criterionIndex, {
                                  min: Number(event.target.value),
                                })
                              }
                              disabled={locked}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Note maximale</Label>
                            <Input
                              type="number"
                              value={criterion.max ?? 20}
                              onChange={(event) =>
                                updateCriterion(sectionDefinition.key, criterionIndex, {
                                  max: Number(event.target.value),
                                })
                              }
                              disabled={locked}
                            />
                          </div>
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between rounded-md border px-3 py-2">
                        <div>
                          <p className="text-sm font-medium">Champ obligatoire</p>
                          <p className="text-xs text-muted-foreground">
                            La section ne sera complète qu’après son renseignement.
                          </p>
                        </div>
                        <Switch
                          checked={Boolean(criterion.required)}
                          onCheckedChange={(required) =>
                            updateCriterion(sectionDefinition.key, criterionIndex, { required })
                          }
                          disabled={locked}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        <div className="space-y-3 rounded-lg border p-4">
          <div>
            <h3 className="font-semibold">Aperçu de la fiche</h3>
            <p className="text-sm text-muted-foreground">
              Les colonnes ci-dessous seront utilisées pour les candidats de ce référentiel.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  {CANDIDATE_PREVIEW_COLUMNS.map((column) => (
                    <TableHead key={column} rowSpan={2} className="align-bottom">
                      {column}
                    </TableHead>
                  ))}
                  {SECTIONS.map((sectionDefinition) => {
                    const criteria = getPreviewCriteria(draft.sections[sectionDefinition.key])
                    return (
                      <TableHead
                        key={sectionDefinition.key}
                        colSpan={Math.max(criteria.length, 1)}
                        className="text-center"
                      >
                        {draft.sections[sectionDefinition.key]?.title || sectionDefinition.label}
                      </TableHead>
                    )
                  })}
                </TableRow>
                <TableRow>
                  {SECTIONS.flatMap((sectionDefinition) => {
                    const criteria = getPreviewCriteria(draft.sections[sectionDefinition.key])
                    if (criteria.length === 0) {
                      return [
                        <TableHead key={`${sectionDefinition.key}-empty`} className="text-center text-muted-foreground">
                          Aucun critère
                        </TableHead>,
                      ]
                    }
                    return criteria.map((criterion) => (
                      <TableHead key={`${sectionDefinition.key}-${criterion.key}`}>
                        {criterion.label}
                      </TableHead>
                    ))
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  {CANDIDATE_PREVIEW_COLUMNS.map((column) => (
                    <TableCell key={column} className="text-muted-foreground">
                      Exemple
                    </TableCell>
                  ))}
                  {SECTIONS.flatMap((sectionDefinition) => {
                    const criteria = getPreviewCriteria(draft.sections[sectionDefinition.key])
                    if (criteria.length === 0) {
                      return [
                        <TableCell key={`${sectionDefinition.key}-empty`} className="text-center text-muted-foreground">
                          -
                        </TableCell>,
                      ]
                    }
                    return criteria.map((criterion) => (
                      <TableCell key={`${sectionDefinition.key}-${criterion.key}`} className="text-muted-foreground">
                        {criterion.type === "checkbox" ? "Oui / Non" : criterion.type === "number" ? "Note" : "Texte"}
                      </TableCell>
                    ))
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onSave(draft)} disabled={submitting || locked}>
            Enregistrer les critères
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
