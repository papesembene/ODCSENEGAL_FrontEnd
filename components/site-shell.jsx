"use client"

import { usePathname } from "next/navigation"

import Footer from "@/components/footer"
import Header from "@/components/header"
import CandidatureStatusProvider from "@/components/candidatures/candidature-status-provider"
import PageMotion from "@/components/motion/page-motion"
import TrainingCatalogProvider from "@/components/trainings/training-catalog-provider"

export default function SiteShell({ children }) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith("/astrodmin")

  if (isAdminRoute) {
    return (
      <PageMotion pathname={pathname}>
        <main className="h-dvh min-h-0 overflow-hidden"><TrainingCatalogProvider>{children}</TrainingCatalogProvider></main>
      </PageMotion>
    )
  }

  return (
    <PageMotion pathname={pathname}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <TrainingCatalogProvider><CandidatureStatusProvider pathname={pathname}>{children}</CandidatureStatusProvider></TrainingCatalogProvider>
        </main>
        <Footer />
      </div>
    </PageMotion>
  )
}
