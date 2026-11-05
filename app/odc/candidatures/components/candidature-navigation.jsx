import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CANDIDATURE_STEPS } from "../form-steps"

export default function CandidatureNavigation({ manager }) {
  const last = manager.step === CANDIDATURE_STEPS.length - 1
  return <div className="mt-5 flex items-center justify-between gap-3">
    <Button type="button" variant="outline" disabled={manager.step === 0 || manager.submitting}
      onClick={manager.previous} className="min-h-12 gap-2 border-gray-300 bg-white px-4 text-gray-700 sm:px-5">
      <ArrowLeft aria-hidden="true" className="h-4 w-4" />Précédent
    </Button>
    <Button type="submit" disabled={manager.catalog.phase !== "ready" || manager.submitting}
      aria-label={manager.submitting ? "Envoi en cours…" : last ? "Envoyer ma candidature" : "Suivant"}
      className="min-h-12 gap-2 bg-[#ff7900] px-4 text-white hover:bg-[#e66f00] sm:px-6">
      {manager.submitting ? <><Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /><span className="sm:hidden">Envoi…</span><span className="hidden sm:inline">Envoi en cours…</span></>
        : last ? <><span className="sm:hidden">Envoyer</span><span className="hidden sm:inline">Envoyer ma candidature</span><Send aria-hidden="true" className="h-4 w-4" /></>
          : <>Suivant<ArrowRight aria-hidden="true" className="h-4 w-4" /></>}
    </Button>
  </div>
}
