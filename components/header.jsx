"use client"
 
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "../app/contexts/AuthContext"
import { LogIn, UserPlus, User, LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
 
const Header = () => {
  const { isAuthenticated, logout, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
 
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
 
  const toggleMenu = () => setIsOpen(!isOpen)
 
  const links = [
    { title: "Accueil", href: "/" },
    { title: "Développement des Compétences", href: "/competences" },
    { title: "Accompagnement Startups", href: "/startups" },
    { title: "Contact", href: "/contact" },
  ]
 
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "bg-black backdrop-blur-md shadow-lg" : "bg-black"
      )}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Gauche */}
          <Link href="/" className="flex items-center flex-shrink-0 z-60">
            <Image
              src="/logoffodc.png"
              alt="Logo"
              width={120}
              height={40}
              className="rounded object-contain"
              priority
            />
          </Link>
 
          {/* Desktop Menu - Complètement à droite */}
          <nav className="hidden lg:flex items-center space-x-8 xl:space-x-12 ml-auto mr-8">
            {links.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors whitespace-nowrap hover:text-orange-500",
                    isActive
                      ? "text-orange-500 underline underline-offset-4"
                      : "text-white"
                  )}
                >
                  {link.title}
                </Link>
              )
            })}
          </nav>
 
          {/* Actions - Tout à droite */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Avatar + Dropdown (optionnel) */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  {user && user.profileImage ? (
                    <div className="relative w-8 h-8 md:w-9 md:h-9 overflow-hidden rounded-full border-2 border-orange-500 hover:border-orange-400 transition-all">
                      <Image src={user.profileImage} alt="Profile" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-700 flex items-center justify-center border-2 border-orange-500 hover:border-orange-400 transition-all">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {!isAuthenticated ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
                        Connexion
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register" className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Inscription
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Mon profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-red-500"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu> */}
 
            {/* Mobile Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-gray-800"
              onClick={toggleMenu}
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>
      </div>
 
      {/* Mobile Menu */}
      <div className={cn(
        "lg:hidden bg-black border-t border-gray-800 transition-all duration-300 ease-in-out",
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      )}>
        <div className="px-6 py-6 space-y-5">
          <div className="flex flex-col space-y-4">
            {links.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={toggleMenu}
                  className={cn(
                    "block text-lg font-medium transition-all duration-200 py-2 px-3 rounded-lg",
                    isActive
                      ? "text-orange-500 bg-orange-500/10 underline underline-offset-4"
                      : "text-white hover:text-orange-500 hover:bg-gray-800"
                  )}
                >
                  {link.title}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </header>
  )
}
 
export default Header
 