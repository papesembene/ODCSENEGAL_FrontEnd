// odcdeploye\frontend\components\home\statistics-section.jsx

"use client"
 
import { useState, useEffect, useRef } from "react"
import { Users, Award, Briefcase, Building } from "lucide-react"
 
const StatisticsSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)
 
  const stats = [
    {
      icon: <Users className="h-10 w-10" />,
      value: 1000,
      label: "Jeunes formés",
      suffix: "+",
    },
    {
      icon: <Award className="h-10 w-10" />,
      value: 50,
      label: "Startups accompagnées",
      suffix: "+",
    },
    {
      icon: <Briefcase className="h-10 w-10" />,
      value: 200,
      label: "Emplois créés",
      suffix: "+",
    },
    {
      icon: <Building className="h-10 w-10" />,
      value: 30,
      label: "Partenaires",
      suffix: "+",
    },
  ]
 
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
 
    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }
 
    return () => {
      if (sectionRef.current) {
        observer.disconnect()
      }
    }
  }, [])
 
  return (
    <section ref={sectionRef} className="bg-orange-50 py-20 text-gray-950 dark:bg-gray-950 dark:text-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Orange Digital Center en chiffres
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Des chiffres qui témoignent de notre engagement pour le développement numérique au Sénégal.
          </p>
        </div>
 
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group flex flex-col items-center rounded-2xl border border-orange-100 bg-white p-7 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
            >
              <div className="mb-5 rounded-2xl bg-orange-100 p-4 text-orange-700 transition group-hover:bg-orange-1 group-hover:text-black dark:bg-orange-500/10 dark:text-orange-300">{stat.icon}</div>
              <div className="text-4xl font-bold tracking-tight">
                {isVisible ? (
                  <>
                    <CountUp end={stat.value} duration={2} />
                    {stat.suffix}
                  </>
                ) : (
                  "0"
                )}
              </div>
              <div className="mt-3 text-base font-medium text-gray-600 dark:text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
 
// Simple CountUp component
const CountUp = ({ end, duration }) => {
  const [count, setCount] = useState(0)
  const increment = end / (duration * 60)
 
  useEffect(() => {
    let timer
    let currentCount = 0
 
    const updateCount = () => {
      currentCount += increment
      if (currentCount >= end) {
        currentCount = end
        clearInterval(timer)
      }
      setCount(Math.floor(currentCount))
    }
 
    timer = setInterval(updateCount, 1000 / 60)
    return () => clearInterval(timer)
  }, [end, increment, duration])
 
  return <>{count}</>
}
 
export default StatisticsSection
 
 
