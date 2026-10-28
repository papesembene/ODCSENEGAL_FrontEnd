import Image from "next/image"
import SectionHeading from "./section-heading"
import styles from "./home-sections.module.css"

const PARTNERS = [
  { name: "Sonatel", logo: "/logoSonatel.jpg" },
  { name: "Ministère du Numérique", logo: "/logoministereNumerique.webp" },
  { name: "Université Cheikh Anta Diop", logo: "/logoUniversitecheik.png" },
  { name: "GIZ", logo: "/giz.jpg" },
  { name: "Banque Mondiale", logo: "/logoBanquemondiale.webp" },
  { name: "Microsoft", logo: "/logoMicrosoft.png" },
  { name: "amm", logo: "/amm.jpg" },
  { name: "Gebeya", logo: "/Gebeya.jpg" },
  { name: "luxdev", logo: "/luxdev.jpg" },
  { name: "senum", logo: "/senum.jpg" },
  { name: "simplon", logo: "/simplon.jpg" },
  { name: "stic", logo: "/stic.jpg" },
  { name: "Université Aliou Diop de Bambey", logo: "/uabd.jpg" },
  { name: "Université Assane Seck de Ziguinchor", logo: "/uaz.jpg" },
  { name: "Université Gaston Berger", logo: "/ugb.jpg" },
  { name: "Université Khadimou Rassoul de Touba", logo: "/ukrat.jpg" },
]

export default function PartnersSection() {
  return (
    <section className={`${styles.section} ${styles.partnersSection}`} aria-labelledby="partners-title">
      <div className={`${styles.container} ${styles.partnersLayout}`}>
        <SectionHeading
          id="partners-title"
          eyebrow="Un écosystème engagé"
          title="Bien entourés pour aller plus loin."
          description="Ils nous accompagnent pour donner vie aux ambitions de toute une génération."
        />
        <ul className={styles.partnerGrid} aria-label="Nos partenaires">
          {PARTNERS.map(({ name, logo }) => (
            <li key={name} className={styles.partnerLogo} data-reveal="logo" data-motion-profile="partner">
              <Image src={logo} alt={name} width={150} height={72} sizes="(max-width: 480px) 100px, 150px" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
