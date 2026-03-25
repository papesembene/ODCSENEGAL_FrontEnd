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
    <section ref={sectionRef} className="bg-[#FF7900] py-16 text-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl"> <span className="text-black">Orange</span> Digital Center en chiffres</h2>
          <p className="mt-4 text-lg">
            Des chiffres qui témoignent de notre engagement pour le développement numérique au Sénégal.
          </p>
        </div>
 
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center rounded-lg bg-white/10 p-6 text-center backdrop-blur-sm"
            >
              <div className="mb-4 rounded-full bg-white/30 p-3">{stat.icon}</div>
              <div className="text-4xl font-bold">
                {isVisible ? (
                  <>
                    <CountUp end={stat.value} duration={2} />
                    {stat.suffix}
                  </>
                ) : (
                  "0"
                )}
              </div>
              <div className="mt-2 text-lg">{stat.label}</div>
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
 
 