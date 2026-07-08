const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")

function buildPublicApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

async function parseApiResponse(response) {
  const contentType = response.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    return response.json()
  }

  return null
}

function extractApiErrorMessage(data) {
  if (typeof data?.error === "string" && data.error.trim()) {
    return data.error.trim()
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message.trim()
  }

  return "Erreur de communication avec le serveur"
}

async function requestPublicApi(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData

  if (options.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const headerEntries = Object.fromEntries(headers.entries())

  const response = await fetch(buildPublicApiUrl(path), {
    ...options,
    headers: Object.keys(headerEntries).length > 0 ? headerEntries : undefined,
  })

  const data = await parseApiResponse(response)

  if (!response.ok) {
    throw new Error(extractApiErrorMessage(data))
  }

  return data
}

export async function getUpcomingEvents() {
  const data = await requestPublicApi("/api/events/upcoming")
  return data?.events || []
}

export async function getPastEvents() {
  const data = await requestPublicApi("/api/events/past")
  return data?.events || []
}

export async function getEventCollections() {
  const [upcomingEvents, pastEvents] = await Promise.all([getUpcomingEvents(), getPastEvents()])

  return {
    upcomingEvents,
    pastEvents,
  }
}

export async function getPublishedPortalContent(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, String(value))
    }
  })
  const query = params.toString() ? `?${params.toString()}` : ""
  const data = await requestPublicApi(`/api/portal-content/public${query}`)
  return data?.data || []
}

export async function getCandidatureStatus(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, String(value))
    }
  })
  const query = params.toString() ? `?${params.toString()}` : ""
  const data = await requestPublicApi(`/api/candidature/status${query}`)
  return data?.data || { isOpen: false, lifecycleStatus: "closed" }
}

export async function createEvent(payload) {
  return requestPublicApi("/api/events/", {
    method: "POST",
    body: payload,
  })
}

export async function registerToEvent(eventId, payload) {
  return requestPublicApi(`/api/events/${eventId}/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function subscribeToNewsletter(email) {
  return requestPublicApi("/api/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

export async function requestCoworkingAccess(payload) {
  return requestPublicApi("/api/resources/request-access", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function checkUniqueCandidatureField(field, value) {
  return requestPublicApi(`/api/candidature/check-unique?field=${field}&value=${encodeURIComponent(value)}`)
}

export async function submitOdcCandidature(payload) {
  return requestPublicApi("/api/candidature/apply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
}

export async function checkStartupEmailExists(email) {
  return requestPublicApi(`/api/startup/check-email?email=${encodeURIComponent(email)}`)
}

export async function checkStartupPhoneExists(phone) {
  return requestPublicApi(`/api/startup/check-phone?phone=${encodeURIComponent(phone)}`)
}

export async function submitStartupApplication(payload) {
  return requestPublicApi("/api/startup/submit", {
    method: "POST",
    body: payload,
  })
}

export async function checkOrangeFabEmailExists(email) {
  return requestPublicApi(`/api/orangefab/check-email?email=${encodeURIComponent(email)}`)
}

export async function checkOrangeFabPhoneExists(phone) {
  return requestPublicApi(`/api/orangefab/check-phone?phone=${encodeURIComponent(phone)}`)
}

export async function submitOrangeFabApplication(payload) {
  return requestPublicApi("/api/orangefab/", {
    method: "POST",
    body: payload,
  })
}

export function getPublicMediaUrl(path) {
  if (!path) {
    return ""
  }

  if (path.startsWith("http")) {
    return path
  }

  if (path.startsWith("/static/") || path.startsWith("/uploads/")) {
    return `${API_BASE_URL}${path}`
  }

  if (path.startsWith("/")) {
    return path
  }

  return `${API_BASE_URL}${path}`
}
