"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarClock, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PageSizeSelector, PaginationControls } from "@/components/ui/data-pagination"
import useCompetencesInterviews from "../competences/hooks/use-competences-interviews"
import CompetencesInterviewEvaluationDialog from "../competences/components/competences-interview-evaluation-dialog"

function isFilledValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== ""
}

function getRoleSectionKey(role) {
  if (role === "Filtreur") return "filter"
  if (role === "Validateur") return "validator"
  if (role === "Motivation") return "motivation"
  return ""
}

function isSectionComplete(section, role, scorecardConfig) {
  const sectionKey = getRoleSectionKey(role)
  const criteria = scorecardConfig?.sections?.[sectionKey]?.criteria || []
  const requiredCriteria = criteria.filter((criterion) => criterion.required)
  return criteria.length > 0 && requiredCriteria.every((criterion) =>
    isFilledValue(section?.[criterion.key]),
  )
}

function getSlotRoles(slot, adminId) {
  const roles = []
  if ((slot.assigned_filter_ids || slot.assigned_jury_ids || []).includes(adminId)) {
    roles.push("Filtreur")
  }
  if ((slot.assigned_validator_ids || []).includes(adminId)) {
    roles.push("Validateur")
  }
  if ((slot.assigned_motivation_ids || []).includes(adminId)) {
    roles.push("Motivation")
  }
  return roles
}

function getEvaluationRoleLabel(slot, adminId) {
  const roles = getSlotRoles(slot, adminId)
  return roles[0] || "-"
}

function getRoleSectionStatus(evaluation, role, scorecardConfig) {
  if (role === "Filtreur") {
    return isSectionComplete(evaluation.filter_review, role, scorecardConfig) ? "Complétée" : "À renseigner"
  }

  if (role === "Validateur") {
    return isSectionComplete(evaluation.validator_review, role, scorecardConfig) ? "Complétée" : "À renseigner"
  }

  if (role === "Motivation") {
    return isSectionComplete(evaluation.motivation_review, role, scorecardConfig) ? "Complétée" : "À renseigner"
  }

  return "-"
}

