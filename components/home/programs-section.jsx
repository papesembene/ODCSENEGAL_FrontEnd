import Image from "next/image"
import Link from "@/components/ui/interactive-link"
import { ArrowRight, BookOpen, Rocket } from "lucide-react"
import SectionHeading from "./section-heading"
import MotionPhoto from "./motion-photo"
import ProgramStack from "./program-stack"
import styles from "./home-sections.module.css"

const PROGRAMS = [
  {
    id: "competences",
    number: "01",
    eyebrow: "Se former",
    title: "Développez vos compétences numériques.",
    description: "Des formations gratuites dans les métiers du numérique pour apprendre, pratiquer et préparer votre avenir professionnel.",
    image: "/odc2Accueil.jpg",
    href: "/competences",
    action: "Découvrir les formations",
    Icon: BookOpen,
  },
  {
    id: "startups",
    number: "02",
    eyebrow: "Entreprendre",
    title: "Donnez de l'élan à votre startup.",
    description: "Un accompagnement sur mesure pour faire grandir votre projet, de la première idée au développement de votre entreprise.",
    image: "/oss1.png",
    href: "/startups",
    action: "Explorer les programmes",
    Icon: Rocket,
  },
]

export default function ProgramsSection() {
  return (
    <section id="programmes" className={`${styles.section} ${styles.programsSection}`} aria-labelledby="programmes-title">
      <div className={styles.container}>
        <SectionHeading
          id="programmes-title"
          eyebrow="Apprendre. Créer. Entreprendre."
          title={<>Votre <span className={styles.programsAccent}>ambition.</span><br />Notre point de départ.</>}
          description="Une initiative de Sonatel pour développer les compétences numériques, favoriser l'emploi des jeunes et accompagner les startups au Sénégal."
          aside={
            <Link href="/about" className={styles.textLink}>
              Découvrir le centre <ArrowRight size={18} aria-hidden="true" />
            </Link>
          }
        />
        <ProgramStack className={styles.programGrid}>
          {PROGRAMS.map(({ id, number, eyebrow, title, description, image, href, action, Icon }, index) => (
            <Link key={id} href={href} className={styles.programCard} aria-labelledby={`${id}-title`}
              data-reveal="card" data-motion-profile="program" style={{ "--program-order": index }}>
              <MotionPhoto className={styles.programImage}>
                <Image src={image} alt="" fill sizes="(max-width: 1023px) 100vw, 60vw" />
                <span className={styles.programCategory}><Icon size={16} aria-hidden="true" />{eyebrow}</span>
                <span className={styles.programNumber} aria-hidden="true">{number}</span>
              </MotionPhoto>
              <div className={styles.programBody}>
                <span className={styles.programChapter}>Parcours {number} / {eyebrow}</span>
                <h3 id={`${id}-title`}>{title}</h3>
                <p>{description}</p>
                <span className={styles.programAction}>
                  {action}<span className={styles.arrowBadge}><ArrowRight size={21} aria-hidden="true" /></span>
                </span>
              </div>
            </Link>
          ))}
        </ProgramStack>
      </div>
    </section>
  )
}
