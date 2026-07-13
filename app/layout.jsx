import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ChatbotWrapper from "@/components/ChatbotWrapper"
import AppToaster from "@/components/app-toaster"
import SiteShell from "@/components/site-shell"
import { AuthProvider } from "./contexts/AuthContext"

export const metadata = {
  title: "Orange Digital Center Sénégal",
  description: "Développement des compétences numériques, accompagnement des startups et open innovation",
  generator: "v0.dev",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Pour compatibilité totale */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SiteShell>{children}</SiteShell>
            <ChatbotWrapper />
            <AppToaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
