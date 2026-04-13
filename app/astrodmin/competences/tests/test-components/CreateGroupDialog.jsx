import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { normalizeFormationName } from "../helpers"

export function CreateGroupDialog({
  open,
  onOpenChange,
  newGroup,
  setNewGroup,
  testsData,
  availableCandidates,
  assignedCandidateIds,
  candidateToGroupMap,
  selectedCandidatesForGroup,
  handleSelectCandidateForGroup,
  handleCreateGroup,
  setSelectedCandidatesForGroup,
  handleCancelCreateGroup,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un groupe de test</DialogTitle>
          <DialogDescription>Sélectionnez les candidats et définissez la date du test</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="groupName">Nom du groupe *</Label>
              <Input
                id="groupName"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                placeholder="Ex: Groupe Dev Web - Session 1"
              />
            </div>
            <div>
              <Label htmlFor="groupFormation">Formation *</Label>
              <Select
                value={newGroup.formation}
                onValueChange={(value) => {
                  setNewGroup({ ...newGroup, formation: value })
                  setSelectedCandidatesForGroup([])
                }}
              >
                <SelectTrigger id="groupFormation">
                  <SelectValue placeholder="Sélectionner une formation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dev Web">Dev Web</SelectItem>
                  <SelectItem value="Data">Data</SelectItem>
                  <SelectItem value="Hackeuse">Hackeuse</SelectItem>
                  <SelectItem value="AWS">AWS</SelectItem>
                  <SelectItem value="Design UX/UI">Design UX/UI</SelectItem>
                  <SelectItem value="Cyber security">Cyber security</SelectItem>
                  <SelectItem value="Intelligence Artificielle">Intelligence Artificielle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="groupDate">Date du test *</Label>
              <Input
                id="groupDate"
                type="date"
                value={newGroup.test_date}
                onChange={(e) => setNewGroup({ ...newGroup, test_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="groupTime">Heure *</Label>
              <Input
                id="groupTime"
                type="time"
                value={newGroup.test_time}
                onChange={(e) => setNewGroup({ ...newGroup, test_time: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="groupDuration">Durée (minutes)</Label>
              <Input
                id="groupDuration"
                type="number"
                value={newGroup.duration}
                onChange={(e) => setNewGroup({ ...newGroup, duration: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="groupTest">Test associé (optionnel)</Label>
              <Select
                value={newGroup.test_id || "none"}
                onValueChange={(value) => setNewGroup({ ...newGroup, test_id: value === "none" ? "" : value })}
              >
                <SelectTrigger id="groupTest">
                  <SelectValue placeholder="Sélectionner un test" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun test</SelectItem>
                  {testsData
                    .filter((test) => test.referentiel === newGroup.formation)
                    .map((test) => (
                      <SelectItem key={test.id} value={test.id}>
                        {test.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="groupLocation">Lieu</Label>
              <Input
                id="groupLocation"
                value={newGroup.location}
                onChange={(e) => setNewGroup({ ...newGroup, location: e.target.value })}
                placeholder="Ex: Salle A, En ligne, etc."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="groupInstructions">Instructions</Label>
            <Textarea
              id="groupInstructions"
              value={newGroup.instructions}
              onChange={(e) => setNewGroup({ ...newGroup, instructions: e.target.value })}
              placeholder="Instructions particulières pour le test..."
              rows={3}
            />
          </div>

          {newGroup.formation && (
            <div>
              <Label>Liste des candidats de la formation</Label>
              <div className="mt-2 border rounded-md p-4 max-h-[40vh] overflow-y-auto custom-scrollbar">
                {availableCandidates.filter((c) => normalizeFormationName(c.desired_training) === newGroup.formation).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun candidat trouvé pour cette formation
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availableCandidates
                      .filter((c) => normalizeFormationName(c.desired_training) === newGroup.formation)
                      .map((candidate) => {
                        const isAssigned = assignedCandidateIds.includes(candidate.id)
                        const isSelected = selectedCandidatesForGroup.includes(candidate.id)
                        const groupName = candidateToGroupMap[candidate.id]
                        return (
                          <div
                            key={candidate.id}
                            className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${
                              isAssigned
                                ? "bg-gray-50 dark:bg-gray-900/30 opacity-70 border-gray-200 dark:border-gray-800"
                                : isSelected
                                  ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                            }`}
                            onClick={() => !isAssigned && handleSelectCandidateForGroup(candidate.id)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm sm:text-base truncate">
                                {candidate.first_name} {candidate.last_name}
                              </div>
                              <div className="text-xs sm:text-sm text-muted-foreground truncate">{candidate.email}</div>
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              {isAssigned ? (
                                <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 whitespace-nowrap">
                                  {groupName}
                                </Badge>
                              ) : isSelected ? (
                                <Badge className="bg-blue-500">Sélectionné</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs text-gray-500 whitespace-nowrap">
                                  Non assigné
                                </Badge>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleCancelCreateGroup}
            >
              Annuler
            </Button>
            <Button onClick={handleCreateGroup}>
              <Plus className="mr-2 h-4 w-4" />
              Créer le groupe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
