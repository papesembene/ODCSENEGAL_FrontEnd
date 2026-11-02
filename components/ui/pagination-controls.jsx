"use client"

import { Button } from "@/components/ui/button"

function getVisiblePages(totalPages, currentPage) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)
  return [...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])]
    .filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b)
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
