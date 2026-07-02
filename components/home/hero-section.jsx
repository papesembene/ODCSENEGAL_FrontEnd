// odcdeploye\frontend\components\home\hero-section.jsx
 
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

const SLIDES = [
  {
    title: "Appel à Candidature – Promotion 2026 | École du Code Sonatel Academy",
    description: "Du 03 au 17 novembre 2025, saisissez l’opportunité de vous former gratuitement aux métiers du numérique",
    image: "/odcCadidature.jpg?height=600&width=1200",
    cta: {
      text: "Postuler",
      link: "/candidatures/fermees",
    },
  },
  {
    title: "Développez vos compétences numériques",
    description: "Des formations gratuites et de qualité pour booster votre employabilité dans les métiers du numérique.",
    image: "/odc1Accueil.jpg?height=600&width=1200",
    cta: {
      text: "Découvrir nos formations",
      link: "/competences",
    },
  },
  {
    title: "Faites décoller votre startup",
    description: "Un accompagnement sur mesure pour transformer votre idée en entreprise viable et scalable.",
    image: "/odc2Accueil.jpg?height=600&width=1200",
    cta: {
      text: "Explorer nos programmes",
      link: "/startups",
    },
  },
]

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const goToPreviousSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1))
  }

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1))
  }

  return (
    <section className="relative isolate h-[430px] overflow-hidden bg-black sm:h-[560px] lg:h-[640px]">
      {SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-out ${
            currentSlide === index ? "scale-100 opacity-100" : "pointer-events-none scale-105 opacity-0"
          }`}
        >
          <Image
            src={slide.image || "/placeholder.svg"}
            alt={slide.title}
            fill
            className={`object-cover ${
              slide.image.includes("odc2Accueil") ? "object-[center_40%]" : "object-center"
              }`}
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,121,0,0.42),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.86)_0%,rgba(0,0,0,0.58)_42%,rgba(0,0,0,0.18)_100%)]" />
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="container relative z-20 mx-auto flex h-full items-center px-4">
        <div className="max-w-3xl">
          {SLIDES.map((slide, index) => (
            <div
              key={slide.title}
              className={`transition-all duration-700 ${
                currentSlide === index ? "translate-y-0 opacity-100" : "absolute -translate-y-6 opacity-0"
              }`}
            >
              <div className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/90 backdrop-blur-md">
                Orange Digital Center Sénégal
              </div>
              <h1 className="max-w-3xl text-3xl font-black leading-[1.05] tracking-tight text-white drop-shadow-2xl sm:text-5xl lg:text-6xl">
                {slide.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 drop-shadow-lg sm:text-xl">
                {slide.description}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="group rounded-full bg-[#FF7900] px-7 text-base font-bold text-black shadow-2xl shadow-orange-500/30 hover:bg-[#ff8f2b]">
                  <Link href={slide.cta.link} className="inline-flex items-center">
                    {slide.cta.text}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <div className="hidden h-px w-24 bg-gradient-to-r from-white/60 to-transparent sm:block" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-7 left-0 right-0 z-30">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  currentSlide === index ? "w-12 bg-[#FF7900]" : "w-2.5 bg-white/55 hover:bg-white"
                }`}
                aria-label={`Aller au slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousSlide}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
              aria-label="Slide précédent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goToNextSlide}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
              aria-label="Slide suivant"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute right-8 top-8 z-20 hidden rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-md sm:block">
        {String(currentSlide + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
      </div>
    </section>
  )
}

export default HeroSection
