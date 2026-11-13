/**
 * Helper pour les requêtes fetch avec timeout et retry
 * Évite les erreurs "failed to fetch" lors de requêtes longues
 */

const SERVICE_UNAVAILABLE_MESSAGE = "Le service est temporairement indisponible. Veuillez réessayer."

/**
 * Crée un AbortController avec timeout
 * @param {number} timeout - Timeout en millisecondes (défaut: 30000)
 * @returns {AbortController}
 */
function createTimeoutController(timeout = 30000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  return { controller, timeoutId }
}

function buildRequestHeaders(url, headers) {
  const requestHeaders = new Headers(headers || {})

  if (typeof window !== "undefined" && url.includes("/api/admin")) {
    const adminToken = localStorage.getItem("admin_token")
    if (adminToken && !requestHeaders.has("Authorization")) {
      requestHeaders.set("Authorization", `Bearer ${adminToken}`)
    }
  }

  return requestHeaders
}

export function handleExpiredAdminSession(url) {
  if (typeof window === "undefined" || !url.includes("/api/admin")) {
    return
  }

  if (window.location.pathname.startsWith("/test/")) {
    return
  }

  localStorage.removeItem("admin_token")
  localStorage.removeItem("admin_type")
  localStorage.removeItem("admin_email")
  localStorage.removeItem("admin_user")

  if (window.location.pathname !== "/astrodmin") {
    window.location.href = "/astrodmin"
  }
}

/**
 * Effectue une requête fetch avec timeout
 * @param {string} url - URL de la requête
 * @param {Object} options - Options de fetch (peut inclure timeout)
 * @param {number} options.timeout - Timeout en millisecondes (défaut: 30000)
 * @param {number} options.retries - Nombre de tentatives en cas d'échec (défaut: 1)
 * @param {number} options.retryDelay - Délai entre les tentatives en ms (défaut: 1000)
 * @returns {Promise<Response>}
 */
export async function fetchWithTimeout(url, options = {}) {
  const {
    timeout = 30000, // 30 secondes par défaut
    retries = 1,
    retryDelay = 1000,
    ...fetchOptions
  } = options

  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { controller, timeoutId } = createTimeoutController(timeout)
      const requestHeaders = buildRequestHeaders(url, fetchOptions.headers)

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers: Object.fromEntries(requestHeaders.entries()),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        return response
      } catch (fetchError) {
        clearTimeout(timeoutId)

        // Si c'est une erreur d'abort (timeout), propager immédiatement
        if (fetchError.name === 'AbortError') {
          throw new Error("Le service met trop de temps à répondre. Veuillez réessayer.")
        }

        throw fetchError
      }
    } catch (error) {
      lastError = error

      // Si ce n'est pas la dernière tentative, attendre avant de réessayer
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)))
        continue
      }
    }
  }

  // Si toutes les tentatives ont échoué
  if (lastError) {
    throw new Error(SERVICE_UNAVAILABLE_MESSAGE)
  }
  throw new Error(SERVICE_UNAVAILABLE_MESSAGE)
}

/**
 * Effectue une requête fetch avec timeout et parse automatiquement le JSON
 * @param {string} url - URL de la requête
 * @param {Object} options - Options (mêmes que fetchWithTimeout)
 * @returns {Promise<Object>} - Données JSON parsées
 */
export async function fetchJsonWithTimeout(url, options = {}) {
  const response = await fetchWithTimeout(url, options)

  if (!response.ok) {
    if (response.status >= 500) {
      throw new Error(SERVICE_UNAVAILABLE_MESSAGE)
    }

    let errorMessage = SERVICE_UNAVAILABLE_MESSAGE
    try {
      const errorData = await response.json()
      const message = [errorData?.error, errorData?.message].find(
        (value) => typeof value === "string" && value.trim(),
      )
      if (message) errorMessage = message.trim()
    } catch {
      // Conserver le message générique pour les réponses non lisibles.
    }

    if (response.status === 401) {
      handleExpiredAdminSession(url)
    }

    throw new Error(errorMessage)
  }

  try {
    return await response.json()
  } catch (error) {
    if (error.name === "AbortError") throw error
    throw new Error(SERVICE_UNAVAILABLE_MESSAGE)
  }
}
