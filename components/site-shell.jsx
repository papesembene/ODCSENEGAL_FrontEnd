"use client"

import { usePathname } from "next/navigation"

import Footer from "@/components/footer"
import Header from "@/components/header"

export default function SiteShell({ children }) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith("/astrodmin")

  if (isAdminRoute) {
    return (
      <main className="h-dvh min-h-0 overflow-hidden">
        {children}
      </main>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
