"use client"

import { useEffect, useState } from "react"
import NewsMarquee from "@/components/home/news-marquee"
import { getPublishedPortalContent } from "@/lib/public-api"

function mapPortalNews(content) {
  return {
    id: content.id,
    title: content.title,
    slug: content.id,
    linkUrl: content.linkUrl || "/actualites",
    isBreaking: content.isPinned,
    category: content.category || "Nouveauté",
  }
}

export default function PortalNewsSection() {
  const [news, setNews] = useState([])

  useEffect(() => {
    let isActive = true

    getPublishedPortalContent({ type: "news", placement: "home" })
      .then((contents) => {
        if (isActive) {
          setNews(contents.map(mapPortalNews))
        }
      })
      .catch(() => {
        if (isActive) {
          setNews([])
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  if (news.length === 0) {
    return null
  }

  return <NewsMarquee news={news} />
}
