"use client"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AlertCircle, Building, Download, Edit, Eye, Plus, Search, Trash } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AdminGhostActionButton,
  ChartContainer,
  FilterSelect,
  ProgramCalendarItem,
  ProgramCard,
  SummaryCard,
} from "./admin-startups-shared"
import {
  getProgramLabel,
  getStatusColor,
  getStatusLabel,
  PROGRAM_CALENDAR_ITEMS,
  PROGRAM_COLORS,
  SUCCESS_RATE_DATA,
  UPCOMING_EVENTS,
  YEAR_OPTIONS,
} from "./admin-startups-utils"

export function AdminStartupsError({ error }) {
  if (!error) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>Erreur lors du chargement des données: {error}</AlertDescription>
    </Alert>
  )
}

export function AdminStartupsOverview({
  dailyApplicationsData,
  onNavigateToCoworking,
  programDistributionData,
  startupsData,
  stats,
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
        <SummaryCard
          title="Total Startups"
          value={stats.totalStartups}
          description={`Dernière mise à jour: ${new Date().toLocaleTimeString()}`}
          progressClassName="bg-blue-500"
          progressValue={75}
        />
        <SummaryCard
          title="Orange Fab"
          value={stats.orangeFabStartups}
          description={`${stats.totalStartups > 0 ? Math.round((stats.orangeFabStartups / stats.totalStartups) * 100) : 0}% du total`}
          progressClassName="bg-orange-500"
          progressValue={stats.totalStartups > 0 ? (stats.orangeFabStartups / stats.totalStartups) * 100 : 0}
        />
        <SummaryCard
          title="Startup Lab"
          value={stats.startupLabStartups}
          description={`${stats.totalStartups > 0 ? Math.round((stats.startupLabStartups / stats.totalStartups) * 100) : 0}% du total`}
          progressClassName="bg-indigo-500"
          progressValue={stats.totalStartups > 0 ? (stats.startupLabStartups / stats.totalStartups) * 100 : 0}
        />
        <SummaryCard
          title="Startups Actives"
          value={stats.acceptedStartups}
          description={`Sur ${stats.totalStartups} candidatures`}
          progressClassName="bg-green-500"
          progressValue={stats.totalStartups > 0 ? (stats.acceptedStartups / stats.totalStartups) * 100 : 0}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Candidatures Quotidiennes</CardTitle>
            <CardDescription>Nombre de candidatures reçues par jour</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer>
              <BarChart data={dailyApplicationsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" fill="#3B82F6" name="Candidatures" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par Programme</CardTitle>
            <CardDescription>Distribution des startups par programme d&apos;accompagnement</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer>
              <PieChart>
                <Pie
                  data={programDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {programDistributionData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={onNavigateToCoworking}>
              <Building className="mr-2 h-4 w-4" />
              Gérer les espaces coworking
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une startup
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Planifier un événement
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Candidatures Récentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {startupsData.slice(0, 3).map((startup, index) => (
              <div key={startup.id || index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{startup.startup_name || "Nom non défini"}</p>
                  <p className="text-xs text-muted-foreground">{getProgramLabel(startup.program)}</p>
                </div>
                <Badge className={getStatusColor(startup.status || "pending")}>
                  {getStatusLabel(startup.status || "En attente")}
                </Badge>
              </div>
            ))}
            {startupsData.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune candidature récente</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Événements à Venir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {UPCOMING_EVENTS.map((event) => (
              <div key={event.title}>
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground">{event.date}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function AdminStartupsList({
  filteredStartups,
  onExport,
  onProgramFilterChange,
  onSearchTermChange,
  onStatusFilterChange,
  onYearFilterChange,
  programFilter,
  searchTerm,
  startupsData,
  statusFilter,
  yearFilter,
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-xl font-semibold">Liste des Startups</h2>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-8"
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <FilterSelect
              value={programFilter}
              placeholder="Programme"
              options={[
                { value: "all", label: "Tous" },
                { value: "orange_fab", label: "Orange Fab" },
                { value: "startup_lab", label: "Startup Lab" },
              ]}
              onValueChange={onProgramFilterChange}
            />
            <FilterSelect
              value={statusFilter}
              placeholder="Statut"
              options={[
                { value: "all", label: "Tous" },
                { value: "active", label: "Actif" },
                { value: "inactive", label: "Inactif" },
                { value: "graduated", label: "Diplômé" },
              ]}
              onValueChange={onStatusFilterChange}
            />
            <FilterSelect
              value={yearFilter}
              placeholder="Année"
              options={[
                { value: "all", label: "Toutes" },
                ...YEAR_OPTIONS.map((year) => ({ value: year, label: year })),
              ]}
              onValueChange={onYearFilterChange}
            />
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-end space-x-2">
        {["csv", "excel", "pdf"].map((type) => (
          <Button key={type} variant="outline" size="sm" onClick={() => onExport(type)}>
            <Download className="mr-2 h-4 w-4" /> {type.toUpperCase()}
          </Button>
        ))}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Secteur</TableHead>
              <TableHead>Programme</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Stade</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStartups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-4 text-center">
                  {startupsData.length === 0 ? "Aucune startup trouvée" : "Aucun résultat pour les filtres sélectionnés"}
                </TableCell>
              </TableRow>
            ) : (
              filteredStartups.map((startup, index) => (
                <TableRow key={startup.id || index}>
                  <TableCell className="font-medium">{startup.startup_name || "Nom non défini"}</TableCell>
                  <TableCell>{startup.sector || "Non spécifié"}</TableCell>
                  <TableCell>{getProgramLabel(startup.program)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(startup.status || "pending")}>
                      {getStatusLabel(startup.status || "En attente")}
                    </Badge>
                  </TableCell>
                  <TableCell>{startup.stage || "Non spécifié"}</TableCell>
                  <TableCell>{startup.founding_date || "Non spécifiée"}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {startup.founder_first_name} {startup.founder_last_name}
                    </div>
                    <div className="text-xs text-muted-foreground">{startup.founder_email}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <AdminGhostActionButton>
                        <Eye className="h-4 w-4" />
                      </AdminGhostActionButton>
                      <AdminGhostActionButton>
                        <Edit className="h-4 w-4" />
                      </AdminGhostActionButton>
                      <AdminGhostActionButton>
                        <Trash className="h-4 w-4" />
                      </AdminGhostActionButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function AdminProgramsTab({
  orangeFabAcceptanceRate,
  orangeFabPendingCount,
  startupLabAcceptanceRate,
  startupLabPendingCount,
  stats,
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <ProgramCard
          title="Orange Fab"
          description="Programme d'accélération pour startups en phase de croissance"
          activeCount={stats.orangeFabStartups}
          pendingCount={orangeFabPendingCount}
          acceptanceRate={orangeFabAcceptanceRate}
        />
        <ProgramCard
          title="Startup Lab"
          description="Soutien à l'idéation et au prototypage pour les porteurs de projets innovants"
          activeCount={stats.startupLabStartups}
          pendingCount={startupLabPendingCount}
          acceptanceRate={startupLabAcceptanceRate}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendrier des Programmes</CardTitle>
          <CardDescription>Planning des événements et échéances des programmes d&apos;accompagnement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {PROGRAM_CALENDAR_ITEMS.map((item) => (
              <ProgramCalendarItem key={item.title} {...item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AdminStatisticsTab({ monthlyApplicationsData, sectorDistributionData }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Secteur</CardTitle>
            <CardDescription>Distribution des startups par secteur d&apos;activité</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer>
              <PieChart>
                <Pie
                  data={sectorDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sectorDistributionData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={PROGRAM_COLORS[index % PROGRAM_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Évolution des Candidatures</CardTitle>
            <CardDescription>Nombre de candidatures par mois sur les 6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer>
              <BarChart data={monthlyApplicationsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orangeFab" name="Orange Fab" fill="#FF7900" />
                <Bar dataKey="startupLab" name="Startup Lab" fill="#4F46E5" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Taux de Réussite</CardTitle>
          <CardDescription>Pourcentage de startups ayant atteint leurs objectifs par programme</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer>
            <BarChart data={SUCCESS_RATE_DATA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="annee" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="orangeFab" name="Orange Fab" fill="#FF7900" />
              <Bar dataKey="startupLab" name="Startup Lab" fill="#4F46E5" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
