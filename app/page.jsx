import HeroSection from "@/components/home/hero-section"
import JoinSection from "@/components/home/join-section"
import PartnersSection from "@/components/home/partners-section"
import PortalAnnouncementsSection from "@/components/home/portal-announcements-section"
import PortalNewsSection from "@/components/home/portal-news-section"
import ProgramsSection from "@/components/home/programs-section"
import StatisticsSection from "@/components/home/statistics-section"
import TestimonialsSection from "@/components/home/testimonials-section"
import styles from "@/components/home/home-sections.module.css"

export default function Home() {
  return (
    <div className={styles.home} data-home-motion="">
      <HeroSection />
      <PortalAnnouncementsSection />
      <ProgramsSection />
      <StatisticsSection />
      <PortalNewsSection />
      <TestimonialsSection />
      <PartnersSection />
      <JoinSection />
    </div>
  )
}
