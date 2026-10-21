import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TabsContent } from "@/components/ui/tabs"
import { FileText, Users, CheckCircle, Clock, RefreshCw, Upload, Mail, Eye, Copy, ExternalLink } from "lucide-react"

export function OverviewTab({
  stats,
  fetchResults,
  refreshing,
  scoreDistributionData,
  statusDistributionData,
  setShowUploadDialog,
  onSendInvitations,
  onViewResults,
  testsData,
  handleCopyTestLink,
  handleOpenTest,
}) {
  return (
    <TabsContent value="overview" className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
            <p className="text-xs text-muted-foreground">{stats.activeTests} actif(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidats testés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">{stats.selectedCandidates} sélectionné(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de réussite</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.passRate}%</div>
          </CardContent>
        </Card>
      </div>

      {stats.totalCandidates > 0 && (
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <RefreshCw className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong className="text-blue-900 dark:text-blue-100">Synchronisation active</strong>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                Les tests effectués par les candidats s'affichent automatiquement ici.
                {stats.totalCandidates} résultat{stats.totalCandidates > 1 ? "s" : ""} disponible
                {stats.totalCandidates > 1 ? "s" : ""}.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchResults}
              className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${refreshing ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribution des scores</CardTitle>
            <CardDescription>Répartition des candidats par tranche de score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#FF6384" name="Candidats" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par statut</CardTitle>
            <CardDescription>État des candidatures après les tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="w-full justify-start bg-transparent" onClick={() => setShowUploadDialog(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Importer un test (CSV/Excel)
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent" onClick={onSendInvitations}>
              <Mail className="mr-2 h-4 w-4" />
              Envoyer des invitations
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent" onClick={onViewResults}>
              <Eye className="mr-2 h-4 w-4" />
              Consulter les résultats
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accès rapide aux tests</CardTitle>
            <CardDescription>Liens directs vers les tests candidats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testsData.slice(0, 3).map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{test.title}</p>
                    <p className="text-xs text-muted-foreground">{test.referentiel}</p>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <Button variant="ghost" size="sm" onClick={() => handleCopyTestLink(test.id)} title="Copier le lien">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenTest(test.id)} title="Ouvrir le test">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {testsData.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aucun test disponible</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  )
}

