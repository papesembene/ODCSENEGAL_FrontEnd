export function readStoredJsonValue(key) {
  if (typeof window === "undefined") {
    return null
  }

  const rawValue = localStorage.getItem(key)
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue)
  } catch (error) {
    console.warn(`Impossible de parser la valeur locale pour ${key}:`, error)
    return null
  }
}

export function writeStoredJsonValue(key, value) {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(key, JSON.stringify(value))
}

export function writeStoredValue(key, value) {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(key, value)
}

export function removeStoredValues(keys) {
  if (typeof window === "undefined") {
    return
  }

  keys.forEach((key) => localStorage.removeItem(key))
}

export function resolveStoredTestSession({ startedAt, durationInMinutes }) {
  if (!startedAt) {
    return null
  }

  const startedAtDate = new Date(startedAt)
  if (Number.isNaN(startedAtDate.getTime())) {
    return null
  }

  const endTime = startedAtDate.getTime() + durationInMinutes * 60000
  const remainingSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000))

  return {
    expired: remainingSeconds <= 0,
    remainingSeconds,
  }
}
