"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/app/contexts/AuthContext"

export default function AppProviders({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
}
