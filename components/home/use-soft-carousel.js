"use client"

import { useEffect, useState } from "react"

const EXIT_DURATION = 280
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

export default function useSoftCarousel(count) {
  const [position, setPosition] = useState({ current: 0, requested: 0 })
  const current = position.current % count
  const requested = position.requested % count

  useEffect(() => {
    if (current === requested) return
    const timer = setTimeout(() => {
      setPosition((previous) => previous.requested % count === requested
        ? { ...previous, current: requested }
        : previous)
    }, EXIT_DURATION)
    return () => clearTimeout(timer)
  }, [current, requested, count])

  useEffect(() => {
    const preference = window.matchMedia(REDUCED_MOTION)
    const finish = () => setPosition((previous) => ({ ...previous, current: previous.requested }))
    preference.addEventListener("change", finish)
    return () => preference.removeEventListener("change", finish)
  }, [])

  function request(resolve) {
    const immediate = window.matchMedia(REDUCED_MOTION).matches
    setPosition((previous) => {
      const target = (resolve(previous.requested) + count) % count
      return { requested: target, current: immediate ? target : previous.current }
    })
  }

  return {
    current,
    requested,
    leaving: current !== requested,
    select: (index) => request(() => index),
    move: (direction) => request((index) => index + direction),
  }
}
