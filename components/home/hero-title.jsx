import styles from "./hero-section.module.css"
import RevealWords from "@/components/motion/reveal-words"

export default function HeroTitle({ children }) {
  return (
    <h1 id="home-title">
      <RevealWords maskClassName={styles.titleWord}>{String(children || "")}</RevealWords>
    </h1>
  )
}
