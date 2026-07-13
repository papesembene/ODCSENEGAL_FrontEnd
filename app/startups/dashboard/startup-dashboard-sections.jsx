"use client"

import Image from "next/image"
import {
  Bell,
  Calendar,
  Clock,
  Download,
  MapPin,
  MessageSquare,
  Upload,
  User,
} from "lucide-react"
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Progress,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui"
import { DASHBOARD_ICONS, getFileIcon, getStatusColor, getStatusIcon } from "./startup-dashboard-utils"

export function StartupDashboardHeader({ startupData }) {
  return (
    <>
      <div className="mb-8 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full">
            <Image src={startupData.logo || "/placeholder.svg"} alt={startupData.name} fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{startupData.name}</h1>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor("active")}>Programme actif</Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {startupData.program} | {startupData.startDate} - {startupData.endDate}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Bell className="mr-2 h-4 w-4" />
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </span>
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
          </Button>
          <Button>
            <User className="mr-2 h-4 w-4" />
            Mon profil
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">Progression du programme</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">{startupData.progress}%</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Prochaine étape: {startupData.nextMilestone.title} ({startupData.nextMilestone.date})
            </span>
          </div>
          <Progress value={startupData.progress} className="h-2 w-full" />
        </div>
      </div>
    </>
  )
}

export function StartupDashboardTabs({ activeTab, onTabChange, startupData, stats }) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Aperçu</TabsTrigger>
        <TabsTrigger value="tasks">Tâches</TabsTrigger>
        <TabsTrigger value="events">Événements</TabsTrigger>
        <TabsTrigger value="resources">Ressources</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <NextMilestoneCard milestone={startupData.nextMilestone} />

        <div className="grid gap-6 md:grid-cols-2">
          <RecentTasksCard tasks={startupData.tasks} onOpenTasks={() => onTabChange("tasks")} />
          <UpcomingEventsPreviewCard events={startupData.events} onOpenEvents={() => onTabChange("events")} />
        </div>

        <StatisticsCard stats={stats} />
      </TabsContent>

      <TabsContent value="tasks" className="space-y-6">
        <TasksTab tasks={startupData.tasks} />
      </TabsContent>

      <TabsContent value="events" className="space-y-6">
        <EventsTab events={startupData.events} />
      </TabsContent>

      <TabsContent value="resources" className="space-y-6">
        <ResourcesTab resources={startupData.resources} />
      </TabsContent>
    </Tabs>
  )
}

function NextMilestoneCard({ milestone }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prochaine étape</CardTitle>
        <CardDescription>Votre prochain objectif dans le programme</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold">{milestone.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date limite: {milestone.date}</p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">{milestone.description}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Voir les détails
        </Button>
      </CardFooter>
    </Card>
  )
}

