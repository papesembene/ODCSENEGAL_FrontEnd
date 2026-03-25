// odcdeploye\frontend\components\home\hero-section.jsx
 
"use client"
 
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
 
const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = [
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
   
    // {
    //   title: "Connectez-vous à l'écosystème",
    //   description: "Un espace d'open innovation pour collaborer avec les acteurs clés de l'écosystème numérique.",
    //   image: "/ecosystemeAccueil.jpg?height=600&width=1200",
    //   cta: {
    //     text: "Rejoindre l'écosystème",
    //     link: "/startups",
    //   },
    // },
  ]
 
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])
 
  const goToSlide = (index) => {
    setCurrentSlide(index)
  }
 
  return (
    <section className="relative h-[250px] sm:h-[500px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            currentSlide === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="absolute inset-0 bg-black/40" />
          <Image
            src={slide.image || "/placeholder.svg"}
            alt={slide.title}
            fill
            className={`object-cover scale-98 ${
            slide.image.includes("odc2Accueil") ? "object-[center_40%]" : "object-center"
              }`}
            priority={index === 0}
          />
          <div className="container relative z-10 mx-auto flex h-full items-center px-4">
            <div className="max-w-2xl p-4 bg-black/30 backdrop-blur-sm rounded-lg">
              <h1
                className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight text-white"
                style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}
              >
                {slide.title}
              </h1>
              <p
                className="mt-2 text-sm sm:text-base text-white/90"
                style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)" }}
              >
                {slide.description}
              </p>
              <div className="mt-3 sm:mt-4">
                <Button asChild size="sm" className="bg-[#FF7900] hover:bg-[#e06600] text-sm">
                  <Link href={slide.cta.link}>
                    {slide.cta.text} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
 
      <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full transition-all ${
              currentSlide === index ? "bg-[#FF7900] sm:w-8" : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Aller au slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
 
export default HeroSection
 