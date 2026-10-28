import Image from "next/image"
import styles from "./public-page-hero.module.css"

export default function PublicPageHero({ eyebrow, title, description, image, imageClassName, children }) {
  return (
    <section className={styles.hero} data-public-hero="">
      {image && <Image src={image} alt="" fill priority sizes="100vw"
        className={`${styles.image} ${imageClassName || ""}`} />}
      <div className={styles.overlay} aria-hidden="true" />
      <div className={`container ${styles.container}`}>
        <div className={styles.content}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h1>{title}</h1>
          <p className={styles.description}>{description}</p>
          {children && <div className={styles.actions}>{children}</div>}
        </div>
      </div>
    </section>
  )
}
