"use client"

import { getPublicMediaUrl } from "@/lib/public-api"
import { applyCandidatureStatusToSlides, buildHomeSlides } from "@/lib/home-content-defaults"
import { useCandidatureStatus } from "@/components/candidatures/candidature-status-provider"
import useHomeContent from "./use-home-content"

function mapSlide(content) {
  const pendingCampaign = content.slotKey === "candidature" && !content.campaignStatusKnown

  return {
    id: content.id || content.slotKey || content.title,
    title: content.title,
    description: content.summary || content.body || "",
    category: content.category || "À la une",
    image: getPublicMediaUrl(content.imageUrl) || "/odc1Accueil.jpg",
    cta: {
      text: pendingCampaign ? "Découvrir les formations" : content.linkLabel || "En savoir plus",
      link: pendingCampaign ? "/competences" : content.linkUrl || "/actualites",
    },
  }
}

export default function useHomeSlides() {
  const banners = useHomeContent("banner")
  const { status, phase } = useCandidatureStatus()
  const contents = buildHomeSlides(banners)
  const resolved = phase === "ready"
    ? applyCandidatureStatusToSlides(contents, status).map((content) => ({ ...content, campaignStatusKnown: true }))
    : contents
  return resolved.map(mapSlide)
}
