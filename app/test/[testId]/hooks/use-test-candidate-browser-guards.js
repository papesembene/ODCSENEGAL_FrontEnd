"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { writeStoredJsonValue } from "./test-candidate-session-storage"

export function useBeforeUnloadProtection({ testStarted, testCompleted }) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const handleBeforeUnload = (event) => {
      if (!testStarted || testCompleted) {
        return
      }

      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [testCompleted, testStarted])
}

export function useVisibilityWarning({ testStarted, testCompleted }) {
  useEffect(() => {
    if (typeof document === "undefined") {
      return
    }

    const handleVisibility = () => {
      if (document.hidden && testStarted && !testCompleted) {
        toast.warning("Veuillez rester sur l'onglet du test.")
      }
    }

    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [testCompleted, testStarted])
}

export function usePersistedAnswers({ answers, storageKey, testStarted }) {
  useEffect(() => {
    if (!testStarted || typeof window === "undefined") {
      return
    }

    try {
      writeStoredJsonValue(storageKey, answers)
    } catch (error) {
      console.warn("Impossible d'enregistrer les réponses dans le stockage local:", error)
    }
  }, [answers, storageKey, testStarted])
}
