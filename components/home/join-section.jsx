import Link from "@/components/ui/interactive-link"
import { ArrowUpRight } from "lucide-react"
import styles from "./home-sections.module.css"
import CandidatureButton from "@/components/candidatures/candidature-button"
import RevealWords from "@/components/motion/reveal-words"

export default function JoinSection() {
  return (
    <section className={styles.joinSection} aria-labelledby="join-title">
      <div className={`${styles.container} ${styles.joinLayout}`}>
        <div data-reveal="heading">
          <p className={styles.eyebrow}>Votre prochaine étape commence ici</p>
          <h2 id="join-title"><RevealWords maskClassName={styles.wordMask}>Et si on construisait<br />la suite <span className={styles.joinAccent}>ensemble ?</span></RevealWords></h2>
          <p className={styles.joinDescription}>Étudiant, entrepreneur ou professionnel : trouvez le programme qui correspond à votre projet.</p>
        </div>
        <div className={styles.joinLinks} data-reveal="card">
          <CandidatureButton label="Postuler à une formation" eyebrow="Formations numériques" />
          <Link href="/startups">
            <span><small>J'ai un projet à développer</small>Je découvre l'accompagnement</span>
            <ArrowUpRight size={26} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
