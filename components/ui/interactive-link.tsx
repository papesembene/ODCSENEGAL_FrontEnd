"use client"

import { forwardRef, type ComponentPropsWithoutRef } from "react"
import Link, { useLinkStatus } from "next/link"
import { cn } from "@/lib/utils"
import styles from "./interactive-link.module.css"

function NavigationFeedback() {
  const { pending } = useLinkStatus()
  if (!pending) return null

  return (
    <span className={styles.pending} role="status" data-navigation-pending>
      <span className="sr-only">Ouverture de la page…</span>
    </span>
  )
}

const InteractiveLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<typeof Link>>(
  function InteractiveLink({ children, className, ...props }, ref) {
    return (
      <Link {...props} ref={ref} className={cn(styles.link, className)}>
        {children}
        <NavigationFeedback />
      </Link>
    )
  }
)

export default InteractiveLink
