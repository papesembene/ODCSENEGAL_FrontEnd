import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Search, LinkIcon, Copy, ExternalLink, Edit, Trash } from "lucide-react"
import { PageSizeSelector, PaginationControls } from "./components"

export function TestsTab({
  searchTerm,
  setSearchTerm,
  testsItemsPerPage,
  setTestsItemsPerPage,
  setTestsPage,
  testsPage,
  filteredTests,
  handleCopyTestLink,
  handleOpenTest,
  handleEditTest,
  handleDeleteTestClick,
}) {
  return (
    <TabsContent value="tests" className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Liste des tests</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-8 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <PageSizeSelector
              value={testsItemsPerPage}
              onChange={(value) => {
                setTestsItemsPerPage(value)
                setTestsPage(1)
              }}
            />
            <div className="text-sm text-muted-foreground">{filteredTests.length} test(s) au total</div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Référentiel</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Aucun test trouvé</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTests.slice((testsPage - 1) * testsItemsPerPage, testsPage * testsItemsPerPage).map((test) => (
                    <TableRow key={test.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{test.title}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              <LinkIcon className="h-3 w-3 mr-1" />
                              /test/{test.id}
                            </Badge>
                            <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => handleCopyTestLink(test.id)} title="Copier le lien">
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => handleOpenTest(test.id)} title="Ouvrir dans un nouvel onglet">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{test.referentiel}</TableCell>
                      <TableCell>
                        {test.scheduledDate} à {test.scheduledTime}
                      </TableCell>
                      <TableCell>{test.duration} min</TableCell>
                      <TableCell>{test.totalQuestions || test.questions?.length || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditTest(test)} title="Modifier">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteTestClick(test)} title="Supprimer">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            page={testsPage}
            itemsPerPage={testsItemsPerPage}
            totalItems={filteredTests.length}
            itemLabel="tests"
            onPageChange={setTestsPage}
          />
        </CardContent>
      </Card>
    </TabsContent>
  )
}

