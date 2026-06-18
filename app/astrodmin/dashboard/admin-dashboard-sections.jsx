"use client"

import {
  Activity,
  AlertCircle,
  ArrowRight,
  Briefcase,
  Calendar,
  FileText,
  Users,
} from "lucide-react"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
} from "@/components/ui"
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { getActivityStyles, getAdminLabel, getEmptyChartCopy, RANGE_OPTIONS } from "./admin-dashboard-utils"

export function AdminDashboardLoadingState({ message = "Chargement des statistiques..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-orange-500"></div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export function AdminDashboardErrorState({ error, onRetry }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h2 className="mb-2 text-xl font-bold">Erreur de chargement</h2>
        <p className="mb-4 text-muted-foreground">{error}</p>
        <Button onClick={onRetry} className="bg-orange-500 hover:bg-orange-600">
          Réessayer
        </Button>
      </div>
    </div>
  )
}

export function AdminDashboardHeader({ adminEmail, adminType }) {
  return (
    <div className="mb-8">
      <h1 className="mb-2 text-3xl font-bold">Tableau de Bord Administrateur</h1>
      <p className="text-muted-foreground">
        Bienvenue {adminEmail?.split("@")[0] || "Admin"} - {getAdminLabel(adminType)}
      </p>
    </div>
  )
}

export function AdminDashboardQuickStats({ statCards }) {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {statCards.map((card) => (
        <QuickStatCard key={card.title} {...card} />
      ))}
    </div>
  )
}

