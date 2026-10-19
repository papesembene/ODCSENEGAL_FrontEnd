"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCriterionValue, getCriterionValue, getInterviewerDisplayName, setCriterionValue } from "../interview-helpers"

export function renderCriterionCell({
  canEdit,
  criterion,
  currentAdminName,
  drafts,
  evaluation,
  sectionKey,
  setDrafts,
}) {
  if (criterion.key === "interviewer") {
    return (
      <span className="block min-w-[150px] rounded-md border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground">
        {getInterviewerDisplayName(evaluation, sectionKey, canEdit, currentAdminName)}
      </span>
    )
  }

  const value = getCriterionValue(drafts, evaluation, sectionKey, criterion)

  if (!canEdit) {
    return <span className="text-sm text-muted-foreground">{formatCriterionValue(value, criterion)}</span>
  }

  if (criterion.type === "checkbox") {
    return (
      <div className="flex justify-center">
        <Checkbox
          checked={Boolean(value)}
          onCheckedChange={(checked) =>
            setCriterionValue(setDrafts, evaluation.id, sectionKey, criterion.key, Boolean(checked))
          }
        />
      </div>
    )
  }

  if (criterion.type === "select") {
    return (
      <Select
        value={value || "none"}
        onValueChange={(nextValue) =>
          setCriterionValue(setDrafts, evaluation.id, sectionKey, criterion.key, nextValue === "none" ? "" : nextValue)
        }
      >
        <SelectTrigger className="min-w-[160px]">
          <SelectValue placeholder="Choisir" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Non renseigné</SelectItem>
          {(criterion.options || []).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (criterion.type === "textarea") {
    return (
      <Textarea
        value={value}
        onChange={(event) => setCriterionValue(setDrafts, evaluation.id, sectionKey, criterion.key, event.target.value)}
        className="min-h-20 min-w-[220px]"
      />
    )
  }

  if (criterion.type === "computed") {
    return <span className="font-medium">{formatCriterionValue(value, criterion)}</span>
  }

  return (
    <Input
      type={criterion.type === "number" ? "number" : "text"}
      value={value}
      min={criterion.min}
      max={criterion.max}
      onChange={(event) => setCriterionValue(setDrafts, evaluation.id, sectionKey, criterion.key, event.target.value)}
      className="min-w-[140px]"
    />
  )
}
