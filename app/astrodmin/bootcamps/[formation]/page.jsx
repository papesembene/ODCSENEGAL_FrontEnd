import BootcampWorkspace from "./bootcamp-workspace"

export default async function FormationBootcampsPage({ params, searchParams }) {
  const { formation } = await params
  const { campaign_id: campaignId } = await searchParams
  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl p-4 sm:p-6 md:p-8">
      <BootcampWorkspace key={formation} formation={formation} campaignId={typeof campaignId === "string" ? campaignId : ""} />
    </div>
  )
}
