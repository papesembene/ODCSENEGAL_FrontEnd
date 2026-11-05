"use client"

import { useEffect, useRef, useState } from "react"
import { checkUniqueCandidatureField } from "@/lib/public-api"

export default function useCandidatureUniqueness() {
  const [state, setState] = useState({})
  const requests = useRef({})
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => { alive.current = false; Object.values(requests.current).forEach((request) => request.abort()) }
  }, [])

  function reset(name) {
    requests.current[name]?.abort()
    delete requests.current[name]
    setState((previous) => ({ ...previous, [name]: { checking: false, exists: false } }))
  }

  async function check(name, value) {
    reset(name)
    const controller = new AbortController()
    requests.current[name] = controller
    setState((previous) => ({ ...previous, [name]: { checking: true, exists: false } }))
    const timer = setTimeout(() => controller.abort(), 8000)
    try {
      const result = await checkUniqueCandidatureField(name === "idNumber" ? "cni_or_passport_number" : name,
        value.trim(), { signal: controller.signal })
      if (alive.current && requests.current[name] === controller && !controller.signal.aborted) {
        setState((previous) => ({ ...previous, [name]: { checking: false, exists: result?.exists === true } }))
      }
    } catch {
      // These checks are advisory; atomic server validation remains authoritative.
    } finally {
      clearTimeout(timer)
      if (alive.current && requests.current[name] === controller) {
        setState((previous) => ({ ...previous, [name]: { ...previous[name], checking: false } }))
        delete requests.current[name]
      }
    }
  }
  return { state, reset, check }
}
