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
    return { key: "upcoming", canApply: false, label: "Ouverture prochainement", title: "Les candidatures ouvriront prochainement", message: "Le formulaire sera accessible à l'ouverture officielle de la campagne." }
  }
  return { key: "closed", canApply: false, label: "Candidatures fermées", title: "Les candidatures sont fermées", message: "Il n'est pas possible de déposer une candidature actuellement. Les informations sur les formations restent consultables." }
}

export function isFormationApplicationLink(href) {
  if (typeof href !== "string") return false
  return href.split(/[?#]/)[0].replace(/\/+$/, "") === "/odc/candidatures"
}

export function getCampaignRefreshDelay(status, now = Date.now()) {
  const value = status?.isOpen ? status?.campaign?.endAt : status?.campaign?.startAt
  if (!value) return null
  const date = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}Z`
  const boundary = Date.parse(date)
  if (!Number.isFinite(boundary)) return null
  // Naive backend dates are UTC. Bound retries if a device clock is ahead.
  return boundary <= now ? 60000 : Math.min(boundary - now + 100, MAX_TIMEOUT)
}
