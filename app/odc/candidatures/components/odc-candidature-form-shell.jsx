import Link from "@/components/ui/interactive-link"
import { ArrowLeft } from "lucide-react"
import CandidatureProgress from "./candidature-progress"

export default function OdcCandidatureFormShell({ children, manager }) {
  return <div className="bg-gray-50">
    <div className="container mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <Link href="/competences" className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#e66f00]">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />Retour aux formations
      </Link>
      <header className="mb-5 mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Déposer ma candidature</h1>
        <p className="mt-3 text-xs text-gray-500">Les champs marqués d'un <span className="font-semibold text-[#e66f00]">*</span> sont obligatoires.</p>
      </header>
      <form onSubmit={manager.submit} ref={manager.formRef} className="scroll-mt-28" noValidate>
        <CandidatureProgress manager={manager} />
        {children}
      </form>
    </div>
  </div>
}
