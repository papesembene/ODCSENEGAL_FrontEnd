import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FORMATIONS } from "./constants"
import { PageSizeSelector, PaginationControls, ResultStatusBadge } from "./test-components"
import { Upload, Download, RefreshCw, List, LayoutGrid, FileText, Eye, AlertCircle, GraduationCap, UsersIcon, CheckCircle, XCircle, Clock } from "lucide-react"

export function ResultsTab({
  testResults,
  refreshing,
  setShowImportResultsDialog,
  handleExportResults,
  fetchResults,
  resultsReferentielFilter,
  setResultsReferentielFilter,
  resultsStatusFilter,
  setResultsStatusFilter,
  resultsView,
  setResultsView,
  resultsItemsPerPage,
  setResultsItemsPerPage,
  resultsPage,
  setResultsPage,
  filteredResults,
  selectedResults,
  handleSelectAllResults,
  handleSelectResult,
  calculatePoints,
  getViolationSeverityBadge,
  testViolations,
  handleViewDetails,
  handleViewViolations,
  groupedResults,
}) {
  return (
    <TabsContent value="results" className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col space-y-4">
          <div className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Résultats des tests</CardTitle>
              <CardDescription>
                Consultez et gérez les résultats des candidats ({testResults.length} résultat
                {testResults.length > 1 ? "s" : ""})
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowImportResultsDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Importer
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExportResults("csv")}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button variant="outline" size="sm" onClick={fetchResults} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </div>
          </div>

          <div className="flex flex-row justify-between items-center gap-2">
            <div className="flex flex-row gap-2">
              <Select value={resultsReferentielFilter} onValueChange={setResultsReferentielFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Formation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les formations</SelectItem>
                  {FORMATIONS.map((formation) => (
                    <SelectItem key={formation} value={formation}>
                      {formation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={resultsStatusFilter} onValueChange={setResultsStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="admis">Passe en entretien</SelectItem>
                  <SelectItem value="rejeté">Rejeté</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 border rounded-md p-1">
              <Button variant={resultsView === "list" ? "default" : "ghost"} size="sm" onClick={() => setResultsView("list")}>
                <List className="h-4 w-4 mr-2" />
                Liste
              </Button>
              <Button variant={resultsView === "grouped" ? "default" : "ghost"} size="sm" onClick={() => setResultsView("grouped")}>
                <LayoutGrid className="h-4 w-4 mr-2" />
                Par Formation/Groupe
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {resultsView === "list" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <PageSizeSelector
                  value={resultsItemsPerPage}
                  onChange={(value) => {
                    setResultsItemsPerPage(value)
                    setResultsPage(1)
                  }}
                />
                <div className="text-sm text-muted-foreground">{filteredResults.length} résultat(s) au total</div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedResults.length === filteredResults.length && filteredResults.length > 0}
                          onCheckedChange={handleSelectAllResults}
                        />
                      </TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Test</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Infractions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">
                            {testResults.length === 0 ? "Aucun résultat disponible" : "Aucun résultat ne correspond aux filtres"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {testResults.length === 0
                              ? "Les résultats des tests effectués par les candidats apparaîtront ici"
                              : "Essayez de modifier les filtres pour voir plus de résultats"}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredResults.slice((resultsPage - 1) * resultsItemsPerPage, resultsPage * resultsItemsPerPage).map((result) => {
                        const candidateName = result.candidate?.name || result.candidateName || "N/A"
                        const candidateEmail = result.candidate?.email || result.candidateEmail || "N/A"
                        const status = result.status || "pending"
                        const points = calculatePoints(result)
                        const displayStatus = status === "admis" ? "selected" : status === "rejeté" ? "not_selected" : status

                        return (
                          <TableRow key={result.id}>
                            <TableCell className="w-12">
                              <Checkbox checked={selectedResults.includes(result.id)} onCheckedChange={() => handleSelectResult(result.id)} />
                            </TableCell>
                            <TableCell className="font-medium">{candidateName}</TableCell>
                            <TableCell className="text-sm">{candidateEmail}</TableCell>
                            <TableCell className="text-sm">{result.testTitle}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">{points.obtained}/{points.total} pts</span>
                                <Progress value={points.total > 0 ? (points.obtained / points.total) * 100 : 0} className="w-16" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-sm">{points.obtained}/{points.total}</span>
                            </TableCell>
                            <TableCell><ResultStatusBadge status={displayStatus} /></TableCell>
                            <TableCell className="text-sm">
                              {result.submittedDate || new Date(result.completedAt).toLocaleDateString("fr-FR")}
                            </TableCell>
                            <TableCell>{getViolationSeverityBadge(testViolations[result.id])}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button variant="outline" size="sm" onClick={() => handleViewDetails(result)} title="Voir les réponses détaillées">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {testViolations[result.id] && testViolations[result.id].violations?.length > 0 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewViolations(result)}
                                    title="Voir les infractions"
                                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                                  >
                                    <AlertCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              <PaginationControls
                page={resultsPage}
                itemsPerPage={resultsItemsPerPage}
                totalItems={filteredResults.length}
                itemLabel="résultats"
                onPageChange={setResultsPage}
              />
            </>
          )}

          {resultsView === "grouped" && (
            <div className="space-y-6">
              {groupedResults().length === 0 ? (
                <div className="text-center py-12">
                  <LayoutGrid className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun résultat à afficher</h3>
                  <p className="text-muted-foreground">
                    {testResults.length === 0
                      ? "Les résultats des tests apparaîtront ici groupés par formation"
                      : "Aucun résultat ne correspond aux filtres sélectionnés"}
                  </p>
                </div>
              ) : (
                groupedResults().map((formationGroup, index) => (
                  <Card key={index} className="border-2">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-500 rounded-lg">
                            <GraduationCap className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{formationGroup.formation}</CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {formationGroup.totalResults} résultat{formationGroup.totalResults > 1 ? "s" : ""} •{" "}
                              {Object.keys(formationGroup.groups).length} groupe
                              {Object.keys(formationGroup.groups).length > 1 ? "s" : ""}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {formationGroup.admis} Passe en entretien
                          </Badge>
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                            <XCircle className="h-3 w-3 mr-1" />
                            {formationGroup.rejected} Rejetés
                          </Badge>
                          {formationGroup.pending > 0 && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              <Clock className="h-3 w-3 mr-1" />
                              {formationGroup.pending} En attente
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {Object.values(formationGroup.groups).map((group, groupIndex) => (
                          <Card key={groupIndex} className="border">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <UsersIcon className="h-5 w-5 text-orange-500" />
                                  <CardTitle className="text-base">{group.groupName}</CardTitle>
                                  <Badge variant="outline">
                                    {group.results.length} candidat{group.results.length > 1 ? "s" : ""}
                                  </Badge>
                                </div>
                                <div className="flex space-x-2">
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20">{group.admis} ✓</Badge>
                                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20">{group.rejected} ✗</Badge>
                                  {group.pending > 0 && (
                                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20">{group.pending} ⏱</Badge>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Points</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Violations</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {group.results.map((result) => {
                                    const candidateName = result.candidate?.name || result.candidateName || "N/A"
                                    const candidateEmail = result.candidate?.email || result.candidateEmail || "N/A"
                                    const status = result.status || "pending"
                                    const points = calculatePoints(result)
                                    const displayStatus = status === "admis" ? "selected" : status === "rejeté" ? "not_selected" : status

                                    return (
                                      <TableRow key={result.id}>
                                        <TableCell className="font-medium">{candidateName}</TableCell>
                                        <TableCell className="text-sm">{candidateEmail}</TableCell>
                                        <TableCell>
                                          <div className="flex items-center space-x-2">
                                            <span className="font-semibold">{points.obtained}/{points.total} pts</span>
                                            <Progress value={points.total > 0 ? (points.obtained / points.total) * 100 : 0} className="w-16" />
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <span className="font-medium text-sm">{points.obtained}/{points.total}</span>
                                        </TableCell>
                                        <TableCell><ResultStatusBadge status={displayStatus} /></TableCell>
                                        <TableCell className="text-sm">
                                          {result.submittedDate || new Date(result.completedAt).toLocaleDateString("fr-FR")}
                                        </TableCell>
                                        <TableCell>{getViolationSeverityBadge(testViolations[result.id])}</TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex justify-end space-x-1">
                                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(result)} title="Voir les réponses détaillées">
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                            {testViolations[result.id] && testViolations[result.id].violations?.length > 0 && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewViolations(result)}
                                                title="Voir les infractions"
                                                className="border-orange-300 text-orange-700 hover:bg-orange-50"
                                              >
                                                <AlertCircle className="h-4 w-4" />
                                              </Button>
                                            )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    )
                                  })}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  )
}
