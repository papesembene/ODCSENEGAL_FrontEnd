"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar, 
  Activity, 
  FileText, 
  Settings,
  Menu,
  X,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useTheme } from "next-themes"

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [adminType, setAdminType] = useState(null)
  const [adminEmail, setAdminEmail] = useState(null)

  useEffect(() => {
    // Vérifier l'authentification
    const checkAuth = () => {
      const authenticated = localStorage.getItem("admin_authenticated") === "true"
      const type = localStorage.getItem("admin_type")
      const email = localStorage.getItem("admin_email")
      
      setIsAuthenticated(authenticated)
      setAdminType(type)
      setAdminEmail(email)

      // Si l'utilisateur n'est pas authentifié et n'est pas sur la page de connexion, rediriger
      if (!authenticated && pathname !== "/astrodmin") {
        router.push("/astrodmin")
      } else if (authenticated && pathname === "/astrodmin") {
        // Si l'utilisateur est authentifié et sur la page de connexion, rediriger vers le dashboard
        router.push("/astrodmin/dashboard")
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  // Ne pas afficher la barre de navigation sur la page de connexion
  if (pathname === "/astrodmin" || isLoading) {
    return <>{children}</>
  }

  // Si l'utilisateur n'est pas authentifié, ne rien afficher pendant la redirection
  if (!isAuthenticated) {
    return null
  }

  const handleLogout = () => {
    // Supprimer les informations d'authentification du localStorage
    localStorage.removeItem("admin_authenticated")
    localStorage.removeItem("admin_type")
    localStorage.removeItem("admin_email")

    // Rediriger vers la page de connexion
    router.push("/astrodmin")
  }

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/astrodmin/dashboard",
      color: "text-blue-500"
    },
    {
      label: "Compétences",
      icon: Users,
      href: "/astrodmin/competences",
      color: "text-orange-500",
      show: adminType === "competences" || adminType === "super_admin" || !adminType
    },
    /*{
      label: "Startups",
      icon: Briefcase,
      href: "/astrodmin/startups",
      color: "text-purple-500",
      show: adminType === "startups" || !adminType
    },
    /*{
      label: "Événements",
      icon: Calendar,
      href: "/astrodmin/events",
      color: "text-green-500"
    },*/
    {
      label: "Tests en ligne",
      icon: FileText,
      href: "/astrodmin/competences/tests",
      color: "text-indigo-500"
    },
    /*{
      label: "Log Connexions",
      icon: Activity,
      href: "/astrodmin/logs",
      color: "text-teal-500"
    },*/
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Desktop */}
      <aside className={`hidden lg:flex lg:flex-col ${sidebarCollapsed ? "lg:w-16" : "lg:w-64"} bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-200`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className={`${sidebarCollapsed ? "opacity-0 pointer-events-none w-0" : "opacity-100"} transition-opacity duration-200`}>
            <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
              ODC Admin
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {adminType === "competences" ? "Compétences" : adminType === "super_admin" ? "Super Admin" : adminType === "startups" ? "Startups" : "Dashboard"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label="Basculer la taille du menu">
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {menuItems.filter(item => item.show !== false).map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? item.color : ""}`} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar>
              <AvatarFallback className="bg-orange-500 text-white">
                {adminEmail?.charAt(0).toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{adminEmail?.split("@")[0] || "Admin"}</p>
                <p className="text-xs text-muted-foreground truncate">{adminEmail}</p>
              </div>
            )}
          </div>
          <div className={`flex ${sidebarCollapsed ? "justify-center" : "space-x-2"}`}>
            <Button
              variant="outline"
              size="sm"
              className={`${sidebarCollapsed ? "" : "flex-1"}`}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Basculer thème"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {!sidebarCollapsed && (
              <Button variant="outline" size="sm" className="flex-1" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                  ODC Admin
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {adminType === "competences" ? "Compétences" : adminType === "super_admin" ? "Super Admin" : adminType === "startups" ? "Startups" : "Dashboard"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-1">
                {menuItems.filter(item => item.show !== false).map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? item.color : ""}`} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </ScrollArea>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar>
                  <AvatarFallback className="bg-orange-500 text-white">
                    {adminEmail?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{adminEmail?.split("@")[0] || "Admin"}</p>
                  <p className="text-xs text-muted-foreground truncate">{adminEmail}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Mobile */}
        <header className="lg:hidden bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
            ODC Admin
          </h1>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  )
}
