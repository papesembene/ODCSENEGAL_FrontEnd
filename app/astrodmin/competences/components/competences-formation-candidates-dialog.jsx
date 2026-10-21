import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CompetencesFormationCandidatesDialog({
  open,
  selectedFormationData,
  formationCandidates,
  eligibleCandidates,
  ineligibleCandidates,
  assignedCandidateIds,
  candidateToGroupMap,
  eligiblePage,
  setEligiblePage,
  eligibleItemsPerPage,
  setEligibleItemsPerPage,
  setShowAutoGroupDialog,
  onClose,
}) {
  if (!open || !selectedFormationData) return null

  const totalPages = Math.ceil(eligibleCandidates.length / eligibleItemsPerPage)
  const visibleEligibleCandidates = eligibleCandidates.slice((eligiblePage - 1) * eligibleItemsPerPage, eligiblePage * eligibleItemsPerPage)
  const unassignedEligibleCount = eligibleCandidates.filter((candidate) => !assignedCandidateIds.includes(candidate.id)).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="m-4 max-h-[90vh] w-full max-w-7xl overflow-auto rounded-lg bg-white shadow-lg dark:bg-gray-800">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{selectedFormationData.name}</h2>
              <p className="mt-1 text-muted-foreground">
                {formationCandidates.length} candidat(s) au total -
                <span className="ml-2 font-medium text-green-600">{eligibleCandidates.length} éligible(s) (&lt; 30 ans)</span> -
                <span className="ml-2 font-medium text-red-600">{ineligibleCandidates.length} inéligible(s) (≥ 30 ans)</span>
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <Tabs defaultValue="eligible" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="eligible">Éligibles pour les tests ({eligibleCandidates.length})</TabsTrigger>
              <TabsTrigger value="ineligible">Inéligibles ({ineligibleCandidates.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="eligible" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Candidats éligibles (moins de 30 ans)</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowAutoGroupDialog(true)}
                        variant="default"
                        className="bg-orange-600 hover:bg-orange-700"
                        disabled={unassignedEligibleCount === 0}
                      >
                        Créer groupes automatiquement
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {eligibleCandidates.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">Aucun candidat éligible</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Afficher</span>
                          <Select
                            value={eligibleItemsPerPage.toString()}
                            onValueChange={(value) => {
                              setEligibleItemsPerPage(parseInt(value))
                              setEligiblePage(1)
                            }}
                          >
                            <SelectTrigger className="w-[80px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="30">30</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                          </Select>
                          <span className="text-sm text-muted-foreground">par page</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{eligibleCandidates.length} candidat(s) au total</div>
                      </div>

                      <div className="overflow-x-auto rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nom</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Téléphone</TableHead>
                              <TableHead>Âge</TableHead>
                              <TableHead>Statut</TableHead>
                              <TableHead>Groupe assigné</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {visibleEligibleCandidates.map((candidate) => {
                              const isAssigned = assignedCandidateIds.includes(candidate.id)
                              const groupName = candidateToGroupMap[candidate.id]

                              return (
                                <TableRow key={candidate.id} className={isAssigned ? "bg-gray-50 opacity-70 dark:bg-gray-900/30" : ""}>
                                  <TableCell className="font-medium">
                                    {candidate.first_name} {candidate.last_name}
                                  </TableCell>
                                  <TableCell>{candidate.email}</TableCell>
                                  <TableCell>{candidate.phone}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                      {candidate.age} ans
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {candidate.status === "pending" ? <Badge variant="secondary">En attente</Badge> : null}
                                    {candidate.status === "accepted" ? <Badge className="bg-green-500">Accepté</Badge> : null}
                                    {candidate.status === "rejected" ? <Badge variant="destructive">Refusé</Badge> : null}
                                    {candidate.status === "interview" ? <Badge className="bg-blue-500">Entretien</Badge> : null}
                                  </TableCell>
                                  <TableCell>
                                    {isAssigned ? (
                                      <Badge className="bg-green-100 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">{groupName}</Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-xs text-gray-500">
                                        Non assigné
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Affichage de {Math.min((eligiblePage - 1) * eligibleItemsPerPage + 1, eligibleCandidates.length)} à{" "}
                          {Math.min(eligiblePage * eligibleItemsPerPage, eligibleCandidates.length)} sur {eligibleCandidates.length} candidats
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEligiblePage((prev) => Math.max(1, prev - 1))} disabled={eligiblePage === 1}>
                            Précédent
                          </Button>

                          <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter((page) => {
                                if (totalPages <= 7) return true
                                if (page === 1 || page === totalPages) return true
                                if (Math.abs(page - eligiblePage) <= 1) return true
                                if (page === eligiblePage - 2 || page === eligiblePage + 2) return "..."
                                return false
                              })
                              .map((page, index) => {
                                if (page === "...") {
                                  return (
                                    <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                                      ...
                                    </span>
                                  )
                                }

                                return (
                                  <Button
                                    key={page}
                                    variant={eligiblePage === page ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setEligiblePage(page)}
                                  >
                                    {page}
                                  </Button>
                                )
                              })}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEligiblePage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={eligiblePage >= totalPages}
                          >
                            Suivant
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ineligible" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Candidats inéligibles (30 ans ou plus)</CardTitle>
                  <CardDescription>Ces candidats ne sont pas éligibles pour passer les tests en ligne</CardDescription>
                </CardHeader>
                <CardContent>
                  {ineligibleCandidates.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">Aucun candidat inéligible</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Téléphone</TableHead>
                            <TableHead>Âge</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Raison</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ineligibleCandidates.map((candidate) => (
                            <TableRow key={candidate.id}>
                              <TableCell className="font-medium">
                                {candidate.first_name} {candidate.last_name}
                              </TableCell>
                              <TableCell>{candidate.email}</TableCell>
                              <TableCell>{candidate.phone}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-red-50 text-red-700">
                                  {candidate.age === "N/A" ? "Non renseigné" : `${candidate.age} ans`}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {candidate.status === "pending" ? <Badge variant="secondary">En attente</Badge> : null}
                                {candidate.status === "accepted" ? <Badge className="bg-green-500">Accepté</Badge> : null}
                                {candidate.status === "rejected" ? <Badge variant="destructive">Refusé</Badge> : null}
                                {candidate.status === "interview" ? <Badge className="bg-blue-500">Entretien</Badge> : null}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-red-600">{candidate.age === "N/A" ? "Date de naissance manquante" : "Âge ≥ 30 ans"}</span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
