"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const PAGE_SIZE_OPTIONS = ["10", "25", "50", "100"]

function getVisiblePages(totalPages, currentPage) {
  return Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => {
    if (totalPages <= 7) return true
    if (page === 1 || page === totalPages) return true
    return Math.abs(page - currentPage) <= 1
  })
}

export function PageSizeSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Afficher</span>
      <Select value={String(value)} onValueChange={(nextValue) => onChange(Number(nextValue))}>
        <SelectTrigger className="w-[82px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-sm text-muted-foreground">par page</span>
    </div>
  )
}

export function PaginationControls({ page, pageSize, totalItems, itemLabel, onPageChange }) {
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1)

  if (!totalItems) {
    return null
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {Math.min((page - 1) * pageSize + 1, totalItems)} à {Math.min(page * pageSize, totalItems)} sur{" "}
        {totalItems} {itemLabel}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Précédent
        </Button>
        {getVisiblePages(totalPages, page).map((visiblePage) => (
          <Button
            key={visiblePage}
            variant={page === visiblePage ? "default" : "outline"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(visiblePage)}
          >
            {visiblePage}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Suivant
        </Button>
      </div>
    </div>
  )
}