export default function MyInterviewsPage() {
  const interviews = useCompetencesInterviews({ filterBySelectedCampaign: false })
  const [currentAdminId, setCurrentAdminId] = useState("")
  const [currentAdminType, setCurrentAdminType] = useState("")
  const [currentAdminName, setCurrentAdminName] = useState("")
  const [selectedEvaluationId, setSelectedEvaluationId] = useState("")

  useEffect(() => {
    try {
      const admin = JSON.parse(localStorage.getItem("admin_user") || "{}")
      setCurrentAdminId(admin.id || "")
      setCurrentAdminType(admin.admin_type || localStorage.getItem("admin_type") || "")
      setCurrentAdminName([admin.first_name, admin.last_name].filter(Boolean).join(" ").trim())
    } catch {
      setCurrentAdminId("")
      setCurrentAdminType(localStorage.getItem("admin_type") || "")
      setCurrentAdminName("")
    }
  }, [])

  const assignedSlots = useMemo(() => {
    if (!currentAdminId) {
      return []
    }

    return interviews.slots.filter((slot) => getSlotRoles(slot, currentAdminId).length > 0)
  }, [currentAdminId, interviews.slots])

  const assignedSlotIds = useMemo(() => new Set(assignedSlots.map((slot) => slot.id)), [assignedSlots])

  const myEvaluations = useMemo(() => {
    return interviews.evaluations.filter((evaluation) => evaluation.slot_id && assignedSlotIds.has(evaluation.slot_id))
  }, [assignedSlotIds, interviews.evaluations])
  const roleSummary = useMemo(() => {
    return assignedSlots.reduce(
      (accumulator, slot) => {
        getSlotRoles(slot, currentAdminId).forEach((role) => {
          accumulator[role] = (accumulator[role] || 0) + 1
        })
        return accumulator
      },
      {
        Filtreur: 0,
        Validateur: 0,
        Motivation: 0,
      },
    )
  }, [assignedSlots, currentAdminId])
  const evaluationSummary = useMemo(() => {
    return myEvaluations.reduce(
      (accumulator, evaluation) => {
        const slot = assignedSlots.find((item) => item.id === evaluation.slot_id)
        const role = slot ? getEvaluationRoleLabel(slot, currentAdminId) : "-"
        const scorecardConfig = interviews.campaigns.find(
          (campaign) => campaign.id === evaluation.campaign_id,
        )?.scorecard_config
        const roleStatus = getRoleSectionStatus(evaluation, role, scorecardConfig)

        if (roleStatus === "Complétée") {
          accumulator.completed += 1
        } else {
          accumulator.todo += 1
        }

        return accumulator
      },
      {
        todo: 0,
        completed: 0,
      },
    )
  }, [assignedSlots, currentAdminId, interviews.campaigns, myEvaluations])

  const selectedEvaluation = useMemo(
    () => myEvaluations.find((evaluation) => evaluation.id === selectedEvaluationId) || null,
    [myEvaluations, selectedEvaluationId],
  )
  const selectedCampaignScorecard = useMemo(
    () => interviews.campaigns.find(
      (campaign) => campaign.id === selectedEvaluation?.campaign_id,
    )?.scorecard_config,
    [interviews.campaigns, selectedEvaluation?.campaign_id],
  )
  const selectedEvaluationRole = useMemo(() => {
    if (currentAdminType === "super_admin") {
      return "super_admin"
    }

    const slot = assignedSlots.find((item) => item.id === selectedEvaluation?.slot_id)
    if (!slot || !currentAdminId) {
      return ""
    }

    if ((slot.assigned_filter_ids || slot.assigned_jury_ids || []).includes(currentAdminId)) {
      return "filter"
    }
    if ((slot.assigned_validator_ids || []).includes(currentAdminId)) {
      return "validator"
    }
    if ((slot.assigned_motivation_ids || []).includes(currentAdminId)) {
      return "motivation"
    }

    return ""
  }, [assignedSlots, currentAdminId, currentAdminType, selectedEvaluation?.slot_id])

  if (interviews.loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <CalendarClock className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 pt-4 sm:p-6 sm:pt-6 md:p-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mes entretiens</h1>
        <p className="text-sm text-muted-foreground">
          Vue personnelle des créneaux et candidatures qui vous sont affectés comme filtreur, validateur ou jury motivation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Mes créneaux</CardDescription>
            <CardTitle className="text-2xl">{assignedSlots.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Sessions auxquelles vous êtes affecté.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Mes candidats</CardDescription>
            <CardTitle className="text-2xl">{interviews.pagination.total}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Fiches rattachées à vos créneaux.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>À traiter</CardDescription>
            <CardTitle className="text-2xl">{evaluationSummary.todo}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Clôturés</CardDescription>
            <CardTitle className="text-2xl">{evaluationSummary.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Créneaux filtreur</CardDescription>
            <CardTitle className="text-2xl">{roleSummary.Filtreur}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Créneaux validateur</CardDescription>
            <CardTitle className="text-2xl">{roleSummary.Validateur}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Créneaux motivation</CardDescription>
            <CardTitle className="text-2xl">{roleSummary.Motivation}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mes créneaux affectés</CardTitle>
          <CardDescription>Chaque créneau rappelle le ou les rôles que vous y tenez.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Créneau</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Rôles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedSlots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Aucun créneau ne vous est encore affecté.
                  </TableCell>
                </TableRow>
              ) : (
                assignedSlots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell className="font-medium">{slot.label}</TableCell>
                    <TableCell>{slot.start_at ? new Date(slot.start_at).toLocaleString("fr-FR") : "-"}</TableCell>
                    <TableCell className="flex flex-wrap gap-2">
                      {getSlotRoles(slot, currentAdminId).map((role) => (
                        <Badge key={role} variant="outline">
                          {role}
                        </Badge>
                      ))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Mes candidats</CardTitle>
              <CardDescription>Vous ne voyez ici que les candidats rattachés à vos créneaux.</CardDescription>
            </div>
            <PageSizeSelector
              value={interviews.pageSize}
              onChange={(nextPageSize) => {
                interviews.setPage(1)
                interviews.setPageSize(nextPageSize)
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidat</TableHead>
                <TableHead>Créneau</TableHead>
                <TableHead>Mon rôle</TableHead>
                <TableHead>Ma section</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myEvaluations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Aucun candidat ne vous est encore visible.
                  </TableCell>
                </TableRow>
              ) : (
                myEvaluations.map((evaluation) => {
                  const slot = assignedSlots.find((item) => item.id === evaluation.slot_id)
                  const role = slot ? getEvaluationRoleLabel(slot, currentAdminId) : "-"
                  const scorecardConfig = interviews.campaigns.find(
                    (campaign) => campaign.id === evaluation.campaign_id,
                  )?.scorecard_config
                  const roleStatus = getRoleSectionStatus(evaluation, role, scorecardConfig)

                  return (
                    <TableRow key={evaluation.id}>
                      <TableCell className="font-medium">
                        {[evaluation.candidate_snapshot?.first_name, evaluation.candidate_snapshot?.last_name].filter(Boolean).join(" ") || evaluation.candidate_snapshot?.email || "Candidat"}
                      </TableCell>
                      <TableCell>{slot?.label || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleStatus === "Complétée" ? "default" : "secondary"}>
                          {roleStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setSelectedEvaluationId(evaluation.id)}>
                          Ouvrir la fiche
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
          <div className="mt-4">
            <PaginationControls
              page={interviews.pagination.page}
              pageSize={interviews.pagination.page_size}
              totalItems={interviews.pagination.total}
              itemLabel="candidat(s)"
              onPageChange={interviews.setPage}
            />
          </div>
        </CardContent>
      </Card>

      <CompetencesInterviewEvaluationDialog
        open={Boolean(selectedEvaluation)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEvaluationId("")
          }
        }}
        evaluation={selectedEvaluation}
        slots={assignedSlots}
        campaignScorecard={selectedCampaignScorecard}
        viewerRole={selectedEvaluationRole}
        currentAdminName={currentAdminName}
        submitting={interviews.submitting}
        onSave={interviews.handleUpdateEvaluation}
      />
    </div>
  )
}
