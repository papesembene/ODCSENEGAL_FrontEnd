"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { fetchJsonWithTimeout } from "@/app/utils/fetchWithTimeout"
import { setKnownTrainings, trainingOptions, validateCatalogResponse } from "@/lib/training-catalog"

const Context = createContext(null)
const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "")
const PUBLIC_PATHS = new Set(["/competences", "/odc/candidatures"])
const ADMIN_PATHS = ["/astrodmin/competences", "/astrodmin/entretiens", "/astrodmin/mes-entretiens"]

export default function TrainingCatalogProvider({ children }) {
  const pathname = usePathname()
  const admin = ADMIN_PATHS.some((path) => pathname.startsWith(path))
  const enabled = admin || PUBLIC_PATHS.has(pathname)
  const [state, setState] = useState({ items: [], phase: "idle", error: "" })
  const refreshRef = useRef(async () => [])
  const refresh = useCallback(() => refreshRef.current(true), [])

  useEffect(() => {
    const role = localStorage.getItem("admin_type")
    if (!enabled || (admin && (!localStorage.getItem("admin_token")
      || !["super_admin", "competences"].includes(role)))) return
    let active = true
    let pending
    let lastRead = 0
    async function load(force = false) {
      if (pending) return pending
      if (!force && Date.now() - lastRead < 5000) return
      lastRead = Date.now()
      setState((previous) => ({ ...previous, phase: "loading", error: "" }))
      pending = fetchJsonWithTimeout(`${API}/api/${admin ? "admin/" : ""}trainings`, {
        timeout: 10000, retries: 0, cache: "no-store",
      }).then(validateCatalogResponse).then((items) => {
        if (active) {
          setKnownTrainings(items)
          setState({ items, phase: "ready", error: "" })
        }
        return items
      }).catch((error) => {
        if (active) setState((previous) => ({ ...previous, phase: "error", error: error.message }))
        return []
      }).finally(() => { pending = null })
      return pending
    }
    const visible = () => { if (document.visibilityState === "visible") load() }
    const changed = (event) => {
      if (!event.key || event.key === "odc_training_catalog_updated") load(true)
    }
    refreshRef.current = load
    load(true)
    document.addEventListener("visibilitychange", visible)
    window.addEventListener("online", visible)
    window.addEventListener("storage", changed)
    return () => {
      active = false
      refreshRef.current = async () => []
      document.removeEventListener("visibilitychange", visible)
      window.removeEventListener("online", visible)
      window.removeEventListener("storage", changed)
    }
  }, [pathname, admin, enabled])

  return <Context.Provider value={{ ...state, refresh,
    options: trainingOptions(state.items), allOptions: trainingOptions(state.items, "code", true),
    testOptions: trainingOptions(state.items, "value"),
  }}>{children}</Context.Provider>
}

export function useTrainingCatalog() {
  const context = useContext(Context)
  if (!context) throw new Error("TrainingCatalogProvider est requis")
  return context
}
