import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function OdcCandidatureFormShell({ children, formRef, onSubmit }) {
  return (
    <div className="bg-[linear-gradient(180deg,_#fff9f4_0%,_#ffffff_22%)]">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm md:p-8">
            <Link href="/competences" className="inline-flex items-center text-sm font-medium text-[#ff7900] hover:text-[#e66f00]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
            <div className="mt-5">
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Déposer ma candidature</h1>
              <p className="mt-3 text-base text-gray-600">Complétez le formulaire ci-dessous pour postuler à une formation.</p>
            </div>
          </div>

          <Alert variant="destructive" className="border-red-300 bg-red-50 shadow-sm">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="font-bold text-red-800">
              Attention - une double inscription entraîne une exclusion immédiate.
            </AlertTitle>
            <AlertDescription className="text-red-700">
              Chaque candidat ne peut s’inscrire qu’une seule fois. Toute tentative de double candidature sera automatiquement détectée et
              éliminera votre dossier sans possibilité de recours. Vérifiez attentivement vos informations avant de valider votre
              inscription.
            </AlertDescription>
          </Alert>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg md:p-8">
            <form onSubmit={onSubmit} ref={formRef} className="space-y-8">
              {children}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
