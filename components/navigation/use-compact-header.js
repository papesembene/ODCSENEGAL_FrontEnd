"use client"

import { useEffect, useRef, useState } from "react"

export default function useCompactHeader() {
  const [isCompact, setIsCompact] = useState(false)
  const compact = useRef(false)

  useEffect(() => {
    function update() {
      // Separate thresholds prevent flicker around the collapse point.
      const next = compact.current ? window.scrollY > 32 : window.scrollY >= 96
      if (next === compact.current) return
      compact.current = next
      setIsCompact(next)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  return isCompact
}
