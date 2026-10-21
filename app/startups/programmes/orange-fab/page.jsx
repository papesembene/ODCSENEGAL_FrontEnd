"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Building2, Users2, Target, Globe, Network, Laptop, Clock, Briefcase, Rocket, Map, Award } from "lucide-react"
import { useEffect, useState, useRef } from "react"

const Counter = ({ value, label, icon }) => {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const counterRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (counterRef.current) {
      observer.observe(counterRef.current)
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current)
      }
    }
  }, [])

  useEffect(() => {
    let targetValue = parseInt(value)
    if (isVisible) {
      let startTime
      const duration = 2000 // 2 seconds

      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)
        
        const currentCount = Math.floor(progress * targetValue)
        setCount(currentCount)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [isVisible, value])

  return (
    <div ref={counterRef} className="flex flex-col items-center text-center space-y-2">
      <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
        {icon}
      </div>
      <span className="text-3xl font-bold text-orange-1">
        {value.includes('%') ? `${count}%` : count}
      </span>
      <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
    </div>
  )
}

export default function OrangeFabPage() {
  const benefits = [
    {
      title: "Environnement",
      description: "Des locaux dédiés et un support logistique pour votre développement.",
      icon: <Building2 className="h-10 w-10 text-orange-1" />,
    },
    {
      title: "Coaching",
      description: "Des séances de coaching avec des experts du groupe sur des sujets spécifiques.",
      icon: <Users2 className="h-10 w-10 text-orange-1" />,
    },
    {
      title: "Mentorat",
      description: "Un pool de mentors pour développer votre réseau et recevoir conseils et orientations.",
      icon: <Target className="h-10 w-10 text-orange-1" />,
    },
    {
      title: "Développement business",
      description: "Mise en relation avec des clients et partenaires dans les marchés.",
      icon: <Briefcase className="h-10 w-10 text-orange-1" />,
    },
    {
      title: "Internationalisation",
      description: "Participation à des événements mondiaux comme VivaTech.",
      icon: <Globe className="h-10 w-10 text-orange-1" />,
    },
    {
      title: "Accès aux assets digitaux",
      description: "Accès aux APIs d'Orange (USSD, Billing, SMS, OM), cloud, datacenter, data...",
      icon: <Network className="h-10 w-10 text-orange-1" />,
    },
  ]

  const stats = [
    {
      value: "58",
      label: "Projets accompagnés",
      icon: <Rocket className="h-6 w-6 text-orange-1" />,
    },
    {
      value: "60%",
      label: "Contrats avec des structures",
      icon: <Briefcase className="h-6 w-6 text-orange-1" />,
    },
    {
      value: "65%",
      label: "Levée de fond",
      icon: <Award className="h-6 w-6 text-orange-1" />,
    },
    {
      value: "21",
      label: "Pays dans le monde",
      icon: <Map className="h-6 w-6 text-orange-1" />,
    },
  ]

  const sectors = [
    "Transport", "Energie", "IOT", "E-commerce", "Agritech", 
    "Health tech", "Logistique", "Ed tech", "Deep tech"
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <Image src="/images/orangefab.webp" alt="Orange Fab" fill className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-r/srgb from-black/70 to-black/50" />
        <div className="container relative z-10 mx-auto flex h-full items-center px-4">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Orange Fab</h1>
            <p className="mt-6 text-lg sm:text-xl">
              L'un des premiers réseaux d'accélérateurs corporate au monde. Notre objectif est de permettre la cross acceleration 
              et l'internationalisation des start-up que nous accompagnons, présents dans 21 pays sur 3 continents.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="bg-orange-1 hover:bg-orange-600">
                <Link href="/candidatures/fermees">
                  Rejoignez-nous <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Program Details Section */}
    <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Détails du programme</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Six mois pour accélérer votre business avec Orange Fab
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Orange Fab c'est quoi ?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Né en 2013 dans la Silicon Valley, Orange Fab est le réseau international d'accélérateurs de startup d'Orange.
                  Notre mission est d'accélérer le business des startups dans les domaines tech et digitals pour en faire des licornes.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Secteurs d'activité</h3>
                <div className="flex flex-wrap gap-2">
                  {sectors.map((sector, index) => (
                    <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-1" />
                  <span>6 mois d'accompagnement</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-orange-1" />
                  <span>21 pays, 3 continents</span>
                </div>
              </div>
            </div>

            <div className="relative h-[300px] rounded-lg overflow-hidden">
              <Image
                src="/images/olabcarte.jpg"
                alt="Orange Fab Program"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>


      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Counter
                key={index}
                value={stat.value}
                label={stat.label}
                icon={stat.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Les avantages de Orange Fab</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Internationalisez votre start-up grâce à notre réseau d'accélérateurs. Accédez à l'écosystème B2B et B2C d'Orange à travers le monde.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <Card key={index} className="transform transition-all hover:scale-105">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl w-fit group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors duration-300">
                      {benefit.icon}
                    </div>
                    <CardTitle>{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-1 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Prêt à accélérer la croissance de votre start-up avec Orange Fab ?
            </h2>
            <p className="mt-4 text-lg">
              Bénéficiez de notre réseau international et accédez à de nouvelles opportunités business.
            </p>
            <div className="mt-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild size="lg" variant="secondary" className="bg-[#0F172A] text-[#F1F5F9] hover:bg-[#0F172A] hover:text-[#F1F5F9] transition-colors duration-300">
                  <Link href="/candidatures/fermees">
                    Postuler maintenant <ArrowRight className="ml-2 h-5 w-5 animate-pulse" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
