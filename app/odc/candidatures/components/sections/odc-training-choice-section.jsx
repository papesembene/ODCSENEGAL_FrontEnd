import { useState } from "react"
import { BookOpen, ChevronLeft, ChevronRight, Clock, MapPin, Search } from "lucide-react"
import { trainingToken } from "@/lib/training-catalog"
import CandidatureSection from "../candidature-section"
import CandidatureChoiceCard from "../candidature-choice-card"
import styles from "../candidature-choices.module.css"

export default function OdcTrainingChoiceSection({ manager }) {
  const { formations, selectedSite } = manager
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const filtered = formations.filter((item) => trainingToken(item.title).includes(trainingToken(search)))
  const pages = Math.max(1, Math.ceil(filtered.length / 4))
  const current = Math.min(page, pages)
  return <CandidatureSection id="choix-formation" title="Quelle formation vous inspire ?" icon={BookOpen}
    description="Choisissez une formation parmi celles proposées sur votre site.">
    <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-4 py-3 text-sm">
      <span className="flex items-center gap-2 font-semibold"><MapPin aria-hidden="true" size={16} />{selectedSite?.name}</span>
      <button type="button" onClick={() => manager.returnTo(0)} className="text-sm underline underline-offset-4">Changer de site</button>
    </div>
    {formations.length > 4 && <label className="mt-4 flex items-center gap-2 rounded-lg border px-3"><Search aria-hidden="true" size={17} />
      <span className="sr-only">Rechercher une formation</span><input type="search" value={search} maxLength={120}
        onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Rechercher une formation" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" />
    </label>}
    <fieldset className="min-w-0 border-0 p-0"><legend className="sr-only">Formation souhaitée</legend>
      <div className={`${styles.choices} ${styles.courses}`}>{filtered.slice((current - 1) * 4, current * 4).map((item, index) =>
        <CandidatureChoiceCard key={item.code} manager={manager} name="formation" value={item.code} title={item.title} icon={BookOpen} index={index}>
          <span className="mb-2 flex items-center gap-1.5 font-medium"><Clock aria-hidden="true" size={13} />{item.duration}</span>
          <span className="line-clamp-2">{item.level || item.description}</span>
          {item.femaleOnly && <span className="mt-2 block font-medium">Formation réservée aux femmes</span>}
        </CandidatureChoiceCard>)}</div>
    </fieldset>
    {manager.errors.formation && <p id="formation-error" className="mt-3 text-sm text-red-700">{manager.errors.formation}</p>}
    {!filtered.length && <p role="status" className="mt-4 text-sm text-gray-600">Aucune formation ne correspond à votre sélection.</p>}
    {pages > 1 && <nav aria-label="Pages de formations" className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"><span>{filtered.length} formations · {current} / {pages}</span>
      <div className="flex gap-3"><button type="button" aria-label="Formations précédentes" disabled={current === 1} onClick={() => setPage(current - 1)} className="flex h-11 w-11 items-center justify-center rounded border disabled:opacity-40"><ChevronLeft aria-hidden="true" size={17} /></button>
        <button type="button" aria-label="Formations suivantes" disabled={current === pages} onClick={() => setPage(current + 1)} className="flex h-11 w-11 items-center justify-center rounded border disabled:opacity-40"><ChevronRight aria-hidden="true" size={17} /></button></div></nav>}
  </CandidatureSection>
}
