"use client"

import Image from "next/image"
import Link from "@/components/ui/interactive-link"
import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import useHomeSlides from "./use-home-slides"
import useSoftCarousel from "./use-soft-carousel"
import HeroTitle from "./hero-title"
import useHeroFrame from "./use-hero-frame"
import HeroSignature from "./hero-signature"
import CandidatureButton from "@/components/candidatures/candidature-button"
import { isFormationApplicationLink } from "@/lib/candidature-availability"
import styles from "./hero-section.module.css"

export default function HeroSection() {
  const slides = useHomeSlides()
  const { current, requested, leaving, move, select } = useSoftCarousel(slides.length)
  const slide = slides[current]
  const heroRef = useHeroFrame()

  function handleNavigationKey(event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
    event.preventDefault()
    move(event.key === "ArrowRight" ? 1 : -1)
  }

  return (
    <section ref={heroRef} className={styles.hero} aria-labelledby="home-title" aria-roledescription="carrousel" data-active-slide={requested}>
      <div className={styles.visual} aria-hidden="true">
        {slides.map((item, index) => (
          <div key={item.id} className={`${styles.imageLayer} ${requested === index ? styles.activeImage : ""}`}>
            <Image
              src={item.image}
              alt=""
              fill
              sizes="100vw"
              unoptimized={item.image.startsWith("http")}
              priority={index === 0}
              className={item.image.includes("odc2Accueil") ? styles.startupImage : undefined}
            />
          </div>
        ))}
      </div>

      <div className={styles.main}>
        <div className={styles.identity}>
          <span className={styles.identityMark} aria-hidden="true" />
          Orange Digital Center Sénégal
        </div>
        <div className={styles.content} aria-live="polite" aria-atomic="true" aria-busy={leaving}>
          <div key={slide.id} className={styles.slideContent} data-slide-phase={leaving ? "leaving" : "entering"}
            onClickCapture={(event) => {
              if (leaving) { event.preventDefault(); event.stopPropagation() }
            }}>
            <p className={styles.category}><span aria-hidden="true" />{slide.category}</p>
            <HeroTitle>{slide.title}</HeroTitle>
            <p className={styles.description}>{slide.description}</p>
            <div className={styles.actions}>
              {isFormationApplicationLink(slide.cta.link) ? (
                <CandidatureButton label={slide.cta.text} className={styles.primaryAction} />
              ) : (
                <Link href={slide.cta.link} className={styles.primaryAction}>
                  {slide.cta.text}<ArrowRight size={20} aria-hidden="true" />
                </Link>
              )}
              <Link href="#programmes" className={styles.secondaryAction}>
                Nos programmes<ArrowDown size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
        <HeroSignature />
      </div>

      <div className={styles.footer}>
        <div className={styles.footerInner}>
          <Link href="#programmes" className={styles.scrollLink} aria-label="La suite commence ici">
            <span className={styles.scrollIcon}><ArrowDown size={18} aria-hidden="true" /></span>
            <span>La suite commence ici</span>
          </Link>
          <div className={styles.navigation} role="group" aria-label="Navigation des slides" onKeyDown={handleNavigationKey}>
            <div className={styles.slideSelectors}>
              {slides.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Aller au slide ${index + 1} : ${item.category}`}
                  aria-current={requested === index ? "true" : undefined}
                  onClick={() => select(index)}
                ><span /></button>
              ))}
            </div>
            <span className={styles.counter} aria-label={`Slide ${requested + 1} sur ${slides.length}`}>
              <strong>{String(requested + 1).padStart(2, "0")}</strong>
              <span>/ {String(slides.length).padStart(2, "0")}</span>
            </span>
            <button type="button" onClick={() => move(-1)} className={styles.arrowButton} aria-label="Slide précédent">
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => move(1)} className={styles.arrowButton} aria-label="Slide suivant">
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
