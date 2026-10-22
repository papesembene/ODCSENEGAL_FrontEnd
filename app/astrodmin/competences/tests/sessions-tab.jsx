import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TabsContent } from "@/components/ui/tabs"
import { CalendarPlus, Clock, FileClock, RefreshCw, Search, Send, TimerOff } from "lucide-react"
import { PageSizeSelector, PaginationControls } from "./test-components"

function formatDateTime(value) {
  if (!value) {
    return "-"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatRemainingTime(seconds) {
  const value = Number(seconds || 0)
  if (value <= 0) {
    return "Terminé"
  }

  const minutes = Math.floor(value / 60)
  const remainingSeconds = value % 60
  return `${minutes} min ${remainingSeconds.toString().padStart(2, "0")} s`
}

function SessionStatusBadge({ status }) {
  if (status === "submitted") {
    return (
      <Badge className="bg-green-100 text-green-800">
        <Send className="mr-1 h-3 w-3" />
        Soumis
      </Badge>
    )
  }

  if (status === "expired") {
    return (
      <Badge className="bg-red-100 text-red-800">
        <TimerOff className="mr-1 h-3 w-3" />
        Expiré sans soumission
      </Badge>
    )
  }

  if (status === "to_reschedule") {
    return (
      <Badge className="bg-orange-100 text-orange-800">
        <CalendarPlus className="mr-1 h-3 w-3" />
        À reprogrammer
      </Badge>
    )
  }

  return (
    <Badge className="bg-blue-100 text-blue-800">
      <Clock className="mr-1 h-3 w-3" />
      En cours
    </Badge>
  )
}

export function SessionsTab({
  fetchTestSessions,
  sessionsLoading,
  sessionsError,
  handleMarkSessionForReschedule,
  sessionsItemsPerPage,
  sessionsPage,
  sessionsSearchTerm,
  sessionsStatusFilter,
  sessionsTestFilter,
  setSessionsItemsPerPage,
  setSessionsPage,
  setSessionsSearchTerm,
  setSessionsStatusFilter,
  setSessionsTestFilter,
  testSessions,
  testSessionsTotal,
  testsData,
}) {
  return (
    <TabsContent value="sessions" className="space-y-6">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>Sessions candidats</CardTitle>
              <CardDescription>
                Suivi des tests commencés, repris, expirés ou soumis.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchTestSessions} disabled={sessionsLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                aria-label="Rechercher une session"
                maxLength={200}
                className="pl-9"
                placeholder="Rechercher par nom, email ou téléphone"
                value={sessionsSearchTerm}
                onChange={(event) => {
                  setSessionsSearchTerm(event.target.value)
                }}
              />
            </div>

            <Select
              value={sessionsStatusFilter}
              onValueChange={(value) => {
                setSessionsStatusFilter(value)
                setSessionsPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="expired">Expirés sans soumission</SelectItem>
                <SelectItem value="to_reschedule">À reprogrammer</SelectItem>
                <SelectItem value="submitted">Soumis</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sessionsTestFilter}
              onValueChange={(value) => {
                setSessionsTestFilter(value)
                setSessionsPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Test" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les tests</SelectItem>
                {testsData.map((test) => (
                  <SelectItem key={test.id} value={test.id}>
                    {test.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {sessionsError ? <div role="alert" className="mb-4 text-sm text-red-700">{sessionsError} <Button variant="outline" size="sm" onClick={fetchTestSessions}>Réessayer</Button></div> : null}
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <PageSizeSelector
              value={sessionsItemsPerPage}
              onChange={(value) => {
                setSessionsItemsPerPage(value)
                setSessionsPage(1)
              }}
            />
            <div className="text-sm text-muted-foreground">
              {testSessionsTotal} session{testSessionsTotal > 1 ? "s" : ""} suivie{testSessionsTotal > 1 ? "s" : ""}
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidat</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Réponses</TableHead>
                  <TableHead>Temps restant</TableHead>
                  <TableHead>Dernière activité</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionsLoading ? (
                  <TableRow><TableCell colSpan={7} className="py-10 text-center" role="status">Chargement des sessions...</TableCell></TableRow>
                ) : testSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center">
                      <FileClock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                      <p className="font-medium">Aucune session trouvée</p>
                      <p className="text-sm text-muted-foreground">
                        Les candidats apparaîtront ici dès qu'ils commencent un test.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  testSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="font-medium">{session.candidateName || session.candidateEmail}</div>
                        <div className="text-xs text-muted-foreground">{session.candidateEmail}</div>
                        <div className="text-xs text-muted-foreground">{session.candidatePhone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{session.testTitle}</div>
                        <div className="text-xs text-muted-foreground">{session.referentiel || "-"}</div>
                      </TableCell>
                      <TableCell>
                        <SessionStatusBadge status={session.status} />
                      </TableCell>
                      <TableCell>{session.answeredCount || 0}</TableCell>
                      <TableCell>{formatRemainingTime(session.remainingTime)}</TableCell>
                      <TableCell>{formatDateTime(session.lastSeenAt)}</TableCell>
                      <TableCell className="text-right">
                        {session.status === "expired" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkSessionForReschedule(session)}
                          >
                            <CalendarPlus className="mr-2 h-4 w-4" />
                            À reprogrammer
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            page={sessionsPage}
            itemsPerPage={sessionsItemsPerPage}
            totalItems={testSessionsTotal}
            itemLabel="session(s)"
            onPageChange={setSessionsPage}
            disabled={sessionsLoading}
          />
        </CardContent>
      </Card>
    </TabsContent>
  )
}
