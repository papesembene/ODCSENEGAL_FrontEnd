import { Award, BriefcaseBusiness, Handshake, Users } from "lucide-react"
import SectionHeading from "./section-heading"
import styles from "./home-sections.module.css"

const STATISTICS = [
  { value: "1 000+", label: "Jeunes formés", Icon: Users },
  { value: "50+", label: "Startups accompagnées", Icon: Award },
  { value: "200+", label: "Emplois créés", Icon: BriefcaseBusiness },
  { value: "30+", label: "Partenaires", Icon: Handshake },
]

export default function StatisticsSection() {
  return (
    <section className={`${styles.section} ${styles.impactSection}`} aria-labelledby="impact-title" data-impact-section="">
      <div className={styles.container}>
        <SectionHeading
          id="impact-title"
          eyebrow="Un engagement, des résultats"
          title="Des parcours qui font la différence."
          description="L'engagement d'Orange Digital Center pour le développement numérique au Sénégal, en quelques chiffres."
        />
        <dl className={styles.statisticsGrid}>
          {STATISTICS.map(({ value, label, Icon }) => (
            <div key={label} className={styles.statistic} data-reveal="statistic">
              <Icon size={24} aria-hidden="true" />
              <dt>{label}</dt>
              <dd className={styles.statisticValue}><span data-impact-value="">{value}</span></dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
