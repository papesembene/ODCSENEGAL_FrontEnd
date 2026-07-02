// odcdeploye\frontend\components\home\partners-section.jsx

"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const PartnersSection = () => {
  const partners = [
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
    { name: "simplon", logo: "simplon.jpg" },
    { name: "stic", logo: "stic.jpg" },
    { name: "Université Aliou Diop de Bambey", logo: "uabd.jpg" },
    { name: "Université Assane Seck de Ziguinchor", logo: "uaz.jpg" },
    { name: "Université Gaston berger", logo: "ugb.jpg" },
    { name: "Université Khadimou Rassoul de Touba", logo: "ukrat.jpg" },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const visiblePartners = []

  for (let i = 0; i < 4; i++) {
    const partnerIndex = (currentIndex + i) % partners.length
    visiblePartners.push(partners[partnerIndex])
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % partners.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [partners.length])

  return (
    <section className="relative overflow-hidden bg-white py-24 dark:bg-gray-950">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
      <div className="absolute left-1/2 top-0 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-orange-100/80 blur-3xl dark:bg-orange-500/10" />
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
            Écosystème
          </span>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-5xl">
            Partenaires
          </h2>
          <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Ils nous font confiance et nous accompagnent dans notre mission.
          </p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
            {visiblePartners.map((partner, index) => (
              <motion.div
                key={`${partner.name}-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="group flex h-32 items-center justify-center rounded-[1.5rem] border border-gray-200/80 bg-white p-5 shadow-lg shadow-gray-200/60 transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-100 dark:border-white/10 dark:bg-white/5 dark:shadow-none"
              >
                <div className="relative h-16 w-32">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100px, 150px"
                    priority
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default PartnersSection
