"use client"

import { useId, useRef, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { PUBLIC_TRAININGS_PAGE_SIZE, publicTrainingPage } from "@/lib/training-catalog"
import CatalogFeedback from "./catalog-feedback"
import TrainingCards from "./training-cards"
import { useTrainingCatalog } from "./training-catalog-provider"

export default function PublicTrainingCatalog({ items, onSelect }) {
  const { phase } = useTrainingCatalog()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const searchId = useId()
  const top = useRef(null)
  const results = useRef(null)
  const visible = publicTrainingPage(items, { search, page })

  function changePage(next) {
    setPage(next)
    results.current?.focus({ preventScroll: true })
    top.current?.scrollIntoView({ block: "start", behavior:
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
  }

  return <div ref={top} className="scroll-mt-28" data-public-training-catalog>
    <CatalogFeedback />
    {(phase === "ready" || items.length > 0) && <>
      <div role="search" aria-label="Recherche dans les formations" className="mx-auto mt-8 max-w-lg space-y-2">
        <Label htmlFor={searchId}>Rechercher une formation</Label>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input id={searchId} type="search" maxLength={200} className="pl-9" placeholder="Nom de la formation…"
            value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} />
        </div>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {visible.total} formation(s). Page {visible.page} sur {visible.pages}.
      </p>
      <div ref={results} tabIndex={-1} role="group" aria-label="Formations proposées" className="focus:outline-none">
        {visible.total > 0 ? <TrainingCards items={visible.items} onSelect={onSelect} />
          : search.trim() && <p className="py-12 text-center text-gray-600">Aucune formation ne correspond à votre recherche.</p>}
      </div>
      {visible.total > 0 && <nav aria-label="Pagination des formations" className="mt-8">
        <PaginationControls page={visible.page} pageSize={PUBLIC_TRAININGS_PAGE_SIZE}
          totalItems={visible.total} itemLabel="formation(s)" onPageChange={changePage} />
      </nav>}
    </>}
  </div>
}
