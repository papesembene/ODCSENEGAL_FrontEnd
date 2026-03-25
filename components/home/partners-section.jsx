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
    <section className="bg-white py-16 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Partenaires
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Ils nous font confiance et nous accompagnent dans notre mission.
          </p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {visiblePartners.map((partner, index) => (
              <motion.div
                key={`${partner.name}-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
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
