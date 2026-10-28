import styles from "./home-sections.module.css"
import RevealWords from "@/components/motion/reveal-words"

export default function SectionHeading({ id, eyebrow, title, description, aside }) {
  return (
    <div className={styles.sectionHeading} data-reveal="heading">
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={id} className={styles.sectionTitle}><RevealWords maskClassName={styles.wordMask}>{title}</RevealWords></h2>
        {description && <p className={styles.sectionDescription}>{description}</p>}
      </div>
      {aside}
    </div>
  )
}
