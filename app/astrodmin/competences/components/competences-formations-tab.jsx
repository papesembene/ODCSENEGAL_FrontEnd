import { Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function CompetencesFormationsTab({ formationData, handleManageCandidates }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {formationData.map((formation, index) => (
        <Card key={formation.id}>
          <CardHeader
            className={`${
              index % 5 === 0
                ? "bg-pink-50 dark:bg-pink-900/20"
                : index % 5 === 1
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : index % 5 === 2
                    ? "bg-green-50 dark:bg-green-900/20"
                    : index % 5 === 3
                      ? "bg-purple-50 dark:bg-purple-900/20"
                      : "bg-yellow-50 dark:bg-yellow-900/20"
            }`}
          >
            <CardTitle className="text-lg">{formation.name}</CardTitle>
            <CardDescription>
              <div className="mt-2 flex items-center justify-between">
                <span>{formation.total} candidature(s)</span>
                <Badge variant="outline">{formation.duration}</Badge>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="line-clamp-2 text-xs text-muted-foreground">{formation.description}</div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Candidatures</span>
                <span className="text-sm text-muted-foreground">{formation.total}</span>
              </div>
              <Progress value={Math.min((formation.total / 50) * 100, 100)} className="h-2" />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center justify-between rounded bg-pink-50 p-2 dark:bg-pink-900/20">
                  <span className="font-medium">Femmes:</span>
                  <span className="font-semibold text-pink-600 dark:text-pink-400">{formation.femmes}</span>
                </div>
                <div className="flex items-center justify-between rounded bg-blue-50 p-2 dark:bg-blue-900/20">
                  <span className="font-medium">Hommes:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{formation.hommes}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-xs">
                <div className="rounded bg-yellow-50 p-2 text-center dark:bg-yellow-900/20">
                  <div className="font-medium text-yellow-600 dark:text-yellow-400">{formation.enAttente}</div>
                  <div className="text-muted-foreground">En attente</div>
                </div>
                <div className="rounded bg-green-50 p-2 text-center dark:bg-green-900/20">
                  <div className="font-medium text-green-600 dark:text-green-400">{formation.acceptes}</div>
                  <div className="text-muted-foreground">Acceptés</div>
                </div>
                <div className="rounded bg-red-50 p-2 text-center dark:bg-red-900/20">
                  <div className="font-medium text-red-600 dark:text-red-400">{formation.refuses}</div>
                  <div className="text-muted-foreground">Refusés</div>
                </div>
              </div>
              <div className="pt-2">
                <Button className="w-full" onClick={() => handleManageCandidates(formation)} disabled={formation.total === 0}>
                  <Users className="mr-2 h-4 w-4" />
                  Gérer les candidats ({formation.total})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
