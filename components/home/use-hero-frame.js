"use client"

import { useEffect, useRef } from "react"

export default function useHeroFrame() {
  const ref = useRef(null)

  useEffect(() => {
    if (!window.IntersectionObserver) return
    const element = ref.current
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    let visible = true
    let printing = false
    let frame = 0

    function update() {
      frame = 0
      if (!visible || printing || preference.matches || document.hidden) return
      const box = element.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, -box.top / Math.max(1, box.height * .65)))
      element.style.setProperty("--hero-frame-progress", progress.toFixed(4))
    }

    function schedule() {
      if (visible && !printing && !frame && !preference.matches && !document.hidden) frame = requestAnimationFrame(update)
    }

    function reset() {
      cancelAnimationFrame(frame)
      frame = 0
      element.style.removeProperty("--hero-frame-progress")
    }

    function changePreference() {
      reset()
      schedule()
    }

    function beforePrint() { printing = true; reset() }
    function afterPrint() { printing = false; schedule() }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) schedule()
      else { cancelAnimationFrame(frame); frame = 0 }
    })
    observer.observe(element)
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule, { passive: true })
    window.addEventListener("beforeprint", beforePrint)
    window.addEventListener("afterprint", afterPrint)
    document.addEventListener("visibilitychange", schedule)
    preference.addEventListener("change", changePreference)
    schedule()
    return () => {
      reset()
      observer.disconnect()
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      window.removeEventListener("beforeprint", beforePrint)
      window.removeEventListener("afterprint", afterPrint)
      document.removeEventListener("visibilitychange", schedule)
      preference.removeEventListener("change", changePreference)
    }
  }, [])

  return ref
}
