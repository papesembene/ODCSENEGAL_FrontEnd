"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { getCandidatureStatus } from "@/lib/public-api"
import { getCampaignRefreshDelay, getCandidatureAvailability } from "@/lib/candidature-availability"

const CandidatureContext = createContext(null)
const ROUTES = new Set(["/", "/competences", "/odc/candidatures", "/candidatures/fermees"])
const INITIAL = { pathname: null, status: null, phase: "loading" }

export default function CandidatureStatusProvider({ children, pathname }) {
  const [state, setState] = useState(INITIAL)
  const refreshRef = useRef(async () => null)
  const refresh = useCallback(() => refreshRef.current(), [])

  useEffect(() => {
    if (!ROUTES.has(pathname)) return
    let active = true
    let pending = null
    let timer
    let controller
    let timeout

    function load() {
      if (!active) return Promise.resolve(null)
      if (pending) return pending
      clearTimeout(timer)
      setState((current) => current.pathname === pathname && current.phase === "ready"
        ? current : { pathname, status: null, phase: "loading" })
      controller = new AbortController()
      timeout = setTimeout(() => controller.abort(), 10000)
      pending = getCandidatureStatus({}, { signal: controller.signal, cache: "no-store" })
        .then((status) => {
          if (!active) return null
          setState({ pathname, status, phase: "ready" })
          const delay = getCampaignRefreshDelay(status)
          if (delay !== null) timer = setTimeout(() => {
            if (document.visibilityState === "visible") load()
          }, delay)
          return status
        })
        .catch(() => {
          if (active) setState({ pathname, status: null, phase: "error" })
          return null
        })
        .finally(() => {
          clearTimeout(timeout)
          pending = null
        })
      return pending
    }

    const onVisibility = () => { if (document.visibilityState === "visible") load() }
    refreshRef.current = load
    setState({ pathname, status: null, phase: "loading" })
    load()
    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("online", onVisibility)
    return () => {
      active = false
      clearTimeout(timer)
      clearTimeout(timeout)
      controller?.abort()
      refreshRef.current = async () => null
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("online", onVisibility)
    }
  }, [pathname])

  const current = state.pathname === pathname ? state : INITIAL
  const availability = getCandidatureAvailability(current.status, current.phase)

  return (
    <CandidatureContext.Provider value={{ ...availability, status: current.status, phase: current.phase, refresh }}>
      {children}
    </CandidatureContext.Provider>
  )
}

export function useCandidatureStatus() {
  const context = useContext(CandidatureContext)
  if (!context) throw new Error("CandidatureStatusProvider est requis")
  return context
}