function RecentTasksCard({ onOpenTasks, tasks }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tâches récentes</CardTitle>
        <CardDescription>Vos tâches en cours et à venir</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {tasks.slice(0, 3).map((task) => (
            <TaskPreviewItem key={task.id} task={task} />
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full" onClick={onOpenTasks}>
          Voir toutes les tâches
        </Button>
      </CardFooter>
    </Card>
  )
}

function UpcomingEventsPreviewCard({ events, onOpenEvents }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Événements à venir</CardTitle>
        <CardDescription>Vos prochains rendez-vous</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {events.slice(0, 2).map((event) => (
            <li key={event.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{event.title}</h4>
                <Badge className={getStatusColor(event.status)}>À venir</Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{event.date}</span>
                <Clock className="ml-2 h-4 w-4" />
                <span>{event.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full" onClick={onOpenEvents}>
          Voir tous les événements
        </Button>
      </CardFooter>
    </Card>
  )
}

function StatisticsCard({ stats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiques</CardTitle>
        <CardDescription>Votre progression en chiffres</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = DASHBOARD_ICONS[stat.icon]

            return (
              <div key={stat.label} className="flex flex-col items-center rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <Icon className={`h-8 w-8 ${stat.iconClassName}`} />
                <div className="mt-2 text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function TasksTab({ tasks }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Mes tâches</CardTitle>
          <CardDescription>Liste de toutes vos tâches dans le programme</CardDescription>
        </div>
        <Button>
          <DASHBOARD_ICONS.checkCircle className="mr-2 h-4 w-4" />
          Marquer comme terminée
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <TaskSection title="Tâches en cours" status="in-progress" badgeLabel="En cours" tasks={tasks} />
          <TaskSection title="Tâches à venir" status="pending" badgeLabel="À faire" tasks={tasks} />
          <TaskSection title="Tâches terminées" status="completed" badgeLabel="Terminée" tasks={tasks} />
        </div>
      </CardContent>
    </Card>
  )
}

function EventsTab({ events }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Événements</CardTitle>
          <CardDescription>Calendrier des événements à venir et passés</CardDescription>
        </div>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Voir le calendrier
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 font-semibold">Événements à venir</h3>
            <ul className="space-y-4">
              {events.map((event) => (
                <li key={event.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{event.title}</h4>
                    <Badge className={getStatusColor(event.status)}>À venir</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <InlineMeta icon={Calendar}>{event.date}</InlineMeta>
                    <InlineMeta icon={Clock}>{event.time}</InlineMeta>
                    <InlineMeta icon={MapPin}>{event.location}</InlineMeta>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      Détails
                    </Button>
                    <Button size="sm">S'inscrire</Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Événements passés</h3>
            <p className="text-center text-gray-500 dark:text-gray-400">Aucun événement passé à afficher pour le moment.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ResourcesTab({ resources }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Ressources</CardTitle>
          <CardDescription>Documents et ressources pour votre programme</CardDescription>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Téléverser un document
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 font-semibold">Documents du programme</h3>
            <ul className="grid gap-4 md:grid-cols-2">
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Mes documents</h3>
            <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Glissez-déposez vos fichiers ici ou cliquez pour téléverser
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TaskSection({ badgeLabel, status, tasks, title }) {
  return (
    <div>
      <h3 className="mb-4 font-semibold">{title}</h3>
      <ul className="space-y-4">
        {tasks
          .filter((task) => task.status === status)
          .map((task) => (
            <TaskRow key={task.id} task={task} badgeLabel={badgeLabel} />
          ))}
      </ul>
    </div>
  )
}

function TaskRow({ badgeLabel, task }) {
  const statusIcon = getStatusIcon(task.status)
  const StatusIcon = statusIcon.icon

  return (
    <li className="flex items-start space-x-3 rounded-lg border p-4">
      <StatusIcon className={`mt-0.5 h-5 w-5 ${statusIcon.className}`} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{task.title}</h4>
          <Badge className={getStatusColor(task.status)}>{badgeLabel}</Badge>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Date limite: {task.dueDate}</p>
      </div>
    </li>
  )
}

function TaskPreviewItem({ task }) {
  const statusIcon = getStatusIcon(task.status)
  const StatusIcon = statusIcon.icon

  return (
    <li className="flex items-start space-x-3">
      <StatusIcon className={`h-4 w-4 ${statusIcon.className}`} />
      <div>
        <p className="font-medium">{task.title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Date limite: {task.dueDate}</p>
      </div>
    </li>
  )
}

function ResourceCard({ resource }) {
  const fileIcon = getFileIcon(resource.type)
  const FileIcon = fileIcon.icon

  return (
    <li className="flex items-center space-x-4 rounded-lg border p-4">
      <FileIcon className={`h-8 w-8 ${fileIcon.className}`} />
      <div className="flex-1">
        <h4 className="font-medium">{resource.title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {resource.date} • {resource.size}
        </p>
      </div>
      <Button variant="ghost" size="icon">
        <Download className="h-4 w-4" />
      </Button>
    </li>
  )
}

function InlineMeta({ children, icon: Icon }) {
  return (
    <div className="flex items-center space-x-1">
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </div>
  )
}
