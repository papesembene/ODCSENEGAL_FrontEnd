"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Megaphone } from "lucide-react"
import { getPublishedPortalContent } from "@/lib/public-api"

export default function PortalAnnouncementsSection() {
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    let isActive = true

    getPublishedPortalContent({ type: "info", placement: "home" })
      .then((contents) => {
        if (isActive) {
          setAnnouncements(contents)
        }
      })
      .catch(() => {
        if (isActive) {
          setAnnouncements([])
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  if (announcements.length === 0) {
    return null
  }

  const announcement = announcements[0]

  return (
    <section className="border-b border-orange-200 bg-orange-50 px-4 py-3 text-orange-950">
      <div className="container mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
          <div>
            <p className="font-semibold">{announcement.title}</p>
            {announcement.summary && (
              <p className="text-sm text-orange-900/80">{announcement.summary}</p>
            )}
          </div>
        </div>
        {announcement.linkUrl && announcement.linkLabel && (
          <Link href={announcement.linkUrl} className="text-sm font-semibold text-orange-700 hover:underline">
            {announcement.linkLabel}
          </Link>
        )}
      </div>
    </section>
  )
}
