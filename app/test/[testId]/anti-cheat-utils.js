"use client"

import { fetchWithTimeout } from "@/app/utils/fetchWithTimeout"
import { API_BASE_URL } from "./test-session-utils"

export function createSessionId() {
  return `${Date.now()}_${Math.random()}`
}

export function getAntiCheatStateKey(testId) {
  return `anti_cheat_state_${testId}`
}

export function getAntiCheatSessionKey(testId) {
  return `session_id_${testId}`
}

export function getAntiCheatTabKey(testId) {
  return `test_active_${testId}`
}

export function readPersistedState(testId) {
  if (typeof window === "undefined") {
    return null
  }

  const rawState = sessionStorage.getItem(getAntiCheatStateKey(testId))
  if (!rawState) {
    return null
  }

  try {
    return JSON.parse(rawState)
  } catch (error) {
    console.error("Erreur lors de la restauration de l'état anti-triche:", error)
    return null
  }
}

export function writePersistedState(testId, state) {
  if (typeof window === "undefined") {
    return
  }

  sessionStorage.setItem(getAntiCheatStateKey(testId), JSON.stringify(state))
}

export function removeAntiCheatTabState(testId) {
  if (typeof window === "undefined") {
    return
  }

  const tabKey = getAntiCheatTabKey(testId)
  localStorage.removeItem(tabKey)
  localStorage.removeItem(`${tabKey}_timestamp`)
}

export function buildViolationPayload({ candidateEmail, candidatePhone, elapsedTime, message, testId, type }) {
  return {
    candidateEmail,
    candidatePhone,
    elapsedTime,
    message,
    metadata: {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    },
    testId,
    type,
  }
}

export async function sendViolationToBackend({ candidateEmail, candidatePhone, elapsedTime, message, testId, type }) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/tests/${testId}/log-violation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
      retries: 0,
      body: JSON.stringify(buildViolationPayload({ candidateEmail, candidatePhone, elapsedTime, message, testId, type })),
    })

    if (!response.ok) {
      console.error("Échec d'envoi de violation anti-triche:", response.status, await response.text())
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi d'une violation anti-triche:", error)
  }
}
