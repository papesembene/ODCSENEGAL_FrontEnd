// odcdeploye\frontend\components\home\testimonials-section.jsx

"use client"

import { useState } from "react"
import Image from "next/image"
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
  const [direction, setDirection] = useState(null)

  const handlePrev = () => {
    setDirection("left")
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setDirection("right")
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Témoignages</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
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
                  <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                    <Card className="overflow-hidden">
                      <CardContent className="p-8">
                        <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left">
                          <div className="mb-6 md:mb-0 md:mr-6">
                            <div className="relative h-20 w-20 overflow-hidden rounded-full">
                              {/* <Image
                                // src={testimonial.avatar || "/placeholder.svg"}
                                alt={testimonial.author}
                                fill
                                className="object-cover"
                              /> */}
                            </div>
                          </div>
                          <div className="flex-1">
                            <Quote className="h-8 w-8 text-orange-500 opacity-50" />
                            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{testimonial.content}</p>
                            <div className="mt-6">
                              <p className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</p>
                              <p className="text-gray-600 dark:text-gray-400">{testimonial.role}</p>
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
              <Button variant="outline" size="icon" onClick={handlePrev} aria-label="Témoignage précédent">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              {testimonials.map((_, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className={`h-2 w-2 rounded-full p-0 ${
                    activeIndex === index
                      ? "bg-orange-500 text-orange-500"
                      : "bg-gray-300 text-gray-300 dark:bg-gray-600 dark:text-gray-600"
                  }`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Aller au témoignage ${index + 1}`}
                />
              ))}
              <Button variant="outline" size="icon" onClick={handleNext} aria-label="Témoignage suivant">
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
