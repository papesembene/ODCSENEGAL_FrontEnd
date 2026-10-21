// odcdeploye\frontend\components\home\testimonials-section.jsx

"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

const TestimonialsSection = () => {
  const testimonials = [
   
    {
      id: 1,
      content:
        "La formation ODC a été une expérience profondément enrichissante qui m’a permis de renforcer mes compétences en cloud computing, développement et DevOps, tout en apprenant à collaborer, à rester motivée et à progresser continuellement. Au-delà des aspects techniques, ODC m’a donné confiance en moi et m’a appris à croire en mon potentiel. J’y ai découvert une véritable communauté basée sur l’entraide et la solidarité.",
      author: "Khady DIAGNE",
      role: "Alumnis Référentiel AWS",
      // avatar: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 2,
      content:
        "Grâce à la formation Référent Digital à Orange Digital Center, j’ai pu acquérir des compétences solides en transformation digitale et en gestion de projets numériques. Cette expérience m’a également permis de développer mes soft skills, d’être plus agile et de mieux m’adapter aux défis du monde professionnel.",
      author: "Assietou SY",
      role: "Alumnis Référent Digital",
      // avatar: "/placeholder.svg?height=100&width=100",
    },
  ]

  const [activeIndex, setActiveIndex] = useState(0)
  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  return (
    <section className="relative overflow-hidden bg-[#f7f3ed] py-24 dark:bg-gray-950">
      <div className="absolute left-[-8rem] top-12 h-80 w-80 rounded-full bg-orange-200/50 blur-3xl dark:bg-orange-500/10" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-black/10 blur-3xl dark:bg-white/5" />
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-orange-700 shadow-sm backdrop-blur dark:bg-white/10 dark:text-orange-300">
            Voix des apprenants
          </span>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-5xl">Témoignages</h2>
          <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Découvrez les histoires de réussite de ceux qui ont bénéficié de nos programmes.
          </p>
        </div>

        <div className="mt-12">
          <div className="relative mx-auto max-w-4xl">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500"
                style={{
                  transform: `translateX(-${activeIndex * 100}%)`,
                }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full shrink-0 px-4">
                    <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-2xl shadow-orange-100/70 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                      <CardContent className="p-8 sm:p-10">
                        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:text-left">
                          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-black text-2xl font-black text-orange-400 shadow-xl shadow-black/10 dark:bg-white dark:text-orange-600">
                            {testimonial.author.split(" ").map((name) => name[0]).join("").slice(0, 2)}
                          </div>
                          <div className="flex-1">
                            <Quote className="h-10 w-10 text-orange-500" />
                            <p className="mt-5 text-lg leading-8 text-gray-700 dark:text-gray-300">{testimonial.content}</p>
                            <div className="mt-6">
                              <p className="text-lg font-black text-gray-950 dark:text-white">{testimonial.author}</p>
                              <p className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-orange-600 dark:text-orange-300">{testimonial.role}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-center space-x-2">
              <Button variant="outline" size="icon" className="rounded-full bg-white/80" onClick={handlePrev} aria-label="Témoignage précédent">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              {testimonials.map((_, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className={`h-2.5 rounded-full p-0 transition-all ${
                    activeIndex === index
                      ? "w-8 bg-orange-500 text-orange-500"
                      : "bg-gray-300 text-gray-300 dark:bg-gray-600 dark:text-gray-600"
                  }`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Aller au témoignage ${index + 1}`}
                />
              ))}
              <Button variant="outline" size="icon" className="rounded-full bg-white/80" onClick={handleNext} aria-label="Témoignage suivant">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
