import { getAdminAuthHeaders } from "@/app/utils/admin-auth"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "")

export async function exportInterviewDecisions(interviews) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries({
    campaignId: interviews.selectedCampaignId,
    status: interviews.statusFilter,
    formation: interviews.formationFilter,
    search: interviews.searchTerm.trim(),
  })) {
    if (value && value !== "all") params.set(key, value)
  }
  const response = await fetch(`${API_BASE_URL}/api/admin/interviews/evaluations/export?${params}`, {
    headers: getAdminAuthHeaders(), signal: AbortSignal.timeout(30000),
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || payload.message || `Export impossible (${response.status})`)
  }
  const blob = await response.blob()
  const filename = response.headers.get("Content-Disposition")?.match(/filename="?([^";]+)"?/)?.[1] || "entretiens.csv"
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  try {
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    URL.revokeObjectURL(url)
  }
}
