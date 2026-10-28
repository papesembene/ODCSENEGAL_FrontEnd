"use client"

import { useEffect, useRef } from "react"
import { MotionConfig } from "framer-motion"

import { observePageReveals } from "./page-reveals"

function getMotionMode(pathname) {
  if (pathname.startsWith("/test/")) return "assessment"
  if (pathname.startsWith("/astrodmin") || pathname.startsWith("/startups/dashboard")) return "workspace"
  if (/\/candidatures?(\/|$)|^\/(login|register|profile)(\/|$)|^\/emplois\/new/.test(pathname)) return "form"
  return "public"
}

export default function PageMotion({ pathname, children }) {
  const root = useRef(null)
  const mode = getMotionMode(pathname)

  useEffect(() => {
    if (mode !== "public") return
    return observePageReveals(root.current)
  }, [pathname, mode])

  // Never key the children by URL: forms and timed sessions must keep their state.
  return (
    <MotionConfig reducedMotion="user">
      <div ref={root} className="contents" data-motion-scope={mode}>
        {children}
      </div>
    </MotionConfig>
  )
}
