"use client"

import { useEffect, useMemo, useState } from "react"
import { RefreshCw } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import CompetencesInterviewFilterQuestionsEditor from "../../competences/components/competences-interview-filter-questions-editor"
import useCompetencesInterviews from "../../competences/hooks/use-competences-interviews"

function getSlotRoles(slot, adminId) {
  const assignmentRoles = slot.assignments?.[adminId]
  if (Array.isArray(assignmentRoles) && assignmentRoles.length > 0) {
    return assignmentRoles
  }

  const roles = []
  if ((slot.assigned_filter_ids || slot.assigned_jury_ids || []).includes(adminId)) {
    roles.push("filter")
  }
  if ((slot.assigned_validator_ids || []).includes(adminId)) {
    roles.push("validator")
  }
  if ((slot.assigned_motivation_ids || []).includes(adminId)) {
    roles.push("motivation")
  }
  return roles
}

export default function AdminInterviewQuestionsPage() {
  const interviews = useCompetencesInterviews()
  const [currentAdmin, setCurrentAdmin] = useState({ id: "", scope: "" })

  useEffect(() => {
    try {
      const admin = JSON.parse(localStorage.getItem("admin_user") || "{}")
      setCurrentAdmin({
        id: admin.id || "",
        scope: admin?.profile_data?.admin_scope || "",
      })
    } catch {
      setCurrentAdmin({ id: "", scope: "" })
    }
  }, [])

  const visibleCampaigns = useMemo(() => {
    if (currentAdmin.scope !== "interview_member") {
      return interviews.campaigns
    }

    const campaignIds = new Set(
      interviews.slots
        .filter((slot) => getSlotRoles(slot, currentAdmin.id).includes("validator"))
        .map((slot) => slot.campaign_id)
        .filter(Boolean),
    )

    return interviews.campaigns.filter((campaign) => campaignIds.has(campaign.id))
  }, [currentAdmin.id, currentAdmin.scope, interviews.campaigns, interviews.slots])

  const selectedCampaignId = visibleCampaigns.some((campaign) => campaign.id === interviews.selectedCampaignId)
    ? interviews.selectedCampaignId
    : ""

  if (interviews.loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 pt-4 sm:p-6 sm:pt-6 md:p-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Questions d&apos;entretien</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Préparez les questions et les réponses attendues par référentiel. Les filtreurs les verront ensuite dans leur tableau d&apos;entretien.
        </p>
      </div>

      {visibleCampaigns.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Aucune campagne disponible pour la gestion des questions. Cette page est réservée aux validateurs affectés à au moins un créneau.
          </CardContent>
        </Card>
      ) : (
        <CompetencesInterviewFilterQuestionsEditor
          campaigns={visibleCampaigns}
          selectedCampaignId={selectedCampaignId}
          onSelectedCampaignChange={interviews.setSelectedCampaignId}
          onSave={interviews.handleUpdateCampaignFilterQuestions}
          submitting={interviews.submitting}
        />
      )}
    </div>
  )
}
