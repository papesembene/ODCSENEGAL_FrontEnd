"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { getAdminAuthHeaders } from "@/app/utils/admin-auth"
import { API_BASE_URL } from "../constants"

export function InvitationDeliveryStatus({ groupId, refreshToken, endpoint, title = "Suivi des invitations" }) {
  const path = endpoint || (groupId ? `/api/admin/test-groups/${groupId}/invitations` : "")
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState("")
  const [retrying, setRetrying] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    let timer
    const controller = new AbortController()
    const load = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${path}/status`, {
          headers: getAdminAuthHeaders(), signal: controller.signal,
        })
        const result = await response.json()
        if (!response.ok || !result.success) throw new Error("Suivi des envois indisponible")
        if (!active) return
        setSummary(result.data)
        setError("")
        timer = setTimeout(load, result.data.queued > 0 ? 5000 : 15000)
      } catch (failure) {
        if (active && failure.name !== "AbortError") setError("Suivi des envois indisponible. Vous pouvez actualiser.")
      }
    }
    setSummary(null)
    if (path) void load()
    return () => { active = false; controller.abort(); clearTimeout(timer) }
  }, [path, refreshKey, refreshToken])

  const retry = async () => {
    setRetrying(true)
    try {
      const response = await fetch(`${API_BASE_URL}${path}/retry`, {
        method: "POST", headers: getAdminAuthHeaders(),
      })
      if (!response.ok) throw new Error()
      setRefreshKey((value) => value + 1)
    } catch { setError("Impossible de relancer les envois en échec") }
    finally { setRetrying(false) }
  }

  if (!summary?.total && !error) return <p className="text-xs text-muted-foreground">Aucun envoi en attente.</p>
  return (
    <section className="space-y-2 rounded-lg border p-3 text-sm" aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-medium">{title}</h4>
        <Button size="sm" variant="ghost" onClick={() => setRefreshKey((value) => value + 1)}>Actualiser</Button>
      </div>
      {summary ? <p role="status">{summary.queued} en attente · {summary.sent} accepté(s) par le service email · {summary.failed} en échec{summary.cancelled ? ` · ${summary.cancelled} annulé(s)` : ""}</p> : null}
      <p className="text-xs text-muted-foreground">L'acceptation par le service ne garantit pas la réception en boîte principale.</p>
      {error ? <p role="alert" className="text-red-700">{error}</p> : null}
      {summary?.failed > 0 ? <Button size="sm" variant="outline" disabled={retrying} onClick={retry}>Réessayer uniquement les échecs</Button> : null}
    </section>
  )
}
