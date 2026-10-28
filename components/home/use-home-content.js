"use client"

import { useEffect, useState } from "react"
import { getPublishedPortalContent } from "@/lib/public-api"

export default function useHomeContent(type) {
  const [contents, setContents] = useState([])

  useEffect(() => {
    let active = true
    getPublishedPortalContent({ type, placement: "home" })
      .then((items) => { if (active) setContents(items) })
      .catch(() => { if (active) setContents([]) })
    return () => { active = false }
  }, [type])

  return contents
}
