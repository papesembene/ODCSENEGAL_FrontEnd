import { RefreshCw, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CompetencesAutoGroupDialog({
  open,
  selectedFormationData,
  eligibleCandidates,
  assignedCandidateIds,
  groupSize,
  setGroupSize,
  creatingGroups,
  onClose,
  onCreate,
}) {
  if (!open || !selectedFormationData) return null

  const availableCandidates = eligibleCandidates.filter((candidate) => !assignedCandidateIds.includes(candidate.id))
  const totalGroups = groupSize > 0 ? Math.ceil(availableCandidates.length / groupSize) : 0
  const alreadyAssignedCount = assignedCandidateIds.filter((id) => eligibleCandidates.find((candidate) => candidate.id === id)).length

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold">Créer des groupes automatiquement</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {availableCandidates.length} candidat(s) disponible(s) pour {selectedFormationData.name}
            </p>
            {assignedCandidateIds.length > 0 ? (
              <p className="mt-1 text-xs text-orange-600">({alreadyAssignedCount} déjà assigné(s) à un groupe)</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="groupSize">Nombre de personnes par groupe</Label>
            <Input
              id="groupSize"
              type="number"
              min="1"
              max="1000"
              value={groupSize}
              onChange={(e) => {
                const value = e.target.value
                if (value === "" || value === null) {
                  setGroupSize("")
                } else {
                  setGroupSize(parseInt(value))
                }
              }}
              placeholder="Ex: 50"
            />
            <p className="text-xs text-muted-foreground">
              {groupSize > 0 ? `Nombre de groupes qui seront créés : ${totalGroups}` : "Entrez le nombre de personnes par groupe"}
            </p>
          </div>

          {groupSize > 0 && availableCandidates.length > 0 ? (
            <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
              <h4 className="mb-2 text-sm font-medium">Aperçu de la répartition :</h4>
              <div className="space-y-1 text-sm">
                {Array.from({ length: totalGroups }, (_, i) => {
                  const start = i * groupSize
                  const end = Math.min(start + groupSize, availableCandidates.length)
                  const count = end - start
                  return (
                    <div key={i} className="flex justify-between">
                      <span>
                        Groupe {i + 1}/{totalGroups}
                      </span>
                      <span className="font-medium">{count} candidat(s)</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              ⚠️ Chaque candidat sera assigné à un seul groupe. Une fois créés, les groupes apparaîtront dans Admin → Tests en ligne →
              Groupes.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={creatingGroups}>
              Annuler
            </Button>
            <Button
              onClick={onCreate}
              disabled={creatingGroups || groupSize < 1 || groupSize > 1000}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {creatingGroups ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  {groupSize > 0 ? `Créer ${totalGroups} groupe(s)` : "Créer les groupes"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
