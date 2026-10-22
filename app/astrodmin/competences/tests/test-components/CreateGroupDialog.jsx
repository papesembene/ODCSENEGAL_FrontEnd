import { useEffect, useState } from "react"
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
import { Plus, Search, Users } from "lucide-react"
import { FORMATION_OPTIONS } from "../constants"
import { normalizeFormationName } from "../helpers"
import { PaginationControls } from "./CommonComponents"

function parseNumberInput(value, fallback) {
  if (value === "") {
    return fallback
  }

  const parsedValue = Number.parseInt(value, 10)
  return Number.isNaN(parsedValue) ? fallback : parsedValue
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  newGroup,
  setNewGroup,
  testsData,
  availableCandidates,
  availableCandidatesTotal = 0,
  selectedCandidatesForGroup,
  fetchAvailableCandidates,
  handleSelectCandidateForGroup,
  handleCreateGroup,
  setSelectedCandidatesForGroup,
  handleCancelCreateGroup,
}) {
  const [candidateSearch, setCandidateSearch] = useState("")
  const [candidatePage, setCandidatePage] = useState(1)
  const [candidatesLoading, setCandidatesLoading] = useState(false)
  const [candidatesError, setCandidatesError] = useState("")
  const [candidateRevision, setCandidateRevision] = useState(0)
  const matchingTests = testsData.filter((test) => normalizeFormationName(test.referentiel) === newGroup.formation)
  const availableCandidatesForFormation = availableCandidates
  // Availability and search are authoritative on the server, including rescheduled sessions.
  const filteredCandidates = candidatesLoading || candidatesError ? [] : availableCandidatesForFormation

  const selectableCandidateIds = filteredCandidates.map((candidate) => candidate.id)

  const selectedVisibleCount = selectableCandidateIds.filter((candidateId) =>
    selectedCandidatesForGroup.includes(candidateId),
  ).length

  useEffect(() => {
    if (!open || !newGroup.formation) {
      return
    }

    const controller = new AbortController()
    let active = true
    setCandidatesLoading(true)
    setCandidatesError("")
    const timeout = window.setTimeout(() => controller.abort(), 30000)
    const timer = window.setTimeout(async () => {
      const success = await fetchAvailableCandidates?.({
        formation: newGroup.formation, search: candidateSearch,
        page: candidatePage, perPage: 50, signal: controller.signal,
      })
      if (active) {
        setCandidatesLoading(false)
        setCandidatesError(success ? "" : "Impossible de charger les candidats. Reessayez.")
      }
      window.clearTimeout(timeout)
    }, 250)

    return () => { active = false; controller.abort(); window.clearTimeout(timer); window.clearTimeout(timeout) }
  }, [candidateSearch, candidatePage, candidateRevision, fetchAvailableCandidates, newGroup.formation, open])

  const handleSelectVisibleCandidates = () => {
    setSelectedCandidatesForGroup((previous) => Array.from(new Set([...previous, ...selectableCandidateIds])))
  }

  const handleClearVisibleCandidates = () => {
    setSelectedCandidatesForGroup((previous) =>
      previous.filter((candidateId) => !selectableCandidateIds.includes(candidateId)),
    )
  }

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
                  setCandidatePage(1)
                }}
              >
                <SelectTrigger id="groupFormation">
                  <SelectValue placeholder="Sélectionner une formation" />
                </SelectTrigger>
                <SelectContent>
                  {FORMATION_OPTIONS.map((formation) => (
                    <SelectItem key={formation.value} value={formation.value}>
                      {formation.label}
                    </SelectItem>
                  ))}
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
                onChange={(e) => setNewGroup({ ...newGroup, duration: parseNumberInput(e.target.value, 60) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="groupTest">Test associé (optionnel)</Label>
              {newGroup.formation ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {matchingTests.length > 0
                    ? `${matchingTests.length} test(s) disponible(s) pour la formation ${newGroup.formation}`
                    : `Aucun test ne correspond encore à la formation ${newGroup.formation}`}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Choisissez d'abord une formation pour voir les tests compatibles.
                </p>
              )}
              <Select
                value={newGroup.test_id || "none"}
                onValueChange={(value) => setNewGroup({ ...newGroup, test_id: value === "none" ? "" : value })}
              >
                <SelectTrigger id="groupTest">
                  <SelectValue placeholder="Sélectionner un test" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun test</SelectItem>
                  {matchingTests.map((test) => (
                      <SelectItem key={test.id} value={test.id}>
                        {test.title} - {test.scheduledDate || "date non définie"}
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
              <div className="mt-2 space-y-3 rounded-md border p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="relative w-full md:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={candidateSearch}
                      type="search"
                      aria-label="Rechercher un candidat pour le groupe"
                      maxLength={200}
                      onChange={(e) => { setCandidateSearch(e.target.value); setCandidatePage(1) }}
                      placeholder="Nom, email ou téléphone"
                      className="pl-9"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleSelectVisibleCandidates} disabled={selectableCandidateIds.length === 0}>
                      <Users className="mr-2 h-4 w-4" />
                      Sélectionner visibles
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleClearVisibleCandidates} disabled={selectedVisibleCount === 0}>
                      Tout retirer
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{filteredCandidates.length} affiché(s)</Badge>
                  <Badge variant="outline">{availableCandidatesTotal} disponible(s) trouvé(s)</Badge>
                  <Badge variant="outline">{selectedCandidatesForGroup.length} sélectionné(s)</Badge>
                </div>
              </div>
              {candidatesError ? <div role="alert" className="mt-2 text-sm text-red-700">{candidatesError} <Button type="button" variant="outline" size="sm" onClick={() => setCandidateRevision((value) => value + 1)}>Réessayer</Button></div> : null}
              <div className="mt-2 border rounded-md p-4 max-h-[40vh] overflow-y-auto custom-scrollbar">
                {candidatesLoading ? <p role="status" className="py-4 text-center text-sm text-muted-foreground">Chargement des candidats...</p> : availableCandidatesForFormation.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun candidat trouvé pour cette formation
                  </p>
                ) : filteredCandidates.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun candidat ne correspond à votre recherche
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredCandidates.map((candidate) => {
                        const isSelected = selectedCandidatesForGroup.includes(candidate.id)
                        return (
                          <div
                            key={candidate.id}
                            className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${
                              isSelected
                                  ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                            }`}
                            onClick={() => handleSelectCandidateForGroup(candidate.id)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm sm:text-base truncate">
                                {candidate.first_name} {candidate.last_name}
                              </div>
                              <div className="text-xs sm:text-sm text-muted-foreground truncate">{candidate.email}</div>
                            </div>
                            <div className="shrink-0 ml-2">
                              {isSelected ? (
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
              <PaginationControls page={candidatePage} itemsPerPage={50} totalItems={availableCandidatesTotal}
                itemLabel="candidat(s)" onPageChange={setCandidatePage} disabled={candidatesLoading} />
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
