"use client"

import { useEffect, useRef } from "react"

export default function MotionPhoto({ children, className }) {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)")
    let frame = 0
    let position

    function reset() {
      cancelAnimationFrame(frame)
      frame = 0
      element.removeAttribute("data-photo-active")
      element.style.removeProperty("--photo-rotate-x")
      element.style.removeProperty("--photo-rotate-y")
    }

    function move(event) {
      if (preference.matches || !pointer.matches || event.pointerType === "touch") return
      position = { x: event.clientX, y: event.clientY }
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const box = element.getBoundingClientRect()
        if (!box.width || !box.height) return
        const x = Math.max(-1, Math.min(1, (position.x - box.left) / box.width * 2 - 1))
        const y = Math.max(-1, Math.min(1, (position.y - box.top) / box.height * 2 - 1))
        element.dataset.photoActive = "true"
        element.style.setProperty("--photo-rotate-x", `${(-y * 1.6).toFixed(2)}deg`)
        element.style.setProperty("--photo-rotate-y", `${(x * 1.6).toFixed(2)}deg`)
      })
    }

    element.addEventListener("pointermove", move, { passive: true })
    element.addEventListener("pointerleave", reset)
    element.addEventListener("pointercancel", reset)
    preference.addEventListener("change", reset)
    pointer.addEventListener("change", reset)
    return () => {
      reset()
      element.removeEventListener("pointermove", move)
      element.removeEventListener("pointerleave", reset)
      element.removeEventListener("pointercancel", reset)
      preference.removeEventListener("change", reset)
      pointer.removeEventListener("change", reset)
    }
  }, [])

  return <div ref={ref} className={className} data-home-photo="">{children}</div>
}
