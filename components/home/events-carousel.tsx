// odcdeploye\frontend\components\home\events-carousel.tsx

"use client"
 
import React, { useState, useEffect } from "react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
 
interface Event {
  title: string
  date: string
  description: string
  image: string
  link: string
}
 
interface Props {
  events: Event[]
}
 
export default function EventsCarousel({ events }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
    created() {
      setLoaded(true)
    },
    loop: true,
    mode: "free-snap",
    slides: {
      origin: "center",
      perView: 1.2,
      spacing: 16,
    },
    breakpoints: {
      "(min-width: 768px)": {
        slides: {
          perView: 2.2,
          spacing: 20
        },
      },
      "(min-width: 1024px)": {
        slides: {
          perView: 3,
          spacing: 24
        },
      },
    },
  })
 
  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      if (instanceRef.current) {
        instanceRef.current.next()
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [instanceRef])
 
  return (
    <div className="relative">
      <div ref={sliderRef} className="keen-slider mt-10">
        {events.map((event, index) => (
          <div key={index} className="keen-slider__slide">
            <Card className="h-full flex flex-col overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute bottom-0 left-0 bg-[#FF7900] px-4 py-2 text-white">
                  {event.date}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-base line-clamp-3">
                  {event.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={event.link}>
                    En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
 
      {loaded && instanceRef.current && (
        <>
          <button
            onClick={() => instanceRef.current?.prev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-[#FF7900]" />
          </button>
          <button
            onClick={() => instanceRef.current?.next()}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-[#FF7900]" />
          </button>
        </>
      )}
    </div>
  )
}
 