"use client"

import Image from "next/image"
import Link from "@/components/ui/interactive-link"
import { useState } from "react"
import { ArrowDown, ArrowUpRight } from "lucide-react"
import { getPublicMediaUrl } from "@/lib/public-api"
import SectionHeading from "./section-heading"
import useHomeContent from "./use-home-content"
import styles from "./home-sections.module.css"
import CandidatureButton from "@/components/candidatures/candidature-button"
import { isFormationApplicationLink } from "@/lib/candidature-availability"

export default function PortalNewsSection() {
  const news = useHomeContent("news")
  const [showAll, setShowAll] = useState(false)
  if (!news.length) return null

  return (
    <section className={`${styles.section} ${styles.newsSection}`} aria-labelledby="home-news-title">
      <div className={styles.container}>
        <SectionHeading
          id="home-news-title"
          eyebrow="La vie du centre"
          title="En ce moment à l'ODC."
          aside={news.length > 3 && (
            <button type="button" className={styles.textLink} aria-expanded={showAll} aria-controls="home-news-items" onClick={() => setShowAll((value) => !value)}>
              {showAll ? "Réduire les actualités" : "Voir toutes les actualités"}<ArrowDown size={18} aria-hidden="true" />
            </button>
          )}
        />
        <div id="home-news-items" className={styles.newsGrid}>
          {(showAll ? news : news.slice(0, 3)).map((item) => {
            const image = getPublicMediaUrl(item.imageUrl)
            const application = isFormationApplicationLink(item.linkUrl)
            const linked = item.linkUrl && !application
            const Card = linked ? Link : "article"
            return (
              <Card key={item.id} {...(linked ? { href: item.linkUrl } : {})} className={styles.newsCard} data-reveal="card">
                {image && (
                  <div className={styles.newsImage}>
                    <Image src={image} alt="" fill sizes="120px" unoptimized={image.startsWith("http")} />
                  </div>
                )}
                <div className={styles.newsBody}>
                  <span>{item.category || "Actualité"}</span>
                  <h3>{item.title}</h3>
                  {item.summary && <p>{item.summary}</p>}
                  {application && <CandidatureButton label={item.linkLabel || "Postuler"} className={styles.textLink} />}
                  {linked && <ArrowUpRight size={20} aria-hidden="true" />}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
