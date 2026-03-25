"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function CandidaturesFermeesPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="max-w-xl w-full text-center p-8">
        <CardContent className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
            <AlertTriangle className="h-7 w-7 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold">Les candidatures ne sont pas encore ouvertes</h1>
          <p className="text-gray-600">
            Merci pour votre intérêt. Les formulaires de candidature seront disponibles prochainement.
            Revenez bientôt ou suivez nos actualités pour être informé de l’ouverture.
          </p>
           <div className="flex gap-3 justify-center pt-2">
             <Button asChild variant="outline">
               <Link href="/">Retour à l'accueil</Link>
             </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  )
}


