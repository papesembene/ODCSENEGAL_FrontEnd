import { MoreHorizontal, Search } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PaginationControls } from "@/components/ui/data-pagination"

export default function CompetencesCandidatesTab({
  filteredCandidates,
  candidatesTotal,
  candidatesLoading,
  candidatesMainItemsPerPage,
  setCandidatesMainItemsPerPage,
  candidatesMainPage,
  setCandidatesMainPage,
  searchTerm,
  setSearchTerm,
  selectedFormation,
  setSelectedFormation,
  selectedStatus,
  setSelectedStatus,
  selectedGender,
  setSelectedGender,
  formationData,
  getGenderLabel,
  getStatusColor,
  getStatusLabel,
  viewCandidateDetails,
}) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Liste des candidats</CardTitle>
        <CardDescription>Gérez les candidatures et suivez leur statut</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Afficher</span>
            <Select
              value={candidatesMainItemsPerPage.toString()}
              onValueChange={(value) => {
                setCandidatesMainItemsPerPage(parseInt(value))
                setCandidatesMainPage(1)
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
          <div className="text-sm text-muted-foreground" aria-live="polite">{candidatesLoading ? "Chargement..." : `${candidatesTotal} candidat(s) au total`}</div>
        </div>

        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" aria-label="Rechercher un candidat" placeholder="Nom, email, téléphone ou nationalité" maxLength={200} className="w-full pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedFormation} onValueChange={setSelectedFormation}>
              <SelectTrigger className="w-full sm:w-[160px] md:w-[180px]">
                <SelectValue placeholder="Formation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les formations</SelectItem>
                {formationData.map((formation) => (
                  <SelectItem key={formation.id} value={formation.shortName}>
                    {formation.shortName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[160px] md:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="accepted">Accepté</SelectItem>
                <SelectItem value="rejected">Refusé</SelectItem>
                <SelectItem value="interview">Entretien</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedGender} onValueChange={setSelectedGender}>
              <SelectTrigger className="w-full sm:w-[160px] md:w-[180px]">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les genres</SelectItem>
                <SelectItem value="male">Homme</SelectItem>
                <SelectItem value="female">Femme</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border" aria-busy={candidatesLoading}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Formation</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidatesLoading ? (
                <TableRow><TableCell colSpan={7} className="py-4 text-center" role="status">Chargement des candidats...</TableCell></TableRow>
              ) : filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-4 text-center">
                    Aucun résultat pour les filtres sélectionnés
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate, index) => (
                  <TableRow key={candidate.id || index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {candidate.first_name?.[0] || "?"}
                            {candidate.last_name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {candidate.first_name} {candidate.last_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    <TableCell>{getGenderLabel(candidate.gender)}</TableCell>
                    <TableCell>{candidate.desired_training}</TableCell>
                    <TableCell>{candidate.application_date ? new Date(candidate.application_date).toLocaleDateString("fr-FR") : "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getStatusColor(candidate.status)} text-white`}>
                        {getStatusLabel(candidate.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => viewCandidateDetails(candidate)}>Voir les détails</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!candidatesLoading && !Number.isNaN(candidatesTotal) ? (
          <div className="mt-4">
            <PaginationControls page={candidatesMainPage} pageSize={candidatesMainItemsPerPage}
              totalItems={candidatesTotal} itemLabel="candidats" onPageChange={setCandidatesMainPage} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
