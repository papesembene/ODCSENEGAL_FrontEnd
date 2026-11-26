import ReferentialInterviewWorkspace from "./referential-interview-workspace"

export default async function FormationInterviewsPage({ params, searchParams }) {
  const { formation } = await params
  const { campaign_id: campaignId } = await searchParams
  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl p-4 sm:p-6 md:p-8">
      <ReferentialInterviewWorkspace key={formation} formation={formation} initialCampaignId={typeof campaignId === "string" ? campaignId : ""} />
    </div>
  )
}
