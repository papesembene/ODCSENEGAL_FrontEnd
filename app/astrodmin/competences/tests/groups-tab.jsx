import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Eye, Mail, Trash } from "lucide-react"
import { GroupStatusBadge, PageSizeSelector, PaginationControls } from "./test-components"
import { normalizeFormationName } from "./helpers"

export function GroupsTab({
  testGroups,
  groupFormationFilter,
  setGroupFormationFilter,
  groupsItemsPerPage,
  setGroupsItemsPerPage,
  groupsPage,
  setGroupsPage,
  setShowCreateGroupDialog,
  handleViewGroupCandidates,
  handleOpenInvitationDialog,
  handleDeleteGroupClick,
}) {
  const filteredGroups = testGroups.filter((group) => 
    groupFormationFilter === "all" || normalizeFormationName(group.formation) === groupFormationFilter
  )

  return (
    <TabsContent value="groups" className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Groupes de tests</CardTitle>
              <CardDescription>Créez des groupes de candidats pour les tests en ligne</CardDescription>
            </div>
            <Button onClick={() => setShowCreateGroupDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer un groupe
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={groupFormationFilter} onValueChange={setGroupFormationFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Formation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les formations</SelectItem>
                <SelectItem value="Dev Web">Dev Web</SelectItem>
                <SelectItem value="Data">Data</SelectItem>
                <SelectItem value="Hackeuse">Hackeuse</SelectItem>
                <SelectItem value="AWS">AWS</SelectItem>
                <SelectItem value="Référent Digital">Référent Digital</SelectItem>
                <SelectItem value="Cyber security">Cyber security</SelectItem>
                <SelectItem value="Intelligence Artificielle">Intelligence Artificielle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mb-4">
            <PageSizeSelector
              value={groupsItemsPerPage}
              onChange={(value) => {
                setGroupsItemsPerPage(value)
                setGroupsPage(1)
              }}
            />
            <div className="text-sm text-muted-foreground">{filteredGroups.length} groupe(s) au total</div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom du groupe</TableHead>
                  <TableHead>Formation</TableHead>
                  <TableHead>Date du test</TableHead>
                  <TableHead>Candidats</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Aucun groupe créé</p>
                      <p className="text-xs text-muted-foreground mt-2">Créez un groupe pour organiser vos tests</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGroups.slice((groupsPage - 1) * groupsItemsPerPage, groupsPage * groupsItemsPerPage).map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{group.formation}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(group.test_date).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{group.candidate_count} candidat(s)</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <GroupStatusBadge status={group.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => handleViewGroupCandidates(group)} title="Voir les candidats">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {group.status === "pending" && (
                            <Button size="sm" variant="default" onClick={() => handleOpenInvitationDialog(group)}>
                              <Mail className="mr-2 h-4 w-4" />
                              Envoyer invitations
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteGroupClick(group)}>
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
            page={groupsPage}
            itemsPerPage={groupsItemsPerPage}
            totalItems={filteredGroups.length}
            itemLabel="groupes"
            onPageChange={setGroupsPage}
          />
        </CardContent>
      </Card>
    </TabsContent>
  )
}
