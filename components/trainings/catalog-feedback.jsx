"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useTrainingCatalog } from "./training-catalog-provider"

export default function CatalogFeedback() {
  const catalog = useTrainingCatalog()
  if (catalog.phase === "error") return <Alert variant="destructive" role="alert">
    <AlertDescription>{catalog.error}
      <Button type="button" variant="outline" size="sm" className="ml-3" onClick={catalog.refresh}>Réessayer</Button>
    </AlertDescription>
  </Alert>
  if (catalog.phase !== "ready") return <p role="status" className="py-4 text-sm text-muted-foreground">Chargement des référentiels…</p>
  if (!catalog.items.length) return <p className="py-4 text-sm text-muted-foreground">Aucune formation publiée pour le moment.</p>
  return null
}