export function AdminDashboardCharts({
  applicationsTrend,
  daysRange,
  genderDistribution,
  onRangeChange,
}) {
  const hasApplications = applicationsTrend.length > 0
  const hasChartActivity = hasApplications && !applicationsTrend.every((day) => day.competences === 0 && day.startups === 0)
  const filteredGenderData = genderDistribution.filter((item) => item.name !== "Aucune donnée")
  const hasGenderData = filteredGenderData.length > 0

  return (
    <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Candidatures de la semaine</CardTitle>
          <CardDescription>Évolution des candidatures par module — derniers {daysRange} jour(s)</CardDescription>
          <div className="mt-2 flex gap-2">
            {RANGE_OPTIONS.map((range) => (
              <Button key={range} variant={daysRange === range ? "default" : "outline"} size="sm" onClick={() => onRangeChange(range)}>
                {range}j
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {hasApplications ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={applicationsTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value, payload) => {
                      const day = payload?.[0]?.payload?.day
                      return day ? `${day} ${value}` : value
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="competences" stroke="#FF6384" name="Compétences" strokeWidth={2} />
                  <Line type="monotone" dataKey="startups" stroke="#36A2EB" name="Startups" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              {!hasChartActivity ? (
                <div className="mt-2 text-center text-sm text-muted-foreground">Aucune candidature cette semaine</div>
              ) : null}
            </div>
          ) : (
            <EmptyChartState kind="applications" />
          )}
        </CardContent>
      </Card>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Répartition par genre</CardTitle>
          <CardDescription>Toutes candidatures confondues</CardDescription>
        </CardHeader>
        <CardContent>
          {hasGenderData ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredGenderData}
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
                    {filteredGenderData.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => {
                      const count = props.payload.count
                      return count !== undefined ? [`${count} (${value}%)`, name] : [`${value}%`, name]
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState kind="gender" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function AdminDashboardModulesAndActivity({ moduleStats, onNavigate, recentActivities }) {
  return (
    <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-7">
      <div className="col-span-4 space-y-4">
        <h2 className="text-xl font-bold">Modules principaux</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <ModuleCard
            title="Compétences"
            icon={Users}
            headerClassName="from-orange-500 to-orange-600"
            rows={[
              { label: "Candidatures", value: moduleStats.competences.total },
              { label: "Formations", value: Object.keys(moduleStats.competences.formations).length },
              { label: "Tests actifs", value: moduleStats.competences.testsActifs },
            ]}
            buttonClassName="bg-orange-500 hover:bg-orange-600"
            onClick={() => onNavigate("/astrodmin/competences")}
          />

          <ModuleCard
            title="Startups"
            icon={Briefcase}
            headerClassName="from-blue-500 to-blue-600"
            rows={[
              { label: "Candidatures", value: moduleStats.startups.total },
              { label: "Orange Fab", value: moduleStats.startups.orangeFab },
              { label: "Startup Lab", value: moduleStats.startups.startupLab },
            ]}
            buttonLabel="Indisponible"
            buttonClassName="bg-gray-400 cursor-not-allowed"
            disabled
            dimmed
          />

          <ModuleCard
            title="Événements"
            icon={Calendar}
            headerClassName="from-green-500 to-green-600"
            rows={[
              { label: "À venir", value: moduleStats.events.aVenir },
              { label: "Participants", value: moduleStats.events.participants },
              { label: "Ce mois", value: moduleStats.events.ceMois },
            ]}
            buttonClassName="bg-green-500 hover:bg-green-600"
            onClick={() => onNavigate("/astrodmin/events")}
          />

          <ModuleCard
            title="Tests en ligne"
            icon={FileText}
            headerClassName="from-indigo-500 to-indigo-600"
            rows={[
              { label: "Tests actifs", value: moduleStats.tests.actifs },
              { label: "Candidats testés", value: moduleStats.tests.candidatsTestes },
              { label: "Taux de réussite", value: `${moduleStats.tests.tauxReussite}%` },
            ]}
            buttonClassName="bg-indigo-500 hover:bg-indigo-600"
            onClick={() => onNavigate("/astrodmin/competences/tests")}
          />
        </div>
      </div>

      <RecentActivityCard recentActivities={recentActivities} />
    </div>
  )
}

export function AdminDashboardStatusDistribution({ statusDistribution }) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Répartition par statut</CardTitle>
        <CardDescription>État global des candidatures</CardDescription>
      </CardHeader>
      <CardContent>
        {statusDistribution.length > 0 ? (
          <div className="space-y-4">
            {statusDistribution.map((status) => (
              <div key={status.name} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{status.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {status.value}% ({status.count !== undefined ? status.count : "0"} candidature
                    {status.count !== undefined && status.count > 1 ? "s" : ""})
                  </span>
                </div>
                <Progress value={status.value} className="h-2" />
              </div>
            ))}
          </div>
        ) : (
          <EmptyChartState kind="status" />
        )}
      </CardContent>
    </Card>
  )
}

export function AdminDashboardNationalityDistribution({ nationalityDistribution }) {
  const totalApplications = nationalityDistribution.reduce((sum, nationality) => sum + (nationality.count || 0), 0)

  return (
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
        {nationalityDistribution.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
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
                      <Cell key={`${entry.name}-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => {
                      const count = props.payload.count
                      return count !== undefined
                        ? [`${count} candidature${count > 1 ? "s" : ""} (${value}%)`, name]
                        : [`${value}%`, name]
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="max-h-[350px] space-y-3 overflow-y-auto">
              <div className="mb-3 text-sm font-semibold text-gray-700">
                Détail par pays ({totalApplications} candidatures)
              </div>
              {nationalityDistribution.map((nationality, index) => (
                <div key={`${nationality.name}-${index}`} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: nationality.color }} />
                      <span className="text-sm font-medium">{nationality.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">{nationality.count || 0}</span>
                      <span className="ml-1 text-xs text-muted-foreground">({nationality.value}%)</span>
                    </div>
                  </div>
                  <Progress value={nationality.value} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyChartState kind="nationality" />
        )}
      </CardContent>
    </Card>
  )
}

function QuickStatCard({ footer, icon: Icon, iconClassName, progress, title, value }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconClassName}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {progress !== undefined ? <Progress value={progress} className="mt-2" /> : null}
        {footer ? (
          <p className="text-xs text-muted-foreground">
            {footer.value ? <span className={footer.valueClassName}>{footer.value}</span> : null}
            {footer.value ? " " : ""}
            {footer.text}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function ModuleCard({
  buttonClassName,
  buttonLabel = "Accéder",
  dimmed = false,
  disabled = false,
  headerClassName,
  icon: Icon,
  onClick,
  rows,
  title,
}) {
  return (
    <Card className={`${dimmed ? "opacity-60" : "cursor-pointer transition-shadow duration-300 hover:shadow-lg"}`} onClick={disabled ? undefined : onClick}>
      <CardHeader className={`rounded-t-lg bg-gradient-to-r text-white ${headerClassName}`}>
        <CardTitle className="flex items-center">
          <Icon className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between text-sm">
              <span>{row.label}</span>
              <span className="font-semibold">{row.value}</span>
            </div>
          ))}
          <Button disabled={disabled} className={`mt-4 w-full ${buttonClassName}`}>
            {buttonLabel}
            {!disabled ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function RecentActivityCard({ recentActivities }) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          Activité récente
        </CardTitle>
        <CardDescription>Dernières actions sur la plateforme</CardDescription>
      </CardHeader>
      <CardContent>
        {recentActivities.length > 0 ? (
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const activityStyle = getActivityStyles(activity.type)
              const ActivityIcon = activityStyle.icon

              return (
                <div key={index} className="flex items-start space-x-3 border-b pb-3 last:border-0">
                  <div className={`rounded-full p-2 ${activityStyle.className}`}>
                    <ActivityIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <div className="mt-1 flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {activity.module}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <div className="text-center">
              <Activity className="mx-auto mb-2 h-12 w-12 text-gray-400" />
              <p>Aucune activité récente</p>
              <p className="mt-1 text-sm">Les dernières actions apparaîtront ici</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyChartState({ kind }) {
  const copy = getEmptyChartCopy(kind)

  return (
    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
      <div className="text-center">
        <AlertCircle className="mx-auto mb-2 h-12 w-12 text-gray-400" />
        <p>{copy.title}</p>
        <p className="mt-1 text-sm">{copy.description}</p>
      </div>
    </div>
  )
}
