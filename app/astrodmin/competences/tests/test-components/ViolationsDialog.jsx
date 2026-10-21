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
import {
  AlertTriangle,
  Clock3,
  Copy,
  EyeOff,
  Keyboard,
  MonitorCog,
  MousePointerClick,
  RefreshCcw,
  ScanSearch,
  ClipboardPaste,
} from "lucide-react"

const VIOLATION_TYPES = {
  tab_switch: { label: "Changement d'onglet", icon: ScanSearch, color: "text-orange-600", badgeClassName: "bg-orange-100 text-orange-800" },
  blur: { label: "Perte de focus", icon: EyeOff, color: "text-red-600", badgeClassName: "bg-red-100 text-red-800" },
  copy: { label: "Tentative de copie", icon: Copy, color: "text-yellow-600", badgeClassName: "bg-yellow-100 text-yellow-800" },
  paste: { label: "Tentative de collage", icon: ClipboardPaste, color: "text-yellow-600", badgeClassName: "bg-yellow-100 text-yellow-800" },
  keyboard_shortcut: { label: "Raccourci clavier", icon: Keyboard, color: "text-amber-600", badgeClassName: "bg-amber-100 text-amber-800" },
  right_click: { label: "Clic droit", icon: MousePointerClick, color: "text-blue-600", badgeClassName: "bg-blue-100 text-blue-800" },
  devtools: { label: "Outils de développement", icon: MonitorCog, color: "text-purple-600", badgeClassName: "bg-purple-100 text-purple-800" },
  reload: { label: "Rechargement", icon: RefreshCcw, color: "text-gray-600", badgeClassName: "bg-gray-100 text-gray-800" },
}

function normalizeViolationType(violation) {
  const type = violation?.violationType
  const message = (violation?.message || "").toLowerCase()

  if (type !== "keyboard_shortcut") {
    return type
  }

  if (message.includes("ctrl+c")) {
    return "copy"
  }

  if (message.includes("ctrl+v")) {
    return "paste"
  }

  return "keyboard_shortcut"
}

function buildViolationCounters(violations) {
  const baseCounters = {
    tab_switch: 0,
    blur: 0,
    copy: 0,
    paste: 0,
    keyboard_shortcut: 0,
    right_click: 0,
    devtools: 0,
    reload: 0,
  }

  const stats = violations?.stats || {}
  const history = Array.isArray(violations?.violations) ? violations.violations : []
  const counters = { ...baseCounters }

  if (history.length > 0) {
    for (const violation of history) {
      const type = normalizeViolationType(violation)
      if (!type || !(type in counters)) {
        continue
      }

      counters[type] += 1
    }
  } else {
    for (const [key, value] of Object.entries(stats)) {
      if (!(key in counters)) {
        continue
      }

      counters[key] = Number(value) || 0
    }
  }

  const totalViolations = Number(violations?.totalViolations) || history.length
  const otherCount = counters.right_click + counters.devtools + counters.keyboard_shortcut + counters.reload

  return {
    counters,
    otherCount,
    totalViolations,
  }
}

export function ViolationsDialog({
  open,
  onOpenChange,
  selectedResultViolations,
}) {
  if (!selectedResultViolations) return null

  const { result, violations } = selectedResultViolations
  const { counters, otherCount, totalViolations } = buildViolationCounters(violations)

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
                      {totalViolations}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Total</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {counters.tab_switch}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Changements onglet</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {counters.copy}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Tentatives copie</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {otherCount}
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
                    { key: "tab_switch", label: "Changements d'onglet" },
                    { key: "blur", label: "Perte de focus" },
                    { key: "copy", label: "Tentatives de copie" },
                    { key: "paste", label: "Tentatives de collage" },
                    { key: "keyboard_shortcut", label: "Raccourcis clavier" },
                    { key: "right_click", label: "Clics droits" },
                    { key: "devtools", label: "Outils de développement" },
                    { key: "reload", label: "Rechargements" },
                  ].map((stat) => {
                    const statConfig = VIOLATION_TYPES[stat.key]
                    const StatIcon = statConfig?.icon || ScanSearch

                    return (
                      <div key={stat.key} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <StatIcon className={`h-5 w-5 ${statConfig?.color || "text-gray-600"}`} />
                          <span className="font-medium">{stat.label}</span>
                        </div>
                        <Badge variant="outline" className={statConfig?.color}>
                          {counters[stat.key] || 0}
                        </Badge>
                      </div>
                    )
                  })}
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
                      const normalizedType = normalizeViolationType(violation)
                      const typeInfo = VIOLATION_TYPES[normalizedType] || {
                        label: normalizedType || violation.violationType,
                        icon: AlertTriangle,
                        badgeClassName: "bg-gray-100 text-gray-800",
                      }
                      const TypeIcon = typeInfo.icon

                      const timestamp = violation.timestamp ? new Date(violation.timestamp).toLocaleString("fr-FR") : "N/A"
                      const elapsedTime = violation.elapsedTime
                        ? `${Math.floor(violation.elapsedTime / 60000)}:${String(Math.floor((violation.elapsedTime % 60000) / 1000)).padStart(2, "0")}`
                        : "N/A"

                      return (
                        <div key={idx} className="flex items-start space-x-3 p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TypeIcon className="h-6 w-6 shrink-0 text-gray-700 dark:text-gray-200" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={typeInfo.badgeClassName}>{typeInfo.label}</Badge>
                              <span className="text-xs text-muted-foreground">{timestamp}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{violation.message || "Aucun message"}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs">
                              <span className="inline-flex items-center gap-1">
                                <Clock3 className="h-3.5 w-3.5" />
                                Temps écoulé: <strong>{elapsedTime}</strong>
                              </span>
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
