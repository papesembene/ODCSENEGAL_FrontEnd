"use client"

import { ArrowLeft, ArrowRight, Quote } from "lucide-react"
import SectionHeading from "./section-heading"
import useSoftCarousel from "./use-soft-carousel"
import styles from "./home-sections.module.css"

const TESTIMONIALS = [
  {
    content: "La formation ODC a été une expérience profondément enrichissante qui m’a permis de renforcer mes compétences en cloud computing, développement et DevOps, tout en apprenant à collaborer, à rester motivée et à progresser continuellement. Au-delà des aspects techniques, ODC m’a donné confiance en moi et m’a appris à croire en mon potentiel. J’y ai découvert une véritable communauté basée sur l’entraide et la solidarité.",
    author: "Khady DIAGNE",
    role: "Alumnis Référentiel AWS",
    initials: "KD",
  },
  {
    content: "Grâce à la formation Référent Digital à Orange Digital Center, j’ai pu acquérir des compétences solides en transformation digitale et en gestion de projets numériques. Cette expérience m’a également permis de développer mes soft skills, d’être plus agile et de mieux m’adapter aux défis du monde professionnel.",
    author: "Assietou SY",
    role: "Alumnis Référent Digital",
    initials: "AS",
  },
]

export default function TestimonialsSection() {
  const { current, requested, leaving, move } = useSoftCarousel(TESTIMONIALS.length)

  return (
    <section className={`${styles.section} ${styles.testimonialsSection}`} aria-labelledby="testimonials-title" data-testimonials-section="">
      <div className={`${styles.container} ${styles.testimonialsLayout}`}>
        <div>
          <SectionHeading id="testimonials-title" eyebrow="Celles et ceux qui l'ont vécu" title={<>Des compétences.<br />Et bien plus encore.</>} />
          <p className={styles.sectionDescription}>Derrière chaque parcours, une histoire. Nos alumni racontent leur expérience.</p>
          <div className={styles.quoteControls} role="group" aria-label="Navigation des témoignages">
            <button type="button" onClick={() => move(-1)} aria-label="Témoignage précédent"><ArrowLeft size={20} aria-hidden="true" /></button>
            <span>{String(requested + 1).padStart(2, "0")} / {String(TESTIMONIALS.length).padStart(2, "0")}</span>
            <button type="button" onClick={() => move(1)} aria-label="Témoignage suivant"><ArrowRight size={20} aria-hidden="true" /></button>
          </div>
        </div>
        <div className={styles.testimonialStage} data-testimonial-stage="" data-reveal="quote"
          aria-live="polite" aria-atomic="true" aria-busy={leaving}>
          {TESTIMONIALS.map((testimonial, index) => (
            <figure key={testimonial.author} className={styles.testimonial}
              data-active={current === index} data-quote-phase={leaving ? "leaving" : "entering"}
              aria-hidden={current !== index}>
              <Quote size={64} aria-hidden="true" />
              <blockquote>{testimonial.content}</blockquote>
              <figcaption>
                <span className={styles.avatar} aria-hidden="true">{testimonial.initials}</span>
                <span><strong>{testimonial.author}</strong><small>{testimonial.role}</small></span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
