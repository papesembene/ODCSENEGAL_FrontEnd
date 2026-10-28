import styles from "./hero-section.module.css"

export default function HeroSignature() {
  return (
    <div className={styles.signature} data-hero-signature="">
      <p className={styles.signatureLabel}>Votre avenir commence ici</p>
      <p className="sr-only">Apprendre. Créer. Entreprendre.</p>
      <div className={styles.signatureWindow} aria-hidden="true">
        <div className={styles.signatureTrack}>
          <span>Apprendre.</span><span>Créer.</span><span>Entreprendre.</span>
        </div>
      </div>
      <span className={styles.signatureRule} aria-hidden="true" />
    </div>
  )
}
