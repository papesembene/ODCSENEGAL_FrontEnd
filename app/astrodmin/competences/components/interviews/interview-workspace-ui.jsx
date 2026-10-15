import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageSizeSelector, PaginationControls } from "@/components/ui/data-pagination"
import { TableCell, TableRow } from "@/components/ui/table"
import { FINAL_STATUS_LABELS, INTERVIEW_PROGRESS_LABELS } from "./interview-presentation"

export function InterviewSelect({ id, label, value, onChange, options, placeholder, disabled }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id}><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

export function InterviewStats({ items }) {
  return (
    <dl className="grid shrink-0 grid-cols-2 divide-x divide-border overflow-hidden rounded-lg border bg-muted/20 sm:flex">
      {items.map(({ label, value }) => (
        <div key={label} className="min-w-0 flex-1 px-4 py-3">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="mt-1 text-xl font-semibold tabular-nums">{value || 0}</dd>
        </div>
      ))}
    </dl>
  )
}

export function InterviewFilters({ interviews, progress = false, children }) {
  const hasFilters = interviews.searchTerm || interviews.statusFilter !== "all"
    || (progress && (interviews.completionFilter !== "all" || interviews.progressFilter !== "all"))
  const resetFilters = () => {
    interviews.setSearchTerm("")
    interviews.setStatusFilter("all")
    if (progress) {
      interviews.setCompletionFilter("all")
      interviews.setProgressFilter("all")
    }
  }
  return (
    <div className="flex shrink-0 flex-col gap-3 rounded-lg border bg-muted/20 p-3">
      <div className={`grid gap-3 sm:grid-cols-2 ${progress ? "xl:grid-cols-[minmax(200px,1.5fr)_repeat(3,minmax(140px,1fr))]" : "xl:grid-cols-[minmax(200px,1.5fr)_1fr_1fr]"}`}>
        <div className="space-y-1.5">
          <Label htmlFor="interview-search" className="text-xs text-muted-foreground">Rechercher un candidat</Label>
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="interview-search" className="pl-9" value={interviews.searchTerm}
              onChange={(event) => interviews.setSearchTerm(event.target.value)} placeholder="Nom, email ou téléphone" />
          </div>
        </div>
        <InterviewSelect id="interview-status" label="Décision finale" value={interviews.statusFilter}
          onChange={interviews.setStatusFilter} options={[
            { value: "all", label: "Toutes les décisions" },
            ...Object.entries(FINAL_STATUS_LABELS).map(([value, label]) => ({ value, label })),
          ]} />
        {progress ? <>
          <InterviewSelect id="interview-completion" label="Évaluation" value={interviews.completionFilter}
            onChange={interviews.setCompletionFilter} options={[
              { value: "all", label: "Toutes les évaluations" }, { value: "complete", label: "Complètes" },
              { value: "incomplete", label: "Incomplètes" },
            ]} />
          <InterviewSelect id="interview-progress" label="Passage en entretien" value={interviews.progressFilter}
            onChange={interviews.setProgressFilter} options={[
              { value: "all", label: "Tous les passages" },
              ...Object.entries(INTERVIEW_PROGRESS_LABELS).map(([value, label]) => ({ value, label })),
            ]} />
        </> : children}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span aria-live="polite">{interviews.pagination.total} candidat(s) selon les filtres</span>
        {hasFilters ? <Button size="sm" variant="ghost" onClick={resetFilters} className="h-7 text-xs">
          <X className="mr-1 h-3 w-3" />Effacer les filtres
        </Button> : null}
      </div>
    </div>
  )
}

export function InterviewPagination({ interviews }) {
  return (
    <div className="flex shrink-0 flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <PageSizeSelector value={interviews.pageSize} onChange={(value) => {
        interviews.setPage(1)
        interviews.setPageSize(value)
      }} />
      <PaginationControls page={interviews.pagination.page} pageSize={interviews.pagination.page_size}
        totalItems={interviews.pagination.total} itemLabel="candidat(s)" onPageChange={interviews.setPage} />
    </div>
  )
}

export function InterviewTableMessage({ colSpan, loading, children }) {
  return <TableRow><TableCell colSpan={colSpan} className="h-40 text-center text-sm text-muted-foreground" role="status">
    {loading ? "Chargement des candidats…" : children}
  </TableCell></TableRow>
}
