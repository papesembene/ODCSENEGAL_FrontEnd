"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "@/components/ui/interactive-link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Settings,
  Briefcase,
  Menu,
  X,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Megaphone
} from "lucide-react"
import { useTheme } from "next-themes"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "")

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [adminType, setAdminType] = useState(null)
  const [adminEmail, setAdminEmail] = useState(null)
  const [adminScope, setAdminScope] = useState(null)
  const [canManageInterviewQuestions, setCanManageInterviewQuestions] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Vérifier l'authentification
    const checkAuth = async () => {
      const token = localStorage.getItem("admin_token")
      const authenticated = !!token
      const type = localStorage.getItem("admin_type")
      const email = localStorage.getItem("admin_email")
      const admin = JSON.parse(localStorage.getItem("admin_user") || "{}")
      const scope = admin?.profile_data?.admin_scope || null
      let canManageQuestions = false

      if (authenticated && scope === "interview_member") {
        try {
          const response = await fetch(`${API_BASE_URL}/api/admin/interviews/capabilities`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          const payload = await response.json()
          canManageQuestions = Boolean(payload?.data?.can_manage_questions)
        } catch {
          canManageQuestions = false
        }
      } else {
        canManageQuestions = type === "competences"
      }
      
      setIsAuthenticated(authenticated)
      setAdminType(type)
      setAdminEmail(email)
      setAdminScope(scope)
      setCanManageInterviewQuestions(canManageQuestions)

      const isContentManager = type === "cm"
      const defaultAdminRoute = isContentManager
        ? "/astrodmin/portail"
        : scope === "interview_member"
          ? "/astrodmin/mes-entretiens"
          : "/astrodmin/dashboard"

      // Si l'utilisateur n'est pas authentifié et n'est pas sur la page de connexion, rediriger
      if (!authenticated && pathname !== "/astrodmin") {
        router.push("/astrodmin")
      } else if (authenticated && pathname === "/astrodmin") {
        // Si l'utilisateur est authentifié et sur la page de connexion, rediriger vers le dashboard
        router.push(defaultAdminRoute)
      } else if (authenticated && isContentManager && !pathname.startsWith("/astrodmin/portail")) {
        router.replace("/astrodmin/portail")
      } else if (authenticated && !isContentManager && pathname.startsWith("/astrodmin/portail")) {
        router.replace(defaultAdminRoute)
      } else if (
        authenticated
        && scope === "interview_member"
        && !pathname.startsWith("/astrodmin/mes-entretiens")
        && !(canManageQuestions && pathname.startsWith("/astrodmin/entretiens/questions"))
      ) {
        router.replace("/astrodmin/mes-entretiens")
      } else if (
        authenticated
        && scope === "interview_member"
        && !canManageQuestions
        && pathname.startsWith("/astrodmin/entretiens/questions")
      ) {
        router.replace("/astrodmin/mes-entretiens")
      } else if (
        authenticated
        && scope !== "interview_member"
        && pathname.startsWith("/astrodmin/entretiens/questions")
      ) {
        router.replace("/astrodmin/entretiens")
      } else if (authenticated && scope !== "interview_member" && pathname.startsWith("/astrodmin/mes-entretiens")) {
        router.replace("/astrodmin/entretiens")
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
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_type")
    localStorage.removeItem("admin_email")
    localStorage.removeItem("admin_user")

    // Rediriger vers la page de connexion
    router.push("/astrodmin")
  }

  const isInterviewMember = adminScope === "interview_member"
  const isContentManager = adminType === "cm"

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/astrodmin/dashboard",
      color: "text-blue-500",
      show: !isInterviewMember && !isContentManager,
    },
    {
      label: "Compétences",
      icon: Users,
      href: "/astrodmin/competences",
      color: "text-orange-500",
      show: !isInterviewMember && (adminType === "competences" || adminType === "super_admin" || !adminType)
    },
    {
      label: "Entretiens",
      icon: Calendar,
      href: "/astrodmin/entretiens",
      color: "text-emerald-500",
      show: !isInterviewMember && (adminType === "competences" || adminType === "super_admin" || !adminType)
    },
    {
      label: "Questions entretien",
      icon: FileText,
      href: "/astrodmin/entretiens/questions",
      color: "text-emerald-500",
      show: false,
    },
    {
      label: "Mes entretiens",
      icon: Calendar,
      href: "/astrodmin/mes-entretiens",
      color: "text-teal-500",
      show: isInterviewMember,
    },
    {
      label: "Questions entretien",
      icon: FileText,
      href: "/astrodmin/entretiens/questions",
      color: "text-emerald-500",
      show: isInterviewMember && canManageInterviewQuestions,
    },
    {
      label: "Startups",
      icon: Briefcase,
      href: "/astrodmin/startups",
      color: "text-purple-500",
      show: !isInterviewMember && (adminType === "startups" || adminType === "super_admin" || !adminType)
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
      color: "text-indigo-500",
      show: !isInterviewMember && !isContentManager && (adminType === "competences" || adminType === "super_admin" || !adminType)
    },
    {
      label: "Portail",
      icon: Megaphone,
      href: "/astrodmin/portail",
      color: "text-orange-500",
      show: !isInterviewMember && adminType === "cm",
    },
    {
      label: "Paramètres",
      icon: Settings,
      href: "/astrodmin/parametres",
      color: "text-slate-500",
      show: !isInterviewMember && !isContentManager && (adminType === "competences" || adminType === "super_admin"),
    },
    /*{
      label: "Log Connexions",
      icon: Activity,
      href: "/astrodmin/logs",
      color: "text-teal-500"
    },*/
  ]

  const isDarkTheme = isMounted && theme === "dark"
  const visibleMenuItems = menuItems.filter(item => item.show !== false)
  const activeMenuHref = visibleMenuItems
    .filter((item) => pathname === item.href || pathname.startsWith(item.href + "/"))
    .sort((currentItem, nextItem) => nextItem.href.length - currentItem.href.length)[0]?.href

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className={`hidden h-full shrink-0 overflow-hidden lg:flex lg:flex-col ${sidebarCollapsed ? "lg:w-16" : "lg:w-64"} bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-200`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className={`${sidebarCollapsed ? "opacity-0 pointer-events-none w-0" : "opacity-100"} transition-opacity duration-200`}>
            <h2 className="text-xl font-bold bg-linear-to-r/srgb from-orange-500 to-purple-600 bg-clip-text text-transparent">
              ODC Admin
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {adminType === "competences" ? "Compétences" : adminType === "super_admin" ? "Super Admin" : adminType === "startups" ? "Startups" : adminType === "cm" ? "Community Manager" : "Dashboard"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label="Basculer la taille du menu">
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {visibleMenuItems.map((item) => {
              const isActive = activeMenuHref === item.href
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
              onClick={() => setTheme(isDarkTheme ? "light" : "dark")}
              aria-label="Basculer thème"
            >
              {isDarkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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
                <h2 className="text-xl font-bold bg-linear-to-r/srgb from-orange-500 to-purple-600 bg-clip-text text-transparent">
                  ODC Admin
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {adminType === "competences" ? "Compétences" : adminType === "super_admin" ? "Super Admin" : adminType === "startups" ? "Startups" : adminType === "cm" ? "Community Manager" : "Dashboard"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-1">
                {visibleMenuItems.map((item) => {
                  const isActive = activeMenuHref === item.href
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
                  onClick={() => setTheme(isDarkTheme ? "light" : "dark")}
                >
                  {isDarkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header Mobile */}
        <header className="z-40 flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold bg-linear-to-r/srgb from-orange-500 to-purple-600 bg-clip-text text-transparent">
            ODC Admin
          </h1>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  )
}
