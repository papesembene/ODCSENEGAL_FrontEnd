"use client"

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

export function buildViolationPayload({ candidateEmail, elapsedTime, message, testId, type }) {
  return {
    candidateEmail,
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

export async function sendViolationToBackend({ candidateEmail, elapsedTime, message, testId, type }) {
  try {
    const apiBaseUrl =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

    const response = await fetch(`${apiBaseUrl}/api/admin/tests/${testId}/log-violation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildViolationPayload({ candidateEmail, elapsedTime, message, testId, type })),
    })

    if (!response.ok) {
      console.error("Échec d'envoi de violation anti-triche:", response.status, await response.text())
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi d'une violation anti-triche:", error)
  }
}
