"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Une erreur est survenue</h2>
        <p className="text-gray-600 mb-6">
          Nous n'avons pas pu charger votre profil. Veuillez réessayer ou contacter le support si le problème persiste.
        </p>
        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Retour à l'accueil
          </Button>
          <Button onClick={() => reset()}>Réessayer</Button>
        </div>
      </div>
    </div>
  )
}
