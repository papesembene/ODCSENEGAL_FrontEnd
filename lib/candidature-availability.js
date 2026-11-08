const MAX_TIMEOUT = 24 * 60 * 60 * 1000

export function getCandidatureAvailability(status, phase = "ready") {
  if (phase === "loading") {
    return { key: "loading", canApply: false, label: "Vérification en cours…", title: "Vérification des candidatures", message: "Nous vérifions si une campagne de candidature est ouverte." }
  }
  if (phase === "error") {
    return { key: "error", canApply: false, label: "Statut indisponible", title: "Vérification momentanément indisponible", message: "Impossible de vérifier l'ouverture des candidatures. Réessayez avant de remplir le formulaire." }
  }
  if (status?.isOpen === true) {
    return { key: "open", canApply: true, label: "Postuler", title: "Les candidatures sont ouvertes", message: "Vous pouvez déposer votre candidature à une formation." }
  }
  if (status?.lifecycleStatus === "upcoming") {
    return { key: "upcoming", canApply: false, label: "Ouverture bientôt", title: "Les candidatures ouvrent bientôt", message: parseCampaignDate(status?.campaign?.startAt) === null
      ? "La date d'ouverture sera annoncée prochainement."
      : "Préparez votre candidature. Le formulaire sera accessible dès l'ouverture officielle." }
  }
  return { key: "closed", canApply: false, label: "Candidatures fermées", title: "Les candidatures sont fermées", message: "Il n'est pas possible de déposer une candidature actuellement. Les informations sur les formations restent consultables." }
}

export function isFormationApplicationLink(href) {
  if (typeof href !== "string") return false
  return href.split(/[?#]/)[0].replace(/\/+$/, "") === "/odc/candidatures"
}

export function parseCampaignDate(value) {
  if (typeof value !== "string" || !value.trim()) return null
  const date = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}Z`
  const timestamp = Date.parse(date)
  return Number.isFinite(timestamp) ? timestamp : null
}

export function getCampaignCountdown(value, now) {
  const boundary = parseCampaignDate(value)
  if (boundary === null || !Number.isFinite(now) || boundary <= now) return null
  const seconds = Math.ceil((boundary - now) / 1000)
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60,
  }
}

export function formatCampaignOpeningDate(value) {
  const timestamp = parseCampaignDate(value)
  if (timestamp === null) return ""
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Africa/Dakar", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(timestamp)
}

export function getCampaignRefreshDelay(status, now = Date.now()) {
  const value = status?.isOpen ? status?.campaign?.endAt : status?.campaign?.startAt
  const boundary = parseCampaignDate(value)
  if (boundary === null) return null
  // Naive backend dates are UTC. Bound retries if a device clock is ahead.
  return boundary <= now ? 60000 : Math.min(boundary - now + 100, MAX_TIMEOUT)
}
