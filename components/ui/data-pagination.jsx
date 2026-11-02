"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const PAGE_SIZE_OPTIONS = ["10", "25", "50", "100"]

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

export { PaginationControls } from "./pagination-controls"
