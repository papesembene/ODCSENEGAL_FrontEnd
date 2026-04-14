"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  LineChart,
  Line,
} from "recharts"
import { 
  Briefcase, 
  Users, 
  ArrowRight, 
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity
} from "lucide-react"

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]




export default function AdminDashboard() {
  const { dashboard } = useAdminApi()
  const [adminType, setAdminType] = useState(null)
  const [adminEmail, setAdminEmail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState(null)
  const [daysRange, setDaysRange] = useState(7)

  const fetchDashboardStatistics = useCallback(async () => {
    try {
      setStatsLoading(true)
      setError(null)
      
      const result = await dashboard.getStatistics(daysRange)
      
      if (result.success) {
        setDashboardData(result.data)
      } else {
        const errorMessage = result.error || "Erreur lors du chargement des statistiques"
        setError(errorMessage)
        console.error("Erreur lors du chargement des statistiques:", errorMessage)
      }
    } catch (error) {
      const errorMessage = error.message || "Erreur lors de la récupération des statistiques"
      setError(errorMessage)
      console.error("Erreur lors de la récupération des statistiques:", error)
    } finally {
      setStatsLoading(false)
    }
  }, [dashboard, daysRange])

  useEffect(() => {
    // Vérifier l'authentification
    const type = localStorage.getItem("admin_type")
    const email = localStorage.getItem("admin_email")

    setAdminType(type)
    setAdminEmail(email)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchDashboardStatistics()
  }, [fetchDashboardStatistics])

  const handleChangeRange = (range) => {
    if (range === daysRange) return
    setDaysRange(range)
  }

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }


  if (!dashboardData && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  if (error && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button 
            onClick={fetchDashboardStatistics} 
            className="bg-orange-500 hover:bg-orange-600"
          >
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  const navigateTo = (path) => {
    router.push(path)
  }

  // Récupérer les données depuis l'API
  const globalStats = dashboardData.globalStats
  const applicationsTrend = dashboardData.applicationsTrend
  const genderDistribution = dashboardData.genderDistribution
  const statusDistribution = dashboardData.statusDistribution
  const nationalityDistribution = dashboardData.nationalityDistribution || []
  const recentActivities = dashboardData.recentActivities
  const moduleStats = dashboardData.moduleStats

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête avec message de bienvenue */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Tableau de Bord Administrateur
        </h1>
        <p className="text-muted-foreground">
          Bienvenue {adminEmail?.split("@")[0] || "Admin"} - 
          {adminType === "competences" ? " Gestion des Compétences" : adminType === "startups" ? " Gestion des Startups" : " Vue d'ensemble"}
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidatures</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalCandidatures}</div>
            <p className="text-xs text-muted-foreground">
              <span className={globalStats.croissance >= 0 ? "text-green-600" : "text-red-600"}>
                {globalStats.croissance >= 0 ? "+" : ""}{globalStats.croissance}%
              </span> vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compétences</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.candidaturesCompetences}</div>
            <Progress value={64} className="mt-2" />
          </CardContent>
        </Card>

        {/*<Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Startups</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.candidaturesStartups}</div>
            <Progress value={36} className="mt-2" />
          </CardContent>
        </Card>*/}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests programmés</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.testsProgrammes}</div>
            <p className="text-xs text-muted-foreground">
              {moduleStats.tests.actifs} actif{moduleStats.tests.actifs > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.evenementsAVenir}</div>
            <p className="text-xs text-muted-foreground">
              À venir ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'acceptation</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.tauxAcceptation}%</div>
            <Progress value={globalStats.tauxAcceptation} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et modules principaux */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mb-8">
        {/* Graphique de tendance */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Candidatures de la semaine</CardTitle>
            <CardDescription>
              Évolution des candidatures par module — derniers {daysRange} jour(s)
            </CardDescription>
            <div className="mt-2 flex gap-2">
              <Button variant={daysRange === 7 ? "default" : "outline"} size="sm" onClick={() => handleChangeRange(7)}>
                7j
              </Button>
              <Button variant={daysRange === 14 ? "default" : "outline"} size="sm" onClick={() => handleChangeRange(14)}>
                14j
              </Button>
              <Button variant={daysRange === 30 ? "default" : "outline"} size="sm" onClick={() => handleChangeRange(30)}>
                30j
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {applicationsTrend && applicationsTrend.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={applicationsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value, payload) => {
                        const day = payload && payload[0] && payload[0].payload && payload[0].payload.day
                        return day ? `${day} ${value}` : value
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="competences" 
                      stroke="#FF6384" 
                      name="Compétences"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="startups" 
                      stroke="#36A2EB" 
                      name="Startups"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
                {applicationsTrend.every(day => day.competences === 0 && day.startups === 0) && (
                  <div className="mt-2 text-center text-sm text-muted-foreground">
                    Aucune candidature cette semaine
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Aucune donnée disponible</p>
                  <p className="text-sm mt-1">Les données apparaîtront ici dès qu'il y aura des candidatures</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Répartition par genre */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Répartition par genre</CardTitle>
            <CardDescription>Toutes candidatures confondues</CardDescription>
          </CardHeader>
          <CardContent>
            {genderDistribution && genderDistribution.length > 0 && !genderDistribution.some(g => g.name === 'Aucune donnée') ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderDistribution.filter(g => g.name !== 'Aucune donnée')}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, count }) => 
                        count !== undefined ? `${name}: ${count} (${value}%)` : `${name}: ${value}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderDistribution.filter(g => g.name !== 'Aucune donnée').map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => {
                        const count = props.payload.count
                        return count !== undefined ? [`${count} (${value}%)`, name] : [value + '%', name]
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Aucune donnée de genre disponible</p>
                  <p className="text-sm mt-1">Les candidatures n'ont pas encore renseigné le genre</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modules principaux et activité récente */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mb-8">
        {/* Modules principaux */}
        <div className="col-span-4 space-y-4">
          <h2 className="text-xl font-bold">Modules principaux</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigateTo("/astrodmin/competences")}>
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Compétences
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Candidatures</span>
                    <span className="font-semibold">{moduleStats.competences.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Formations</span>
                    <span className="font-semibold">{Object.keys(moduleStats.competences.formations).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tests actifs</span>
                    <span className="font-semibold">{moduleStats.competences.testsActifs}</span>
                  </div>
                  <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600">
                    Accéder
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="opacity-60">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Startups
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Candidatures</span>
                    <span className="font-semibold">{moduleStats.startups.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Orange Fab</span>
                    <span className="font-semibold">{moduleStats.startups.orangeFab}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Startup Lab</span>
                    <span className="font-semibold">{moduleStats.startups.startupLab}</span>
                  </div>
                  <Button disabled className="w-full mt-4 bg-gray-400 cursor-not-allowed">
                    Indisponible
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigateTo("/astrodmin/events")}>
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Événements
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>À venir</span>
                    <span className="font-semibold">{moduleStats.events.aVenir}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Participants</span>
                    <span className="font-semibold">{moduleStats.events.participants}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ce mois</span>
                    <span className="font-semibold">{moduleStats.events.ceMois}</span>
                  </div>
                  <Button className="w-full mt-4 bg-green-500 hover:bg-green-600">
                    Accéder
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigateTo("/astrodmin/competences/tests")}>
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Tests en ligne
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tests actifs</span>
                    <span className="font-semibold">{moduleStats.tests.actifs}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Candidats testés</span>
                    <span className="font-semibold">{moduleStats.tests.candidatsTestes}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taux de réussite</span>
                    <span className="font-semibold">{moduleStats.tests.tauxReussite}%</span>
                  </div>
                  <Button className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600">
                    Accéder
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activité récente */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Activité récente
            </CardTitle>
            <CardDescription>Dernières actions sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities && recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                    <div className={`p-2 rounded-full ${
                      activity.type === "candidature" ? "bg-orange-100 text-orange-600" :
                      activity.type === "test" ? "bg-indigo-100 text-indigo-600" :
                      activity.type === "startup" ? "bg-blue-100 text-blue-600" :
                      "bg-green-100 text-green-600"
                    }`}>
                      {activity.type === "candidature" && <Users className="h-4 w-4" />}
                      {activity.type === "test" && <FileText className="h-4 w-4" />}
                      {activity.type === "startup" && <Briefcase className="h-4 w-4" />}
                      {activity.type === "event" && <Calendar className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.module}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Aucune activité récente</p>
                  <p className="text-sm mt-1">Les dernières actions apparaîtront ici</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Répartition par statut */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Répartition par statut</CardTitle>
          <CardDescription>État global des candidatures</CardDescription>
        </CardHeader>
        <CardContent>
          {statusDistribution && statusDistribution.length > 0 ? (
            <div className="space-y-4">
              {statusDistribution.map((status) => (
                <div key={status.name} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{status.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {status.value}% ({status.count !== undefined ? status.count : '0'} candidature{status.count !== undefined && status.count > 1 ? 's' : ''})
                    </span>
                  </div>
                  <Progress value={status.value} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Aucune donnée de statut disponible</p>
                <p className="text-sm mt-1">Les statuts apparaîtront ici une fois les candidatures traitées</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Répartition par nationalité */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par nationalité</CardTitle>
          <CardDescription>
            {nationalityDistribution.length > 0 
              ? `${nationalityDistribution.length} pays représentés - Nombre de candidatures par nationalité`
              : "Aucune donnée de nationalité disponible"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nationalityDistribution && nationalityDistribution.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Graphique en camembert */}
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={nationalityDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, count }) => 
                        count !== undefined ? `${name}: ${count} (${value}%)` : `${name}: ${value}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {nationalityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => {
                        const count = props.payload.count
                        return count !== undefined ? [`${count} candidature${count > 1 ? 's' : ''} (${value}%)`, name] : [value + '%', name]
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Liste détaillée avec barres de progression */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto">
                <div className="text-sm font-semibold text-gray-700 mb-3">
                  Détail par pays ({nationalityDistribution.reduce((sum, n) => sum + (n.count || 0), 0)} candidatures)
                </div>
                {nationalityDistribution.map((nationality, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: nationality.color }}
                        />
                        <span className="text-sm font-medium">{nationality.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold">{nationality.count || 0}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({nationality.value}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={nationality.value} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Aucune donnée de nationalité disponible</p>
                <p className="text-sm mt-1">Les nationalités apparaîtront ici une fois les candidatures enregistrées</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
