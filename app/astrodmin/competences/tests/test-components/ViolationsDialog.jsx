import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function ViolationsDialog({
  open,
  onOpenChange,
  selectedResultViolations,
}) {
  if (!selectedResultViolations) return null

  const { result, violations } = selectedResultViolations

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Infractions détectées - {result?.candidate?.name || result?.candidateName}
          </DialogTitle>
          <DialogDescription>Historique des violations détectées pendant le test</DialogDescription>
        </DialogHeader>

        {violations && (
          <div className="space-y-6 py-4">
            {/* Résumé des infractions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Résumé des infractions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {violations.totalViolations || 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Total</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {violations.stats?.tab_switch || 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Changements onglet</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {violations.stats?.copy || 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Tentatives copie</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(violations.stats?.devtools || 0) + (violations.stats?.right_click || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Autres</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques détaillées */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Statistiques par type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { key: "tab_switch", label: "Changements d'onglet", icon: "🔄", color: "text-orange-600" },
                    { key: "blur", label: "Perte de focus", icon: "👁️", color: "text-red-600" },
                    { key: "copy", label: "Tentatives de copie", icon: "📋", color: "text-yellow-600" },
                    { key: "paste", label: "Tentatives de coller", icon: "📝", color: "text-yellow-600" },
                    { key: "right_click", label: "Clics droits", icon: "🖱️", color: "text-blue-600" },
                    { key: "devtools", label: "DevTools", icon: "🔧", color: "text-purple-600" },
                    { key: "reload", label: "Rechargements", icon: "⬜", color: "text-gray-600" },
                  ].map((stat) => (
                    <div key={stat.key} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{stat.icon}</span>
                        <span className="font-medium">{stat.label}</span>
                      </div>
                      <Badge variant="outline" className={stat.color}>
                        {violations.stats?.[stat.key] || 0}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Historique chronologique */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Historique chronologique ({violations.violations?.length || 0} événements)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {violations.violations && violations.violations.length > 0 ? (
                    violations.violations.map((violation, idx) => {
                      const typeLabels = {
                        tab_switch: { label: "Changement d'onglet", icon: "🔄", color: "bg-orange-100 text-orange-800" },
                        blur: { label: "Perte de focus", icon: "👁️", color: "bg-red-100 text-red-800" },
                        copy: { label: "Tentative de copie", icon: "📋", color: "bg-yellow-100 text-yellow-800" },
                        paste: { label: "Tentative de coller", icon: "📝", color: "bg-yellow-100 text-yellow-800" },
                        right_click: { label: "Clic droit", icon: "🖱️", color: "bg-blue-100 text-blue-800" },
                        devtools: { label: "DevTools", icon: "🔧", color: "bg-purple-100 text-purple-800" },
                        reload: { label: "Rechargement", icon: "⬜", color: "bg-gray-100 text-gray-800" },
                      }

                      const typeInfo = typeLabels[violation.violationType] || {
                        label: violation.violationType,
                        icon: "⚠️",
                        color: "bg-gray-100 text-gray-800",
                      }

                      const timestamp = violation.timestamp ? new Date(violation.timestamp).toLocaleString("fr-FR") : "N/A"
                      const elapsedTime = violation.elapsedTime
                        ? `${Math.floor(violation.elapsedTime / 60000)}:${String(Math.floor((violation.elapsedTime % 60000) / 1000)).padStart(2, "0")}`
                        : "N/A"

                      return (
                        <div key={idx} className="flex items-start space-x-3 p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                          <span className="text-2xl">{typeInfo.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                              <span className="text-xs text-muted-foreground">{timestamp}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{violation.message || "Aucun message"}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs">
                              <span>⏱️ Temps écoulé: <strong>{elapsedTime}</strong></span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center text-muted-foreground py-8">Aucune violation enregistrée</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
