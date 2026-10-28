"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import Link from "@/components/ui/interactive-link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { mainNavigationLinks, siteMetadata } from "@/lib/site-config"
import { cn } from "@/lib/utils"
import useCompactHeader from "@/components/navigation/use-compact-header"
import styles from "./header.module.css"

function NavigationLinks({ pathname, dropdown = false }) {
  return mainNavigationLinks.map((link) => {
    const isActive = pathname === link.href
    return (
      <Link key={link.href} href={link.href} aria-current={isActive ? "page" : undefined}
        className={cn(
          dropdown
            ? "block rounded-lg px-3 py-3 text-base font-medium transition-colors"
            : "inline-flex min-h-11 items-center whitespace-nowrap text-sm font-medium transition-colors",
          isActive
            ? "text-orange-500 underline underline-offset-4"
            : "text-white hover:text-orange-500",
          dropdown && (isActive ? "bg-orange-500/10" : "hover:bg-gray-800")
        )}>
        {link.title}
      </Link>
    )
  })
}

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const isCompact = useCompactHeader()
  const menuButtonRef = useRef(null)
  const headerRef = useRef(null)
  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, isCompact])

  useEffect(() => {
    if (!isOpen) return
    const dismiss = (event) => {
      if (!headerRef.current?.contains(event.target)) setIsOpen(false)
    }
    document.addEventListener("pointerdown", dismiss)
    return () => document.removeEventListener("pointerdown", dismiss)
  }, [isOpen])

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <div className={styles.dock} data-navigation-shell="">
      <header ref={headerRef} data-compact={isCompact} className={styles.header}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false)
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && isOpen) {
            setIsOpen(false)
            menuButtonRef.current?.focus()
          }
        }}>
        <div className={styles.container}>
          <div className={styles.bar}>
            <Link href="/" className={styles.logo} aria-label={`${siteMetadata.title} - Accueil`}>
              <Image src="/logoffodc.png" alt={siteMetadata.title} width={120} height={40}
                className="rounded object-contain" priority />
              <span className={styles.brandName} data-navigation-name="" aria-hidden="true">
                Orange Digital Center<small>Sénégal</small>
              </span>
            </Link>

            <nav aria-label="Navigation principale" className={styles.desktopNav}>
              <NavigationLinks pathname={pathname} />
            </nav>

            <Button
              ref={menuButtonRef}
              type="button"
              variant="ghost"
              size="icon"
              className={cn(styles.menuButton, "h-11 w-11 shrink-0 text-white hover:bg-gray-800 hover:text-white")}
              onClick={toggleMenu}
              aria-expanded={isOpen}
              aria-controls="portal-navigation"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>

        <nav id="portal-navigation" aria-label="Navigation du portail" hidden={!isOpen} className={styles.dropdown}>
          <div className="flex flex-col gap-2 p-4">
            <NavigationLinks pathname={pathname} dropdown />
          </div>
        </nav>
      </header>
    </div>
  )
}

export default Header
