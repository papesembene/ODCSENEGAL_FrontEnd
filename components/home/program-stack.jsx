"use client"

import { useEffect, useRef } from "react"

export default function ProgramStack({ children, className }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!window.ResizeObserver) return
    const element = ref.current
    const preference = window.matchMedia("(min-width: 1024px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)")
    const cards = [...element.children]
    let frame = 0

    function measure() {
      frame = 0
      // Long copy or enlarged fonts must never trap a call to action behind a card.
      const fits = cards.every((card) => card.offsetHeight <= innerHeight - 160)
      element.dataset.stackEnabled = String(preference.matches && fits)
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    const observer = new ResizeObserver(schedule)
    cards.forEach((card) => observer.observe(card))
    window.addEventListener("resize", schedule, { passive: true })
    preference.addEventListener("change", schedule)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("resize", schedule)
      preference.removeEventListener("change", schedule)
    }
  }, [])

  return <div ref={ref} className={className} data-program-stack="">{children}</div>
}
