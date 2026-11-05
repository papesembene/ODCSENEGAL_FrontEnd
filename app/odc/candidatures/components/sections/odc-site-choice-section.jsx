import { Building2, MapPin } from "lucide-react"
import CandidatureChoiceCard from "../candidature-choice-card"
import styles from "../candidature-choices.module.css"

export default function OdcSiteChoiceSection({ manager }) {
  const sites = manager.sitesWithOffers
  return <section id="choix-site" aria-labelledby="choix-site-title" className={styles.section}>
    <header className={styles.intro}>
      <span className={styles.eyebrow}>Votre formation, votre destination</span>
      <h2 id="choix-site-title">Où souhaitez-vous <span>vous former ?</span></h2>
      <p>Choisissez votre site Orange Digital Center. Vous découvrirez ensuite les formations qui y sont proposées.</p>
    </header>
    <fieldset className="min-w-0 border-0 p-0"><legend className="sr-only">Site de formation souhaité</legend>
      <div className={`${styles.choices} ${styles.sites}`}>{sites.map((site, index) => {
        const count = site.trainingCount
        return <CandidatureChoiceCard key={site.code} manager={manager} name="trainingSite" value={site.code}
          title={site.name} index={index} icon={site.code === "diamniadio-uam" ? Building2 : MapPin}>
          <span className="block font-medium">{count} formation{count > 1 ? "s" : ""} disponible{count > 1 ? "s" : ""}</span>
          {site.description && <span className="mt-1 block">{site.description}</span>}
        </CandidatureChoiceCard>
      })}</div>
    </fieldset>
    {manager.errors.trainingSite && <p id="trainingSite-error" className="mt-3 text-sm text-red-700">{manager.errors.trainingSite}</p>}
    {manager.catalog.phase === "ready" && !sites.length && <p role="status" className="mt-4 rounded-lg border p-4">Aucun site ne propose actuellement de formation ouverte à la candidature.</p>}
  </section>
}
