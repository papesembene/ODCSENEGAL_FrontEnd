export const DEFAULT_HOME_SLIDES = [
  {
    slotKey: "candidature",
    type: "banner",
    title: "Appel à candidature",
    summary: "Les informations de la prochaine campagne seront affichées dès leur publication officielle.",
    imageUrl: "/odcCadidature.jpg?height=600&width=1200",
    linkLabel: "Postuler",
    linkUrl: "/candidatures/fermees",
    placement: "home",
    priority: 30,
    isPinned: true,
    status: "published",
    category: "Candidature",
  },
  {
    slotKey: "competences",
    type: "banner",
    title: "Développez vos compétences numériques",
    summary: "Des formations gratuites et de qualité pour booster votre employabilité dans les métiers du numérique.",
    imageUrl: "/odc1Accueil.jpg?height=600&width=1200",
    linkLabel: "Découvrir nos formations",
    linkUrl: "/competences",
    placement: "home",
    priority: 20,
    isPinned: false,
    status: "published",
    category: "Formation",
  },
  {
    slotKey: "startups",
    type: "banner",
    title: "Faites décoller votre startup",
    summary: "Un accompagnement sur mesure pour transformer votre idée en entreprise viable et scalable.",
    imageUrl: "/odc2Accueil.jpg?height=600&width=1200",
    linkLabel: "Explorer nos programmes",
    linkUrl: "/startups",
    placement: "home",
    priority: 10,
    isPinned: false,
    status: "published",
    category: "Startup",
  },
]

export function buildHomeSlides(managedSlides = []) {
  const managedBySlot = new Map(
    managedSlides
      .filter((slide) => slide.slotKey)
      .map((slide) => [slide.slotKey, slide])
  )
  const customSlides = managedSlides.filter((slide) => !slide.slotKey)

  return [
    ...DEFAULT_HOME_SLIDES.map((slide) => ({
      ...slide,
      ...(managedBySlot.get(slide.slotKey) || {}),
      isDefaultSlide: !managedBySlot.has(slide.slotKey),
    })),
    ...customSlides,
  ]
}

export function applyCandidatureStatusToSlides(slides, candidatureStatus) {
  return slides.map((slide) => {
    if (slide.slotKey !== "candidature" && slide.category !== "Candidature") {
      return slide
    }

    const campaign = candidatureStatus?.campaign
    const isOpen = Boolean(candidatureStatus?.isOpen)
    const periodText = campaign?.startAt && campaign?.endAt
      ? `Du ${formatCampaignDate(campaign.startAt)} au ${formatCampaignDate(campaign.endAt)}`
      : ""
    const campaignTitle = campaign?.title || slide.title
    const campaignPromotion = campaign?.promotion ? ` | ${campaign.promotion}` : ""
    const campaignSummary = buildCampaignSummary({
      campaign,
      isOpen,
      periodText,
      fallback: slide.summary,
    })

    return {
      ...slide,
      title: campaign ? `${campaignTitle}${campaignPromotion}` : slide.title,
      summary: campaignSummary,
      linkLabel: isOpen ? "Postuler" : "Candidatures fermées",
      linkUrl: isOpen ? "/odc/candidatures" : "/candidatures/fermees",
    }
  })
}

function buildCampaignSummary({ campaign, isOpen, periodText, fallback }) {
  if (!campaign) {
    return fallback
  }

  if (isOpen) {
    return periodText
      ? `${periodText}, les candidatures sont ouvertes.`
      : "Les candidatures sont ouvertes."
  }

  if (campaign.lifecycleStatus === "upcoming") {
    return periodText
      ? `${periodText}, les candidatures ouvriront prochainement.`
      : "Les candidatures ouvriront prochainement."
  }

  return periodText
    ? `${periodText}, les candidatures sont fermées.`
    : "Les candidatures sont fermées."
}

function formatCampaignDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}
