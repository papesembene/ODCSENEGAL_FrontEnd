"use client"

import { useEffect } from "react"
import { parseStoredAuthData } from "./test-candidate-session-auth"

export function useRestoreStoredAuth({ setAuthData, storageKey }) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const parsed = parseStoredAuthData(localStorage.getItem(storageKey))
    if (!parsed) {
      return
    }

    setAuthData((prev) => ({
      name: parsed.name || prev.name || "",
      email: parsed.email || prev.email || "",
      phone: parsed.phone || prev.phone || "",
    }))
  }, [setAuthData, storageKey])
}

export function useAutoResumeAuthentication({
  isAuthenticated,
  performAuthentication,
  resumeAttempted,
  setResumeAttempted,
  setResuming,
  storageKey,
  testAccessStatus,
  testData,
}) {
  useEffect(() => {
    if (!testData || testAccessStatus !== "available" || isAuthenticated || resumeAttempted || typeof window === "undefined") {
      return
    }

    const parsed = parseStoredAuthData(localStorage.getItem(storageKey))
    if (!parsed) {
      setResumeAttempted(true)
      return
    }

    if (!parsed.email || !parsed.phone) {
      setResumeAttempted(true)
      return
    }

    setResuming(true)
    performAuthentication(parsed, { silent: true, skipValidation: true }).finally(() => {
      setResumeAttempted(true)
      setResuming(false)
    })
  }, [
    isAuthenticated,
    performAuthentication,
    resumeAttempted,
    setResumeAttempted,
    setResuming,
    storageKey,
    testAccessStatus,
    testData,
  ])
}
