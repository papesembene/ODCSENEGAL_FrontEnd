"use client"

import Link from "@/components/ui/interactive-link"
import { ArrowRight, Megaphone } from "lucide-react"
import useHomeContent from "./use-home-content"
import styles from "./home-sections.module.css"
import CandidatureButton from "@/components/candidatures/candidature-button"
import { isFormationApplicationLink } from "@/lib/candidature-availability"

export default function PortalAnnouncementsSection() {
  const announcements = useHomeContent("info")
  const announcement = announcements[0]
  if (!announcement) return null

  return (
    <section className={styles.announcement} aria-label="Information du centre">
      <div className={`${styles.container} ${styles.announcementInner}`}>
        <Megaphone size={22} aria-hidden="true" />
        <div>
          <p className={styles.announcementTitle}>{announcement.title}</p>
          {announcement.summary && <p className={styles.announcementSummary}>{announcement.summary}</p>}
        </div>
        {announcement.linkUrl && announcement.linkLabel && (
          isFormationApplicationLink(announcement.linkUrl)
            ? <CandidatureButton label={announcement.linkLabel} className={styles.textLink} />
            : <Link href={announcement.linkUrl} className={styles.textLink}>{announcement.linkLabel}<ArrowRight size={17} aria-hidden="true" /></Link>
        )}
      </div>
    </section>
  )
}
